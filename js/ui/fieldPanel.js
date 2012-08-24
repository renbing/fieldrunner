/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-6
 * Time: 下午5:58
 *
 */

/**
 * 农场弹窗
 * 单例
 */
(function() {

    var proto = FieldPanelItem.prototype;
    
    function FieldPanelItem(mc, panel, id, configs) {
        this.mc = mc;
        this.mc.gotoAndStop(1);
        this.panel = panel
        this.id = id;
        this.configs = configs;
    
        this.timeText = this.mc.getChildByName("timeText");
        this.goldText = this.mc.getChildByName("goldText");
        this.outputText = this.mc.getChildByName("outputText");
        this.growNameText = this.mc.getChildByName("growNameText");
        this.plantPhoto = this.mc.getChildByName("plant_photo");
        this.growIcon = null;

        this.onClick = function(e) {
            panel.produce(id);
            panel.hide();
        };
        this.mc.setOnClick( this.onClick );

        this.update(id);
    }

    proto.update = function(id) {
        this.id = id;

        var goldNeed = this.configs["gold"+this.id]

        this.goldText.setText( goldNeed );
        this.outputText.setText( this.configs["food"+this.id] );
        this.timeText.setText( global.common.min2hour( this.configs["minute"+this.id] ) );
        this.growNameText.setText( this.configs["name"+this.id] );
        
        var newGrowIcon = textureLoader.createMovieClip("grow", this.configs["res"+this.id] + "icon");

        this.growIcon || this.plantPhoto.removeChild(this.growIcon);
        this.plantPhoto.addChild( newGrowIcon );

        if( goldNeed > global.dataCenter.data.player.gold ) {
            this.mc.gotoAndStop(2);
            this.mc.getChildByName("timeText").setText( this.timeText.text );
            this.mc.getChildByName("goldText").setText( this.goldText.text );
            this.mc.getChildByName("outputText").setText( this.outputText.text );

            this.growIcon || this.mc.getChildByName("plant_photo").removeChild(this.growIcon);
            this.mc.getChildByName("plant_photo").addChild( newGrowIcon );

            this.mc.setOnClick(null);
        } else {
            this.mc.gotoAndStop(1);
            this.mc.setOnClick( this.onClick );
        }

        this.growIcon = newGrowIcon;
    }

    global.FieldPanelItem = FieldPanelItem;
    
}());

(function () {

    var proto = FieldPanel.prototype;
    
    var mainPanel;
    var width;
    var height;

    var isInited;
    var isShow;
    var closeIcon;
    
    var configs;
    var items;

    function FieldPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        var panel = this;

        mainPanel = textureLoader.createMovieClip("window", "fieldPanel");

        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });
        
        configs = global.sceneMyZone.buildingFarmland.getPlantconfigs(); 

        items = [];
        for(var i=1,max=configs.typecount; i<=max; i++ )
        {
            var mc = mainPanel.getChildByName("item" + i);
            if( configs["food"+i] == 0 ) {
                mc.visible = false;
            } else {
                items.push( new global.FieldPanelItem(mc, panel, i, configs) );
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

        global.sceneMyZone.buildingFarmland.plant(id, configs["res"+id]);
        
    };


    global.fieldPanel = new FieldPanel();

})();
