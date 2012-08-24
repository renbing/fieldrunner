/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-26
 * Time: 下午3:18
 *
 */

(function () {

    var _dialog = {
        isShowing:false,
        width:600,
        height:400,
        itemCountPerPage:18, //每页最多显示的物品数目
        topBtnCount:8, //顶部菜单数目
        curPage:0, //当前在第几页
        showDialog:_showItemDialog,
        closeDialog:_closeItemDialog
    };

    var IndexToTopBtnName = [
        'shop_Normal_btn',
        'shop_Weapon_btn',
        'shop_WeaponPart_btn',
        'shop_Armor_btn',
        'shop_ArmorPart_btn',
        'shop_TroopCard_btn',
        'shop_SkillCard_btn',
        'shop_magicCard_btn'
    ];

    var TopBtnNameToIndex = {
        'shop_Normal_btn':0,
        'shop_Weapon_btn':1,
        'shop_WeaponPart_btn':2,
        'shop_Armor_btn':3,
        'shop_ArmorPart_btn':4,
        'shop_TroopCard_btn':5,
        'shop_SkillCard_btn':6,
        'shop_magicCard_btn':9
    };

    var TypeToTopBtnName = {
        '0':'shop_Normal_btn',
        '1':'shop_Weapon_btn',
        '2':'shop_WeaponPart_btn',
        '3':'shop_Armor_btn',
        '4':'shop_ArmorPart_btn',
        '5':'shop_TroopCard_btn',
        '6':'shop_SkillCard_btn',
        '9':'shop_magicCard_btn'
    };


    /// 获取当前页面第i个物品在物品数组中的索引
    function _getItemIndex(i) {
        return _dialog.curPage * _dialog.itemCountPerPage + i - 1;
    }

    function _initItemPanel() {
        //隐藏使用和出售按钮
        for (var i = 1; i <= _dialog.itemCountPerPage; ++i) {
            var childItemPanel = _getItemPanelByIndex(i);
            if (childItemPanel) {
                childItemPanel.setIsSwallowTouch(true);
                childItemPanel.addEventListener(Event.MOUSE_CLICK, function (index) {
                    return function (e) {
                        _dialog.curUseBtn && (_dialog.curUseBtn.visible = false);
                        _dialog.curSellBtn && (_dialog.curSellBtn.visible = false);
                        var item = _dialog.curTypeItems[_getItemIndex(index)];
                        if (item) {
                            var itemInfo = global.ItemFunction.getItemInfo(item.type, item.id);
                            if (!itemInfo) return;
                            var sellBtn = _getItemPanelByIndex(index).getChildByName('sellBtn');
                            sellBtn.visible = true;
                            _dialog.curSellBtn = sellBtn;

                            if (itemInfo.istreasure) {
                                var useBtn = _getItemPanelByIndex(index).getChildByName('useBtn');
                                useBtn.visible = true;
                                _dialog.curUseBtn = useBtn;
                            } else {
                                _dialog.curUseBtn = null;
                            }
                        }
                        e.stopPropagation();
                    };
                }(i));

                var sellBtn = childItemPanel.getChildByName('sellBtn');
                var useBtn = childItemPanel.getChildByName('useBtn');
                var superStar = childItemPanel.getChildByName('super_star');

                if (sellBtn) {
                    sellBtn.visible = false;
                    sellBtn.setButton(true, function (index) {
                        return function (e) {

                            var item = _dialog.curTypeItems[_getItemIndex(index)];
                            if (item) global.ItemFunction.sellItem(item.type, item.id, item.counter);
                            _getItemPanelByIndex(index).getChildByName('sellBtn').visible = false;
                            _getItemPanelByIndex(index).getChildByName('useBtn').visible = false;
                        };
                    }(i));
                }

                if (useBtn) {
                    useBtn.visible = false;
                    useBtn.setButton(true, function (index) {
                        return function (e) {

                            var item = _dialog.curTypeItems[_getItemIndex(index)];
                            if (item) {
                                global.ItemFunction.useItem(item.type, item.id, item.counter);
                            }
                            _getItemPanelByIndex(index).getChildByName('sellBtn').visible = false;
                            _getItemPanelByIndex(index).getChildByName('useBtn').visible = false;
                        };
                    }(i));
                }

                if (superStar) {
                    superStar.visible = false;
                    superStar.play();
                }
            }
        }
    }

    function _handleDialogDown(e) {
        _dialog.curUseBtn && (_dialog.curUseBtn.visible = false);
        _dialog.curSellBtn && (_dialog.curSellBtn.visible = false);
    }

    function _showItemDialog() {
        if (!_dialog.isShowing) {
            _dialog.isShowing = true;
            _dialog.mc = textureLoader.createMovieClip('window', 'goodsPanel');
            _dialog.mc.setIsSwallowTouch(true);
            _dialog.mc.stopAtHead(true);
            _dialog.mc.x = (global.GAME_WIDTH - _dialog.width) * 0.5;
            _dialog.mc.y = (global.GAME_HEIGHT - _dialog.height) * 0.5;
            _dialog.mc.getChildByName('closeIcon').setButton(true, _closeItemDialog);
            _dialog.closeBtn = _dialog.mc.getChildByName('closeIcon');
            _dialog.mc.setOnClick(_handleDialogDown);
            _initItemPanel();

            _dialog.mc.getChildByName('pageText').setText('1/1');

            _dialog.mc.getChildByName('left_btn').setButton(true, function (e) {
                _changePage(_dialog.curPage - 1);
            });

            _dialog.mc.getChildByName('right_Btn').setButton(true, function (e) {
                _changePage(_dialog.curPage + 1);
            });

            _dialog.mc.addEventListener(Event.GESTURE_SWIPE, function(e){
                if(e.data == Event.SWIPE_LEFT){
                    _changePage(_dialog.curPage + 1);
                }else if(e.data == Event.SWIPE_RIGHT){
                    _changePage(_dialog.curPage - 1);
                }
            });

            //bind top btn event
            for (var i = 0; i < _dialog.topBtnCount; ++i) {
                var topBtn = _dialog.mc.getChildByName(IndexToTopBtnName[i]);

                if (topBtn) {
                    var chooseItem = (function (index) {
                        return function (e) {
                            _chooseItemType(TopBtnNameToIndex[IndexToTopBtnName[index]]);
                        }
                    })(i);
                    topBtn.addEventListener(Event.MOUSE_CLICK, chooseItem);
                }
            }

            global.windowManager.addChild(_dialog.mc);
            _dialog.curChooseType = -1;
            _chooseItemType(0);
        }
        Event.enableDrag = false;
    }

    function _closeItemDialog() {
        if (_dialog.isShowing) {
            _dialog.isShowing = false;
            for (var i = 1; i <= _dialog.itemCountPerPage; ++i) {
                var itemPanel = _getItemPanelByIndex(i);
                var photo = itemPanel.getChildByName('photo');
                photo.setImage();
            }
            global.windowManager.removeChild(_dialog.mc);
            _dialog.mc = null;
            _dialog.closeBtn = null;
            _dialog.curPageLabel = null;
        }
        Event.enableDrag = true;
    }

    function _getItemPanelByIndex(index) {
        return _dialog.mc.getChildByName('item' + index);
    }

    function _getTotalPageCount() {
        return ((_dialog.curTypeItems.length - 1) / _dialog.itemCountPerPage | 0) + 1;
    }

    function _chooseType(type) {
        _dialog.curChooseType = type;
        var items = global.dataCenter.data.inventory;
        _dialog.curTypeItems = [];
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            if (item.type == type) {
                _dialog.curTypeItems.push(item);
            }
        }
    }

    function _updatePageBtn() {
        if (0 == _dialog.curPage)
            _dialog.mc.getChildByName('left_btn').setIsEnabled(false);
        else
            _dialog.mc.getChildByName('left_btn').setIsEnabled(true);

        if (_dialog.curTypeItems.length <= (_dialog.curPage + 1) * _dialog.itemCountPerPage)
            _dialog.mc.getChildByName('right_Btn').setIsEnabled(false);
        else
            _dialog.mc.getChildByName('right_Btn').setIsEnabled(true);
    }

    function _changePage(page) {
        var totalPageCount = _getTotalPageCount();
        if (page < 0 || page >= totalPageCount) return;

        _dialog.curPage = page;
        _updatePageBtn();
        for (var i = 1; i <= _dialog.itemCountPerPage; ++i) {
            var itemIndex = _getItemIndex(i);
            var itemPanel = _getItemPanelByIndex(i);
            var photo = itemPanel.getChildByName('photo');
            if (itemIndex < _dialog.curTypeItems.length) {
                var item = _dialog.curTypeItems[itemIndex];
                var itemInfo = global.ItemFunction.getItemInfo(item.type, item.id);
                if (item && itemInfo) {
                    photo.setImage(global.ItemFunction.IconDir + itemInfo.shopicon + '.png',
                        global.ItemFunction.DefaultIcon);
                    itemPanel.getChildByName('nameText').setText(itemInfo.name);
                    itemPanel.getChildByName('nameText').setColor(itemInfo.color.replace("0x", '#'));
                    itemPanel.getChildByName('numText').setText(item.counter);
                    if (itemInfo.israre) {
                        itemPanel.getChildByName('super_star').visible = true;
                    }
                } else {
                    photo.setImage(null);
                    itemPanel.getChildByName('super_star').visible = false;
                    itemPanel.getChildByName('nameText').setText('');
                    itemPanel.getChildByName('numText').setText('');
                }
            } else {
                photo.setImage(null);
                itemPanel.getChildByName('super_star').visible = false;
                itemPanel.getChildByName('nameText').setText('');
                itemPanel.getChildByName('numText').setText('');
            }
        }
        _dialog.mc.getChildByName('pageText').setText((_dialog.curPage + 1) + '/' + totalPageCount);
    }

    function _chooseItemType(type) {
        if (_dialog.curChooseType == type) return;

        _dialog.curUseBtn && (_dialog.curUseBtn.visible = false);
        _dialog.curSellBtn && (_dialog.curSellBtn.visible = false);
        var lastChooseType = _dialog.curChooseType;

        if (lastChooseType != null) {
            var topBtn = _dialog.mc.getChildByName(TypeToTopBtnName[lastChooseType]);
            if (topBtn) topBtn.gotoAndStop(1);
        }

        var topBtn = _dialog.mc.getChildByName(TypeToTopBtnName[type]);
        if (topBtn) topBtn.gotoAndStop(3);

        //当前类型的物品取出来存为数组
        _chooseType(type);
        _changePage(0);
    }

    global.controller.itemDialogController = {update:function (inventory) {
        if (!inventory) {
            trace('server error:' + inventory);
            return;
        }

        global.dataCenter.data.inventory = inventory;
        if (_dialog.isShowing) {
            _chooseType(_dialog.curChooseType);
            _changePage(_dialog.curPage);
            //_updateItemPanel(_dialog.curChooseType, _dialog.curPage);
        }
    }};

    global.ui.itemDialog = _dialog;

})();
