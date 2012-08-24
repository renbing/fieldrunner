/**
 * Created by Bingnan Gao.
 * User: Bingnan Gao
 * Date: 12-4-24
 * Time: 下午5:42
 *
 */
(function(){

    var missionListContainer;
    var missionArr = [];
    var newMissionArr = [];
    var fiveArr = [];
    var oneMc;
    var missionNum;
    var mission;
    var missionId;
    var missionIcon;
    var path;
    var missionInfo = {};
    var currentMissionInfo;
    var currentEvent;
    var allMission,newAllMission;
    var missionDialog;
    var rewardDialog;
    var upBtn;
    var downBtn;
    var preChildPath;
    var nextChildPath;
    var isFinished;
    var status;
    var taskPanel;
    var missionCache = [];
    var myOwnData;
    var proto = missionList.prototype;

    function missionList(){

    }

    proto.init = function(mid) {
        this.updateMission(mid);
    };

    proto._initML = function(mid){
        newMissionArr.length = 0;
        missionArr.length = 0;
        missionCache.length = 0;
        var stage = global.stage;
        var gameUiLayer = stage.getChildByName('gameUiLayer');
        if(!missionListContainer){
            missionListContainer = new MovieClip('missionListContainer');
            //global.stage.getChildByName('playerStatusContainer').addChild(missionListContainer);
        }
        missionListContainer.visible = true;
        allMission = global.dataCenter.data.mission;
        if(!taskPanel){
            taskPanel = textureLoader.createMovieClip('window_task', 'taskBtnPanel');
        }
        taskPanel.y = global.GAME_HEIGHT/7;
        upBtn = taskPanel.getChildByName('up');
        downBtn = taskPanel.getChildByName('down');
        missionListContainer.addChild(taskPanel);
        missionListContainer.setIsSwallowTouch(true);
        var count = 0;
        var length = 0;
        for(var key in allMission){
            for(var i=0,len=mission.length;i<len;i++){
                if(allMission[key].mid == mission[i]['@attributes'].id){
                    missionCache.push(mission[i]);
                    //if(mid == 0){
                        missionArr.push(allMission[key]);
                    //}
                }
            }
        }
        if(missionArr.length >= 5){
            length = missionArr.length;
        }else{
            length = 5;
        }
        for(var j=0; j<length; j++){
            count++;
            if(missionArr[j]){
                missionId = missionArr[j].mid;
                currentMissionInfo = getInfoById(missionId);
                missionIcon = currentMissionInfo.icon;
                path = 'resources/icon/task/' + missionIcon;
            }else{
                path = '';
            }
            if(missionArr[j]){
                if(gameUiLayer && gameUiLayer.getChildByName('missionListContainer')){
                    var task = gameUiLayer.getChildByName('missionListContainer').getChildByName('taskBtnPanel')
                    var down = task.getChildByName('down');
                    var up = task.getChildByName('up');
                }else{
                    var down = downBtn;
                    var up = upBtn;
                }
                if(down.visible == false && mid == missionArr[j+1]){
                    count = 1;
                    fiveArr = [];
                }else if(missionArr.length - j >= 5 && mid == missionArr[j].mid){
                    count = 1;
                    fiveArr = [];
                }
/*                else if(!(mid in missionCache) && upBtn.visible == true && down.visible == false){

                }*/
/*                if(mid == missionArr[j].mid){
                    count = 1;
                    fiveArr = [];
                }*/
            }
            if(count <= 5){
                //fiveArr.push(missionArr[j]);
                if(missionArr[j]){
                    fiveArr[count-1] = missionArr[j];
                    oneMc = taskPanel.getChildByName('photo_1'.replace(/1/,count));
                    oneMc.setImage(path);
                    //bindEventToBtn(count,fiveArr[count - 1].status);
                    bindEventToBtn(count);
                    oneMc.getChildByName('Finish_task_arrow_icon').visible = false;
                    oneMc.getChildByName('New_task_arrow').visible = false;
                    if(missionArr[j].isfinished == 1){
                        oneMc.getChildByName('Finish_task_arrow_icon').visible = true;
                    }
                    if(fiveArr[i - 1] && fiveArr[i - 1].signal == "new"){
                        oneMc.getChildByName('New_task_arrow').visible = true;
                        oneMc.getChildByName('Finish_task_arrow_icon').visible = false;
                    }
                }else{
                    oneMc = taskPanel.getChildByName('photo_1'.replace(/1/,count));
                    oneMc.setImage(path);
                    oneMc.getChildByName('Finish_task_arrow_icon').visible = false;
                    oneMc.getChildByName('New_task_arrow').visible = false;
                }
            }
        }

        if(missionArr.length < 5){
            for(var k=missionArr.length;k<5;k++){
                oneMc = taskPanel.getChildByName('photo_1'.replace(/1/,k+1));
                oneMc.getChildByName('Finish_task_arrow_icon').visible = false;
                oneMc.getChildByName('New_task_arrow').visible = false;
            }
        }
        upBtn.setButton(true,function(){
            //var finishTips = textureLoader.createMovieClip('window_task', 'finish_task_arrow_icon');
            //mc向下串一个
            if(missionArr.length > 5){
                upBtn.visible = true;
            }
            for(var i=missionArr.length-1; i>=0; i--){
                if(missionArr[i].mid == fiveArr[0].mid && missionArr[i-1]){
                    preChildPath = 'resources/icon/task/' + getInfoById(missionArr[i-1].mid).icon;
                    missionListContainer.preId = i - 1;
                }
            }
            downBtn.visible = true;
            fiveArr.unshift(missionArr[missionListContainer.preId]);
            fiveArr.pop();
            if(fiveArr[0].mid == missionArr[0].mid){
                upBtn.visible = false;
            }
            //taskPanel.removeChild(taskPanel.frames[1][5]);
            var tempMc;
            for(var i=1; i<=5; i++){
                tempMc = taskPanel.getChildByName('photo_1'.replace(/1/,i));
                tempMc.setImage(null);
                tempMc.setImage('resources/icon/task/' + getInfoById(fiveArr[i-1].mid).icon);
                tempMc.getChildByName('Finish_task_arrow_icon').visible = false;
                tempMc.getChildByName('New_task_arrow').visible = false;
                if(fiveArr[i - 1] && fiveArr[i - 1].isfinished == 1){
                    tempMc.getChildByName('New_task_arrow').visible = false;
                     tempMc.getChildByName('Finish_task_arrow_icon').visible = true;
                }
                if(fiveArr[i - 1] && fiveArr[i - 1].signal == "new"){
                    tempMc.getChildByName('New_task_arrow').visible = true;
                    tempMc.getChildByName('Finish_task_arrow_icon').visible = false;
                }
            }
        });

        downBtn.setButton(true,function(){
            //mc向上串一个
            if(missionArr.length > 5){
                upBtn.visible = true;
            }
            for(var i=0,len=missionArr.length; i<len; i++){
                if(missionArr[i].mid == fiveArr[4].mid && missionArr[i+1]){
                    nextChildPath = 'resources/icon/task/' + getInfoById(missionArr[i+1].mid).icon;
                    missionListContainer.nextId = i + 1;
                }
            }
            fiveArr.shift();
            fiveArr.push(missionArr[missionListContainer.nextId]);
            if(fiveArr[4] && fiveArr[4].mid == missionArr[missionArr.length-1].mid){
                downBtn.visible = false;
            }
            var tempMc;
            for(var i=1; i<=5; i++){
                //debugger;
                tempMc = taskPanel.getChildByName('photo_1'.replace(/1/,i));
                tempMc.setImage(null);
                if(fiveArr[i - 1]){
                    tempMc.setImage('resources/icon/task/' + getInfoById(fiveArr[i - 1].mid).icon);
                }
                tempMc.getChildByName('Finish_task_arrow_icon').visible = false;
                tempMc.getChildByName('New_task_arrow').visible = false;
                if(fiveArr[i - 1] && fiveArr[i - 1].isfinished == 1){
                    tempMc.getChildByName('Finish_task_arrow_icon').visible = true;
                    tempMc.getChildByName('New_task_arrow').visible = false;
                }
                if(fiveArr[i - 1] && fiveArr[i - 1].signal == "new"){
                    tempMc.getChildByName('New_task_arrow').visible = true;
                    tempMc.getChildByName('Finish_task_arrow_icon').visible = false;
                }
            }
        });

        if(!missionArr.length){
            missionListContainer.removeChild(taskPanel);
        }else if(missionArr.length <= 5){
            upBtn.visible = false;
            downBtn.visible = false;
        }else if(fiveArr[0] && fiveArr[0].mid == missionArr[0].mid){
            upBtn.visible = false;
        }
        if(fiveArr[4] && missionArr.length && fiveArr[4].mid == missionArr[missionArr.length-1].mid){
            downBtn.visible = false;
        }else if(fiveArr[4] && missionArr.length && fiveArr[4].mid != missionArr[missionArr.length-1].mid){
            downBtn.visible = true;
        }
        if(gameUiLayer && !gameUiLayer.getChildByName('missionListContainer') && global.isMyHome){
            gameUiLayer.addChild(missionListContainer);
        }else if(!global.isMyHome){
            missionListContainer.visible = false;
        }
        mission = null;
    };

    proto.updateMission = function(mid){
        global.configManager.load("config/mission/mission",function(){
            newMissionArr.length = 0;
            missionCache.length = 0;
            newAllMission = global.dataCenter.data.mission;
            mission = global.configManager.get("config/mission/mission").missions.mission;
            if(mid == 0){
                this._initML(0);
                return;
            }
            for(var key in newAllMission){
                newMissionArr.push(newAllMission[key]);
                for(var i=0,len=mission.length;i<len;i++){
                    if(newAllMission[key].mid == mission[i]['@attributes'].id){
                        missionCache.push(mission[i]);
                        //newMissionArr.push(newAllMission[key]);
                    }
                }
            }
            for(var i=0,len=newMissionArr.length; i<len; i++){
                if(newMissionArr[i] && missionArr[i] &&
                         newMissionArr[i].mid == missionArr[i].mid){
                    if(newMissionArr[i].status[0] != missionArr[i].status[0]){
                        missionArr[i].signal = "new";
                    }
                    missionArr[i] = newMissionArr[i];
                }else if(newMissionArr[i] && missionArr[i] &&
                         newMissionArr[i].mid != missionArr[i].mid){
                    //不同的任务，是新任务，添加图标，添加到missionArr数组，更新fiveArr数组
                    if(newMissionArr[i].mid < missionArr[i].mid){
                        missionArr.splice(i,0,newMissionArr[i]);
                        missionArr[i].signal = "new";
                    }
                }else if(!missionArr[i]){
                    missionArr.push(newMissionArr[i]);
                    missionArr[i].signal = "new";
                }
            }
            if(taskPanel){
                missionListContainer.removeChild(taskPanel);
            }
            if(fiveArr[0]){
                this._initML(fiveArr[0].mid);
            }
        }.bind(global.uiMissionList));
        mission = null;
        global.configManager.unload("config/mission/mission");
    };

    function bindEventToBtn(index) {
        taskPanel.getChildByName('photo_1'.replace(/1/,index)).setOnClick((function (index) {
            return function () {
                if(fiveArr[index - 1].isfinished == (null || 0)){
                    isFinished = 0;
                }else{
                    isFinished = fiveArr[index - 1].isfinished;
                }
                missionNum = fiveArr[index - 1].mid;
                var status = fiveArr[index - 1].status;
                currentEvent = getInfoById(fiveArr[index - 1].mid);
                _missionDialog(currentEvent, isFinished, status, missionNum,index);
            }
        })(index));
    }

    function _missionDialog(info,num,status,mid,index){
        var title = info.text;
        var desc = info.desc;
        var clewtext = info.clewtext;
        var npcNum = info.npcPhoto;
        var taskInfo,taskInfo1,taskInfo2,taskInfo3;
        var item1,item2,item3;
        var taskIcon,taskText,taskTotal,taskSticky,taskValue,taskUnlock;
        var taskIcon1,taskText1,taskTotal1,taskSticky1;
        var taskIcon2,taskText2,taskTotal2,taskSticky2;
        var taskIcon3,taskText3,taskTotal3,taskSticky3;
        var rewardsItemType,rewardsItemId,rewardsItemCount,rewardsItemName;
        var rewardsXp,rewardsGold;
        var missionRewards,missionItemRewards;
        var rwrd1,rwrd2,rwrd3,rwrd4;
        missionListContainer.index = index;
        if(info.guide){
            var guide = info.guide;
        }
        missionListContainer.mid = mid;
        global.windowManager.removeChild(missionDialog);
        /*任务显示的相关信息*/
        if(info.taskInfo.length){
            //一个以上任务
            missionListContainer.taskNum = info.taskInfo.length;
            taskInfo1 = info.taskInfo[0]["@attributes"];
            taskInfo2 = info.taskInfo[1]["@attributes"];
            taskIcon1 = taskInfo1.icon;
            taskText1 = taskInfo1.text;
            taskTotal1 = taskInfo1.total;
            taskIcon2 = taskInfo2.icon;
            taskText2 = taskInfo2.text;
            taskTotal2 = taskInfo2.total;
            if(info.taskInfo[2]) {
                taskInfo3 = info.taskInfo[2]["@attributes"];
                taskIcon3 = taskInfo3.icon;
                taskText3 = taskInfo3.text;
                taskTotal3 = taskInfo3.total;
            }
        }else{
            //只有一个任务
            missionListContainer.taskNum = 1;
            taskInfo = info.taskInfo["@attributes"];
            taskIcon = taskInfo.icon;
            taskText = taskInfo.text;
            taskTotal = taskInfo.total;
        }
        missionRewards = info.rewards.missionRewards["@attributes"];
        rewardsXp = missionRewards.xp;
        rewardsGold = missionRewards.gold;
        if(info.rewards.missionItemRewards){
            missionItemRewards = info.rewards.missionItemRewards.item["@attributes"];
            rewardsItemType = missionItemRewards.type;
            rewardsItemId = missionItemRewards.id;
            rewardsItemCount = missionItemRewards.count;
            rewardsItemName = global.ItemFunction.findItemByTypeId(rewardsItemType, rewardsItemId)['@attributes'].name;
        }
        if(missionListContainer.taskNum == 1){
            missionDialog = textureLoader.createMovieClip('window_task', 'taskPanel_1');
            global.windowManager.addChild(missionDialog);
            item1 = missionDialog.getChildByName('item1');
            if(num == 1){
                item1.getChildByName('taskAimText').setText(taskTotal+'/'+taskTotal);//任务总数
                item1.getChildByName('dissatisfy_icon').visible = false;
                item1.getChildByName('achieve_icon').visible = true;
            }else{
                item1.getChildByName('taskAimText').setText(status[0]+'/'+taskTotal);
                item1.getChildByName('dissatisfy_icon').visible = true;
                item1.getChildByName('achieve_icon').visible = false;
            }
            /*missionDialog.getChildByName('item2').getChildByName('dissatisfy_icon').visible = false;
            missionDialog.getChildByName('item2').getChildByName('achieve_icon').visible = false;*/
            item1.getChildByName('taskAimNumText').text = taskText;
            item1.getChildByName('photo').setImage('resources/icon/task/'+taskIcon);
        }else{
            missionDialog = textureLoader.createMovieClip('window_task', 'taskPanel_1'.replace(/1/,missionListContainer.taskNum));
            item1 = missionDialog.getChildByName('item1');
            item2 = missionDialog.getChildByName('item2');
            global.windowManager.addChild(missionDialog);
            item1.getChildByName('taskAimText').setText(status[0]+'/'+taskTotal1);
            item1.getChildByName('taskAimNumText').setText(taskText1);
            item1.getChildByName('photo').setImage('resources/icon/task/'+taskIcon1);
            item2.getChildByName('taskAimText').setText(status[1]+'/'+taskTotal2);
            item2.getChildByName('taskAimNumText').setText(taskText2);
            item2.getChildByName('photo').setImage('resources/icon/task/'+taskIcon2);
            var no1 = item1.getChildByName('dissatisfy_icon');
            var yes1 = item1.getChildByName('achieve_icon');
            var no2 = item2.getChildByName('dissatisfy_icon');
            var yes2 = item2.getChildByName('achieve_icon');
            if(status[0] < taskTotal1){
                no1.visible = true;
                yes1.visible = false;
            }else{
                no1.visible = false;
                yes1.visible = true;
            }
            if(status[1] < taskTotal2){
                no2.visible = true;
                yes2.visible = false;
            }else{
                no2.visible = false;
                yes2.visible = true;
            }
            if(missionDialog.getChildByName('item3')){
                item3 = missionDialog.getChildByName('item3');
                item3.getChildByName('taskAimText').setText(status[2]+'/'+taskTotal3);
                item3.getChildByName('taskAimNumText').setText(taskText3);
                item3.getChildByName('photo').setImage('resources/icon/task/'+taskIcon3);
                if(status[2] < taskTotal3){
                    item3.getChildByName('dissatisfy_icon').visible = true;
                    item3.getChildByName('achieve_icon').visible = false;
                }else{
                    item3.getChildByName('dissatisfy_icon').visible = true;
                    item3.getChildByName('achieve_icon').visible = false;
                }
            }

        }
        missionDialog.x = (global.GAME_HEIGHT - 458) / 2;
        missionDialog.y = (global.GAME_HEIGHT - 421) / 2;
        missionDialog.getChildByName('taskNameText').setText(title);
        missionDialog.getChildByName('taskSynopsisText').setText(desc);
        missionDialog.getChildByName('aimClewText').setText(clewtext);
        for(var i=1; i<=8; i++){
            if(npcNum == i){
                missionDialog.getChildByName('task_npc_5'.replace(/5/,npcNum)).visible = true;
            }else{
                missionDialog.getChildByName('task_npc_5'.replace(/5/,i)).visible = false;
            }
        }
        rewardDialog = textureLoader.createMovieClip('window', 'reward_panel');
        rwrd1 = rewardDialog.getChildByName('item1');
        rwrd2 = rewardDialog.getChildByName('item2');
        rwrd3 = rewardDialog.getChildByName('item3');
        rwrd4 = rewardDialog.getChildByName('item4');

        missionDialog.getChildByName('closeIcon').setIsEnabled(false);
        missionDialog.getChildByName('closeIcon').setButton(true,function(){
            global.windowManager.removeChild(missionDialog);
            taskPanel.getChildByName('photo_1'.replace(/1/,index)).getChildByName('New_task_arrow').visible = false;
        });
        if(num == 1){
            missionDialog.getChildByName('Qbfinished').visible = false;
            missionDialog.getChildByName('help_icon').visible = false;
            missionDialog.getChildByName('acceptBtn').visible = false;
            missionDialog.getChildByName('finish_Btn').visible = true;
            missionDialog.getChildByName('finish_Btn').setButton(true,function(){
                global.NetManager.call('Mission', 'accomplish', {"mid":mid}, updateStatus);
                global.windowManager.removeChild(missionDialog);
                global.windowManager.addChild(rewardDialog);
                rewardDialog.x = (global.GAME_WIDTH - 458) / 2;
                rewardDialog.y = (global.GAME_HEIGHT - 421) / 2;
                //rewardDialog.getChildByName('taskDoneBg').gotoAndStop(1);
                //rewardDialog.getChildByName('acceptBtn').visible = false;
                //rewardDialog.getChildByName('taskNameText').setText(title);
                rwrd1.getChildByName('icon').frames[1][0].frames[1][0]='';
                rwrd1.getChildByName('icon').setImage('resources/icon/task/task_xp.png');
                rwrd1.getChildByName('nameText').setText('经验');
                rwrd1.getChildByName('numText').setText(rewardsXp);
                rwrd2.getChildByName('icon').frames[1][0].frames[1][0]='';
                rwrd2.getChildByName('icon').setImage('resources/icon/task/task_gold.png');
                rwrd2.getChildByName('nameText').setText('金币');
                rwrd2.getChildByName('numText').setText(rewardsGold);
                if(rewardsItemName){
                    rwrd3.getChildByName('icon').frames[1][0].frames[1][0]='';
                    rwrd3.getChildByName('nameText').setText(rewardsItemName);
                    rwrd3.getChildByName('numText').setText(rewardsItemCount);
                }else{
                    rwrd3.visible = false;
                }
                rwrd4.visible = false;
                rewardDialog.getChildByName('closeIcon').setButton(true,function(){
                    global.windowManager.removeChild(rewardDialog);
                });
                missionListContainer.missionArr = missionArr;
                rewardDialog.getChildByName('acceptBtn').setButton(true,function(){
                    //更新用户数据
                    global.windowManager.removeChild(rewardDialog);
                });
            });
        }else{
            missionDialog.getChildByName('Qbfinished').visible = true;
            if(guide && guide == "404"){
                missionDialog.getChildByName('help_icon').visible = true;
            }else{
                missionDialog.getChildByName('help_icon').visible = false;
            }
            missionDialog.getChildByName('acceptBtn').visible = true;
            missionDialog.getChildByName('finish_Btn').visible = false;
            missionDialog.getChildByName('Qbfinished').setButton(true,function(){
                global.windowManager.removeChild(missionDialog);
                global.dialog("暂未开放");
            });
            missionDialog.getChildByName('acceptBtn').setButton(true,function(){
                global.windowManager.removeChild(missionDialog);
                taskPanel.getChildByName('photo_1'.replace(/1/,index)).getChildByName('New_task_arrow').visible = false;
            });
            missionDialog.getChildByName('help_icon').setButton(true,function(){
                global.windowManager.removeChild(missionDialog);
                global.dialog("暂未开放");
            });
        }

    }

    function updateStatus(data){
        if(data.data.mission){
            //global.dataCenter.data.mission = mission;
            global.controller.missionController.update(data.data.mission);
        }
        if(data.data.player){
            global.controller.playerStatusController.update(data.data.player);
        }
        if(data.data.mission_day){
            global.controller.dayMissionController.update(data.data.mission_day);
        }
        /*删除完成任务的任务图标，并调整其他图标的顺序*/
        var ll = missionArr.length;
/*        for(var m=0; m<ll; m++){
            if(missionArr[m] && missionArr[m].mid == missionListContainer.mid){
                if(missionArr[m].mid == fiveArr[fiveArr.length-1].mid && missionArr[m+1]){
                    nextChildPath = 'resources/icon/task/' + getInfoById(missionArr[m+1].mid).icon;
                    missionListContainer.nId = m + 1;
                }else if(missionArr[m].mid == fiveArr[fiveArr.length-1].mid && !missionArr[m+1]){
                    missionListContainer.nId = m + 1;
                }
                if(missionArr[m].mid == fiveArr[0].mid && missionArr[m-1]){
                    nextChildPath = 'resources/icon/task/' + getInfoById(missionArr[m-1].mid).icon;
                    missionListContainer.pId = m - 1;
                }
                missionArr.splice(m,1);
            }
*//*            if(missionArr[m] && missionArr[m].mid == fiveArr[fiveArr.length-1].mid && missionArr[m+1]){
                nextChildPath = 'resources/icon/task/' + getInfoById(missionArr[m+1].mid).icon;
                missionListContainer.nId = m + 1;
                break;
            }else{
                missionListContainer.nId = missionArr.length-1;
            }*//*
        }*/
/*        var tempMc;
        for(var i=1; i<=5; i++){
            if(fiveArr[i-1] && fiveArr[i-1].mid == missionArr[missionArr.length-1].mid){
                downBtn.visible = false;
            }
            tempMc = taskPanel.getChildByName('photo_1'.replace(/1/,i));
            tempMc.setImage(null);
            if(fiveArr[i-1] && fiveArr[i-1].mid == missionListContainer.mid && missionArr[missionListContainer.nId]){
                fiveArr.splice(i-1,1);
                fiveArr.push(missionArr[missionListContainer.nId]);
            }else{
                fiveArr.splice(i-1,1);
                if(missionArr[missionListContainer.pId]){
                    fiveArr.unshift(missionArr[missionListContainer.pId])
                    missionListContainer.pId--;
                }
            }
            if(fiveArr[i-1]){
                tempMc.setImage('resources/icon/task/' + getInfoById(fiveArr[i-1].mid).icon);
            }
        }*/
        taskPanel.getChildByName('photo_1'.replace(/1/,missionListContainer.index)).getChildByName('Finish_task_arrow_icon').visible = false;
    }

    function getInfoById(id){
        for(var i=0,len=missionCache.length; i<len; i++){
            if(missionCache[i]['@attributes'].id == id){
                missionInfo.icon = missionCache[i]['@attributes'].icon;
                missionInfo.text = missionCache[i]['@attributes'].text;
                missionInfo.desc = missionCache[i]['@attributes'].desc;
                missionInfo.clewtext = missionCache[i]['@attributes'].clewtext;
                missionInfo.npcPhoto = missionCache[i]['@attributes'].npcPhoto;
                if(missionCache[i]['@attributes'].guide){
                    missionInfo.guide = missionCache[i]['@attributes'].guide;
                }
                missionInfo.taskInfo = missionCache[i].tasks.task;
                missionInfo.rewards = missionCache[i].resourceModifiers;
            }
        }
        return missionInfo;
    }

    global.uiMissionList = new missionList();
    global.controller.missionController = {update:function(mission){
        if( !mission ) {
            return;
        }
        global.dataCenter.data.mission = mission;
        global.uiMissionList.updateMission();
        //global.uiMissionList.init();
    }};
})();
