/**
 * Created by Bingnan Gao.
 * User: Bingnan Gao
 * Date: 12-4-19
 * Time: 上午11:08
 *
 */
(function(){

    var proto = battleDialog.prototype;
    var story = {};
    var mcContainer;
    var bigMap;
    var bigMapWidth;
    var bigMapHeight;
    var mapStoryPanel;//关卡面板
    var arrow;//剑的icon
    var mapStory;//每个关卡的mc
    var soldier;//player的士兵数
    var battlenumber;//player的军令数
    var heroCount;//player的英雄数
    var troopid;//参战军团id
    var myOwnData = {};
    var heroConfig;
    var home;
    var message;
    var info;
    var userLevel;
    var tempId;
    var m_defenceLegion = {};
    global.battleData = {};

    function battleDialog() {
        this.isShowing = false;
        //当前关卡id

    }

    proto.showDialog = function(){
        //先判断英雄数量，没有的话提示去酒馆招英雄
        var mapConfig = {
            'map': ['battle_report_icon1','challenge_map_info','island_1_map_bg','map_banner','map_tips','map_icon_fighting'],
            'window':['battle_report_panel'],
            'common_tips':['common_tips']
        };
        var callback = new LoadProcessor(function (){
            global.configHelper.initSkillConfig(function(){
                global.configManager.load('config/battle/challenge_config',function(){
                    if (!this.isShowing){
                        soldier = global.dataCenter.data.player.soldier;
                        battlenumber = global.dataCenter.data.player.battlenumber;
                        mcContainer = new MovieClip('bigMapContainer');
                        userLevel = global.dataCenter.getLevel();
                        story.currentId = global.dataCenter.data.gameinfo.storyid;
                        this.showStoryInfo(story.currentId);
                        global.currentPart = story.part;
                        //添加大地图并隐藏没打开的地图和脚印
                        this.addBigMap();
                        //添加回家以及信息面板和消息
                        this.addHome();
                        //添加小旗
                        this.addMapBanner();
                        this.setMessagePanel();
                        if(story.part == 1||story.part == 2||story.part == 9){
                            bigMap.y = global.GAME_HEIGHT - 1000;
                        }else if(story.part == 3||story.part == 4||story.part == 5){
                            bigMap.y = 0;
                        }else if(story.part == 6||story.part == 7||story.part == 8){
                            bigMap.x = global.GAME_WIDTH - 1284;
                        }else if(story.part == 10||story.part == 11||story.part == 12){
                            bigMap.x = global.GAME_WIDTH - 1284;
                            bigMap.y = global.GAME_HEIGHT - 1000;
                        }
                        global.stage.addChild(mcContainer);
                        var musicSettingCtr = global.createMusicSettingCtr();
                        if(musicSettingCtr){
                            mcContainer.addChild(musicSettingCtr.getDisplayObject());
                        };
                        //global.sceneMyZone.killMyZone();
                    }
                    Event.enableDrag = true;
                }.bind(global.ui.battleDialog));
            })
        });
        //textureLoader.preload(mapConfig,new LoadProcessor(callback()));
        for(var key in mapConfig){
            textureLoader.loadLibrary(key, mapConfig[key], true, callback);
        }
        callback.start();
    };

    proto.hideDialog = function(){
        if(mcContainer){
            mcContainer.parent.removeChild(mcContainer);
        }
        textureLoader.unloadLibrary('map');
        textureLoader.unloadLibrary('window');
        textureLoader.unloadLibrary('common_tips');
        Event.enableDrag = true;
        bigMap = null;
        mapStoryPanel = null;
        arrow = null;
        home = null;
        info = null;
        message = null;
    };

    proto.addMapBanner = function(){
        var currentPos = bigMap.getChildByName("island_1_map_1".replace(/map_1/,'map_'+story.part));
        var currentMapX = currentPos.x;
        var currentMapY = currentPos.y;
        var mapBanner = textureLoader.createMovieClip('map', 'map_banner');
        //currentPos.addChild(mapBanner);
        bigMap.addChild(mapBanner);
        var numb = 0;
        for(var l=1; l<story.part; l++){
            numb += (bigMap.getChildByName("island_1_map_" + l).frames[1].length-1);
        }
        mapBanner.setOnClick(function(){
            _addMapTips(story.currentId,global.currentPart,numb);
        });
        currentPos = currentPos.getChildByName("step8".replace(/8/,story.currentStoryStepId));
        mapBanner.x = currentPos.x + currentMapX;
        mapBanner.y = currentPos.y + currentMapY;
        currentPos.visible = false;
        mapBanner = null;
    };

    proto.setMessagePanel = function(){
        var arr = [];
        var maxStoryId;
        var map = global.configManager.get('config/battle/challenge_config').data.map[0].challenge;
        for(var i=0; i<map.length; i++){
            if(map[i]['@attributes'].part == story.part){
                arr.push(map[i]);
            }
        }
        maxStoryId = arr[arr.length-1]['@attributes'].id;
        info.getChildByName("name_text").setText(story.newName);
        info.getChildByName("challenge_text").setText(story.currentId + '/' + maxStoryId);
        info.getChildByName("soldier_text").setText(soldier);
        info.getChildByName("energy_text").setText(battlenumber);
        //map = null;
    };

    proto.addBigMap = function(){
        bigMap = textureLoader.createMovieClip('map', 'island_1_map_bg');
        bigMapWidth = bigMap.getWidth();
        bigMapHeight = bigMap.getHeight();

        mcContainer.addChild(bigMap);
        bigMap.setIsSwallowTouch(true);
        bigMap.addEventListener(Event.GESTURE_DRAG, function(e) {
            this.x += e.data.x;
            this.y += e.data.y;

            if (this.x < (global.GAME_WIDTH - bigMapWidth)) {
                this.x = global.GAME_WIDTH - bigMapWidth;
            } else if (this.x > 0) {
                this.x = 0;
            }

            if (this.y < (global.GAME_HEIGHT - bigMapHeight)) {
                this.y = global.GAME_HEIGHT - bigMapHeight;
            } else if (this.y > 0) {
                this.y = 0;
            }
        }.bind(bigMap));

        var length = bigMap.frames[1].length - 4;
        var map = 'island_1_map_bg';
        if(userLevel >= 10){
            bigMap.getChildByName('gold_island').gotoAndStop(1);
            bigMap.getChildByName('gold_island').visible = true;
            bigMap.getChildByName('gold_island').getChildByName('island').setOnClick(function(){
/*                global.NetManager.call('Player','mine',{},function(data){
                    global.battleData.data = data;
                },'加载金矿数据');*/
                global.mineBattle.show();
                global.ui.battleDialog.hideDialog();
            });
        }else{
            bigMap.getChildByName('gold_island').visible = true;
        }
        bigMap.getChildByName('island_1_map_Dragon50').visible = false;
        bigMap.getChildAt(15).visible = false;
        for(var i=length; i>story.part; i--){
            bigMap.getChildByName(map.replace(/bg/,i)).visible = false;
        }
        var len = bigMap.getChildByName(map.replace(/bg/,story.part)).frames[1].length - 1;

        if(story.part > 1){
            var num = 0;
            for(var l=1; l<story.part; l++){
                num += (bigMap.getChildByName("island_1_map_" + l).frames[1].length-1);
            }
            mcContainer.num = num;
            story.currentStoryStepId = story.currentId - num;
        }else{
            story.currentStoryStepId = story.currentId;
        }
        for(var length=story.part; length>0; length--){
            if(length == story.part){
                for(var j=len; j>=1; j--){
                    var name = bigMap.getChildByName(map.replace(/bg/,length)).frames[1][j].name;
                    var stepNumArr = name.split('/');
                    var stepNum = stepNumArr[stepNumArr.length-1].substr(4);
                    if(stepNum > story.currentStoryStepId){
                        bigMap.getChildByName(map.replace(/bg/,length)).frames[1][j].visible = false;
                    }else{
                        (function(id,len,step,number){
                            bigMap.getChildByName(map.replace(/bg/,len)).frames[1][id].setOnClick(function(){
                                var stepId = parseInt(step) + number;
                                _addMapTips(stepId,len,number);
                                stepId = null;
                            });
                        })(j,length,stepNum,mcContainer.num);
                    }
                }
            }else{
                var number = 0;
                len = bigMap.getChildByName(map.replace(/bg/,length)).frames[1].length - 1;
                if(length !== 1){
                    for(var l=1; l<length; l++){
                        number += (bigMap.getChildByName("island_1_map_" + l).frames[1].length-1);
                    }
                }
                mcContainer.number = number;
                for(var j=len; j>0; j--){
                    bigMap.getChildByName(map.replace(/bg/,length)).frames[1][j].visible = true;
                    var name = bigMap.getChildByName(map.replace(/bg/,length)).frames[1][j].name;
                    var stepNumArr = name.split('/');
                    var stepNum = parseInt(stepNumArr[stepNumArr.length-1].substr(4));
                    (function(id,number,len){
                        bigMap.getChildByName(map.replace(/bg/,len)).frames[1][id].setOnClick(function(){
                            var name = bigMap.getChildByName(map.replace(/bg/,len)).frames[1][id].name;
                            var stepNumArr = name.split('/');
                            var stepNum = parseInt(stepNumArr[stepNumArr.length-1].substr(4));
                            if(len !== 1){
                                var stepId = stepNum + number;
                            }else if(len == 1){
                                var stepId = stepNum;
                            }
                            _addMapTips(stepId,len,number);
                            name = null;
                            stepNumArr = null;
                            stepNum = null;

                        });
                    })(j,number,length);
                }
            }
        }
        mapStoryPanel = textureLoader.createMovieClip('map', 'map_tips');
        arrow = textureLoader.createMovieClip('map', 'map_icon_fighting');
    };

    function _addMapTips(id,storyLen,number){
        global.ui.battleDialog.showStoryInfo(id);

        if(storyLen == global.currentPart && id > 10){
            var currentPosition = bigMap.getChildByName("island_1_map_1".replace(/map_1/,'map_'+global.currentPart));
            tempId = id - number;
        }else if(id > 10 && storyLen < global.currentPart){
            var currentPosition = bigMap.getChildByName("island_1_map_1".replace(/map_1/,'map_'+storyLen));
            tempId = id - number;
        }else if(id <= 10){
            var currentPosition = bigMap.getChildByName("island_1_map_1");
            tempId = id;
        }
        var currentStep = currentPosition.getChildByName("step8".replace(/8/,tempId));
        if(currentStep){
            mapStoryPanel.x = currentStep.x + currentPosition.x - 100;
            if((currentStep.y + currentPosition.y - 100) > mapStoryPanel.getHeight()){
                mapStoryPanel.y = currentStep.y + currentPosition.y - 210;
            }else{
                mapStoryPanel.x = currentStep.x + currentPosition.x;
                mapStoryPanel.y = currentStep.y + currentPosition.y;
            }
            arrow.x = currentStep.x + currentPosition.x;
            arrow.y = currentStep.y + currentPosition.y;
        }
        bigMap.addChild(mapStoryPanel);
        bigMap.addChild(arrow);
        mapStoryPanel.getChildByName("close_icon").stop();
        mapStoryPanel.getChildByName("star_battle_btn").stop();
        mapStoryPanel.getChildByName("title_text").setText(story.title);
        mapStoryPanel.getChildByName("level_text").setText(story.level);
        mapStoryPanel.getChildByName("army_text").setText(story.troopNum);
        mapStoryPanel.getChildByName("goods_text_1").setText(story.dropItemArr[0]);
        mapStoryPanel.getChildByName("goods_text_2").setText(story.dropItemArr[1]);
        mapStoryPanel.getChildByName("close_icon").setButton(true,function(){
            bigMap.removeChild(mapStoryPanel);
            bigMap.removeChild(arrow);
        });
        mapStoryPanel.getChildByName("star_battle_btn").setOnClick(function(){
            bigMap.removeChild(mapStoryPanel);
            bigMap.removeChild(arrow);
            var obj = {mode:global.MODE_BATTLE,enemyId:0};
/*            var callBack = function(){ global.ui.battleDialog.goToBattlePanel(storyLen,obj);}
            textureLoader.preload(global.battleTexturesConfig,new LoadProcessor(callBack()));*/
            global.configHelper.destorySkillConfig();
            global.ui.battleDialog.hideDialog();
            global.ui.battleDialog.goToBattlePanel(storyLen,obj);

        });
        //number = 0;
        currentPosition = null;
        currentStep = null;
    }

    proto.addHome = function(){
        home = textureLoader.createMovieClip('ui', 'icon_home');
        info = textureLoader.createMovieClip('map', 'challenge_map_info');
        message = textureLoader.createMovieClip('map', 'battle_report_icon1');
        home.x = global.GAME_WIDTH-100;
        home.y = global.GAME_HEIGHT-100;
        info.x = 10;
        info.y = 10;
        message.x = 220;
        message.y = 30;
        //home.gotoAndStop(2);
        mcContainer.addChild(home);
        mcContainer.addChild(info);
        mcContainer.addChild(message);
        this.setMessagePanel();
        home.setButton(true,function(){
            global.waitingPanel.show();
            global.waitingPanel.setText('回家中');
            this.hideDialog();
            //global.initZone();
            global.sceneMyZone.initMyZone();
            global.configManager.unload('config/battle/challenge_config');
            global.configHelper.destorySkillConfig();
        }.bind(this));
        message.setOnClick(function(){
            global.ui.battleReportDialog.showDialog(true,bigMap);
        });

    };

    proto.goToBattlePanel = function(storyLen,obj){
        global.configHelper.initSkillConfig(function(){
            global.battleReportReader = new global.BattleReportReader();
            global.soundManager.playEffect('battle_bgm.mp3');
            global.battleData = {isMine:0,location:0,defid:0,mapid:1,ishelp:0,isdrive:0};
            m_defenceLegion["legion"] = {};
            if(obj.mode == global.MODE_RELEASE || obj.mode == global.MODE_CAPTURE){
                story.isFog = 1;
                story.enemyId = 0;
                story.hint = '';
                if(obj.mode == global.MODE_RELEASE){
                    global.battleData.ishelp = 1;
                    global.battleData.defid = obj.enemyId;
                    global.battleData.location = obj.saveId;
                }else{
                    global.battleData.ishelp = 0;
                    global.battleData.location = global.battleData.defid = obj.enemyId;
                }
            }
            if(!parseInt(story.isFog)){
                m_defenceLegion["legion"] = story.defenceLegion;
                m_defenceLegion["lv"] = story.enemyLevel;
                m_defenceLegion["name"] = story.enemyName;
                m_defenceLegion["photo"] = story.enemyPhoto;
                m_defenceLegion["uid"] = 0;
                global.battleReportReader.setEnemyData(m_defenceLegion);
            }
            var defaultLegion = this._getLegion();
            if (defaultLegion) {
                story.troopid = defaultLegion.troopid;
                var legionInfo = this._getLegionInfoWithTroop(defaultLegion);
                legionInfo.troopid = story.troopid;
                global.legionInfo = legionInfo;
                if(story.troopid == 0){
                    legionInfo.legion = {};
                }
                global.battleReportReader.setLegionData(legionInfo);
            }
            var data = {bg:storyLen,fog:parseInt(story.isFog),legion:global.battleReportReader.getAttackLegionData(),enemy:global.battleReportReader.getDefenceLegionData()};
            var callBack = function(){
                global.battleWorld = new global.BattleWorld(data);
                this._initBattlePreviewLayer('',global.battleWorld,storyLen,story.enemyId,story.hint,obj,story.troopid);
                global.stage.addChild(global.battleWorld.getDisplayObject());
            }.bind(this);
            this.hideDialog();
            global.BattleManager.loadAssets(callBack);
            global.configManager.unload('config/battle/challenge_config');

        }.bind(this));

    };

    proto.showStoryInfo = function(id){
        global.configManager.load('config/battle/challenge_config',function(data){
            global.battleData.map = data.data.map;
        },true)
        story.isFog = 0;
        var storyInfo;
        var dType;
        var dId;
        var dProb;
        //获得关卡信息
        myOwnData.map = global.battleData.map;
        storyInfo = this.getStoryById(myOwnData.map, id);
        story.title = storyInfo.title;
        story.level = storyInfo.level;
        story.troopNum = storyInfo.troopNum;
        story.dropItem = storyInfo.dropItem;
        story.newName = storyInfo.newName;
        story.part = storyInfo.part;
        story.isFog = storyInfo.isFog;
        story.hint = storyInfo.hint;
        story.dropItemArr = {};
        if(story.dropItem){
            for(var i=0; i<story.dropItem.length; i++){
                dType = story.dropItem[i]['@attributes'].itemtype;
                dId = story.dropItem[i]['@attributes'].itemid;
                dProb = story.dropItem[i]['@attributes'].prob;
                if(dProb < 50){
                    dProb = "(罕见)";
                }else if(dProb < 200){
                    dProb = "(极少)";
                }else if(dProb < 1000){
                    dProb = "(稀少)";
                }else if(dProb < 2000){
                    dProb = "(少)";
                }else if(dProb < 5000){
                    dProb = "(一般)";
                }else{
                    dProb = "(较多)";
                }
                if(dType == 0 && dId == 0){
                    story.dropItemArr[i] = '';
                }else{
                    story.dropItemArr[i] = global.ItemFunction.findItemByTypeId(dType, dId)['@attributes'].name + dProb;
                }
            }
        }
        myOwnData.map = null;
        return story;
        //global.configManager.unload('config/battle/challenge_config');
    };

    proto.getStoryById = function(mapObj, id){
        var mapArr = mapObj[0]['challenge'];
        var length = mapArr.length;
        var storyInfo = {};
        for(var k=0; k<length; k++){
            if(mapArr[k]['@attributes'].id == id){
                storyInfo.title = mapArr[k]['@attributes'].desc;
                storyInfo.level = mapArr[k]['@attributes'].level;
                storyInfo.isFog = mapArr[k]['@attributes'].fog;
                story.enemyName = mapArr[k]['@attributes'].name;
                story.enemyLevel = mapArr[k]['@attributes'].level;
                story.enemyPhoto = global.ui.battleDialog.getPhotoNum(mapArr[k]['@attributes'].photo);
                story.enemyId = mapArr[k]['@attributes'].id;
                storyInfo.hint = mapArr[k]['@attributes'].hint;
                if(mapArr[k]['troops'].troop && mapArr[k]['troops'].troop.length){
                    storyInfo.troopNum = mapArr[k]['troops'].troop.length;
                    var troopInfo = mapArr[k]['troops'].troop;
                }else if(mapArr[k]['troops'][0] && mapArr[k]['troops'][0].troop.length){
                    storyInfo.troopNum = mapArr[k]['troops'][0].troop.length;
                    var troopInfo = mapArr[k]['troops'][0].troop;
                }else{
                    storyInfo.troopNum = 1;
                    var troopInfo = mapArr[k]['troops'].troop;
                }
                (function(troopInfo){
                    this.getTroopData(troopInfo);
                }.bind(this))(troopInfo);
                storyInfo.dropItem = mapArr[k]['dropitem'];
                storyInfo.newName = mapArr[k]['@attributes'].newname;
                storyInfo.part = mapArr[k]['@attributes'].part;
            }
        }
        return storyInfo;
    };

/*    proto.isEnergy = function(skillid){
        var callBack = function(){
            var count = 0;
            for(var i=0,len=skillid.length;i<len;i++){
                var skill = global.configHelper.getBattleSkill(skillid[i]);
                var isvalid = global.configHelper.isValidActiveSkill(skill);
                if(isvalid == false){
                    count++;
                }
            }
            if(skillid.length == 2 && count == 2){
                return false;
            }else if(skillid.length == 1 && count == 1){
                return false;
            }else{
                return true;
            }
        }
        global.configHelper.initSkillConfig(callBack);
        global.configHelper.destorySkillConfig();
    };*/

    proto.getTroopData = function(troopInfo){
        story.defenceLegion = {};
        global.configManager.load('config/battle/troop_config',function(troopData){
            global.configManager.load('config/battle/hero_config',function(data){
                global.configManager.load('config/battle/skill_config',function(skillData){
                    var troop = troopData.data.troop;
                    heroConfig = data.a.hero;
                    story.skillConfig = skillData.data.skill;
                    var troopAbility = global.configs['config/battle/troop_ability'].data.ability;
                    if(troopInfo.length == undefined){
                        story.troopData = {};
                        story.troopData["sid"] = troopInfo['@attributes'].classid;
                        story.troopData["level"] = troopInfo['@attributes'].level;
                        story.troopData['heroId'] = troopInfo['@attributes'].hero;
                        story.defenceLegion[parseInt(troopInfo['@attributes'].pos)-1] = story.troopData;
                        for(var i=0,length=troopAbility.length; i<length; i++){
                            if(troopAbility[i]['@attributes'].level == story.troopData['level']){
                                story.troopData["totalHp"] = troopAbility[i]['@attributes'].soldier;
                                story.troopData["currentHp"] = troopAbility[i]['@attributes'].soldier;;
                            }
                        }
                        for(var j=0,len=troop.length; j<len; j++){
                            var currentTroop = troop[j]['@attributes'];
                            if(currentTroop.classid ==story.troopData["sid"]){
                                story.troopData["attackType"] = currentTroop.atktype;
                            }
                        }
                        for(var k=0,max=heroConfig.length; k<max; k++){
                            if(heroConfig[k]['@attributes'].id == story.troopData['heroId']){
                                story.troopData["name"] = heroConfig[k]['@attributes'].name;
                                story.troopData["photo"] = global.ui.battleDialog.getPhotoNum(heroConfig[k]['@attributes'].photo);
                                story.troopData['skillid'] = [];
                                story.troopData['skillid'].push(heroConfig[k]['@attributes'].skill1id);
                                if(heroConfig[k]['@attributes'].skill2id){
                                    story.troopData['skillid'].push(heroConfig[k]['@attributes'].skill2id);
                                }
                                (function(skillid){
                                    var skill = global.configHelper.getBattleSkill(story.troopData['skillid'][0]);
                                    var isvalid = global.configHelper.isValidActiveSkill(skill);
                                    story.troopData["im"] = isvalid;
                                    skill = null;
                                    isvalid = null;
                                }.bind(global.ui.battleDialog))(story.troopData['skillid']);
                            }
                        }
                    }
                    for(var m=0,trooplen=troopInfo.length; m<trooplen; m++){
                        story.troopData = {};
                        story.troopData["sid"] = troopInfo[m]['@attributes'].classid;
                        story.troopData["level"] = troopInfo[m]['@attributes'].level;
                        story.troopData['heroId'] = troopInfo[m]['@attributes'].hero;
                        story.defenceLegion[parseFloat(troopInfo[m]['@attributes'].pos)-1] = story.troopData;
                        for(var i=0,length=troopAbility.length; i<length; i++){
                            if(troopAbility[i]['@attributes'].level == story.troopData['level']){
                                story.troopData["totalHp"] = troopAbility[i]['@attributes'].soldier;
                                story.troopData["currentHp"] = troopAbility[i]['@attributes'].soldier;
                            }
                        }
                        for(var j=0,len=troop.length; j<len; j++){
                            var currentTroop = troop[j]['@attributes'];
                            if(currentTroop.classid ==story.troopData["sid"]){
                                story.troopData["attackType"] = currentTroop.atktype;
                            }
                        }
                        heroConfig = data.a.hero;
                        for(var k=0,max=heroConfig.length; k<max; k++){
                            if(heroConfig[k]['@attributes'].id == story.troopData['heroId']){
                                story.troopData["name"] = heroConfig[k]['@attributes'].name;
                                story.troopData["photo"] = global.ui.battleDialog.getPhotoNum(heroConfig[k]['@attributes'].photo);
                                story.troopData['skillid'] = [];
                                story.troopData['skillid'].push(heroConfig[k]['@attributes'].skill1id);
                                if(heroConfig[k]['@attributes'].skill2id){
                                    story.troopData['skillid'].push(heroConfig[k]['@attributes'].skill2id);
                                }
                                (function(skillid){
                                    var skill = global.configHelper.getBattleSkill(story.troopData['skillid'][0]);
                                    var isvalid = global.configHelper.isValidActiveSkill(skill);
                                    story.troopData["im"] = isvalid;
                                    skill = null;
                                    isvalid = null;
                                }.bind(global.ui.battleDialog))(story.troopData['skillid']);
                            }
                        }
                    }
                    global.curDefenceLegion = story.defenceLegion;
                    troop = null;
                    heroConfig = null;
                    troopAbility= null;
                });
            }.bind(global.ui.battleDialog));
        }.bind(global.ui.battleDialog));
        global.configManager.unload('config/battle/troop_config');
        global.configManager.unload('config/battle/hero_config');
    };

    proto._initBattlePreviewLayer = function(type,uilayer,mapid,storyid,hint,obj,troopId){
        var showFog = uilayer;
        var uilayer = uilayer.getUILayer();
        if(global.battleData.isMine){
            var storyId = 0;
        }else{
            var storyId = storyid;
        }
        if (!uilayer) return;
        if(type == 'garrison'){
            //侵略中的撤离要在钟德勇那里判断下
            global.editFormationPanel.gotoGarrisionLayer(troopId);
        }else{
            global.ui.battleDialog._initBattleLayer(showFog,uilayer,storyId,mapid,hint,obj,troopId);
        }
    };

    proto._initBattleLayer = function(showFog,uilayer,storyId,mapid,hint,obj,troopId){
        var battlePreviewPanel = textureLoader.createMovieClip('battleUI', 'battle_preview_panel');
        battlePreviewPanel.x = 0;
        battlePreviewPanel.y = global.GAME_HEIGHT - 1.5*battlePreviewPanel.getHeight();
        battlePreviewPanel.name = 'battle_preview_panel';
        battlePreviewPanel.getChildByName('message').visible = false;
        if(global.battleData.isMine){
            battlePreviewPanel.getChildByName('bg').visible = false;
            battlePreviewPanel.getChildByName('mark').visible = false;
            global.BattleManager.setEndCallBack(global.mineBattle.show);
        }else if(obj.mode == global.MODE_BATTLE){
            global.BattleManager.setEndCallBack(global.ui.battleDialog.showDialog);
        }else if(obj.mode == global.MODE_CAPTURE || obj.mode == global.MODE_RELEASE || obj.mode == global.MODE_RESIST){
            global.BattleManager.setEndCallBack(function(){
                global.sceneMyZone.initMyZone();
            });
        }
        uilayer.addChild(battlePreviewPanel);
        var startBattle = battlePreviewPanel.getChildByName('start_btn');
        if(startBattle){
            startBattle.setButton(true,function(){
                trace([global.battleReportReader.getAttackLegionData()])
                var troopid = global.battleReportReader.getAttackLegionData();
                if(global.dataCenter.data.player.soldier == 0){
                    global.dialog('士兵数为0，请先训练士兵');
                }else if(!troopid.troopId && troopId == 0){
                    global.dialog('军团使用中，请编辑军团');
                }else{
                    uilayer.removeChild(uilayer.getChildByName('battle_preview_panel'));
                    global.soundManager.playEffect('battle_start.mp3');
                    global.battleReportReader = new global.BattleReportReader();
                    //troopid = global.battleReportReader.getAttackLegionData();
                    //if(troopid.troopId){
                        story.troopid = troopid.troopId;
                    //}
                    global.BattleManager.startBattle(global.battleData.mapid,parseInt(storyId),story.troopid,0,global.battleData.isMine,global.battleData.defid,false);
                    global.battleData.isWin = global.battleReportReader.getResult().result;
                }
            });
        }
        var editLegionBtn = battlePreviewPanel.getChildByName('compile_legion_btn');
        if (editLegionBtn) {
            editLegionBtn.setButton(true, function () {
                global.editFormationPanel.showDialog(obj.mode, uilayer,global.dataCenter.data.player.viewtroopid);
            });
        }
        var spyBtn = battlePreviewPanel.getChildByName('spy_btn');
        if(parseInt(story.isFog)){
            if(spyBtn){
                spyBtn.visible = true;
                spyBtn.setButton(true,function(){
                    //调用撤掉雾的接口
                    uilayer.getChildByName('battle_preview_panel').getChildByName('spy_btn').visible = false;
                    global.NetManager.call('Hero','spy',{storyid:storyId,mapid:1,location:global.battleData.location,defid:global.battleData.defid},function(enemyData){
                        var defenceLegion = {};
                        var enemyData = enemyData.data.deflegion;
                        for(var i in enemyData.m_troops){
                            var troopData = {};
                            var mTroop = enemyData.m_troops[i];
                            var skillid = [];
                            troopData['sid'] = mTroop.m_classid;
                            troopData["totalHp"] = mTroop.m_maxsoldier;
                            troopData["currentHp"] = mTroop.m_cursoldier;
                            troopData["level"] = mTroop.m_level;
                            skillid.push(mTroop.m_skill1id);
                            if(mTroop.m_skill2id){
                                skillid.push(mTroop.m_skill2id);
                            }
                            var skill = global.configHelper.getBattleSkill(skillid[0]);
                            var isvalid = global.configHelper.isValidActiveSkill(skill);
                            troopData["im"] = isvalid;
                            troopData["attackType"] = mTroop.m_atktype;
                            troopData["name"] = mTroop.m_name;
                            troopData["photo"] = mTroop.m_photoid;
                            defenceLegion[mTroop.m_pos] = troopData;
                        }
                        m_defenceLegion["legion"] = defenceLegion;
                        m_defenceLegion["lv"] = enemyData.m_level;
                        m_defenceLegion["name"] = enemyData.m_name;
                        m_defenceLegion["photo"] = global.ui.battleDialog.getPhotoNum(enemyData.m_photo);
                        m_defenceLegion["uid"] = storyId;
                        global.battleReportReader.setEnemyData(m_defenceLegion);
                        global.BattleManager.loadAssets(function(){
                            showFog.hideFog();
                            global.battleWorld.createEnemy(m_defenceLegion);
                        })
                    });
                });
            }
        }else{
            spyBtn.visible = false;
        }
        var retreatBtn = battlePreviewPanel.getChildByName('exit_btn');
        if (retreatBtn) {
            retreatBtn.setButton(true, function () {
                global.BattleManager.killBattle();
            });
        }

        var battleText = battlePreviewPanel.getChildByName('battle_text');
        if(battleText && hint){
            battleText.setText(hint);
        }else if(!hint){
            battlePreviewPanel.getChildByName('bg').visible = false;
            battlePreviewPanel.getChildByName('mark').visible = false;
        }
        var musicSettingCtr = global.createMusicSettingCtr();
        if(musicSettingCtr && uilayer){
            uilayer.addChild(musicSettingCtr.getDisplayObject());
        };
        battlePreviewPanel = null;
    };

    proto._getLegion = function () {
        var troops = global.dataCenter.data.troops;
        var troopid = global.dataCenter.data.player.viewtroopid;
        if (troops) {
            var location = global.NetManager.uid || 0;
            for (var key in troops) {
                if(key == troopid){
/*                    if(global.battleData.isMine && troops[key].ismine == 1){
                        troops[key].troopid = troopid;
                    }else if(troops[key].location == 0 && troops[key].ismine == 0){
                        troops[key].troopid = troopid;
                    }else{
                        troops[key].troopid = null;
                    }*/
                    if(troops[key].ismine != 0 || troops[key].location != 0){
                        troops[key].troopid = 0;
                    }else{
                        troops[key].troopid = troopid;
                    }
                    return troops[key];
                }
            }
        }
    };

    proto._getLegionInfoWithTroop = function (troop) {
        var legionData = {};
        legionData["legion"] = {};
        legionData["lv"] = global.dataCenter.getLevel();
        legionData["name"] = global.dataCenter.data.player.u;
        legionData["photo"] = "";
        legionData["uid"] = global.NetManager.uid;
        if (troop) {
            var heros = {};
            var heroIdToPos = {};
            for (var i = 1; i <= 9; ++i) {
                var heroid = global.editFormationPanel.getHeroIDAtPosOfLegion(troop, i);
                if (heroid != 0) {
                    heros[heroid] = global.dataCenter.getHeroById(heroid);
                    heroIdToPos[heroid] = i;
                }
            }
            heros = global.editFormationPanel.cacuTroopMount(troop);
            for (var heroid in heros) {
                var hero = heros[heroid];
                var pos = heroIdToPos[heroid];
                var heroInfo = legionData.legion[pos-1] = {};
                var skillId = [];
                skillId.push(heros[heroid].skill1id);
                if(heros[heroid].skill2id){
                    skillId.push(heros[heroid].skill2id);
                }
                heroInfo.sid = hero.corpstype;
                heroInfo.totalHp = hero.totalSoldierNum;
                heroInfo.currentHp = hero.curSoldierNum;
                heroInfo.level = hero.herolevel;
                /*var skillId = heroInfo.skill1id;
                var skill = global.configHelper.getBattleSkill(skillId);
                var isvalid = global.configHelper.isValidActiveSkill(skill);*/
                if(global.dataCenter.data.player.soldier != 0){
                    var skill = global.configHelper.getBattleSkill(skillId[0]);
                    var isvalid = global.configHelper.isValidActiveSkill(skill);
                    heroInfo.im = isvalid;
                }else{
                    heroInfo.im = false;
                }
                heroInfo.attackType = global.configHelper.getTroopByClassId(hero.corpstype)['@attributes'].atktype;
                heroInfo.name = hero.heroname;
                heroInfo.photo = hero.image;
            }
        }
        return legionData;
    };

    proto.getPhotoNum = function(string){
        if(string == '' || string == null){
            return string;
        }
        var array = string.match(/\d+/ig);
        var num = parseInt(array[0]);
        return num;
    };

    global.ui.battleDialog = new battleDialog();
})();
