/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-4-25
 * Time: 下午5:06.
 */

/**
 * 军团类
 */
(function(){

    const C_TROOP_COLUMN = 3;
    var proto = BattleLegion.prototype;

    function BattleLegion(data,isAttack)
    {
        this.isAttack = isAttack || false;//是否攻方军团
        this.troopContainer = new MovieClip();
        this.troops = {};
        this.width = 345 * 1.3;
        this.height = 450 * 1.3;
        this.isMonster = false;
        this.displayObject = new MovieClip();
        this.displayObject.addChild(this.troopContainer);

        if(data.u == "0")
        {
            this.isMonster = true;
        }
        this._createUnits(data.legion);
    }

    proto.kill = function()
    {
        for(var pos in this.troops)
        {
            this.troops[pos].kill();
            this.troops[pos] = null;
        }
        this.troops = null;
        this.displayObject = null;
    };

    proto.moveToPos = function(target,pos)
    {
        var troop = this.troops[target];
        troop.firstAcion = true;
        if(troop.closeAtk)
        {
            this.displayObject.parent.addChild(this.displayObject);
            global.BattleManager.targetIndex = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
            var me = this;
            global.BattleManager.turnRoundFn = function(){me.backToPos(troop);};
            troop.moveTo(pos);
        }
        else
        {
            setTimeout(troop.doActionByQueue.bind(troop),200);
            global.BattleManager.turnRoundFn = function(){setTimeout(function(){global.battleWorld.doBattle();},100);};
        }
    };

    proto.backToPos = function(target)
    {
        var troop = target;
        this.troopContainer.addChildAt(troop,global.BattleManager.targetIndex);
        troop.moveTo(target.oldPos);
        global.BattleManager.turnRoundFn = null;
        setTimeout(function(){global.battleWorld.doBattle();},400)
    };

    /**
     * 攻击目标单位
     * @param atkTroop 攻击者位置
     * @param attackPos  被攻击目标所在坐标
     */
    proto.attackTarget = function (atkTroop,attackPos)
    {

//        var me = this;
        var troop = this.troops[atkTroop];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
        this.troopContainer.addChild(troop.displayObject);
//        var step1 = {action:function(){troop.moveTo(attackPos)}};
        var step2 = {action:function(){troop.doAction("attack");global.soundManager.playEffect("skill/attack.mp3");troop.playEffect()},args:null};
//        var step3 = {action:function(){troop.moveTo(troop.oldPos)}};
        var step4 = {action:function(){troop.doActionByQueue();global.BattleManager.shiftAction();}};
        if(troop.closeAtk)
        {
            troop.actionQueue.push(step2,step4);
        }
        else
        {
            troop.actionQueue.push(step2,step4);
        }
        if(troop.firstAcion)
        {
            troop.firstAcion = false;
            troop.doActionByQueue();
        }

    };
    /**
     * 治疗
     * @param target    被治疗单位位置
     * @param value     治疗量
     * @param delay     动作延时
     */
    proto.heal = function(target,value,delay)
    {
        delay = delay|| 0.8;
        var troop = this.troops[target];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
        var step1 = {action:function(){troop.showNumber(value,false,false);}};
        troop.actionQueue.push(step1);
        troop.doActionByQueue();
        setTimeout(global.BattleManager.shiftAction,800);
    };
    /**
     *  被攻击对象处理
     * @param target   被攻击对象位置
     * @param damage   伤害量
     * @param critical 是否暴击
     * @param delay
     * @param iscounter 是否反击
     */
    proto.byAttacked = function(target,damage,critical,delay,iscounter)
    {
        delay = delay || 0.4;
        var troop = this.troops[target];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
        var step1 = {action:function(){setTimeout(function(){troop.doAction("hurt");global.soundManager.playEffect("skill/hurt.mp3");},delay*1000);}};
        var step2 = {action:function(){troop.showNumber(damage,true,critical);setTimeout(global.BattleManager.shiftAction,800);}};
        troop.actionQueue.push(step1,step2);
        if(troop.actionQueue.length == 2)
        {
            troop.doActionByQueue();
        }
    };
    /**
     * 被使用技能单位播放动画
     * @param target
     * @param skillCode
     */
    proto.byUseSkill = function(target,skillCode)
    {
        var troop = this.troops[target];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
        var skillConfig = global.configManager.get("config/battle/skill_config").data.skill;
        var skillName = "";
        for(var i = 0;i<skillConfig.length;i++)
        {
            if(skillConfig[i]["@attributes"].id == skillCode)
            {
                 skillName = skillConfig[i]["@attributes"].effectani;
            }
        }
        setTimeout(function(){troop.playSkill(skillName);global.soundManager.playEffect("skill/skill_"+skillCode)},500);
    };
    /**
     * 使用技能
     * @param actTroop    技能释放者位置
     * @param attackPos   技能作用单位坐标
     * @param skillCode
     * @param isEnemy     是否施加于敌方单位
     */
    proto.useSkill = function(actTroop,attackPos,skillCode,isEnemy)
    {
        var me = this;
        var troop = this.troops[actTroop];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
        var skillConfig = global.configManager.get("config/battle/skill_config").data.skill;
        var skillName = "";
        for(var i = 0;i<skillConfig.length;i++)
        {
            if(skillConfig[i]["@attributes"].id == skillCode)
            {
                skillName = skillConfig[i]["@attributes"].name;
            }
        }

        this.troopContainer.addChild(troop);

//        var step1 = {action:function(){troop.moveTo(attackPos)}};
        var step2 = {action:function(){troop.doAction("attack");troop.playEffect();},args:null};
        var step3 = {action:function(){
            setTimeout(function(){me.troopContainer.addChildAt(troop,index);global.BattleManager.shiftAction();},300)
        }};
        var step4 = {action:function(){troop.doActionByQueue();me.troopContainer.addChildAt(troop,index);global.BattleManager.shiftAction();}};
        if(+skillCode == 8)  //连击不显示技能动画
        {
            troop.actionQueue.push(step3);
        }
        else if(troop.closeAtk && isEnemy)
        {
            troop.actionQueue.push(step2,step4);
        }
        else
        {
            troop.actionQueue.push(step2,step4);
        }
        troop.showSkillTip(skillName,troop.doActionByQueue);
    };
    /**
     * 改变士气
     * @param actTroop
     * @param addValue
     */
    proto.changeValue = function(actTroop,addValue)
        {
            var troop = this.troops[actTroop];
            var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
            troop.setAddValue(addValue);
            setTimeout(function(){
            troop.updateValue(addValue);
            global.BattleManager.shiftAction();
            },1000);

        };
    /**
     * 改变位置
     * @param beginPos
     * @param endPos
     */
    proto.changePosition = function(beginPos,endPos)
    {
        if(beginPos == endPos)
        {
            global.BattleManager.shiftAction();
        }
        else
        {
            var me = this;
            var troop = this.troops[beginPos];
            var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
            setTimeout(function(){
                me.troopContainer.addChildAt(troop,index)
                troop.moveTo(me.getScreenPosition(endPos,true));
                global.BattleManager.shiftAction();
            },1500);
            this.troops[endPos] = troop;
            delete(this.troops[beginPos]);
            troop.pos = endPos;
            troop.oldPos = this.getScreenPosition(endPos,true);
        }

    };
    /**
     * 添加buff
     * @param actor
     * @param aid
     */
    proto.addEffect = function(actor,aid)
    {
        var troop = this.troops[actor];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);

        var skillConfig = global.configManager.get("config/battle/skill_config").data.status;
        var skillName = "";
        for(var i = 0;i<skillConfig.length;i++)
        {
            if(skillConfig[i]["@attributes"].id == aid)
            {
                skillName = skillConfig[i]["@attributes"].name;
            }
        }
        if(skillName != "")
        {
           setTimeout(function(){
               troop.addEffect(skillName);
               global.BattleManager.shiftAction();
           },2000);
        }
        else
        {
            global.BattleManager.shiftAction();
        }
    };

    proto.removeEffect = function(actor,aid)
    {
        var troop = this.troops[actor];
        var index = this.troopContainer.getCurrentFrame().indexOf(troop.displayObject);
        var skillConfig = global.configManager.get("config/battle/skill_config").data.status;
        var skillName = "";
        for(var i = 0;i<skillConfig.length;i++)
        {
            if(skillConfig[i]["@attributes"].id == aid)
            {
                skillName = skillConfig[i]["@attributes"].name;
            }
        }
        if(skillName != "")
        {
            setTimeout(function(){
                troop.removeEffect(skillName);
                global.BattleManager.shiftAction();
            },1000);
        }
        else
        {
            global.BattleManager.shiftAction();
        }
    };

    proto._createUnits = function(data)
    {
        for(var index in data)
        {
            var troopwidth = 110 * 1.3;
            var troopheight = 165 * 1.3;
            var row = Math.floor(index / C_TROOP_COLUMN);
            var column = index % C_TROOP_COLUMN;
            data[index].photo = data[index].photo;
            var troop = new global.BattleTroop(data[index],this);

            if(this.isAttack)
            {
                troop.displayObject.x = this.width - ( row + 1) * troopwidth;
            }
            else
            {
                troop.displayObject.x = ( row ) * troopwidth;
            }
            troop.displayObject.y = column * troopheight;
            troop.pos = index;
            troop.oldPos = {x:troop.displayObject.x,y:troop.displayObject.y};

            troop.owner = this;
            this.troopContainer.addChild(troop.displayObject);
            this.troops[index] = troop;
        }
    };

    proto.getScreenPosition = function(index,noFix)
    {
        noFix = noFix || false;
        var troopwidth = 110 * 1.3;
        var troopheight = 165 * 1.3;
        var row = Math.floor(index / C_TROOP_COLUMN);
        var column = index % C_TROOP_COLUMN;
        var pt = {};
        if(this.isAttack)
        {
            if(noFix)
            {
                pt.x = (this.width - ( row + 1 ) * troopwidth);
            }
            else
            {
                pt.x = - ( row + 1) * troopwidth;
            }
            pt.y = column * troopheight;
        }
        else
        {
            if(noFix)
            {
                pt.x = ( row ) * troopwidth;
            }
            else
            {
                pt.x = this.width + ( row  ) * troopwidth;
            }

            pt.y = column * troopheight;
        }
        if(noFix)
        {
            return pt;
        }
        if(this.isAttack)
        {
            pt.x += 80;
        }
        else
        {
            pt.x -= 80;
        }
        return pt;
    };
    global.BattleLegion = BattleLegion;
}());

