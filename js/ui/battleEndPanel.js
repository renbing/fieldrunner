/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-5-14
 * Time: 上午11:54.
 */

(function(){

    proto = BattleEndPanel.prototype;
    var timeHandle;

    function BattleEndPanel(){
        this.panel = textureLoader.createMovieClip("battleUI","battle_end_panel");
        this.win = this.panel.getChildByName("battle_win");
        this.lose = this.panel.getChildByName("battle_lose");
        this.deuce = this.panel.getChildByName("battle_end_deuce");

        var me = this;

        this.replayBtn = this.panel.getChildByName("battle_end_play_btn");
        this.replayBtn.setButton(true,function(){global.battleWorld.replay.bind(global.battleWorld)();me.panel.parent.removeChild(me.panel);});
        this.legionLose = this.panel.getChildByName("text_1");
        this.enemyLose = this.panel.getChildByName("text_2");
        this.wounded = this.panel.getChildByName("text_3");
        this.exp = this.panel.getChildByName("battle_experience");
        this.expText = this.exp.getChildByName("text");
        this.gold = this.panel.getChildByName("battle_gold");
        this.goldText = this.gold.getChildByName("text");
        this.energy = this.panel.getChildByName("battle_energy");
        this.energyText = this.energy.getChildByName("text");
        this.energyLeft = this.panel.getChildByName("number_text_1");
        this.stopBtn = this.panel.getChildByName("stop_btn");
        this.stopBtn.setButton(true,me._stopBattle.bind(me));
        this.endBattleBtn = this.panel.getChildByName("battle_end_back_btn");
        this.postBtn = this.panel.getChildByName("release_btn");
        this.postBtn.setButton(true);
        this.battleNumber = this.panel.getChildByName("battle_again");
        this.battleNumberLeftBtn = this.battleNumber.getChildByName("left_btn");
        this.battleNumberLeftBtn.setButton(true,function(){
            var battlenumber = Math.max(0,global.BattleManager.getBattleTimes() - 1);
            global.BattleManager.setBattleTimes(battlenumber);
            me.battleNumberText.setText(battlenumber.toString());});
        this.battleNumberRightBtn = this.battleNumber.getChildByName("right_btn");
        this.battleNumberRightBtn.setButton(true,function(){
            var battlenumber = Math.min(global.dataCenter.data.player.battlenumber,global.BattleManager.getBattleTimes() + 1);
            global.BattleManager.setBattleTimes(battlenumber);
            me.battleNumberText.setText(battlenumber.toString());});
        this.battleNumberText = this.battleNumber.getChildByName("number_text");
        this.infoText = this.panel.getChildByName("number_text_2");
        this.battleTime = this.panel.getChildByName("number_text_3");
        this.battleIcon = this.panel.getChildByName("icon_1");
        this.battleAgainBtn = this.panel.getChildByName("again_btn");
        this.battleAgainBtn.setButton(true,function(){
            global.battleWorld.reBattle.bind(global.battleWorld)();
            me.panel.parent.removeChild(me.panel);
            var battlenumber = Math.max(0,global.BattleManager.getBattleTimes() - 1);
            global.BattleManager.setBattleTimes(battlenumber);});
        this.battleItem = this.panel.getChildByName("battle_item");
        this.battleItemPic = this.battleItem.getChildByName("photo");
        this.battleItemText = this.battleItem.getChildByName("text");
        this.returnBtn = this.panel.getChildByName("battle_end_back_btn");
        this.returnBtn.setButton(true,function(){global.BattleManager.killBattle();me.panel.parent.removeChild(me.panel);});
    }

    proto.setData = function(data)
    {
        this.win.visible = false;
        this.lose.visible = false;
        this.deuce.visible = false;
        if(data.result == 0)
        {
            this.deuce.visible = true;
        }
        else if(data.result == 1)
        {
            this.win.visible = true;
        }
        else
        {
            this.lose.visible = true;
        }
        this.legionLose.setText(data.legionLose);
        this.enemyLose.setText(data.enemyLose);
        this.wounded.setText(data.wounded);
        if(data.hasOwnProperty("gold"))
        {
            this.gold.visible = true;
            this.goldText.setText(data.gold.toString());
        }
        else
        {
            this.gold.visible = false;
        }
        if(data.hasOwnProperty("exp"))
        {
            this.exp.visible = true;
            this.expText.setText(data.exp.toString());
        }
        else
        {
            this.exp.visible = false;
        }
        if(data.hasOwnProperty("energy"))
        {
            this.energy.visible = true;
            this.energyText.setText(data.energy);
        }
        else
        {
            this.energy.visible = false;
        }
        if(data.hasOwnProperty("itemtype") && +data.itemtype != 0)
        {
            this.battleItem.visible = true;
            var itemInfo = global.ItemFunction.getItemInfo(data.itemtype,data.itemid);
            this.battleItemPic.setImage(global.ItemFunction.IconDir + itemInfo.shopicon + '.png',
                global.ItemFunction.DefaultIcon);
            this.battleItemText.setText(itemInfo.name + "x" + data.itemcount);
        }
        else
        {
            this.battleItem.visible = false;
        }
        if(global.battleWorld.replaymode)
        {
            this.battleNumber.visible = false;
            this.stopBtn.visible = false;
            this.battleAgainBtn.visible = false;
            this.battleIcon.visible = false;
            this.energyLeft.setText("");
            this.battleTime.setText("");
        }
        else
        {
            this.battleNumber.visible = true;
            this.energyLeft.setText(global.dataCenter.data.player.battlenumber.toString());
            this.battleNumberText.setText(global.BattleManager.getBattleTimes().toString());
            if(global.BattleManager.getBattleTimes())
            {
                this.stopBtn.visible = true;
                this.battleAgainBtn.visible = false;
                this.battleTime.setText("5");

                var timeFn = function()
                {
                    var me = this;
                    this.timeHandle = setTimeout(function(){
                        var count = +me.battleTime.text - 1;
                        if(count > 0)
                        {
                            me.battleTime.setText(count.toString())
                            timeFn.bind(this)();
                        }
                        else
                        {

                            global.BattleManager.setBattleTimes(global.BattleManager.getBattleTimes() - 1);
                            global.battleWorld.reBattle.bind(global.battleWorld)();
                            me.panel.parent.removeChild(me.panel);
                        }
                    }.bind(this),1000);
                };
                timeFn.bind(this)();
            }
            else
            {
                this.stopBtn.visible = false;
            }
        }


    };

    proto._stopBattle = function()
    {
        clearTimeout(this.timeHandle);
        this.stopBtn.visible = false;
        this.battleAgainBtn.visible = true;
        this.battleTime.setText(null);
    };

    proto.getDisplayObject = function()
    {
        return this.panel;
    };

    global.BattleEndPanel = BattleEndPanel;
}());