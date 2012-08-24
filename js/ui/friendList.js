/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-22
 * Time: 下午6:20
 *
 */

/**
 * 好友列表
 *
 * 单例
 */

(function () {
    // 好友列表item
    var proto = FriendListItem.prototype;

    function FriendListItem(index, mc, invitable) {
        this.index = index;
        this.mc = mc;
        this.userInfo = null;
        this.invitable = invitable;
        this.onInvite = this._invite.bind(this);

        this.inviteBtn = this.mc.getChildByName('invite_btn');
        this.inviteBtn.setButton(true, this.onInvite);
        this.inviteGold = this.mc.getChildByName('invite_friend');

        this.treasureIcon = this.mc.getChildByName('treasure_icon');
        this.treasureIcon.visible = false;

        this.userPhoto = this.mc.getChildByName('photo');
        this.bg = this.mc.getChildByName('bg');
        this.bg.gotoAndStop(1);
        this.goldIcon = this.mc.getChildByName('gold_icon');
        this.levelText = this.mc.getChildByName('level');
        this.stateBtn = this.mc.getChildByName('state_btn');
        this.stateBtn.gotoAndStop(1);

        this.diamondBtn = this.mc.getChildByName('diamond');
        this.diamondBtn.visible = false;

        this.nameText = this.mc.getChildByName('nameText');

        this.mc.setOnClick(function () {
            // 去好友家
            if (this.userInfo) {
                if (global.isMyHome && this.userInfo.uid == global.NetManager.uid) return;
                if (!global.isMyHome && this.userInfo.uid == global.friendId) return;

                if (global.isMyHome) {
                    global.myLevel = global.dataCenter.getLevel();
                    var oldDataCenter = {};
                    for(var key in global.dataCenter){
                        oldDataCenter[key] = global.dataCenter[key];
                    }
                    oldDataCenter.data = {};
                    var data = oldDataCenter.data;

                    for(var key in data){
                        data[key] = oldDataCenter.data[key];
                    }
                    global.oldDataCenter = global.dataCenter;
                }
                global.visitFriend.visit(this.userInfo.uid, this.userInfo.un, this.userInfo.headpic, true);
            }
        }.bind(this));

        this.update();
    }

    global.myLevel = 0;

    proto.update = function () {
        if (this.invitable) {
            this.mc.addEventListener(Event.MOUSE_CLICK, this.onInvite);
            this.inviteGold.visible = true;
            this.inviteBtn.visible = true;
            this.inviteBtn.setIsEnabled(true);
            this.stateBtn.visible = false;
            this.goldIcon.visible = false;
            return;
        }

        this.mc.removeEventListener(Event.MOUSE_CLICK, this.onInvite);
        this.inviteBtn.visible = false;
        this.inviteGold.visible = false;

        if (!this.userInfo) return;

        this.userPhoto.setImage(this.userInfo.headpic);
        this.nameText.setText(this.userInfo.un);
        this.levelText.setText(this.userInfo.level);
        this.goldIcon.visible = false;

        var fid = this.userInfo.uid;
        if (fid == global.NetManager.uid) {
            // 自己
            if (global.isMyHome) {
                this.treasureIcon.visible = (global.dataCenter.data.playermark.logongift == 0);
            } else {
                this.treasureIcon.visible = false;
            }
            this.goldIcon.visible = false;
            if (this.userInfo.occupy == 0 ||
                this.userInfo.occupy == global.NetManager.uid) {
                if (this.userInfo.shielddata > global.common.getServerTime()) {
                    this.stateBtn.visible = true;
                    this.stateBtn.gotoAndStop(3);
                }
                else {
                    this.stateBtn.visible = false;
                }
            }
            else {
                this.stateBtn.visible = true;
                this.stateBtn.gotoAndStop(1);
            }
        } else {
            // 好友
            if (this.userInfo.shielddata > global.common.getServerTime()) {
                // 免战中
                this.stateBtn.visible = true;
                this.stateBtn.gotoAndStop(3);
            } else {
                this.stateBtn.visible = false;
            }

            if (this.userInfo.occupy && this.userInfo.occupy != this.userInfo.uid) {
                if (this.userInfo.occupy != global.NetManager.uid) {
                    // 被别人占领
                    this.stateBtn.visible = true;
                    this.stateBtn.gotoAndStop(1);
                } else {
                    // 被自己占领
                    this.stateBtn.visible = true;
                    this.stateBtn.gotoAndStop(2);

                    // 判断是可以收金币
                    var jail = global.dataCenter.data.jail;
                    if ((fid in jail) && (jail[fid].harvesttime < global.configHelper.getCastleTaxLimitCount())
                        && (this.userInfo.occupyharvest <= global.common.getServerTime())) {
                        this.goldIcon.visible = true;
                    }
                }
            }
        }
    };

    proto.updateStatusIcon = function () {
        if (!this.userInfo) {
            return;
        }
        var fid = this.userInfo.uid;
        if (fid == global.NetManager.uid) {
            // 自己
            if (this.userInfo.occupy == 0 ||
                this.userInfo.occupy == global.NetManager.uid) {
                if (this.userInfo.shielddata > global.common.getServerTime()) {
                    this.stateBtn.visible = true;
                    this.stateBtn.gotoAndStop(3);
                }
                else {
                    this.stateBtn.visible = false;
                }
            }
        } else {
            // 好友
            if (this.userInfo.occupy == 0 || this.userInfo.occupy == fid) {
                if (this.userInfo.shielddata > global.common.getServerTime()) {
                    // 免战中
                    this.stateBtn.visible = true;
                    this.stateBtn.gotoAndStop(3);
                } else {
                    this.stateBtn.visible = false;
                }
            } else if (this.userInfo.occupy != global.NetManager.uid) {

            } else {
                // 判断是可以收金币
                var jail = global.dataCenter.data.jail;
                if ((fid in jail) && (jail[fid].harvesttime < global.configHelper.getCastleTaxLimitCount())
                    && (this.userInfo.occupyharvest <= global.common.getServerTime())) {
                    this.goldIcon.visible = true;
                }
            }
        }
    };

    proto._invite = function () {
        var i = 0;
    };

    global.FriendListItem = FriendListItem;
})();

