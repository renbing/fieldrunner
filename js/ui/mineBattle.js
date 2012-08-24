/**
 * Created by Bingnan Gao.
 * User: Bingnan Gao
 * Date: 12-5-16
 * Time: 上午10:02
 *
 */
(function(){

    var proto = mineBattle.prototype;
    var minePanel;
    var helpPanel;
    var mineMap,mineTips;
    var leaveBtn;
    var map;
    var refreshBtn;
    var helpBtn;
    var okBtn;
    var mineLevel,minePlayersNum,battleNum;
    var width,height;
    var myGlobalData = {};
    var refreshData = {};
    var mapinfo,player,players;
    var ijHouse,indexHouse;
    var mineCraftJson;
    var rate,playerlimit;
    var mineRate;
    var playerInfo;
    var mineData = {};
    var hasMyMine,myIjHouse,myHousename,myIncome,myFine;
    var clickIndex,clickName,clickIncome,clickHouse,clickFine;
    var inited;
    var titleText;
    var goldPerhour,playerGold;
    var photo,nameText,goldPerHour,extraGold,harvestTime;
    var allGold,cureText,retreat,garrison,occupy,plunder;
    var occupiedTimeValue;
    var leftTime,protectTime;

    function mineBattle(){

    }


    proto.init = function (data) {
        if(!inited){
            mineData.isOccupied = false;
            mineData.data = data;
            map = global.stage.getChildByName('bigMapContainer');
            minePanel = textureLoader.createMovieClip("minecraft", "mineWindow");
            helpPanel = textureLoader.createMovieClip("minecraft", "minecraft_manual_panel");
            mineMap = minePanel.getChildByName('minecraft_map');
            mineTips = minePanel.getChildByName('minecraftTips');
            leaveBtn = mineMap.getChildByName('leave_btn');
            refreshBtn = mineMap.getChildByName('change_minecraft_btn');
            helpBtn = mineMap.getChildByName('help');
            okBtn = helpPanel.getChildByName('manual_accept_btn')
            width = helpPanel.getWidth();
            height = helpPanel.getHeight();
            helpPanel.x = (global.GAME_WIDTH - width) / 2;
            helpPanel.y = (global.GAME_HEIGHT - height) / 2;
            leaveBtn.setButton(true,function(){
                global.mineBattle.hide();
                global.ui.battleDialog.showDialog();
            });
            helpBtn.setButton(true,function(){
                minePanel.addChild(helpPanel);
            });
            okBtn.setButton(true,function(){
                minePanel.removeChild(helpPanel);
            });
            refreshBtn.setButton(true,function(){
                global.mineBattle.hide();
                global.mineBattle.show();
                //this.refreshMinePanel(global.battleData.data);
                myGlobalData.isRefreshBtn = true;
            }.bind(this));
        }
        global.mineBattle.setMinePanel(data);
    };

    proto.refreshMinePanel = function(data){
        mineData.clickHouse = 0;
        global.mineBattle.setMinePanel(data);
    };

    proto.show = function () {
        global.NetManager.call('Player','mine',{},function(data){
            if(data.code != 9){
                global.battleData.data = data;
            }
            var minecraft = {
                'minecraft':['minecraft_manual_panel','mineWindow'],
                'common_tips':['common_tips']
            };
            var callBack = new LoadProcessor(function(){
                global.mineBattle.init(global.battleData.data);
                global.stage.addChild(minePanel);
                if(myGlobalData.isRefreshBtn == true){
                    refreshBtn.visible = false;
                    setTimeout(function(){
                        refreshBtn.visible  = true;
                    },10000);
                }
                myGlobalData.isRefreshBtn = false;
                inited = true;
            });
            for(var key in minecraft){
                textureLoader.loadLibrary(key, minecraft[key], true, callBack);
            }
            callBack.start();
        },'加载金矿数据');
    };

    proto.hide = function () {
        global.gameSchedule.unscheduleFunc(global.setEachHouse);
        global.configManager.unload('config/battle/challenge_config');
        global.configManager.unload('config/battle/minecraft_config');
        global.configManager.unload('config/battle/troop_config');
        global.configManager.unload('config/battle/hero_config');
        minePanel.parent.removeChild(minePanel);
        inited = false;
        textureLoader.unloadLibrary('minecraft');
        textureLoader.unloadLibrary('common_tips');
        global.battleData.mineCraftJson = null;
    };

    proto.setMinePanel = function(data){
        global.configManager.load('config/battle/minecraft_config',function(mine_data){
            mapinfo = data.data.mapinfo;
            mineData.level = mapinfo.level1;
            //this.setMineHouse(data,mapinfo.level1);
            //global.setEachHouse(data,mapinfo.level1);
            player = data.data.player;
            mineLevel = mineMap.getChildByName('level_text');
            minePlayersNum = mineMap.getChildByName('minecraft_text');
            battleNum = mineMap.getChildByName('plunder_text');
            mineLevel.setText(mapinfo.level1);
            minePlayersNum.setText(mapinfo.number + '/' + mapinfo.maxnumber);
            battleNum.setText(player.minefight);
            //获取mc和textfield
            titleText = mineTips.getChildByName('minecraft_title_text');
            photo = mineTips.getChildByName('friend_photo');
            nameText = mineTips.getChildByName('name_text');
            goldPerHour = mineTips.getChildByName('minecraft_yield_text');//金币/小时
            extraGold = mineTips.getChildByName('text_1');//坚守时间和额外奖励
            harvestTime = mineTips.getChildByName('time_text');//结算时间
            allGold = mineTips.getChildByName('gold_text');//积累金币
            cureText = mineTips.getChildByName('text_2');//失败无惩罚
            retreat = mineTips.getChildByName('retreat');//撤军
            retreat.visible = false;
            garrison = mineTips.getChildByName('garrison');//驻防
            garrison.visible = false;
            occupy = mineTips.getChildByName('occupy');//占领
            occupy.visible = false;
            plunder = mineTips.getChildByName('plunder');//掠夺
            plunder.visible = false;
            global.battleData.mineCraftJson = mine_data.minecraft;
            global.setEachHouse = global.mineBattle.setMineHouse;
            var playerlimit = global.battleData.mineCraftJson.playerlimit;
            for(var i=0,max=playerlimit.length; i<max; i++){
                var battleInfo = playerlimit[i]['@attributes'];
                if(battleInfo.beginlevel == mineData.data.data.mapinfo.level1){
                    myGlobalData.battleMapId = battleInfo.mapid;
                    myGlobalData.battleChallengeId = battleInfo.challengeid;
                }
            }
            myGlobalData.troopInfo = global.ui.battleDialog.showStoryInfo(myGlobalData.battleChallengeId);
            global.setEachHouse();
            global.gameSchedule.scheduleFunc(global.setEachHouse,1000);
        });
    };

    proto.setMineHouse = function(){
        mineCraftJson = global.battleData.mineCraftJson;
        playerlimit = mineCraftJson.playerlimit;
        rate = mineCraftJson.rate;
        players = mineData.data.data.players;
        mineData.index = 0;
        for(var j=0,max=rate.length; j<max; j++){
            var rateLevel = rate[j]['@attributes'].level;
            if(rateLevel == mineData.level){
                mineData.fixedgold = rate[j]['@attributes'].Fixedgold;
                mineData.rateValue = rate[j]['@attributes'].value;
            }
        }
        for(var i=1; i<=7; i++){
            for(var j=1; j<=7; j++){
                mineData.index = (j-1)*7+(i-1);
                playerInfo = players[mineData.index];
                mineRate = mineCraftJson.map.mine[(j-1)*7+(i-1)]['@attributes'].rate;
                mineData.ijHouse = mineMap.getChildByName('mine_pos_' + i + '_' + j);
                mineData.ijHouse.getChildByName('protect').visible = false;
                mineData.ijHouse.getChildByName('occupy').visible = false;
                indexHouse = mineData.ijHouse.getChildByName('mine');
                switch(mineRate){
                    case '0':
                        indexHouse.gotoAndStop(1);
                        mineData.houseName = '枯竭的金矿';
                        mineData.income = 80;
                        mineData.fine = 0;
                        break;
                    case '20':
                        indexHouse.gotoAndStop(3);
                        mineData.houseName = '贫瘠的金矿';
                        mineData.income = 100;
                        mineData.fine = 40;
                        break;
                    case '30':
                        indexHouse.gotoAndStop(5);
                        mineData.houseName = '普通的金矿';
                        mineData.income = 150;
                        mineData.fine = 60;
                        break;
                    case '40':
                        indexHouse.gotoAndStop(7);
                        mineData.houseName = '充足的金矿';
                        mineData.income = 200;
                        mineData.fine = 80;
                        break;
                    case '50':
                        indexHouse.gotoAndStop(9);
                        mineData.houseName = '富饶的金矿';
                        mineData.income = 250;
                        mineData.fine = 100;
                        break;
                }
                //定时器设置金矿中的时间显示
                /*if(players[mineData.index].playerid){
                    (function(value,name,income,fine,fixedgold,rateValue,ijHouse,mineRate){
                        setMineTip(value,name,income,fine,fixedgold,rateValue,ijHouse,mineRate);
                    })(mineData.index,mineData.houseName,mineData.income,mineData.fine,mineData.fixedgold,mineData.rateValue,mineData.ijHouse,mineRate);
                }*/
                if(players[mineData.index].playerid != ''){
                    (function(index,ijHouse,fixedgold,income,rateValue){
                        myGlobalData.index = index;
                        myGlobalData.ijHouse = ijHouse;
                        myGlobalData.fixedgold = fixedgold;
                        myGlobalData.income = income;
                        myGlobalData.rateValue = rateValue;
                        myGlobalData.mineRate = mineRate;
                        refreshTime();
                    })(mineData.index,mineData.ijHouse,mineData.fixedgold,mineData.income,mineData.rateValue);
                }else{
                    refreshData.ijHouse = mineData.ijHouse;
                    refreshData.index = mineData.index;
                    refresh();
                }
                mineData.ijHouse.setOnClick( function(value,name,income,fine,fixedgold,rateValue,ijHouse,mineRate) {
                    return function(e) {
                        mineData.clickHouse = 1;
                        clickIndex = value;
                        clickName = name;
                        clickIncome = income;
                        clickHouse = ijHouse;
                        clickFine = fine;
                        setMineTip(value,name,income,fine,fixedgold,rateValue,ijHouse,mineRate);
                    };
                }(mineData.index,mineData.houseName,mineData.income,mineData.fine,mineData.fixedgold,mineData.rateValue,mineData.ijHouse,mineRate));
                if(playerInfo.playerid == global.NetManager.uid){
                    hasMyMine = mineData.index;
                    myIjHouse = mineData.ijHouse;
                    myHousename = mineData.houseName;
                    myIncome = mineData.income;
                    myFine = mineData.fine;
                }
            }
        }
        if(mineData.clickHouse){
            setMineTip(clickIndex,clickName,clickIncome,clickFine,mineData.fixedgold,mineData.rateValue,clickHouse,mineRate);
        }else if(hasMyMine){
            mineData.isOccupied = true;
            setMineTip(hasMyMine,myHousename,myIncome,myFine,mineData.fixedgold,mineData.rateValue,myIjHouse,mineRate);
        }else{
            setMineTip(24,'富饶的金矿',250,100,mineData.fixedgold,mineData.rateValue,mineData.ijHouse,mineRate);
        }
        //获取金矿战信息
/*        (function(playerlimit){
            for(var i=0,max=playerlimit.length; i<max; i++){
                var battleInfo = playerlimit[i]['@attributes'];
                if(battleInfo.beginlevel == mineData.data.data.mapinfo.level1){
                    myGlobalData.battleMapId = battleInfo.mapid;
                    myGlobalData.battleChallengeId = battleInfo.challengeid;
                }
            }
            myGlobalData.troopInfo = global.ui.battleDialog.showStoryInfo(myGlobalData.battleChallengeId);
        })(playerlimit);*/
        mineCraftJson = null;
    };

    function setMineTip(index,name,income,fine,fixedgold,rateValue,ijHouse,mineRate){
        global.battleData.location = index;
        global.battleData.defid = 0;
        //mineData.challengeId = playerlimit.
        titleText.setText(name);
        playerGold = mineData.data.data.player.gold;
        if(players[index].playerid){
            photo.setImage(players[index].headpic);
            nameText.setText(players[index].playername);
            occupy.visible = false;
            //plunder.visible = false;
            cureText.setText('');
        }else{
            harvestTime.setText('');
            extraGold.setText('');
            ijHouse.getChildByName('occupy').visible = false;
            var leftProtectTime = players[index].shielddata - global.common.getServerTime();
            mineData.occupyTime = global.common.getServerTime() - players[index].occupydate;
            if( leftProtectTime > 0 ){
                ijHouse.getChildByName('protect').visible = true;
            }else{
                ijHouse.getChildByName('protect').visible = false;
            }
            extraGold.setText('');
            photo.setImage('');
            nameText.setText('');
            occupy.visible = true;
            retreat.visible = false;
            garrison.visible = false;
            plunder.visible = false;
            var leftProtectTime = players[index].shielddata - global.common.getServerTime();
            if( leftProtectTime < 0 ){
                (function(index,ijHouse,fixedgold,income,rateValue){
                    myGlobalData.index = index;
                    myGlobalData.ijHouse = ijHouse;
                    myGlobalData.fixedgold = fixedgold;
                    myGlobalData.income = income;
                    myGlobalData.rateValue = rateValue;
                    myGlobalData.mineRate = mineRate;
                    occupy.setButton(true,function(){_occupy(myGlobalData.ijHouse);});
                })(index,ijHouse,fixedgold,income,rateValue);
            }else{
                occupy.visible = false;
            }
            cureText.setText('武力占领金矿失败无惩罚');
            harvestTime.setText('00:00:00');
            allGold.setText('0');
        }
        goldPerhour = Math.round(fixedgold * 12 * income/100);
        goldPerHour.setText(goldPerhour);
        leftProtectTime = null;
    }

    function refreshTime(){
        var leftProtectTime = players[myGlobalData.index].shielddata - global.common.getServerTime();
        mineData.occupyTime = global.common.getServerTime() - players[myGlobalData.index].occupydate;
        if( leftProtectTime > 0 ){
            myGlobalData.ijHouse.getChildByName('protect').visible = true;
            myGlobalData.ijHouse.getChildByName('time_text').setText(global.common.second2stand(leftProtectTime));
        }else{
            myGlobalData.ijHouse.getChildByName('protect').visible = false;
            myGlobalData.ijHouse.getChildByName('time_text').setText(global.common.second2stand(mineData.occupyTime));
        }
        //结算时间
        leftTime = players[myGlobalData.index].harvestdate - global.common.getServerTime();
        harvestTime.setText(global.common.second2stand(leftTime));
        var num = Math.floor(mineData.occupyTime/3600) + 1;
        protectTime = global.common.second2stand(3600 - mineData.occupyTime%3600);
        var goldEachHour = 0;
        mineData.preExtGold = 0;
        for(var i=0; i<num-1; i++){
            switch(i){
                case 0:
                    occupiedTimeValue = 10;
                    break;
                case 1:
                    occupiedTimeValue = 20;
                    break;
                case 2:
                    occupiedTimeValue = 30;
                    break;
                case 3:
                    occupiedTimeValue = 40;
                    break;
            }
            goldEachHour += (occupiedTimeValue)*myGlobalData.rateValue/100;
        }
        mineData.preExtGold = goldEachHour;
        if(players[myGlobalData.index].playerid == global.NetManager.uid){
            //第几轮坚守时间
            var goldCurrentExt = 0;
            for(var j=0; j<=num-1; j++){
                switch(i){
                    case 0:
                        occupiedTimeValue = 10;
                        break;
                    case 1:
                        occupiedTimeValue = 20;
                        break;
                    case 2:
                        occupiedTimeValue = 30;
                        break;
                    case 3:
                        occupiedTimeValue = 40;
                        break;
                }
                goldCurrentExt += (occupiedTimeValue)*myGlobalData.rateValue/100;
            }
            mineData.currentExtGold = Math.floor(myGlobalData.income*goldCurrentExt/100);
            extraGold.setText('第'+num+'轮坚守'+protectTime+'额外获得奖励:'+mineData.currentExtGold);
            myGlobalData.totalGold = players[myGlobalData.index].gold + (parseInt(myGlobalData.fixedgold)*Math.floor(mineData.occupyTime/300) + mineData.preExtGold)*myGlobalData.income/100 || '0';
            allGold.setText(Math.floor(myGlobalData.totalGold));
            myGlobalData.ijHouse.getChildByName('occupy').visible = true;
            occupy.visible = false;
            retreat.visible = true;
            garrison.visible = true;
            plunder.visible = false;
            retreat.setButton(true,function(){_retreat(myGlobalData.ijHouse,myGlobalData.index);});
            garrison.setButton(true,_garrison);
        }else {
            myGlobalData.ijHouse.getChildByName('occupy').visible = false;
            extraGold.setText('');
            occupy.visible = false;
            retreat.visible = false;
            garrison.visible = false;
            plunder.visible = true;
            plunder.gotoAndStop(1);
            myGlobalData.totalGold = players[myGlobalData.index].gold + (parseInt(myGlobalData.fixedgold)*Math.floor(mineData.occupyTime/300) + mineData.preExtGold)*myGlobalData.income/100 || '0';
            mineData.failGold = myGlobalData.totalGold * myGlobalData.mineRate/100;
            cureText.setText('占领失败扣除'+ parseInt(mineData.failGold) +'金币');
            allGold.setText(Math.floor(myGlobalData.totalGold));
            if(playerGold > mineData.failGold){
                plunder.setButton(true,_plunder);
            }else{
                plunder.setButton(true,function(){
                    //global.dialog('您的金币不足，不能掠夺资源');
                });
            }
        }
        leftProtectTime = null;
        mineData.occupyTime = null;
    }

    function refresh(){
        var leftProtectTime = players[refreshData.index].shielddata - global.common.getServerTime();
        mineData.occupyTime = global.common.getServerTime() - players[refreshData.index].occupydate;
        if( leftProtectTime > 0 ){
            refreshData.ijHouse.getChildByName('protect').visible = true;
            refreshData.ijHouse.getChildByName('occupy').visible = false;
            refreshData.ijHouse.getChildByName('time_text').setText(global.common.second2stand(leftProtectTime));
        }else{
            refreshData.ijHouse.getChildByName('protect').visible = false;
            refreshData.ijHouse.getChildByName('occupy').visible = false;
            refreshData.ijHouse.getChildByName('time_text').setText('');
        }
        leftProtectTime = null;
        mineData.occupyTime = null;
    }

    function _occupy(ijHouse){
        //调接口传战斗中守方信息,返回战斗结果,isWin=0-平局 1-胜利 2-失败
        if(mineData.isOccupied == true){
            global.dialog('请先撤军再占领金矿');
            return;
        }
        if(player.minesec <= 0){
            global.dialog('今天占矿剩余时间为0');
            return;
        }
        global.battleData.isdrive = 0;
        getBattleInfo(myGlobalData.battleMapId,'occupy');
/*        ijHouse.getChildByName('occupy').visible = true;
        ijHouse.getChildByName('protect').visible = true;
        ijHouse.getChildByName('time_text').setText('10:00:00');*/
    }

    function _garrison(){
        //调用驻防的接口
        getBattleInfo(myGlobalData.battleMapId,'garrison');
        global.mineBattle.refreshMinePanel(global.battleData.data);
    }

    function _retreat(ijHouse,index){
        //调用撤军的接口
        var troops = global.dataCenter.data.troops;
        var troopid = 0;
        if (troops) {
            for (var key in troops) {
                if(troops[key].ismine == 1){
                    troopid = key;
                }
            }
        }
        global.NetManager.call('Hero','retreat',{troopid:troopid,location:global.battleData.location,ismine:1},function(data){
            global.controller.playerStatusController.update( data.data.player );
            global.controller.dayMissionController.update( data.data.mission_day );
            global.controller.missionController.update( data.data.mission );
            global.controller.singleTroopController.update(data.data.troop);
            global.dataCenter.data.heros = data.data.heros;
            global.dataCenter.data.jail = data.data.jail;
        });
        ijHouse.getChildByName('occupy').visible = false;
        players[index].playerid = '';
        mineData.isOccupied == false;
        troops = null;
    }

    function _plunder(){
        //调用掠夺的接口
        if(mineData.isOccupied == true){
            global.dialog('请先撤军再占领金矿');
            return;
        }
        if(player.minefight == 0){
            global.dialog('今天抢矿的次数已用完');
            return;
        }
        if(player.minesec <= 0){
            global.dialog('今天占矿剩余时间为0');
            return;
        }
        global.battleData.isdrive = 1;
        getBattleInfo(myGlobalData.battleMapId,'plunder');
        if(global.battleData.isWin && global.battleData.isWin == 1){
            var garrisonGold = myGlobalData.totalGold*myGlobalData.mineRate/100;
            allGold.setText(garrisonGold);
        }else if(global.battleData.isWin == 2){
            var garrisonGold = mineData.failGold;
            var total = myGlobalData.totalGold + garrisonGold;
            allGold.setText(total);
            total = null;
        }
        garrisonGold = null;

    }

    function getBattleInfo(mapid,type){
        global.mineBattle.hide();
        var troopInfo = myGlobalData.troopInfo;
        var defaultLegion = global.ui.battleDialog._getLegion();
        var m_defence = {};
        global.battleReportReader = new global.BattleReportReader();
        global.battleData.isMine = 1;
        global.battleData.mapid = 1;
        global.battleData.ishelp = 0;
        troopInfo.isFog = true;
        var obj = {mode:global.MODE_MINECRAFT,enemyId:0};
        m_defence["legion"] = {};
        if(type == 'occupy'){
            m_defence["legion"] = global.curDefenceLegion;
            m_defence["lv"] = troopInfo.enemyLevel;
            m_defence["name"] = troopInfo.enemyName;
            m_defence["photo"] = troopInfo.enemyPhoto;
            m_defence["uid"] = troopInfo.enemyId;
            global.battleReportReader.setEnemyData(m_defence);
            troopInfo.isFog = false;
        }
        if (defaultLegion) {
            troopInfo.troopid = defaultLegion.troopid;
            var legionInfo = global.ui.battleDialog._getLegionInfoWithTroop(defaultLegion);
            global.battleReportReader.setLegionData(legionInfo);
        }
        var data = {bg:10,fog:troopInfo.isFog,legion:global.battleReportReader.getAttackLegionData(),enemy:global.battleReportReader.getDefenceLegionData()};
        var callBack = function(){
            global.battleWorld = new global.BattleWorld(data);
            global.ui.battleDialog._initBattlePreviewLayer(type,global.battleWorld,mapid,troopInfo.enemyId,troopInfo.hint,obj,troopInfo.troopid);
            global.stage.addChild(global.battleWorld.getDisplayObject());
        }
        global.BattleManager.loadAssets(callBack);
        troopInfo.defenceLegion = {};
        defaultLegion = null;
        m_defence = null;
        legionInfo = null;
    }

    global.mineBattle = new mineBattle();
})();