/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-16
 * Time: 下午5:58
 *
 */

/**
 * 加速弹窗
 * 单例
 */

(function () {

    var proto = AcceleratePanel.prototype;
    
    var mainPanel;
    var width;
    var height;
    var isInited;
    var isShow;
    var closeIcon;

    var accelerateBtn;
    var timeText;
    var progressBar;

    var timeLeft;
    var endTime,serverTime;
    var building;

    var onSecond;

    function AcceleratePanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function (time) {
        if (isInited) return;

        onSecond = this._onSecond.bind(this);

        var panel = this;

        mainPanel = textureLoader.createMovieClip("ui", "building_windows_panel");

        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("close_btn");
        closeIcon.setButton(true, function(e){
            panel.hide();
            global.gameSchedule.unscheduleFunc( onSecond );
        });
        
        accelerateBtn = mainPanel.getChildByName("win_1").getChildByName("preemptiveIcon");
        accelerateBtn.setButton(true, function(e) {
            panel.hide();
            building.accelerate();
        });

        mainPanel.getChildByName("win_2").visible = false;

        timeText = mainPanel.getChildByName("win_1").getChildByName("time_text");
        timeText.setColor( global.Color.BLACK );
        progressBar = mainPanel.getChildByName("win_1").getChildByName("progress_panel").getChildByName("progress");
        progressBar.visible = false;

        timeLeft = time;
        
        isInited = true;
    };

    proto.show = function (build, time) {
        isInited || this.init(time);
        
        building = build;
        endTime = time + global.common.getServerTime();
        global.gameSchedule.scheduleFunc( onSecond , 1000 );
        this._update();

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

    proto._onSecond = function() {
        if( endTime > global.common.getServerTime()) {
            //timeLeft--;
            timeLeft = endTime - global.common.getServerTime();
            this._update();
        } else {
            this.hide();
        }
    };

    proto._update = function() {
        timeText.setText(global.common.second2stand(timeLeft));
    }


    global.acceleratePanel = new AcceleratePanel();

})();
