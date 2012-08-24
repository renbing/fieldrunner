/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-3-30
 * Time: 下午5:58
 *
 */

/**
 * 武器店弹窗
 * 单例
 */
(function() {
    
    var proto = WeaponshopPanelScrollItem.prototype;

    function WeaponshopPanelScrollItem(mc, panel) {
        this.mc = mc;
        this.panel = panel;
        this.equipIndex;        // 当前选中id在equipIds中的索引
        this.equipIds = [];     // 所有的id
        this.savedX = this.mc.x;

        this.mc.gotoAndStop(1);
        this.bg = this.mc.getChildByName("bg");
        this.bg.gotoAndStop(1);
        this.star = this.mc.getChildByName("super_star");
        this.achievedIcon = this.mc.getChildByName("achieve_icon");
        this.dissatisfyIcon = this.mc.getChildByName("dissatisfy_icon");

        this.mc.setOnClick( function(e) {
            panel.selected(this.getEquipId());
        }.bind(this));

    }

    proto.update = function(equipIndex, equipIds) {
        this.equipIndex = equipIndex;
        equipIds && (this.equipIds = equipIds);

        var equipId = this.equipIds[ this.equipIndex ];
        var equipConfigs = global.configManager.get("config/battle/weapon_equip_config").data.equip;
        
        var equipConfig = equipConfigs[equipId];

        var equipItemType = equipConfig["@attributes"]["itemtype"];
        var equipItemId = equipConfig["@attributes"]["itemid1"];
        var equipItemConfig = global.ItemFunction.findItemByTypeId(equipItemType, equipItemId);
        if( !equipItemConfig ) {
            return;
        }

        this.bg.setImage("resources/icon/weapon/" + equipItemConfig["@attributes"].iconres + ".png",
                            "resources/icon/weapon/default_weapon.png");

        this.star.visible = "israre" in equipItemConfig["@attributes"];
        this.achievedIcon.visible = false;

        var material1 = equipConfig.material[0]["@attributes"];
        var material2 = equipConfig.material[1]["@attributes"];
        
        var material1Config = global.ItemFunction.findItemByTypeId(material1.itemtype, material1.itemid);
        var material2Config = global.ItemFunction.findItemByTypeId(material2.itemtype, material2.itemid);

        var material1Owned = global.dataCenter.findInventoryCounter(material1.itemtype, material1.itemid);
        var material2Owned = global.dataCenter.findInventoryCounter(material2.itemtype, material2.itemid);

        if( material1Owned <  material1.itemcount || material2Owned < material2.itemcount ) {
            this.dissatisfyIcon.visible = true;
        } else {
            this.dissatisfyIcon.visible = false;
        }

    }

    proto.getEquipId = function() {
        return this.equipIds[ this.equipIndex ];
    }

    proto.getEquipIndex = function() {
        return this.equipIndex;
    };

    proto.scroll = function(width) {
        this.mc.x = this.savedX + width;
    };

    proto.scrollEnd = function() {
        this.savedX = this.mc.x;
    };

    global.WeaponshopPanelScrollItem = WeaponshopPanelScrollItem;
    
}());

