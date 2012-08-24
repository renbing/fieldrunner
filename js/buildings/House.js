/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 民居类
 *
 * 工厂模式
 *
 */
(function() {

    /**
     * 构造器
     * @param container
     */

    var STATE_EMPTY = 0;
    var STATE_WORKING = 1;
    var STATE_FINISH = 2;

    var proto = BuildingHouse.prototype;

    function BuildingHouse(container) {

        this.buildingName = 'houseBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 1;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'houseBuilding1': [0,0,0,1,0],
            'houseBuilding2': [0,0,1,1,0],
            'houseBuilding3': [0,1,1,1,0],
            'houseBuilding4': [1,1,1,1,0]
        };

        global.Building.call(this, container);
        
        this.lastState = this.getState();
        global.gameSchedule.scheduleFunc(this._onSecond.bind(this), 1000);

        var building = this;

        this.mc.addEventListener(Event.MOUSE_CLICK, function() {
            var state = building.getState();
            switch( state ) {
                case STATE_EMPTY:
                    if(global.isMyHome){
                        global.housePanel.show();
                    }
                    break;
                case STATE_WORKING:
                    var timeLeft = building.getTimeLeft();
                    if(global.isMyHome){
                        global.acceleratePanel.show( building, timeLeft );
                    }
                    break;
                case STATE_FINISH:
                    building.harvest();
                    break;
                default:
                    break;
            }
        });
    }

    proto.update = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return; }
        this.changeLevel(data.level);

        this.delTopTip();

        this.processingMc = this.mc.getChildAt(4);
        this.processingMc.visible = false;

        var state = this.getState();
        var enjoinIcon = textureLoader.createMovieClip('ui', 'enjoin_icon');
        var occupantIcon = textureLoader.createMovieClip('ui', 'occupant_icon');
        switch( state ) {
            case STATE_EMPTY:
                this.addTopTip("message_icon");
                break;
            case STATE_WORKING:
                this.processingMc.visible = true;
                break;
            case STATE_FINISH:
                var topTip = this.addTopTip("populousIcon", this);
                if(!global.isMyHome){
                    var data = global.dataCenter.data.builds[this.buildingType];
                    var castleData = global.dataCenter.data.builds[0];
                    var stealinfo = global.dataCenter.data.stealinfo;
                    if(stealinfo && stealinfo.length == 0){
                        if(castleData.occupy != 0){
                            topTip.mc.addChild(occupantIcon);
                        }
                    }else{
                        if(stealinfo && stealinfo[this.buildingType]){
                            for(var i=0,len=stealinfo[this.buildingType].length; i<len; i++){
                                if(castleData.occupy == 0){
                                    if(len >= 8 || stealinfo[this.buildingType][i] == global.NetManager.uid){
                                        topTip.mc.addChild(enjoinIcon);
                                    }
                                }else{
                                    topTip.mc.addChild(occupantIcon);
                                }
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    proto.getState = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return STATE_EMPTY; }

        if( data.extradata > 0 ) {
            var serverTime = global.common.getServerTime();
            if( serverTime < data.endworktime ) {
                return STATE_WORKING;
            }
            else {
                return STATE_FINISH;
            }
        }

        return STATE_EMPTY;
    };

    proto.getTimeLeft = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return 0; }

        if( data.extradata > 0 ) {
            var serverTime = global.common.getServerTime();
            if( serverTime < data.endworktime ) {
                return data.endworktime - serverTime;
            }
        }

        return 0;
    };

    proto.harvest = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if(global.isMyHome){
            this._request(3, data.extradata, null, function(e) {
                global.soundManager.playEffect("harvest_population.mp3");
            });
        }else{
            var soldierIcon = global.sceneMyZone.cityScene.getChildByName('houseBuilding').getChildByName('populousIcon');
            if(soldierIcon.getChildByName('occupant_icon')){
                global.dialog('好友被占领，无法拿取资源')
            }else if(soldierIcon.getChildByName('enjoin_icon')){
                global.dialog('资源已经不多了，留给主人一些吧，下次请早')
            }else{
                this._request(3, data.extradata, null, function(e) {
                    global.soundManager.playEffect("harvest_population.mp3");
                });
            }
        }
    };

    proto.recruit = function(id) {
        this._request(1, id);
    };

    proto.accelerate = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        var hurryupNeed = global.ItemFunction.calculateHurryup( this.getTimeLeft() );
        this._request(2, data.extradata, {"hurryup": hurryupNeed});
    }

    proto._request = function(mode, id, extra, callback) {
        var params = {
            "opmode" : mode, // begin = 1, hurry = 2, harvest = 3
            "type" : id,
            "buildtype" : this.buildingType,
            "ownerid" : global.NetManager.uid, //自己或者好友
            "hurryup" : 0 //道具数量 或者 0(没有使用道具)
        };
        var mod = 'City';
        var act = 'recruit';

        if(!global.isMyHome && mode == 3){
            act = 'steal'
            params = {
                "opmode" : mode, // begin = 1, hurry = 2, harvest = 3, clean = 4, recover=5
                "buildtype" : this.buildingType,
                "ownerid" : global.friendId //自己或者好友
            };
        }
        if( extra ) {
            for( var key in extra ) {
                params[key] = extra[key];
            }
        }

        var building = this;
        global.NetManager.call(mod, act, params, function(data) {
            if( data.data.build ) {
                global.dataCenter.data.builds[data.data.build.type] = data.data.build;
            }
            if(data.data.gameinfo){
                global.controller.gameinfoController.update(data.data.gameinfo);
            }

            if(data.data.stealinfo){
                global.dataCenter.data.stealinfo = data.data.stealinfo;
            }
            building.update();
            global.controller.dayMissionController.update( data.data.mission_day );
            global.controller.missionController.update( data.data.mission );
            global.controller.playerStatusController.update( data.data.player );

            callback && callback();
        });
    };

    proto._onSecond = function() {
        var state = this.getState();
        if( state != this.lastState ) {
            this.update();
            this.lastState = state;
        }
    };

    global.BuildingHouse = BuildingHouse;

})();