(function () {
    // 仇人列表item
    var proto = EnmityListItem.prototype;

    function EnmityListItem(parent, index, mc) {
        this.parent = parent;
        this.index = index;
        this.mc = mc;
        this.userInfo = null;
        this.selected = false;

        this.enterBtn = this.mc.getChildByName('enter_btn');
        this.deleteBtn = this.mc.getChildByName('delete_btn');

        this.bg = this.mc.getChildByName('bg');
        this.bg.gotoAndStop(1);

        this.stateBtn = this.mc.getChildByName('state_btn');
        this.stateBtn.gotoAndStop(1);
        this.goldIcon = this.mc.getChildByName('gold_icon');
        this.levelText = this.mc.getChildByName('level');
        this.userPhoto = this.mc.getChildByName('photo');
        this.nameText = this.mc.getChildByName('nameText');

        this.diamondBtn = this.mc.getChildByName('diamond');
        this.diamondBtn.visible = false;

        this.mc.addEventListener(Event.MOUSE_CLICK, this._onSelected.bind(this));

        this.enterBtn.setButton(true, function (e) {
            // 去仇人家
            if (this.userInfo) {
                global.visitFriend.visit(this.userInfo.uid, this.userInfo.un, this.userInfo.headpic, false);
            }
            ;
            this.enterBtn.visible = this.deleteBtn.visible = false;
        }.bind(this));

        this.deleteBtn.setButton(true, function (e) {
            // 删除仇人
            this.enterBtn.visible = this.deleteBtn.visible = false;
            this.onDeleteEnemy();
        }.bind(this));

        this.update();
    }

    proto.onDeleteEnemy = function () {
        if (this.userInfo) {
            global.NetManager.call("Player", "delneighbor", {'fid':this.userInfo.uid }, function (data) {
                global.controller.missionController.update(data.data.mission);
                global.controller.enemyController.update(data.data.neighbor);
            }, "删除仇人失败");
        }
    };

    proto.update = function () {
        this.enterBtn.visible = this.deleteBtn.visible = this.selected && this.userInfo;
        if (!this.userInfo) {
            this.nameText.setText('');
            this.levelText.setText('');
            this.goldIcon.visible = false;
            this.stateBtn.visible = false;
            this.diamondBtn.visible = false;
        } else {

            this.nameText.setText(this.userInfo.un);
            this.levelText.setText(this.userInfo.level);
            this.userPhoto.setImage(this.userInfo.headpic);
            this.goldIcon.visible = false;

            if (this.userInfo.occupy == 0 || this.userInfo.occupy == this.userInfo.uid) {
                if (this.userInfo.shielddata > global.common.getServerTime()) {
                    //免战中
                    this.stateBtn.visible = true;
                    this.stateBtn.gotoAndStop(3);
                } else {
                    this.stateBtn.visible = false;
                }
            }
            else if (this.userInfo.occupy != global.NetManager.uid) {
                this.stateBtn.visible = true;
                this.stateBtn.gotoAndStop(1);
            } else {
                var jailDatas = global.dataCenter.data.jail;
                var bIsPrisonerOfMe = false;
                if (jailDatas) {
                    for (var prisoner in jailDatas) {
                        var jailData = jailDatas[prisoner];
                        if (jailData.prisoner == this.userInfo.uid) {
                            bIsPrisonerOfMe = true;
                            break;
                        }
                    }
                }

                this.goldIcon.visible = bIsPrisonerOfMe
                    && this.userInfo.occupyharvest
                    && this.userInfo.occupyharvest < global.common.getServerTime();

                this.stateBtn.visible = true;
                this.stateBtn.gotoAndStop(2);
            }
        }
    };

    proto.updateStatusIcon = function () {
        if (!this.userInfo) return;

        if (this.userInfo.occupy == 0 || this.userInfo.occupy == this.userInfo.uid) {
            if (this.userInfo.shielddata > global.common.getServerTime()) {
                //免战中
                this.stateBtn.visible = true;
                this.stateBtn.gotoAndStop(3);
            } else {
                this.stateBtn.visible = false;
            }
        }
        else if (this.userInfo.occupy != global.NetManager.uid) {

        } else {
            var jailDatas = global.dataCenter.data.jail;
            var bIsPrisonerOfMe = false;
            if (jailDatas) {
                for (var prisoner in jailDatas) {
                    var jailData = jailDatas[prisoner];
                    if (jailData.prisoner == this.userInfo.uid) {
                        bIsPrisonerOfMe = true;
                        break;
                    }
                }
            }

            this.goldIcon.visible = bIsPrisonerOfMe
                && this.userInfo.occupyharvest
                && this.userInfo.harvesttime < global.configHelper.getCastleTaxLimitCount()
                && this.userInfo.occupyharvest < global.common.getServerTime();

            this.stateBtn.visible = true;
            this.stateBtn.gotoAndStop(2);
        }
    };

    proto._onSelected = function () {
        this.parent.enmitySelected(this.index);
    };

    global.EnmityListItem = EnmityListItem;
})();