(function () {

    var proto = WeaponshopPanel.prototype;
    
    var ITEM_COUNT = 3;
    var SCROLL_LEFT = 1;
    var SCROLL_RIGHT = 2;

    var categoryTabs = {
        "full" : 0,
        "glave" : 1,
        "sword" : 2,
        "spear" : 3,
        "bow" : 4,
        "staves" : 5
    };

    function WeaponshopPanel() {
        this.inInited = false;
        this.isShow = false;
        this.scrollLockd = false;
        this.scrollCounter = 0;
        this.scrollLockd = false;
        this.scrollCounter = 0;

        this.mainPanel = null;
        this.pageTurn = null;

        this.equipIds = [];
        this.selectedEquipId = 0;

        this.attrScrollHeadX = 0;
        this.attrScrollTailX = 0;
        this.attrScrollWidth = 0;

        this.attrScrollPanelItems = [];
    }

    proto.init = function () {
        if (this.inInited) return;

        var equipConfigs = global.configManager.get("config/battle/weapon_equip_config").data.equip;

        var panel = this;

        this.mainPanel = textureLoader.createMovieClip("window_building", "weaponshop_panel");

        var width = this.mainPanel.getWidth();
        var height = this.mainPanel.getHeight();
        this.mainPanel.x = (global.GAME_WIDTH - width) / 2;
        this.mainPanel.y = (global.GAME_HEIGHT - height) / 2;
        
        this.mainPanel.setIsSwallowTouch(true);

        var closeIcon = this.mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });

        var attrItemWidth = this.mainPanel.getChildByName("weaponshop_attr_item_1").getWidth();

        var leftBtn = this.mainPanel.getChildByName("left_btn");
        var scrollLeft = function(e) {
            panel.scroll(1);
        };

        var rightBtn = this.mainPanel.getChildByName("right_btn");
        var scrollRight = function(e) {
            panel.scroll(-1);
        };

        var pageText = this.mainPanel.getChildByName("page_text");
        var pageCount = Math.ceil( equipConfigs.length + 1 - ITEM_COUNT );
        this.pageTurn = new UIComponent.PageTurn(leftBtn, rightBtn, pageCount, pageText, 
                                                scrollRight, scrollLeft);

        var stuffBtn = this.mainPanel.getChildByName("weapon_stuff_btn");
        stuffBtn.setButton(true, function(e) {
            panel.produce();
        });

        var attrScrollPanel = this.mainPanel.getChildByName("weaponshop_pic_item");
        attrScrollPanel.gotoAndStop(1);
        attrScrollPanel.addEventListener(Event.GESTURE_SWIPE, function(e) {
            if( e.data == Event.SWIPE_LEFT ) {
                panel.pageTurn.next();
            } else if( e.data == Event.SWIPE_RIGHT ){
                panel.pageTurn.prev();
            }
        });

        var itemsMC = attrScrollPanel.getChildByName("item_container").getChildByName("items");
        for( var i=1,max=ITEM_COUNT+1; i<=max; i++ ) {
            this.attrScrollPanelItems.push( 
                new global.WeaponshopPanelScrollItem( itemsMC.getChildByName("item_" + i), this)
            );
        }

        for( var i=0; i<ITEM_COUNT; i++ ) {
            var mc = this.mainPanel.getChildByName("weaponshop_attr_item_" + (i+1) );
            mc.setOnClick(function(index) {
                return function(e) {
                    panel.selected( panel.attrScrollPanelItems[index].getEquipId() );
                };
            }(i));
        }
        
        this.attrScrollTailX = this.attrScrollPanelItems[this.attrScrollPanelItems.length-1].mc.x;
        this.attrScrollWidth = this.attrScrollPanelItems[1].mc.x - this.attrScrollPanelItems[0].mc.x;
        this.attrScrollHeadX = this.attrScrollPanelItems[0].mc.x - this.attrScrollWidth;
        
        for(var tabName in categoryTabs) {
            var tab = this.mainPanel.getChildByName(tabName + "_btn_1");
            tab.setOnClick( function(value) {
                return function(e) {
                    panel.changeTab(value);

                };
            }(tabName));
        }

        this.changeTab("full");

        this.inInited = true;
    };

    proto.show = function () {
        global.configManager.load("config/battle/weapon_equip_config", function(data) {
            this.inInited || this.init();

            this.isShow || global.windowManager.addChild(this.mainPanel);
            this.isShow = true;
            Event.enableDrag = false;
        }.bind(this));
    };

    proto.hide = function () {
        global.configManager.unload("config/battle/weapon_equip_config");

        this.inInited || this.init();

        !this.isShow || global.windowManager.removeChild(this.mainPanel);
        this.isShow = false;
        Event.enableDrag = true;
    };

    proto.toggle = function () {
        if (this.isShow) {
            this.hide();
        } else {
            this.show();
        }
    };

    // 功能操作函数
    proto.produce = function() {
        var equipConfigs = global.configManager.get("config/battle/weapon_equip_config").data.equip;
        var equipConfig = equipConfigs[this.selectedEquipId];
        
        var types = [
            equipConfig["@attributes"]["itemtype"], 
            equipConfig.material[0]["@attributes"].itemtype,
            equipConfig.material[1]["@attributes"].itemtype
        ];

        var ids = [
            equipConfig["@attributes"]["itemid1"], 
            equipConfig.material[0]["@attributes"].itemid,
            equipConfig.material[1]["@attributes"].itemid
        ];

        var counts = [
            1,
            equipConfig.material[0]["@attributes"].itemcount,
            equipConfig.material[1]["@attributes"].itemcount
        ];

        var gold = equipConfig["@attributes"].costcoin;
        var params = {"isweapon" : 1,"itemtype" : types, "itemid" : ids, "count" : counts,"gold" : gold};

        global.NetManager.call("Player", "custom", params, function(data) {
                global.controller.playerStatusController.update( data.data.player ); 
                for( var i=0; i<3; i++ ) {
                    var type = data.data.itemtype[i];
                    var id = data.data.itemid[i];
                    var count = +data.data.count[i];
                    if( i != 0 ) {
                        count = -count;
                    }
                    global.dataCenter.addItem(type, id, count);
                }

                // 处理任务 mission/mission_day
                global.controller.dayMissionController.update( data.data.mission_day );
                global.controller.missionController.update( data.data.mission );

                this.selected( this.selectedEquipId );
            }.bind(this)
        );
    };

    proto.selected = function(equipId) {
        this.selectedEquipId = equipId;

        var equipConfig = global.configManager.get("config/battle/weapon_equip_config").data.equip[equipId];
        var material1 = equipConfig.material[0]["@attributes"];
        var material2 = equipConfig.material[1]["@attributes"];
        
        var material1Config = global.ItemFunction.findItemByTypeId(material1.itemtype, material1.itemid);
        var material2Config = global.ItemFunction.findItemByTypeId(material2.itemtype, material2.itemid);

        var material1Owned = global.dataCenter.findInventoryCounter(material1.itemtype, material1.itemid);
        var material2Owned = global.dataCenter.findInventoryCounter(material2.itemtype, material2.itemid);

        var stuffName = this.mainPanel.getChildByName("weaponshop_name_text");
        var stuffMaterialName1 = this.mainPanel.getChildByName("stuff_name_text_1");
        var stuffMaterialName2 = this.mainPanel.getChildByName("stuff_name_text_2");
        var stuffMaterialNum1 = this.mainPanel.getChildByName("stuff_aim_text_1");
        var stuffMaterialNum2 = this.mainPanel.getChildByName("stuff_aim_text_2");
        var stuffCost = this.mainPanel.getChildByName("gold_text");
        var stuffBtn = this.mainPanel.getChildByName("weapon_stuff_btn");

        stuffMaterialName1.setText( material1Config["@attributes"].name );
        stuffMaterialName2.setText( material2Config["@attributes"].name );
        stuffMaterialNum1.setText( '' + material1Owned + '/' + material1.itemcount ); 
        stuffMaterialNum2.setText( '' + material2Owned + '/' + material2.itemcount ); 
        stuffCost.setText( equipConfig["@attributes"].costcoin );

        var equipConfigs = global.configManager.get("config/battle/weapon_equip_config").data.equip;
        var equipItemType = equipConfigs[equipId]["@attributes"]["itemtype"];
        var equipItemId = equipConfigs[equipId]["@attributes"]["itemid1"];
        var equipItemConfig = global.ItemFunction.findItemByTypeId(equipItemType, equipItemId);
        if( equipItemConfig ) {
            stuffName.setText(equipItemConfig["@attributes"].name);
        } else {
            stuffName.setText("");
        }

        var satisfy1 = (material1Owned >= material1.itemcount);
        var satisfy2 = (material2Owned >= material2.itemcount);

        if( satisfy1 && satisfy2 ) {
            stuffBtn.setIsEnabled(true);
        }else {
            stuffBtn.setIsEnabled(false);
        }
        
        var noRes1 = this.mainPanel.getChildByName("noRes1");
        var noRes2 = this.mainPanel.getChildByName("noRes2");
        var haveRes1 = this.mainPanel.getChildByName("achieve_icon1");
        var haveRes2 = this.mainPanel.getChildByName("achieve_icon2");

        noRes1.visible = !satisfy1;
        haveRes1.visible = satisfy1;

        noRes2.visible = !satisfy2;
        haveRes2.visible = satisfy2;
    };

    proto.changeTab = function(selectedTabName) {
        for( var tabName in categoryTabs ) {
            var selected = (tabName == selectedTabName);
            this.mainPanel.getChildByName(tabName + "_btn_2").visible = selected;
            this.mainPanel.getChildByName(tabName + "_btn_1").visible = !selected;
        }

        var selectedCatagory = categoryTabs[selectedTabName];
        var equips = global.configManager.get("config/battle/weapon_equip_config").data.equip;
        
        this.equipIds = [];
        for( var i=0,max=equips.length; i<max; i++ ) {
            var equipItemType = equips[i]["@attributes"]["itemtype"];
            var equipItemId = equips[i]["@attributes"]["itemid1"];
            var equipItemConfig = global.ItemFunction.findItemByTypeId(equipItemType, equipItemId);
            if( !equipItemConfig ) {
                continue;
            } 
            if( (selectedCatagory == 0) || (equipItemConfig["@attributes"].category == selectedCatagory) ) {
                this.equipIds.push(i);
            }
        }
        
        // 更新Item显示列表为排序前3个
        for( var i=0; i<ITEM_COUNT; i++ ) {
            this.attrScrollPanelItems[i].update(i, this.equipIds);
        }
        
        this.pageTurn.changePageCount( Math.ceil(this.equipIds.length + 1 - ITEM_COUNT) );
        this._scrolled();
        this.selected(this.attrScrollPanelItems[0].getEquipId());
    };

    proto.scroll = function(count) {

        var firstEquipIndex = this.attrScrollPanelItems[0].getEquipIndex();
        var lastEquipIndex = this.attrScrollPanelItems[ITEM_COUNT-1].getEquipIndex();

        // 点击左侧按钮
        if( count < 0 && firstEquipIndex <= 0 ) {
            return;
        }

        if( count + firstEquipIndex < 0 ) {
            count = - firstEquipIndex;
        }

        // 点击右侧按钮,向左滑
        if( count > 0 && lastEquipIndex >= (this.equipIds.length - 1) ) {
            return;
        }

        // 点击右侧按钮,向左滑
        if( count > 0 && lastEquipIndex >= (this.equipIds.length - 1) ) {
            return;
        }

        if( count + lastEquipIndex > (this.equipIds.length - 1) ) {
            count = this.equipIds.length - 1  - lastEquipIndex;
        }

        this.scrollCounter += count;
        if( this.scrollCounter != 0 ) {
            this._scroll();
        };
    };

    proto._scroll = function(scrollDirection) {
        if( this.scrollLockd ) {
            return;
        }
        this.scrollLockd = true;

        var scrollDirection = (this.scrollCounter < 0) ? SCROLL_RIGHT : SCROLL_LEFT;
        
        var firstEquipIndex = this.attrScrollPanelItems[0].getEquipIndex();
        var lastEquipIndex = this.attrScrollPanelItems[ITEM_COUNT-1].getEquipIndex();

        // 处理临时Item
        var newEquipIndex = 0;
        var attrScrollPanelTmpItem = this.attrScrollPanelItems[this.attrScrollPanelItems.length - 1];
        if( scrollDirection == SCROLL_LEFT ) {
            // 放到右边
            newEquipIndex = lastEquipIndex + 1;
            attrScrollPanelTmpItem.savedX = attrScrollPanelTmpItem.mc.x = this.attrScrollTailX;
        } else {
            // 放到左边
            newEquipIndex = firstEquipIndex - 1;
            attrScrollPanelTmpItem.savedX = attrScrollPanelTmpItem.mc.x = this.attrScrollHeadX;
        }
        attrScrollPanelTmpItem.update( newEquipIndex, this.equipIds );
         
        var items = this.attrScrollPanelItems;
        var action = new Tween({

            trans: Tween.SIMPLE,
            from: 0,
            to: this.attrScrollWidth * ( scrollDirection == SCROLL_LEFT ? -1 : 1),
            duration: 200,
            func: function() {
                for( var i=0;i<=ITEM_COUNT; i++ ) {
                    items[i].scroll(this.tween);
                }
            }
        });
        
        var onScrolled = function() {
            for( var i=0;i<=ITEM_COUNT; i++ ) {
                items[i].scrollEnd();
            }
            if( scrollDirection == SCROLL_LEFT ) {
                var item = items.shift();
                items.push(item);
                this.scrollCounter --;
            } else {
                var item = items.pop();
                items.unshift(item);
                this.scrollCounter ++;
            }
            
            this._scrolled();

            this.scrollLockd = false;
            if( this.scrollCounter != 0 ) {
                this._scroll();
            }
        }.bind(this);
        
        global.ActSeq().add(action).add(onScrolled).start();
    };

    proto._scrolled = function(count) {
        
        var equipConfigs = global.configManager.get("config/battle/weapon_equip_config").data.equip;
        for( var i=0; i<ITEM_COUNT; i++ ) {
            var equipId = this.attrScrollPanelItems[i].getEquipId();
            var equipConfig = equipConfigs[equipId];

            var equipItemType = equipConfig["@attributes"]["itemtype"];
            var equipItemId = equipConfig["@attributes"]["itemid1"];
            var equipItemConfig = global.ItemFunction.findItemByTypeId(equipItemType, equipItemId);
            if( !equipItemConfig ) {
                return;
            }

            var mc = this.mainPanel.getChildByName("weaponshop_attr_item_" + (i+1) );

            var nameText = mc.getChildByName("weaponshop_name_text");
            var soldierText = mc.getChildByName("soldier_text");
            var attackText = mc.getChildByName("weapon_atk_text");
            var levelText = mc.getChildByName("level_text");

            levelText.setText(equipConfig["@attributes"]["needlevel"]);
            attackText.setText(equipItemConfig.effect["@attributes"].value);
            soldierText.setText( global.heroCategoryConfig[equipItemConfig["@attributes"].category] );
            nameText.setText(equipItemConfig["@attributes"].name);
        }

        this.selected(this.attrScrollPanelItems[0].getEquipId());
    };

    global.weaponshopPanel = new WeaponshopPanel();

})();
