/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-6
 * Time: 上午9:35
 *
 */

/// 配置文件信息读取辅助类
/// 用于方便读取配置文件里面的一些信息，比如获取建筑下一级需要条件
(function () {

    var _helper = {
        /// 获取酒馆中英雄的自动刷新周期
        getHeroRefreshTime:_getHeroRefreshTime,
        /// 获取酒馆中手动刷新英雄，即举办聚会时的花费，参数为酒馆等级
        getPartyExpendByTravernLevel:_getPartyExpendByTravernLevel,
        /// 获取英雄带兵的信息，参数为hero中的classid属性
        getTroopByClassId:_getTroopByClassId,
        /// 获取英雄说话的信息
        getTroopDialog:_getTroopDialog,
        /// 获取超级英雄信息，参数是英雄类型
        getSuperHeroData:_getSuperHeroData,
        /// 获取主城该等级的税收
        getCastleIncomeByLevel:_getCastleIncomeByLevel,
        /// 获取主城该等级被占领的情况下的税收
        getCastleOccupyByLevel:_getCastleOccupyByLevel,
        /// 获取该等级主城收取臣民的税收
        getCastleTaxpeopleByLevel:_getCastleTaxpeopleByLevel,
        /// 获取主城正常情况下每天收税的最大次数
        getCastleTaxLimitCount:_getCastleTaxLimitCount,
        /// 获取建筑升到该等级需要的条件，参数一为建筑类型，参数二为要升到的等级
        getBuildLevelUpCondition:_getBuildLevelUpCondition,
        /// 获取主城加收需要的钱袋数量,参数为加收次数
        getItemSpendByExtraTime:_getItemSpeedByExtraTime,
        /// 获取国库的金币限制
        getGoldLimit:_getGoldLimit,
        /// 获取最大英雄数量
        getMaxHeroCount:_getMaxHeroCount,
        /// 根据id获取技能状态,参数为?
        getStatusAniName:_getStatusAniName,
        /// 根据id获取技能数据，参数为技能id
        getBattleSkill:_getBattleSkill,
        /// 判断该节能是否主动技能，参数为技能数据结构
        isValidActiveSkill:_isValidActiveSkill,
        /// 获取技能某一等级的数据，参数一为技能数据结构，参数二为技能等级
        getSkillLevelInfo:_getSkillLevelInfo,
        /// 获取带兵信息
        getTroopArray:_getTroopArray,
        /// 获取兵种转换信息
        getChangeData:_getChangeData,
        /// 获取训练位信息，参数为训练位数目
        getTrainingSlotData:_getTrainingSlotData,
        /// 初始化技能数据，必须在使用技能相关方法之前调用这个方法
        initSkillConfig:_initSkillConfig,
        /// 摧毁技能数据
        destorySkillConfig:_destroySkillConfig,
        /// 获得军团英雄最大配置数量,参数为主城等级
        getLegionHeroLimit:_getLegionHeroLimit
    };

    function _getMaxHeroCount() {
        var castleConfig = global.configs['config/city/castle_config'];
        return castleConfig.data.config.maxherocount;
    }

    var _global = {
        name:'config/global/globaldata'
    };

    var _troop = {
        name:'config/battle/troop_config',
        bInited:false,
        _init:_initTroop
    };

    function _initTroop() {
        var troop = global.configs[_troop.name];
        _troop.data = troop;
        _troop.map = {};
        _troop.maledialogs = [];
        _troop.femaledialogs = [];
        _troop.changes = {};

        //init changes
        var changes = troop.data.change;
        for (var i = 0; i < changes.length; ++i) {
            var change = changes[i]["@attributes"];
            if (!_troop.changes[change.fromclassid]) {
                _troop.changes[change.fromclassid] = [];
            }
            _troop.changes[change.fromclassid].push(changes[i]);
        }

        //int troops
        var innerTroop = troop.data.troop;
        for (var i = 0; i < innerTroop.length; ++i) {
            _troop.map[innerTroop[i]["@attributes"].classid] = innerTroop[i];
            var dialog = innerTroop[i].dialog;
            if (!dialog) continue;
            for (var j = 0; j < dialog.length; ++j) {
                var ismale = dialog[j]["@attributes"].ismale == 1;
                var character = dialog[j]["@attributes"].character;
                var content = dialog[j]["@attributes"].content;
                var dialogTmp = ismale ? _troop.maledialogs : _troop.femaledialogs;
                if (dialogTmp[character] == null) {
                    dialogTmp[character] = [];
                }
                dialogTmp[character].push(content);
            }
        }
    }

    function _getGlobal() {
        return global.configs[_global.name];
    }

    function _getTroop() {
        if (!_troop.bInited) {
            _troop.bInited = true;
            _troop._init();
        }
        return _troop;
    }

    function _getTroopByClassId(id) {
        return _getTroop().map[id];
    }

    function _compareTroopByLevel(troop1, troop2) {
        return troop1['@attributes'].limitlv - troop2['@attributes'].limitlv;
    }

    function _getTroopArray(category, isHero) {
        var array = [];
        var troopConfig = _getTroop();
        var troopArrayInConfig = troopConfig.data.data.troop;
        for (var i = 0; i < troopArrayInConfig.length; ++i) {
            var troop = troopArrayInConfig[i]['@attributes'];
            if (isHero) {
                if (troop.category == category && (troop.classid % 1000) <= 10) {
                    array.push(troopArrayInConfig[i]);
                }
            } else {
                if (troop.category == category) {
                    array.push(troopArrayInConfig[i]);
                }
            }
        }
        array.sort(_compareTroopByLevel);
        return array;
    }

    function _getChangeData(classid) {
        var config = _getTroop();
        return config.changes[classid];
    }


    function _getHeroRefreshTime() {
        return _getGlobal().root.globaldata.pub['@attributes'].refreshhour;
    }

    function _getTroopDialog(ismale, character, bRandom, heroid) {
        var troop = _getTroop();
        var dialog = ismale ? troop.maledialogs : troop.femaledialogs;
        if (!dialog[character]) return;

        var sel;
        if (bRandom) {
            sel = (Math.random() * dialog[character].length) | 0;
        }
        else {
            sel = heroid % dialog[character].length;
        }
        return dialog[character][sel];
    }

    function _getSuperHeroData(herotype) {
        var superHeroData = global.configs['config/battle/superhero'].root.hero;
        if (herotype < 1 && herotype > superHeroData.length) return;

        return superHeroData[herotype - 1];
    }

    function _getPartyExpendByTravernLevel(level) {
        var expendList = global.configs['config/city/party'].settings.levels.level;
        if (level >= 1 && level <= expendList.length) {
            return expendList[level - 1]['@attributes'].gold;
        }
        return -1;
    }

    function _getCastleIncomeByLevel(level) {
        var castle = global.configs['config/city/castle_config'].data.castle;
        if (level < 1 || level > castle.length) return 0;

        return castle[level - 1]["@attributes"].goldincome;
    }

    function _getCastleOccupyByLevel(level) {
        var castle = global.configs['config/city/castle_config'].data.castle;
        if (level < 1 || level > castle.length) return 0;

        return castle[level - 1]["@attributes"].occupygold;
    }

    function _getCastleTaxpeopleByLevel(level) {
        var castle = global.configs['config/city/castle_config'].data.castle;
        if (level < 1 || level > castle.length) return 0;

        return castle[level - 1]["@attributes"].taxpeople;
    }

    function _getCastleTaxLimitCount() {
        return global.configs['config/city/castle_config'].data.config["@attributes"].harvestlimit;
    }

    function _getItemSpeedByExtraTime(extraTime) {
        var extraitems = global.configs['config/city/castle_config'].data.extraitem;
        if (extraTime < 0 || extraTime >= extraitems.length) return -1;

        return extraitems[extraTime]['@attributes'].number;
    }


    var bBuildInfoInited = false;
    var BuildUpgradeInfoConfig = [];

    function _getBuildLevelUpCondition(buildType, nextLevel) {
        if (!bBuildInfoInited) {
            var upgrade = global.configs['config/city/building'].main.upgrade;
            for (var i = 0; i < upgrade.length; ++i) {
                var condition = upgrade[i]['@attributes'];
                if (!BuildUpgradeInfoConfig[condition.buildtype]) {
                    BuildUpgradeInfoConfig[condition.buildtype] = [];
                }
                BuildUpgradeInfoConfig[condition.buildtype].push(condition);
            }
        }

        if (!BuildUpgradeInfoConfig[buildType]) return;
        if (nextLevel < 0 && nextLevel >= BuildUpgradeInfoConfig[buildType].length) return;

        return BuildUpgradeInfoConfig[buildType][nextLevel];
    }

    function _getGoldLimit(banklevel) {
        var banks = global.configs['config/city/bank_config'].data.bank;
        if (banklevel > 0 && banklevel <= banks.length) {
            return banks[banklevel - 1]['@attributes'].goldlimit;
        }
        return 0;
    }

    var skillConfig;

    function _initSkillConfig(onload) {
        if (!skillConfig) {
            global.configManager.load('config/battle/skill_config', function (data) {
                skillConfig = {};
                var config = data;
                var status = {};
                var statusInConfig = config.data.status;
                for (var i = 0; i < statusInConfig.length; ++i) {
                    status[statusInConfig[i]['@attributes'].id] = statusInConfig[i];
                }
                var skills = {};
                var skillsInConfig = config.data.skill;
                for (var i = 0; i < skillsInConfig.length; ++i) {
                    skills[skillsInConfig[i]['@attributes'].id] = skillsInConfig[i];
                }
                skillConfig.status = status;
                skillConfig.skills = skills;
                onload && onload();
            });
        }else{
            onload && onload();
        }
        //trace(['skillConfig',skillConfig])
        return skillConfig;
    }

    function _destroySkillConfig() {
        global.configManager.unload('config/battle/skill_config');
        skillConfig = undefined;
    }

    function _getStatusAniName(id) {
        var config = _initSkillConfig();
        return config.status[id];
    }

    function _getBattleSkill(id) {
        var config = _initSkillConfig();
        return config.skills[id];
    }

    var C_ACTIVE_SKILL = 1;
    var C_PASSIVE_SKILL = 2;

    function _isValidActiveSkill(skill) {
        if (!skill) return false;

        return skill['@attributes'].morale > 0 && skill['@attributes'].type == C_ACTIVE_SKILL;
    }

    function _getSkillLevelInfo(skill, level) {
        if (!skill) return;

        for (var key in skill.level) {
            if (skill.level[key]['@attributes'].value == level) {
                return skill.level[key]['@attributes'];
            }
        }
        return null;
    }

    var trainingSlot;

    function _getTrainingSlotData(slot) {
        if (!trainingSlot) {
            var config = global.common.getConfig('config/city/trainingfield_config');
            if (!config) return;
            trainingSlot = {};
            var datas = config.trainingfield.data;
            for (var i = 0; i < datas.length; ++i) {
                var slot = datas[i]['@attributes'].slot;
                var tflevel = datas[i]['@attributes'].tflevel;
                var cash = datas[i]['@attributes'].cash;
                var friendcount = datas[i]['@attributes'].friendcount;
                var friendlevel = datas[i]['@attributes'].friendlevel;
                trainingSlot[slot] = {'slot':slot, 'tflevel':tflevel, 'friendcount':friendcount, 'friendlevel':friendlevel, 'cash':cash};
            }
        }
        return trainingSlot[slot];
    }

    function _getLegionHeroLimit(level){
        var maxheronumber = 0;
        var troopInfos = global.configs['config/city/castle_config'].data.troop;
        for(var i=0; i<troopInfos.length; ++i) {
            var troop = troopInfos[i]['@attributes'];
            if(level >= troop.castlelevel && maxheronumber < troop.heronumber) {
                maxheronumber = troop.heronumber;
            }
        }
        return maxheronumber;
    }

    global.configHelper = _helper;
})();