(function () {

    var isExpanded = true;
    var expandLock = false;
    var expandHeight;
    var expandDuration = 400;
    var transMode = Tween.STRONG_EASE_OUT;
    var citySceneY;
    var mainPanelY;
    var friendItemCount = 6;

    var enmityItemCount = 7;

    var friendTurnPage;
    var enmityTurnPage;

    var proto = FriendList.prototype;


    function FriendList() {
        this.inited = false;
        this.friendItems = [];
        this.enmityItems = [];
    }

    proto.init = function () {
        if (this.inited) {
            return;
        }


        this.mainPanel = textureLoader.createMovieClip('ui', 'bottomLayerBg');
        mainPanelY = this.mainPanel.y = global.GAME_HEIGHT - this.mainPanel.getHeight();
        this.mainPanel.x = (global.GAME_WIDTH - this.mainPanel.getWidth()) / 2;
        citySceneY = global.sceneMyZone.cityScene.y;

        // 好友列表面板
        this.friendPanel = this.mainPanel.getChildByName('Friend_panel').getChildByName('friend_dialog');
        var friendTurnPageButtons = {'left':null, 'right':null, 'head':null, 'end':null};

        for (var btnName in friendTurnPageButtons) {
            var btn = this.friendPanel.getChildByName(btnName);
            btn.setButton(true, null);
            friendTurnPageButtons[btnName] = btn;
        }

        for (var i = 1; i <= friendItemCount; i++) {
            this.friendItems.push(
                new global.FriendListItem(i, this.friendPanel.getChildByName('friend_item_' + i), false)
            );
        }
        // 右侧的邀请Item
        new global.FriendListItem(i, this.friendPanel.getChildByName('friend_item_' + i), true);

        // 仇人列表面板
        this.enmityPanel = this.mainPanel.getChildByName('Enmity_panel').getChildByName('enemy_dialog');
        this.enmityPanel.visible = false;

        var enmityTurnPageButtons = {'left':null, 'right':null, 'head':null, 'end':null};

        for (var btnName in enmityTurnPageButtons) {
            var btn = this.enmityPanel.getChildByName(btnName);
            btn.setButton(true, null);
            enmityTurnPageButtons[btnName] = btn;
        }

        for (var i = 1; i <= enmityItemCount; i++) {
            this.enmityItems.push(
                new global.EnmityListItem(this, i, this.enmityPanel.getChildByName('enmity_item_' + i))
            );
        }

        // 好友列表翻页
        var onFriendPage = this._onFriendPage.bind(this);
        friendTurnPage = new UIComponent.PageTurn(friendTurnPageButtons['left'],
            friendTurnPageButtons['right'],
            2, null, onFriendPage, onFriendPage);
        friendTurnPage.setHeadTail(friendTurnPageButtons['head'], friendTurnPageButtons['end'],
            onFriendPage, onFriendPage);

        // 仇人列表翻页
        var onEnmityPage = this._onEnmityPage.bind(this);
        enmityTurnPage = new UIComponent.PageTurn(enmityTurnPageButtons['left'],
            enmityTurnPageButtons['right'],
            2, null, onEnmityPage, onEnmityPage);
        enmityTurnPage.setHeadTail(enmityTurnPageButtons['head'], enmityTurnPageButtons['end'],
            onEnmityPage, onEnmityPage);

        // 打开,关闭好友列表
        this.settingBtnExpand = this.mainPanel.getChildByName('SettingBtn2');
        this.settingBtnExpand.setButton(true, this._handleExpandCollapse.bind(this));
        this.settingBtnExpand.visible = false;

        this.settingBtnCollapse = this.mainPanel.getChildByName('SettingBtn1');
        this.settingBtnCollapse.setButton(true, this._handleExpandCollapse.bind(this));

        // 左侧好友,仇人按钮
        this.friendBtn = this.mainPanel.getChildByName('friend_btn');
        this.friendBtn.gotoAndStop(1);
        this.friendBtn.addEventListener(Event.MOUSE_DOWN, function (e) {
            if (this.friendPanel.visible) {
                // 被选中中
                this.friendBtn.gotoAndStop(2);
            } else {
                this.friendBtn.gotoAndStop(5);
            }
        }.bind(this));
        this.friendBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
            this.friendBtn.gotoAndStop(1);
            this.enmityBtn.gotoAndStop(4);

            this.friendPanel.visible = true;
            this.enmityPanel.visible = false;
        }.bind(this));

        this.enmityBtn = this.mainPanel.getChildByName('enmity_btn');
        this.enmityBtn.gotoAndStop(4);
        this.enmityBtn.addEventListener(Event.MOUSE_DOWN, function (e) {
            if (this.enmityBtn.visible) {
                // 被选中中
                this.enmityBtn.gotoAndStop(2);
            } else {
                this.enmityBtn.gotoAndStop(5);
            }
        }.bind(this));
        this.enmityBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
            this.friendBtn.gotoAndStop(4);
            this.enmityBtn.gotoAndStop(1);

            this.friendPanel.visible = false;
            this.enmityPanel.visible = true;
        }.bind(this));

        this.nameText = this.mainPanel.getChildByName('nameText');
        this.nameText.setText('用户名字');

        this.diamondBtn = this.mainPanel.getChildByName('diamond');
        this.diamondBtn.visible = false;

        this.friendNumText = this.mainPanel.getChildByName('friend_num_text');
        this.enmityNumText = this.mainPanel.getChildByName('enmity_num_text');

        // 功能按钮: 建造,英雄,出征,商城,物品,消息,帮助
        this.mainPanel.getChildByName('Icon_Build').setButton(true, function (e) {
            global.ui.uiBuildDialog.show(0);
        });

        this.mainPanel.getChildByName('Icon_Hero').setButton(true, function (e) {
            global.heroDialog.showDialog();
        });

        this.mainPanel.getChildByName('Icon_Fighting').setButton(true, function (e) {
            var heroCount = global.dataCenter.getHeroCount() - global.dataCenter.getHeroCount(0);
            if(heroCount == 0){
                global.dialog("请先到酒馆雇佣英雄");
                return;
            }
            global.waitingPanel.show();
            global.waitingPanel.setText('进入战斗地图中');
            global.sceneMyZone.killMyZone();
            global.ui.battleDialog.showDialog();
        });

        this.mainPanel.getChildByName('Icon_Shop').setButton(true, function (e) {
            global.ui.shopDialog.showDialog();
        });

        this.mainPanel.getChildByName('Icon_Goods').setButton(true, function (e) {
            global.ui.itemDialog.showDialog();
        });

        var reportIcon = this.getReportIcon();
        reportIcon && reportIcon.setOnClick(function (e) {
            global.ui.battleReportDialog.showDialog(true);
        });

        this.updateReportIcon();

        /*
         this.mainPanel.getChildByName('Battle_Report_Icon').getChildByName('battle_new_icon').visible = false;
         */

        this.mainPanel.getChildByName('Help_Icon').visible = false;
        /*
         this.mainPanel.getChildByName('Help_Icon').setButton(true, function(e) {
         global.dialog('尚未开放');
         });
         */
        expandHeight = this.mainPanel.getHeight() - this.settingBtnExpand.getHeight() - 9;
        global.stage.getChildByName('gameUiLayer').addChild(this.mainPanel);

        this.inited = true;
        this.update();
        global.gameSchedule.scheduleFunc(this.updateStatus.bind(this), 1000);

    };

    proto._handleExpandCollapse = function () {
        if (expandLock) {
            return;
        }
        if (isExpanded) {
            this._collapse();
        } else {
            this._expand();
        }

        isExpanded = !isExpanded;
        this.settingBtnExpand.visible = !isExpanded;
        this.settingBtnCollapse.visible = isExpanded;
    };

    proto._expand = function () {
        this._lock();
        var self = this;
        var action = Tween({
            trans:transMode,
            from:0,
            to:expandHeight,
            duration:expandDuration,
            func:function () {
                self.mainPanel.y = mainPanelY + expandHeight - this.tween;
                global.sceneMyZone.cityScene.y = citySceneY + expandHeight - this.tween;
            }
        });
        global.ActSpawn().add(action).add(this._unlock).start();
    };

    proto._collapse = function () {
        this._lock();
        var self = this;
        var action = Tween({
            trans:transMode,
            from:0,
            to:expandHeight,
            duration:expandDuration,
            func:function () {
                self.mainPanel.y = mainPanelY + this.tween;
                global.sceneMyZone.cityScene.y = citySceneY + this.tween;
            }
        });
        global.ActSpawn().add(action).add(this._unlock).start();
    };

    proto._unlock = function () {
        expandLock = false;
    };

    proto._lock = function () {
        expandLock = true;
    };

    proto._onFriendPage = function (page) {
        var friends = this.friends;
        var friendCount = friends.length;
        for (var i = 0; i < friendItemCount; i++) {
            var friendItem = this.friendItems[i];
            var friendIndex = (page * friendItemCount + i);
            if (friendIndex >= friendCount) {
                // 填充邀请好友
                friendItem.invitable = true;
            } else {
                friendItem.invitable = false;
                friendItem.userInfo = friends[friendIndex];
            }
            friendItem.update();
        }
    };

    proto._onEnmityPage = function (page) {
        var enemys = this.enemys;
        var enemyCount = enemys.length;
        for (var i = 0; i < enmityItemCount; ++i) {
            var enemyItem = this.enmityItems[i];
            var enemyIndex = (page * enmityItemCount + i);
            if (enemyIndex >= enmityItemCount) {
                enemyItem.enable = false;
            } else {
                enemyItem.enable = true;
                enemyItem.userInfo = enemys[enemyIndex];
            }
            enemyItem.update();
        }
    };

    proto.enmitySelected = function (index) {
        if (index < 1 || index > enmityItemCount) {
            return;
        }

        for (var i = 1; i <= enmityItemCount; i++) {
            this.enmityItems[i - 1].selected = (i == index );
            this.enmityItems[i - 1].update();
        }
    };

    proto.updateStatus = function () {
        for (var i = 0; i < friendItemCount; ++i) {
            this.friendItems[i].updateStatusIcon();
        }
        for (var i = 0; i < enmityItemCount; ++i) {
            this.enmityItems[i].updateStatusIcon();
        }
    };

    proto.update = function () {
        if(!this.inited) return;
        this.updateFriendsData();
        this.updateEnemyData();
        var friends = this.friends;
        this.friendNumText.setText(friends.length - 1);
        friendTurnPage.changePageCount(Math.ceil(friends.length / friendItemCount));
        this._onFriendPage(friendTurnPage.pageCursor - 1);
        this.enmityNumText.setText(this.enemys.length);
        enmityTurnPage.changePageCount(Math.ceil(this.enemys.length / enmityItemCount));
        this._onEnmityPage(enmityTurnPage.pageCursor - 1);
    };

    proto.updateFriendsData = function () {
        var myself = undefined;
        if (global.isMyHome) {
            this.friends = [];
            myself = {};
            myself.uid = global.NetManager.uid;
            myself.un = global.NetManager.un;
            myself.headpic = global.NetManager.headpic;
            myself.platfromid = 4;
            var castle = global.dataCenter.getBuildByType(global.BuildType.Castle);
            myself.level = castle.level;
            myself.occupy = castle.occupy;
            myself.occupyharvest = castle.occupyharvest;
            myself.shielddata = castle.shielddata;
            myself.ismale = global.dataCenter.data.player.ismale;
            myself.vip = global.dataCenter.data.playerinfo.vip;
            myself.viplevel = global.dataCenter.data.playerinfo.viplevel;
            myself.box = global.dataCenter.data.playermark.logongift;
        } else {
            if (this.friends) {
                for (var i = 0; i < this.friends.length; ++i) {
                    if (this.friends[i].uid == global.NetManager.uid) {
                        myself = this.friends[i];
                        break;
                    }
                }
            }
        }
        this.friends = [];
        if (myself) {
            this.friends.push(myself);//第一个好友是自己
        }
        var friends = global.dataCenter.data.friends;
        if (friends) {
            for (var i = 0; i < friends.length; ++i) {
                this.friends.push(friends[i]);
            }
        }
    };

    function compareEnemy(enemy1, enemy2) {
        return enemy2.level - enemy1.level;
    }

    proto.updateEnemyData = function () {
        this.enemys = [];
        var enemys = global.dataCenter.data.neighbor;
        for (var key in enemys) {
            this.enemys.push(enemys[key]);
        }
        this.enemys.sort(compareEnemy);
    };

    proto.realloc = function () {
        global.uiFriendList = new FriendList();
    };

    proto.getReportIcon = function () {
        if (this.mainPanel) {
            return this.mainPanel.getChildByName('Battle_Report_Icon');
        }
    };

    proto.updateReportIcon = function () {
        var reportIcon = this.getReportIcon();
        if (global.dataCenter.data.newreport) {
            reportIcon && reportIcon.gotoAndStop(1);
        } else {
            reportIcon && reportIcon.gotoAndStop(2);
        }
    }

    global.uiFriendList = new FriendList();

    global.controller.friendsController = {update:function (friends) {
        if (!friends) return;
        global.dataCenter.data.friends = friends;
        global.uiFriendList.update();
    }};

    global.controller.enemyController = {update:function (neighbors) {
        if (!neighbors) return;
        global.dataCenter.data.neighbor = neighbors;
        global.uiFriendList.update();
    }};

})();
