/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-4-26
 * Time: 下午3:04.
 */


(function(){

    var proto = BattleWorld.prototype;
    var battleBgLayer;
    var unitLayer;
    var effectLayer;
    var legion;
    var enemy;
    var isSkill;
    var noAttack;
    var displayObject;
    var fog;
    var uiLayer;
    var isStop = false;
    var immediateEndBattle;
    var stopBtn;
    var replayMode = false;

    function BattleWorld(data)
    {
        battleBgLayer = new MovieClip();
        unitLayer = new MovieClip();
        global.effectLayerManager = new global.EffectLayerManager();
        effectLayer = global.effectLayerManager.getLayer();
        uiLayer = new MovieClip();
        displayObject = new MovieClip();
        displayObject.addChild(battleBgLayer);
        displayObject.addChild(unitLayer);
        displayObject.addChild(effectLayer);
        displayObject.addChild(uiLayer);
        unitLayer.visible = false;
        this.createUI(data);
        this.createBg(data.bg);
        this.createLegion(data.legion);
        this.createEnemy(data.enemy);
        if(data.hasOwnProperty("fog") && data.fog)
        {
            this.showFog();
        }

        global.soundManager.playBackground(new Sound("battle_bgm.mp3",true));
    }

    proto.createUI = function(data)
    {
        if(data.isGarrision)
        {
            return;
        }
        stopBtn = textureLoader.createMovieClip('battleUI','battle_stop_btn');
        stopBtn.setButton(true,function(){
            global.BattleManager.stopBattle();
        });
        stopBtn.x = (global.GAME_WIDTH - stopBtn.getWidth())/2;
        stopBtn.y = 5;
        stopBtn.visible = false;
        uiLayer.addChild(stopBtn);
        immediateEndBattle = textureLoader.createMovieClip('battleUI', 'battle_progress_panel');
        immediateEndBattle.x = 152;
        immediateEndBattle.y = 0;
        var item1 = immediateEndBattle.getChildByName('battle_item_1');
        var item2 = immediateEndBattle.getChildByName('battle_item_2');
        item1.getChildByName('level_text').setText(data.legion.lv);
        item1.getChildByName('battle_photo').setImage(data.legion.photo);
        item1.getChildByName('name_text').setText(data.legion.name);
        item2.getChildByName('level_text').setText(data.enemy.lv);
        if(+data.enemy.uid > 0)
        {
            item2.getChildByName('battle_photo').setImage(data.enemy.photo);
        }
        else
        {
            item2.getChildByName('battle_photo').setImage("monster" + data.enemy.photo);
        }

        item2.getChildByName('name_text').setText(data.enemy.name);
        immediateEndBattle.getChildByName('end_btn').visible = false;
        uiLayer.addChild(immediateEndBattle);
        immediateEndBattle.getChildByName('end_btn').setButton(true,function(){
            immediateEndBattle.getChildByName('end_btn').visible = false;
            global.NetManager.call('Hero','endfight',{},function(data){
                global.BattleManager.stopBattle();
                global.controller.playerStatusController.update( data.data.player );
                global.controller.dayMissionController.update( data.data.mission_day );
                global.controller.missionController.update( data.data.mission );
            });
        });



    };

    proto.hideImmediateEnd = function()
    {
        immediateEndBattle.getChildByName('end_btn').visible = false;
        stopBtn.visible = false;
    };

    proto.stopBattle = function()
    {
        isStop = true;
        replayMode = false;
//        enemy.displayObject.visible = false;
        global.battleReportReader.resetStep(1);
        global.BattleManager.showResult();
    };

    proto.replay = function()
    {
        isStop = false;
        replayMode = true;
        legion.kill();
        enemy.kill();
        this.createLegion(global.battleReportReader.getAttackLegionData());
        this.createEnemy(global.battleReportReader.getDefenceLegionData());
        global.BattleManager.resetStep();
        global.battleReportReader.resetStep();
        var me = this;
        setTimeout(me.doBattle.bind(me),300);
    };

    proto.reBattle = function()
    {
        isStop = false;
        replayMode = false;
        legion.kill();
        enemy.kill();
        global.BattleManager.resetStep();
        global.BattleManager.battleAgain();
    };

    proto.kill = function()
    {
        displayObject.removeChild(battleBgLayer);
        displayObject.removeChild(unitLayer);
        displayObject.removeChild(effectLayer);
        displayObject.removeChild(uiLayer);
        if(legion)
        {
            legion.kill();
        }
        if(enemy)
        {
            enemy.kill();
        }
        if(fog)
        {
            effectLayer.removeChild(fog);
        }
        global.BattleManager.resetStep();
        global.effectLayerManager.hideTroopInfo();
        isStop = false;
        battleBgLayer = null;
        legion = null;
        enemy = null;
        unitLayer = null;
        effectLayer = null;
        uiLayer = null;
        displayObject = null;
        global.effectLayerManager = null;

    };

    proto.getDisplayObject = function()
    {
        return displayObject;
    };

    proto.getUILayer = function()
    {
        return uiLayer;
    };

    proto.showFog = function()
    {
        fog = new MovieClip();
        fog.x = 512;
        fog.setImage("resources/bg/warfog.png");
        effectLayer.addChild(fog);
    };

    proto.hideFog = function()
    {
        if(fog)
        {
            new Tween({
                trans:Tween.SIMPLE,
                from:fog.x,
                to:1024,
                duration:500,
                func:function () {
                    fog.x = this.tween;
                }
            }).start();
            setTimeout(function(){effectLayer.removeChild(fog);},500);
        }
    };

    proto.createBg = function(bg)
    {
        battleBgLayer.setImage(null);
        var callBack = function(){
            unitLayer.visible = true;
        };
        battleBgLayer.setImage("resources/bg/battle_map_bg_" + bg + ".png",null,callBack);

    };

    proto.createLegion = function createLegion(data)
    {
        if(data)
        {
            if(legion)
            {
                unitLayer.removeChild(legion.displayObject);
                legion.kill();
                legion = null;
            }
            legion = new global.BattleLegion(data,true);
            legion.displayObject.x = global.GAME_WIDTH / 2 - 410 - 50;
            legion.displayObject.y = 50;

            unitLayer.addChild(legion.displayObject);
        }
    };

    proto.createEnemy = function createEnemy(data)
    {
        if(data)
        {
            if(enemy)
            {
                unitLayer.removeChild(enemy.displayObject);
                enemy.kill();
                enemy = null;
            }
            enemy = new global.BattleLegion(data);
            enemy.displayObject.x = global.GAME_WIDTH / 2 + 50;
            enemy.displayObject.y = 50;
            unitLayer.addChild(enemy.displayObject);
        }
    };
    /**
     * 开始战斗，每个战斗回合调用一次
     */
    proto.doBattle = function()
    {
        if(isStop)   //点击立即结束
        {
            isStop = false;
            return;
        }

        if(!replayMode) //立即结束 和 停止回放按钮的显示
        {
            immediateEndBattle.getChildByName('end_btn').visible = true;
            stopBtn.visible = false;
        }
        else if(replayMode || this.replaymode)
        {
            immediateEndBattle.getChildByName('end_btn').visible == false;
            stopBtn.visible = true;
        }

        this.hideFog();
        var actions = global.battleReportReader.getNextStep();
        if(actions == null)
        {
            global.BattleManager.showResult();
            return;
        }
        noAttack = true;
        for(var i = 0;i<actions.length;i++)
        {
            if(i < actions.length - 1)
            {
                this._playAction(actions[i]);
            }
            else
            {
                this._playAction(actions[i],true);
            }

        }
//        BattleManager.getInstance().addEventListener(BattleManager.NEXTROUND,doBattle);
    };

    proto._playAction = function(act,lastAction)
    {
        lastAction = lastAction || false;
        if(lastAction)
        {
//            global.BattleManager.markLast();
        }

        switch(+act.actType)
        {
            case 1:
                this._move(act);
                break;
            case 3:
                if(act.isSkill == 0)
                {
                    isSkill = false;
                    this._playAttack(act);
                }
                else
                {
                    isSkill = true;
                    this._playSkill(act);
                }
                noAttack = false;
                break;
            case 5:
                this._playHurt(act);
                break;
            case 6:
                this._changeValue(act);
                break;
            case 7:
                this._heal(act);
                break;
            case 8:
                this._addEffect(act);
                break;
            case 0:

            case 10:
                this._removeEffect(act);
                break;
            case 11:
                this._changePosition(act);
                break;
        }
    };

    proto._move = function(act)
    {
        var isEnemy = true;
        if(act.hasOwnProperty("isEnemy") && act.isEnemy == false)
        {
            global.BattleManager.turnRoundFn = function(){global.battleWorld.doBattle();};
        }
        else
        {
            if(act.actorSide == 0)
            {
                enemy.moveToPos(act.actorPos,legion.getScreenPosition(act.pos[0]),act);
            }
            else
            {
                legion.moveToPos(act.actorPos,enemy.getScreenPosition(act.pos[0]),act);
            }
        }

    };

    proto._removeEffect = function(act)
    {
        var aid = 0;
        if(act.actorSide == 0)
        {
            for(var i = 0;i<act.status.length;i++)
            {
                global.BattleManager.pushAction();
                enemy.removeEffect(act.actorPos,+(act.status[i]));
            }

        }
        else
        {
            for(var j = 0;j<act.status.length;j++)
            {
                global.BattleManager.pushAction();
                legion.removeEffect(act.actorPos,+(act.status[j]));
            }
        }
    };

    proto._addEffect = function(act)
    {
        global.BattleManager.pushAction();
        if(act.actorSide == 0)
        {
            enemy.addEffect(act.actorPos,act.aid);
        }
        else
        {
            legion.addEffect(act.actorPos,act.aid);
        }
    };

    proto._changePosition = function(act)
    {
        global.BattleManager.pushAction();
        if(act.actorSide == 0)
        {
            enemy.changePosition(act.beginPos,act.endPos);
        }
        else
        {
            legion.changePosition(act.beginPos,act.endPos);
        }
    };

    proto._changeValue = function(act)
    {
        global.BattleManager.pushAction();
        if(act.actorSide == 0)
        {
            enemy.changeValue(act.actorPos,act.value);

        }
        else
        {
            legion.changeValue(act.actorPos,act.value);
        }
    };

    proto._playAttack = function(act)
    {
        var i = 0;
        if(act.actorSide == 0)
        {
            for(i = 0;i<act.targetPos.length;i++)
            {
                global.BattleManager.pushAction();
                enemy.attackTarget(act.actorPos,legion.getScreenPosition(act.targetPos[i]));
            }

        }
        else
        {
            for(i = 0;i<act.targetPos.length;i++)
            {
                global.BattleManager.pushAction();
                legion.attackTarget(act.actorPos,enemy.getScreenPosition(act.targetPos[i]));
            }
        }
    };

    proto._heal = function (act)
    {
        global.BattleManager.pushAction();
        if(act.actorSide == 0)
        {
            enemy.heal(act.actorPos,act.healnum);
        }
        else
        {
            legion.heal(act.actorPos,act.healnum);
        }
    };

    proto._playHurt = function(act)
    {
        var i = 0;
        if(act.targetSide == 0)
        {
            for( i = 0;i<act.targetPos.length;i++)
            {
                if(isSkill)
                {
                    global.BattleManager.pushAction();
                    enemy.byAttacked(act.targetPos[i],act.deadsoldier,act.iscritical,1);
                }
                else
                {
                    global.BattleManager.pushAction();
                    enemy.byAttacked(act.targetPos[i],act.deadsoldier,act.iscritical);
                }
            }

        }
        else
        {
            for( i = 0;i<act.targetPos.length;i++)
            {
                if(isSkill)
                {
                    global.BattleManager.pushAction();
                    legion.byAttacked(act.targetPos[i],act.deadsoldier,act.iscritical,1);
                }
                else
                {
                    global.BattleManager.pushAction();
                    legion.byAttacked(act.targetPos[i],act.deadsoldier,act.iscritical);
                }
            }
        }
    };

    proto._playSkill = function(act)
    {
        var i = 0;
        var isEnemy = true;

        if(act.actorSide == 0)
        {
            if(act.targetSide[0] == 0)
            {
                isEnemy = false;
            }
            global.BattleManager.pushAction();
            enemy.useSkill(act.actorPos,legion.getScreenPosition(act.targetPos[0]),act.sid,isEnemy);
        }
        else
        {
            if(act.targetSide[0] == 1)
            {
                isEnemy = false;
            }
            global.BattleManager.pushAction();
            legion.useSkill(act.actorPos,enemy.getScreenPosition(act.targetPos[0]),act.sid,isEnemy);
        }
        for( i = 0;i<act.targetSide.length;i++)
        {
            if(act.targetSide[i] == 0)
            {
                global.BattleManager.pushAction();
                enemy.byUseSkill(act.targetPos[i],act.sid);
            }
            else
            {
                global.BattleManager.pushAction();
                legion.byUseSkill(act.targetPos[i],act.sid);
            }
        }
    };
    global.BattleWorld = BattleWorld;
}());