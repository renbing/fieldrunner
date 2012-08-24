/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-29
 * Time: 下午5:19
 *
 */

/**
 * 玩家状态UI
 *
 * 单例
 *
 */
(function () {


    var expProgressBarWidth;
    var goldProgressBarWidth;

    var EXP = 0;
    var GOLD = 1;
    var FOOD = 2;
    var POPULOUS = 3;
    var SOLDIER = 4;
    var WOUNDED = 5;
    var BATTLE_NUMBER = 6;

    var proto = PlayerStatus.prototype;

    function PlayerStatus(){
        this.isInited = false;
    }

    proto.init = function() {
        if(!this.isInited){
            this._initMc();
            this.isInited = true;
            global.controller.playerStatusController.update(global.dataCenter.data.player);
        }
    };

    proto._initMc = function() {
        var self = this;
        var stage = global.stage;
        var gameUiLayer = stage.getChildByName('gameUiLayer');
        this.playerStatusContainer = new MovieClip('playerStatusContainer');

        //经验值&等级
        var hud = textureLoader.createMovieClip('ui' ,'hud');
        this.playerStatusContainer.addChild(hud);

        this.expMc = hud.getChildByName('LevePanel');
        this.expText = this.expMc.getChildByName('levelText');
        this.levelText = this.expMc.getChildByName('levelInt');
        this.expProgressBar = this.expMc.getChildByName('energy_progress').getChildAt(0).getChildAt(0);
        expProgressBarWidth = this.expProgressBar.sw;

        //金币
        this.goldMc = hud.getChildByName('GoldPanel');
        this.goldText = this.goldMc.getChildByName('goldText');
        this.goldProgressBar = this.goldMc.getChildByName('gold_progress').getChildAt(0).getChildAt(0);
        goldProgressBarWidth = this.goldProgressBar.sw;

        //粮食
        this.foodMc = hud.getChildByName('FoodPanel');
        this.foodText = this.foodMc.getChildByName('foodText');

        //人口
        this.populousMc = hud.getChildByName('PopulousPanel');
        this.populousText = this.populousMc.getChildByName('populousText');

        //士兵&伤兵
        this.soldierMc = hud.getChildByName('SoldierPanel');
        this.playerStatusContainer.addChild(this.soldierMc);
        this.soldierText = this.soldierMc.getChildByName('soldierText');
        this.woundedText = this.soldierMc.getChildByName('bruiseText');

        //军令
        this.battleNumberMc = hud.getChildByName('EnergyPanel');
        this.battleNumberText = this.battleNumberMc.getChildByName('energyText');
        this.battleTimeText = this.battleNumberMc.getChildByName('time_text');
        this.battleTodayText = this.battleNumberMc.getChildByName('time_text_1');
        this.battleProgressBar = this.battleNumberMc.getChildByName('energy_progress').getChildAt(0).getChildAt(0);
        this.battleTimeBg = this.battleNumberMc.getChildByName('time_bg');
        this.battleTimeBg.visible = false;

        this.playerStatusContainer.x = (global.GAME_WIDTH - (this.battleNumberMc.x + this.battleNumberMc.getWidth() - this.expMc.x)) / 2;
        
        // 公告按钮
        this.annoucementBtn = hud.getChildByName('Announcement_btn');
        this.annoucementBtn.gotoAndStop(1);
        this.annoucementBtn.getChildByName('new_icon').visible = false;
        this.annoucementBtn.setButton(true, function(e) {
        });

        // 每日任务按钮
        this.todayTaskBtn = hud.getChildByName('Today_task_icon_2');
        this.todayTaskBtn.gotoAndStop(1);
        this.todayTaskBtn.getChildByName('new_icon').visible = false;

        this.todayTaskBtn.setButton(true, function(e) {
            self.todayTaskBtn.gotoAndStop(1);
            self.todayTaskBtn.getChildByName('new_icon').visible = false;
            global.dailyTaskPanel.show();
        });
        
        // 礼物按钮
        hud.getChildByName('Tx_present_icon').visible = false;
        gameUiLayer.addChild(this.playerStatusContainer);

        // 添加声音控制按钮
        var playerSetting = global.createMusicSettingCtr('ui');
        gameUiLayer.addChild(playerSetting.getDisplayObject());
    };

    proto._updateValue = function(type, value){
        if(!this.isInited) return;
        switch (type) {
            case EXP:
                this.expText.setText(+this.expText.text + value);
                break;
            case GOLD:
                this.goldText.setText(+this.goldText.text + value);
                break;
            case FOOD:
                this.foodText.setText(+this.foodText.text + value);
                break;
            case POPULOUS:
                this.populousText.setText(+this.populousText.text + value);
                break;
            case SOLDIER:
                this.soldierText.setText(+this.soldierText.text + value);
                break;
            case WOUNDED:
                this.woundedText.setText(+this.woundedText.text + value);
                break;
            case BATTLE_NUMBER:
                this.battleNumberText.setText(+this.battleNumberText.text + value);
                break;
        }
    };

    proto._setValue = function (type, value){
        if(!this.isInited) return;
        switch (type) {
            case EXP:
                this.expText.setText(value);
                break;
            case GOLD:
                this.goldText.setText(value);
                break;
            case FOOD:
                this.foodText.setText(value);
                break;
            case POPULOUS:
                this.populousText.setText(value);
                break;
            case SOLDIER:
                this.soldierText.setText(value);
                break;
            case WOUNDED:
                this.woundedText.setText(value);
                break;
            case BATTLE_NUMBER:
                this.battleNumberText.setText(value);
                break;
        }
    };

    proto.setLevel = function(level){
        if(!this.isInited) return;
        if(this.levelText){
            this.levelText.setText(level);
        }
    };

    proto.todayTaskFinished = function() {
        this.todayTaskBtn.gotoAndStop(1);
        this.todayTaskBtn.getChildByName('new_icon').visible = true;
    };

    global.controller.playerStatusController = global.controller.playerStatusController || {};

    global.controller.playerStatusController.update = function(playerState){
        if(!playerState) return;

        global.dataCenter.data.player = playerState;
        var uiStatus = global.uiPlayerStatus;
        if(playerState && uiStatus && uiStatus.isInited){

            var castleLevel = global.dataCenter.getLevel();
            trace(castleLevel);
            uiStatus.expText.setText(playerState.exp);
            uiStatus.levelText.setText( castleLevel );
            uiStatus.goldText.setText(playerState.gold);
            uiStatus.foodText.setText(playerState.food);
            uiStatus.populousText.setText(playerState.people);
            uiStatus.soldierText.setText(playerState.soldier);
            uiStatus.woundedText.setText(playerState.wounded);
            uiStatus.battleNumberText.setText(playerState.battlenumber);
            
            // 处理等级进度显示
            var castleUpgradeConfigs = global.sceneMyZone.buildingCastle.getUpgradeConfigs();

            var castleCanUpgrade = false;
            var castleExpPercent = 1;

            var nextCastleLevel = castleLevel + 1;
            if( nextCastleLevel in castleUpgradeConfigs ) {
                if( playerState.exp >= castleUpgradeConfigs[nextCastleLevel].exp ) {
                    castleCanUpgrade = true;
                    castleExpPercent = 1;
                } else {
                    var currentLevelExp = castleUpgradeConfigs[castleLevel].exp;
                    var nextLevelExp = castleUpgradeConfigs[nextCastleLevel].exp;
                    castleExpPercent = (playerState.exp - currentLevelExp) / (nextLevelExp - currentLevelExp);
                }
            }
            uiStatus.expMc.getChildByName('lvup_notice').visible = castleCanUpgrade;
            uiStatus.expProgressBar.sw = uiStatus.expProgressBar.dw = expProgressBarWidth * castleExpPercent;

            // 处理金币进度显示
            var banklevel = global.dataCenter.getBuildByType(global.BuildType.Store).level;
            var goldLimit = global.configHelper.getGoldLimit(banklevel);
            var goldPercent = playerState.gold / goldLimit;
            if( goldPercent > 1 ) {
                goldPercent = 1;
            }

            uiStatus.goldProgressBar.sw = uiStatus.goldProgressBar.dw = goldProgressBarWidth * goldPercent;

            // 处理军令进度显示
        }
    };

    proto.realloc = function(){
        global.uiPlayerStatus = new PlayerStatus();
    };

    global.uiPlayerStatus = new PlayerStatus();

})();
