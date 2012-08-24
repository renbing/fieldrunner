/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-30
 * Time: 下午5:58
 *
 */

/**
 * 每日任务
 * 单例
 */

(function () {

    var proto = DailyTaskPanel.prototype;
    
    var mainPanel;
    var width;
    var height;
    var isInited;
    var isShow;
    var closeIcon;
    
    var itemCount = 16;

    var scoreText;
    var scoreProgressBar;
    var boxCount = 4;

    var configs;

    function DailyTaskPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        mainPanel = textureLoader.createMovieClip("window_task", "today_task_panel");

        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            this.hide();
        }.bind(this));

        scoreText = mainPanel.getChildByName("score_text");
        scoreProgressBar = mainPanel.getChildByName("today_score_progress").getChildAt(0).getChildAt(0);
        scoreProgressBarWidth = scoreProgressBar.sw;
        
        global.configManager.load("config/mission/mission", function(data) {
            configs = data.missions.daymission;

            for( var i=1; i<=itemCount; i++ ) {
                var item = mainPanel.getChildByName("today_task_item_" + i);
                item.gotoAndStop(1);
                
                var config = configs.tasks.task[i-1]["@attributes"];
                item.getChildByName("name_text").setText(config.text);
                item.getChildByName("score_text").setText("+" + config.score + "积分");
                item.getChildByName("number_text").setText("");
                item.getChildByName("finish_icon").visible = false;
            }

            for( var i=1; i<=boxCount; i++ ) {
                var box = mainPanel.getChildByName("box_" + i);
                box.gotoAndStop(1);
            }

            isInited = true;

            this.update();
        }.bind(this), true);
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

    proto.update = function() {
        isInited || this.init();
        if(!global.isMyHome) return;

        var datas = global.dataCenter.data.mission_day;
        var statusLen = datas.status.length;
        var newTaskFinished = false;
        
        var finishedScore = 0;
        for( var i=1; i<=itemCount; i++ ) {
            var finishedNum = (i <= statusLen ) ? datas.status[i-1] : 0;
            var item = mainPanel.getChildByName("today_task_item_" + i);
            var config = configs.tasks.task[i-1]["@attributes"];

            var numberText = item.getChildByName("number_text");
            var oldNumber = numberText.text;
            var newNumber = "" + finishedNum + "/" + config.total;
            numberText.setText(newNumber);

            var isFinished = (finishedNum >= config.total);
            item.getChildByName("finish_icon").visible = isFinished;
            if( isFinished ) {
                finishedScore += +config.score;
            }
            
            // trick,默认初始化空,来处理默认进入游戏不显示New标志
            if( oldNumber && (newNumber != oldNumber) && isFinished ) {
                newTaskFinished = true;
            }
        }
        if( newTaskFinished ) {
            global.uiPlayerStatus.todayTaskFinished();
        }
        
        scoreText.setText( finishedScore );

        for( var i=1; i<=boxCount; i++ ) {
            var boxScore = configs.resourceModifiers.roll[i-1]["@attributes"].score;
            var box = mainPanel.getChildByName("box_" + i);
            if( finishedScore >= boxScore ) {
                // 检查是否打开过
                var isOpened = false;
                if( datas.gifts ) {
                    for( var j=0,max=datas.gifts.length; j<max; j++ ) {
                        if( datas.gifts[j] == i ) {
                            isOpened = true;
                            break;
                        }
                    }
                }
                
                if( isOpened ) {
                    box.gotoAndStop(3);
                    box.setOnClick(null);
                } else {
                    box.gotoAndStop(2);
                    box.id = i;
                    box.setOnClick( function(e) {
                        this.openBox(box.id); 
                    }.bind(this));
                }
            } else {
                box.gotoAndStop(1);    
                box.setOnClick(null);
            }
        }

        scoreProgressBar.sw = scoreProgressBar.dw = scoreProgressBarWidth * 
                            (finishedScore / configs.resourceModifiers.roll[boxCount-1]["@attributes"].score);
    };

    proto.openBox = function(boxId) {
        var params = {
            "score" : boxId
        };
        
        global.NetManager.call("Mission", "taskreward", params, function(data) {
            /*
                $finish['mi_gold'] = $missiongold;                  奖励金币
                $finish['mi_exp'] = $missionexp;                    奖励经验
                $finish['mi_battlenumber'] = $battlenumber;                 奖励军令
                $finish['mi_item']=$finish_item;                    奖励道具
                $data['player'] = $objus;                   
                $data['mission_day'] = $objmd;                  
                $data['finish_today_mission'] = $finish;                    
                $response['data'] = $data;                  
            */

            if( data.data.mission_day ) {
                global.dataCenter.data.mission_day = data.data.mission_day;
                this.update();
            }

            global.controller.playerStatusController.update(data.data.player);
        }.bind(this));
    };

    global.dailyTaskPanel = new DailyTaskPanel();
    global.controller.dayMissionController = {update:function(mission){
        if( !mission ) {
            return;
        }
        global.dataCenter.data.mission_day = mission;
        global.dailyTaskPanel.update();
    }};
})();
