/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-6-5
 * Time: 下午5:58
 *
 */

/**
 * 农场枯萎后控制弹窗(复活/清理)
 * 单例
 */

(function () {

    var proto = FieldControlPanel.prototype;
    
    var mainPanel;
    var isInited;
    var isShow;

    var textField;

    var building;

    function FieldControlPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        mainPanel = textureLoader.createMovieClip("ui", "building_windows_panel");

        var width = mainPanel.getWidth();
        var height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        var closeIcon = mainPanel.getChildByName("close_btn");
        closeIcon.setButton(true, function(e){
            this.hide();
        }.bind(this));

        mainPanel.getChildByName("win_1").visible = false;
        
        mainPanel.getChildByName("win_2").getChildByName("addHarvestIcon").visible = false;

        textField = mainPanel.getChildByName("win_2").getChildByName("text");

        var retreatIcon = textureLoader.createMovieClip("ui", "saveplantIcon");
        retreatIcon.y = 85;
        retreatIcon.x = 95;
        mainPanel.addChild(retreatIcon);
        retreatIcon.setButton(true, function(e){
            this.hide(); 
            building.recover();
        }.bind(this));

        var cleanIcon = textureLoader.createMovieClip("ui", "cleanIcon");
        cleanIcon.y = 85;
        cleanIcon.x = 95 + 120;
        mainPanel.addChild(cleanIcon);
        cleanIcon.setButton(true, function(e) {
            this.hide();
            building.clean();
        }.bind(this));
        
        isInited = true;
    };

    proto.show = function (build) {
        isInited || this.init();
        
        building = build;
        textField.setText("花费"+building.getRecoverGold()+"金币进行复活");

        isShow || global.windowManager.addChild(mainPanel);
        isShow = true;
    };

    proto.hide = function () {
        isInited || this.init();

        !isShow || global.windowManager.removeChild(mainPanel);
        isShow = false;
    };

    proto.toggle = function () {
        if (isShow) {
            this.hide();
        } else {
            this.show();
        }
    };

    global.fieldControlPanel = new FieldControlPanel();

})();
