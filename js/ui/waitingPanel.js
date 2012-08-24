/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-26
 * Time: 下午5:58
 *
 */

/**
 * 数据加载等待
 * 单例
 */

(function(){
    
    var proto = WaitingPanel.prototype;
    
    var mainPanel;

    var isInited;
    var isShow;

    var waitingText;
    var ringPic;
    var defaultText = "努力加载中";
    function WaitingPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;
            
        mainPanel = new MovieClip("waitingPanel");
        mainPanel.setIsSwallowTouch(true);

        var background = new FillRect(0, 0, global.GAME_WIDTH, global.GAME_HEIGHT, "black", 0.5);
        mainPanel.addChild(background);

        var ringBg = textureLoader.createMovieClip("ui", "ringBg");
        ringBg.x = global.GAME_WIDTH/2 - ringBg.getWidth()/2;
        ringBg.y = global.GAME_HEIGHT/2 - ringBg.getHeight()/2;

        mainPanel.addChild(ringBg);

        waitingText = ringBg.getChildByName("zi_text");
        waitingText.setText(defaultText);
        ringPic = ringBg.getChildAt(0).getChildAt(0); 
        ringPic.rotation = 0;

        mainPanel.addEventListener(Event.ENTER_FRAME, function(e) {
            ringPic.rotation += 3;
        });

        isInited = true;
    };

    proto.show = function () {
        isInited || this.init();

        isShow || global.stage.addChild(mainPanel);
        isShow = true;
        Event.enableDrag = false;
    };

    proto.hide = function () {
        if( isInited && isShow ) {
            global.stage.removeChild(mainPanel);
            this.setText(defaultText);
        }
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

    proto.setText = function(text) {
        if(!text) text = defaultText;
        waitingText.setText(text);
    };

    global.waitingPanel = new WaitingPanel();
})();
