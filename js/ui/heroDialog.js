/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-5
 * Time: 下午1:27
 *
 */

(function () {

    var proto = HeroDialog.prototype;

    var _width = 734;
    var _height = 545;
    var _curHeroPage = 0;
    var _curCategory = 1;
    var _curChooseItemIndex = 0;
    var _HeroPhotoCount = 9;
    var _less = 0.92;
    var _high = 1.02;
    var _curChooseHero = undefined;
    var _curPage = 0;
    var _chooseHeroDirty = true;
    var _curWeaponPage = 0;
    var _curArmorPage = 0;
    var _weaponItemCount = 3;
    var _armorItemCount = 3;
    /// 上面英雄类型切换的五个按钮的名字,其索引+1便是英雄类型的常量值
    var _topBtns = [
        'icon_footman_btn_',
        'icon_spearman_btn_',
        'icon_cavalry_btn_',
        'icon_archer_btn_',
        'icon_magic_btn_'
    ];

    function HeroDialog() {
        this.isShowing = false;
    }

    proto._bindTopBtnEvent = function () {
        var self = this;
        for (var i = 0; i < _topBtns.length; ++i) {
            var topBtn = this.mc.getChildByName(_topBtns[i] + '1');
            topBtn.addEventListener(Event.MOUSE_CLICK, function (category) {
                return function () {
                    self._changeToHeroType(category);
                };
            }(i + 1));
        }
    };

    proto._bindChooseHeroEvent = function () {
        var self = this;
        for (var i = 0; i < _HeroPhotoCount; ++i) {
            var heroItem = this.mc.getChildByName('heros_item_' + (i + 1));
            heroItem.addEventListener(Event.MOUSE_CLICK, function (index) {
                return function (e) {
                    self._chooseHero(index);
                    e.stopPropagation();
                };
            }(i));
        }
    };

    proto._wearWeapon = function (data) {
        global.controller.singleHeroController.update(data.data.hero);
        if (data.data.hero) _curChooseHero = data.data.hero;

        global.dataCenter.addItem(data.data.itemtype, data.data.itemid, -1);

        if (data.data.takeoffitemtype > 0) {
            global.dataCenter.addItem(data.data.takeoffitemtype, data.data.takeoffitemid, 1);
        }
        this._updateHeroData(data.data.hero);
        this._changePage(_curPage, true);
        this._updatePanelWithHeroInfo(data.data.hero);
        global.controller.playerStatusController.update(data.data.player);
        global.controller.missionController.update(data.data.mission);
    };

    proto._bindChooseWeaponEvent = function () {
        var self = this;
        for (var i = 1; i <= 3; ++i) {
            var weaponItem = this.mc.getChildByName('hero_weapon_item_' + i);
            weaponItem.setIsSwallowTouch(true);
            weaponItem.addEventListener(Event.MOUSE_CLICK, function (index) {
                return function (e) {
                    var item = self.mc.getChildByName('hero_weapon_item_' + index);
                    var weapon = item.itemInfo;
                    if (weapon)
                        self._showEquipmentPanel(weapon.type, weapon.id, false, item);
                };
            }(i));
        }
    };

    proto._wearEquipment = function (type, id) {
        var self = this;
        if (!_curChooseHero) {
            this._closeEquipmentPanel();
            return;
        }
        var itemInfo = global.ItemFunction.getItemInfo(type, id);
        if (!itemInfo) {
            this._closeEquipmentPanel();
            return;
        }

        if (_curChooseHero.herolevel < itemInfo.limitlevel) {
            this._closeEquipmentPanel();
            global.dialog('英雄等级不足');
            return;
        }

        if (type == global.ItemFunction.ITEM_TYPE_WEAPON) {
            if (+_curChooseHero.weapontype != +itemInfo.type ||
                +_curChooseHero.weaponid != +itemInfo.id) {
                global.NetManager.call("Hero", "wear",
                    {"itemid":itemInfo.id, "itemtype":itemInfo.type, "heroid":_curChooseHero.heroid, "isweapon":1},
                    function (data) {
                        self._wearWeapon(data);
                    },
                    "英雄装备中"
                );
            }
        } else if (type == global.ItemFunction.ITEM_TYPE_ARMOR) {
            if (+_curChooseHero.armortype != +itemInfo.type ||
                +_curChooseHero.armorid != +itemInfo.id) {
                global.NetManager.call("Hero", "wear",
                    {"itemid":itemInfo.id, "itemtype":itemInfo.type, "heroid":_curChooseHero.heroid, "isweapon":0},
                    function (data) {
                        self._wearArmor(data);
                    },
                    "英雄装备中"
                );
            }
        }
        this._closeEquipmentPanel();
    }

    proto._closeEquipmentPanel = function () {
        if (this.equipmentPanel) {
            this.equipmentPanel.removeFromParent();
            this.equipmentPanel = undefined;
        }
    }

    proto._showEquipmentPanel = function (type, id, isTakeOff, itemCtr) {
        if (!_curChooseHero) return;
        var isWeapon = false;
        if (type == global.ItemFunction.ITEM_TYPE_WEAPON) {
            isWeapon = true;
        } else if (type == global.ItemFunction.ITEM_TYPE_ARMOR) {
            isWeapon = false;
        } else {
            return;
        }

        var itemInfo = global.ItemFunction.getItemInfo(type, id);
        if (!itemInfo) return;
        if (!this.equipmentPanel) {
            this.equipmentPanel = textureLoader.createMovieClip('window_pub', 'hero_tips');
            this.mc.addChild(this.equipmentPanel);
        }
        var pos = {};
        if (itemCtr) {
            pos.x = itemCtr.x + 50;
            pos.y = itemCtr.y + 50;
        }
        else {
            pos.x = 0.5 * (global.GAME_WIDTH - this.mc.getWidth());
            pos.y = 0.5 * (global.GAME_HEIGHT - this.mc.getHeight());
        }
        this.equipmentPanel.x = pos.x;
        this.equipmentPanel.y = pos.y;
        var equipmentNameLabel = this.equipmentPanel.getChildByName('heros_name_text');
        equipmentNameLabel.setText(itemInfo.name);
        equipmentNameLabel.setColor(itemInfo.color.replace('0x', '#'));
        var equipmentStateNameLabel = this.equipmentPanel.getChildByName('hero_level_text');
        if (isWeapon) {
            equipmentStateNameLabel.setText('攻击');
        } else {
            equipmentStateNameLabel.setText('防御');
        }
        var equipmentStateLabel = this.equipmentPanel.getChildByName('hero_soldier_text');
        equipmentStateLabel.setText(itemInfo.effect['@attributes'].value);
        var equipmentLevelLabel = this.equipmentPanel.getChildByName('hero_state_text');
        equipmentLevelLabel.setText('等级');
        var equipmentLimitLevelLabel = this.equipmentPanel.getChildByName('hero_skill_text');
        equipmentLimitLevelLabel.setText(itemInfo.limitlevel);
        var bg = this.equipmentPanel.getChildByName('Tips_bg3');
        var wearBtn = bg.getChildByName('Quit_btn1');
        var takeoffBtn = bg.getChildByName('quit_btn2');
        wearBtn.visible = !isTakeOff;
        takeoffBtn.visible = !!isTakeOff;

        wearBtn.setButton(true, function () {
            this._wearEquipment(itemInfo.type, itemInfo.id);
        }.bind(this));

        takeoffBtn.setButton(true, function () {
            this._takeoffEquipment(itemInfo.type, itemInfo.id);
        }.bind(this));

        if (+itemInfo.limitlevel > +_curChooseHero.herolevel) {
            equipmentLimitLevelLabel.setColor(global.Color.RED);
            //wearBtn.setIsEnabled(false);
        } else {
            equipmentLimitLevelLabel.setColor(global.Color.GREEN);
        }
    };

    proto._takeoffEquipment = function (type, id) {
        if (!_curChooseHero) {
            this._closeEquipmentPanel();
            return;
        }
        var itemInfo = global.ItemFunction.getItemInfo(type, id);
        if (!itemInfo) {
            this._closeEquipmentPanel();
            return;
        }
        var self = this;
        if (type == global.ItemFunction.ITEM_TYPE_WEAPON) {
            global.NetManager.call("Hero", "takeoff",
                {"isweapon":1, "itemid":itemInfo.id, "itemtype":itemInfo.type, "heroid":_curChooseHero.heroid},
                self._takeoffItem.bind(self),
                "脱下装备中"
            );
        } else if (type == global.ItemFunction.ITEM_TYPE_ARMOR) {
            global.NetManager.call("Hero", "takeoff",
                {"isweapon":0, "itemid":itemInfo.id, "itemtype":itemInfo.type, "heroid":_curChooseHero.heroid},
                self._takeoffItem.bind(self),
                "脱下装备中"
            );
        }
        this._closeEquipmentPanel();
    }

    proto._wearArmor = function (data) {
        this._wearWeapon(data);
    };

    proto._bindChooseArmorEvent = function () {
        var self = this;
        for (var i = 1; i <= 3; ++i) {
            var armorItem = this.mc.getChildByName('hero_armor_item_' + i);
            armorItem.setIsSwallowTouch(true);
            armorItem.addEventListener(Event.MOUSE_CLICK, function (index) {
                return function (e) {
                    var item = self.mc.getChildByName('hero_armor_item_' + index);
                    var armor = item.itemInfo;
                    self._showEquipmentPanel(armor.type, armor.id, false, item);

                };
            }(i));
        }
    };

    proto._fireHero = function (data) {
        var firedHero = data.data.hero;
        var oldHeros = global.dataCenter.data.heros;
        for (var key in oldHeros) {
            if (firedHero.heroid == oldHeros[key].heroid) {
                delete oldHeros[key];
                break;
            }
        }

        this._changeToHeroType(_curCategory, true);
        this._changePage(_curPage, true);
        var newChooseIndex = _curChooseItemIndex;
        var bFind = false;
        for (var i = newChooseIndex; i >= 0; --i) {
            var heroItem = this.mc.getChildByName('heros_item_' + (i + 1));
            if (heroItem.heroInfo) {
                newChooseIndex = i;
                bFind = true;
                break;
            }
        }
        if (bFind) {
            this._chooseHero(newChooseIndex);
        }
        else {
            this._chooseHero(0);
        }
    };

    proto._takeoffItem = function (data) {
        var hero = data.data.hero;
        global.controller.singleHeroController.update(hero);
        if (hero) _curChooseHero = hero;
        global.dataCenter.addItem(data.data.itemtype, data.data.itemid, 1);
        this._updatePanelWithHeroInfo(hero);
        this._updateHeroData(data.data.hero);
        this._changePage(_curPage, true);
        global.controller.playerStatusController.update(data.data.player);
        global.controller.missionController.update(data.data.player);
    };

    proto._bindTakeoffArmorEvent = function () {
        var self = this;
        this.mc.getChildByPath('hero_equip_armor/super_star').visible = false;
        this.mc.getChildByName('hero_equip_armor').setIsSwallowTouch(true);
        this.mc.getChildByName('hero_equip_armor').addEventListener(Event.MOUSE_CLICK, function () {
            var item = self.mc.getChildByName('hero_equip_armor');
            item.getChildByName('super_star').visible = false;
            if (item.itemInfo && _curChooseHero) {
                self._showEquipmentPanel(item.itemInfo.type, item.itemInfo.id, true, item);
            }
        });
    };

    proto._bindTakeoffWeaponEvent = function () {
        var self = this;
        this.mc.getChildByPath('hero_equip_weapon/super_star').visible = false;
        this.mc.getChildByName('hero_equip_weapon').setIsSwallowTouch(true);
        this.mc.setUseAlphaTest(true);
        this.mc.getChildByName('hero_equip_weapon').addEventListener(Event.MOUSE_CLICK, function () {
            var item = self.mc.getChildByName('hero_equip_weapon');

            if (item.itemInfo && _curChooseHero) {
                self._showEquipmentPanel(item.itemInfo.type, item.itemInfo.id, true, item);
            }
        });
    };

    var bottomPanelNames = [
        'soldier_panel',
        'skill_panel',
        'specialty_panel'
    ];

    proto._showBottomTab = function (tabIndex) {
        var index = tabIndex - 1;
        if (index < 0 || index >= bottomPanelNames.length) return;
        for (var i = 0; i < bottomPanelNames.length; ++i) {
            if (i == index) {
                this.mc.getChildByName(bottomPanelNames[i]).visible = true;
            } else {
                this.mc.getChildByName(bottomPanelNames[i]).visible = false;
            }
        }
    };

    proto._initBottomTab = function () {
        var self = this;
        var soldierPanel = this.mc.getChildByName('soldier_panel');
        var skillPanel = this.mc.getChildByName('skill_panel');
        var specialty_panel = this.mc.getChildByName('specialty_panel');

        skillPanel.visible = false;
        specialty_panel.visible = false;

        for (var i = 0; i < bottomPanelNames.length; ++i) {
            var tab = this.mc.getChildByName(bottomPanelNames[i]);
            tab.setUseAlphaTest(true);
            for (var j = 0; j < bottomPanelNames.length; ++j) {
                if (i != j) {
                    tab.getChildByName('btn_bg_' + (j + 1)).addEventListener(Event.MOUSE_CLICK, function (index) {
                        return function () {
                            self._showBottomTab(index);
                        }
                    }(j + 1));
                }
            }
        }
    };

    proto.cleanCachedResource = function () {
        var bg = this.mc.getChildByName('bg');
        bg.setMovieClip();
        for (var i = 0; i < _HeroPhotoCount; ++i) {
            var heroItem = this.mc.getChildByName('heros_item_' + (i + 1));
            var photo = heroItem.getChildByName('photo');
            photo.setMovieClip();
        }
        this.mc.getChildByName('hero_equip_weapon').setImage(null);
        this.mc.getChildByName('hero_equip_armor').setImage(null);
        this._cleanArmorList();
        this._cleanWeaponList();
        var specialty_panel = this.mc.getChildByName(bottomPanelNames[2]);
        var troop_panel = this.mc.getChildByName(bottomPanelNames[0]);
        for (var i = 0; i < 5; ++i) {
            var name = "soldier_photo_" + ( i + 1 );
            specialty_panel.getChildByName(name).setImage();

            var bg = troop_panel.getChildByName('bg_item_' + (i+1));
            bg.setImage();
        }
        var skillPanel = this.mc.getChildByName(bottomPanelNames[1]);
        var skillobj = skillPanel.getChildByName("heros_skill_item_1");
        var bg = skillobj.getChildByName("heros_skill");
        bg.setImage();
    };

    proto.closeDialog = function () {
        if (this.isShowing) {
            this.isShowing = false;
            this.cleanCachedResource();
            global.attrChangePanel.closeDialog();
            global.windowManager.removeChild(this.mc);
            this.mc = undefined;
            global.configHelper.destorySkillConfig();
            this._closeEquipmentPanel();
        }
        Event.enableDrag = true;
    };

    proto.bindDismissalBtn = function () {
        var self = this;
        this.mc.getChildByName('dismissal_btn').setButton(true, function (e) {
            if (_curChooseHero) {
                if (_curChooseHero.weapontype != 0 || _curChooseHero.armortype != 0) {
                    global.dialog("您不能解雇穿戴装备的英雄");
                }
                else if (_curChooseHero.status != global.heroConfigHelper.IDLE_HERO || _curChooseHero.trainingtype != 0) {
                    global.dialog("驻守/占领/训练中的英雄无法被解雇");
                }
                else {
                    global.dialog("您确认要解雇" + _curChooseHero.herolevel + "级的" + _curChooseHero.heroname,
                        {
                            type:global.dialog.DIALOG_TYPE_CONFIRM,
                            closeDelay:0,
                            okFunc:function () {
                                global.NetManager.call("Hero", "fire", {"heroid":_curChooseHero.heroid}, self._fireHero.bind(self), "解雇英雄中");
                            },
                            cancelFunc:function () {
                            }
                        }
                    );
                }
            }
        });
    };

    proto._bindWeaponChangePageEvent = function () {
        var self = this;

        this.mc.getChildByName('weapon_left_btn').setButton(true, function () {
            self._changeWeaponPage(_curWeaponPage - 1);
        });
        this.mc.getChildByName('weapon_right_btn').setButton(true, function () {
            self._changeWeaponPage(_curWeaponPage + 1);
        });
    };

    proto._bindArmorChangePageEvent = function () {
        var self = this;
        this.mc.getChildByName('armor_left_btn').setButton(true, function () {
            self._changeArmorPage(_curArmorPage - 1);
        });
        this.mc.getChildByName('armor_right_btn').setButton(true, function () {
            self._changeArmorPage(_curArmorPage + 1);
        });
    };

    proto._bindLevelUpSkillEvent = function () {
        var self = this;
        this.mc.getChildByPath('skill_panel/heros_skill_item_1/skill_levelup_btn').setButton(true, function () {
            self._levelUpHeroSkill();
        });
    };

    proto._bindSoldierEvent = function () {
        var soldierPanel = this.mc.getChildByName(bottomPanelNames[0]);
        var leftBtn = soldierPanel.getChildByName('left_btn');
        var rightBtn = soldierPanel.getChildByName('right_btn');
        leftBtn.setButton(true);
        leftBtn.setIsEnabled(false);
        rightBtn.setButton(true);
        rightBtn.setIsEnabled(false);
        var self = this;
        for (var i = 1; i <= 5; ++i) {
            var changeSoldierBtn = soldierPanel.getChildByPath('heros_soldier_item_' + i + '/heros_change_soldier_btn');
            changeSoldierBtn.setButton(true, function (index) {
                return function () {
                    self._changeRoleClick(index)
                };
            }(i - 1));
        }
    };

    proto.showDialog = function () {
        if (!this.isShowing) {
            var self = this;
            this.isShowing = true;

            global.configHelper.initSkillConfig(function () {
                this.mc = textureLoader.createMovieClip('window_pub', 'heros_list_panel');
                this.mc.setIsSwallowTouch(true);
                this.mc.x = (global.GAME_WIDTH - _width) * 0.5;
                this.mc.y = (global.GAME_HEIGHT - _height) * 0.5;
                this.mc.stopAtHead(true);
                global.windowManager.addChild(this.mc);
                this._cleanArmorList();
                this._cleanWeaponList();
                this.mc.getChildByName('arrow_up_btn').visible = false;
                this.mc.getChildByName('rebirth_photo').visible = false;
                this.mc.getChildByName('gradeup_photo').visible = false;
                this._initBottomTab();
                this._bindTopBtnEvent();
                this._bindChooseHeroEvent();
                this._bindChooseWeaponEvent();
                this._bindChooseArmorEvent();
                this._bindTakeoffArmorEvent();
                this._bindTakeoffWeaponEvent();

                this.bindDismissalBtn();
                this._bindChangePageEvent();
                this._bindWeaponChangePageEvent();
                this._bindArmorChangePageEvent();
                this._bindLevelUpSkillEvent();
                this._bindSoldierEvent();
                this._changeToHeroType(_curCategory, true);
                this._changePage(_curPage, true);
                this._chooseHero(0, true);

                this.mc.getChildByName('attr_change_btn').setButton(true, function (e) {
                    self._showAttrChangePanel();
                });
                this.mc.getChildByName('closeIcon').setButton(true, this.closeDialog.bind(this));
                this.mc.setOnClick(this._closeEquipmentPanel.bind(this));
            }.bind(this));
        }
    };

    proto._showAttrChangePanel = function () {
        if (!_curChooseHero) {
            global.dialog("未选择英雄，无法提升能力！");
            return;
        }
        var self = this;
        var onAttrChangeClose = function () {
            self.heroInfo = global.attrChangePanel.heroInfo;
            self._updatePanelWithHeroInfo(self.heroInfo);
        };
        global.attrChangePanel.showDialog(_curChooseHero, onAttrChangeClose);
    };


    function compareHero(hero1, hero2) {
        var total1 = hero1.attack + hero1.defense + hero1.luck;
        var total2 = hero2.attack + hero2.defense + hero2.luck;

        if (total1 < total2) {
            return 1;
        }
        else
        if (total1 > total2) {
            return -1;
        }
        else {
            return 0;
        }
    }

    proto._updatePanelWithHeroInfo = function (heroInfo, bClean) {
        if (this.isShowing && heroInfo) {
            _curChooseHero = heroInfo;
            var bg = this.mc.getChildByName('bg');
            bg.setMovieClip(null);
            bg.setMovieClip('hero', 'hero' + heroInfo.image);

            var nameText = this.mc.getChildByName('heros_name_text');
            this.mc.removeChild(this.superstarBehindName);
            this.superstarBehindName = null;
            if (heroInfo.herotype != 0) {
                var superstar = textureLoader.createMovieClip('window_pub', 'superHero_star');
                superstar.x = nameText.x - 16;
                superstar.y = nameText.y - 16;
                this.mc.addChild(superstar);
                this.superstarBehindName = superstar;
            }

            var color = global.heroConfigHelper.getColor(heroInfo);
            this.mc.getChildByName('herosLevelText2').setText(heroInfo.herolevel).setColor(color);
            if (heroInfo.herohidelevel) {
                this.mc.getChildByName('herosLevelText3').setText('(+' + heroInfo.herohidelevel + ')').setColor(color);
            } else {
                this.mc.getChildByName('herosLevelText3').setText('');
            }

            nameText.setText(heroInfo.heroname).setColor(color);
            var levelUpNeedExp = global.heroConfigHelper.getExpOfLevel(heroInfo.herolevel);
            this.mc.getChildByName('exp_progress').scaleX = +heroInfo.exp / +levelUpNeedExp;
            this.mc.getChildByName('text').setText(heroInfo.exp + '/' + levelUpNeedExp);
            this.mc.getChildByName('hero_grade_icon').gotoAndStop(global.heroConfigHelper.getGradeLevel(heroInfo.grade));
            var oHeroAttr_G;
            var oHeroAttr_S;
            var arrHeroGrade;
            oHeroAttr_G = {D:54, C:66, B:81, A:93, S:108, SS:118};//普通英雄升阶数值
            oHeroAttr_S = {D:77, C:89, B:102, A:114, S:127, SS:137};//超级英雄升阶数值
            arrHeroGrade = ["D", "C", "B", "A", "S", "SS"];//英雄品阶数组

            var iGradeupAtk = heroInfo.attack + heroInfo.herohidelevel;//英雄基础攻击+转生加值
            var iGradeupDef = heroInfo.defense + heroInfo.herohidelevel;//英雄基础防御+转生加值
            var iGradeup = iGradeupAtk < iGradeupDef ? iGradeupAtk : iGradeupDef;
            var sGrade;
            var iGradeupAttr;
            if (0 == heroInfo.herotype) {//判断是否为超级英雄
                if (iGradeup >= oHeroAttr_G[arrHeroGrade[arrHeroGrade.length - 1]])//攻防中小值与最高品级值比较
                {
                    sGrade = arrHeroGrade[arrHeroGrade.length - 1];
                    iGradeupAttr = oHeroAttr_G[arrHeroGrade[arrHeroGrade.length - 1]];
                }
                else {
                    for (var i = arrHeroGrade.length - 1; i > 0; --i) //再反向比较
                    {
                        if (iGradeup < oHeroAttr_G[arrHeroGrade[i]]) {
                            sGrade = arrHeroGrade[i];
                            iGradeupAttr = oHeroAttr_G[arrHeroGrade[i]];
                        }
                        if (iGradeup < oHeroAttr_G[arrHeroGrade[i]] && iGradeup >= oHeroAttr_G[arrHeroGrade[i - 1]]) {
                            sGrade = arrHeroGrade[i - 1];
                            iGradeupAttr = oHeroAttr_G[arrHeroGrade[i - 1]];
                        }
                    }
                }
            } else {
                if (iGradeup >= oHeroAttr_S[arrHeroGrade[arrHeroGrade.length - 1]]) {
                    sGrade = arrHeroGrade[arrHeroGrade.length - 1];
                    iGradeupAttr = oHeroAttr_S[arrHeroGrade[arrHeroGrade.length - 1]];
                }
                else {
                    for (var i = arrHeroGrade.length - 1; i > 0; --i) {
                        if (iGradeup < oHeroAttr_S[arrHeroGrade[i]]) {
                            sGrade = arrHeroGrade[i];
                            iGradeupAttr = oHeroAttr_S[arrHeroGrade[i]];
                        }
                        if (iGradeup < oHeroAttr_S[arrHeroGrade[i]] && iGradeup >= oHeroAttr_S[arrHeroGrade[i - 1]]) {
                            sGrade = arrHeroGrade[i - 1];
                            iGradeupAttr = oHeroAttr_S[arrHeroGrade[i - 1]];
                        }
                    }
                }
            }

            if (heroInfo.grade == "SS") {
                sGrade = "SS";
            }

            for (var i = 0; i < arrHeroGrade.length; i++) {
                if (heroInfo.grade == arrHeroGrade[i]) {
                    for (var j = 0; j < arrHeroGrade.length; j++) {
                        if (sGrade == arrHeroGrade[j]) {
                            if (i >= j) {
                                if ((i + 1) <= arrHeroGrade.length) {
                                    sGrade = arrHeroGrade[i + 1];
                                }
                            }
                        }
                    }
                }
            }

            var tarvenlevel = global.dataCenter.getBuildLevel(global.BuildType.Tavern);//当前酒馆等级
            //酒馆等级判断
            for (var i = arrHeroGrade.length - 1; i > 0; i--) {
                if (tarvenlevel < global.heroConfigHelper.getHeroTarvenlevel(sGrade) && sGrade == arrHeroGrade[i]) {
                    if (heroInfo.grade != arrHeroGrade[i - 1]) {
                        sGrade = arrHeroGrade[i - 1];
                    }
                }
            }

            if (heroInfo.herotype == 0)//判断是否为超级英雄
            {
                iGradeupAttr = oHeroAttr_G[sGrade];
            }
            else {
                iGradeupAttr = oHeroAttr_S[sGrade];
            }
            var bGradeupOK;
            //判断是否可以升阶
            if (heroInfo.grade != sGrade && iGradeup >= iGradeupAttr && heroInfo.grade != "SS" && tarvenlevel >= global.heroConfigHelper.getHeroTarvenlevel(sGrade) && global.heroConfigHelper.getHeroTarvenlevel(sGrade) != 0) {
                bGradeupOK = true;
            }
            else {
                bGradeupOK = false;
            }
            var iChange = 3;
            var gradeUpPhoto = this.mc.getChildByName('gradeup_photo');
            if (gradeUpPhoto) {
                if (heroInfo.grade != "SS" && global.dataCenter.getLevel() >= 28 && bGradeupOK) {
                    gradeUpPhoto.gotoAndPlay(1);
                    gradeUpPhoto.visible = true;
                    iChange = 3;//默认切换升品阶界面
                }
                else {
                    gradeUpPhoto.gotoAndStop(1);
                    gradeUpPhoto.visible = false;
                }
            }
            var rebirthPhoto = this.mc.getChildByName('rebirth_photo');
            if (rebirthPhoto) {
                if (heroInfo.reborntime != 0 && heroInfo.herolevel >= heroInfo.rebornlevel) {
                    rebirthPhoto.gotoAndPlay(1);
                    rebirthPhoto.visible = true;
                }
                else if (heroInfo.reborntime == 0 && heroInfo.herolevel >= 25) {
                    rebirthPhoto.gotoAndPlay(1);
                    rebirthPhoto.visible = true;
                }
                else {
                    rebirthPhoto.gotoAndStop(1);
                    rebirthPhoto.visible = false;
                }
            }

            var average = global.getHeroAvarate(heroInfo.grade).value;

            var attackText = this.mc.getChildByName('attackText');
            var weaponText = this.mc.getChildByName('weaponText');
            var luckyText = this.mc.getChildByName('luckyText');
            var soldiersText = this.mc.getChildByName('soldier_total_text');
            attackText.setText(heroInfo.attack + heroInfo.itemattack + heroInfo.herohidelevel);
            this._setColorByAttr(attackText, average, heroInfo.attack + heroInfo.herohidelevel);
            weaponText.setText(heroInfo.defense + heroInfo.itemdefense + heroInfo.herohidelevel);
            this._setColorByAttr(weaponText, average, heroInfo.defense + heroInfo.herohidelevel);
            luckyText.setText(heroInfo.luck);
            this._setColorByAttr(luckyText, average, heroInfo.luck);
            soldiersText.setText(global.heroConfigHelper.getSoldiersOfLevel(heroInfo.herolevel));

            this.mc.getChildByName('hero_equip_weapon').setImage(null);
            this.mc.getChildByName('hero_equip_weapon').itemInfo = null;
            this.mc.getChildByName('weapon_text').setText('');
            this.mc.getChildByPath('hero_equip_weapon/super_star').visible = false;
            if (heroInfo.weapontype != 0) {
                var weaponInfo = global.ItemFunction.getItemInfo(heroInfo.weapontype, heroInfo.weaponid);
                if (weaponInfo) {
                    this.mc.getChildByName('hero_equip_weapon').setImage(global.ItemFunction.IconDir + weaponInfo.tinyicon + '.png');
                    this.mc.getChildByName('weapon_text').setText('Lv' + weaponInfo.limitlevel).setColor(weaponInfo.color.replace('0x', '#'));
                    this.mc.getChildByPath('hero_equip_weapon/super_star').visible = weaponInfo.israre;
                    this.mc.getChildByPath('hero_equip_weapon/super_star').play();
                    this.mc.getChildByName('hero_equip_weapon').itemInfo = weaponInfo;
                }
            }

            this.mc.getChildByName('hero_equip_armor').setImage(null);
            this.mc.getChildByName('armor_text').setText('');
            this.mc.getChildByName('hero_equip_armor').itemInfo = null;
            this.mc.getChildByPath('hero_equip_armor/super_star').visible = false;
            if (heroInfo.armortype != 0) {
                var armorInfo = global.ItemFunction.getItemInfo(heroInfo.armortype, heroInfo.armorid);
                if (armorInfo) {
                    this.mc.getChildByName('hero_equip_armor').setImage(global.ItemFunction.IconDir + armorInfo.tinyicon + '.png');
                    this.mc.getChildByName('armor_text').setText('Lv' + armorInfo.limitlevel).setColor(armorInfo.color.replace('0x', '#'));
                    this.mc.getChildByPath('hero_equip_armor/super_star').visible = armorInfo.israre;
                    this.mc.getChildByPath('hero_equip_armor/super_star').play();
                    this.mc.getChildByName('hero_equip_armor').itemInfo = armorInfo;
                }
            }

            this._updateWeaponList(heroInfo);
            this._updateArmorList(heroInfo);
            this._updateSkill(heroInfo);
            this._updateSpecialty(heroInfo);
            this._updateTroop(heroInfo);
        }
        else if (bClean) {
            var bg = this.mc.getChildByName('bg');
            bg.setMovieClip();
            this.mc.getChildByName('herosLevelText2').setText(heroInfo.herolevel).setColor(color);
            this.mc.getChildByName('herosLevelText3').setText(heroInfo.herolevel + heroInfo.herohidelevel);
            this.mc.getChildByName('heros_name_text').setText(heroInfo.heroname).setColor(color);
            this.mc.getChildByName('exp_progress').scaleX = 0;
            this.mc.getChildByName('text').setText('');
            this.mc.getChildByName('gradeup_photo').visible = false;
            this.mc.getChildByName('rebirth_photo').visible = false;
            this.mc.getChildByName('attackText').setText('');
            this.mc.getChildByName('weaponText').setText('');
            this.mc.getChildByName('luckyText').setText('');
            this.mc.getChildByName('soldier_total_text').setText('');
            this.mc.getChildByName('hero_equip_weapon').setImage(null);
            this.mc.getChildByName('hero_equip_weapon').itemInfo = null;
            this.mc.getChildByName('weapon_text').setText('');

            this.mc.getChildByName('hero_equip_armor').setImage(null);
            this.mc.getChildByName('armor_text').setText('');
            this.mc.getChildByName('hero_equip_armor').itemInfo = null;
            this._cleanWeaponList();
            this._cleanArmorList();
            _curChooseHero = null;
        }
    };

    proto._chooseHero = function (index, bForce) {
        if (!_chooseHeroDirty && !bForce && _curChooseItemIndex == index) return;
        var oldItem = this.mc.getChildByName('heros_item_' + (_curChooseItemIndex + 1));
        if (oldItem)
            oldItem.getChildByName('bg').gotoAndStop(1);
        _chooseHeroDirty = false;
        _curChooseItemIndex = index;
        var heroItem = this.mc.getChildByName('heros_item_' + (index + 1));
        heroItem.getChildByName('bg').gotoAndStop(2);
        var heroInfo = heroItem.heroInfo;
        this._updatePanelWithHeroInfo(heroInfo);
    };

    proto._setColorByAttr = function (text, attr, value) {
        if (this.isShowing) {
            var less = attr * _less;
            var high = attr * _high;
            var arrow = text.arrow;
            text.parent.removeChild(arrow);
            text.arrow = null;
            if (value < less) {
                text.setColor(global.Color.GREEN);
                text.arrow = textureLoader.createMovieClip('window_pub', 'tavern_excite_down_arrow');
                text.arrow.x = text.x + 28;
                text.arrow.y = text.y;
                text.parent.addChild(text.arrow);
            } else if (value > high) {
                text.setColor(global.Color.RED);
                text.arrow = textureLoader.createMovieClip('window_pub', 'tavern_excite_up_arrow');
                text.arrow.x = text.x + 28;
                text.arrow.y = text.y;
                text.parent.addChild(text.arrow);
            } else {
                text.setColor(global.Color.WHITE);
            }
        }
    };

    proto._getTotalPage = function () {
        return (((this.heros.length - 1) / _HeroPhotoCount) | 0) + 1;
    };

    proto._getHeroLeftPageBtn = function () {
        return this.mc.getChildByName('hero_left_btn1');
    };

    proto._getHeroRightPageBtn = function () {
        return this.mc.getChildByName('hero_right_btn');
    };

    proto._updatePageBtn = function () {
        if (0 == _curPage)
            this._getHeroLeftPageBtn().setIsEnabled(false);
        else
            this._getHeroLeftPageBtn().setIsEnabled(true);

        if (this.heros.length <= (_curPage + 1) * _HeroPhotoCount)
            this._getHeroRightPageBtn().setIsEnabled(false);
        else
            this._getHeroRightPageBtn().setIsEnabled(true);
    };

    proto._bindChangePageEvent = function () {
        var self = this;

        this._getHeroLeftPageBtn().setButton(true, function () {
            self._changePage(_curPage - 1);
        });

        this._getHeroRightPageBtn().setButton(true, function () {
            self._changePage(_curPage + 1);
        });
    };

    proto._changePage = function (page, bForce) {
        if (!bForce && _curPage == page) return;

        var totolPagesCount = this._getTotalPage();
        if (page < 0 || page >= totolPagesCount) return;
        _chooseHeroDirty = true;
        _curPage = page;
        var self = this;
        var startIndex = _curPage * _HeroPhotoCount;
        for (var i = 0; i < _HeroPhotoCount; ++i) {
            var heroItem = this.mc.getChildByName('heros_item_' + (i + 1));
            heroItem.heroInfo = undefined;

            var levelText = heroItem.getChildByName('herosLevelText1');
            var stateText = heroItem.getChildByName('herosStateText');
            var photo = heroItem.getChildByName('photo');
            photo.setMovieClip(null);
            var hero = this.heros[startIndex + i];
            if (hero) {
                var color = global.heroConfigHelper.getColor(hero);
                stateText.setText(global.heroConfigHelper.getDescOfHeroStatus(hero)).setColor(color);
                levelText.setText(hero.herolevel).setColor(color);
                heroItem.heroInfo = hero;
                photo.setMovieClip('hero', 'hero' + hero.image, function (index) {
                    return function (heroPhoto) {
                        heroPhoto.scaleX = 57 / 170;
                        heroPhoto.scaleY = 57 / 170;
                        var hero = self.heros[startIndex + index];
                        if (hero && hero.herotype != 0) {
                            var superstar = textureLoader.createMovieClip('window_pub', 'superHero_star');
                            superstar.x = -5;
                            superstar.y = -5;
                            superstar.scaleX = 170 / 57;
                            superstar.scaleY = 170 / 57;
                            heroPhoto.addChild(superstar);
                        }

                    };
                }(i));
            } else {
                stateText.setText('');
                levelText.setText('');
            }
        }

        this._updatePageBtn();
        this.mc.getChildByName('herosPageText').setText((_curPage + 1) + '/' + totolPagesCount);
        ///翻页时更新选择英雄时变色的底框
        var oldItem = this.mc.getChildByName('heros_item_' + (_curChooseItemIndex + 1));
        if (oldItem) {
            if (_curChooseHero && _curChooseHero == oldItem.heroInfo) {
                oldItem.getChildByName('bg').gotoAndStop(2);
            } else {
                oldItem.getChildByName('bg').gotoAndStop(1);
            }
        }

    };

    proto._getHeroData = function () {
        this.heros = [];
        var allHeros = global.dataCenter.data.heros;
        for (var key in allHeros) {
            if ((allHeros[key].corpstype / 1000 | 0) == _curCategory && allHeros[key].status != 0) {
                this.heros.push(allHeros[key]);
            }
        }
        this.heros.sort(compareHero);
    };

    proto._changeToHeroType = function (category, bForce) {
        if (!bForce && _curCategory == category) return;

        _curCategory = category;
        for (var i = 0; i < _topBtns.length; ++i) {
            if (category != (i + 1)) {
                this.mc.getChildByName(_topBtns[i] + '2').visible = false;
                this.mc.getChildByName(_topBtns[i] + '1').visible = true;
            } else {
                this.mc.getChildByName(_topBtns[i] + '2').visible = true;
                this.mc.getChildByName(_topBtns[i] + '1').visible = false;
            }
        }
        this._getHeroData();
        this._changePage(0, true);
    };

    proto._updateHeroData = function (hero) {
        if (!hero || !this.heros) return;

        for (var i = 0; i < this.heros.length; ++i) {
            if (this.heros[i].heroid == hero.heroid) {
                this.heros[i] = hero;
                break;
            }
        }
    };

    function getCompareFuncWithLevel(level) {
        return function (e1, e2) {
            var item1 = global.ItemFunction.getItemInfo(e1.type, e1.id);
            var priority1 = -10000;
            if (item1) {
                priority1 = +(item1.effect['@attributes'].value) + (level >= item1.limitlevel ? 0 : priority1);
            }
            var item2 = global.ItemFunction.getItemInfo(e2.type, e2.id);
            var priority2 = -10000;
            if (item2) {
                priority2 = +(item2.effect['@attributes'].value) + (level >= item2.limitlevel ? 0 : priority2);
            }
            if (priority1 < priority2) return 1;
            else if (priority1 == priority2) return 0;
            else return -1;
        }
    }

    proto._cleanWeaponList = function () {
        for (var i = 1; i <= _weaponItemCount; ++i) {
            var weaponItem = this.mc.getChildByName('hero_weapon_item_' + i);
            weaponItem.setImage(null);
            weaponItem.getChildByName('super_star').visible = false;
            weaponItem.getChildByName('text').setText('');
            weaponItem.itemInfo = null;
        }
    };

    proto._cleanArmorList = function () {
        for (var i = 1; i <= _armorItemCount; ++i) {
            var armorItem = this.mc.getChildByName('hero_armor_item_' + i);
            armorItem.setImage(null);
            armorItem.getChildByName('super_star').visible = false;
            armorItem.getChildByName('text').setText('');
            armorItem.itemInfo = null;
        }
    };

    proto._updateWeaponPageBtn = function () {
        var leftBtn = this.mc.getChildByName('weapon_left_btn');
        var rightBtn = this.mc.getChildByName('weapon_right_btn');
        if (!this.weapons) {
            leftBtn.setIsEnabled(false);
            rightBtn.setIsEnabled(false);
        }
        if (0 == _curWeaponPage) {
            leftBtn.setIsEnabled(false);
        } else {
            leftBtn.setIsEnabled(true);
        }
        if (this.weapons.length <= (_curWeaponPage + 1) * _weaponItemCount) {
            rightBtn.setIsEnabled(false);
        } else {
            rightBtn.setIsEnabled(true);
        }
    };

    proto._updateArmorPageBtn = function () {
        var leftBtn = this.mc.getChildByName('armor_left_btn');
        var rightBtn = this.mc.getChildByName('armor_right_btn');
        if (!this.armors) {
            leftBtn.setIsEnabled(false);
            rightBtn.setIsEnabled(false);
        }
        if (0 == _curArmorPage) {
            leftBtn.setIsEnabled(false);
        } else {
            leftBtn.setIsEnabled(true);
        }
        if (this.armors.length <= (_curArmorPage + 1) * _armorItemCount) {
            rightBtn.setIsEnabled(false);
        } else {
            rightBtn.setIsEnabled(true);
        }
    };

    proto._changeWeaponPage = function (page) {
        if (!this.weapons) return;
        if (page < 0 || (page != 0 && this.weapons.length <= page * _weaponItemCount)) return;

        var weapons = this.weapons;
        _curWeaponPage = page;
        this._updateWeaponPageBtn();
        for (var i = 1; i <= _weaponItemCount; ++i) {
            weapon = weapons[page * _weaponItemCount + i - 1];
            var weaponItem = this.mc.getChildByName('hero_weapon_item_' + i);
            if (weapon && _curChooseHero) {
                var itemInfo = global.ItemFunction.getItemInfo(weapon.type, weapon.id);
                weaponItem.setImage(global.ItemFunction.IconDir + itemInfo.tinyicon + '.png');
                weaponItem.getChildByName('super_star').visible = itemInfo.israre;
                weaponItem.getChildByName('super_star').play();
                weaponItem.getChildByName('text').setText(weapon.counter).setColor(itemInfo.color.replace('0x', '#'));
                if (itemInfo.limitlevel > _curChooseHero.herolevel) {
                    weaponItem.getChildByName('text').setColor(global.Color.RED);
                }
                weaponItem.itemInfo = itemInfo;
            } else {
                weaponItem.setImage(null);
                weaponItem.getChildByName('super_star').visible = false;
                weaponItem.getChildByName('text').setText('');
                weaponItem.itemInfo = null;
            }
        }
    };

    proto._updateWeaponList = function (heroInfo) {
        var items = global.dataCenter.data.inventory;
        var weapons = [];
        for (var key in items) {
            if (items[key].type == global.ItemFunction.ITEM_TYPE_WEAPON && items[key].count != 0) {
                var itemInfo = global.ItemFunction.getItemInfo(items[key].type, items[key].id);

                if (itemInfo && (0 == itemInfo.category || itemInfo.category == (heroInfo.corpstype / 1000 | 0))) {
                    weapons.push(items[key]);
                }
            }
        }
        weapons.sort(getCompareFuncWithLevel(heroInfo.herolevel));
        this.weapons = weapons;
        this._changeWeaponPage(0);
    };

    proto._changeArmorPage = function (page) {
        if (!this.armors) return;
        if (page < 0 || (page != 0 && this.armors.length <= page * _armorItemCount)) return;

        var armor;
        var armors = this.armors;
        _curArmorPage = page;
        this._updateArmorPageBtn();
        for (var i = 1; i <= 3; ++i) {
            armor = armors[page * _armorItemCount + i - 1];
            var armorItem = this.mc.getChildByName('hero_armor_item_' + i);
            if (armor && _curChooseHero) {
                var itemInfo = global.ItemFunction.getItemInfo(armor.type, armor.id);
                armorItem.setImage(global.ItemFunction.IconDir + itemInfo.tinyicon + '.png');
                armorItem.getChildByName('super_star').visible = itemInfo.israre;
                armorItem.getChildByName('super_star').play();
                armorItem.getChildByName('text').setText(armor.counter).setColor(itemInfo.color.replace('0x', '#'));
                if (itemInfo.limitlevel > _curChooseHero.herolevel) {
                    armorItem.getChildByName('text').setColor(global.Color.RED);
                }
                armorItem.itemInfo = itemInfo;
            } else {
                armorItem.setImage(null);
                armorItem.getChildByName('super_star').visible = false;
                armorItem.getChildByName('text').setText('');
                armorItem.itemInfo = null;
            }
        }
    };

    proto._updateArmorList = function (heroInfo) {
//        var testInventory = [];
//        for (var i = 31; i < 50; ++i) {
//            testInventory.push({type:3, id:i, counter:3});
//        }
        var items = global.dataCenter.data.inventory;
        var armors = [];
        for (var key in items) {
            if (items[key].type == global.ItemFunction.ITEM_TYPE_ARMOR) {
                armors.push(items[key]);
            }
        }
        armors.sort(getCompareFuncWithLevel(heroInfo.herolevel));
        this.armors = armors;
        this._changeArmorPage(0);
    };

    proto._updateSpecialty = function (heroInfo) {
        if (!heroInfo) return;

        var troop = global.configHelper.getTroopByClassId(heroInfo.corpstype);
        if (!troop) return;

        var specialclassid = [];
        var advantageConfig = global.configs['config/battle/advantage'];

        if (!advantageConfig) return;

        var heros = advantageConfig.root.hero;
        for (var i = 0; i < heros.length; ++i) {
            if (heros[i]['@attributes'].grade == heroInfo.grade) {
                var trooplist = heros[i].troop;
                for (var i = 0; i < trooplist.length; ++i) {
                    var thistroop = trooplist[i];
                    if (thistroop['@attributes'].category == troop['@attributes'].category) {
                        specialclassid.push({ type:thistroop['@attributes'].type, desc:thistroop['@attributes'].desc });
                    }
                }
                break;
            }
        }
        var specialty_panel = this.mc.getChildByName(bottomPanelNames[2]);
        for (var i = 0; i < 5; ++i) {
            var specialobj = specialclassid[i];
            var name = "name_" + ( i + 1 );
            var obj = specialty_panel.getChildByName(name);
            var specialtroop = specialobj ? global.configHelper.getTroopByClassId(specialobj.type) : null;
            if (specialtroop == null) {
                obj.setText("");
            }
            else {
                obj.setText(specialtroop['@attributes'].name);
            }

            name = "text_" + ( i + 1 );
            obj = specialty_panel.getChildByName(name);
            if (specialobj == null) {
                obj.setText("");
            }
            else {
                obj.setText(specialobj.desc);
            }

            name = "soldier_photo_" + ( i + 1 );
            obj = specialty_panel.getChildByName(name);
            obj.removeChild(obj.pic);
            obj.pic = undefined;

            if (specialtroop != null) {
                var resname = specialtroop['@attributes'].run;
                obj.setImage('resources/icon/soldier/' + resname.replace('_run', '') + '.png');
            }
        }
    };

    proto._getSkillLevel = function (heroInfo, index) {
        return index == 0 ? heroInfo.skill1level : heroInfo.skill2level;
    };

    proto._getSkillId = function (heroInfo, index) {
        return index == 0 ? heroInfo.skill1id : heroInfo.skill2id;
    };

    var _curSkillPage = 0;
    proto._updateSkill = function (heroInfo) {
        if (!heroInfo) return;

        var index = 0;//只显示第一个技能
        var skillPanel = this.mc.getChildByName(bottomPanelNames[1]);
        var skillobj = skillPanel.getChildByName("heros_skill_item_1");

        var skillid = this._getSkillId(heroInfo, _curSkillPage);
        var skilllevel = this._getSkillLevel(heroInfo, _curSkillPage);
        var skill = global.configHelper.getBattleSkill(skillid);
        var isvalid = global.configHelper.isValidActiveSkill(skill);

        var temp = skillPanel.getChildByName("skill_nothing");
        temp && (temp.visible = !isvalid);
        if (!isvalid) return;

        var bg = skillobj.getChildByName("heros_skill");
        bg.setImage();
        if (!skill) return;
        bg.setImage(global.ItemFunction.IconDir + skill['@attributes'].resname + '.png');
        var achieve1 = skillPanel.getChildByName('achieve1');
        var achieve2 = skillPanel.getChildByName('achieve2');
        var achieve3 = skillPanel.getChildByName('achieve3');
        var dissatisfy1 = skillPanel.getChildByName('dissatisfy_icon1');
        var dissatisfy2 = skillPanel.getChildByName('dissatisfy_icon2');
        var dissatisfy3 = skillPanel.getChildByName('dissatisfy_icon3');
        var obj = skillobj.getChildByName("skill_levelup_btn");
        if (obj) {
            obj.visible = isvalid;
        }
        obj = skillobj.getChildByName("skill_level_text");
        if (obj) {
            obj.setText("Lv" + skilllevel);
            obj.visible = isvalid;
        }
        obj = skillobj.getChildByName("skill_name_text");
        if (obj) {
            obj.setText(skill ? skill['@attributes'].name : "");
        }
        obj = skillobj.getChildByName("explain_text");
        if (obj) {
            obj.setText(skill ? skill['@attributes'].desc : '');
        }
        var levelinfo = global.configHelper.getSkillLevelInfo(skill, skilllevel);
        if (!levelinfo) return;
        obj = skillobj.getChildByName("goldText");
        if (obj) {

            var player_gold = global.dataCenter.data.player.gold;
            if (player_gold < levelinfo.gold) {
                obj.setText(player_gold + "/" + levelinfo.gold);
                achieve3.visible = false;
            }
            else {
                obj.setText(levelinfo ? levelinfo.gold : "");
                achieve3.visible = true;
            }
            obj.visible = isvalid;
            if (!isvalid) {
                achieve3.visible = false;
            }
        }

        // 寻找适用的技能卡
        var itemCount = global.dataCenter.findInventoryCounter(levelinfo.cardtype, levelinfo.cardid);

        obj = skillobj.getChildByName("skill_card_total_text");
        if (obj) {
            if (itemCount >= levelinfo.cardnumber) {
                obj.setText(levelinfo.cardnumber);
                if (index == 0) {
                    achieve2.visible = true;
                }
            } else {
                obj.setText(itemCount + '/' + levelinfo.cardnumber);
                if (index == 0) {
                    achieve2.visible = false;
                }
            }
        }
        obj = skillobj.getChildByName("hero_level_text");
        if (obj) {
            if (heroInfo.herolevel >= levelinfo.lv) {
                obj.setText(levelinfo.lv);
                achieve1.visible = true;
            }
            else {
                obj.setText(heroInfo.herolevel + "/" + levelinfo.lv);
                achieve1.visible = false;
            }
            obj.visible = isvalid;
            if (!isvalid) {
                achieve1.visible = false;
            }
        }
        dissatisfy1.visible = !achieve1.visible;
        dissatisfy2.visible = !achieve2.visible;
        dissatisfy3.visible = !achieve3.visible;
    };

    proto._skillFresh = function (data) {
        var dataobj = data["data"];
        global.controller.singleHeroController.update(dataobj.hero);
        global.controller.playerStatusController.update(dataobj.player);
        var count = dataobj["cardnumber"];
        var type = dataobj["cardtype"]
        var ID = dataobj["cardid"];
        _curChooseHero = dataobj.hero;
        global.dataCenter.addItem(type, ID, -count);
        global.controller.missionController.update(dataobj.mission);
        global.controller.dayMissionController.update(dataobj.mission_day);
        this._updateHeroData(data.data.hero);
        this._changePage(_curPage, true);
        this._updateSkill(_curChooseHero);
    };

    proto._levelUpHeroSkill = function () {
        if (!_curChooseHero) return;

        var player_gold = global.dataCenter.data.player.gold;
        var skillid = this._getSkillId(_curChooseHero, 0);
        var skilllevel = this._getSkillLevel(_curChooseHero, 0);
        var skill = global.configHelper.getBattleSkill(skillid);
        if (!skill) return;
        var levelinfo = global.configHelper.getSkillLevelInfo(skill, skilllevel);
        var skill_gold = levelinfo.gold;
        var card_num = global.dataCenter.findInventoryCounter(levelinfo.cardtype, levelinfo.cardid);
        var itemInfo = global.ItemFunction.getItemInfo(levelinfo.cardtype, levelinfo.cardid);
        if (skill_gold > player_gold) {
            global.dialog("升级所需的金币不足。可以通过城堡税收、占领他人城堡、抢占金矿获得金币");
        }
        else if (_curChooseHero.herolevel < levelinfo.lv) {
            global.dialog("英雄等级不够，可以通过战斗和训练场来提高英雄等级");
            return;
        }
        else if (levelinfo.cardnumber == 0) {
            global.dialog("技能等级已升至最高");
            return;
        }
        else {
            if (card_num >= levelinfo.cardnumber) {
                global.NetManager.call("Hero", "upgradeskill", {"heroid":_curChooseHero.heroid, "skillid":skillid, "skilllevel":skilllevel + 1 }, this._skillFresh.bind(this), "技能升级中");
            }
            else {
                global.dialog("技能卡片不足无法升级，战胜野外怪物军团有概率获得技能卡片");
            }
        }
    };

    function _queryChangeData(change, toClassId) {
        if (change) {
            for (var i = 0; i < change.length; ++i) {
                if (change[i]['@attributes'].toclassid == toClassId) {
                    return change[i];
                }
            }
        }
    }

    function _queryFromData(change, fromClassId) {
        if (change) {
            for (var i = 0; i < change.length; ++i) {
                if (change[i]['@attributes'].fromclassid == fromClassId) {
                    return change[i];
                }
            }
        }
    }

    proto._updateTroop = function (heroInfo) {
        if (!heroInfo) return;


        var troop_panel = this.mc.getChildByName(bottomPanelNames[0]);

        var herotroop = global.configHelper.getTroopByClassId(heroInfo.corpstype);

        var array = [];
        if (herotroop) {
            array = global.configHelper.getTroopArray(herotroop['@attributes'].category, true);
        }
        var index = 0;
        // var card;
        for (var i = 0; i < 5; ++i) {
            var inx = i + 1;
            var bCardEnough = !!array;
            //var card;
            var ChangeCategoryDataObj;
            if (array) {
                //card = global.ItemFunction.getItemInfo(array[i]['@attributes'].cardtype, array[i]['@attributes'].cardid);
//                if (card) {
//                    var hasCardNum = global.dataCenter.findInventoryCounter(card.type, card.id);
//                    var obj = troop_panel.getChildByName("achieve" + inx);
//                    if (hasCardNum < array[i]['@attributes'].cardnumber) {
//                        bCardEnough = false;
//                    }
//                    obj && (obj.visible = bCardEnough);
                var changedata = global.configHelper.getChangeData(array[i]['@attributes'].classid);
                var temp = _queryChangeData(changedata, array[i + 1] ? array[i + 1]['@attributes'].classid : 0);

                ChangeCategoryDataObj = _queryFromData(changedata, array[i] ? array[i]['@attributes'].classid : 0);
                if (troop_panel) {
                    var tindex = temp ? temp['@attributes'].index : 0;
                    obj = troop_panel.getChildByName("change_bg_" + tindex);
                    if (obj) {
                        obj.visible = temp ? !temp['@attributes'].isupgrade : true;
                    }
                    obj = troop_panel.getChildByName("levelup_bg_" + tindex);
                    if (obj) {
                        obj.visible = temp ? temp['@attributes'].isupgrade : false;
                    }
                }
            }
            var troop = array[i];
            this._updateSingleCategory(inx, troop, heroInfo, ChangeCategoryDataObj);
            this._updateSingleCategoryBg(troop, heroInfo, inx);//外加 一的参数index

            // }
        }
    };

    proto._updateSingleCategory = function (index, troop, herodata, ChangeCategoryDataObj) {
        var soldierPanel = this.mc.getChildByName('soldier_panel');
        var item = soldierPanel.getChildByName('heros_soldier_item_' + index);
        if (!item || !herodata) return;

        var obj = item.getChildByName("soldier_levelup_text");
        if (obj) {
            obj.setText(troop ? "Lv" + troop['@attributes'].limitlv : "");
        }
        obj = item.getChildByName("soldier_name_text");
        if (obj && troop) {
            obj.setText(troop['@attributes'].name);
        }

        var selecttroop = herodata && troop && herodata.corpstype == troop['@attributes'].classid;
        obj = item.getChildByName("soldier_now_icon");
        if (obj) {
            obj.visible = selecttroop;
        }
        obj = item.getChildByName("heros_change_soldier_btn");
        if (obj) {
            obj.visible = !selecttroop;
        }
        obj = item.getChildByName("soldier_magic_btn");
        obj && (obj.visible = false);
//        if (obj) {
//            if (ChangeCategoryDataObj && !ChangeCategoryDataObj.nomagic && herodata.herolevel >= 20)//兵种魔化20级后可用
//            {
//                obj.visible = selecttroop;
//            }
//            else {
//                obj.visible = false;
//            }
//        }
        obj = item.getChildByName("strengthen_soldier_btn");
        if (obj) {
            obj.visible = false;
        }
        obj = item.getChildByName("magic_day_text");
        obj && (obj.visible = false);
//        if (obj)//魔化的，暂时去掉
//        {
//            if (herodata == null || _hasValidMagicCard(herodata) == false || ( troop && herodata.corpstype != troop['@attributes'].classid )) {
//                obj.setText("");
//            }
//            else {
//                obj.setText("魔化剩余:" + _getMagicCardLeftDayString(herodata.cardtime));
//            }
//
//        }
    };

    function _hasValidMagicCard(heroInfo) {
        if (heroInfo.cardid) {
            return _getHeroMagicCardLeftTime(heroInfo.cardtime) > 0;
        }
        return false;
    }

    function _getHeroMagicCardLeftTime(cardtime) {
        var leftsecond = cardtime - global.common.getServerTime();
        if (leftsecond < 0) {
            return 0;
        }
        return leftsecond;

    }

    function _getMagicCardLeftDayString(cardtime) {
        var lefttime = _getHeroMagicCardLeftTime(cardtime);
        if (lefttime >= 3600 * 24) {
            var day = lefttime / ( 3600 * 24 );
            return day + "天";
        }
        if (lefttime >= 3600) {
            var hours = lefttime / 3600;
            return hours + "小时";
        }
        return "低于1小时";
    }

    var ItemTypeMagicCard = 9;

    function _getMagicHeroRunResource(heroInfo) {
        var id = 0;
        if (_getHeroMagicCardLeftTime(heroInfo.cardtime) <= 0) {
            id = heroInfo.corpstype;
        } else {
            var item = global.ItemFunction.getItemInfo(ItemTypeMagicCard, heroInfo.cardid);
            var id = item ? item.showsoldierid : 0;
        }
        var troopclsid = id ? id : heroInfo.corpstype;
        var herotroop = global.configHelper.getTroopByClassId(troopclsid);
        return herotroop ? herotroop['@attributes'].run : "";
    }

    proto._updateSingleCategoryBg = function (troop, herodata, index) {
        var troop_panel = this.mc.getChildByName(bottomPanelNames[0]);
        var bg = troop_panel.getChildByName('bg_item_' + index);
        bg.setImage();
        if (troop) {
            var resname = herodata.corpstype != troop['@attributes'].classid ? troop['@attributes'].run : _getMagicHeroRunResource(herodata);
            bg.setImage('resources/icon/soldier/' + resname.replace('_run', '') + '.png');
        }
        var card;
        if (troop) {
            card = global.ItemFunction.getItemInfo(troop['@attributes'].cardtype, troop['@attributes'].cardid);
        }
        var obj = bg.getChildByName("heros_soldier_progressbar");
        if (obj) {
            var percent = 100;
            if (card) {
                var hasItemCount = global.dataCenter.findInventoryCounter(card.type, card.id);
                if (hasItemCount >= troop['@attributes'].cardnumber) {
                    percent = 100;
                }
                else {
                    percent = hasItemCount * 100 / troop['@attributes'].cardnumber;
                }
            }
            var texture = bg.getChildByName("heros_soldier_progressbar").getChildAt(0).getChildAt(0);
            var h = percent / 100 * 65;
            texture.dy = 65 - h;
            texture.dh = h;

            texture.sy = 328 + texture.dy;
            texture.sh = h;
        }
    };

    proto._changeRoleClick = function (index) {
        var playergold = global.dataCenter.data.player.gold;
        var herotroop;
        if (_curChooseHero) {
            herotroop = global.configHelper.getTroopByClassId(_curChooseHero.corpstype);
            var array;
            if (herotroop) {
                array = global.configHelper.getTroopArray(herotroop['@attributes'].category, true);
            }

            if (array[index]) {
                this._showHeroTroopDialog(_curChooseHero, array[index]);
            }
        }
    };

    proto._showHeroTroopDialog = function (heroInfo, troopInfo) {
        if (heroInfo && troopInfo) {
            var mc = textureLoader.createMovieClip('window', 'hero_change_soldier_tips');
            mc.setIsSwallowTouch(true);
            mc.stopAtHead(true);
            if (mc) {
                mc.x = ( global.GAME_WIDTH - 272 ) / 2;
                mc.y = ( global.GAME_HEIGHT - 143 ) / 2;
                global.windowManager.addChild(mc);
            }
            var itemInfo = global.ItemFunction.getItemInfo(troopInfo['@attributes'].cardtype, troopInfo['@attributes'].cardid);
            var gold = global.dataCenter.data.player.gold;
            var soldierBg = mc.getChildByName("soldier_bg");
            if (troopInfo && soldierBg) {
                var resname = heroInfo.corpstype != troopInfo['@attributes'].classid ? troopInfo['@attributes'].run : _getMagicHeroRunResource(heroInfo);
                soldierBg.setImage('resources/icon/soldier/' + resname.replace('_run', '') + '.png');
                var cardInfo = global.ItemFunction.getItemInfo(troopInfo['@attributes'].cardtype, troopInfo['@attributes'].cardid);
                var bg = soldierBg.getChildByName("heros_soldier_progressbar");

                var texture = bg.getChildAt(0).getChildAt(0);
                if (cardInfo) {
                    var hasitem = global.dataCenter.findInventoryCounter(cardInfo.type, cardInfo.id);
                    var percent = 0;
                    if (hasitem >= troopInfo['@attributes'].cardnumber) {
                        percent = 100;
                    }
                    else {
                        percent = hasitem * 100 / troopInfo['@attributes'].cardnumber;
                    }
                    var progressheight = percent * 0.01 * 65;
                    texture.sh = texture.dh = progressheight;
                }

            }
            var levelStateText;
            var cardNumStateText;
            var goldStateText;
            var bLevelEnough;
            var bCardEnough;
            var bGoldEnough;
            var bBuyCardShouldShow;
            if (!troopInfo) {
                levelStateText = "-/-";
                cardNumStateText = "-/-";
                bLevelEnough = true;
                bCardEnough = true;
                bBuyCardShouldShow = false;
            }
            else if (!itemInfo) {
                levelStateText = "-/-";
                cardNumStateText = "-/-";
                bLevelEnough = true;
                bCardEnough = true;
                bBuyCardShouldShow = false;
            }
            else {
                bBuyCardShouldShow = true;
                var count = global.dataCenter.findInventoryCounter(itemInfo.type, itemInfo.id);
                var num = heroInfo.herolevel;
                if (num >= troopInfo['@attributes'].limitlv) {
                    bLevelEnough = true;
                }
                levelStateText = num + "/" + troopInfo['@attributes'].limitlv;
                if (count >= troopInfo['@attributes'].cardnumber) {
                    bCardEnough = true;
                }
                cardNumStateText = count + "/" + troopInfo['@attributes'].cardnumber;
            }
            if (gold >= troopInfo['@attributes'].gold) {
                bGoldEnough = true;
            }

            if (gold >= troopInfo['@attributes'].gold) {
                goldStateText = troopInfo['@attributes'].gold + "/" + troopInfo['@attributes'].gold;
            }
            else {
                goldStateText = gold + "/" + troopInfo['@attributes'].gold;
            }

            var guide = bLevelEnough && bCardEnough && bGoldEnough;

            mc.getChildByName("achieve_1").visible = bLevelEnough;
            mc.getChildByName("achieve_2").visible = bCardEnough;
            mc.getChildByName("achieve_3").visible = bGoldEnough;
            soldierBg = mc.getChildByName("level_text");
            if (soldierBg) {
                soldierBg.setText(levelStateText);
            }
            soldierBg = mc.getChildByName("card_text");
            if (soldierBg) {
                soldierBg.setText(cardNumStateText);
            }
            soldierBg = mc.getChildByName("gold_text");
            if (soldierBg) {
                soldierBg.setText(goldStateText);
            }
            mc.getChildByName('closeIcon').setButton(true, function () {
                global.windowManager.removeChild(mc);
            });
            var self = this;
            var heroChangeSoldierBtn = mc.getChildByName('heros_change_soldier_btn');
            heroChangeSoldierBtn.setButton(true, function () {
                global.windowManager.removeChild(mc);
                if (_curChooseHero) {
                    global.NetManager.call(
                        "Hero",
                        "transfer",
                        {
                            "heroid":_curChooseHero.heroid,
                            "troopclassid":troopInfo['@attributes'].classid
                        },
                        self._onChangeRole.bind(self),
                        "部队转职中");
                }
            });

            heroChangeSoldierBtn.setIsEnabled(guide);
            var buyCardBtn = mc.getChildByName('buy_card_btn');
            buyCardBtn.setButton(true, function () {
                global.windowManager.removeChild(mc);
                global.ItemFunction.buyItem(cardInfo.type, cardInfo.id);
            });
            buyCardBtn.setIsEnabled(bBuyCardShouldShow);
        }
    };

    proto._onChangeRole = function (data) {
        var dataobj = data["data"];
        global.controller.singleHeroController.update(dataobj["hero"]);
        global.controller.playerStatusController.update(dataobj["player"]);
        var count = dataobj["cardnumber"];
        var type = dataobj["cardtype"]
        var ID = dataobj["cardid"];
        global.dataCenter.addItem(type, ID, -count);
        global.controller.missionController.update(dataobj.mission);
        global.controller.dayMissionController.update(dataobj.mission_day);
        _curChooseHero = dataobj.hero;
        this._updateHeroData(data.data.hero);
        this._changePage(_curPage, true);
        this._updatePanelWithHeroInfo(dataobj.hero);
    };

    proto._updateAttrDialog = function () {

    };

    global.heroDialog = new HeroDialog();

})();
