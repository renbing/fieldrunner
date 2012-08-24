/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-23
 * Time: 下午5:12
 */
(function () {
    function structConstruct(cfg) {
        var items = cfg.data.item;
        var ret = [];
        var lastIndex = -1;
        for (var i = 0; i < items.length; ++i) {
            var oneItem = items[i];
            if (lastIndex != oneItem.type) {
                var item = {};
                ret.push(item);
                lastIndex = oneItem.type;
            }
            ret[lastIndex][oneItem.id] = oneItem;
        }
        trace(JSON.stringify(ret));
    }

    function _getItemInfo(type, id) {
        if (type > global.ItemFunction.getItemConfig().data.item.length) return null;

        var ret = global.ItemFunction.getItemConfig().data.item[type][id];
        return ret;
    }

    function _getItemsByTypeFast(type) {
        return global.ItemFunction.getItemConfig().data.item[type];
    }

    /// 发送使用物品协议，并刷新本地场景
    function _useItemReal(type, id, count) {
        var itemInfo = global.ItemFunction.getItemInfo(type, id);
        if (!itemInfo || !itemInfo.istreasure) return;
//        if (itemInfo.singleuse === 0) {
//            ExternBatchUseDialog.GetInstance().UpdateDialog(itemdata, count, OnSendNetUseItem);
//        }
//        else {
//            OnSendNetUseItem(itemdata, 1);
//        }
        global.NetManager.call('Player', 'treasure',
            {"type":type, id:id, "count":count},
            function (data) {
                var dataobj = data.data;
                var treasure_bonus = dataobj["treasure_bonus"];
                var gold = treasure_bonus["tb_gold"];
                var exp = treasure_bonus["tb_exp"];
                var battlenumber = treasure_bonus["tb_battlenumber"];
                var tb_item = treasure_bonus["tb_item"];
                var newhero = treasure_bonus["newhero"];
                var soldier = treasure_bonus["tb_soldier"];

                var rewardDialog = new global.externRewardDialog();
                rewardDialog.setExp(exp);
                rewardDialog.setGold(gold);
                rewardDialog.setBattleNumber(battlenumber);
                rewardDialog.setSoldier(soldier);
                for (var i = 0; i < tb_item.length; ++i) {
                    rewardDialog.addItem(tb_item[i]);
                }

                rewardDialog.showDialog();
                if (newhero) {
                    var getHeroDilaog = new global.getHeroDialog(newhero);
                    getHeroDilaog.showDialog();
                }

                global.controller.buildingController.update(data.data.build);
                global.controller.itemDialogController.update(data.data.inventory);
                global.controller.playerStatusController.update(data.data.player);
                global.controller.missionController.update(data.data.mission);
                global.controller.dayMissionController.update(data.data.mission_day);
            },
            "使用物品中"
        );
    }

    function _useItem(type, id, maxCount) {
        var itemInfo = _getItemInfo(type, id);
        if (itemInfo && itemInfo.istreasure) {
            if (global.dataCenter.getLevel() < itemInfo.limitlevel) {
                global.dialog("物品需要" + itemInfo.limitlevel + "级以后才能使用");
            } else if (itemInfo.singleuse) {
                _useItemReal(type, id, 1);
            }
            else {
                if (!this.useItemDialog) {
                    this.useItemDialog = textureLoader.createMovieClip('window', 'use_panel');
                }
                var useItemDialog = this.useItemDialog;

                useItemDialog.setIsSwallowTouch(true);

                useItemDialog.gotoAndStop(1);
                useItemDialog.x = (global.GAME_WIDTH - 200) * 0.5;
                useItemDialog.y = (global.GAME_HEIGHT - 300) * 0.5;

                var closeUseItemDialog = function () {
                    var photo = useItemDialog.getChildByName('photo');
                    photo.setImage();
                    global.windowManager.removeChild(useItemDialog);
                    this.useItemDialog = undefined;
                }.bind(this);

                useItemDialog.closeBtn = useItemDialog.getChildByName('closeIcon');
                useItemDialog.closeBtn.setButton(true, function () {
                    closeUseItemDialog();
                });

                var countLabel = useItemDialog.getChildByName('number_text');
                if (countLabel) {
                    countLabel.setText('1');
                }

                var acceptBtn = useItemDialog.getChildByName('accept_btn');
                acceptBtn.setButton(true, function (e) {
                    _useItemReal(itemInfo.type, itemInfo.id, countLabel.text);
                    closeUseItemDialog();
                });

                var leftBtn = useItemDialog.getChildByName('left_btn');
                var rightBtn = useItemDialog.getChildByName('right_btn');

                var updatePageBtn = function () {
                    if (+countLabel.text > 1) {
                        leftBtn.setIsEnabled(true);
                    } else {
                        leftBtn.setIsEnabled(false);
                    }

                    if (+countLabel.text < +maxCount && +countLabel.text < 99) {
                        rightBtn.setIsEnabled(true);
                    } else {
                        rightBtn.setIsEnabled(false);
                    }
                };

                rightBtn.setButton(true, function (e) {
                    if (+countLabel.text < +maxCount && +countLabel.text < 99) {
                        countLabel.setText(parseInt(countLabel.text) + 1);
                        updatePageBtn();
                    }
                });
                leftBtn.setButton(true, function (e) {
                    if (countLabel.text > 1) {
                        countLabel.setText(countLabel.text - 1);
                        updatePageBtn();
                    }
                });

                updatePageBtn();

                var photo = useItemDialog.getChildByName('photo');
                if (photo) {
                    photo.setImage(global.ItemFunction.IconDir + itemInfo.shopicon + '.png');
                }
                if (!useItemDialog.parent) {
                    global.windowManager.addChild(useItemDialog);
                }
            }
        }

    }

    function _sellItem(type, id, maxCount) {
        var itemInfo = _getItemInfo(type, id);
        if (itemInfo) {
            if (maxCount <= 0 || !itemInfo.sellprice || itemInfo.sellprice <= 0) {
                global.dialog('该物品无法出售');
            } else {
                if (!this.sellItemDialog) {
                    this.sellItemDialog = textureLoader.createMovieClip('window_pub', 'shop_batch_sale_panel');
                }
                var sellItemDialog = this.sellItemDialog;
                sellItemDialog.setIsSwallowTouch(true);
                sellItemDialog.gotoAndStop(1);
                sellItemDialog.x = (global.GAME_WIDTH - 200) * 0.5;
                sellItemDialog.y = (global.GAME_HEIGHT - 300) * 0.5;

                var closeSellItemDialog = function () {
                    var photo = sellItemDialog.getChildByName('photo');
                    photo.setImage();
                    global.windowManager.removeChild(sellItemDialog);
                    this.sellItemDialog = null;
                }.bind(this);

                sellItemDialog.getChildByName('closeIcon').setButton(true, function () {
                    closeSellItemDialog();
                });

                sellItemDialog.getChildByName('name_text').setText(itemInfo.name).setColor(itemInfo.color.replace('0x', '#'));
                sellItemDialog.getChildByName('explainText').setText(itemInfo.desc);
                var countLabel = sellItemDialog.getChildByName('numberText');
                countLabel.setText('1');
                var goldText = sellItemDialog.getChildByName('goldText');
                goldText.setText(itemInfo.sellprice);
                var useBtn = sellItemDialog.getChildByName('useBtn');
                useBtn.setButton(true, function (e) {
                    _useItemReal(itemInfo.type, itemInfo.id, countLabel.text);
                    closeSellItemDialog();
                });

                var sellBtn = sellItemDialog.getChildByName('sellBtn');
                sellBtn.setButton(true, function (e) {
                    closeSellItemDialog();
                    global.NetManager.call('Player', 'sell',
                        {"type":itemInfo.type, id:itemInfo.id, "gold":goldText.text,
                            "cash":0, "counter":countLabel.text
                        },
                        function (data) {
                            global.controller.itemDialogController.update(data.data.inventory);
                            global.controller.playerStatusController.update(data.data.player);
                            global.controller.missionController.update(data.data.mission);
                            global.controller.dayMissionController.update(data.data.mission_day);
                        },
                        "卖出物品中"
                    );
                });
                if (!itemInfo.istreasure || global.dataCenter.getLevel() < itemInfo.limitlevel) {
                    useBtn.setIsEnabled(false);
                }
                var leftBtn = sellItemDialog.getChildByName('left_btn');
                var rightBtn = sellItemDialog.getChildByName('right_btn');

                var updatePageBtn = function () {
                    if (+countLabel.text > 1) {
                        leftBtn.setIsEnabled(true);
                    } else {
                        leftBtn.setIsEnabled(false);
                    }

                    if (+countLabel.text < +maxCount && +countLabel.text < 99) {
                        rightBtn.setIsEnabled(true);
                    } else {
                        rightBtn.setIsEnabled(false);
                    }
                };

                rightBtn.setButton(true, function (e) {
                    if (+countLabel.text < +maxCount && +countLabel.text < 99) {
                        countLabel.setText(parseInt(countLabel.text) + 1);
                        goldText.setText(countLabel.text * itemInfo.sellprice);
                        updatePageBtn();
                    }
                });

                leftBtn.setButton(true, function (e) {
                    if (countLabel.text > 1) {
                        countLabel.setText(countLabel.text - 1);
                        goldText.setText(countLabel.text * itemInfo.sellprice);
                        updatePageBtn();
                    }
                });

                updatePageBtn();

                var photo = sellItemDialog.getChildByName('photo');
                if (photo) {
                    photo.setImage(global.ItemFunction.IconDir + itemInfo.shopicon + '.png');
                }
                if (!sellItemDialog.parent) {
                    global.windowManager.addChild(sellItemDialog);
                }
            }
        }
    }

    function _buyItemReal(type, id, count, buyCallback) {
        var cashInfo = global.ItemFunction.getItemInfo(type, id);
        var cash = cashInfo.cashprice * count;
        var realHasCash = global.dataCenter.data.player.cash;
        var buyCard = global.ItemFunction.getBuyingCard();

        var callback = function (data) {
            global.controller.inventoryController.update(data.data.inventory);
            global.controller.playerStatusController.update(data.data.player);
            global.controller.missionController.update(data.data.mission);
            global.controller.dayMissionController.update(data.data.mission_day);
            buyCallback && buyCallback();
        };

        if (buyCard.counter >= cash) {
            global.NetManager.call("Player", "buy",
                {'buyingcard':cash, "type":type, "cash":0, "gold":0, "id":id, "counter":count},
                callback,
                "购买物品中"
            );
        } else if (realHasCash >= cash) {
            global.NetManager.call("Player", "buy",
                {'buyingcard':0, "type":type, "cash":cash, "gold":0, "id":id, "counter":count},
                callback,
                "购买物品中"
            );
        } else {
            global.dialog('购买物品所需要的钱袋不足，请前往充值页面进行充值');
        }

    }

    function _buyItem(type, id) {
        var itemInfo = _getItemInfo(type, id);
        if (itemInfo) {
            if (itemInfo.cansell) {
                if (!this.buyItemDialog) {
                    this.buyItemDialog = textureLoader.createMovieClip('window_pub', 'shop_batch_buy_panel');
                }
                var buyItemDialog = this.buyItemDialog;
                buyItemDialog.setIsSwallowTouch(true);
                buyItemDialog.gotoAndStop(1);
                buyItemDialog.x = (global.GAME_WIDTH - 200) * 0.5;
                buyItemDialog.y = (global.GAME_HEIGHT - 300) * 0.5;
                var closeBuyItemDialog = function(){
                    var photo = buyItemDialog.getChildByName('photo');
                    photo.setImage();
                    global.windowManager.removeChild(buyItemDialog);
                    this.buyItemDialog = undefined;
                }.bind(this);

                buyItemDialog.getChildByName('closeIcon').setButton(true, function () {
                    closeBuyItemDialog();
                });

                var explainText = buyItemDialog.getChildByName('explainText');
                var countLabel = buyItemDialog.getChildByName('numberText');
                var leftBtn = buyItemDialog.getChildByName('left_btn');
                var rightBtn = buyItemDialog.getChildByName('right_btn');
                var goldText = buyItemDialog.getChildByName('goldText');
                var acceptBtn = buyItemDialog.getChildByName('acceptBtn');
                var superStar = buyItemDialog.getChildByName('super_star');
                explainText.setText(itemInfo.desc);
                countLabel.setText('1');
                superStar.visible = false;
                if (itemInfo.israre) {
                    superStar.visible = true;
                    superStar.gotoAndPlay(1);
                }

                acceptBtn.setButton(true, function () {
                    _buyItemReal(type, id, +countLabel.text, function () {
                        global.dialog('购买道具完成');
                    });
                    closeBuyItemDialog();
                }.bind(this));

                var updateGoldText = function () {
                    var buyCount = +countLabel.text;
                    var needCash = buyCount * +itemInfo.cashprice;
                    goldText.setText(needCash);
//                        if(needCash > global.dataCenter.data.player.cash){
//                            needCash.setColor(global.Color.RED);
//                        }
                };
                updateGoldText();
                var updatePageBtn = function () {
                    if (+countLabel.text > 1) {
                        leftBtn.setIsEnabled(true);
                    } else {
                        leftBtn.setIsEnabled(false);
                    }

                    if (+countLabel.text < 99) {
                        rightBtn.setIsEnabled(true);
                    } else {
                        rightBtn.setIsEnabled(false);
                    }
                };

                rightBtn.setButton(true, function (e) {
                    if (+countLabel.text < 99) {
                        countLabel.setText(+countLabel.text + 1);
                        updateGoldText();
                        updatePageBtn();
                    }
                });

                leftBtn.setButton(true, function (e) {
                    if (countLabel.text > 1) {
                        countLabel.setText(+countLabel.text - 1);
                        goldText.setText(countLabel.text * itemInfo.sellprice);
                        updateGoldText();
                        updatePageBtn();
                    }
                });

                updatePageBtn();

                var photo = buyItemDialog.getChildByName('photo');
                if (photo) {
                    photo.setImage(global.ItemFunction.IconDir + itemInfo.shopicon + '.png');
                }
                if (!this.buyItemDialog.parent) {
                    global.windowManager.addChild(buyItemDialog);
                }
            }
        }
    }

    function _getHarvestItem() {
        var inventory = global.dataCenter.data.inventory;
        var hurryup = global.configs['config/global/item_config'].data.harvesthurryup['@attributes'];
        var hurryItem = {type:hurryup.type, id:hurryup.id, counter:0};
        for (var key in inventory) {
            if (inventory[key].id == hurryup.id && inventory[key].type == hurryup.type) {
                hurryItem = inventory[key];
                break;
            }
        }
        return hurryItem;
    }

    function _getTrainingCard() {
        var inventory = global.dataCenter.data.inventory;
        var trainingCardInfo = global.configs['config/global/item_config'].data.trainingcard['@attributes'];
        var trainingCard = {type:trainingCardInfo.type, id:trainingCardInfo.id, counter:0};
        for (var key in inventory) {
            if (inventory[key].id == trainingCard.id && inventory[key].type == trainingCard.type) {
                trainingCard = inventory[key];
                break;
            }
        }
        return trainingCard;
    }

    function _getBuyingCard() {
        var inventory = global.dataCenter.data.inventory;
        var buyingcardInfo = global.configs['config/global/item_config'].data.buyingcard['@attributes'];
        var buyingcard = {type:buyingcardInfo.type, id:buyingcardInfo.id, counter:0};
        for (var key in inventory) {
            if (inventory[key].id == buyingcardInfo.id && inventory[key].type == buyingcardInfo.type) {
                buyingcard = inventory[key];
            }
        }
        return buyingcard;
    }

    function _getHarvestextra() {
        var inventory = global.dataCenter.data.inventory;
        var harvestextraInfo = global.configs['config/global/item_config'].data.harvestextra['@attributes'];
        var harvestextra = {type:harvestextraInfo.type, id:harvestextraInfo.id, counter:0};
        for (var key in inventory) {
            if (inventory[key].id == harvestextraInfo.id && inventory[key].type == harvestextraInfo.type) {
                harvestextra = inventory[key];
            }
        }
        return harvestextra;
    }

    function _getItemsByType(type, items) {
        var allItems = global.configs['config/global/item_config'].data.item;
        for (var i = 0, max = allItems.length; i < max; i++) {
            if (allItems[i]['@attributes'].type == type) {
                items.push(allItems[i]);
            }
        }
    }

    function _getRareItemsByType(type, items) {
        var allItems = global.configs['config/global/item_config'].data.item;
        for (var i = 0, max = allItems.length; i < max; i++) {
            if ((allItems[i]['@attributes'].type == type) && allItems[i]['@attributes'].israre) {
                items.push(allItems[i]);
            }
        }
    }

    function _getItemByTypeId(type, id) {
        var allItems = global.configs['config/global/item_config'].data.item;
        for (var i = 0, max = allItems.length; i < max; i++) {
            if ((allItems[i]['@attributes'].type == type) && allItems[i]['@attributes'].id == id) {
                return allItems[i];
            }
        }

        return null;
    }

    if (!global.ItemFunction) global.ItemFunction = {};

    global.controller.inventoryController = {update:function (inventory) {
        global.dataCenter.data.inventory = inventory;
    }};

    global.ItemFunction.ITEM_TYPE_WEAPON = 1;
    global.ItemFunction.ITEM_TYPE_ARMOR = 3;
    global.ItemFunction.IconDir = 'resources/icon/shop/';
    global.ItemFunction.DefaultIcon = global.ItemFunction.IconDir + 'default_icon.png';
    global.ItemFunction.DefaultTinyIcon = global.ItemFunction.IconDir + 'default_tinyicon.png';
    global.ItemFunction.getItemInfo = _getItemInfo;
    global.ItemFunction.useItem = _useItem;
    global.ItemFunction.sellItem = _sellItem;
    global.ItemFunction.getHurryupItem = _getHarvestItem;
    global.ItemFunction.getBuyingCard = _getBuyingCard;
    global.ItemFunction.getRareItemsByType = _getRareItemsByType;
    global.ItemFunction.getItemsByType = _getItemsByType;
    global.ItemFunction.getItemByTypeId = _getItemByTypeId;
    global.ItemFunction.getTrainingCard = _getTrainingCard;
    global.ItemFunction.getHarvestextra = _getHarvestextra;
    global.ItemFunction.getItemsByTypeFast = _getItemsByTypeFast;
    global.ItemFunction.buyItem = _buyItem;
    global.ItemFunction.sendBuyItemRequest = _buyItemReal;
    global.ItemFunction.useItemWithoutDialog = _useItemReal;
})();
