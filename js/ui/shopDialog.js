/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-9
 * Time: 上午11:59
 *
 */

(function () {

    var IndexToTopBtnName = [
        'shop_Normal_btn',
        'shop_TroopCard_btn',
        'shop_SkillCard_btn'
    ];

    var TopBtnNameToIndex = {
        'shop_Normal_btn':0,
        'shop_TroopCard_btn':5,
        'shop_SkillCard_btn':6
    };

    var TypeToTopBtnName = {
        '0':'shop_Normal_btn',
        '5':'shop_TroopCard_btn',
        '6':'shop_SkillCard_btn'
    };

    var _dialog = {
        isShowing:false,
        width:600,
        height:400,
        itemCountPerPage:12, //每页最多显示的物品数目
        topBtnCount:IndexToTopBtnName.length, //顶部菜单数目
        curPage:0, //当前在第几页
        curChooseType:-1,
        showDialog:_showDialog,
        closeDialog:_closeDialog

    };

    function _getItemPanelByIndex(index) {
        if (index < 1 || index > _dialog.itemCountPerPage) return;

        return _dialog.mc.getChildByName('item' + index);
    }

    function _getItemIndex(index) {
        return _dialog.curPage * _dialog.itemCountPerPage + index - 1;
    }

    function _initDialog() {
        for (var i = 1; i <= _dialog.itemCountPerPage; ++i) {
            var childItemPanel = _getItemPanelByIndex(i);
            if (childItemPanel) {
                childItemPanel.addEventListener(Event.MOUSE_CLICK, function (index) {
                    return function (e) {
                        var item = _dialog.curTypeItems[_getItemIndex(index)];
                        if (item) {
                            global.ItemFunction.buyItem(item.type, item.id);
                        }
                    };
                }(i));

                var superStar = childItemPanel.getChildByName('super_star');
                if (superStar) superStar.visible = false;
            }
        }
    }

    function _bindTopBtnEvent() {
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
    }

    function _showDialog() {
        if (!_dialog.isShowing) {
            _dialog.isShowing = true;

            _dialog.mc = textureLoader.createMovieClip('window', 'shopPanel');
            _dialog.mc.setIsSwallowTouch(true);
            _dialog.mc.stopAtHead(true);
            _dialog.mc.x = (global.GAME_WIDTH - _dialog.width) * 0.5;
            _dialog.mc.y = (global.GAME_HEIGHT - _dialog.height) * 0.5;
            global.windowManager.addChild(_dialog.mc);

            _dialog.mc.getChildByName('closeIcon').setButton(true, _closeDialog);

            _dialog.mc.getChildByName('left_btn').setButton(true, function (e) {
                _changePage(_dialog.curPage - 1);
            });

            _dialog.mc.getChildByName('right_btn').setButton(true, function (e) {
                _changePage(_dialog.curPage + 1);
            });

            _dialog.mc.addEventListener(Event.GESTURE_SWIPE, function (e) {
                if (e.data == Event.SWIPE_LEFT) {
                    _changePage(_dialog.curPage + 1);
                } else if (e.data == Event.SWIPE_RIGHT) {
                    _changePage(_dialog.curPage - 1);
                }
            });

            _initDialog();
            _bindTopBtnEvent();
            _dialog.mc.getChildByName('pageText_2').setText('1/1').setColor(global.Color.WHITE);
            global.windowManager.addChild(_dialog.mc);
            _dialog.curChooseType = -1;
            _chooseItemType(0);
            _updatePageBtn();
        }
        Event.enableDrag = false;
    }

    function _chooseType(type) {
        _dialog.curChooseType = type;
        var items = global.dataCenter.data.inventory;
        _dialog.curTypeItems = [];
        var typeItems = global.ItemFunction.getItemsByTypeFast(type);
        if (!typeItems) return;

        for (var key in typeItems) {
            var item = typeItems[key];
            if (item.cansell && +item.cashprice) {
                _dialog.curTypeItems.push(item);
            }
        }
    }

    function _getTotalPageCount() {
        return ((_dialog.curTypeItems.length - 1) / _dialog.itemCountPerPage | 0) + 1;
    }

    function _updatePageBtn() {
        if (0 == _dialog.curPage) {
            _dialog.mc.getChildByName('left_btn').setIsEnabled(false);
        } else {
            _dialog.mc.getChildByName('left_btn').setIsEnabled(true);
        }

        if (_dialog.curTypeItems.length <= (_dialog.curPage + 1) * _dialog.itemCountPerPage) {
            _dialog.mc.getChildByName('right_btn').setIsEnabled(false);
        } else {
            _dialog.mc.getChildByName('right_btn').setIsEnabled(true);
        }
    }

    function _changePage(page) {
        var totalPageCount = _getTotalPageCount();
        if (page < 0 || page >= totalPageCount) return;

        _dialog.curPage = page;
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
                    itemPanel.getChildByName('numberText').setText(item.counter);
                    itemPanel.getChildByName('cashText').setText(item.cashprice);
                    itemPanel.getChildByName('cashIcon').visible = true;
                    if (itemInfo.israre) {
                        itemPanel.getChildByName('super_star').visible = true;
                    }
                }
            } else {
                photo.setImage(null);
                itemPanel.getChildByName('super_star').visible = false;
                itemPanel.getChildByName('nameText').setText('');
                itemPanel.getChildByName('numberText').setText('');
                itemPanel.getChildByName('cashText').setText('');
                itemPanel.getChildByName('cashIcon').visible = false;
            }
        }
        _dialog.mc.getChildByName('pageText_2').setText((_dialog.curPage + 1) + '/' + totalPageCount);
        _updatePageBtn();
    }

    function _chooseItemType(type) {
        if (_dialog.curChooseType == type) return;

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

    function _closeDialog() {
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
            _dialog.goodsPanel = null;
            _dialog.curPageLabel = null;
        }
        Event.enableDrag = true;
    }

    global.ui.shopDialog = _dialog;

})();
