/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-17
 * Time: 上午11:06
 *
 */
/// 一键补全弹窗 props_messagebox_panel
(function () {

    var width = 351;
    var height = 173;
    var animationDuration = 200;
    var bLock = true;
    var bShow = false;
    var proto = dialog.prototype;

    function dialog() {

    }

    proto.showDialogByTime = function (second, callback) {
        var needHarvestItemCount = global.common.second2hour(second);
        var harvestItem = global.ItemFunction.getHurryupItem();

        var funcSuc = function () {
            callback && callback(true);
        };

        var funcFail = function () {
            callback && callback(false);
        };

        if (harvestItem.counter >= needHarvestItemCount) {
            funcSuc();
        } else {
            var needCount = harvestItem.counter - needHarvestItemCount;
            var msg = "完成此加速操作还需要" + needCount + "个时之砂";
            var cashInfo = global.ItemFunction.getItemInfo(harvestItem.type, harvestItem.id);
            var cash = cashInfo.cashprice * needCount;

            var requestFunc = function () {
                global.ItemFunction.sendBuyItemRequest(harvestItem.type, harvestItem.id, needCount, funcSuc);
//                var realHasCash = global.dataCenter.data.player.cash;
//                var buyCard = global.ItemFunction.getBuyingCard();
//
//                var callback = function (data) {
//                    global.controller.inventoryController.update(data.data.inventory);
//                    global.controller.playerStatusController.update(data.data.inventory);
//                    global.controller.missionController.update(data.data.mission);
//                    global.controller.dayMissionController.update(data.data.mission_day);
//                    funcSuc();
//                };
//
//                if (buyCard.counter >= cash) {
//                    global.NetManager.call("Player", "buy",
//                        {'buyingcard':cash, "type":harvestItem.type, "cash":0, "gold":0, "id":harvestItem.id, "counter":needCount},
//                        callback);
//                } else if (realHasCash >= cash) {
//                    global.NetManager.call("Player", "buy",
//                        {'buyingcard':0, "type":harvestItem.type, "cash":cash, "gold":0, "id":harvestItem.id, "counter":needCount},
//                        callback);
//                } else {
//                    global.dialog('购买物品所需要的钱袋不足，请前往充值页面进行充值');
//                }
            };

            this.showDialog(msg, cash, requestFunc, funcFail, funcFail);
            this.getMsgText().setColor(global.Color.RED);
        }
    };

    proto.showDialog = function (msg, cash, okFunc, cancelFunc, closeFunc) {
        if (bShow) return;
        bShow = true;
        var self = this;
        this.mc = textureLoader.createMovieClip('ui', 'props_messagebox_panel');
        this.mc.setIsSwallowTouch(true);
        this.mc.getChildByName('text_1').setText(msg);
        this.mc.getChildByName('text_2').setText(cash);

        var closeBtn = this.mc.getChildByName('close_btn');
        closeBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
            if (!bLock) {
                closeFunc && closeFunc();
            }
            self.closeDialog();
            e.stopPropagation();
        });

        var okBtn = this.mc.getChildByName('props_buy_btn');
        okBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
            if (!bLock) {
                okFunc && okFunc();
            }
            self.closeDialog();
            e.stopPropagation();
        });

        var cancelBtn = this.mc.getChildByName('exit_btn');
        cancelBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
            if (!bLock) {
                cancelFunc && cancelFunc();
            }
            self.closeDialog();
            e.stopPropagation();
        });

        this.mc.x = global.GAME_WIDTH / 2 - width / 2;
        this.mc.y = -height;

        bLock = true;
        var dropDown = Tween({
            duration:animationDuration,
            trans:Tween.REGULAR_EASE_OUT,
            from:-height,
            to:global.GAME_HEIGHT / 2 - height / 2,
            func:function () {
                self.mc.y = this.tween;
            }
        });

        var callback = global.ActFunc(function () {
            bLock = false;
            closeBtn.gotoAndStop(1);
        });
        global.ActSeq().add(dropDown).add(callback).start();
        global.stage.addChild(this.mc);
    };

    proto.closeDialog = function () {
        if (!bShow) return;

        this.mc.getChildByName('close_btn').gotoAndStop(3);
        bLock = true;
        bShow = false;
        var self = this;
        var fly = Tween({
            duration:animationDuration,
            trans:Tween.REGULAR_EASE_IN,
            from:self.mc.y,
            to:-height,
            func:function () {
                self.mc.y = this.tween;
            }
        });

        var remove = global.ActFunc(function () {
            global.stage.removeChild(self.mc);
        });
        global.ActSeq().add(fly).add(remove).start();
    };

    proto.getCashText = function () {
        return this.mc.getChildByName('text_2');
    };

    proto.getMsgText = function () {
        return this.mc.getChildByName('text_1');
    };

    global.onekeyFinishDialog = new dialog();

})();
