/**
 * Created by Bingnan Gao.
 * User: Bingnan Gao
 * Date: 12-4-10
 * Time: 下午1:58
 *
 */

/**
 * 建造菜单弹窗
 *
 * 单例
 *
 */
(function () {

    var mcBuildingPanel, mcContainer, mcBuilding,
        isLock, isShow,
        width, height,
        myGlobalData = {},
        animationDuration,
        arrBuildingMcs,
        arrBuildingNames, arrSmallBuildingNames,
        positionIndex = 0,
        positionArr,
        closeBtn,
        taxPanel, bcaPanel,zeroPanel,
        textFd,
        allLevelConfigs, allBuilding,taxUpTo,
        proto = BuildDialog.prototype,
        userLevel,currentGold,currentExp,harryCounter,
        inited = false;

    function BuildDialog() {
        isLock = false;
        isShow = false;
        arrBuildingNames = [
            'castleIcon', 'houseIcon', 'barrackIcon', 'tavernIcon',
            'churchIcon', 'storeIcon', 'trainingfieldIcon', 'weaponshopIcon',
            'armorshopIcon', 'fieldIcon', 'prisonIcon'
        ];
        arrSmallBuildingNames = [
            'castleIcon_tiny', 'houseIcon_tiny', 'barrackIcon_tiny', 'tavernIcon_tiny',
            'churchIcon_tiny', 'storeIcon_tiny', 'trainingfieldIcon_tiny', 'weaponshopIcon_tiny',
            'armorshopIcon_tiny', 'fieldIcon_tiny', 'prisonIcon_tiny'
        ];

        arrBuildingMcs = [];
/*        positionArr = [
            [202, 20],
            [362, 24],
            [445, 108],
            [449, 206],
            [418, 300],
            [300, 325],
            [149, 329],
            [35, 295],
            [11, 190],
            [18, 90],
            [87, 26]
        ];*/
        positionArr = [
            [202, 20],
            [403, 91],
            [488,176],
            [497,273],
            [466, 393],
            [340, 405],
            [180, 407],
            [62, 373],
            [37, 253],
            [43, 147],
            [127, 81]
        ];
    }


    proto.init = function (index) {
        if (inited) return;
        var instance = this;
        var buildLevel;//建筑的等级
        userLevel = global.dataCenter.getLevel();
        currentGold = global.dataCenter.getPlayerGold();
        currentExp = global.dataCenter.getPlayerExp();
        harryCounter = global.dataCenter.getHarryUpCounter();
        //取配置文件中的数组
        allLevelConfigs = global.configs["config/city/building"].main.upgrade;
        allBuilding = global.configs["config/city/building"].main.build;
        taxUpTo = global.configs["config/city/castle_config"].data.castle;
        //建筑列表容器
        mcContainer = new MovieClip('buildDialogContainer');
        myGlobalData.currentGold = currentGold;
        myGlobalData.currentExp = currentExp;
        //建筑列表icon
        mcBuildingPanel = textureLoader.createMovieClip('window_building', 'buildingPanel');
        mcContainer.addChild(mcBuildingPanel);
        width = mcBuildingPanel.getWidth();
        height = mcBuildingPanel.getHeight();
        animationDuration = 300;
        myGlobalData.colorType = [];
        //加载建筑转轴
        for (var n = 0, m = arrSmallBuildingNames.length; n < m; n++) {
            if(n == 7 || n == 8){//武器和防具的等级固定为1级
                //这里需要判断user几级可以有武器和防具店
                if(userLevel < 6){
                    buildLevel = 0;
                }
            }else if((n == 10 && userLevel < 10) || ((n == 1||n == 5||n == 9) && userLevel < 1) || (n == 2 && userLevel < 2)
                || ((n == 3|| n == 4) && userLevel < 3) || (n == 6 && userLevel < 4) || ((n == 7||n == 8) && userLevel < 6)){
                buildLevel = 0;
            }else{
                if(global.dataCenter.data.builds[n]){
                    buildLevel = global.dataCenter.getBuildLevel(n);
                }else{
                    buildLevel = 0;
                }
            }

            var arra = getArrayByBuildType(n);
            var needGold = getByLevel(arra, buildLevel, "gold");
            var cdtime = getByLevel(arra, buildLevel, "cdtime");
            var expe = getByLevel(arra, buildLevel, "exp");
            var background = getByLevel(arra, buildLevel, "background");
            var castleLevel = getByLevel(arra, buildLevel, "castlelevel");
            mcBuilding = textureLoader.createMovieClip('window_building', arrSmallBuildingNames[n]);
            if(currentGold < needGold || userLevel < castleLevel || currentExp < expe){
                mcBuilding.gotoAndStop(2);
                myGlobalData.colorType.push('2');
            }else{
                mcBuilding.gotoAndStop(1);
                myGlobalData.colorType.push('1');
            }
            if(n == index){
                myGlobalData.indexColorType = myGlobalData.colorType[n];
            }
            mcBuilding.index = n;
            mcBuilding.lvuphint = allBuilding[n]['@attributes']['lvuphint'];
            mcBuilding.getChildByName("levelText").setText(buildLevel);
            //建筑转盘
            arrBuildingMcs.push(mcBuilding);
            mcBuilding.x = positionArr[n][0];
            mcBuilding.y = positionArr[n][1];
            if(mcBuilding.x == 202 && mcBuilding.y == 20){
                myGlobalData.smallBuilding = mcBuilding;
            }
            mcBuilding.scaleX = 1;
            mcBuilding.scaleY = 1;
            mcContainer.addChild(mcBuilding);
            mcContainer.addChild(textFd);
            mcBuilding.buildingLevel = buildLevel;
            mcBuilding.addEventListener(Event.MOUSE_CLICK, function(){
                instance.setIndex(this.index,1);
                //设置每个建筑的所需金币和城堡等级和税收上升值
                setBuildInfo(this.index,this.lvuphint,this.buildingLevel,myGlobalData.colorType[this.index]);
            });
        }
         //生成中间的信息面板,先加载民房数据
        var lt = allBuilding[index]['@attributes']['lvuphint'];
        if(userLevel < 1){
            buildLevel = 0;
        }else{
            buildLevel = global.dataCenter.getBuildLevel(index);
        }
        myGlobalData.smallBuilding = arrBuildingMcs[index];
        mcContainer.addChild(bcaPanel);
        setBuildInfo(index,lt,buildLevel,myGlobalData.indexColorType);
        //加载closeIcon
        closeBtn = mcBuildingPanel.getChildByName("closeIcon");
        closeBtn.gotoAndStop(1);
        mcBuilding.scaleX = 1;
        mcBuilding.scaleY = 1;
        mcContainer.addChild(closeBtn);
        mcBuildingPanel.setIsSwallowTouch(true);
        inited = true;
        //列表拖拽及关闭按钮事件
        mcBuildingPanel.closeBtn = closeBtn;
        mcBuildingPanel.closeBtn.setButton(true, _handleCloseBtnClick);

    };

    proto.show = function (index) {
        inited || this.init(index);
        if (isLock) return;
        isLock = true;

        mcContainer.x = global.GAME_WIDTH / 2 - width / 2;
        mcContainer.y = -height;

        global.ActSeq(new Tween({
            duration:animationDuration,
            trans:Tween.REGULAR_EASE_OUT,
            from:mcContainer.y,
            to:global.GAME_HEIGHT / 5 * 2 - height / 2,
            func:function () {
                mcContainer.y = this.tween;
            }
        }), global.ActFunc(function () {
            isLock = false;
            isShow = true;
        })).start();
        global.windowManager.addChild(mcContainer);

        this.setIndex(index,0);
        Event.enableDrag = false;
    };

    proto.hide = function () {
        inited || this.init();
        if (isLock) return;
        isLock = true;

        mcContainer.x = global.GAME_WIDTH / 2 - width / 2;
        mcContainer.y = global.GAME_HEIGHT / 5 * 2 - height / 2;

        global.ActSeq(new Tween({
            duration:animationDuration,
            trans:Tween.REGULAR_EASE_OUT,
            from:mcContainer.y,
            to:-height,
            func:function () {
                mcContainer.y = this.tween;
            }
        }), global.ActFunc(function () {
            isLock = false;
            isShow = false;
            global.windowManager.removeChild(mcContainer);
        })).start();
        inited = false;
        Event.enableDrag = true;
    };

    proto.close = function(){
        global.windowManager.removeChild(mcContainer);
        inited = false;
        Event.enableDrag = true;
    };

    proto.toggle = function (index) {
        if (isShow) {
            this.hide();
        } else {
            this.show(index);
        }
    };

    function _handleCloseBtnClick(){
        var fun = new BuildDialog();
        fun.close();
    }

    /**
     * 设置建筑升级信息
     * @param param : 建筑的index
     * @param lvuphint : 建筑的描述
     * @param buildLevel : 建筑的等级
     */
    function setBuildInfo(param,lvuphint,buildLevel,colorType) {
        myGlobalData.buildingType = param;//建筑类型
        myGlobalData.buildingLevel = buildLevel;//建筑等级
        myGlobalData.name = allBuilding[param]['@attributes']['name'];//建筑名字
        myGlobalData.desc = allBuilding[param]['@attributes']['desc'];//零级时建筑描述
        myGlobalData.arr = getArrayByBuildType(param);//根据建筑类型取出的数组
        myGlobalData.needGold = getByLevel(myGlobalData.arr, buildLevel, "gold");
        myGlobalData.cdtime = getByLevel(myGlobalData.arr, buildLevel, "cdtime");
        myGlobalData.expe = getByLevel(myGlobalData.arr, buildLevel, "exp");
        myGlobalData.background = getByLevel(myGlobalData.arr, buildLevel, "background");
        myGlobalData.castleLevel = getByLevel(myGlobalData.arr, buildLevel, "castlelevel");
        myGlobalData.currentBuilding = mcBuilding;
        if(global.dataCenter.data.builds[myGlobalData.buildingType]){
            var codeTime = global.dataCenter.data.builds[myGlobalData.buildingType].finishtime- global.common.getServerTime();
        }
        //设置数值
        if(myGlobalData.buildingLevel == 0){
            if(bcaPanel){
                bcaPanel.visible = false;
            }
            if(taxPanel){
                taxPanel.visible = false;
            }
            if(!zeroPanel){
                zeroPanel = textureLoader.createMovieClip('window_building', 'building_build_common_panel');
            }
            zeroPanel.visible = true;
            zeroPanel.x = 148;
            zeroPanel.y = 168;
            zeroPanel.getChildByName("buildingText").setText(myGlobalData.desc);
            zeroPanel.getChildByName("goldText").setText(myGlobalData.needGold);
            zeroPanel.getChildByName("levelText").setText(myGlobalData.castleLevel);
            zeroPanel.getChildByName("build_building_btn").visible = true;
            mcContainer.addChild(zeroPanel);
            if(userLevel >= myGlobalData.castleLevel){
                zeroPanel.getChildByName("noRes2").visible = false;
            }else{
                zeroPanel.getChildByName("noRes2").visible = true;
                zeroPanel.getChildByName("build_building_btn").setIsEnabled(false);
            }
            if(currentGold >= myGlobalData.needGold){
                zeroPanel.getChildByName("noRes1").visible = false;
            }else{
                zeroPanel.getChildByName("noRes1").visible = true;
                zeroPanel.getChildByName("build_building_btn").setIsEnabled(false);
            }
            zeroPanel.getChildByName("build_building_btn").setButton(false, _isUpdate);
            zeroPanel.getChildByName("build_building_btn").setButton(true, _isUpdate);
            myGlobalData.currentPanel = zeroPanel;
        }else if (myGlobalData.name != '王城') {
            if(taxPanel){
                mcContainer.removeChild(taxPanel);
            }
            if(zeroPanel){
                mcContainer.removeChild(zeroPanel);
            }
            if (myGlobalData.name == '武器店' || myGlobalData.name == '防具店') {
                if(!bcaPanel){
                    bcaPanel = textureLoader.createMovieClip('window_building', 'building_common_attr_panel');
                    mcContainer.addChild(bcaPanel);
                }
                bcaPanel.visible = true;
                bcaPanel.getChildByName("title_text").setText(lvuphint);
                bcaPanel.getChildByName("goldText").setText("--");
                bcaPanel.getChildByName("levelText").setText("--");
                bcaPanel.getChildByName("up_building_btn").visible = false;
                bcaPanel.getChildByName("noRes1").visible = false;
                bcaPanel.getChildByName("noRes2").visible = false;
                bcaPanel.getChildByName("building_levelup_time_panel").visible = false;
            } else {
                if(!bcaPanel){
                    bcaPanel = textureLoader.createMovieClip('window_building', 'building_common_attr_panel');
                    mcContainer.addChild(bcaPanel);
                }
                bcaPanel.visible = true;
                bcaPanel.getChildByName("title_text").setText(lvuphint);
                bcaPanel.getChildByName("goldText").setText(myGlobalData.needGold);
                bcaPanel.getChildByName("levelText").setText(myGlobalData.castleLevel);
                bcaPanel.getChildByName("up_building_btn").setButton(false, _isUpdate);
                bcaPanel.getChildByName("up_building_btn").setButton(true, _isUpdate);
                if(codeTime > 0){
                    bcaPanel.getChildByName("building_levelup_time_panel").visible = true;
                    bcaPanel.getChildByName("building_levelup_time_panel").getChildByName("uptimeText").text = global.common.second2stand(codeTime);
                    bcaPanel.getChildByName("up_building_btn").visible = false;
                    global.gameSchedule.scheduleFunc(_updateTime, 1000);
                    bcaPanel.getChildByName("building_levelup_time_panel").getChildByName("building_levelup_speedup_btn").setButton(true,_speedUp);
                }else{
                    global.gameSchedule.unscheduleFunc(_updateTime);
                    bcaPanel.getChildByName("up_building_btn").visible = true;
                    bcaPanel.getChildByName("building_levelup_time_panel").visible = false;
                }
                if(userLevel >= myGlobalData.castleLevel){
                    bcaPanel.getChildByName("noRes2").visible = false;
                }else{
                    bcaPanel.getChildByName("noRes2").visible = true;
                    bcaPanel.getChildByName("up_building_btn").setIsEnabled(false);
                }
                if(currentGold >= myGlobalData.needGold){
                    bcaPanel.getChildByName("noRes1").visible = false;
                }else{
                    bcaPanel.getChildByName("noRes1").visible = true;
                    bcaPanel.getChildByName("up_building_btn").setIsEnabled(false);
                }
            }
            bcaPanel.x = 148;
            bcaPanel.y = 168;
            myGlobalData.currentPanel = bcaPanel;
        } else {
            if(bcaPanel){
                bcaPanel.visible = false;
            }
            if(zeroPanel){
                zeroPanel.visible = false;
            }
            if(!taxPanel){
                taxPanel = textureLoader.createMovieClip('window_building', 'castle_building_attr_panel');
                mcContainer.addChild(bcaPanel);
            }
            taxPanel.visible = true;
            taxPanel.x = 148;
            taxPanel.y = 168;
            var taxUp = taxUpTo[userLevel]["@attributes"]["goldincome"];
            taxPanel.getChildByName("title_text").setText(lvuphint);
            taxPanel.getChildByName("upRevenueText").setText(taxUp);
            taxPanel.getChildByName("goldText").setText(myGlobalData.needGold);
            taxPanel.getChildByName("needExperienceText").setText(myGlobalData.expe);
            mcContainer.addChild(taxPanel);
            myGlobalData.currentPanel = taxPanel;
            if(codeTime > 0){
                taxPanel.getChildByName("building_levelup_time_panel").visible = true;
                taxPanel.getChildByName("building_levelup_time_panel").getChildByName("uptimeText").text = global.common.second2stand(codeTime);
                taxPanel.getChildByName("up_building_btn").visible = false;
                global.gameSchedule.scheduleFunc(_updateTime, 1000);
                taxPanel.getChildByName("building_levelup_time_panel").getChildByName("building_levelup_speedup_btn").setButton(true,_speedUp);
            }else{
                global.gameSchedule.unscheduleFunc(_updateTime);
                taxPanel.getChildByName("up_building_btn").visible = true;
                taxPanel.getChildByName("building_levelup_time_panel").visible = false;
            }
            taxPanel.getChildByName("up_building_btn").setButton(false, _isUpdate);
            taxPanel.getChildByName("up_building_btn").setButton(true, _isUpdate);
            taxPanel.getChildByName("noRes1").visible = false;
            if(currentGold < myGlobalData.needGold){
                taxPanel.getChildByName("noRes2").visible = true;
                taxPanel.getChildByName("up_building_btn").setIsEnabled(false);
            }else{
                taxPanel.getChildByName("noRes2").visible = false;
            }
            if(currentExp < myGlobalData.expe){
                taxPanel.getChildByName("noRes3").visible = true;
                taxPanel.getChildByName("up_building_btn").setIsEnabled(false);
            }else{
                taxPanel.getChildByName("noRes3").visible = false;
            }
        }
        if(myGlobalData.smallBuilding){
            myGlobalData.smallBuilding.visible = false;
        }
        if(myGlobalData.bigBuilding){
            mcContainer.removeChild(myGlobalData.bigBuilding);
        }
        myGlobalData.bigBuilding = textureLoader.createMovieClip('window_building', arrBuildingNames[param]);
        myGlobalData.bigBuilding.gotoAndStop(colorType);
        myGlobalData.bigBuilding.x = 202;
        myGlobalData.bigBuilding.y = 45;
        myGlobalData.bigBuilding.getChildByName("levelText").setText(buildLevel);
        mcContainer.addChild(myGlobalData.bigBuilding);

        function _isUpdate(){
            if(userLevel < myGlobalData.castleLevel){
                global.dialog("城堡等级不足无法升级建筑");
            }else if(currentGold < myGlobalData.needGold){
                global.dialog("建造所需要" + myGlobalData.needGold + "金币不足");
            }else if(myGlobalData.currentPanel == taxPanel && currentExp < myGlobalData.expe){
                global.dialog("城堡所需的升级经验不足，无法升级。");
            }else{
                _upLevelBtnClick();
            }
        }
        function _speedUp(){
            //加速道具数量：harryCounter
            var minites = (codeTime / 60) | 0;
            var hour = (minites / 60) | 0;
            var toLevel = parseInt(myGlobalData.buildingLevel) + 1;
            if(minites > 0){
                hour = hour + 1;
            }
            if(hour < harryCounter){
                global.NetManager.call('City', 'build', {"level":toLevel,
                                                                 "buildtype":myGlobalData.buildingType,
                                                                 "hurryup":hour}, _updateBuilding);
                myGlobalData.currentPanel.getChildByName("up_building_btn").visible = true;
                global.gameSchedule.unscheduleFunc(_updateTime);
                myGlobalData.currentPanel.getChildByName("building_levelup_time_panel").visible = false;
            }else{
                global.dialog("加速道具不足");
            }
        }
    }

    //根据type值获取对应的数组
    function getArrayByBuildType(num){
        var len = allLevelConfigs.length;
        var arr = [];
        for(var i=0; i<len; i++){
            if(allLevelConfigs[i]['@attributes']['buildtype'] == num){
                arr.push(allLevelConfigs[i]);
            }
        }
        return arr;
    }

    function getByLevel(array,level,attrName){
        var len = array.length;
        var attrValue;
        for(var i=0; i<len; i++){
            if(array[i]['@attributes']['level'] == level){
                attrValue = array[i]['@attributes'][attrName];
            }
        }
        return attrValue;
    }

    //升级按钮事件
    function _upLevelBtnClick(){
        _requestUpdateBuilding();
        if(myGlobalData.currentPanel == zeroPanel){
            zeroPanel.getChildByName("build_building_btn").visible = false;
        }else{
            myGlobalData.currentPanel.getChildByName("up_building_btn").visible = false;
            global.gameSchedule.scheduleFunc(_updateTime, 1000);
        }
        var fun = new BuildDialog();
        fun.close();
    }


    function _requestUpdateBuilding(){
        var toLevel = parseInt(myGlobalData.buildingLevel) + 1;
        global.NetManager.call('City', 'build', {"level":toLevel,
                                                 "buildtype":myGlobalData.buildingType,
                                                 "hurryup":0}, _updateBuilding);
    }

    function _updateBuilding(data){
        //global.dataCenter.data.builds[mcContainer.buildingType] = data.data.build;
        global.controller.missionController.update(data.data.mission);
        global.controller.playerStatusController.update(data.data.player);
        global.controller.dayMissionController.update(data.data.mission_day);
        global.controller.buildingController.update(data.data.build);
    }

    function _updateTime(){
        if(myGlobalData.currentPanel != zeroPanel){
            var codeTime = myGlobalData.currentPanel.getChildByName("building_levelup_time_panel");
            if(myGlobalData.name == '武器店' || myGlobalData.name == '防具店'){
                codeTime.visible = false;
            }else{
                codeTime.visible = true;
                codeTime.getChildByName("uptimeText").setText(global.common.second2stand(_getLeftTicks()));
            }
        }
    }

    function _getLeftTicks(){
        var buildInfo = global.dataCenter.data.builds[myGlobalData.buildingType];
        if((buildInfo.finishtime - global.common.getServerTime()) < 0){
            global.gameSchedule.unscheduleFunc(_updateTime);
            myGlobalData.currentPanel.getChildByName("building_levelup_time_panel").visible = false;
            myGlobalData.currentPanel.getChildByName("up_building_btn").visible = true;
            return;
        }
        return buildInfo.finishtime - global.common.getServerTime();
    }

    proto.setIndex = function (value,type) {
        inited || this.init();
        positionIndex = value;
        var index;
        if(type == 1 && myGlobalData.smallBuilding){
            myGlobalData.smallBuilding.visible = true;
        }
        for (var n = 0, m = positionArr.length; n < m; n++) {
            index = n - positionIndex;
            if (index < 0){
                index += positionArr.length;
            }
            arrBuildingMcs[n].x = positionArr[index][0];
            arrBuildingMcs[n].y = positionArr[index][1];
            if(arrBuildingMcs[n].x == 202 && arrBuildingMcs[n].y == 20){
                myGlobalData.smallBuilding = arrBuildingMcs[n];
            }
        }
    };

    global.ui.uiBuildDialog = new BuildDialog();

})();