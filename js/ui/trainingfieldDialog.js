/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-13
 * Time: 下午6:10
 *
 */

(function () {

    var dialog = new TrainHeroDialog();

    var proto = TrainHeroDialog.prototype;

    function TrainHeroDialog() {
        this.isShowing = false;
        this.width = 718;
        this.height = 543;
        this.heroItemCount = 4;
        this.bottomItemCount = 4;
        this.less = 0.92;
        this.high = 1.02;
        this.curPage = 0;
    }

    function compareHero(hero1, hero2) {
        var priority1 = hero1.herolevel * 100 + hero1.rebornlevel;
        var priority2 = hero2.herolevel * 100 + hero2.rebornlevel;
        return priority2 - priority1;
    }

    proto._updateHeroData = function () {
        this.heros = [];
        var myHeros = global.dataCenter.data.heros;
        for (var key in myHeros) {
            if (myHeros[key].status != 0) {
                this.heros.push(myHeros[key]);
            }
        }
        this.heros.sort(compareHero);
    };

    proto._clearHeroItem = function (heroItem) {
        heroItem.visible = false;
        heroItem.getChildByName('hero_photo').setMovieClip();

        heroItem.heroInfo = undefined;
    };

    proto._heroItemOnTrained = function (heroItem) {
        heroItem.getChildByName('training_finish_btn').visible = true;
        heroItem.getChildByName('finish_now_btn').visible = false;
        heroItem.getChildByName('stop_training_btn').visible = false;
        heroItem.getChildByName('odd_time_text').visible = false;
        heroItem.getChildByName('finish_light').visible = true;
    };

    proto._changeToHeroPage = function (page) {
        if (page < 0 || page * this.heroItemCount >= this.heros.length) return;

        var placeText = this.mc.getChildByName('training_position_text');
        var trainingcount = global.dataCenter.getTrainingHeroCount(true);
        placeText.setText(trainingcount + '/' + global.dataCenter.data.player.trainnumber);
        this.curPage = page;
        var startIndex = page * this.heroItemCount;
        var heroPanel = this.mc.getChildByName('idle_hero_panel');

        for (var i = 0; i < this.heroItemCount; ++i) {
            heroPanel.getChildByName('training_item_' + (i + 1)).visible = false;
            var heroInfo = this.heros[startIndex + i];
            var heroItem = heroPanel.getChildByName('training_hero_item_' + (i + 1));
            if (heroInfo) {
                if (0 == heroInfo.trainingtype) {
                    heroItem.getChildByName('training_finish_btn').visible = false;
                    heroItem.getChildByName('finish_now_btn').visible = false;
                    heroItem.getChildByName('stop_training_btn').visible = false;
                    heroItem.getChildByName('odd_time_text').visible = false;
                    heroItem.getChildByName('finish_light').visible = false;
                }
                else {
                    if (heroInfo.endtrainingtime <= global.common.getServerTime()) {
                        this._heroItemOnTrained(heroItem);
                    } else {
                        heroItem.getChildByName('training_finish_btn').visible = false;
                        heroItem.getChildByName('finish_now_btn').visible = true;
                        heroItem.getChildByName('stop_training_btn').visible = true;
                        heroItem.getChildByName('odd_time_text').visible = true;
                        heroItem.getChildByName('finish_light').visible = false;
                        heroItem.getChildByName('finish_light').play();
                    }
                }

                var heroPhotoPos = heroItem.getChildByName('hero_photo');
                heroPhotoPos.setMovieClip('hero', 'hero' + heroInfo.image);
                heroItem.heroInfo = heroInfo;
                var color = global.heroConfigHelper.getColor(heroInfo);
                heroItem.getChildByName('level_text').setText(heroInfo.herolevel).setColor(color);
                if (heroInfo.herohidelevel) {
                    heroItem.getChildByName('level_text_1').setText('+' + heroInfo.herohidelevel).setColor(global.Color.RED);
                } else {
                    heroItem.getChildByName('level_text_1').setText('').setColor(global.Color.RED);
                }
                var levelUpNeedExp = global.heroConfigHelper.getExpOfLevel(heroInfo.herolevel);
                heroItem.getChildByName('exp_progress').scaleX = global.common.numBetween(0, 1, heroInfo.exp / levelUpNeedExp);
                heroItem.getChildByName('text').setText(heroInfo.exp + '/' + levelUpNeedExp);
                var nameText = heroItem.getChildByName('heros_name_text');
                nameText.setText(heroInfo.heroname).setColor(color);
                heroItem.visible = true;
                if (heroInfo.herotype != 0) {
                    if (!heroItem.superstar) {
                        heroItem.superstar = textureLoader.createMovieClip('window_pub', 'superHero_star');
                        heroItem.superstar.x = nameText.x - heroItem.superstar.getWidth() * 0.5;
                        heroItem.superstar.y = nameText.y - heroItem.superstar.getHeight() - 6;
                        heroItem.addChild(heroItem.superstar);
                    }
                    heroItem.superstar.visible = true;
                } else {
                    heroItem.superstar && (heroItem.superstar.visible = false);
                }
            } else {
                this._clearHeroItem(heroItem);
                heroItem.superstar && (heroItem.superstar.visible = false);
            }
        }

    };

    proto._bindCloseEvent = function () {
        var closeBtn = this.mc.getChildByName('closeIcon');
        closeBtn.setButton(true, this.closeDialog.bind(this));
    };

    function _setColorByAttr(text, attr, value) {
        if (dialog.isShowing) {
            var less = attr * dialog.less;
            var high = attr * dialog.high;
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
    }

    proto._chooseItem = function (index) {
        if (index < 0 || index >= this.heroItemCount) return;

        var heroPanel = this.mc.getChildByName('idle_hero_panel');
        var heroItem = heroPanel.getChildByName('training_hero_item_' + (index + 1));
        for (var i = 0; i < this.heroItemCount; ++i) {
            heroPanel.getChildByName('training_item_' + (i + 1)).visible = false;
        }
        var trainningItem = heroPanel.getChildByName('training_item_' + (index + 1));
        trainningItem.visible = true;
        if (heroItem.heroInfo) {
            var heroInfo = heroItem.heroInfo;
            var attackText = trainningItem.getChildByName('attackText');
            var weaponText = trainningItem.getChildByName('weaponText');
            var luckyText = trainningItem.getChildByName('luckyText');
            var barrackText = trainningItem.getChildByName('soldier_total_text');
            var soldierText = trainningItem.getChildByName('hero_soldier_text');

            var average = global.getHeroAvarate(heroInfo.grade).value;
            attackText.setText(heroInfo.attack + heroInfo.herohidelevel);
            _setColorByAttr(attackText, average, heroInfo.attack + heroInfo.herohidelevel);
            weaponText.setText(heroInfo.defense + heroInfo.herohidelevel);
            _setColorByAttr(weaponText, average, heroInfo.defense + heroInfo.herohidelevel);
            luckyText.setText(heroInfo.luck);
            _setColorByAttr(luckyText, average, heroInfo.luck);
            var leadSoldiersCount = global.heroConfigHelper.getSoldiersOfLevel(heroInfo.herolevel);
            barrackText.setText(leadSoldiersCount);
            var leadSoldierName = global.configHelper.getTroopByClassId(heroInfo.corpstype)['@attributes'].name;
            soldierText.setText(leadSoldierName);

            this.chooseHero = heroItem.heroInfo;
        }
    };

    proto._bindChooseHeroEvent = function () {
        var heroPanel = this.mc.getChildByName('idle_hero_panel');
        var self = this;
        for (var i = 0; i < this.heroItemCount; ++i) {
            var trainItem = heroPanel.getChildByName('training_hero_item_' + (i + 1));
            trainItem.addEventListener(Event.MOUSE_CLICK, function (index) {
                return function (e) {
                    self._chooseItem(index);
                    e.stopPropagation();
                }
            }(i));
        }
    };

    proto._updateHeroTime = function () {
        if (!this.isShowing) return;

        var heroPanel = this.mc.getChildByName('idle_hero_panel');
        for (var i = 0; i < this.heroItemCount; ++i) {
            var heroItem = heroPanel.getChildByName('training_hero_item_' + (i + 1));
            if (heroItem.visible && heroItem.heroInfo) {
                if (+heroItem.heroInfo.trainingtype != 0) {
                    var second = heroItem.heroInfo.endtrainingtime - global.common.getServerTime();
                    if (second >= 0) {
                        var showTime = global.common.second2stand(second);
                        heroItem.getChildByName('odd_time_text').setText(showTime);
                    } else {
                        this._heroItemOnTrained(heroItem);
                    }
                }
            }
        }
    };

    proto._bindSecondEvent = function () {
        this._updateHeroTimeBind = this._updateHeroTime.bind(this);
        global.gameSchedule.scheduleFunc(this._updateHeroTimeBind, 1000);
    };

    proto._unbindSecondEvent = function () {
        global.gameSchedule.unscheduleFunc(this._updateHeroTimeBind);
    };

    proto._endTrain = function (data) {
        var trainedHero = data.data.hero;
        if (!trainedHero) return;
        var oldHeroData = global.dataCenter.getHeroById(trainedHero.heroid);
        global.controller.singleHeroController.update(data.data.hero);
        this._updateHeroData();
        this._changeToHeroPage(this.curPage);
        global.controller.missionController.update(data.data.mission);
        global.controller.dayMissionController.update(data.data.mission_day);
        global.controller.playerStatusController.update(data.data.player);
        global.sceneMyZone.buildingTraningfield.removeFromTrainingHerosList(trainedHero);

        var hint = "";
        var newlv = trainedHero.herolevel;
        if (newlv != oldHeroData.herolevel) {
            hint += trainedHero.heroname + "\n";
            hint += "等级提升";
            hint += oldHeroData.herolevel + "->" + newlv + "\n";
            if (data.data.isreminder) {
                hint += "英雄当前受城堡等级限制不能继续获得经验，请升级您的城堡。";
            }
            if (hint.length > 0) {
                var getExpDialog = textureLoader.createMovieClip('window', 'trainingfield_finish_panel');
                var finishText = getExpDialog.getChildByName('finish_text');
                finishText.setText(hint);
                var heroPhotoPos = getExpDialog.getChildByName('hero_photo');
                heroPhotoPos.setMovieClip('hero', 'hero' + trainedHero.image);
            }
            getExpDialog.getChildByName('accept_btn').setButton(true, function () {
                global.windowManager.removeChild(getExpDialog);
                ;
            });
            getExpDialog.x = (global.GAME_WIDTH - getExpDialog.getWidth()) * 0.5;
            getExpDialog.y = (global.GAME_HEIGHT - getExpDialog.getHeight()) * 0.5;
            global.windowManager.addChild(getExpDialog);
        }
        else {
            var gainexp = trainedHero.exp - oldHeroData.exp;
            hint = trainedHero.heroname + "获得经验" + gainexp;
            if (data.data.isreminder) {
                hint += "\n英雄当前受城堡等级限制不能继续获得经验，请升级您的城堡。";
            }
            global.dialog(hint);
        }

    };

    proto._getSpeedNeedHurryUp = function (heroInfo) {
        var time = heroInfo.endtrainingtime - global.common.getServerTime();

        return global.common.second2hour(time);
    };

    proto._bindHeroBtnEvent = function () {
        var self = this;
        var heroPanel = this.mc.getChildByName('idle_hero_panel');
        for (var i = 0; i < this.heroItemCount; ++i) {
            var heroItem = heroPanel.getChildByName('training_hero_item_' + (i + 1));
            var finishBtn = heroItem.getChildByName('training_finish_btn');
            var finishNowBtn = heroItem.getChildByName('finish_now_btn');
            var stopTrainBtn = heroItem.getChildByName('stop_training_btn');

            finishNowBtn.setButton(true, function (index) {
                return function (e) {
                    var heroInfo = heroPanel.getChildByName('training_hero_item_' + (index + 1)).heroInfo;
                    if (heroInfo) {
                        var hurryUpNeed = self._getSpeedNeedHurryUp(heroInfo);
                        if (hurryUpNeed > 0) {

                            var hurryItem = global.ItemFunction.getHurryupItem();
                            if (hurryItem.counter < hurryUpNeed) {
                                var itemInfo = global.ItemFunction.getItemInfo(hurryItem.type, hurryItem.id);
                                global.dialog(itemInfo.name + "不足\n需要数量" + hurryUpNeed + "\n当前数量" + hurryItem.counter);
                                return;
                            }
                            global.NetManager.call("Hero", "speedtrain", {"heroid":heroInfo.heroid, "hurryup":hurryUpNeed},
                                function () {
                                    global.NetManager.call("Hero", "endtrain", {"heroid":heroInfo.heroid},
                                        self._endTrain.bind(self),
                                        "结束训练英雄"
                                    );
                                },
                                "英雄训练加速中"
                            );
                        }
                    }
                };
            }(i));

            finishBtn.setButton(true, function (index) {
                return function (e) {
                    var heroInfo = heroPanel.getChildByName('training_hero_item_' + (index + 1)).heroInfo;
                    if (heroInfo) {
                        global.NetManager.call("Hero", "endtrain", {"heroid":heroInfo.heroid},
                            self._endTrain.bind(self),
                            "结束训练英雄"
                        );
                    }
                };
            }(i));

            stopTrainBtn.setButton(true, function (index) {
                return function (e) {
                    var heroInfo = heroPanel.getChildByName('training_hero_item_' + (index + 1)).heroInfo;
                    if (heroInfo) {
                        var leftticks = heroInfo.endtrainingtime - global.common.getServerTime();
                        if (leftticks > 0) {
                            global.dialog("终止训练不返回训练花费", {
                                type:global.dialog.DIALOG_TYPE_CONFIRM,
                                closeDelay:0,
                                okFunc:function () {
                                    global.NetManager.call("Hero", "endtrain", {"heroid":heroInfo.heroid},
                                        self._endTrain.bind(self),
                                        "结束训练英雄"

                                    );
                                }
                            });
                            return;
                        }

                        global.NetManager.call("Hero", "endtrain", {"heroid":heroInfo.heroid},
                            self._endTrain.bind(self),
                            "结束训练英雄"
                        );
                    }
                };
            }(i));
        }
    };

    function canAddPlaceByFriend() {
        var slotdata = global.configHelper.getTrainingSlotData(global.dataCenter.data.player.trainnumber + 1);
        if (slotdata) {
            if (slotdata.friendcount == 0) {
                return false;
            }
            if (slotdata.tflevel > global.dataCenter.getBuildLevel(global.BuildType.Trainingfield)) {
                return false;
            }
            var friends = global.dataCenter.data.friends;
            var friendcount = friends ? friends.length : 0;
            var match = 0;
            for (var index = 0; index < friendcount; index++) {
                var friend = friends[index];
                if (friend && friend.level >= slotdata.friendlevel) {
                    match++;
                }
            }
            if (slotdata.friendcount > match) {
                return false;
            }
            return true;
        }
        return false;
    }

    function canAddFriendByCash() {
        var slotdata = global.configHelper.getTrainingSlotData(global.dataCenter.data.player.trainnumber + 1);
        if (slotdata) {
            if (slotdata.tflevel > global.dataCenter.getBuildLevel(global.BuildType.Trainingfield)) {
                return false;
            }
            return true;
        }
        return false;
    }

    proto._bindAddPlaceEvent = function () {
        var addPlaceBtn = this.mc.getChildByName('add_place_btn');
        addPlaceBtn.setButton(true, function () {
            var canadd = global.dataCenter.getBuildLevel(global.BuildType.Trainingfield) - global.dataCenter.data.player.trainnumber;
            if (canadd <= 0) {
                global.dialog("当前已经无法再开启训练位");
                return;
            } else {
                var addPlacePanel = textureLoader.createMovieClip('window_pub', 'add_place_panel');
                addPlacePanel.setIsSwallowTouch(true);
                addPlacePanel.x = 0.5 * (global.GAME_WIDTH - 370);
                addPlacePanel.y = 0.5 * (global.GAME_HEIGHT - 348);
                addPlacePanel.stopAtHead(true);
                global.windowManager.addChild(addPlacePanel);

                addPlacePanel.getChildByName('closeIcon').setButton(true, function () {
                    global.windowManager.removeChild(addPlacePanel);
                    this.addPlacePanel = undefined;
                });

                addPlacePanel.getChildByName('place_text').setText(canadd);
                var tips = addPlacePanel.getChildByName('open_text_1');
                var slotData = global.configHelper.getTrainingSlotData(global.dataCenter.data.player.trainnumber + 1);
                if (slotData && slotData.friendcount != 0) {
                    tips.setText("需要拥有" + slotData.friendcount + "位" + slotData.friendlevel + "级以上的好友");
                } else {
                    tips.setText("再多好友也无法帮你开启训练位了");
                }
                var tips2 = addPlacePanel.getChildByName('open_text_2');
                tips2.setText((slotData ? slotData.cash : 0) + " Q点");
                var openBtn1 = addPlacePanel.getChildByName('open_btn_1');
                var openBtn2 = addPlacePanel.getChildByName('open_btn_2');
                openBtn1.setButton(true, this._onAddPlaceByFriend.bind(this));
                openBtn2.setButton(true, this._onAddPlaceByCash.bind(this));
                openBtn1.setIsEnabled(!canAddPlaceByFriend());
                openBtn2.setIsEnabled(!canAddFriendByCash());
                this.addPlacePanel = addPlacePanel;
            }
        }.bind(this));
    };

    proto._onAddPlaceByCash = function () {

        var slotdata = global.configHelper.getTrainingSlotData(global.dataCenter.data.player.trainnumber + 1);
        if (slotdata) {
            if (slotdata.tflevel > global.dataCenter.getBuildLevel(global.BuildType.Trainingfield)) {
                global.dialog("训练场等级不足，无法增加训练位");
                return;
            }

            global.NetManager.call("City", "addtrainnumber", {'iscash':1, 'cash':slotdata.cash },
                function (data) {
                    global.controller.playerStatusController.update(data.data.player);
                    if (this.addPlacePanel) {
                        global.windowManager.removeChild(this.addPlacePanel);
                        this.addPlacePanel = undefined;
                    }
                    var placeText = this.mc.getChildByName('training_position_text');
                    var trainingcount = global.dataCenter.getTrainingHeroCount(true);
                    placeText.setText(trainingcount + '/' + global.dataCenter.data.player.trainnumber);
                    global.controller.missionController.update(data.data.mission);
                    global.controller.dayMissionController.update(data.data.mission_day);
                },
                "增加训练位中"
            );
        }
        else {
            global.dialog("训练位已达到极限");
        }
    };

    proto._onAddPlaceByFriend = function () {
        var slotdata = global.configHelper.getTrainingSlotData(global.dataCenter.data.player.trainnumber + 1);
        if (slotdata) {
            if (slotdata.friendcount == 0) {
                global.dialog("再多好友也无法帮你开启训练位了");
                return;
            }
            if (slotdata.tflevel > global.dataCenter.getBuildLevel(global.BuildType.Trainingfield)) {
                global.dialog("训练场等级不足，无法增加训练位");
                return;
            }
            var friends = global.dataCenter.data.friends;
            var friendcount = friends ? friends.length : 0;
            var match = 0;
            for (var index = 0; index < friendcount; index++) {
                var friend = friends[index];
                if (friend && friend.level >= slotdata.friendlevel) {
                    match++;
                }
            }
            if (slotdata.friendcount > match) {
                global.dialog("好友不足，无法增加训练位");
                return;
            }
            global.NetManager.call("City", "addtrainnumber", {'iscash':0, 'cash':slotdata.friendcount },
                function (data) {
                    global.controller.playerStatusController.update(data.data.player);
                    if (this.addPlacePanel) {
                        global.windowManager.removeChild(this.addPlacePanel);
                        this.addPlacePanel = undefined;
                    }
                    var placeText = this.mc.getChildByName('training_position_text');
                    var trainingcount = global.dataCenter.getTrainingHeroCount(true);
                    placeText.setText(trainingcount + '/' + global.dataCenter.data.player.trainnumber);
                    global.controller.missionController.update(data.data.mission);
                    global.controller.dayMissionController.update(data.data.mission_day);
                }.bind(this),
                "增加训练位中"
            );
        }
        else {
            global.dialog("训练位已达到极限");
        }
    };

    proto._bindLevelUpBuildEvent = function () {
        var levelUpBtn = this.mc.getChildByName('training_levelup_btn');
        levelUpBtn.setButton(true, function () {
            global.ui.uiBuildDialog.show(global.BuildType.Trainingfield);
        });
    };

    proto._updatePageBtn = function () {
        if (this.curPage == 0) this.leftBtn.setIsEnabled(false);
        else this.leftBtn.setIsEnabled(true);

        if (this.heros.length <= (this.curPage * this.heroItemCount) + this.heroItemCount) this.rightBtn.setIsEnabled(false);
        else this.rightBtn.setIsEnabled(true);
    };

    proto._bindChangePageEvent = function () {
        this.leftBtn = this.mc.getChildByName('left_btn');
        this.rightBtn = this.mc.getChildByName('right_btn');
        var heroPanel = this.mc.getChildByName('idle_hero_panel');

        global.common.assert(heroPanel, "素材错误:缺少组件idle_hero_panel");
        global.common.assert(this.leftBtn, "素材错误:缺少组件left_btn");
        global.common.assert(this.rightBtn, "素材错误:缺少组件right_btn");

        heroPanel.addEventListener(Event.GESTURE_SWIPE, function (e) {
            if (e.data == Event.SWIPE_LEFT) {
                this._changeToHeroPage(this.curPage + 1);
                this._updatePageBtn();
            } else if (e.data = Event.SWIPE_RIGHT) {
                this._changeToHeroPage(this.curPage - 1);
                this._updatePageBtn();
            }
        }.bind(this));

        this.leftBtn.setButton(true, function () {
            this._changeToHeroPage(this.curPage - 1);
            this._updatePageBtn();
        }.bind(this));

        this.rightBtn.setButton(true, function () {
            this._changeToHeroPage(this.curPage + 1);
            this._updatePageBtn();
        }.bind(this));
    };

    proto.showDialog = function () {
        if (!this.isShowing) {
            this.isShowing = true;
            this.mc = textureLoader.createMovieClip('window', 'trainingfield_panel');
            this.mc.setIsSwallowTouch(true);
            this.mc.x = (global.GAME_WIDTH - this.width) * 0.5;
            this.mc.y = (global.GAME_HEIGHT - this.height) * 0.5;
            this.mc.stopAtHead(true);

            global.windowManager.addChild(this.mc);

            this._updateHeroData();
            this._changeToHeroPage(this.curPage);

            this._bindHeroBtnEvent()
            this._bindChooseHeroEvent();
            this._bindCloseEvent();
            this._bindSecondEvent();
            this._updateBottomPanel();
            this._bindTrainningButton();
            this._bindAddPlaceEvent();
            this._bindLevelUpBuildEvent();
            this._bindChangePageEvent();
            this._updatePageBtn();
        }
        Event.enableDrag = false;
    };

    proto.closeDialog = function () {
        if (this.isShowing) {
            this.isShowing = false;
            this._unbindSecondEvent();
            var heroPanel = this.mc.getChildByName('idle_hero_panel');
            for (var i = 0; i < this.heroItemCount; ++i) {
                var heroItem = heroPanel.getChildByName('training_hero_item_' + (i + 1));
                var heroPhotoPos = heroItem.getChildByName('hero_photo');
                heroPhotoPos.setMovieClip();
            }
            global.windowManager.removeChild(this.mc);
            this.mc = undefined;
        }
        Event.enableDrag = true;
    };

    proto._getCurTrainExpend = function () {
        var trainningInfo = global.configs['config/battle/herotrain'];
        var buildLevel = global.dataCenter.data.builds[global.BuildType['Trainingfield']].level;
        if (buildLevel < 1) buildLevel = 1;
        if (buildLevel >= trainningInfo.root.build.length) buildLevel = trainningInfo.root.build.length;
        return trainningInfo.root.build[buildLevel - 1].train;
    };

    proto._updateBottomPanel = function () {
        var heroPanel = this.mc.getChildByName('idle_hero_panel');
        var trainningInfo = global.configs['config/battle/herotrain'];
        var trainningTime = trainningInfo.root.traintime;
        var trainningExpend = this._getCurTrainExpend();

        for (var i = 1; i <= this.bottomItemCount; ++i) {
            var item = heroPanel.getChildByName('training_time_item_' + i);
            var time = trainningTime[i - 1]['@attributes'].minute;
            var expend = trainningExpend[i - 1]["@attributes"];
            item.getChildByName('time_text').setText(global.common.min2hour(time));
            item.getChildByName('gold_text').setText(expend.gold);
            item.getChildByName('gold_exp_text').setText(expend.goldexp);
            item.getChildByName('cash_text').setText(expend.cash);
            item.getChildByName('cash_exp_text').setText(expend.cashexp);
        }
    };

    proto._trainHero = function (data) {
        global.controller.singleHeroController.update(data.data.hero);
        this.chooseHero = data.data.hero;
        this._updateHeroData();
        this._changeToHeroPage(this.curPage);
        global.controller.gameinfoController.update(data.data.gameinfo);
        global.controller.missionController.update(data.data.mission);
        global.controller.dayMissionController.update(data.data.mission_day);
        global.controller.playerStatusController.update(data.data.player);
        global.sceneMyZone.buildingTraningfield.addTrainingHero(data.data.hero);
    };

    proto._bindTrainningButton = function () {
        var self = this;
        var heroPanel = this.mc.getChildByName('idle_hero_panel');
        for (var i = 1; i <= this.bottomItemCount; ++i) {
            var item = heroPanel.getChildByName('training_time_item_' + i);
            var btn1 = item.getChildByPath('training_time_bg/training_btn_1');
            var btn2 = item.getChildByPath('training_time_bg/training_btn_2');

            btn1.setButton(true, function (index) {
                return function (e) {
                    if (!self.chooseHero) return;

                    if (global.dataCenter.getTrainingHeroCount(true) >= global.dataCenter.data.player.trainnumber) {
                        global.dialog("训练位不足，无法训练英雄。\n");
                        return;
                    }
                    var herodata = self.chooseHero;
                    var castlelv = global.dataCenter.getLevel();
                    if (herodata.herolevel >= castlelv) {
                        global.dialog("英雄等级已经达到城堡等级无法继续训练。\n(完成任务，参加战斗可以获得经验提升城堡等级。)");

                        return;
                    }

                    var expend = self._getCurTrainExpend()[index - 1]["@attributes"];
                    if (global.dataCenter.data.player.gold < expend.gold) {
                        global.dialog("训练所需金币不足");
                        return;
                    }

                    if (self.chooseHero.trainingtype != 0) {
                        global.dialog("英雄当前正在训练中，无法继续训练");
                        return;
                    }

                    global.NetManager.call("Hero", "train", {"cardnumber":0, "type":index, "cash":0, "heroid":self.chooseHero.heroid, "gold":expend.gold},
                        self._trainHero.bind(self),
                        "着手训练英雄"
                    );

                };
            }(i));

            btn2.setButton(true, function (index) {
                return function (e) {
                    if (!self.chooseHero) return;

                    if (global.dataCenter.getTrainingHeroCount(true) >= global.dataCenter.data.player.trainnumber) {
                        global.dialog("训练位不足，无法训练英雄。\n");
                        return;
                    }
                    var herodata = self.chooseHero;
                    var castlelv = global.dataCenter.getLevel();
                    if (herodata.herolevel >= castlelv) {
                        global.dialog("英雄等级已经达到城堡等级无法继续训练。\n(完成任务，参加战斗可以获得经验提升城堡等级。)");
                        return;
                    }

                    if (self.chooseHero.trainingtype != 0) {
                        global.dialog("英雄当前正在训练中，无法继续训练");
                        return;
                    }


                    var expend = self._getCurTrainExpend()[index - 1]["@attributes"];
                    var cash = global.dataCenter.data.player.cash;
                    var trainingCard = global.ItemFunction.getTrainingCard();

                    //有训练卡优先使用
                    if (trainingCard.counter >= expend.cash) {
                        global.NetManager.call("Hero", "train", {"cardnumber":expend.cash, "type":index, "cash":0, "heroid":self.chooseHero.heroid, "gold":0},
                            self._trainHero.bind(self),
                            "着手训练英雄"
                        );
                    }
                    else if (cash > expend.cash) {
                        global.NetManager.call("Hero", "train", {"cardnumber":0, "type":index, "cash":expend.cash, "heroid":self.chooseHero.heroid, "gold":0},
                            self._trainHero.bind(self),
                            "着手训练英雄"
                        );
                    }
                    else {
                        global.dialog('训练所需现金不足');
                    }
                }
            }(i));
        }
    };

    global.ui.trainningfeildDialog = dialog;
})();
