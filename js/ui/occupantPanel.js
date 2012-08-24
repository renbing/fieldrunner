/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-16
 * Time: 下午5:58
 *
 */

/**
 * 攻占领地
 * 单例
 */

(function () {

    var proto = OccupantPanel.prototype;
    
    var mainPanel;
    var width;
    var height;

    var isInited;
    var isShow;
    var closeIcon;
    var leaveBtn;
    var refreshBtn;
    var refreshTimeText;
    var onSecond;

    var ITEM_PER_PAGE = 20;
    
    function OccupantPanel() {
        isInited = false;
        isShow = false;
    }

    proto.init = function () {
        if (isInited) return;

        var panel = this;

        mainPanel = textureLoader.createMovieClip("window", "occupant_demesne_panel");
        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        mainPanel.setIsSwallowTouch(true);

        closeIcon = mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });

        leaveBtn = mainPanel.getChildByName("leave_btn");
        leaveBtn.setButton(true, function(e) {
            panel.hide();
        });

        refreshBtn = mainPanel.getChildByName("refresh_btn");
        refreshBtn.setButton(true, function(e) {
            panel.refresh();
        });

        refreshTimeText = mainPanel.getChildByName("refresh_time_text");
        // demesne
        
        onSecond = this._onSecond.bind( this );
        this.refresh();

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

    proto.refresh = function() {
        var params = {
            //"prisoner":0,
            "level" : global.dataCenter.getLevel(),
            "hurryup" : 0 //道具数量 或者 0(没有使用道具)
        };
        
        var panel = this;

        global.NetManager.call("Player", "refreshjail", params, function(data) {
            if( data.data ) {
                panel.update(data.data);
            }
        });
    };

    proto.update = function(data) {

        if( data.playermark ) {
            global.dataCenter.data.playermark = data.playermark;

            global.gameSchedule.unscheduleFunc( onSecond );
            global.gameSchedule.scheduleFunc(onSecond, 1000);
        }
        if( data.jail ) {
            global.dataCenter.data.jail = data.jail;
            global.sceneMyZone.buildingPrison.update();
        }
        
        var attackinfos = [];
        for( var uid in data.attackinfo ) {
            attackinfos.push( data.attackinfo[uid] );
        }
        
        var attackinfoCount = attackinfos.length;

        for( var i=1; i<=ITEM_PER_PAGE; i++ ) {
            var levelText = null;
            var nameText = null;
            var occpupied = false;
            var bgPhoto = null;
            var uid = null;
            
            if( i <= attackinfoCount ) {
                var attackinfo = attackinfos[i-1];
                levelText = attackinfo.level;
                nameText = attackinfo.un;
                bgPhoto = attackinfo.headpic;
                uid = attackinfo.uid;
                // 是否被占领
                occupied = (attackinfo.occupy > 0 );
            }

            var item = mainPanel.getChildByName("demesne_btn_" + i);
            item.getChildByName("demesne_level_text").setText( levelText );
            item.getChildByName("demesne_name_text").setText( nameText );
            item.getChildByName("bg").setImage( bgPhoto );
            
            item.getChildByName("demesne_banner").visible = occupied;
            mainPanel.getChildByName("demesne_light_" + i ).visible = occupied;
            (function(nameText,bgPhoto,uid){
                item.setOnClick(function(){
                    global.occupantPanel.hide();
                    global.visitFriend.visit(uid,nameText,bgPhoto,false);
                })
            })(nameText,bgPhoto,uid);
        }
    };

    proto._onSecond = function() {
        var timeLeft = global.dataCenter.data.playermark.attacktime - global.common.getServerTime();
        if( timeLeft > 0 ) {
            refreshTimeText.setText( global.common.second2stand( timeLeft ) );
        } else {
            global.gameSchedule.unscheduleFunc( onSecond );
            this.refresh();
        }
    };

    global.occupantPanel = new OccupantPanel();

})();
