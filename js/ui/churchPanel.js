/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-6
 * Time: 下午5:58
 *
 */

/**
 * 教堂弹窗
 * 单例
 */
(function() {

    var proto = ChurchPanelItem.prototype;
    
    function ChurchPanelItem(mc, panel, id, configs) {
        this.mc = mc;
        this.mc.gotoAndStop(1);
        this.panel = panel
        this.id = id;
        this.configs = configs;
        this.num = 0;
    
        this.timeText = this.mc.getChildByName("timeText");
        this.goldText = this.mc.getChildByName("goldText");
        this.soldierText = this.mc.getChildByName("soldierText");

        var item = this;

        this.onClick = function(e) {
            panel.produce(item.id, item.soldierText.text, item.goldText.text);
            panel.hide();
        };

        this.mc.getChildByName("buyBtn").setButton(true, this.onClick);
        this.mc.setOnClick( this.onClick );
    }

    proto.update = function() {
        this.timeText.setText( global.common.min2hour( this.configs["minute"+this.id] ) );

        var goldNeed = this.configs["gold"+this.id];
        var peopleCure = this.configs["people"+this.id];

        this.goldText.setText( goldNeed );
        this.soldierText.setText( peopleCure );

        if( (goldNeed > global.dataCenter.data.player.gold) 
            || (peopleCure > global.dataCenter.data.player.wounded) ) {
            this.mc.gotoAndStop(2);
            this.mc.getChildByName('timeText').setText(this.timeText.text);
            this.mc.getChildByName('goldText').setText(this.goldText.text);
            this.mc.getChildByName('soldierText').setText(this.soldierText.text);
            this.mc.setOnClick(null);
        } else {
            this.mc.gotoAndStop(1);
            this.mc.setOnClick(this.onClick);
        }
    };

    global.ChurchPanelItem = ChurchPanelItem;
    
}());

(function () {

    var proto = ChurchPanel.prototype;
    
    var mainPanel;
    var width;
    var height;

    var isInited;
    var isShow;
    var closeIcon;

    var items;
    var amountText;

    function ChurchPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        var panel = this;

        mainPanel = textureLoader.createMovieClip("window", "churchPanel");

        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });

        var accelerateBtn = mainPanel.getChildByName("buy_Btn");
        accelerateBtn.setButton(true, function(e) {
        });

        amountText = mainPanel.getChildByName("amountText");

        var allLevelConfigs = global.configs["config/city/build_work_config"].config.church;
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
            items.push( new global.ChurchPanelItem(mc, panel, i, configs) );
        }

        isInited = true;
    };

    proto.show = function () {
        isInited || this.init();

		this._updateNum();
		for( var i=0; i<items.length; i++ ) {
			items[i].update();
		}

        isShow || global.windowManager.addChild(mainPanel);
        isShow = true;
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

    proto._updateNum = function() {
        var total = global.dataCenter.data.player.wounded;

        amountText.setText( total );
    };

    // 功能操作函数
    proto.produce = function(id, num, gold) {

        global.sceneMyZone.buildingChurch.cure(id, num, gold);

    };


    global.churchPanel = new ChurchPanel();

})();
