/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-5-03
 * Time: 下午5:58
 *
 */

/**
 * 弹窗管理
 * 单例
 */

(function () {

    var proto = WindowManager.prototype;
    
    var isInited;
    var mainPanel;
    var windows;

    function WindowManager() {
        isInited = false;
    }

    proto.init = function() {
        mainPanel = new MovieClip("windowManager");
        mainPanel.setIsSwallowTouch(true);
        
        // 背景层
        var background = new FillRect(0, 0, global.GAME_WIDTH, global.GAME_HEIGHT, "black", 0.5);
        mainPanel.addChild(background);
        
        // 窗口层
        windows = new MovieClip("windows");
        mainPanel.addChild(windows);

        global.stage.addChild(mainPanel);
        this._display();

        isInited = true;
    };

    proto.addChild = function(win) {
        isInited || this.init();

        windows.addChild(win);
        this._display();
    };

    proto.removeChild = function(win) {
        isInited || this.init();

        windows.removeChild(win);
        this._display();
    };

    proto._display = function() {
        if( windows.getCurrentFrame().length > 0 ) {
            mainPanel.visible = true;
            Event.enableDrag = false;
        } else {
            mainPanel.visible = false;
            Event.enableDrag = true;
        }
    };

    global.windowManager = new WindowManager();
})();
