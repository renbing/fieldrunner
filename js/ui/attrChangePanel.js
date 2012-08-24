/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-20
 * Time: 下午5:18
 *
 */

(function () {

    var proto = AttrChangePanel.prototype;
    //洗点水类型和id，在配置文件中找不到，定义在这里
    var RefreshWaterType = 0;
    var RefreshWaterId = 68;
    var _less = 0.92;
    var _high = 1.02;
    var RebirthLevel = 25;

    var topBtnNameToPanel = {
        Btn_bg1:'attr_change',
        Btn_bg2:'rebirth_change',
        Btn_bg3:'gradeup_change'
    };

    function AttrChangePanel() {
        this.width = 750;
        this.height = 419;
        this.isShowing = false;
    }

    proto._bindTopBtnEvent = function () {
        var bg = this.mc.getChildByName('bg');
        var self = this;
        bg.getChildByName('Btn_bg1').gotoAndStop(2);
        bg.getChildByName('Btn_bg2').gotoAndStop(1);
        bg.getChildByName('Btn_bg3').gotoAndStop(1);
        this.mc.getChildByName('attr_change').visible = true;
        this.mc.getChildByName('rebirth_change').visible = false;
        this.mc.getChildByName('gradeup_change').visible = false;
        for (var key in topBtnNameToPanel) {
            bg.getChildByName(key).addEventListener(Event.MOUSE_CLICK, function (topBtnName) {
                return function () {
                    for (var name in topBtnNameToPanel) {
                        if (name == topBtnName) {
                            bg.getChildByName(name).gotoAndStop(2);
                            self.mc.getChildByName(topBtnNameToPanel[name]).visible = true;
                        } else {
                            bg.getChildByName(name).gotoAndStop(1);
                            self.mc.getChildByName(topBtnNameToPanel[name]).visible = false;
                        }
                    }
                };
            }(key));
        }
    };

    proto._setColorByAttr = function (text, attr, value) {
        if (this.isShowing) {

            var arrow = text.arrow;
            text.parent.removeChild(arrow);
            text.arrow = null;
            if (value < attr) {
                text.setColor(global.Color.GREEN);
                text.arrow = textureLoader.createMovieClip('window_pub', 'tavern_excite_down_arrow');
                text.arrow.x = text.x + 28;
                text.arrow.y = text.y;
                text.parent.addChild(text.arrow);
            } else if (value > attr) {
                text.setColor(global.Color.RED);
                text.arrow = textureLoader.createMovieClip('window_pub', 'tavern_excite_up_arrow');
                text.arrow.x = text.x + 28;
                text.arrow.y = text.y;
                text.parent.addChild(text.arrow);
            } else {
                text.setColor(global.Color.BLACK);
            }
        }
    };

    proto._updateAttrChangePanel = function () {
        var refreshPanel = this.mc.getChildByName('attr_change');
        var refreshWaterCount = global.dataCenter.findInventoryCounter(RefreshWaterType, RefreshWaterId);
        var refreshWaterCountLabel = refreshPanel.getChildByName('q_text');
        refreshWaterCountLabel.setText('1/' + refreshWaterCount);
        var heroInfo = this.heroInfo;
        var average = global.getHeroAvarate(heroInfo.grade).value;
        var oldPropertyPanel = refreshPanel.getChildByName('attr_1');
        var oldAtkLabel = oldPropertyPanel.getChildByName('attack_text');
        var oldDefLabel = oldPropertyPanel.getChildByName('weapon_text');
        var oldLuckyLabel = oldPropertyPanel.getChildByName('lucky_text');
        oldAtkLabel.setText(heroInfo.attack).setColor(global.Color.BLACK);
        //this._setColorByAttr(oldAtkLabel, average, heroInfo.attack);
        oldDefLabel.setText(heroInfo.defense).setColor(global.Color.BLACK);
        //this._setColorByAttr(oldDefLabel, average, heroInfo.defense);
        oldLuckyLabel.setText(heroInfo.luck).setColor(global.Color.BLACK);
        //this._setColorByAttr(oldLuckyLabel, average, heroInfo.luck);

        var newPropertyPanel = refreshPanel.getChildByName('attr_2');
        var newAtkLabel = newPropertyPanel.getChildByName('attack_text');
        var newDefLabel = newPropertyPanel.getChildByName('weapon_text');
        var newLuckyLabel = newPropertyPanel.getChildByName('lucky_text');

        newAtkLabel.setText(this.newAtk ? this.newAtk : '');
        if (this.newAtk) this._setColorByAttr(newAtkLabel, heroInfo.attack, this.newAtk);
        else newAtkLabel.parent.removeChild(newAtkLabel.arrow);
        newDefLabel.setText(this.newDef ? this.newDef : '');
        if (this.newDef) this._setColorByAttr(newDefLabel, heroInfo.defense, this.newDef);
        else newDefLabel.parent.removeChild(newDefLabel.arrow);
        newLuckyLabel.setText(this.newLucky ? this.newLucky : '');
        if (this.newLucky) this._setColorByAttr(newLuckyLabel, heroInfo.luck, this.newLucky);
        else newLuckyLabel.parent.removeChild(newLuckyLabel.arrow);

        var attrChangeBtn = refreshPanel.getChildByName('attr_change_btn');
        var oldAttrBtn = refreshPanel.getChildByName('old_attr_btn');
        var newAttrBtn = refreshPanel.getChildByName('new_attr_btn');

        attrChangeBtn.setButton(true, this._onChangeAttr.bind(this));
        oldAttrBtn.setButton(true, this._onKeepOldAttr.bind(this));
        newAttrBtn.setButton(true, this._onSaveNewAttr.bind(this));
    };

    proto._onSaveNewAttr = function () {
        if (this.newAtk == 0) return;
        var self = this;
        global.NetManager.call("Hero", "KeepAttribute", { 'heroid':this.heroInfo.heroid, 'isnewattrib':1 }, function (netdata) {

            var dataobj = netdata["data"];
            global.controller.missionController.update(dataobj.mission);

            var hero = dataobj["hero"];
            global.controller.singleHeroController.update(hero);
            self.heroInfo = hero;
            self._updateAttrChangePanel();//更新能力提升面板

            self.newAtk = 0;
            self.newDef = 0;
            self.newLucky = 0;
            self._updateAttrChangePanel();
            self._updateRebirthPanel();
            self._updateGradeUpPanel();
        });
    };

    proto._onKeepOldAttr = function () {
        if (!this.newAtk) return;
        var self = this;
        global.NetManager.call("Hero", "KeepAttribute", { 'heroid':this.heroInfo.heroid, 'isnewattrib':0 }, function (netdata) {
                var dataobj = netdata["data"];
                global.controller.missionController.update(dataobj.mission);
                var hero = dataobj["hero"];
                global.controller.singleHeroController.update(hero);
                self.heroInfo = hero;
                self.newAtk = 0;
                self.newDef = 0;
                self.newLucky = 0;
                self._updateAttrChangePanel();
                self._updateRebirthPanel();
                self._updateGradeUpPanel();
            }
        );
    };

    proto._onChangeAttr = function () {
        var hero = this.heroInfo;
        var self = this;
        if (hero) {
            if (hero.attack + hero.defense + hero.luck < this.newAtk + this.newDef + this.newLucky) {
                global.dialog("亲,要放弃刚洗出的新属性么?比原来的属性总和要好哦!",
                    {
                        type:global.dialog.DIALOG_TYPE_CONFIRM,
                        closeDelay:0,
                        okFunc:function () {
                            //驱逐来敌,跳入战斗画面
                            self._changeAttr();
                        }
                    }
                );
            }else{
                this._changeAttr();
            }
        }
    };

    proto._changeAttr = function () {
        if (global.dataCenter.findInventoryCounter(RefreshWaterType, RefreshWaterId) <= 0) {
            global.dialog("您缺少洗点圣水，英雄当前无法洗属性");
            return;
        }
        var self = this;
        global.NetManager.call("Hero", "RefreshAttribute", { 'heroid':this.heroInfo.heroid }, function (netdata) {
                var dataobj = netdata["data"];
                global.controller.missionController.update(dataobj.mission);
                global.controller.inventoryController.update(dataobj.inventory);
                global.controller.singleHeroController.update(dataobj["hero"]);
                var hero = dataobj["hero"];
                if (hero) {
                    self.newAtk = hero.newattack;
                    self.newDef = hero.newdefense;
                    self.newLucky = hero.newluck;
                    self._updateAttrChangePanel();
                    self._updateRebirthPanel();
                    self._updateGradeUpPanel();
                }
            },
            "英雄洗属性中"
        );
    };

    proto._updateRebirthPanel = function () {
        var rebirthPanel = this.mc.getChildByName('rebirth_change');
        var newLevelLabel = rebirthPanel.getChildByName('text_1');
        var iValue = -1;
        var iLvl;
        if (this.heroInfo.reborntime == 0) {
            newLevelLabel.setText(this.heroInfo.herolevel + "/" + RebirthLevel);
            iValue = this.heroInfo.herolevel - RebirthLevel;
            iLvl = RebirthLevel - 20;
        } else {
            newLevelLabel.setText(this.heroInfo.herolevel + "/" + this.heroInfo.rebornlevel);
            iValue = this.heroInfo.herolevel - this.heroInfo.rebornlevel;
            iLvl = this.heroInfo.rebornlevel - 20;
        }

        var levelRebirthedLabel = rebirthPanel.getChildByName("text_2");
        if (iValue >= 0) {
            levelRebirthedLabel.setText(iLvl);
        } else {
            levelRebirthedLabel.setText("-");
        }

        var perpertyUpLabel = rebirthPanel.getChildByName("text_3");

        if (iValue > 9) {
            iValue = 9;
        }

        if (iValue >= 0) {
            perpertyUpLabel.setText([" 4 - 9 ", " 5 - 10 ", " 6 - 10 ", " 7 - 11 ", " 8 - 12 ", " 9 - 13 ", " 10 - 14 ", " 11 - 15 ", " 12 - 16 ", " 13 - 16 "][iValue]);
        } else {
            perpertyUpLabel.setText("-");
        }

        //可转生标记
        var achieveIcon = rebirthPanel.getChildByName("achieve_icon");
        if (iValue >= 0) {
            achieveIcon.visible = true;
        }
        else {
            achieveIcon.visible = false;
        }

        //不可转生标记
        var dissatisfyIcon = rebirthPanel.getChildByName("dissatisfy_icon");
        if (iValue < 0) {
            dissatisfyIcon.visible = true;
        }
        else {
            dissatisfyIcon.visible = false;
        }

        var rebirthBtn = rebirthPanel.getChildByName('rebirth_btn');
        rebirthBtn.setButton(true, this._onAcceptRebornHero.bind(this));
    };

    proto._onAcceptRebornHero = function () {
        var hero = this.heroInfo;

        if (!hero) {
            global.dialog("当前未选择任何英雄");
            return;
        }

        if (hero.reborntime != 0 && hero.herolevel < hero.rebornlevel) {
            global.dialog("英雄未达到转生要求的等级" + hero.rebornlevel);
            return;
        }

        if (hero.herolevel < RebirthLevel) {
            global.dialog("英雄未达到转生要求的等级" + RebirthLevel);
            return;
        }

        if (hero.weapontype != 0 || hero.armortype != 0) {
            global.dialog("穿戴装备的英雄无法转生");
            return;
        }

        if (hero.status != global.heroConfigHelper.IDLE_HERO || hero.trainingtype != 0) {
            global.dialog("驻守/占领/训练中的英雄无法转生");
            return;
        }

        global.NetManager.call("Hero", "reborn",
            { 'heroid':this.heroInfo.heroid },
            this._onNetHeroRebirth.bind(this), "英雄转生中");//发送英雄转生，OnNetHeroRebirth通讯回调函数

    };

    proto._onNetHeroRebirth = function (data) {
        var dataobj = data["data"];
        global.controller.missionController.update(dataobj.mission);
        global.controller.singleHeroController.update(dataobj.hero);
        var abilityAddition = dataobj.hero.herohidelevel - this.heroInfo.herohidelevel;
        this.heroInfo = dataobj.hero;
        this._updateAttrChangePanel();
        this._updateRebirthPanel();
        this._updateGradeUpPanel();

        var text = "恭喜你！您的英雄“" + this.heroInfo.heroname + "”转生成功，\n攻击 +" + abilityAddition + "\n防御 +" + abilityAddition;
        var mc = textureLoader.createMovieClip('window_pub', "rebirth_finish_panel");
        if (!mc) {
            global.dialog(text);
        }
        else {
            mc.x = ( global.GAME_WIDTH - 375 ) / 2;
            mc.y = ( global.GAME_HEIGHT - 285 ) / 2;
            mc.setIsSwallowTouch(true);
            global.windowManager.addChild(mc);
            var releaseGoldIcon = mc.getChildByName("release_gold");
            releaseGoldIcon && (releaseGoldIcon.visible = global.dataCenter.data.player.promote);

            var releaseBtn = mc.getChildByName("release_btn");
            releaseBtn.setButton(true, function () {
                global.dialog("尚未开放");
            });
            var acceptBtn = mc.getChildByName("accept_btn");
            acceptBtn.setButton(true, function () {
                global.windowManager.removeChild(mc);
            });
            var rebirthFinishText = mc.getChildByName("rebirth_finish_text");
            rebirthFinishText.setText(text);
        }
    };

    proto._onNetHeroUpgrade = function (data) {
        var dataobj = data["data"];
        global.controller.missionController.update(dataobj.mission);
        global.controller.singleHeroController.update(dataobj.hero);
        this._updateAttrChangePanel();
        this._updateRebirthPanel();
        this._updateGradeUpPanel();

        var herodata = dataobj.hero;
        if (herodata) {
            var text = "恭喜你！您的英雄“" + herodata.heroname + "”提升品级成功！";
            var mc = textureLoader.createMovieClip('window_pub', "attr_change_finish_panel");
            if (!mc) {
                global.dialog(text);
            }
            else {
                mc.x = ( global.GAME_WIDTH - 375 ) / 2;
                mc.y = ( global.GAME_HEIGHT - 285 ) / 2;
                mc.setIsSwallowTouch(true);
                global.windowManager.addChild(mc);

                var obj = mc.getChildByName("release_gold");
                obj.visible = global.dataCenter.data.player.promote > 0;

                obj = mc.getChildByName("release_btn");
                if (obj) {
                    var releasebtn = obj;

                    releasebtn.setButton(true, function () {
                        global.dialog('尚未开放');
                    });
                }

                obj = mc.getChildByName("accept_btn");
                if (obj) {
                    obj.setButton(true, function () {
                        global.windowManager.removeChild(mc);
                    });
                }

                obj = mc.getChildByName("rebirth_finish_text");
                if (obj) {
                    obj.setText(text);
                }
            }
        }
    };

    proto._updateGradeUpPanel = function () {
        var gradeUpPanel = this.mc.getChildByName('gradeup_change');
        var gradeUpBtn = gradeUpPanel.getChildByName('green_btn_bg3');

        var oHeroAttr_G = {D:54, C:66, B:81, A:93, S:108, SS:118};//普通英雄升阶数值
        var oHeroAttr_S = {D:77, C:89, B:102, A:114, S:127, SS:137};//超级英雄升阶数值
        var nextGradeLevel = global.heroConfigHelper.getGradeLevel(this.heroInfo.grade);
        var nextGrade = global.heroConfigHelper.getGradeByLevel(nextGradeLevel + 1);
        var gradeUpNeedAttr;
        if (this.heroInfo.herotype) {
            gradeUpNeedAttr = oHeroAttr_S[nextGrade];
        } else {
            gradeUpNeedAttr = oHeroAttr_G[nextGrade];
        }

        //升级数值说明
        var introLabel = gradeUpPanel.getChildByName("text_1");
        if (this.heroInfo.grade == "SS") {
            introLabel.setText("SS 级英雄已经无法提升品级了！");
        }
        else {
            introLabel.setText("当" + this.heroInfo.grade
                + "级英雄不穿装备的攻防属性值都超过" + gradeUpNeedAttr + "以后，就可以提升品级到" + nextGrade + "级了！");
        }
        //攻击值
        var attackLabel = gradeUpPanel.getChildByName("text_2");
        attackLabel.setText(this.heroInfo.attack + this.heroInfo.herohidelevel);

        //防御值
        var defLabel = gradeUpPanel.getChildByName("text_3");
        defLabel.setText(this.heroInfo.defense + this.heroInfo.herohidelevel);
        //酒馆等级
        var travernLevelLabel = gradeUpPanel.getChildByName("text_4");
        var travernLevel = global.dataCenter.getBuildLevel(global.BuildType.Tavern);
        var needTravernLevel = +global.heroConfigHelper.getHeroTarvenlevel(nextGrade);
        if (needTravernLevel != 0) {
            travernLevelLabel.setText(travernLevel + "/" + needTravernLevel);
        }
        else {
            travernLevelLabel.setText(travernLevel);
        }
        //攻击值不满足图标
        var dissatisfyIcon = gradeUpPanel.getChildByName("dissatisfy_icon_1");
        dissatisfyIcon.visible = +attackLabel.text < gradeUpNeedAttr;
        if (this.heroInfo.grade == "SS") {
            dissatisfyIcon.visible = false;
        }
        //攻击值满足图标
        var achieveIcon = gradeUpPanel.getChildByName("achieve_icon_1");
        achieveIcon.visible = +attackLabel.text >= gradeUpNeedAttr;
        if (this.heroInfo.grade == "SS") {
            achieveIcon.visible = false;
        }

        //防御值不满足图标
        var dissatisfyIcon = gradeUpPanel.getChildByName("dissatisfy_icon_2");
        dissatisfyIcon.visible = +defLabel.text < gradeUpNeedAttr;
        if (this.heroInfo.grade == "SS") {
            dissatisfyIcon.visible = false;
        }

        //防御值满足图标
        var achieveIcon = gradeUpPanel.getChildByName("achieve_icon_2");
        achieveIcon.visible = +defLabel.text >= gradeUpNeedAttr;
        if (this.heroInfo.grade == "SS") {
            achieveIcon.visible = false;
        }
        //酒馆等级不满足图标
        var dissatisfyIcon = gradeUpPanel.getChildByName("dissatisfy_icon_3");
        dissatisfyIcon.visible = travernLevel < needTravernLevel && needTravernLevel != 0;
        if (this.heroInfo.grade == "SS") {
            dissatisfyIcon.visible = false;
        }

        //酒馆等级满足图标
        var achieveIcon = gradeUpPanel.getChildByName("achieve_icon_3");
        achieveIcon.visible = travernLevel >= needTravernLevel && needTravernLevel != 0;
        if (this.heroInfo.grade == "SS") {
            achieveIcon.visible = false;
        }
        //升级前的品级图标
        var gradeIconBefore = gradeUpPanel.getChildByName("hero_grade_icon_1");
        gradeIconBefore.gotoAndStop(global.heroConfigHelper.getGradeLevel(this.heroInfo.grade));

        //升级后的品级图标
        var gradeIconAfter = gradeUpPanel.getChildByName("hero_grade_icon_2");
        gradeIconAfter.gotoAndStop(global.heroConfigHelper.getGradeLevel(nextGrade));

        var self = this;
        gradeUpBtn.setButton(true, function () {
            if (self.heroInfo.grade == "SS") {
                global.dialog("SS 级英雄已经无法提升品级了！");
                return;
            }
            var smallerAttr = +attackLabel.text > +defLabel.text ? +defLabel.text : +attackLabel.text;//攻防中较小值
            if (self.heroInfo.grade != nextGrade && smallerAttr >= gradeUpNeedAttr && self.heroInfo.grade != "SS" && travernLevel >= needTravernLevel && needTravernLevel != 0) {
                global.NetManager.call("Hero", "upgrade", { 'heroid':self.heroInfo.heroid }, self._onNetHeroUpgrade.bind(self), "英雄提升品级中");
            } else {
                global.dialog("英雄当前属性不足或酒馆等级不够，无法提升品级！请通过“洗属性”或“转生”来获得更多的英雄属性！");
            }
        });
    };

    proto.showDialog = function (heroInfo, onClose) {
        if (!this.isShowing && heroInfo) {
            var self = this;
            this.onClose = onClose;
            this.isShowing = true;
            this.heroInfo = heroInfo;
            this.mc = textureLoader.createMovieClip('window_pub', 'attr_change_panel');
            this.mc.setIsSwallowTouch(true);
            this.mc.getChildByName('rebirth_change').visible = false;
            this.mc.getChildByName('attr_change').visible = false;
            this.mc.getChildByName('closeIcon').setButton(true, function () {
                self.closeDialog();
            });
            this.mc.stopAtHead(true);
            this.mc.x = 0.5 * (global.GAME_WIDTH - this.width);
            this.mc.y = 0.5 * (global.GAME_HEIGHT - this.height);
            global.windowManager.addChild(this.mc);
            this.mc.getChildByName('hero_name_text').setText(heroInfo.heroname);
            this.mc.getChildByName('hero_grade_icon').gotoAndStop(global.heroConfigHelper.getGradeLevel(heroInfo.grade));
            var superstar = this.mc.getChildByName('super_star');
            superstar.visible = !!heroInfo.herotype;
            if (superstar.visible) superstar.play();

            var heroPhoto = this.mc.getChildByName('hero_photo');
            heroPhoto.setMovieClip('hero', 'hero' + heroInfo.image);
            // 洗点出的新属性,从网络请求返回，初始为0
            this.newAtk = 0;
            this.newDef = 0;
            this.newLucky = 0;
            this._updateAttrChangePanel();
            this._updateRebirthPanel();
            this._updateGradeUpPanel();
            this._bindTopBtnEvent();
        }
        Event.enableDrag = false;
    };

    proto.closeDialog = function () {
        if (this.isShowing) {
            this.isShowing = false;
            var heroPhoto = this.mc.getChildByName('hero_photo');
            heroPhoto.setMovieClip();
            global.windowManager.removeChild(this.mc);
            this.onClose && this.onClose();
            this.mc = undefined;
        }
        Event.enableDrag = true;

    };
    global.attrChangePanel = new AttrChangePanel();
})();
