/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-3-30
 * Time: 下午5:58
 *
 */

/**
 * 防具店弹窗
 * 单例
 */
(function() {
    
    var proto = ArmorshopPanelScrollItem.prototype;

    function ArmorshopPanelScrollItem(mc, panel, equipId) {
        this.mc = mc;
        this.equipId = equipId;
        this.savedX = this.mc.x;

        this.bg = this.mc.getChildByName("bg");
        this.star = this.mc.getChildByName("super_star");
        this.achievedIcon = this.mc.getChildByName("achieve_icon");
        this.dissatisfyIcon = this.mc.getChildByName("dissatisfy_icon");
        
        this.mc.setOnClick( function(e) {
            panel.selected(this.equipId);
        }.bind(this));

        this.update(equipId);
    };

    proto.update = function(equipId) {
        this.equipId = equipId;
       
        var equipConfigs = global.configManager.get("config/battle/armor_equip_config").data.equip;
        var equipConfig = equipConfigs[equipId];
        var equipItemType = equipConfig["@attributes"].itemtype;
        var equipItemId = equipConfig["@attributes"].itemid1;
        var equipItemConfig = global.ItemFunction.findItemByTypeId(equipItemType, equipItemId);
        if( !equipItemConfig ) {
            return;
        }

        this.bg.setImage("resources/icon/weapon/" + equipItemConfig["@attributes"].iconres + ".png",
                            "resources/icon/weapon/default_armor.png");

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
    };

    proto.getEquipId = function() {
        return this.equipId;
    };

    proto.scroll = function(width) {
        this.mc.x = this.savedX + width;
    };

    proto.scrollEnd = function() {
        this.savedX = this.mc.x;
    };

    global.ArmorshopPanelScrollItem = ArmorshopPanelScrollItem;
    
}());

