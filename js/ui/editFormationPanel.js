/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-5-14
 * Time: 上午11:26
 *
 */

(function () {

    var proto = EditFormationPanel.prototype;

    var legionItemNum = 5;
    var heroItemNum = 9;
    var MaxTroopLimit = 10;
    var chooseHeroItemNum = 6;

    var MODE_BATTLE = 1;
    var MODE_GARRISON = 2;
    var MODE_CAPTURE = 3;
    var MODE_MINECRAFT = 6;
    var MODE_RELEASE = 4;
    var MODE_RESIST = 5;

    global.MODE_BATTLE = MODE_BATTLE;
    global.MODE_GARRISON = MODE_GARRISON;
    global.MODE_CAPTURE = MODE_CAPTURE;
    global.MODE_RELEASE = MODE_RELEASE;
    global.MODE_MINECRAFT = MODE_MINECRAFT;
    global.MODE_RESIST = MODE_RESIST;

    function EditFormationPanel() {
        this.isShowing = false;
        this.width = 393;
        this.height = 540;
        this.chooseWidth = 360;
        this.chooseHeight = 303;
        this.curPage = 0;
        this.curChooseLegionIndex = 0;
        this.curChooseHeroPos = 0;
    }

    /** 当前编辑的阵列发生变化时调用这个参数指定的函数
     * @param onLegionInfoChanged == function(newLegionInfo)
     */
    proto.setOnLegionInfoChanged = function (onLegionInfoChanged) {
        this.onLegionInfoChanged = onLegionInfoChanged;
    };

    proto.loadData = function () {
        if (!this.legionSlot) {
            this.legionSlot = {};
            var slots = global.configs['config/battle/legion_config'].data.slot;
            for (var i = 0; i < slots.length; ++i) {
                var slot = slots[i]["@attributes"];
                this.legionSlot[slot.value] = slot.gold;
            }
        }
    };

    proto.getLegionItem = function (index) {
        index %= legionItemNum;
        return this.mc.getChildByName('item_' + (index + 1));
    };

    proto.getOpenLegionItem = function (index) {
        return this.mc.getChildByName('legion_open_' + (index + 1));
    };

    proto.getChooseHeroBtn = function (index) {
        return this.mc.getChildByName('btn_' + index);
    };

    proto.getHeroItem = function (index) {
        return this.mc.getChildByName('legio_item_' + index);
    };

    proto.showDialog = function (mode, uilayer, troopId) {
        if (!this.isShowing) {
            this.isShowing = true;

            global.configHelper.initSkillConfig(function () {
                this.mode = mode || MODE_GARRISON;
                this.mc = textureLoader.createMovieClip('battleUI', 'legion_attr_panel');
                this.mc.stopAtHead(true);
                this.mc.setIsSwallowTouch(true);
                this.curChooseLegionIndex = troopId >= 1 ? troopId - 1 : 0;
                this.container = uilayer || global.windowManager;
                this.container.addChild(this.mc);
                this.heroLimit = global.configHelper.getLegionHeroLimit(global.dataCenter.getLevel());
                this.explainLabel = this.mc.getChildByName('battle_explain_panel');
                this.closeBtn = this.mc.getChildByName('closeIcon');
                this.pageLabel = this.mc.getChildByName('page_text');
                this.battleMask = this.mc.getChildByName('battleMask');
                var self = this;
                this.closeBtn.setButton(true, function () {
                    self.closeDialog();
                });
                this.okBtn = this.mc.getChildByName('legion_save_btn');
                this.cancelBtn = this.mc.getChildByName('legion_quit_btn');
                this.heroNumLabel = this.mc.getChildByName('hero_num_text');
                this.legionBackBtn = this.mc.getChildByName('legion_back_btn');
                this.leftPageBtn = this.mc.getChildByName('left_btn');
                this.rightPageBtn = this.mc.getChildByName('right_btn');
                this.explainLabel.visible = false;
                this.battleMask.visible = false;
                this.loadData();
                this.curTempLegionInfo = undefined;
                this.bindOkCancelEvent();
                this.bindPageBtnEvent();
                this.bindChooseLegionEvent();
                this.bindChooseHeroBtnEvent();
                this.bindHeroItemEvent();
                this.bindLegionBackEvent();
                this.changeLegionListPage(this.curChooseLegionIndex / legionItemNum | 0);
                this.chooseLegion(this.curChooseLegionIndex);
                this.chooseHeroIndex = 0;
                this.mc.setOnClick(function () {
                    this.hideHeroAttr();
                }.bind(this));
            }.bind(this));
        }
    };

    proto.getLegionInfoWithTroop = function (troop, troopId) {
        var legionData = {};
        legionData["legion"] = {};
        legionData["lv"] = global.isMyHome ? global.dataCenter.getLevel() : global.myLevel;
        legionData["name"] = global.NetManager.un;
        legionData["photo"] = global.NetManager.headpic;
        legionData["uid"] = global.NetManager.uid;
        legionData.troopId = troopId || (troop ? troop.troopid : 0);
        if (troop) {
            var heros = {};
            var heroIdToPos = {};
            for (var i = 1; i <= 9; ++i) {
                var heroid = global.editFormationPanel.getHeroIDAtPosOfLegion(troop, i);
                if (heroid != 0) {
                    heros[heroid] = global.isMyHome ? global.dataCenter.getHeroById(heroid) : global.oldDataCenter.getHeroById(heroid);
                    heroIdToPos[heroid] = i - 1;
                }
            }
            heros = global.editFormationPanel.cacuTroopMount(troop);
            for (var heroid in heros) {
                var hero = heros[heroid];
                var pos = heroIdToPos[heroid];
                var heroInfo = legionData.legion[pos] = {};
                heroInfo.sid = hero.corpstype;
                heroInfo.totalHp = hero.totalSoldierNum;
                heroInfo.currentHp = hero.curSoldierNum;
                heroInfo.level = hero.herolevel;
                var skillId = heroInfo.skill1id;
                var skill = global.configHelper.getBattleSkill(skillId);
                var isvalid = global.configHelper.isValidActiveSkill(skill);
                heroInfo.im = isvalid;
                heroInfo.attackType = global.configHelper.getTroopByClassId(hero.corpstype)['@attributes'].atktype;
                heroInfo.name = hero.heroname;
                heroInfo.photo = hero.image;
            }
        }
        return legionData;
    };

    proto.bindOkCancelEvent = function () {
        this.closeBtn.setButton(true, function () {
            var legionInfo = this.getLegionInfo(this.curChooseLegionIndex);
            this.legionInfoChanged(legionInfo);
            this.closeDialog();
        }.bind(this));
        this.cancelBtn.setButton(true, function () {
            var legionInfo = this.getLegionInfo(this.curChooseLegionIndex);
            this.legionInfoChanged(legionInfo);
            this.closeDialog();
        }.bind(this));
        this.okBtn.setButton(true, function () {
            this.saveLegion();
            var legion = this.curTempLegionInfo;
            global.battleWorld.currentLegionInfo = legion;
            if (legion) {
                var bHasSoldier = false;
                for (var i = 1; i < heroItemNum; ++i) {
                    var heroid = this.getHeroIDAtPosOfLegion(legion, i);
                    var hero = global.dataCenter.getHeroById(heroid);
                    if (hero && hero.curSoldierNum > 0) {
                        bHasSoldier = true;
                        break;
                    }
                }

                if (bHasSoldier && global.battleReportReader) {
                    var legionData = this.getLegionInfoWithTroop(legion, this.curChooseLegionIndex + 1);
                    global.battleReportReader.setLegionData(legionData);
                    global.BattleManager && global.BattleManager.loadAssets(function () {
                        global.battleWorld &&
                        global.battleWorld.createLegion(global.battleReportReader.getAttackLegionData());
                    });
                }
            }
            this.closeDialog();
        }.bind(this));
    };

    proto.removeHeroFromLegionInfoById = function (legion, heroid) {
        if (!legion) return;
        for (var i = 1; i <= heroItemNum; ++i) {
            if (legion['heroid' + i] == heroid) {
                legion['heroid' + i] = 0;
                break;
            }
        }
    };

    proto.bindAddHeroEvent = function () {
        var self = this;
        if (this.chooseHeroDialog) {
            for (var i = 1; i <= chooseHeroItemNum; ++i) {
                var item = this.getChooseHeroItem(i);
                item.setOnClick(function (index) {
                    return function () {
                        var herodata = self.chooseHerosArray[self.curChoosePage * chooseHeroItemNum + index - 1];
                        if (herodata) {
                            if (self.chooseHeroData == herodata) {
                                if (self.curChooseHeroPos != 0) {
                                    var limit = global.configHelper.getLegionHeroLimit(global.dataCenter.getLevel());
                                    var legion = self.curTempLegionInfo;
                                    if (legion) {
                                        if (self.countLegionHeros(legion) >= limit && self.getHeroIDAtPosOfLegion(self.curChooseHeroPos) == 0) {
                                            global.dialog("当前军团英雄数量达到上限");
                                        }
                                        self.removeHeroFromLegionInfoById(legion, herodata.heroid);
                                        legion['heroid' + self.curChooseHeroPos] = herodata.heroid;
                                        self.updateLegionMapByLegionInfo(self.curChooseLegionIndex, legion);
                                        self.updateFormation();
                                        self.legionInfoChanged(legion);
                                    }
                                }
                                self.closeChooseHeroDialog();
                            } else {
                                self.chooseHeroData = herodata;
                                self.showHeroAttr(herodata);
                            }
                        }
                    };
                }(i));
            }
        }
    };

    proto.showChooseHeroDialog = function () {
        if (!this.isShowing) return;

        if (!this.chooseHeroDialog) {
            this.chooseHeroDialog = textureLoader.createMovieClip('battleUI', 'legion_choice_hero_panel');
            this.chooseHeroDialog.x = 0.5 * (this.width - this.chooseWidth);
            this.chooseHeroDialog.y = 0.5 * (this.height - this.chooseHeight);
            this.mc.addChild(this.chooseHeroDialog);
            this.chooseHeroDialog.setIsSwallowTouch(true);
            this.chooseHeroLeftPageBtn = this.chooseHeroDialog.getChildByName('left_btn');
            this.chooseHeroPageLabel = this.chooseHeroDialog.getChildByName('page_text');
            this.chooseHeroRightPageBtn = this.chooseHeroDialog.getChildByName('right_btn');
            this.chooseHeroCancelBtn = this.chooseHeroDialog.getChildByName('quit_btn');

            this.chooseHeroLeftPageBtn.setButton(true, function () {
                this.changeHeroChoosePage(this.curChoosePage - 1);
            }.bind(this));
            this.chooseHeroRightPageBtn.setButton(true, function () {
                this.changeHeroChoosePage(this.curChoosePage + 1);
            }.bind(this));
            this.chooseHeroCancelBtn.setButton(true, function () {
                this.closeChooseHeroDialog();
            }.bind(this));

            this.bindAddHeroEvent();
        }
        this.hideHeroAttr();
        this.chooseHeroData = undefined;
        /// 创建已有英雄副本,不包括在酒馆中的英雄
        var heros = {};
        var herosOfMy = global.dataCenter.data.heros;
        for (var heroid in herosOfMy) {
            if (herosOfMy[heroid].status)
                heros[heroid] = herosOfMy[heroid];
        }
        /// 去掉已经处于其他阵列中的英雄
        var troopCount = global.dataCenter.data.gameinfo.troopnumber;
        for (var legioninx = 0; legioninx < troopCount; legioninx++) {
            var legion = this.getLegionInfo(legioninx);
            if (legion && legion.troopid != (this.curChooseLegionIndex + 1)) {
                for (var index = 1; index < heroItemNum; index++) {
                    var id = this.getHeroIDAtPosOfLegion(legion, index);
                    if (id != 0) {
                        heros[id] = undefined;
                    }
                }
            }
        }
        this.chooseHerosArray = global.dataCenter.getHeros(heros);
        this.chooseHerosArray.sort(compareHeroByLevel);
        this.chooseHeroDialog.visible = true;
        this.curChoosePage = 0;
        this.changeHeroChoosePage(0);
    };

    function compareHeroByLevel(hero1, hero2) {
        var value1 = hero1.herolevel * 100 + hero1.herohidelevel;
        var value2 = hero2.herolevel * 100 + hero2.herohidelevel;
        return value2 - value1;
    }

    proto.getChooseHeroItem = function (index) {
        if (!this.chooseHeroDialog) return;
        return this.chooseHeroDialog.getChildByName('heros_item_' + index);
    };

    proto.checkIsLegionHasHero = function (legion, hero) {
        if (!legion || !hero) return false;

        for (var i = 1; i < heroItemNum; ++i) {
            if (+this.getHeroIDAtPosOfLegion(legion, i) == +hero.heroid) {
                return true;
            }
        }
        return false;
    };

    proto.changeHeroChoosePage = function (page) {
        var heroCount = this.chooseHerosArray.length;
        var pagecount = ( heroCount + chooseHeroItemNum - 1 ) / chooseHeroItemNum | 0;
        if (this.curChoosePage >= pagecount) {
            return;
        }
        if (this.curChoosePage < 0) {
            return;
        }
        this.curChoosePage = page;
        this.chooseHeroLeftPageBtn.setIsEnabled(this.curChoosePage != 0);
        this.chooseHeroRightPageBtn.setIsEnabled(this.curChoosePage != (pagecount - 1));

        if (pagecount > 0) {
            this.chooseHeroPageLabel.visible = true;
            this.chooseHeroPageLabel.setText((this.curChoosePage + 1 ) + "/" + pagecount);
        }
        else {
            this.chooseHeroPageLabel.visible = false;
        }
        var curLegionInfo = this.curTempLegionInfo;
        for (var index = 1; index <= chooseHeroItemNum; index++) {
            var chooseHeroItem = this.getChooseHeroItem(index);
            if (!chooseHeroItem) {
                continue;
            }
            var herodata = this.chooseHerosArray[this.curChoosePage * chooseHeroItemNum + index - 1];
            var color = global.heroConfigHelper.getColor(herodata);
            var heroLevelLabel = chooseHeroItem.getChildByName("herosLevelText1");
            if (heroLevelLabel) {
                if (herodata) {
                    heroLevelLabel.visible = true;
                    var levelText = 'Lv' + herodata.herolevel;
                    if (herodata.herohidelevel) {
                        levelText += "(+" + herodata.herohidelevel + ")";
                    }
                    heroLevelLabel.setText(levelText);
                }
                else {
                    heroLevelLabel.visible = false;
                    heroLevelLabel.setText("Lv--");
                }
                heroLevelLabel.setColor(color);
            }
            var heroStateLabel = chooseHeroItem.getChildByName("herosStateText");
            if (heroStateLabel) {
                if (herodata) {
                    heroStateLabel.visible = true;
                    if (this.checkIsLegionHasHero(curLegionInfo, herodata)) {
                        heroStateLabel.setText("出战");
                        heroStateLabel.setColor(global.Color.RED);
                    }
                    else {
                        heroStateLabel.setText(global.heroConfigHelper.getDescOfHeroStatus(herodata));
                        heroStateLabel.setColor(global.Color.BLACK);
                    }
                }
                else {
                    heroStateLabel.setText("");
                    heroStateLabel.setColor(global.Color.BLACK);
                    heroStateLabel.visible = false;
                }
            }

            var soldierPhoto = chooseHeroItem.getChildByName("soldier_photo");
            if (soldierPhoto) {
                soldierPhoto.setImage();
                if (herodata) {
                    var troop = global.configHelper.getTroopByClassId(herodata.corpstype);
                    var resname = 'resources/icon/soldier/' + troop['@attributes'].run.replace('_run', '') + '.png';
                    soldierPhoto.setImage(resname);
                }

            }

            var heroPhotoBg = chooseHeroItem.getChildByName("bg");
            if (heroPhotoBg) {
                if (herodata) {
                    heroPhotoBg.setMovieClip('hero', 'hero' + herodata.image, function (heroMovie) {
                        heroMovie.scaleX = 44 / 150;
                        heroMovie.scaleY = 44 / 150;
                    });
                } else {
                    heroPhotoBg.setMovieClip();
                }
            }
        }
    };

    proto.closeChooseHeroDialog = function () {
        if (this.chooseHeroDialog) {
            for (var index = 1; index <= chooseHeroItemNum; index++) {
                var chooseHeroItem = this.getChooseHeroItem(index);
                if (!chooseHeroItem) {
                    continue;
                }
                var soldierPhoto = chooseHeroItem.getChildByName("soldier_photo");
                if (soldierPhoto) {
                    soldierPhoto.setImage();
                }
                var heroPhotoBg = chooseHeroItem.getChildByName("bg");
                if (heroPhotoBg) {
                    heroPhotoBg.setMovieClip();
                }
            }

            this.chooseHeroDialog.removeFromParent();
            this.chooseHeroDialog = undefined;
            this.curChooseHeroPos = 0;
            this.hideHeroAttr();
        }
    };

    proto.saveLegion = function () {
        var legion = this.curTempLegionInfo;
        if (!legion) return;
        var heroids = [];
        var herosoldiers = [];
        var totalSoldierMount = 0;
        for (var index = 1; index <= heroItemNum; index++) {
            var heroid = this.getHeroIDAtPosOfLegion(legion, index);
            heroids.push(heroid);
            if (heroid == 0) {
                herosoldiers.push(0);
            } else {
                var hero = global.dataCenter.getHeroById(heroid);
                var curSoldierNum = parseInt(hero.curSoldierNum);
                herosoldiers.push(curSoldierNum);
                totalSoldierMount += curSoldierNum;
            }
        }

        var isassist = 0;
        var location = legion.location;
        if (location == 0) {
            isassist = 0;
        }
        global.NetManager.call("Hero", "edittroop",
            {
                'isassist':isassist,
                'ismine':legion.ismine,
                'troopid':this.curChooseLegionIndex + 1,
                'heroflag':0, 'heroid':heroids,
                'herosolder':herosoldiers,
                'location':location,
                'soldier':totalSoldierMount
            },
            this.onNetSaveLegion.bind(this),
            "保存军团配置中");
    };

    proto.onNetSaveLegion = function (data) {
        var dataobj = data["data"];
        global.controller.missionController.update(dataobj.mission);
        global.controller.dayMissionController.update(dataobj.mission_day);
        global.controller.playerStatusController.update(dataobj.player);
        global.controller.herosController.update(dataobj.heros);
        global.controller.buildingController.update(dataobj.build);
        global.controller.troopsController.update(dataobj.troops);
        this.changeLegionListPage(this.curPage);
        this.chooseLegion(this.curChooseLegionIndex);
    };

    proto.onNetRetreatGarrsionLegion = function (data) {
        var dataobj = data["data"];
        global.controller.missionController.update(dataobj.mission);
        global.controller.dayMissionController.update(dataobj.mission_day);
        global.controller.playerStatusController.update(dataobj.player);
        global.controller.herosController.update(dataobj.heros);
        global.controller.singleTroopController.update(dataobj.troop);
        global.controller.buildingController.update(dataobj.building);

        var uid = 0;
        if (dataobj["build"]) {
            uid = dataobj["build"]["u"];
        }
        if (global.isMyHome) {
            global.controller.jailController.update(dataobj.jail);
            if (global.NetManager.uid == uid) {
                global.controller.visitInfoController.update(dataobj.visitinfo);
            }
        } else if (global.friendId == uid) {
            global.controller.visitInfoController.update(dataobj.visitinfo);
        }
        var ismine = dataobj.ismine;
        if (ismine) {
            if (dataobj.players) {
                //MineCraftScene.GetInstance().UpdateNetMine( dataobj );
            } else {
                //MineCraftScene.GetInstance().QueryMineData();
            }
        }
        if (dataobj.troop) {
            if (this.curTempLegionInfo && this.curTempLegionInfo.troopid == dataobj.troop.troopid) {
                this.curTempLegionInfo = dataobj.troop;
            }
        }
        this.changeLegionListPage(this.curPage);
        this.chooseLegion(this.curChooseLegionIndex);
    };

    proto.bindLegionBackEvent = function () {
        var self = this;
        this.hideHeroAttr();
        this.legionBackBtn.setButton(true, function () {
            var curLegionInfo = self.getLegionInfo(self.curChooseLegionIndex);
            if (!curLegionInfo) return;
            var heroids = [];
            var herosoldiers = [];
            for (var i = 1; i <= heroItemNum; ++i) {
                heroids.push(0);
                herosoldiers.push(0);
            }
            var ismine = !!curLegionInfo.ismine;
            global.NetManager.call("Hero", "retreat",
                { 'ismine':ismine, 'troopid':self.curChooseLegionIndex + 1, 'location':curLegionInfo.location },
                self.onNetRetreatGarrsionLegion.bind(self),
                "军团撤军中");
        });
    };

    proto.showHeroAttr = function (heroInfo) {
        if (!this.isShowing) return;
        if (!heroInfo) {
            this.hideHeroAttr();
            return;
        }

        var attrPanel = this.mc.getChildByName('legion_hero_tips');
        if (!attrPanel) {
            attrPanel = textureLoader.createMovieClip('battleUI', 'legion_hero_tips');
            attrPanel.name = 'legion_hero_tips';
            this.mc.addChild(attrPanel);
            attrPanel.x = this.mc.getWidth();
            attrPanel.y = this.mc.getHeight() - attrPanel.getHeight();
        }

        attrPanel.visible = true;
        var heroPhotoBg = attrPanel.getChildByName('bg');
        global.common.assertRes(heroPhotoBg, "bg");
        heroPhotoBg.setMovieClip('hero', 'hero' + heroInfo.image);

        var heroLevelLabel = attrPanel.getChildByName('herosLevelText2');
        global.common.assertRes(heroLevelLabel, 'herosLevelText2');
        heroLevelLabel.setText(heroInfo.herolevel);

        var heroHideLevel = attrPanel.getChildByName('level_text_1');
        global.common.assertRes(heroHideLevel, 'level_text_1');
        heroHideLevel.setText(heroInfo.herohidelevel);

        var expProgressBar = attrPanel.getChildByName('exp_progress');
        global.common.assertRes(expProgressBar, 'exp_progress');
        var levelUpNeedExp = global.heroConfigHelper.getExpOfLevel(heroInfo.herolevel);
        expProgressBar.scaleX = +heroInfo.exp / +levelUpNeedExp;
        var heroNameLabel = attrPanel.getChildByName('heros_name_text');
        global.common.assertRes(heroNameLabel, 'heros_name_text');
        heroNameLabel.setText(heroInfo.heroname);

        var heroStateLabel = attrPanel.getChildByName('heros_state_text');
        heroStateLabel && (heroStateLabel.visible = false);//无需显示，在列表中的英雄都为空闲状态

        var attackText = attrPanel.getChildByName('attackText');
        var weaponText = attrPanel.getChildByName('weaponText');
        var luckyText = attrPanel.getChildByName('luckyText');
        var soldiersText = attrPanel.getChildByName('soldier_total_text');
        global.common.assertRes(attackText && weaponText && luckyText && soldiersText, "attactText或weaponText或luckyText或soldiersText");

        var average = global.getHeroAvarate(heroInfo.grade).value;
        attackText.setText(heroInfo.attack + heroInfo.itemattack + heroInfo.herohidelevel);
        this._setColorByAttr(attackText, average, heroInfo.attack + heroInfo.herohidelevel);
        weaponText.setText(heroInfo.defense + heroInfo.itemdefense + heroInfo.herohidelevel);
        this._setColorByAttr(weaponText, average, heroInfo.defense + heroInfo.herohidelevel);
        luckyText.setText(heroInfo.luck);
        this._setColorByAttr(luckyText, average, heroInfo.luck);
        soldiersText.setText(global.heroConfigHelper.getSoldiersOfLevel(heroInfo.herolevel));

        var weaponItem = attrPanel.getChildByName('hero_equip_weapon');
        global.common.assertRes(weaponItem, 'hero_equip_weapon');
        weaponItem.setImage();
        weaponItem.getChildByName('super_star').visible = false;
        if (heroInfo.weapontype != 0) {
            var weaponInfo = global.ItemFunction.getItemInfo(heroInfo.weapontype, heroInfo.weaponid);
            if (weaponInfo) {
                weaponItem.setImage(global.ItemFunction.IconDir + weaponInfo.tinyicon + '.png');
                weaponItem.getChildByName('super_star').visible = weaponInfo.israre;
            }
        }

        var armorItem = attrPanel.getChildByName('hero_equip_armor');
        global.common.assertRes(armorItem, 'hero_equip_armor');
        armorItem.setImage();
        armorItem.getChildByName('super_star').visible = false;
        if (heroInfo.armortype != 0) {
            var armorInfo = global.ItemFunction.getItemInfo(heroInfo.armortype, heroInfo.armorid);
            if (armorInfo) {
                armorItem.setImage(global.ItemFunction.IconDir + armorInfo.tinyicon + '.png');
                armorItem.getChildByName('super_star').visible = armorInfo.israre;
            }
        }

        var soldierNameLabel = attrPanel.getChildByName('hero_soldier_text');
        global.common.assertRes(soldierNameLabel, 'hero_soldier_text');
        var troopInfo = global.configHelper.getTroopByClassId(heroInfo.corpstype);
        var soldierNameText = troopInfo ? troopInfo['@attributes'].name : '';
        soldierNameLabel.setText(soldierNameText);

        var skillItem = attrPanel.getChildByName('legion_skill_item_2');
        global.common.assertRes(skillItem, 'legion_skill_item_2');
        var skillId = heroInfo.skill1id;
        var skillLevel = heroInfo.skill1level;
        var skill = global.configHelper.getBattleSkill(skillId);
        var isvalid = global.configHelper.isValidActiveSkill(skill);
        var skillPhoto = skillItem.getChildByName('heros_skill');
        global.common.assertRes(skillPhoto, 'heros_skill');
        skillPhoto.setImage();
        var skillNameLabel = skillItem.getChildByName('skill_name_text');
        global.common.assertRes(skillNameLabel, 'skill_name_text');
        var skillLevelLabel = skillItem.getChildByName('skill_level_text');
        global.common.assertRes(skillLevelLabel, 'skill_level_text');
        if (isvalid) {
            skillPhoto.setImage(global.ItemFunction.IconDir + skill['@attributes'].resname + '.png');
            skillNameLabel.setText(skill ? skill['@attributes'].name : "");
            skillLevelLabel.setText(skillLevel);
        } else {
            skillNameLabel.setText('');
            skillLevelLabel.setText('');
        }
    };

    proto._setColorByAttr = function (text, attr, value) {
        var _less = 0.92;
        var _high = 1.02;
        if (this.isShowing) {
            var less = attr * _less;
            var high = attr * _high;
            var arrow = text.arrow;
            text.parent.removeChild(arrow);
            text.arrow = null;
            if (value < less) {
                text.setColor(global.Color.GREEN);
                text.arrow = textureLoader.createMovieClip('battleUI', 'tavern_excite_down_arrow');
                text.arrow.x = text.x + 28;
                text.arrow.y = text.y;
                text.parent.addChild(text.arrow);
            } else if (value > high) {
                text.setColor(global.Color.RED);
                text.arrow = textureLoader.createMovieClip('battleUI', 'tavern_excite_up_arrow');
                text.arrow.x = text.x + 28;
                text.arrow.y = text.y;
                text.parent.addChild(text.arrow);
            } else {
                text.setColor(global.Color.WHITE);
            }
        }
    };

    proto.hideHeroAttr = function () {
        if (!this.isShowing) return;

        var attrPanel = this.mc.getChildByName('legion_hero_tips');
        if (attrPanel) {
            attrPanel.visible = false;
        }
    };

    proto.bindHeroItemEvent = function () {
        var self = this;
        for (var i = 1; i <= heroItemNum; ++i) {
            var heroItem = this.getHeroItem(i);
            heroItem.setIsSwallowTouch(true);
            heroItem.setOnClick(function (index) {
                return function () {
                    var legionInfo = self.curTempLegionInfo;
                    if (legionInfo) {
                        var heroId = self.getHeroIDAtPosOfLegion(legionInfo, index);
                        if (heroId) {
                            if (self.chooseHeroIndex == index) {
                                self.curChooseHeroPos = index;
                                self.showChooseHeroDialog();
                            } else {
                                // 显示英雄属性
                                var heroInfo = global.dataCenter.getHeroById(heroId)
                                self.showHeroAttr(heroInfo);
                                self.chooseHeroIndex = index;
                            }
                        } else {
                            self.hideHeroAttr();
                            self.chooseHeroIndex = 0;
                        }
                    }
                }
            }(i));

            var removeHeroBtn = heroItem.getChildByName('quit_btn');

            if (removeHeroBtn) {
                removeHeroBtn.setButton(true, function (index) {
                    return function () {
                        self.hideHeroAttr();
                        var legionInfo = self.curTempLegionInfo;
                        if (legionInfo) {
                            if ((legionInfo.ismine || legionInfo.location != 0) && self.getLegionHeroCount(legionInfo) == 1) {
                                if (legionInfo.location == global.NetManager.uid) {
                                    global.dialog("驻防军团至少要有一个英雄");
                                } else {
                                    global.dialog("占领军团至少需要一个英雄");
                                }
                            } else {
                                self.removeHeroFromLegionInfo(legionInfo, index);
                                self.updateLegionMapByLegionInfo(self.curChooseLegionIndex, legionInfo);
                                self.updateFormation();
                                self.legionInfoChanged(legionInfo);
                            }
                        }
                    };
                }(i));
            }
        }
    };

    proto.removeHeroFromLegionInfo = function (legionInfo, index) {
        if (!legionInfo) return;

        var heroid = 'heroid' + index;
        legionInfo[heroid] = 0;
    };

    proto.bindPageBtnEvent = function () {
        this.leftPageBtn.setButton(true, function () {
            this.changeLegionListPage(this.curPage - 1);
        }.bind(this));
        this.rightPageBtn.setButton(true, function () {
            this.changeLegionListPage(this.curPage + 1);
        }.bind(this));
    };

    proto.copyLegionInfo = function (legionInfo, troopId) {
        var ret = {};
        if (legionInfo) {
            for (var key in legionInfo) {
                ret[key] = legionInfo[key];
            }
        } else {
            ret.playerid = global.NetManager.uid;
            ret.troopid = troopId;
            for (var i = 1; i <= heroItemNum; ++i) {
                ret['heroid' + i] = 0;
            }
            ret.soldier = 0;
            ret.location = 0;
            ret.locationname = '';
            ret.ismine = 0;
        }
        return ret;
    };

    proto.isEmptyLegion = function (legion) {
        if (!legion) return false;

        if (legion.location != 0 || legion.ismine != 0 || legion.soldier != 0) return false;

        for (var i = 1; i <= heroItemNum; ++i) {
            if (this.getHeroIDAtPosOfLegion(legion, i) != 0) {
                return false;
            }
        }
        return true;
    };

    proto.isEqualLegion = function (legion1, legion2) {
        if (!legion1 || !legion2) {
            var notNullLegion = legion1 ? legion1 : legion2;
            return this.isEmptyLegion(notNullLegion);
        }

        if (legion1.troopid != legion2.troopid || legion1.location != legion2.location || legion1.soldier != legion2.soldier) {
            return false;
        }
        for (var i = 1; i <= heroItemNum; ++i) {
            var heroid1 = this.getHeroIDAtPosOfLegion(legion1, i);
            var heroid2 = this.getHeroIDAtPosOfLegion(legion2, i);
            if (heroid1 != heroid2) {
                return false;
            }
        }
        return true;
    };

    proto.chooseLegion = function (legionId) {
        if (!this.isShowing) return;

        //如果选择的军团在当前页，则显示选择框
        if (this.curTempLegionInfo && this.curChooseLegionIndex != legionId) {
            var curLegionInfo = this.getLegionInfo(this.curChooseLegionIndex);
            if (!this.isEqualLegion(this.curTempLegionInfo, curLegionInfo)) {
                this.saveLegion();
            }
        }

        this.curChooseLegionIndex = legionId;
        var selectLegionBox = this.mc.getChildByName('select_legion_box');
        if (this.isCurChooseLegionInCurPage()) {
            var item = this.getLegionItem(legionId);
            if (item) {
                if (!selectLegionBox) {
                    selectLegionBox = textureLoader.createMovieClip('battleUI', 'select_legion_box');
                    selectLegionBox.name = 'select_legion_box';
                    this.mc.addChild(selectLegionBox);
                }
                selectLegionBox.x = item.x;
                selectLegionBox.y = item.y;
            }
            selectLegionBox.visible = true;
        } else {
            selectLegionBox && (selectLegionBox.visible = false);
        }
        var legionInfo = this.getLegionInfo(legionId);
        this.curTempLegionInfo = this.copyLegionInfo(legionInfo, legionId + 1);
        this.updateFormation();
        this.legionInfoChanged(this.curTempLegionInfo);
    };

    proto.legionInfoChanged = function (legionInfo) {
        this.onLegionInfoChanged && this.onLegionInfoChanged(legionInfo);
    };

    proto.bindChooseLegionEvent = function () {
        var self = this;
        for (var i = 0; i < legionItemNum; ++i) {
            var legionItem = this.getLegionItem(i);
            if (legionItem) {
                legionItem.setOnClick(function (legionItemId) {
                    return function () {
                        var legionId = self.curPage * legionItemNum + legionItemId;
                        if (self.curChooseLegionIndex != legionId) {
                            self.chooseLegion(legionId);
                        }
                    };
                }(i));
            }
            var openLegionItem = this.getOpenLegionItem(i);
            var self = this;
            if (openLegionItem) {
                openLegionItem.setButton(true, function (legionItemId) {
                    return function () {
                        self.hideHeroAttr();
                        var selfLevel = global.isMyHome ? global.dataCenter.getLevel() : global.myLevel;
                        var troopLimit = global.configHelper.getLegionHeroLimit(global.dataCenter.getLevel());
                        var nextslot = +troopLimit + 1;
                        var gold = self.legionSlot[nextslot];
                        if (gold == 0 || gold > global.dataCenter.data.player.gold) {
                            global.dialog("金币不足，开启新军团需要金币" + gold);
                            return;
                        }
                        global.dialog("开启新军团需要金币" + gold + "，请确认是否开启？",
                            {
                                type:global.dialog.DIALOG_TYPE_CONFIRM,
                                closeDelay:0,
                                okFunc:function () {
                                    global.NetManager.call("Player", "addlegionnumber", { 'gold':gold }, self.onNetNewLegion.bind(self), "开启新军团中");
                                }
                            }
                        );
                    };
                }(i));
            }
        }
    };

    proto.onNetNewLegion = function (data) {
        var dataobj = data["data"];
        global.controller.playerStatusController.update(dataobj["player"]);
        global.controller.gameinfoController.update(dataobj.gameinfo);
        global.controller.missionController.update(dataobj.mission);
        global.controller.dayMissionController.update(dataobj.mission_day);
        this.changeLegionListPage(this.curPage);
    };

    proto.bindChooseHeroBtnEvent = function () {
        var self = this;
        for (var i = 1; i <= heroItemNum; ++i) {
            var chooseHeroBtn = this.getChooseHeroBtn(i);
            chooseHeroBtn.setUseAlphaTest(true);
            chooseHeroBtn.setButton(true, function (index) {
                return function () {
                    self.curChooseHeroPos = index;
                    self.showChooseHeroDialog();
                }
            }(i));
        }
    };

    proto.chooseLegionByTroopId = function (troopid) {
        var legionId = troopid - 1;
        this.chooseLegion(legionId);
    };

    proto.canChooseTroop = function () {
        return global.dataCenter.getLevel() >= global.configs['config/city/castle_config'].data.config["@attributes"].garrisonlv;
    };

    proto.getLegionInfo = function (index) {
        return global.dataCenter.data.troops[index + 1];
    };

    proto.countLegionHeros = function (legionInfo) {
        if (!legionInfo) return 0;
        var count = 0;
        for (var i = 1; i <= heroItemNum; ++i) {
            if (legionInfo['heroid' + i] != 0) {
                ++count;
            }
        }
        return count;
    };

    proto.getHeroIDAtPosOfLegion = function (legionInfo, pos) {
        if (!legionInfo) return 0;
        var heroid = legionInfo['heroid' + pos];
        return heroid ? heroid : 0;
    };

    /// 计算一个阵型里面英雄的数量
    proto.getLegionHeroCount = function (legionInfo) {
        var herosCountInLegion = 0;
        if (legionInfo) {
            for (var i = 1; i <= heroItemNum; ++i) {
                if (legionInfo['heroid' + i] != 0) {//对应的英雄id不为0
                    ++herosCountInLegion;
                }
            }
        }
        return herosCountInLegion;
    };

    /// 刷新阵型列表
    proto.changeLegionListPage = function (page) {
        if (!this.isShowing) return;
        var legionCount = Math.min(global.dataCenter.data.gameinfo.troopnumber + 1, MaxTroopLimit);
        var pageCount = (legionCount + legionItemNum - 1) / legionItemNum | 0;
        if (this.curPage >= pageCount || this.curPage < 0) {
            return;
        }
        this.curPage = page;
        this.leftPageBtn.visible = this.canChooseTroop();
        this.leftPageBtn.setIsEnabled(this.curPage != 0);
        this.rightPageBtn.visible = this.canChooseTroop();
        this.rightPageBtn.setIsEnabled(this.curPage != (pageCount - 1));

        for (var i = 0; i < legionItemNum; ++i) {
            var legionItem = this.getLegionItem(i);
            var legionInfo;

            var legionId = this.curPage * legionItemNum + i;
            if (this.curTempLegionInfo && legionId == this.curTempLegionInfo.troopid - 1) {//如果是选择过的阵列，可能阵列信息经过了改变，所以需要使用该信息
                legionInfo = this.curTempLegionInfo;
            } else {
                legionInfo = this.getLegionInfo(legionId);
            }

            var stateLabel = legionItem.getChildByName('state_text');
            if (legionId == (legionCount - 1)) {
                this.getOpenLegionItem(i).visible = true;
                legionItem.visible = false;
                stateLabel.setText('');
            } else {
                this.getOpenLegionItem(i).visible = false;
                legionItem.visible = legionId < legionCount;
                stateLabel.setText('空闲');
            }
            var numLabel = legionItem.getChildByName('num_text');
            numLabel.setText((+legionId + 1));
            if (legionInfo) {
                if (legionInfo.location == global.NetManager.uid) {
                    stateLabel.setText('驻守');
                } else if (legionInfo.location != 0 || legionInfo.ismine) {
                    if (legionInfo.ismine) {
                        stateLabel.setText('金矿');
                    } else {
                        stateLabel.setText('占领');
                    }
                } else {
                    stateLabel.setText('空闲');
                }
            } else {
                stateLabel.setText('');
            }
            this.updateLegionMapByLegionInfo(i, legionInfo);
        }
        var selectLegionBox = this.mc.getChildByName('select_legion_box');
        if (this.isCurChooseLegionInCurPage()) {
            selectLegionBox && (selectLegionBox.visible = true);
        } else {
            selectLegionBox && (selectLegionBox.visible = false);
        }
        //this.updateFormation();
    };

    proto.isCurChooseLegionInCurPage = function () {
        return this.curChooseLegionIndex >= this.curPage * legionItemNum && this.curChooseLegionIndex < (this.curPage + 1) * legionItemNum;
    };

    proto.updateLegionMapByLegionInfo = function (legionId, legionInfo) {
        var legionItem = this.getLegionItem(legionId);
        if (!legionItem) return;
        for (var j = 1; j <= heroItemNum; ++j) {
            var photo = legionItem.getChildByName('photo_' + j);
            photo && (photo.visible = (this.getHeroIDAtPosOfLegion(legionInfo, j) != 0));
        }
    };

    proto.getHerosOfLegion = function (legion) {
        var heros = {};
        if (legion) {
            for (var i = 1; i <= heroItemNum; ++i) {
                var id = this.getHeroIDAtPosOfLegion(legion, i);
                if (id != 0) {
                    heros[id] = global.isMyHome ? global.dataCenter.getHeroById(id) : global.oldDataCenter.getHeroById(id);
                }
            }
        }
        return heros;
    };

    /// 计算英雄同名同姓加成，同姓英雄每多一个增加6%攻击力，同名增加6%防御力
    proto.cacuHeroNameExtraAddition = function (curLegionInfo, heros) {
        var heroIdToExtra = {};
        if (curLegionInfo) {
            var herosSecondNameSame = {};
            var herosLastNameSame = {};
            for (var i = 1; i <= heroItemNum; ++i) {
                var id = this.getHeroIDAtPosOfLegion(curLegionInfo, i);
                var hero = undefined;
                if (id != 0) {
                    hero = heros[id] = global.dataCenter.getHeroById(id);
                }
                if (hero) {
                    var seperator = hero.heroname.indexOf('-');
                    if (seperator >= 0) {
                        var lastName = hero.heroname.substr(0, seperator);//姓
                        var secondName = hero.heroname.substr(seperator + 1);//名
                        if (!herosLastNameSame[lastName]) {
                            herosLastNameSame[lastName] = {atk:0};
                        } else {
                            herosLastNameSame[lastName].atk += 6;
                        }
                        if (!herosSecondNameSame[secondName]) {
                            herosSecondNameSame[secondName] = {def:0};
                        } else {
                            herosSecondNameSame[secondName].def += 6;
                        }
                        //将计算结果记录到与英雄id映射的表中
                        heroIdToExtra[id] = {};
                        heroIdToExtra[id].attackExtra = herosLastNameSame[lastName];
                        heroIdToExtra[id].defendExtra = herosSecondNameSame[secondName];
                    }
                }
            }
        }

        return heroIdToExtra;
    };

    /// 计算英雄当前带兵量
    proto.cacuTroopMount = function (legionInfo) {
        var totalHerosSoldierNum = 0;
        var heroNum = 0;

        var heros = global.editFormationPanel.getHerosOfLegion(legionInfo);
        for (var heroid in heros) {
            var hero = heros[heroid];
            var totalSoldierNum = global.heroConfigHelper.getSoldiersOfLevel(hero.herolevel);
            hero.totalSoldierNum = totalSoldierNum;
            totalHerosSoldierNum += totalSoldierNum;
            ++heroNum;
        }

        if (totalHerosSoldierNum == 0) return heros;

        var isFree = false;//是否处于空闲状态
        if (legionInfo.location == 0 && !legionInfo.ismine) {
            isFree = true;
        }

        var soldierMountLeftForLegion = totalHerosSoldierNum;
        if (isFree) {
            var allLeftSoldierMountOfMy = global.isMyHome ? global.dataCenter.data.player.soldier : global.oldDataCenter.data.player.soldier;
            if (allLeftSoldierMountOfMy < totalHerosSoldierNum) {
                soldierMountLeftForLegion = allLeftSoldierMountOfMy;
            }
        } else {
            soldierMountLeftForLegion = legionInfo.soldier;
        }

        if (soldierMountLeftForLegion == totalHerosSoldierNum) { // 兵团英雄带兵数没有损失
            for (var heroid in heros) {
                var hero = heros[heroid];
                hero.curSoldierNum = hero.totalSoldierNum;
            }
        } else {
            for (var i = 1; i <= heroItemNum; ++i) {
                var id = this.getHeroIDAtPosOfLegion(legionInfo, i);
                var hero = heros[id];
                if (hero && heroNum > 0) {
                    var average = Math.ceil(soldierMountLeftForLegion / heroNum);
                    if (average <= hero.totalSoldierNum) {
                        hero.curSoldierNum = average;
                        soldierMountLeftForLegion -= average;
                    } else {
                        hero.curSoldierNum = hero.totalSoldierNum;
                        soldierMountLeftForLegion -= hero.totalSoldierNum;
                    }
                    --heroNum;
                }
            }
        }

        return heros;
    };

    proto.updateFormation = function () {
        var curLegionInfo = this.curTempLegionInfo;
        var troopCount = this.countLegionHeros(curLegionInfo);
        this.heroNumLabel.setText(troopCount + '/' + this.heroLimit);

        var enableLegionBack;
        if (this.mode == MODE_BATTLE || this.mode == MODE_CAPTURE || this.mode == MODE_RELEASE || this.mode == MODE_RESIST) {
            enableLegionBack = curLegionInfo && ( curLegionInfo.ismine || curLegionInfo.location != 0 );
        }
        else if (this.mode == MODE_GARRISON) {
            var uid = global.isMyHome ? global.NetManager.uid : global.friendId;
            enableLegionBack = curLegionInfo && ( curLegionInfo.ismine || curLegionInfo.location != 0 ) && curLegionInfo.location != uid;
        }
        else if (this.mode == MODE_MINECRAFT) {
            enableLegionBack = curLegionInfo && ( !curLegionInfo.ismine && curLegionInfo.location != 0 );
        }
        this.battleMask.visible = !!enableLegionBack;
        var limit = global.configHelper.getLegionHeroLimit(global.dataCenter.getLevel());
        var canntadd = troopCount >= limit;
        this.legionBackBtn.visible = enableLegionBack;
        this.cancelBtn.visible = !enableLegionBack;
        this.okBtn.visible = !enableLegionBack;

        var heros = this.cacuTroopMount(curLegionInfo);
        var heroIdToExtra = this.cacuHeroNameExtraAddition(curLegionInfo, heros);
        var heroCountInLegion = this.getLegionHeroCount(curLegionInfo);

        for (var i = 1; i <= heroItemNum; ++i) {
            var id = this.getHeroIDAtPosOfLegion(curLegionInfo, i);
            var hero = heros[id];
            var heroItem = this.getHeroItem(i);
            if (!heroItem) continue;

            var btn = this.getChooseHeroBtn(i);
            if (btn) {
                btn.visible = (id == 0);
                if (enableLegionBack || (canntadd && !hero)) {
                    btn.setIsEnabled(false);
                } else {
                    btn.setIsEnabled(true);
                }
            }

            var quitBtn = heroItem.getChildByName('quit_btn');
            if (quitBtn) {
                quitBtn.visible = hero ? true : false;
                quitBtn.setIsEnabled(!enableLegionBack);
            }
            var attackLabel = heroItem.getChildByName('text_1');
            if (attackLabel) {
                var atkbonus = hero && heroIdToExtra[hero.heroid] ? heroIdToExtra[hero.heroid].attackExtra.atk : 0;
                if (atkbonus > 0) {
                    attackLabel.setText('攻击力+' + atkbonus + '%');
                } else {
                    attackLabel.setText('');
                }
                atkbonus.visible = (atkbonus != 0);
            }
            var defendLabel = heroItem.getChildByName('text_2');
            if (defendLabel) {
                var defbonus = hero && heroIdToExtra[hero.heroid] ? heroIdToExtra[hero.heroid].defendExtra.def : 0;
                if (defbonus > 0) {
                    defendLabel.setText('防御力' + defbonus + "%");
                } else {
                    defendLabel.setText('');
                }
                defendLabel.visible = (defbonus != 0);
            }
            var bg1 = heroItem.getChildByName('bg_1');
            if (bg1) {
                bg1.visible = !!hero;
            }

            var soldierPhoto = heroItem.getChildByName('soldier_photo');
            if (soldierPhoto) {
                soldierPhoto.setImage();
                if (hero) {
                    var troop = global.configHelper.getTroopByClassId(hero.corpstype);
                    var resname = 'resources/icon/soldier/' + troop['@attributes'].run.replace('_run', '') + '.png';
                    soldierPhoto.setImage(resname);
                }
            }
            var soldierNumLabel = heroItem.getChildByName('num_text');
            if (soldierNumLabel) {
                soldierNumLabel.visible = !!hero;
                if (hero)
                    soldierNumLabel.setText(hero.curSoldierNum + '/' + hero.totalSoldierNum);
            }

            var heroPhoto = heroItem.getChildByName('hero_photo');
            if (heroPhoto) {
                heroPhoto.visible = !!hero;
                if (hero) {
                    heroPhoto.setMovieClip('hero', 'hero' + hero.image, function (heroMovie) {
                        heroMovie.scaleX = 36 / heroMovie.getWidth();
                        heroMovie.scaleY = 36 / heroMovie.getHeight();
                    });
                }
            }
            var stateLabel = heroItem.getChildByName('state_text');
            if (stateLabel) {
                stateLabel.visible = !!hero;
                if (hero) {
                    stateLabel.setText(hero.troopid == curLegionInfo.troopid ? "可以出战" : "不可出战");
                }
            }
        }
    };

    proto.cleanCachedResource = function () {
        var attrPanel = this.mc.getChildByName('legion_hero_tips');
        if (attrPanel) {
            var heroPhotoBg = attrPanel.getChildByName('bg');
            heroPhotoBg.setMovieClip();
            var weaponItem = attrPanel.getChildByName('hero_equip_weapon');
            weaponItem.setImage();
            var armorItem = attrPanel.getChildByName('hero_equip_armor');
            armorItem.setImage();

            var skillItem = attrPanel.getChildByName('legion_skill_item_2');
            global.common.assertRes(skillItem, 'legion_skill_item_2');
            var skillPhoto = skillItem.getChildByName('heros_skill');
            global.common.assertRes(skillPhoto, 'heros_skill');
            skillPhoto.setImage();
        }

        for (var i = 1; i <= heroItemNum; ++i) {
            var heroItem = this.getHeroItem(i);
            if (!heroItem) continue;
            var soldierPhoto = heroItem.getChildByName('soldier_photo');
            if (soldierPhoto) {
                soldierPhoto.setImage();
            }
            var heroPhoto = heroItem.getChildByName('hero_photo');
            if (heroPhoto) {
                heroPhoto.setMovieClip();
            }
        }
    };

    proto.closeDialog = function () {
        if (this.isShowing) {
            this.isShowing = false;
            this.cleanCachedResource();
            this.closeChooseHeroDialog();
            this.container.removeChild(this.mc);
            this.mc = undefined;
            this.battleMask = undefined;
            this.cancelBtn = undefined;
            this.chooseHeroCancelBtn = undefined;
            this.chooseHeroLeftPageBtn = undefined;
            this.chooseHeroPageLabel = undefined;
            this.chooseHeroRightPageBtn = undefined;
            this.closeBtn = undefined;
            this.container = undefined;
            this.curTempLegionInfo = undefined;
            this.explainLabel = undefined;
            this.heroNumLabel = undefined;
            this.legionBackBtn = undefined;
            this.okBtn = undefined;
            this.leftPageBtn = undefined;
            this.rightPageBtn = undefined;
            global.configHelper.destorySkillConfig();
        }
    };

    proto._getLegionInMine = function () {
        var troops = global.dataCenter.data.troops;
        if (!troops) return;

        for (var key in troops) {
            if (troops[key].ismine) {
                return troops[key];
            }
        }
    };

    proto._getLegionByLocation = function (location) {
        var troops = global.dataCenter.data.troops;
        if (!troops) return;

        for (var key in troops) {
            if (troops[key].location == location) {
                return troops[key];
            }
        }
    };

    proto.retrateGarrision = function (ismine) {
        ismine = ismine || 0;
        var legion;
        if (ismine) {
            legion = this._getLegionInMine();
        }
        else {
            var location = global.isMyHome ? global.NetManager.uid : global.friendId;
            legion = this._getLegionByLocation(location);
        }
        if (global.BattleManager && global.battleWorld) {
            global.BattleManager.killBattle();
        }
        if (!legion) {
            return false;
        }
        global.NetManager.call("Hero", "retreat",
            {
                'ismine':ismine,
                'troopid':legion.troopid,
                'location':legion.location
            },
            function (data) {
                var dataobj = data["data"];
                global.controller.missionController.update(dataobj.mission);
                global.controller.dayMissionController.update(dataobj.mission_day);
                global.controller.playerStatusController.update(dataobj.player);
                global.controller.herosController.update(dataobj.heros);
                global.controller.singleTroopController.update(dataobj.troop);
                global.controller.buildingController.update(dataobj.build);
                var u = 0;
                if (dataobj["build"]) {
                    u = dataobj["build"]["u"];
                }

                //监狱的特殊处理，服务器发的总是自己的

                if (global.isMyHome) {
                    global.controller.jailController.update(dataobj.jail);
                } else if (global.friendId == u) {
                    //global.controller.visitInfoController.update(dataobj.visitinfo);
                }
                var ismine = dataobj["ismine"];
                if (ismine) {
                }
            },
            "军团撤军中");
    };


    /// 本不应该放这里的方法,只是挂在这里,借用单例光环
    proto.gotoGarrisionLayer = function (defaultTroopId) {
        defaultTroopId = defaultTroopId || 0;

        var defaultLegion = undefined;
        var troops = global.dataCenter.data.troops;
        if (troops) {
            defaultLegion = troops[defaultTroopId];
        }

        var ismine = false;
        if (defaultLegion && defaultLegion.ismine) {
            ismine = true;
        }

        var uilayer = global.battleWorld.getUILayer();
        if (!uilayer) return;

        var garrisionPanel = textureLoader.createMovieClip('battleUI', 'garrison_panel');
        garrisionPanel.x = 0;
        garrisionPanel.y = global.GAME_HEIGHT - garrisionPanel.getHeight();
        garrisionPanel.name = 'garrison_panel';
        uilayer.addChild(garrisionPanel);
        var editLegionBtn = garrisionPanel.getChildByName('compile_legion_btn');
        if (editLegionBtn) {
            editLegionBtn.setButton(true, function () {
                global.editFormationPanel.showDialog(undefined, uilayer, defaultTroopId);
            });
        }
        var garrisionBtn = garrisionPanel.getChildByName('garrison_btn');
        if (garrisionBtn) {
            garrisionBtn.setButton(true, function () {
                this._grass(ismine, defaultTroopId);
            }.bind(this));
        }
        var retreatBtn = garrisionPanel.getChildByName('retreat_btn');
        if (retreatBtn) {
            retreatBtn.setButton(true, function () {
                this.retrateGarrision(ismine);
            }.bind(this));
        }

        var myInfoPanel = garrisionPanel.getChildByName('battle_item_1');
        if (myInfoPanel) {
            var levelLabel = myInfoPanel.getChildByName('level_text');
            if (levelLabel) {
                levelLabel.setText(global.dataCenter.getLevel());
            }
            var nameLabel = myInfoPanel.getChildByName('name_text');
            if (nameLabel) {
                nameLabel.setText(global.NetManager.un);
            }
            var headPic = myInfoPanel.getChildByName('battle_photo');
            if (headPic) {
                headPic.setImage(global.NetManager.headpic);
            }
        }

        var musicSettingCtr = global.createMusicSettingCtr();
        if (musicSettingCtr && uilayer) {
            uilayer.addChild(musicSettingCtr.getDisplayObject());
        }

        if (defaultLegion) {
            global.configHelper.initSkillConfig(function () {
                global.battleWorld.currentLegionInfo = defaultLegion;
                var legionInfo = global.editFormationPanel.getLegionInfoWithTroop(defaultLegion);
                global.battleReportReader.setLegionData(legionInfo);
                global.BattleManager.loadAssets(function () {
                    global.battleWorld.createLegion(global.battleReportReader.getAttackLegionData());
                });
            });
        }
    };

    proto._grass = function (ismine, mineid, isassist) {
        var troops = global.dataCenter.data.troops;
        if (!troops) {
            global.BattleManager.killBattle();
            return;
        }

        ismine = ismine || 0;
        mineid = mineid || 0;
        isassist = isassist || 0;

        var legion = global.battleWorld ? global.battleWorld.currentLegionInfo : null;
        if (!legion) {
            if (isassist) {
                global.dialog("兵力为0时不能协防，点击撤军按钮将直接撤防");
            }
            else {
                global.dialog("兵力为0时不能驻守，点击撤军按钮将直接撤防");
            }
            return;
        }
        var heros = global.editFormationPanel.cacuTroopMount(legion);
        var heroids = [];
        var herosoldiers = [];
        var totalSoldierMount = 0;
        for (var index = 1; index <= 9; index++) {
            var heroid = global.editFormationPanel.getHeroIDAtPosOfLegion(legion, index);
            heroids.push(heroid);
            if (heroid == 0) {
                herosoldiers.push(0);
            } else {
                var hero = heros[heroid];
                var curSoldierNum = hero ? parseInt(hero.curSoldierNum) : 0;
                herosoldiers.push(curSoldierNum);
                totalSoldierMount += curSoldierNum;
            }
        }

        if (totalSoldierMount == 0) {
            if (isassist) {
                global.dialog("兵力为0时不能协防，点击撤军按钮将直接撤防");
            }
            else {
                global.dialog("兵力为0时不能驻守，点击撤军按钮将直接撤防");
            }
            return;
        }
        var location;
        if (ismine) {
            location = mineid;
        }
        else {
            if (global.isMyHome) {
                location = global.NetManager.uid;
            } else {
                location = global.friendId;
            }
        }
        global.NetManager.call("Hero", "edittroop",
            {
                'isassist':isassist,
                'ismine':ismine,
                'troopid':legion.troopid,
                'heroflag':0,
                'heroid':heroids,
                'herosolder':herosoldiers,
                'location':location,
                'soldier':totalSoldierMount
            },
            this._onNetSetGarrisionLegion.bind(this),
            "军团驻守中");
    };

    proto._onNetSetGarrisionLegion = function (data) {
        global.BattleManager.killBattle();
        var dataobj = data["data"];
        global.controller.missionController.update(dataobj.mission);
        global.controller.dayMissionController.update(dataobj.mission_day);
        global.controller.playerStatusController.update(dataobj.player);
        global.controller.herosController.update(dataobj.heros);
        global.controller.troopsController.update(dataobj.troops);
        global.controller.buildingController.update(dataobj.build);
        //update visit occupy info, haven't implement
        //
    };

    global.editFormationPanel = new EditFormationPanel();
})();
