/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-4-26
 * Time: 下午4:31.
 */

(function () {

    var proto = BattleReportReader.prototype;
    var m_attackLegion = {};
    var m_defenceLegion = {};
    var m_battleStep = [];
    var m_step = -1;
    var m_needAssets = {};
    var m_result = {};

    function BattleReportReader() {
        m_needAssets.soldier = [];
        m_needAssets.monster = [];
        m_needAssets.hero = [];
    }

    proto._getMcName = function (sid) {
        var config = global.configs['config/battle/troop_config'];
        var mcName = "";
        for (var i = 0; i < config.data.troop.length; i++) {
            var obj = config.data.troop[i];
            if (obj['@attributes'].classid == sid) {
                mcName = obj['@attributes'].run.slice(0, String(obj['@attributes'].run).lastIndexOf("_"));
                break;
            }
        }
        return mcName;
    };

    proto._getSkillName = function (aid) {
        var skillConfig = global.configManager.get("config/battle/skill_config").data.skill;
        var skillName = "";
        for (var i = 0; i < skillConfig.length; i++) {
            if (skillConfig[i]["@attributes"].id == aid && skillConfig[i]["@attributes"].effectani != "battle_skill_1") {
                skillName = skillConfig[i]["@attributes"].effectani;
                break;
            }
        }
        return skillName;
    };

    proto._getStatusName = function (aid) {
        var skillConfig = global.configManager.get("config/battle/skill_config").data.status;
        var skillName = "";
        for (var i = 0; i < skillConfig.length; i++) {
            if (skillConfig[i]["@attributes"].id == aid) {
                skillName = skillConfig[i]["@attributes"].name;
            }
        }
        return skillName;
    };

    proto.setLegionData = function (data) {
        m_attackLegion = data;
        for (var pos in m_attackLegion["legion"]) {
            var sid = m_attackLegion["legion"][pos].sid;
            var isSoldier = sid % 1000 > 10 ? false : true;
            var mcName = proto._getMcName(sid);
            if (isSoldier && m_needAssets.soldier.indexOf(mcName) < 0) {
                m_needAssets["soldier"].push(mcName);
            }
            else if (!isSoldier && m_needAssets.monster.indexOf(mcName) < 0) {
                m_needAssets.monster.push(mcName);
            }
            if (isSoldier && m_needAssets.hero.indexOf("hero" + m_attackLegion["legion"][pos].photo) < 0) {
                m_needAssets.hero.push("hero" + m_attackLegion["legion"][pos].photo);
            }
        }

    };

    proto.setEnemyData = function (data) {
        m_defenceLegion = data;
        for (var pos in m_defenceLegion["legion"]) {
            var sid = m_defenceLegion["legion"][pos].sid;
            var isSoldier = sid % 1000 > 10 ? false : true;
            var mcName = proto._getMcName(sid);
            if (isSoldier && m_needAssets.soldier.indexOf(mcName) < 0) {
                m_needAssets["soldier"].push(mcName);
            }
            else if (!isSoldier && m_needAssets.monster.indexOf(mcName) < 0) {
                m_needAssets.monster.push(mcName);
            }
            if (isSoldier && m_needAssets.hero.indexOf("hero" + m_defenceLegion["legion"][pos].photo) < 0) {
                m_needAssets.hero.push("hero" + m_defenceLegion["legion"][pos].photo);
            }
        }

    };

    proto.readReport = function (report) {
        report = eval('(' + report + ')');
        var troops = report.battle.al.troop;
        var troopData = {};
        var attackLegion = {};
        var defenceLegion = {};
        m_needAssets.soldier = [];
        m_needAssets.monster = [];
        m_needAssets["battle_skill"] = [];
        m_needAssets.hero = [];
        var isMonster = +(report.battle.al['@attributes'].u) > 0 ? false : true;
        if (troops.length == null) {
            troops = [troops];
        }
        for (var i = 0; i < troops.length; i++) {
            troopData = {};
            troopData["sid"] = troops[i]['@attributes'].clid;
            var isSoldier = troopData["sid"] % 1000 > 10 ? false : true;
            var mcName = proto._getMcName(troopData.sid);
            if (isSoldier && m_needAssets.soldier.indexOf(mcName) < 0) {
                m_needAssets["soldier"].push(mcName);
            }
            else if (!isSoldier && m_needAssets.monster.indexOf(mcName) < 0) {
                m_needAssets.monster.push(mcName);
            }
            troopData["totalHp"] = troops[i]['@attributes'].ms;
            troopData["currentHp"] = troops[i]['@attributes'].cs;
            troopData["level"] = troops[i]['@attributes'].lv;
            troopData["im"] = troops[i]['@attributes'].im;
            troopData["attackType"] = troops[i]['@attributes'].atp;
            troopData["name"] = troops[i]['@attributes'].n;
            troopData["photo"] = troops[i]['@attributes'].ph;
            if (!isMonster && m_needAssets.hero.indexOf("hero" + troopData["photo"]) < 0) {
                m_needAssets.hero.push("hero" + troopData["photo"]);
            }

            attackLegion[troops[i]['@attributes'].pos] = troopData;
        }
        m_attackLegion["legion"] = attackLegion;
        m_attackLegion["lv"] = report.battle.al['@attributes'].lv;
        m_attackLegion["name"] = report.battle.al['@attributes'].un;
        m_attackLegion["photo"] = report.battle.al['@attributes'].ph;
        m_attackLegion["uid"] = report.battle.al['@attributes'].u;

        troops = report.battle.dl.troop;
        if (!troops) {
            m_defenceLegion["legion"] = undefined;
        } else {
            if (troops.length == null) {
                troops = [troops];
            }
            isMonster = +(report.battle.dl['@attributes'].u) > 0 ? false : true;
            for (var i = 0; i < troops.length; i++) {
                troopData = {};
                troopData["sid"] = troops[i]['@attributes'].clid;
                var isSoldier = troopData["sid"] % 1000 > 10 ? false : true;
                var mcName = proto._getMcName(troopData.sid);
                if (isSoldier && m_needAssets.soldier.indexOf(mcName) < 0) {
                    m_needAssets["soldier"].push(mcName);
                }
                else if (!isSoldier && m_needAssets.monster.indexOf(mcName) < 0) {
                    m_needAssets.monster.push(mcName);
                }
                troopData["totalHp"] = troops[i]['@attributes'].ms;
                troopData["currentHp"] = troops[i]['@attributes'].cs;
                troopData["level"] = troops[i]['@attributes'].lv;
                troopData["im"] = troops[i]['@attributes'].im;
                troopData["attackType"] = troops[i]['@attributes'].atp;
                troopData["name"] = troops[i]['@attributes'].n;
                troopData["photo"] = troops[i]['@attributes'].ph;
                if (!isMonster && m_needAssets.hero.indexOf("hero" + troopData["photo"]) < 0) {
                    m_needAssets.hero.push("hero" + troopData["photo"]);
                }

                defenceLegion[troops[i]['@attributes'].pos] = troopData;
            }

            m_defenceLegion["legion"] = defenceLegion;
            m_defenceLegion["lv"] = report.battle.dl['@attributes'].lv;
            m_defenceLegion["name"] = report.battle.dl['@attributes'].un;
            m_defenceLegion["photo"] = report.battle.dl['@attributes'].ph;
            m_defenceLegion["uid"] = report.battle.dl['@attributes'].u;
        }
        var steps = report.battle.step;
        if(!steps)
        {
            steps = [];
        }
        if (steps.length == null) {
            steps = [steps];
        }
        m_battleStep = [];
        for (var j = 0; j < steps.length; j++) {
            var stepInfo = [];
            var acts = steps[j].act;
            if (!acts) {
                continue;
            }
            if (acts.hasOwnProperty("@attributes")) {
                var actInfo = {};
                actInfo.actType = acts["@attributes"].t;
                actInfo.actorPos = acts["@attributes"].ap;
                actInfo.actorSide = acts["@attributes"].ad;


                if (acts["@attributes"].hasOwnProperty("tp")) {
                    actInfo.targetPos = acts["@attributes"].tp.split("|");
                    actInfo.targetSide = acts["@attributes"].ts.split("|");
                }
                if (actInfo.actType == 3) {
                    actInfo.isSkill = acts["@attributes"].ik;
                    actInfo.effect = acts["@attributes"].ect;
                    actInfo.sid = acts["@attributes"].sid;
                    if (actInfo.isSkill == "1") {
                        var skillName = proto._getSkillName(actInfo.sid);
                        if (skillName != "" && m_needAssets["battle_skill"].indexOf(skillName) < 0) {
                            m_needAssets["battle_skill"].push(skillName);
                        }
                    }

                }
                else if (actInfo.actType == 5) {
                    actInfo.deadsoldier = acts["@attributes"].ds;
                    actInfo.iscritical = !!(acts["@attributes"].il == "1");
                    actInfo.iscounter = acts["@attributes"].ic;
                }
                else if (actInfo.actType == 6) {
                    actInfo.value = acts["@attributes"].vl;
                }
                else if (actInfo.actType == 7) {
                    actInfo.healnum = acts["@attributes"].hn;
                }
                else if (actInfo.actType == 8) {
                    actInfo.status = acts["@attributes"].st.split("|");
                    actInfo.aid = acts["@attributes"].aid;
                    var skillName = proto._getStatusName(actInfo.aid);
                    if (skillName != "" && m_needAssets["battle_skill"].indexOf(skillName) < 0) {
                        m_needAssets["battle_skill"].push(skillName);
                    }
                }
                else if (actInfo.actType == 10) {
                    actInfo.status = acts["@attributes"].st.split("|");
                }
                else if (actInfo.actType == 11) {
                    actInfo.beginPos = acts["@attributes"].bp;
                    actInfo.endPos = acts["@attributes"].ep;
                }
                else if (actInfo.actType == 0) {
                    actInfo.status = acts["@attributes"].st.split("|");
                }
                if (actInfo.actType == 3) {     //攻击之前加上移动动作
                    var isEnemy = actInfo.targetSide[0] != actInfo.actorSide ? true : false;
                    stepInfo.unshift({actType:1, actorPos:actInfo.actorPos, actorSide:actInfo.actorSide, pos:acts["@attributes"].tp.split("|"), isEnemy:isEnemy});
                }
                else {
                    stepInfo.unshift({actType:1, isEnemy:false});
                }
                stepInfo.push(actInfo);
            }
            for (var k = 0; k < acts.length; k++) {
                var actInfo = {};
                actInfo.actType = acts[k]["@attributes"].t;
                actInfo.actorPos = acts[k]["@attributes"].ap;
                actInfo.actorSide = acts[k]["@attributes"].ad;


                if (acts[k]["@attributes"].hasOwnProperty("tp")) {
                    actInfo.targetPos = acts[k]["@attributes"].tp.split("|");
                    actInfo.targetSide = acts[k]["@attributes"].ts.split("|");
                }
                if (actInfo.actType == 3) {
                    actInfo.isSkill = acts[k]["@attributes"].ik;
                    actInfo.effect = acts[k]["@attributes"].ect;
                    actInfo.sid = acts[k]["@attributes"].sid;
                    if (actInfo.isSkill == "1") {
                        var skillName = proto._getSkillName(actInfo.sid);
                        if (skillName != "" && m_needAssets["battle_skill"].indexOf(skillName) < 0) {
                            m_needAssets["battle_skill"].push(skillName);
                        }
                    }
                    if (k == 0) {
                        var isEnemy = actInfo.targetSide[0] != actInfo.actorSide ? true : false;
                        stepInfo.unshift({actType:1, actorPos:actInfo.actorPos, actorSide:actInfo.actorSide, pos:acts[k]["@attributes"].tp.split("|"), isEnemy:isEnemy});
                    }
                }
                else if (actInfo.actType == 5) {
                    actInfo.deadsoldier = acts[k]["@attributes"].ds;
                    actInfo.iscritical = !!(acts[k]["@attributes"].il == "1");
                    actInfo.iscounter = acts[k]["@attributes"].ic;
                }
                else if (actInfo.actType == 6) {
                    actInfo.value = acts[k]["@attributes"].vl;
                }
                else if (actInfo.actType == 7) {
                    actInfo.healnum = acts[k]["@attributes"].hn;
                }
                else if (actInfo.actType == 8) {
                    actInfo.status = acts[k]["@attributes"].st.split("|");
                    actInfo.aid = acts[k]["@attributes"].aid;
                    var skillName = proto._getStatusName(actInfo.aid);
                    if (skillName != "" && m_needAssets["battle_skill"].indexOf(skillName) < 0) {
                        m_needAssets["battle_skill"].push(skillName);
                    }
                }
                else if (actInfo.actType == 10) {
                    actInfo.status = acts[k]["@attributes"].st.split("|");
                }
                else if (actInfo.actType == 11) {
                    actInfo.beginPos = acts[k]["@attributes"].bp;
                    actInfo.endPos = acts[k]["@attributes"].ep;
                }
                else if (actInfo.actType == 0) {
                    actInfo.status = acts[k]["@attributes"].st.split("|");
                }
                stepInfo.push(actInfo);
            }
            m_battleStep.push(stepInfo);
        }
//        var tempSoldier = [];
//        for(var i = 0;i<m_needAssets.soldier.length;i++)
//        {
//            tempSoldier.push(m_needAssets.soldier[i] + "_atk");
//            tempSoldier.push(m_needAssets.soldier[i] + "_hurt");
//            tempSoldier.push(m_needAssets.soldier[i] + "_run");
//        }
//        m_needAssets.soldier = tempSoldier;
//        var tempMonster = [];
//        for(var i = 0;i<m_needAssets.monster.length;i++)
//        {
//            tempMonster.push(m_needAssets.monster[i] + "_atk");
//            tempMonster.push(m_needAssets.monster[i] + "_hurt");
//            tempMonster.push(m_needAssets.monster[i] + "_run");
//        }
//        m_needAssets.monster = tempMonster;
        var endData = report.battle.end["@attributes"];
                m_result.result = endData.ret;
                if (global.uid == m_defenceLegion["uid"]) {
                    m_result.userSide = 0;
                }
                else {
                    m_result.userSide = 1;
                }
                m_result.atklose = endData.al;
                m_result.deflose = endData.dl;
                m_result.atkwounded = endData.aw;
                m_result.defwounded = endData.dw;
    };

    proto.getResult = function () {
        return m_result;
    };

    proto.setResult = function (data) {
        m_result.battleNumber = data.battlenumber;
        m_result.gold = data.gold;
        m_result.exp = data.exp;
        m_result.itemtype = data.itemtype;
        m_result.itemid = data.itemid;
        m_result.itemcount = data.itemcount;
    };

    proto.getAttackLegionData = function () {
        return m_attackLegion
    };

    proto.getDefenceLegionData = function () {
        return m_defenceLegion;
    };

    proto.getNextStep = function () {
        if (m_step < m_battleStep.length) {
            m_step++
            return m_battleStep[m_step];
        }
        return null;
    };

    proto.resetStep = function (end) {
        if (end) {
            m_step = m_battleStep.length;
        }
        else {
            m_step = -1;
        }

    };

    proto.getNeedAsset = function () {
        return m_needAssets;
    };

    proto.clearAsset = function () {
        m_needAssets = {};
        m_needAssets.soldier = [];
        m_needAssets.monster = [];
        m_needAssets.hero = [];
        m_needAssets["battle_skill"] = [];
    };

    global.BattleReportReader = BattleReportReader;
}());