(function () {

    var proto = ArmorshopPanel.prototype;
    
    var ITEM_COUNT = 3;

    var SCROLL_LEFT = 1;
    var SCROLL_RIGHT = 2;

    function ArmorshopPanel() {
        this.isInited = false;
        this.isShow = false;
        this.scrollLockd = false;
        this.scrollCounter = 0;

        this.mainPanel = null;
        this.selectedEquipId;

        this.attrScrollHeadX = 0;
        this.attrScrollTailX = 0;
        this.attrScrollWidth = 0;

        this.attrScrollPanelItems = [];
    }

    proto.init = function () {
        if (this.isInited) return;

        var equipConfigs = global.configManager.get("config/battle/armor_equip_config").data.equip;

        var panel = this;

        this.mainPanel = textureLoader.createMovieClip("window_building", "armorshop_panel");
        var width = this.mainPanel.getWidth();
        var height = this.mainPanel.getHeight();
        this.mainPanel.x = (global.GAME_WIDTH - width) / 2;
        this.mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        this.mainPanel.setIsSwallowTouch(true);

        var closeIcon = this.mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });

        var attrItemWidth = this.mainPanel.getChildByName("armorshop_attr_item_1").getWidth();

        var leftBtn = this.mainPanel.getChildByName("left_btn");
        var scrollLeft = function(e) {
            panel.scroll(1);
        };

        var rightBtn = this.mainPanel.getChildByName("right_btn");
        var scrollRight = function(e) {
            panel.scroll(-1);
        };

        var pageText = this.mainPanel.getChildByName("page_text");
        var pageCount = Math.ceil( equipConfigs.length - ITEM_COUNT + 1 );
        if( pageCount < 1 ) {
            pageCount = 1;
        }
        var pageTurn = new UIComponent.PageTurn(leftBtn, rightBtn, pageCount, pageText, 
                                                scrollRight, scrollLeft);

        var stuffBtn = this.mainPanel.getChildByName("armor_stuff_btn");
        stuffBtn.setButton(true, function(e) {
            panel.produce();
        });
       
        var attrScrollPanel = this.mainPanel.getChildByName("armorshop_pic_item");
        attrScrollPanel.gotoAndStop(1);
        attrScrollPanel.addEventListener(Event.GESTURE_SWIPE, function(e) {
            if( e.data == Event.SWIPE_LEFT ) {
                pageTurn.next();
            } else if( e.data == Event.SWIPE_RIGHT ){
                pageTurn.prev();
            }
        });
        
        var itemsMC = attrScrollPanel.getChildByName("item_container").getChildByName("items");
        for( var i=1,max=ITEM_COUNT+1; i<=max; i++ ) {
            this.attrScrollPanelItems.push( 
                new global.ArmorshopPanelScrollItem( itemsMC.getChildByName("item_" + i), panel, i-1)
            );
        }

        for( var i=0; i<ITEM_COUNT; i++ ) {
            var mc = this.mainPanel.getChildByName("armorshop_attr_item_" + (i+1) );
            mc.setOnClick(function(index) {
                return function(e) {
                    panel.selected( panel.attrScrollPanelItems[index].getEquipId() );
                };
            }(i));
        }

        this.attrScrollTailX = this.attrScrollPanelItems[this.attrScrollPanelItems.length-1].mc.x;
        this.attrScrollWidth = this.attrScrollPanelItems[1].mc.x - this.attrScrollPanelItems[0].mc.x;
        this.attrScrollHeadX = this.attrScrollPanelItems[0].mc.x - this.attrScrollWidth;

        this._scrolled();
        this.selected(0);

        this.isInited = true;
    };

    proto.show = function () {
        global.configManager.load("config/battle/armor_equip_config", function(data) {
            this.isInited || this.init();

            this.isShow || global.windowManager.addChild(this.mainPanel);
            this.isShow = true;
        }.bind(this));
    };

    proto.hide = function () {
        global.configManager.unload("config/battle/armor_equip_config");

        !this.isShow || global.windowManager.removeChild(this.mainPanel);
        this.isShow = false;
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
        
        var equipConfigs = global.configManager.get("config/battle/armor_equip_config").data.equip;
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
        var params = {"isweapon" : 0,"itemtype" : types, "itemid" : ids, "count" : counts,"gold" : gold};

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
                global.controller.missionController.update( data.data.mission );
                global.controller.dayMissionController.update( data.data.mission_day );

                this.selected( this.selectedEquipId );
            }.bind(this)
        );
    };

    proto.selected = function(equipId) {
        this.selectedEquipId = equipId;

        var equipConfigs = global.configManager.get("config/battle/armor_equip_config").data.equip;
        var equipConfig = equipConfigs[equipId];
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
        var stuffBtn = this.mainPanel.getChildByName("armor_stuff_btn");

        stuffMaterialName1.setText( material1Config["@attributes"].name );
        stuffMaterialName2.setText( material2Config["@attributes"].name );
        stuffMaterialNum1.setText( '' + material1Owned + '/' + material1.itemcount ); 
        stuffMaterialNum2.setText( '' + material2Owned + '/' + material2.itemcount ); 
        stuffCost.setText(equipConfig["@attributes"].costcoin);

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

    proto.scroll = function(count) {

        var equipConfigs = global.configManager.get("config/battle/armor_equip_config").data.equip;

        var firstEquipId = this.attrScrollPanelItems[0].getEquipId();
        var lastEquipId = this.attrScrollPanelItems[ITEM_COUNT-1].getEquipId();

        // 点击左侧按钮
        if( count < 0 && firstEquipId <= 0 ) {
            return;
        }

        if( count + firstEquipId < 0 ) {
            count = - firstEquipId;
        }

        // 点击右侧按钮,向左滑
        if( count > 0 && lastEquipId >= (equipConfigs.length - 1) ) {
            return;
        }

        // 点击右侧按钮,向左滑
        if( count > 0 && lastEquipId >= (equipConfigs.length - 1) ) {
            return;
        }

        if( count + lastEquipId > (equipConfigs.length - 1) ) {
            count = equipConfigs.length - 1  - lastEquipId;
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
        
        var firstEquipId = this.attrScrollPanelItems[0].getEquipId();
        var lastEquipId = this.attrScrollPanelItems[ITEM_COUNT-1].getEquipId();

        // 处理临时Item
        var newEquipId = 0;
        var attrScrollPanelTmpItem = this.attrScrollPanelItems[this.attrScrollPanelItems.length - 1];
        if( scrollDirection == SCROLL_LEFT ) {
            // 放到右边
            newEquipId = lastEquipId + 1;
            attrScrollPanelTmpItem.savedX = attrScrollPanelTmpItem.mc.x = this.attrScrollTailX;
        } else {
            // 放到左边
            newEquipId = firstEquipId - 1;
            attrScrollPanelTmpItem.savedX = attrScrollPanelTmpItem.mc.x = this.attrScrollHeadX;
        }
        attrScrollPanelTmpItem.update( newEquipId );
         
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
        
        var equipConfigs = global.configManager.get("config/battle/armor_equip_config").data.equip;
        for( var i=0; i<ITEM_COUNT; i++ ) {
            var equipId = this.attrScrollPanelItems[i].getEquipId();
            var equipConfig = equipConfigs[equipId];
            var equipItemType = equipConfig["@attributes"].itemtype;
            var equipItemId = equipConfig["@attributes"].itemid1;
            var equipItemConfig = global.ItemFunction.findItemByTypeId(equipItemType, equipItemId);
            if( !equipItemConfig ) {
                continue;
            }
            
            var mc = this.mainPanel.getChildByName("armorshop_attr_item_" + (i+1) );
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

    global.armorshopPanel = new ArmorshopPanel();

})();
