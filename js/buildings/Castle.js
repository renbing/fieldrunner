/**
 * Created by Rui.Luo .
 * User: Rui.Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 王城类
 *
 * 工厂模式
 *
 */
/// 这个类里面同样写了点击主城弹出来的弹窗的功能，并且写了驻防UI的事件实现
(function () {
    var BuildType = 0;
    var proto = BuildingCastle.prototype;

    var TaxModeHarvest = 3;//收获
    var TaxModeSpeed = 1;//加速
    var TaxModeMore = 2;//加收

    var BUILD_STATE_IDLE = 0;
    var BUILD_STATE_COLLECTING = 1;
    var BUILD_STATE_WAIT_HARVEST = 1000;

    /**
     * 构造器
     * @param container
     */
    function BuildingCastle(container) {
        this.buildingName = 'castleBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = BuildType;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'castleBuilding1':[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            'castleBuilding2':[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            'castleBuilding3':[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0],
            'castleBuilding4':[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
            'castleBuilding5':[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0],
            'castleBuilding6':[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0],
            'castleBuilding7':[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding8':[0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding9':[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding10':[0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding11':[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding12':[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding13':[0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding14':[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            'castleBuilding15':[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0]
        };

        this.operationPanel = new global.OperationPanel();
        this._bindOperationPanelEvent();

        global.Building.call(this, container);
        this.mc.belong = this;
        var self = this;
        this.mc.addEventListener(Event.MOUSE_CLICK, function (e) {
                self._onClick && self._onClick();
            }
        );
        this.mc.setUseAlphaTest(true);
        this.onSeond = this._onSecond.bind(this);
        global.gameSchedule.scheduleFunc(this.onSeond, 1000);
    }

    proto._bindOperationPanelEvent = function () {
        var self = this;
        var onClick = function (e) {
            self._retreat();
            self.operationPanel.hide();
            e.stopPropagation();
        };

        this.operationPanel.mcRetreatIcon.setButton(true, onClick);

        onClick = function (e) {
            self.operationPanel.hide();
            self._garrision();
        };

        this.operationPanel.mcGarrisonIcon.setButton(true, onClick);

        onClick = function (e) {
            self.bInLevelUpState = false;
            self._levelUp();
            self.operationPanel.hide();
        };

        this.operationPanel.mcUpIcon.setButton(true, onClick);

        onClick = function (e) {
            self._addHarvest();
            self.operationPanel.hide();
        };

        this.operationPanel.mcBtnAddHarvest.setButton(true, onClick);
        var speedUpBtn = this.operationPanel.mcBuildingWindowsPanel.getChildByPath('win_1/preemptiveIcon');
        speedUpBtn && speedUpBtn.setButton(true, function (e) {
            var data = global.dataCenter.data.builds[BuildType];
            if (!data) return;

            self.operationPanel.hide();
            var taxLimitCountPerDay = global.configHelper.getCastleTaxLimitCount();
            if (data.workdata < taxLimitCountPerDay) {
                var income = global.configHelper.getCastleOccupyByLevel(data.level);
                var userid = global.isMyHome ? global.NetManager.uid : global.friendId;
                var harvestTime = global.isMyHome ? data.endworktime : data.occupyharvest;
                var endTime = harvestTime - global.common.getServerTime();
                var endHour = global.common.second2hour(endTime);

                if(endHour <= 0) return;

                var needHurryItems = endHour;//一小时一个
                var speedUpRequest = function () {
                    global.NetManager.call('City', 'tax',
                        {opmode:TaxModeSpeed, gold:income, ownerid:userid, hurryup:needHurryItems, extra:0},
                        self._taxCallBack.bind(self)
                    );
                };
                global.onekeyFinishDialog.showDialogByTime(endTime, speedUpRequest);
                self.update();
            }
        });
    };

    proto._getBuildInfo = function () {
        return global.dataCenter.data.builds[BuildType];
    };

    proto._updateConquerdIcon = function () {
        var buildInfo = this._getBuildInfo();
        if (buildInfo) {
            var bConquerdBy = undefined;
            if (global.isMyHome) {
                if (buildInfo.occupy && buildInfo.occupy != global.NetManager.uid) {
                    bConquerdBy = buildInfo.occupy;
                }
            } else {
                if (buildInfo.occupy && buildInfo.occupy != global.friendId) {
                    bConquerdBy = buildInfo.occupy;
                }
            }

            if (bConquerdBy) {
                var nameLabel;
                var photoIcon;
                if (!this.conquerdIcon) {
                    this.conquerdIcon = textureLoader.createMovieClip('window_pub', 'occupantPanel');

                    this.conquerdIcon.x = 209;
                    this.conquerdIcon.y = 6;
                    this.mc.addChild(this.conquerdIcon);
                }

                nameLabel = this.conquerdIcon.getChildByName('nameText');
                photoIcon = this.conquerdIcon.getChildByName('photo');
                var occupyInfo;
                if (!global.isMyHome) {
                    occupyInfo = global.dataCenter.data.visitinfo.occupyinfo;
                } else {
                    occupyInfo = {un:"dd", headpic:'ww'};
                }
                if (occupyInfo) {
                    nameLabel && nameLabel.setText(occupyInfo.un);
                    photoIcon && photoIcon.setImage(occupyInfo.headpic);
                } else {
                    nameLabel && nameLabel.setText('');
                    photoIcon && photoIcon.setImage();
                }
                this.conquerdIcon.visible = true;
            } else {
                this.conquerdIcon && (this.conquerdIcon.visible = false);
            }
        }
    };

    proto.getCastleOwnerId = function () {
        if (global.isMyHome) {
            return global.NetManager.uid;
        } else {
            return global.friendId;
        }
    };

    proto.updateIcon = function () {
        this._updateConquerdIcon();

        var bGarrissed = !!this._getLegion();//自己是否有驻防部队
        if (global.isMyHome) {
            if (!bGarrissed && !this.topTip && !this.conquerdIcon) {
                if (!this.castleTips) {
                    this.castleTips = textureLoader.createMovieClip('window_pub', 'const_tip_castle');
                    this.mc.addChild(this.castleTips);
                    this.castleTips.x = 168;
                    this.castleTips.y = 47;
                }
                this.castleTips.visible = true;
            } else {
                this.castleTips && (this.castleTips.visible = false);
            }
        } else {
            this.castleTips && (this.castleTips.visible = false);
        }

        var soldiersAnimation = this.mc.getChildAt(10);
        soldiersAnimation && (soldiersAnimation.visible = bGarrissed);
        var buildInfo = this._getBuildInfo();
        if (buildInfo) {
            if (buildInfo.shielddata - global.common.getServerTime() > 0) {
                if (!this.freeIcon) {
                    this.freeIcon = textureLoader.createMovieClip('ui', 'avoid_war_panel');
                    this.freeIcon.x = 220;
                    this.freeIcon.y = 47;
                    this.mc.addChild(this.freeIcon);
                }
                this.freeIcon.visible = true;
                var timeLabel = this.freeIcon.getChildByName('time_text');
                timeLabel && timeLabel.setText(global.common.second2stand(buildInfo.shielddata - global.common.getServerTime()));
            } else {
                this.freeIcon && (this.freeIcon.visible = false);
            }
        }
    };

    proto.update = function () {
        var data = this._getBuildInfo();
        if (!data) return;
        this.changeLevel(data.level);
        if (!global.isMyHome){//当不是自己家时，传来的数据可能会影响好友数据，因此需要单独更新该好友数据
            global.uiPlayerStatus.setLevel(global.myLevel);
            var friendInfo = this._getFriendDataByID(data.u);
            friendInfo.occupy = data.occupy;
            friendInfo.occupyharvest = data.occupyharvest;
            friendInfo.shielddata = data.shielddata;
        }
        global.uiFriendList.update();
        this.updateIcon();
    };

    proto._onClickWhenConquered = function () {
        var self = this;
        global.dialog("您的城堡已经被其他玩家侵占，获得税收将会减少，是否立即驱逐来敌",
            {
                type:global.dialog.DIALOG_TYPE_CONFIRM,
                closeDelay:0,
                okFunc:function () {
                    //驱逐来敌,跳入战斗画面
                    var visitInfo = global.dataCenter.data.visitinfo;
                    var occupyInfo = undefined;
                    if (visitInfo) {
                        occupyInfo = visitInfo.occupyinfo;
                    }
                    if (occupyInfo) {
                        global.sceneMyZone.killMyZone();
                        global.ui.battleDialog.goToBattlePanel(5, {mode:global.MODE_RESIST, saveId:global.NetManager.uid, enemyId:occupyInfo.occupy});
                    }
                },
                cancelFunc:function () {
                    self._tax();
                }
            }
        );
    };

    proto._taxCallBack = function (data) {
        var oldBuild = this._getBuildInfo();
        global.dataCenter.data.builds[BuildType] = data.data.build;
        if (oldBuild.level != data.data.build.level) {
            this.changeLevel(data.data.build.level);
        }
        global.controller.gameinfoController.update(data.data.gameinfo);
        global.controller.playerStatusController.update(data.data.player);
        this.update();
        if (data.data.gold > 0) {
            var cnt = 20 + (global.dataCenter.getLevel() / 3 | 0);
            var piece = Math.ceil(data.data.gold / cnt);
            var dropgold = data.data.gold;
            var delay = 0;

            while (dropgold > 0) {
                var r = Math.random() - 0.5;
                var r3 = Math.random() - 0.5;
                var interval = 600;
                var icon = textureLoader.createMovieClip('ui', 'harvestGoldIcon2');
                this.mc.addChild(icon);
                this._dropHarvestIcon(icon, 200, 50, 200 + r * 300, 250 + 75 * r3, delay, interval, undefined, function (btn) {
                    return function () {
                        flyIcon(btn, btn.x, btn.y, 200, -300, 1000, null);
                    };
                }(icon));
                dropgold -= piece;
                delay += 150;
            }
            //global.dialog("您收取了" + data.data.gold + '金币');
        }
        global.controller.missionController.update(data.data.mission);
        global.controller.dayMissionController.update(data.data.mission_day);
    };

    function flyIcon(icon, fromX, fromY, toX, toY, interval, callback) {
        if (!icon) return;

        var flyX = new Tween({
            from:fromX,
            to:toX,
            trans:Tween.SIMPLE,
            duration:interval,
            func:function () {
                icon.x = this.tween;
            }
        });
        var flyY = new Tween({
            from:fromY,
            to:toY,
            trans:Tween.BACK_EASE_IN,
            duration:interval,
            func:function () {
                icon.y = this.tween;
            }
        });

        var func = global.ActFunc(function () {
            icon.removeFromParent();
            callback && callback();
        });

        var flyAct = global.ActSeq().add(global.ActSpawn().add(flyX).add(flyY)).add(func);
        flyAct.start();
    }


    global.testGold = function () {
        var data = {};
        data.data = {};
        data.data.gold = 3000;
        var cnt = 20 + (global.dataCenter.getLevel() / 3 | 0);
        var piece = Math.ceil(data.data.gold / cnt);
        var dropgold = data.data.gold;
        var delay = 0;
        var city = global.sceneMyZone.buildingCastle;

        while (dropgold > 0) {
            var r = Math.random() - 0.5;
            var r2 = Math.random() - 0.5;
            var r3 = Math.random() - 0.5;
            var interval = 600;
            var icon = textureLoader.createMovieClip('ui', 'harvestGoldIcon2');
            city.mc.addChild(icon);

            city._dropHarvestIcon(icon, 200, 50, 200 + r * 300, 250 + 75 * r3, delay, interval, undefined, function (btn) {
                return function () {
                    flyIcon(btn, btn.x, btn.y, 200, -300, 1000, null);
                };
            }(icon));
            dropgold -= piece;
            delay += 150;
        }
    };

    proto._tax = function () {
        var buildInfo = this._getBuildInfo();
        var level = buildInfo.level;
        var banklevel = global.dataCenter.getBuildByType(global.BuildType.Store).level;
        var goldLimit = global.configHelper.getGoldLimit(banklevel);

        var self = this;
        if (buildInfo.occupy && buildInfo.occupy != global.NetManager.uid) {
            var income = global.configHelper.getCastleOccupyByLevel(level);
            if (+global.dataCenter.data.player.gold + (+income) > +goldLimit) {
                this._onClickWhenNormalState();
                this.operationPanel.mcBuildingWindowsPanel.getChildByName('win_1').visible = true;
            } else {
                var userid = global.NetManager.uid;
                global.NetManager.call('City', 'tax',
                    {opmode:TaxModeHarvest, gold:income, ownerid:userid, hurryup:0, extra:0},
                    self._taxCallBack.bind(self)
                );
            }
        } else {
            var income = global.configHelper.getCastleIncomeByLevel(level);
            if (+global.dataCenter.data.player.gold + (+income) > +goldLimit) {
                this._onClickWhenNormalState();
            } else {
                var userid = global.NetManager.uid;
                global.NetManager.call('City', 'tax',
                    {opmode:TaxModeHarvest, gold:income, ownerid:userid, hurryup:0, extra:0},
                    self._taxCallBack.bind(self)
                );
            }
        }
    };


    proto._getFriendDataByID = function (id) {

        var friends = global.dataCenter.data.friends;
        for (var friendKey in friends) {
            if (friends[friendKey].uid == id) {
                return friends[friendKey];
            }
        }
        return null;
    };

    proto._onClick = function () {
        var data = this._getBuildInfo();
        if (global.isMyHome) {
            if (data.status == BUILD_STATE_COLLECTING && data.endworktime <= global.common.getServerTime()) {
                if (!data.occupy || data.occupy == global.NetManager.uid) {//没有被侵占或者处于免战状态
                    this._onClickWhenTaxesState();
                } else {
                    this._onClickWhenConquered();
                }
            } else {
                this._onClickWhenNormalState();
            }
        } else {
            var visitInfo = global.dataCenter.data.visitinfo;
            var buildInfo = this._getBuildInfo();

            if (!visitInfo || visitInfo.uid == global.NetManager.uid) return;
            this.operationPanel.textAddHarvest.setText(visitInfo.un + '的城堡Lv' + buildInfo.level);
            var iconArr = [];
            if (!buildInfo.occupy || buildInfo.occupy == global.friendId) {//没有被占领
                iconArr.push(global.OperationPanel.ICON_OCCUPYICON);
                this.operationPanel.updateAppearance(global.OperationPanel.TYPE_WITHOUT_PROCESSING, iconArr);
                this.operationPanel.mcBtnAddHarvest.visible = false;
                this.operationPanel.mcOccupyIcon.setButton(true, function () {
                    if (buildInfo.shielddata - global.common.getServerTime() >= 0) {
                        global.dialog("城堡处于免战期间，不能对其发动侵略");
                    } else {
                        var friendLevel = +buildInfo.level;
                        if (Math.abs(+global.myLevel - friendLevel) > 5) {
                            global.dialog("不能对比你等级高或低5级的玩家发动侵略");
                        } else {
                            //占领
                            global.sceneMyZone.killMyZone();
                            global.ui.battleDialog.goToBattlePanel(5, {mode:global.MODE_CAPTURE, enemyId:global.friendId});
                        }
                    }
                    this.operationPanel.hide();
                }.bind(this));
                this.operationPanel.show();
            }
            else if (buildInfo.occupy == global.NetManager.uid) {//被自己占领
                var occupyHarvestTime = buildInfo.occupyharvest;
                if (occupyHarvestTime - global.common.getServerTime() > 0) {
                    //未完成征收，可抢收
                    iconArr.push(global.OperationPanel.ICON_RETREATICON);
                    iconArr.push(global.OperationPanel.ICON_GARRISON);
                    if (buildInfo.harvesttime < global.configHelper.getCastleTaxLimitCount()) {
                        this.operationPanel.updateAppearance(global.OperationPanel.TYPE_WITH_PROCESSING, iconArr);
                    }
                    else {
                        this.operationPanel.updateAppearance(global.OperationPanel.TYPE_WITHOUT_PROCESSING, iconArr);
                        this.operationPanel.mcBtnAddHarvest.visible = false;
                    }
                    this.operationPanel.show();
                }
                else {
                    var self = this;
                    global.NetManager.call("City", "tax", {'gold':0, 'opmode':TaxModeHarvest, 'hurryup':0, 'extra':0, 'ownerid':global.friendId },
                        function (netdata) {
                            var data = netdata["data"];
                            if (!data) return;
                            var visitinfo = data["visitinfo"];
                            var build = data["build"];

                            global.controller.buildingController.update(build);
                            global.controller.playerStatusController.update(data.player);
                            //if (visitinfo) global.dataCenter.data.visitinfo = visitinfo;

                            var friend = self._getFriendDataByID(global.friendId);
                            if (friend) {
                                friend.occupyharvest = build.occupyharvest;
                                friend.occupy = build.occupy;
                                global.uiFriendList.update();
                            }
                            if (data["heros"]) {
                                global.dataCenter.data.heros = data.heros;
                            }

                            var finish_item = visitinfo["finish_item"];
                            if (finish_item) {
                                for (var key in finish_item) {
                                    var item = finish_item[key];
                                    var itemInfo = global.ItemFunction.getItemInfo(item["type"], item["id"]);
                                    if (itemInfo) {
                                        global.dataCenter.addItem(item.type, item.id, item.count);
                                    }
                                }
                            }
                            global.controller.missionController.update(data.mission);
                            global.controller.dayMissionController.update(data.mission_day);
                            var occupygold = visitinfo.occupygold;
                            if (occupygold) {

                            }
                        }
                    );
                }
            }
            else {//被他人占领
                var occupyInfo = visitInfo.occupyinfo;
                if (occupyInfo && occupyInfo.un) {
                    this.operationPanel.textAddHarvest.setText(visitInfo.un + '的城堡Lv' + buildInfo.level + '被' + occupyInfo.un + '占领');
                    var iconArr = [];
                    iconArr.push(global.OperationPanel.ICON_RELEASEICON);
                    this.operationPanel.updateAppearance(global.OperationPanel.TYPE_WITHOUT_PROCESSING, iconArr);
                    this.operationPanel.mcBtnAddHarvest.visible = false;
                    this.operationPanel.mcReleaseIcon.setButton(true, function () {
                        var buildinfo = this._getBuildInfo();
                        if (+buildinfo.shielddata >= global.common.getServerTime()) {
                            global.dialog("对方处于免战期间，无法对其发动战争");
                        } else {
                            var occupyLevel = +occupyInfo.level;
                            if (Math.abs(+global.myLevel - occupyLevel) > 5) {
                                global.dialog("不能对比你等级高或低5级的玩家发动战争");
                            } else {
                                /// 解救
                                global.sceneMyZone.killMyZone();
                                global.ui.battleDialog.goToBattlePanel(5, {mode:global.MODE_RELEASE, saveId:global.friendId, enemyId:occupyInfo.occupy});
                            }
                        }
                        this.operationPanel.hide();
                    }.bind(this));
                    this.operationPanel.show();
                }
            }
        }
    };

    proto._dropHarvestIcon = function (icon, fromX, fromY, tx, ty, delay, interval, userdata, callback) {
        if (!icon) return;

        icon.x = fromX;
        icon.y = fromY;
        icon.visible = false;
        var duration = interval || 800;
        delay = delay || 0;
        var delayAct = global.ActDelay(delay);
        var visibleAct = global.ActFunc(function () {
            icon.visible = true;
        });
        var callbackAct = global.ActFunc(function () {
            callback && callback(userdata);
        });
        var actDropX = new Tween({
            from:fromX,
            to:tx,
            trans:Tween.SIMPLE,
            duration:duration,
            func:function () {
                icon.x = this.tween;
            }
        });

        var actDropY = new Tween({
            from:fromY,
            to:ty,
            trans:Tween.BACK_EASE_IN,
            duration:duration,
            func:function () {
                icon.y = this.tween;
            }
        });
        var stayFloorAct = global.ActDelay(2000);
        var actDrop = global.ActSeq().add(delayAct).add(visibleAct).add(global.ActSpawn().add(actDropX).add(actDropY)).add(stayFloorAct).add(callbackAct);
        actDrop.start();
        //harvestcoin["isharvest"] = isharvest;
        //harvestcoin.data = mount;
    };

    proto._onClickWhenTaxesState = function () {
        this._tax();
    };

    proto._onClickWhenNormalState = function () {
        this.showOperationPanel();
    };

    proto._getLegion = function () {
        var troops = global.dataCenter.data.troops;
        if (troops) {
            var location = 0;
            if (global.isMyHome) {
                location = global.NetManager.uid;
            } else {
                location = global.friendId;
            }
            for (var key in troops) {
                if (troops[key].location == location) {
                    return troops[key];
                }
            }
        }
    };

    proto._garrision = function () {
        global.sceneMyZone.killMyZone();
        global.battleReportReader = new global.BattleReportReader();
        var callBack = function () {
            var data = {bg:5, fog:true, legion:undefined, isGarrision:true};
            if (global.battleWorld == null) {
                global.battleWorld = new global.BattleWorld(data);
                global.stage.addChild(global.battleWorld.getDisplayObject());
            }
            var defaultLegion = this._getLegion();
            global.editFormationPanel.gotoGarrisionLayer(defaultLegion ? defaultLegion.troopid : 0);
        }.bind(this);
        global.BattleManager.setEndCallBack(function () {
            global.configHelper.destorySkillConfig();
            global.sceneMyZone.initMyZone();
        });
        global.BattleManager.loadAssets(callBack);
    };

    proto._retreat = function () {
        global.editFormationPanel.retrateGarrision(false);
    };

    proto._addHarvest = function () {
        var self = this;
        var taxLimitCountPerDay = global.configHelper.getCastleTaxLimitCount();
        /// workdata 就是今天已经收税的次数
        var data = this._getBuildInfo();
        var extraHarvestCount = data.workdata - taxLimitCountPerDay;
        if (extraHarvestCount >= 0) {
            var extraCount = global.configHelper.getItemSpendByExtraTime(extraHarvestCount);
            if (extraCount >= 0) {
                var extraItem = global.ItemFunction.getHarvestextra();
                if (extraItem.counter >= extraCount) {
                    var userId = global.isMyHome ? global.NetManager.uid : global.friendId;
                    global.NetManager.call("City", "tax", {"opmode":TaxModeMore, "ownerid":userId, "hurryup":0, "extra":extraCount, "gold":0},
                        self._taxCallBack.bind(self));
                } else {
                    var itemInfo = global.ItemFunction.getItemInfo(extraItem.type, extraItem.id);
                    global.dialog('加收所需的' + extraCount + '个' + itemInfo.name + '不足');
                }
            } else {
                global.dialog("当天收税已经达到最大上限，无法再进行收取");
            }
        }
    };

    proto._levelUp = function () {
        global.ui.uiBuildDialog.show(BuildType);
    };

    proto._canLevelUp = function () {
        var data = this._getBuildInfo();
        var curExp = global.dataCenter.data.player.exp;
        var levelUpNeedExp = global.configHelper.getBuildLevelUpCondition(BuildType, data.level + 1).exp;

        return curExp >= levelUpNeedExp;
    };

    proto.showOperationPanel = function () {
        var data = this._getBuildInfo();
        var status = data.status;
        var type = global.OperationPanel.TYPE_WITH_PROCESSING;
        var taxLimitCountPerDay = global.configHelper.getCastleTaxLimitCount();
        if (0 == status) {
            type = global.OperationPanel.TYPE_WITHOUT_PROCESSING;
            var extraHarvestCount = data.workdata - taxLimitCountPerDay;
            var extraCount = 0;
            if (extraHarvestCount >= 0) {
                extraCount = global.configHelper.getItemSpendByExtraTime(extraHarvestCount);
            }
            var harvestextra = global.ItemFunction.getHarvestextra();
            var itemInfo = global.ItemFunction.getItemInfo(harvestextra.type, harvestextra.id);
            var text = '需要' + extraCount + '/' + harvestextra.counter + '个' + itemInfo.name + '进行加速操作';
            this.operationPanel.textAddHarvest.setText(text);
        }

        var iconArr = [];
        iconArr.push(global.OperationPanel.ICON_GARRISON);

        if (this._getLegion()) {
            iconArr.push(global.OperationPanel.ICON_RETREATICON);
        }
        if (this._canLevelUp()) {
            iconArr.push(global.OperationPanel.ICON_UPICON);
        }
        /// workdata 就是今天已经收税的次数
        this.operationPanel.show();
        this.operationPanel.updateAppearance(type, iconArr);
    };

    proto._onSecond = function () {
        /// workdata 就是今天已经收税的次数
        var data = this._getBuildInfo();
        var harvestTime;
        if (global.isMyHome) {
            harvestTime = data.endworktime;
        } else {
            /// 只有被自己占领时才会显示金币
            if (data.occupy == global.NetManager.uid) {
                harvestTime = data.occupyharvest;
            } else {
                harvestTime = global.common.getServerTime() + 100000;
            }
        }

        if (data.status == BUILD_STATE_COLLECTING && harvestTime <= global.common.getServerTime()) {
            if (!this.topTip) {
                this.addTopTip('harvestGoldIcon');
            }
        } else {
            if (this.topTip) {
                this.delTopTip();
            }
        }

        if (!this.operationPanel.isLock) {
            var time = harvestTime;
            time -= global.common.getServerTime();
            if (time > 0) {
                this.operationPanel.textTimer.setText(global.common.second2stand(time));
            }
        }

        if (this.freeIcon && this.freeIcon.visible) {
            var buildInfo = this._getBuildInfo();
            var timeLabel = this.freeIcon.getChildByName('time_text');
            var leftTime = buildInfo.shielddata - global.common.getServerTime();
            if (leftTime >= 0) {
                timeLabel && timeLabel.setText(global.common.second2stand(leftTime));
            }
        }
        this.updateIcon();
    };

    global.BuildingCastle = BuildingCastle;

})();
