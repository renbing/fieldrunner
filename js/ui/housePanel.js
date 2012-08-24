/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-6
 * Time: 下午5:58
 *
 */

/**
 * 民居弹窗
 * 单例
 */
(function() {

    var proto = HousePanelItem.prototype;
    
    function HousePanelItem(mc, panel, id, configs) {
        this.mc = mc;
        this.mc.gotoAndStop(1);
        this.panel = panel
        this.id = id;
        this.configs = configs;
    
        this.timeText = this.mc.getChildByName("timeText");
        this.goldText = this.mc.getChildByName("goldText");
        this.outputText = this.mc.getChildByName("outputText");

        this.buyBtn = this.mc.getChildByName("buyBtn");
        this.buyBtn.setButton(true, function(e) {
            this.onClick();
        }.bind(this));
        
        this.onClick = function( e ) {
            panel.produce(id);
            panel.hide();
        };

        this.mc.setOnClick( this.onClick );

        this.update(id);
    }

    proto.update = function(id) {
        this.id = id;

        var goldNeed = this.configs["food"+this.id]

        this.goldText.setText( goldNeed );
        this.outputText.setText( this.configs["people"+this.id] );
        this.timeText.setText( global.common.min2hour( this.configs["minute"+this.id] ) );

        if( goldNeed > global.dataCenter.data.player.gold ) {
            this.mc.gotoAndStop(2);
            this.mc.getChildByName("goldText").setText( this.goldText.text );
            this.mc.getChildByName("timeText").setText( this.timeText.text );
            this.mc.getChildByName("outputText").setText( this.outputText.text );

            this.mc.setOnClick(null);
        } else {
            this.mc.gotoAndStop(1);
            this.mc.setOnClick( this.onClick );
        }
    }

    global.HousePanelItem = HousePanelItem;
    
}());

(function () {

    var proto = HousePanel.prototype;
    
    var mainPanel;
    var width;
    var height;

    var isInited;
    var isShow;
    var closeIcon;
    
    var items;

    function HousePanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        var panel = this;

        mainPanel = textureLoader.createMovieClip("window", "housePanel");
        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("close_icon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });
        
        var allLevelConfigs = global.configs["config/city/build_work_config"].config.house;
        var userLevel = global.sceneMyZone.buildingChurch.getLevel();
        for(var i=0,max=allLevelConfigs.length; i<max; i++ )
        {
            if( allLevelConfigs[i]["@attributes"].level == userLevel ) {
                break;
            }
        }

        if( i == allLevelConfigs.length ) {
            i = allLevelConfigs.length - 1;
        }

        var configs = allLevelConfigs[i]["@attributes"];

        items = [];
        for(var i=1,max=configs.typecount; i<=max; i++ )
        {
            var mc = mainPanel.getChildByName("item" + i);
            if( configs["food"+i] == 0 ) {
                mc.visible = false;
            } else {
                items.push( new global.HousePanelItem(mc, panel, i, configs) );
            }
        }

        isInited = true;
    };

    proto.show = function () {
        isInited || this.init();

        isShow || global.windowManager.addChild(mainPanel);
        isShow = true;
        Event.enableDrag = false;
    };

    proto.hide = function () {
        isInited || this.init();

        !isShow || global.windowManager.removeChild(mainPanel);
        isShow = false;
        Event.enableDrag = true;
    };

    proto.toggle = function () {
        if (isShow) {
            this.hide();
        } else {
            this.show();
        }
    };

    // 功能操作函数
    proto.produce = function(id) {

        global.sceneMyZone.buildingHouse.recruit(id);
        
    };


    global.housePanel = new HousePanel();

})();
