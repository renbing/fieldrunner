/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-4-25
 * Time: 上午11:29
 */

/**
 * 部队类 提供部队的基础操作
 */

(function(){

    var proto = BattleTroop.prototype;

    /**
     * 构造器
     */
    function BattleTroop(data,owner){
        this.pos = 0;
        this.oldPos = {x:0,y:0};
        this.owner = owner;  //所属军团
        this.actionQueue = [];  //动作队列
        this.soldiers = [];     //存活士兵
        this.deleteSoldiers = [];  //死亡士兵
        this.actionCounter = 0;

        this.displayObject = new MovieClip();
        this.soldierContainer = new MovieClip();
        this.effectContainer = new MovieClip();
        this.displayObject.addChild(this.soldierContainer);
        this.displayObject.addChild(this.effectContainer);
        this.powerbar = textureLoader.createMovieClip('battleUI','fight_progress');
        this.powerEffect = textureLoader.createMovieClip('battleUI','troop_morale_effect');

        this.numberContainer = new MovieClip();
        this.level = data.level;
        this.totalHp = data.totalHp;
        this.currentHp = data.currentHp;
        this.photo = data.photo;
        this.name = data.name;
        this.closeAtk = true;     //是否近战
        this.totalUnit = 0;       //总显示单位数
        this.power = 0;           //士气
        this.addPower = 0;
        this.timeoutHandle;
        this.sid = data.sid;
        this.ismorale = data.im == "1" ? true : false;
        this._createSoldiers(data.sid);
        this.unitActionDoneCount = 0;
        this.finishAction = true;
        this._addListener();
    };
    /**
     * 播放音效
     */
    proto.playEffect = function()
    {
        var type = Math.floor(this.sid / 1000);
        switch(type)
        {
            case 1:
                global.soundManager.playEffect("skill/sword.mp3");
                break;
            case 2:
                global.soundManager.playEffect("skill/spear.mp3");
                break;
            case 3:
                global.soundManager.playEffect("skill/riding.mp3");
                break;
            case 4:
                global.soundManager.playEffect("skill/shooting.mp3");
                break;
            case 5:
                global.soundManager.playEffect("skill/magic.mp3");
                break;
        }
    };

    proto.kill = function()
    {
        this._removeListener();
        clearTimeout(this.timeoutHandle);
        for(var i=0;i<this.soldiers.length;i++)
        {
            this.soldiers[i].kill();
        }
        for(var j=0;j<this.deleteSoldiers.length;j++)
        {
            this.deleteSoldiers[j].kill();
        }
        this.displayObject.removeChild(this.effectContainer);
        this.displayObject.removeChild(this.powerbar);
        this.displayObject.removeChild(this.powerEffect);
        this.powerbar = null;
        this.powerEffect = null;
        this.soldiers = null;
        this.deleteSoldiers = null;
        this.displayObject = null;
    };

    /**
     * 设置部队归属军团
     * @param value
     */
    proto.setOwner = function(value)
    {
        this.owner = value;
    };

    /**
     * 执行动作
     * @param type  动作类型
     */
    proto.doAction = function(type)
    {
        var me = this;
        if(this.finishAction == false)
        {
            this.actionQueue.unshift({action:function(){me.doAction(type).bind(me)}});
        }
        else
        {
            var count = 0;
            var callback = this.unitCallBack.bind(this);

            while(count < this.soldiers.length)
            {
                this.soldiers[count].setCallback(callback);
                setTimeout(function(count){ return function(){
                    if(me.soldiers[count])
                    {
                        me.soldiers[count].playAction(type);
                    }
                }}(count), Math.random() * 200 + 100);
                count++;
            }
        }


    };

    proto.unitCallBack = function(){
        this.unitActionDoneCount++;
        if (this.unitActionDoneCount >= this.soldiers.length){
            this.unitActionDoneCount = 0;
            this.finishAction = true;
            this.doActionByQueue();
        }
    };

    /**
     * 执行动作队列
     */
    proto.doActionByQueue = function()
    {
        if(this.actionQueue.length)
        {
            var action = this.actionQueue.shift();
            action.action();
        }
    };

    /**
     * 移动部队到指定位置
     * @param pos
     */
    proto.moveTo = function(pos)
    {
//        TweenLite.killTweensOf(this,true);
//        TweenLite.to(this,0.3,{x:pos.x,y:pos.y,onComplete:doActionByQueue});
        var target = this.displayObject;
        var me = this;
        new Tween({
            trans:Tween.SIMPLE,
            from:target.x,
            to:pos.x,
            duration: 300,
            func:function () {
                target.x = this.tween;
            }
        }).start();

        new Tween({
            trans:Tween.SIMPLE,
            from:target.y,
            to:pos.y,
            duration: 300,
            func:function () {
                target.y = this.tween;
            }
        }).start();

//        if(me.actionQueue.length)
//        {
//            setTimeout(function(){me.doActionByQueue.bind(me)();}, 310);
//        }

    };

    /**
     * 播放技能动画
     * @param config    技能配置
     */
    proto.playSkill = function(skillName)
    {
        var me = this;
        if(skillName == "battle_skill_1")
        {
            setTimeout(function(){
                global.BattleManager.shiftAction();
                me.doActionByQueue();
            },800);
        }
        else
        {
            var skillMc = textureLoader.createMovieClip("battle_skill",skillName);
            var skillContainer = new MovieClip();
            skillContainer.addChild(skillMc);
            skillMc.gotoAndStop(1);
            var pt = {};
            pt.y = this.displayObject.y + 50;
            pt.x = ( this.owner.isAttack ? this.displayObject.x + 143 : this.displayObject.x);
            pt.x += this.displayObject.parent.parent.x;
            if(this.owner.isAttack)
            {
//            pt.x += skillMc.getWidth()/2;
                skillContainer.scaleX = -1;
            }

            skillContainer.x = pt.x;
            skillContainer.y = pt.y;

            global.effectLayerManager.getLayer().addChild(skillContainer);
            skillMc.gotoAndPlay(1);
            setTimeout(function(){
                skillMc.stop();
                global.effectLayerManager.getLayer().removeChild(skillContainer);
                global.BattleManager.shiftAction();
//                me.doActionByQueue();
            },skillMc.totalFrames * 40);
        }
//        var libName = global.BattleManager.getMaterialLib(skillName);


    };

    /**
     * 添加buff
     * @param effectName
     */
    proto.addEffect = function(effectName)
    {
//        var libName = global.BattleManager.getMaterialLib(effectName);
        var effect = textureLoader.createMovieClip("battle_skill",effectName);
        effect.name = effectName;
        if(!this.owner.isAttack)
        {
            effect.x -= 110 * 1.3;//镜像后移动一个部队的宽度
            this.effectContainer.scaleX = -1;
        }
        this.effectContainer.addChild(effect);
    };

    /**
     * 移除buff
     * @param effectName    如果为all，则移除所有buff
     */
    proto.removeEffect = function(effectName)
    {
        if(effectName == "all")
        {
            this.effectContainer.getCurrentFrame().length = 0;
//            while(this.effectContainer.numChildren)
//            {
//                this.effectContainer.removeChildAt(0);
//            }
        }
        else
        {
            this.effectContainer.removeChild(this.effectContainer.getChildByName(effectName));
        }
    };

    /**
     * 显示并处理伤害
     * @param value
     * @param isDamage   true为伤害，false为治疗
     * @param critical   是否暴击
     */
    proto.showNumber = function(value,isDamage,critical)
    {
        if(isDamage)
        {
            this.currentHp -= +value;
        }
        else
        {
            this.currentHp += +value;
        }
        var linkName = isDamage ? "damage_" : "heal_";
        var assetArray = [];
        var strValue = value.toString();
        if(isDamage)
        {
            assetArray.push("-");
        }
        else
        {
            assetArray.push("+")
        }
        for(var i = 0;i<strValue.length;i++)
        {
            assetArray.push(strValue.charAt(i));
        }
        var me = this;
        this.damageText = textureLoader.createMovieClip('battleUI','battle_number');
        this.damageText.x = this.displayObject.parent.parent.x + this.displayObject.x;
        this.damageText.y = this.displayObject.parent.parent.y + this.displayObject.y + this.displayObject.getHeight()/2 ;
        //将伤害数字用图片拼出来
        for(var i=1;i<=this.damageText.totalFrames;i++)
        {
            this.damageText.gotoAndStop(i);
            for(var j = 0;j<assetArray.length;j++)
            {
                var mc = textureLoader.createMovieClip('battleUI',linkName + assetArray[j]);
                mc.x = j*32;
                this.damageText.getChildByName('number_1').addChild(mc);
            }

        }
        global.effectLayerManager.getLayer().addChild(this.damageText);
        this.damageText.gotoAndPlay(1);
        setTimeout(function(){global.effectLayerManager.getLayer().removeChild(me.damageText);me.damageText = null;},800);
        if ( critical )
        {
            var critip = textureLoader.createMovieClip('battleUI',"violent");
            critip.y = this.damageText.y - critip.getHeight();
            critip.x = this.damageText.x;
            global.effectLayerManager.getLayer().addChild(critip);
            setTimeout(function(){global.effectLayerManager.getLayer().removeChild(critip);},800);
        }
        if(this.currentHp > 0)//根据血量增减士兵
        {
            if(isDamage)
            {
                var count = Math.ceil((this.currentHp / this.totalHp) * this.totalUnit);
                var needDelete = this.soldiers.length - count;
                while(needDelete)
                {
                    var index = randomBetweenInt(0,this.soldiers.length-1);
                    var dead = this.soldiers.splice(index,1)[0];
                    this.deleteSoldiers.push(dead);
                    dead.displayObject.visible = false;
                    needDelete--;
                }
            }
            else
            {
                var needAdd = Math.ceil((value/ this.totalHp) * this.totalUnit);
                while(needAdd)
                {
                    var i = randomBetweenInt(0,this.deleteSoldiers.length - 1);
                    var recover = this.deleteSoldiers.splice(i,1)[0];
                    if(!recover)
                    {
                        break;
                    }
                    this.soldiers.push(recover);
                    recover.displayObject.visible = true;
                    needAdd--;
                }
            }
        }
        else
        {
            while(this.soldiers.length)
            {
                var soldier = this.soldiers.pop();
                this.soldierContainer.removeChild(soldier.displayObject);
//                soldier.kill();
            }
            this.powerbar.visible = false;
            this.removeEffect("all");
            var me = this;
            setTimeout(function(){me.displayObject.parent.removeChild(me);},800);
        }
        if(me.actionQueue.length)
        {
            setTimeout(me.doActionByQueue.bind(me),300);
        }
    };

    /**
     * 显示技能tips
     * @param skillName
     * @param callBack
     */
    proto.showSkillTip = function(skillName,callBack)
    {
        var position = this.owner.isAttack ? "left" : "right";
        var isMonster = this.sid % 1000 > 10 ? true : false;
        global.effectLayerManager.showSkillTips(skillName,this.photo,isMonster,position,callBack,this);
    };

    /**
     * 构建部队
     * @param sid
     * @private
     */
    proto._createSoldiers = function(sid){
        var config = global.configs['config/battle/troop_config'];
        var mcName;
        var isSoldier = sid % 1000 > 10 ? false : true;
        var row;
        var column;
        var width;
        var height;
        for(var i = 0 ;i< config.data.troop.length;i++ )
        {
            var obj = config.data.troop[i];
            if(obj['@attributes'].classid == sid)
            {
                mcName = obj['@attributes'].run.slice(0,String(obj['@attributes'].run).lastIndexOf("_"));
                row = obj['@attributes'].row;
                column = obj['@attributes'].column;
                width = obj['@attributes'].width * 1.3;
                height = obj['@attributes'].height * 1.3;
                this.closeAtk = obj['@attributes'].closeattack == 1 ? true : false;
                this.totalUnit = row * column;
                break;
            }
        }
        var count = Math.ceil((this.currentHp / this.totalHp) * this.totalUnit);
        var counter;
        var minX = 0;
        var maxY = 0;
        var soldierHeight = 0;
        for(var i = 0;i<row;i++)
        {
            for(var j = 0;j<column;j++)
            {
                if(count < row * column)
                {
                    if(this.soldiers.length >= count || Math.random() < 0.5 && this.totalUnit - counter > count - this.soldiers.length)
                    {
                        counter++;
                        continue;
                    }
                }
                var isAtk = this.owner.isAttack;
                var soldier = new global.BattleUnit({name:mcName,isSoldier:isSoldier,index:counter,isAttack:isAtk});

                soldier.displayObject.x = i * width + Math.random() * 10 - 5;
                soldier.displayObject.y = j *height;
                minX = minX > soldier.displayObject.x ?  soldier.displayObject.x : minX;
                maxY = maxY <  soldier.displayObject.y ?  soldier.displayObject.y : maxY;
                soldierHeight = soldier.displayObject.getHeight();
                this.soldierContainer.addChild(soldier.displayObject);
                this.soldiers.push(soldier);
                counter++;
            }
        }

        if(this.ismorale && this.currentHp)
        {
            this.powerbar.y = maxY + soldierHeight ;

            if(!this.owner.isAttack)
            {
                this.powerbar.x = minX + width / 2;
            }

            this.powerEffect.x = -17 ;
            this.powerEffect.y = -19 ;
            this.displayObject.addChild(this.powerbar);
            this.updateValue(0);
        }
    };
    /**
     * 添加的士气值，可以为负值
     * @param value
     */
    proto.setAddValue = function(value)
    {
        this.addPower = +value;
    };
    /**
     * 更新士气
     * @param addPower
     */
    proto.updateValue = function(addPower)
    {
        addPower = +addPower;
        if ( addPower != 0 )
        {
            var inc = Math.ceil( addPower / 8 );

            if(this.addPower * inc < 0)
            {
                clearTimeout(this.timeoutHandle);
                this.power += addPower;
                if(this.power < 0)
                {
                    this.power = 0;
                }
                addPower = this.addPower;
            }
            else
            {
                this.addPower -= inc;
                this.power += inc;
                if(this.power > 100)
                {
                    this.power = 100;
                }
                if(this.power < 0)
                {
                    this.power = 0;
                }
            }
        }

        var obj = this.powerbar.getChildByName('progress');
        if ( obj )
        {
            var percent = this.power / 100;
            if ( percent >= 1 )
            {
                obj.clipRect = null;
            }
            else
            {
                obj.clipRect = obj.clipRect || {
                    x: 0,
                    y: 0,
                    w: obj.getWidth(),
                    h: obj.getHeight()
                };
                obj.clipRect.w = obj.getWidth() * percent;
            }
        }
        if(this.power >= 100)
        {
            this.powerbar.addChild(this.powerEffect);
        }
        else
        {
            this.powerbar.removeChild(this.powerEffect);
        }
        this._tweenValue(addPower);
    };

    proto._tweenValue = function (addValue)
    {
        var me = this;
        if(Math.abs(this.addPower) > 1)
        {
            this.timeoutHandle = setTimeout(function(){me.updateValue(addValue);},40);
        }
    };

    proto._addListener = function()
    {
        this.displayObject.setIsSwallowTouch(true);
        this.displayObject.addEventListener(Event.MOUSE_CLICK,this._showTroopInfo.bind(this));
        global.stage.addEventListener(Event.MOUSE_CLICK,this._hideTroopInfo);
    };

    proto._removeListener = function()
    {
        this.displayObject.removeEventListener(Event.MOUSE_CLICK,this._showTroopInfo);
        global.stage.removeEventListener(Event.MOUSE_CLICK,this._hideTroopInfo);
    };

    proto._showTroopInfo = function (evt)
    {
        var pos = {};
        var isMonster = this.sid % 1000 > 10 ? true : false;
        pos.x = this.displayObject.parent.parent.x + this.displayObject.x;
        pos.y = this.displayObject.parent.parent.y + this.displayObject.y + 25;
        global.effectLayerManager.showTroopInfo(pos,this.name,this.level,this.currentHp + "/" + this.totalHp,this.photo,isMonster);
    };

    proto._hideTroopInfo = function(evt)
    {
        global.effectLayerManager.hideTroopInfo();
    };

    function randomBetweenInt(min,max)
    {
        return Math.round(Math.random() * (max - min) + min);
    }

    global.BattleTroop = BattleTroop;
})();