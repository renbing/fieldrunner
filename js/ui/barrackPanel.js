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

    var proto = BarrackPanelItem.prototype;
    
    function BarrackPanelItem(mc, panel, id, configs) {
        this.mc = mc;
        this.mc.gotoAndStop(1);
        this.panel = panel
        this.id = id;
        this.configs = configs;
    
        this.timeText = this.mc.getChildByName("timeText");
        this.goldText = this.mc.getChildByName("goldText");
        this.outputText = this.mc.getChildByName("outputText");
        this.buyBtn = this.mc.getChildByName("barrack_btn");

        this.onClick = function(e) {
            panel.produce(id);
            panel.hide();
        };

        this.buyBtn.setButton(true, this.onClick);
        this.mc.setOnClick( this.onClick );

        this.update(id);
    }

    proto.update = function(id) {
        this.id = id;

        var goldNeed = this.configs["gold"+this.id]

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

    global.BarrackPanelItem = BarrackPanelItem;
    
}());

(function () {

    var proto = BarrackPanel.prototype;
    
    var mainPanel;
    var width;
    var height;

    var isInited;
    var isShow;
    var closeIcon;
    
    var items;

    function BarrackPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        var panel = this;

        mainPanel = textureLoader.createMovieClip("window", "barrackPanel");

        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("closeIcon");
        closeIcon.gotoAndStop(1);
        closeIcon.addEventListener(Event.MOUSE_DOWN, function(e) {
            closeIcon.gotoAndStop(2);
        });

        closeIcon.addEventListener(Event.MOUSE_CLICK, function(e) {
            closeIcon.gotoAndStop(1);
            panel.hide();
        });
        
        var allLevelConfigs = global.configs["config/city/build_work_config"].config.barrack;
        var userLevel = global.sceneMyZone.buildingBarrack.getLevel();
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
            if( configs["people"+i] == 0 ) {
                mc.visible = false;
            } else {
                items.push( new global.BarrackPanelItem(mc, panel, i, configs) );
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

        global.sceneMyZone.buildingBarrack.training(id);
    };


    global.barrackPanel = new BarrackPanel();

})();
