/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-5-2
 * Time: 下午2:19
 *
 */

/// 用于主界面的消息按钮点击相应的消息弹窗以及战报显示
(function () {

    var proto = BattleReportDialog.prototype;

    /// 顶部按钮的名字和其回调函数的对应表
    var topBtnNames = {
        'full_btn':{type:0, func:undefined},
        'assault_btn':{type:2, func:undefined},
        'guard_btn':{type:1, func:undefined},
        'notice_btn':{type:3, func:undefined},
        'messagee_btn':{type:4, func:undefined}
    };

    function BattleReportDialog() {
        this.isShowing = false;
        this.width = 698;
        this.height = 406;
        this.linesPerPage = 6;
        this.curPage = 0;
        this.curChooseTopBtn = 'full_btn';
    }

    proto._updateTopBtnOnPressDown = function (btnname) {
        if (!btnname) return;

        var topBtnNormal = this.mc.getChildByName(btnname + '_1');
        var topBtnDropDown = this.mc.getChildByName(btnname + '_2');
        if (topBtnNormal && topBtnDropDown) {
            for (var key in topBtnNames) {
                this.mc.getChildByName(key + '_2').visible = false;
                this.mc.getChildByName(key + '_1').visible = true;
            }
            topBtnNormal.visible = false;
            topBtnDropDown.visible = true;
            this.curChooseTopBtn = btnname;
        }
    }

    proto._bindTopBtnEvent = function () {
        var self = this;
        this._updateTopBtnOnPressDown(this.curChooseTopBtn);
        for (var key in topBtnNames) {
            this.mc.getChildByName(key + '_1').addEventListener(Event.MOUSE_CLICK, function (name) {
                return function () {
                    if (self.curChooseTopBtn != name) {
                        self._updateTopBtnOnPressDown(name);
                        self._updateReportData();
                        self._changePage(0);
                    }
                };
            }(key));
        }
    };

    proto._bindCenterPanelEvent = function () {
        for (var i = 1; i <= this.linesPerPage; ++i) {
            var item = this.mc.getChildByName('battle_report_item_' + i);
            var timeLabel = item.getChildByName('text_1');
            var introLabel = item.getChildByName('text_2');
            var watchBtn = item.getChildByName('watch_btn');
            var releaseBtn = item.getChildByName('release_btn');

            timeLabel.setText();
            introLabel.setText();
            var self = this;
            watchBtn.setButton(true, function (index) {
                return function () {
                    var report = self.curTypeReports[index + self.curPage * self.linesPerPage - 1];
                    if (report && report.url && report.url.length != 0) {
                        global.NetManager.call("Hero", "replay", {"url":report.url, json:1}, function (data) {
                            if(data && data.data && data.data.content != ""){
                                global.BattleManager.playReport(5,data.data.content);

                            }
                        },
                        "获取战报中");
                    }
                };
            }(i));

            releaseBtn.setButton(true, function (reportItem) {
                return function () {

                };
            }(item));
        }
    };

    proto._updateReportData = function () {
        var type = topBtnNames[this.curChooseTopBtn].type;
        if (0 == type) {
            this.curTypeReports = this.reports;
        } else {
            this.curTypeReports = [];
            for (var i = 0, length = this.reports.length; i < length; ++i) {
                if (this.reports[i].type == type) {
                    this.curTypeReports.push(this.reports[i]);
                }
            }
        }
    };

    proto._getTotalPage = function () {
        return this.curTypeReports ? (((this.curTypeReports.length - 1) / this.linesPerPage | 0) + 1) : 0;
    };

    proto._changePage = function (page) {
        var totalPage = this._getTotalPage();
        if (page < 0 || page >= totalPage) return;

        this.curPage = page;
        this._updatePageBtn();
        this.mc.getChildByName('number_text').setText((this.curPage + 1) + '/' + totalPage);
        this._updateItem();
    };

    proto._requestReportData = function () {
        global.NetManager.call("Player", "GetReportMsg", null, this._onReportDataBack.bind(this), "刷新数据中");
    };

    function compareReport(report1, report2) {
        return report2.time - report1.time;
    }

    proto._onReportDataBack = function (data) {
        var dataobj = data["data"];
        global.controller.missionController.update(dataobj.mission);
        global.controller.playerStatusController.update(dataobj.player);

        if (dataobj.heros) {
            global.dataCenter.data.heros = dataobj.heros;
        }
        global.controller.buildingController.update(dataobj.build);
        var occupyinfo = dataobj["occupyinfo"];
        if (dataobj["troops"]) {
            global.dataCenter.data.troops = dataobj["troops"];
        }
        this.reports = dataobj.reports;
        this.reports.sort(compareReport);
        this._updateReportData();
        this._updateDialog();

    };

    proto._updateItem = function () {
        var curServerTime = global.common.getServerTime();
        var start = this.curPage * this.linesPerPage;
        for (var inx = 1; inx <= this.linesPerPage; inx++) {
            var item = this.mc.getChildByName("battle_report_item_" + inx);
            var report = this.curTypeReports[inx + start - 1];
            var reportTimeLabel = item.getChildByName("text_1");
            item["descid"] = report ? report.descid : 0;
            var assaultBg = item.getChildByName("assault_bg");
            assaultBg.visible = (report && report.type == topBtnNames.assault_btn.type);
            var guardBg = item.getChildByName("guard_bg");
            guardBg.visible = ( report && report.type == topBtnNames.guard_btn.type);
            var noticeBg = item.getChildByName("notice_bg");
            noticeBg.visible = ( report && report.type == topBtnNames.notice_btn.type);
            var messageBg = item.getChildByName("message_bg");
            messageBg.visible = (report && report.type == topBtnNames.messagee_btn.type);
            var baseBg = item.getChildByName("base_bg");
            baseBg.visible = !report || report.type < topBtnNames.assault_btn.type || report.type > topBtnNames.messagee_btn.type;

            var watchBtn = item.getChildByName("watch_btn");
            watchBtn.setIsEnabled(report && report.url && report.url != "");
            var releaseBtn = item.getChildByName("release_btn");
            releaseBtn.setIsEnabled(report && !report.hasreported);
            var content = "";
            if (report) {
                var reportTime = report.time;
                var deltaday = ( curServerTime - reportTime ) / 86400 | 0;
                if (deltaday > 0) {
                    content += deltaday + "天前";
                }
                else {
                    content += "今天";
                }
                var leftTime = reportTime % 86400;
                content += global.common.second2stand(leftTime);
            }
            reportTimeLabel.setText(content);
            var introLabel = item.getChildByName("text_2");
            if (report && report.desc) {
                introLabel.setText(report.desc.replace('<u>', '').replace('</u>', ''));
                //战报变量处理（对应多语言版本）
                if (report.desc.indexOf("|&|") > -1) {
                    var strLT = "<";
                    var strGT = ">";
                    var arrDesc = report.desc.split("|&|");
                    var name = arrDesc[1];
                    switch (arrDesc[0]) {
                        case "occupy_castle_success_defense":
                            introLabel.setText(name + "率军疯狂地攻下了你的城堡。");
                            break;
                        case "occupy_castle_failed_defense":
                            introLabel.setText(name + "率军来犯，但受到我军顽强抵抗，落败而逃。");
                            break;
                        case "occupy_castle_success_attack":
                            introLabel.setText("我军一举攻下" + name + "的城堡。");
                            break;
                        case "occupy_castle_failed_attack":
                            introLabel.setText("我军进攻" + name + "的城堡，无奈失利而归。");
                            break;
                        case "help_success_attack":
                            introLabel.setText("您解救了" + name + "，TA感恩戴德痛哭流涕。");
                            break;
                        case "help_failed_attack":
                            introLabel.setText("您率正义之师去解救" + name + "，不料受挫，遭到了嘲笑。");
                            break;
                        case "help_success_owner":
                            introLabel.setText("您的好友" + name + "真够朋友，将您从统治者的魔爪下救出。");
                            break;
                        case "help_failed_owner":
                            introLabel.setText("您的好友" + name + "您两肋插刀挑战统治者，但落败而归");
                            break;
                        case "help_failed_defense":
                            introLabel.setText(name + "的好友为其挺身而出，但也没能推翻您的统治。");
                            break;
                        case "help_success_defense":
                            introLabel.setText(name + "的好友实力不凡，帮其一举推翻了您的统治。");
                            break;
                        case "selfhelp_failed_attack":
                            introLabel.setText("您推翻" + name + "的统治勇气可嘉，但革命尚未成功。");
                            break;
                        case "selfhelp_success_attack":
                            introLabel.setText("在您的大举反攻下，" + name + "占据您领地的妄想破灭了。");
                            break;
                        case "selfhelp_failed_defense":
                            introLabel.setText(name + "竟然想反抗您的统治，被您的军队无情地镇压了。");
                            break;
                        case "selfhelp_success_defense":
                            introLabel.setText(name + "举兵推翻了您的统治。");
                            break;
                        case "mine_fight_failed_defense":
                            introLabel.setText(name + "对您的金矿伸出黑手，不但没得逞还赔了您" + arrDesc[2] + "金币。");
                            break;
                        case "mine_fight_success_defense":
                            introLabel.setText(name + "掠夺了您的金矿，慌乱中您只拿走了" + arrDesc[2] + "金币。");
                            break;
                        case "mine_fight_failed_attack":
                            introLabel.setText("我军掠夺" + name + "的金矿，没想到遇到顽强的抵抗，赔了" + arrDesc[2] + "金币。");
                            break;
                        case "mine_fight_success_attack":
                            introLabel.setText("" + name + "的金矿被我军掠夺，" + arrDesc[2] + "金币落入我军手中。");
                            break;
                        case "mine_drive_failed_defense":
                            introLabel.setText("" + name + "想将您从金矿赶走，真是自不量力。");
                            break;
                        case "mine_drive_success_defense":
                            introLabel.setText("" + name + "抢走了您的金矿，幸好您带走了收获的" + arrDesc[2] + "金币。");
                            break;
                        case "mine_drive_failed_attack":
                            introLabel.setText("我军驱赶" + name + "的金矿守军，结果折戟而归。");
                            break;
                        case "mine_drive_success_attack":
                            introLabel.setText("我军势如破竹，" + name + "的金矿守军仓皇逃窜。");
                            break;
                        case "occupy_retreat":
                            introLabel.setText("我军占领" + name + "领地良久，荣誉而归。");
                            break;
                        case "mine_auto_retreat":
                            introLabel.setText("我军久占金矿无人能敌，获得" + name + "金币，凯旋而归。");
                            break;
                        case "mine_retreat":
                            introLabel.setText("我军从金矿撤军，" + name + "金币收入囊中。");
                            break;
                        case "get_recommend_bonus":
                            introLabel.setText("您推荐来的好友" + name + "成功升级到了" + arrDesc[2] + "级，国王送来奖赏" + arrDesc[3] + "金币。");
                            break;
                    }
                }
            }
            else {
                introLabel.setText();
            }
        }
    };

    proto._updateDialog = function () {
        this._changePage(0);
        this.mc.getChildByName('release_gold').visible = !!global.dataCenter.data.player.promote;
    };

    proto._updatePageBtn = function () {
        if (0 >= this.curPage)
            this.mc.getChildByName('left_btn').setIsEnabled(false);
        else
            this.mc.getChildByName('left_btn').setIsEnabled(true);

        if ((this.curPage + 1) >= this._getTotalPage())
            this.mc.getChildByName('right_btn').setIsEnabled(false);
        else
            this.mc.getChildByName('right_btn').setIsEnabled(true);
    };

    proto._bindPageBtnEvent = function () {
        var leftBtn = this.mc.getChildByName('left_btn');
        var rightBtn = this.mc.getChildByName('right_btn');
        var self = this;
        leftBtn.setButton(true, function () {
            self._changePage(self.curPage - 1);
        });

        rightBtn.setButton(true, function () {
            self._changePage(self.curPage + 1);
        });
    };

    proto.showDialog = function (bIsMessageBox, uilayer) {
        if (!this.isShowing) {
            var self = this;
            this.isShowing = true;
            this.uilayer = uilayer || global.windowManager;
            this.mc = textureLoader.createMovieClip('window', 'battle_report_panel');
            this.mc.setIsSwallowTouch(true);
            this.mc.stopAtHead(true);
            this.mc.x = 0.5 * (global.GAME_WIDTH - this.width);
            this.mc.y = 0.5 * (global.GAME_HEIGHT - this.height);
            this.mc.getChildByName('closeIcon').setButton(true, function () {
                self.closeDialog();
            });
            this.mc.getChildByName('zhanbao').visible = !bIsMessageBox;
            this.mc.getChildByName('message').visible = !!bIsMessageBox;
            this._bindTopBtnEvent();
            this._bindCenterPanelEvent();
            this._bindPageBtnEvent();
            this._updateTopBtnOnPressDown(this.curChooseTopBtn);
            if (!this.reports || global.dataCenter.data.newreport) {
                global.dataCenter.data.newreport = 0;
                global.uiFriendList.updateReportIcon();
                this._requestReportData();
                this.uilayer.addChild(this.mc);
            } else {
                this._updateReportData();
                this._changePage(0);
                this.uilayer.addChild(this.mc);
            }
        }
        Event.enableDrag = false;
    };

    proto.closeDialog = function () {
        if (this.isShowing) {
            this.isShowing = false;
            if (this.uilayer) {
                this.uilayer.removeChild(this.mc);
            } else {
                this.mc && this.mc.removeFromParent();
            }
            this.mc = undefined;
            this.uilayer = undefined;
        }
        Event.enableDrag = true;
    }

    global.ui.battleReportDialog = new BattleReportDialog();
})();
