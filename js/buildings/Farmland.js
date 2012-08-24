/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 农田类
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
    var STATE_WITHER = 3;

    var proto = BuildingFarmland.prototype;

    function BuildingFarmland(container) {

        this.buildingName = 'farmlandBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 9;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'fieldBuilding': [1]
        };
        
        this.crop = null;

        global.Building.call(this, container);

        this.lastState = this.getState();
        global.gameSchedule.scheduleFunc(this._onSecond.bind(this), 1000);

        var building = this;

        this.mc.addEventListener(Event.MOUSE_CLICK, function(e) {
            var state = building.getState();
            switch( state ) {
                case STATE_EMPTY:
                    if(global.isMyHome){
                        global.fieldPanel.show();
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

                case STATE_WITHER:
                    if(global.isMyHome){
                        global.fieldControlPanel.show(building); 
                    }else{
                        building.recover();
                    }
                    break;

                default:
                    break;
            }
        });
    }

    proto.update = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return; }

        this.crop && this.mc.removeChild(this.crop);
        this.crop = new MovieClip('crop');
        this.mc.addChild( this.crop );

        this.delTopTip();

        var configs = this.getPlantconfigs();
        var resName = configs["res"+data.extradata];

        var state = this.getState();
        var enjoinIcon = textureLoader.createMovieClip('ui', 'enjoin_icon');
        var occupantIcon = textureLoader.createMovieClip('ui', 'occupant_icon');
        switch( state ) {
            case STATE_EMPTY:
                this.addTopTip("message_icon");
                break;

            case STATE_WORKING:
                resName += "1";
                break;

            case STATE_FINISH:
                resName += "2";
                var topTip = this.addTopTip("harvest_food_icon", this);
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

            case STATE_WITHER:
                resName += "3";
                break;

            default:
                break;
        }

        if( resName ) {
            var crop = textureLoader.createMovieClip("grow", resName);
            crop.y = -10;
            crop.x = 2;
            this.crop.addChild( crop );
        }

        this.changeLevel(data.level);

    };

    proto.getState = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return STATE_EMPTY; }

        if( data.extradata > 0 ) {
            var allPlantConfig = global.configs["config/city/build_work_config"].config.plant["@attributes"];
            var configs = this.getPlantconfigs();
            var resName = configs["res"+data.extradata];

            var serverTime = global.common.getServerTime();
            if( serverTime < data.endworktime ) {
                return STATE_WORKING;
            }
            else if (serverTime < (data.endworktime + allPlantConfig.cycle * 3600) ) {
                return STATE_FINISH;
            } else {
                return STATE_WITHER;
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

    proto.plant = function(id) {
        var configs = this.getPlantconfigs();
        gold = configs["gold"+id];
        this._request(1, id, {"gold" : gold});
    };

    proto.harvest = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if(global.isMyHome){
            this._request(3, data.extradata);
        }else{
            var soldierIcon = global.sceneMyZone.cityScene.getChildByName('farmlandBuilding').getChildByName('harvest_food_icon');
            if(soldierIcon.getChildByName('occupant_icon')){
                global.dialog('好友被占领，无法拿取资源')
            }else if(soldierIcon.getChildByName('enjoin_icon')){
                global.dialog('资源已经不多了，留给主人一些吧，下次请早')
            }else{
                this._request(3, data.extradata);
            }
        }
    };

    proto.clean = function() {
        var data = global.dataCenter.data.builds[this.buildingType];

        this._request(4, data.extradata);
    };

    proto.recover = function() {
        var data = global.dataCenter.data.builds[this.buildingType];

        if(global.isMyHome){
            var gold = this.getRecoverGold();
            this._request(5, data.extradata, {"gold" : gold});
        }else{
            this._request(5, data.extradata);
        }
    };

    proto.accelerate = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        var hurryupNeed = global.ItemFunction.calculateHurryup( this.getTimeLeft() );

        this._request(2, data.extradata, {"hurryup" : hurryupNeed});
    };

    proto.getRecoverGold = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        var id = data.extradata;
        var configs = this.getPlantconfigs();
        var allPlantConfig = global.configs["config/city/build_work_config"].config.plant["@attributes"];
        return Math.ceil(allPlantConfig.recovercash * configs["gold"+id] / 100);
    }

    proto.getPlantconfigs = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        var buildingLevel = data.level;

        var allLevelConfigs = global.configs["config/city/build_work_config"].config.farm;
        for(var i=0,max=allLevelConfigs.length; i<max; i++ )
        {
            if( allLevelConfigs[i]["@attributes"].level == buildingLevel ) {
                break;
            }
        }

        if( i == allLevelConfigs.length ) {
            i = allLevelConfigs.length - 1;
        }

        configs = allLevelConfigs[i]["@attributes"];

        return configs;
    }

    proto._request = function(mode, id, extra, callback) {
        var params = {
            "opmode" : mode, // begin = 1, hurry = 2, harvest = 3, clean = 4, recover=5
            "type" : id,
            "buildtype" : this.buildingType,
            "ownerid" : global.NetManager.uid, //自己或者好友
            "hurryup" : 0, //道具数量 或者 0(没有使用道具)
            "gold": 0,
            "cash": 0
        };

        var mod = 'City';
        var act = 'plant';
        if(!global.isMyHome){
            if(mode == 5){
                act = 'help';
            }else if(mode == 3){
                act = 'steal'
            }
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

        global.NetManager.call(mod, act, params,
            function(data) {
                if( data.data.build ) {
                    global.dataCenter.data.builds[data.data.build.type] = data.data.build;
                }

                if(data.data.gameinfo){
                    global.controller.gameinfoController.update(data.data.gameinfo);
                }

                if(data.data.stealinfo){
                    global.dataCenter.data.stealinfo = data.data.stealinfo;
                }
                if(data.data.mission_day){
                    global.controller.dayMissionController.update( data.data.mission_day );
                }

                if(data.data.mission ){
                    global.controller.missionController.update( data.data.mission );
                }
                if(data.data.player){
                    global.controller.playerStatusController.update( data.data.player );
                }
                building.update();
                callback && callback();
            }
        );
    };

    proto._onSecond = function() {
        var state = this.getState();
        if( state != this.lastState ) {
            this.update();
            this.lastState = state;
        }
    };


    global.BuildingFarmland = BuildingFarmland;

})();
