/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-4-25
 * Time: 下午7:41.
 */

(function(){
     var steps = 0; //动作计数器
     var proto = BattleManager.prototype;
     var battleData = {};
     var battleTimes = 0; //再战计数器
     var endCallBack;

    function BattleManager(){

    }

    proto.setEndCallBack = function(value)
    {
        endCallBack = value;
    };

    proto.setBattleTimes = function(value)
    {
        battleTimes = value;
    };

    proto.getBattleTimes = function()
    {
        return battleTimes;
    };

    proto.resetStep = function()
    {
        steps = 0;
    };
    //回合切换规则：当所有操作均被执行，将进入下一回合
    proto.pushAction = function(){
        steps++;
    };

    proto.shiftAction = function(){
        steps--;
        if(steps == 0)
        {
            if(global.BattleManager.turnRoundFn != null)
            {
                global.BattleManager.turnRoundFn();
            }
            else
            {
                global.battleWorld.doBattle();
            }
//
        }
    };

    proto.playReport = function(bgid,content)
    {
        if(!content || content == "")
        {
            global.dialog("战报格式错误");
            return;
        }
        global.configManager.load("config/battle/skill_config",makeWorld);
        function makeWorld()
        {
            global.battleReportReader = new global.BattleReportReader();

            global.battleReportReader.readReport(content);
            global.BattleManager.loadAssets(start);

            function start()
            {

                global.waitingPanel.hide();
                var battleData = {};
                battleData.bg = bgid;
                battleData.legion = global.battleReportReader.getAttackLegionData();
                battleData.enemy = global.battleReportReader.getDefenceLegionData();
                global.battleWorld = new global.BattleWorld(battleData);
                global.battleWorld.replaymode = true;
                global.stage.addChild(global.battleWorld.getDisplayObject());
                setTimeout(global.battleWorld.doBattle.bind(global.battleWorld),500);

            }
        }

    };

    proto.startBattle = function(mapid,storyid,troopid,bgid,ismine,defid,isnew)
    {
        battleData.mapid = mapid;
        battleData.storyid = storyid;
        battleData.troopid = troopid;
        battleData.bgid = bgid;
        battleData.ismine = ismine;
        battleData.defid = defid;
        defid = defid || 0;

        global.configManager.load("config/battle/skill_config",startCall);
        function startCall()
        {
            global.NetManager.call("Hero","fight",{"defid":defid,"mapid":mapid,"isdrive":global.battleData.isdrive,"location":global.battleData.location,"troopid":troopid,"ismine":ismine,"storyid":storyid,"ishelp":global.battleData.ishelp,"isrobbery":global.battleData.isrobbery,"json":1},handleCallBack);
        }

        function handleCallBack(data)
        {
            var count = 0;
//            var loadProcessor = new LoadProcessor(start);
            if(data.code != 0)
            {
                global.dialog("code:" + data.code + ",desc:" + data.desc,
                    {
                        type:global.dialog.DIALOG_TYPE_ALERT,
                        closeDelay:0,
                        okFunc:function () {
                            //关闭战斗场景
                           global.BattleManager.killBattle();
                        }
                    }
                );
            }
            else
            {

                if(!data.data.content || data.data.content == "")
                {
                    global.dialog("战报格式错误");
                    return;
                }
//                var data = "{\"battle\":{\"@attributes\":{\"t\":\"0\"},\"al\":{\"@attributes\":{\"u\":\"1257\",\"un\":\"1862111\",\"ph\":\"\",\"lv\":\"47\"},\"troop\":[{\"@attributes\":{\"pos\":\"0\",\"n\":\"\\u4e91\\u96c0-\\u6d77\\u767b\",\"lv\":\"8\",\"ph\":\"14\",\"clid\":\"4001\",\"ms\":\"410\",\"cs\":\"410\",\"atp\":\"4001\",\"im\":\"1\",\"crid\":\"0\"}},{\"@attributes\":{\"pos\":\"1\",\"n\":\"\\u7075\\u732b-\\u51ef\\u745f\\u7433\",\"lv\":\"21\",\"ph\":\"6\",\"clid\":\"3001\",\"ms\":\"800\",\"cs\":\"800\",\"atp\":\"3001\",\"im\":\"1\",\"crid\":\"0\"}},{\"@attributes\":{\"pos\":\"3\",\"n\":\"\\u8153\\u7279\\u70c8\\u5927\\u5e1d\",\"lv\":\"11\",\"ph\":\"52\",\"clid\":\"1001\",\"ms\":\"500\",\"cs\":\"500\",\"atp\":\"1001\",\"im\":\"1\",\"crid\":\"0\"}},{\"@attributes\":{\"pos\":\"4\",\"n\":\"\\u86c7\\u9aa8-\\u83f2\\u5229\\u666e\",\"lv\":\"11\",\"ph\":\"48\",\"clid\":\"1001\",\"ms\":\"500\",\"cs\":\"500\",\"atp\":\"1001\",\"im\":\"1\",\"crid\":\"0\"}},{\"@attributes\":{\"pos\":\"6\",\"n\":\"\\u6d77\\u5c14\\u66fc\",\"lv\":\"28\",\"ph\":\"50\",\"clid\":\"1002\",\"ms\":\"1010\",\"cs\":\"1010\",\"atp\":\"1002\",\"im\":\"1\",\"crid\":\"0\"}}]},\"dl\":{\"@attributes\":{\"u\":\"0\",\"un\":\"\\u8346\\u68d8\\u6728\\u9a6c\",\"ph\":\"monster8\",\"lv\":\"17\"},\"troop\":[{\"@attributes\":{\"pos\":\"0\",\"n\":\"\\u8346\\u68d8\\u6728\\u9a6c(\\u6e38\\u9a91\\u5175)\",\"lv\":\"17\",\"ph\":\"8\",\"clid\":\"3022\",\"ms\":\"680\",\"cs\":\"680\",\"atp\":\"3002\",\"im\":\"1\",\"crid\":\"0\"}},{\"@attributes\":{\"pos\":\"1\",\"n\":\"\\u8346\\u68d8\\u6728\\u9a6c(\\u6e38\\u9a91\\u5175)\",\"lv\":\"17\",\"ph\":\"8\",\"clid\":\"3022\",\"ms\":\"680\",\"cs\":\"680\",\"atp\":\"3002\",\"im\":\"1\",\"crid\":\"0\"}},{\"@attributes\":{\"pos\":\"3\",\"n\":\"\\u8611\\u83c7\\u5f13\\u5175(\\u5f13\\u5175)\",\"lv\":\"17\",\"ph\":\"9\",\"clid\":\"4022\",\"ms\":\"680\",\"cs\":\"680\",\"atp\":\"4002\",\"im\":\"1\",\"crid\":\"0\"}}]},\"step\":[{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"0\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"0\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"0\",\"ad\":\"0\",\"tp\":\"0\",\"ts\":\"1\",\"ds\":\"530\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ds\":\"69\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"165\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ds\":\"113\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"0\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ds\":\"57\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"4\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"4\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"75\",\"il\":\"1\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"4\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"6\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"0\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"6\",\"ad\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ds\":\"483\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"34\"}}]},\"\",{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"0\",\"ad\":\"0\",\"sid\":\"15\",\"tp\":\"3|6\",\"ts\":\"1|1\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"0\",\"ad\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ds\":\"72\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"0\",\"ad\":\"0\",\"tp\":\"6\",\"ts\":\"1\",\"ds\":\"59\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"8\",\"ap\":\"6\",\"ad\":\"1\",\"st\":\"10\",\"aid\":\"10\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"0\",\"sid\":\"15\",\"tp\":\"1|4\",\"ts\":\"1|1\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ds\":\"30\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"4\",\"ts\":\"1\",\"ds\":\"145\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"4\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"8\",\"ap\":\"4\",\"ad\":\"1\",\"st\":\"10\",\"aid\":\"10\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"1\",\"sid\":\"14\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"20\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ds\":\"113\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"1\",\"sid\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ds\":\"30\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"34\"}}]},\"\",\"\",\"\",{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"0\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"0\",\"ad\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ds\":\"26\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ds\":\"42\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"149\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ds\":\"113\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"1\",\"sid\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ds\":\"30\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"34\"}}]},\"\",\"\",{\"act\":[{\"@attributes\":{\"t\":\"0\",\"ap\":\"4\",\"ad\":\"1\",\"st\":\"10\"}},{\"@attributes\":{\"t\":\"0\",\"ap\":\"6\",\"ad\":\"1\",\"st\":\"10\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"0\",\"ad\":\"0\",\"sid\":\"15\",\"tp\":\"3|6\",\"ts\":\"1|1\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"0\",\"ad\":\"0\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"0\",\"ad\":\"0\",\"tp\":\"3\",\"ts\":\"1\",\"ds\":\"72\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"0\",\"ad\":\"0\",\"tp\":\"6\",\"ts\":\"1\",\"ds\":\"59\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"0\",\"sid\":\"15\",\"tp\":\"1|4\",\"ts\":\"1|1\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ds\":\"30\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"4\",\"ts\":\"1\",\"ds\":\"145\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"4\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"1\",\"sid\":\"14\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"20\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"0\",\"sid\":\"21\",\"tp\":\"6\",\"ts\":\"1\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"0\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"0\",\"tp\":\"6\",\"ts\":\"1\",\"ds\":\"67\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"4\",\"ad\":\"1\",\"sid\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"4\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"4\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"20\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"6\",\"ad\":\"1\",\"sid\":\"2\",\"tp\":\"0\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"6\",\"ad\":\"1\",\"tp\":\"0\",\"ts\":\"0\",\"ds\":\"165\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}}]},\"\",{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ds\":\"23\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"137\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"3\",\"ad\":\"0\",\"sid\":\"0\",\"tp\":\"6\",\"ts\":\"1\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"3\",\"ad\":\"0\",\"tp\":\"6\",\"ts\":\"1\",\"ds\":\"94\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"3\",\"ad\":\"0\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"4\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"4\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"21\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"4\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"6\",\"ad\":\"1\",\"sid\":\"0\",\"tp\":\"3\",\"ts\":\"0\",\"ect\":\"0\",\"ik\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"6\",\"ad\":\"1\",\"tp\":\"3\",\"ts\":\"0\",\"ds\":\"1200\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"34\"}}]},\"\",{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"0\",\"sid\":\"15\",\"tp\":\"1|4\",\"ts\":\"1|1\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"1\",\"ts\":\"1\",\"ds\":\"30\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"0\",\"tp\":\"4\",\"ts\":\"1\",\"ds\":\"145\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"4\",\"ad\":\"1\",\"vl\":\"34\"}},{\"@attributes\":{\"t\":\"8\",\"ap\":\"4\",\"ad\":\"1\",\"st\":\"10\",\"aid\":\"10\"}}]},{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"1\",\"ad\":\"1\",\"sid\":\"14\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"1\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"20\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"1\",\"ad\":\"0\",\"vl\":\"34\"}}]},\"\",{\"act\":[{\"@attributes\":{\"t\":\"3\",\"ap\":\"6\",\"ad\":\"1\",\"sid\":\"2\",\"tp\":\"1\",\"ts\":\"0\",\"ect\":\"10\",\"ik\":\"1\"}},{\"@attributes\":{\"t\":\"6\",\"ap\":\"6\",\"ad\":\"1\",\"vl\":\"-100\"}},{\"@attributes\":{\"t\":\"5\",\"ap\":\"6\",\"ad\":\"1\",\"tp\":\"1\",\"ts\":\"0\",\"ds\":\"165\",\"il\":\"0\",\"ic\":\"0\",\"di\":\"0\"}}]}],\"end\":{\"@attributes\":{\"ret\":\"1\",\"al\":\"1848\",\"dl\":\"2040\",\"aw\":\"924\",\"dw\":\"1020\"}}}}"
                global.battleReportReader = new global.BattleReportReader();

                global.battleReportReader.readReport(data.data.content);
                global.battleReportReader.setResult(data.data);
                var result = global.battleReportReader.getResult();

                if(mapid == 0 && ismine == 0 && !global.battleData.ishelp && result.userSide == 1 && result.result == 1)
                {
                    global.dataCenter.data.visitinfo.occupyinfo = {un:data.data.atklegion.m_name,headpic:data.data.atklegion.m_photo};
                }


                if(data.data.player)
                {
                    global.controller.playerStatusController.update(data.data.player);
                }
                if(data.data.inventory)
                {
                    global.controller.inventoryController.update(data.data.inventory);
                }
                if(data.data.hero)
                {
                    global.controller.herosController.update(data.data.heros);
                }
                if(data.data.mission_day)
                {
                    global.controller.dayMissionController.update(data.data.mission_day);
                }
                if(data.data.mission)
                {
                    global.controller.missionController.update(data.data.mission);
                }
                if(data.data.gameinfo)
                {
                    global.controller.gameinfoController.update(data.data.gameinfo);
                }
                if(data.data.build)
                {
                    global.controller.buildingController.update(data.data.build)
                }
                if(data.data.jail)
                {
                    global.controller.jailController.update(data.data.jail);
                }
                if(data.data.visitinfo)
                {
                    global.controller.visitInfoController.update(data.data.visitinfo);
                }
                if(data.data.troop)
                {
                    global.controller.singleTroopController.update(data.data.troop);
                }

//                var needAssets = global.battleReportReader.getNeedAsset();
//                for (var libName in needAssets)
//                {
//                    if(needAssets[libName].length)
//                    {
//                        textureLoader.loadLibrary(libName,needAssets[libName],false,loadProcessor);
//                    }
//                }
//                textureLoader.preload(global.battleTexturesConfig,loadProcessor);
//                global.waitingPanel.show();
//                global.waitingPanel.setText("加载素材中");
//                loadProcessor.start();
                global.BattleManager.loadAssets(start);
                global.battleWorld.replaymode = false;
                function start()
                {
                    if(isnew)
                    {
                        global.waitingPanel.hide();
                        var battleData = {};
                        battleData.bg = bgid;
                        battleData.legion = global.battleReportReader.getAttackLegionData();
                        battleData.enemy = global.battleReportReader.getDefenceLegionData();
                        global.battleWorld = new global.BattleWorld(battleData);
                        global.stage.addChild(global.battleWorld.getDisplayObject());

                    }
                    else
                    {
                        global.waitingPanel.hide();
                        global.battleWorld.createLegion(global.battleReportReader.getAttackLegionData());
                        global.battleWorld.createEnemy(global.battleReportReader.getDefenceLegionData());

                    }
                    setTimeout(global.battleWorld.doBattle.bind(global.battleWorld),500);
                }


            }
        }
    };

    proto.loadAssets = function(callBack)
    {
        if(callBack == null)
        {
            callBack = function()
            {
                global.stage.addChild(global.battleWorld.getDisplayObject());
            }
        }
        var loadProcessor = new LoadProcessor(function(){callBack();global.waitingPanel.hide();});
        var needAssets = global.battleReportReader.getNeedAsset();

        var tempSoldier = [];
        for(var i = 0;i<needAssets.soldier.length;i++)
        {
            tempSoldier.push(needAssets.soldier[i] + "_atk");
            tempSoldier.push(needAssets.soldier[i] + "_hurt");
            tempSoldier.push(needAssets.soldier[i] + "_run");
        }
        needAssets.soldier = tempSoldier;
        var tempMonster = [];
        for(var i = 0;i<needAssets.monster.length;i++)
        {
            tempMonster.push(needAssets.monster[i] + "_atk");
            tempMonster.push(needAssets.monster[i] + "_hurt");
            tempMonster.push(needAssets.monster[i] + "_run");
        }
        needAssets.monster = tempMonster;

        for (var libName in needAssets)
        {
            if(needAssets[libName].length)
            {
                textureLoader.loadLibrary(libName,needAssets[libName],false,loadProcessor);
            }
        }
        global.battleReportReader.clearAsset();
        textureLoader.preload(global.battleTexturesConfig,loadProcessor);
        global.waitingPanel.show();
        global.waitingPanel.setText("加载素材中");
        loadProcessor.start();
    };

    proto.battleAgain = function()
    {
        global.battleReportReader.resetStep();
        this.startBattle(battleData.mapid,battleData.storyid,battleData.troopid,battleData.bgid,battleData.ismine,battleData.defid,false);
    };

    proto.stopBattle = function()
    {
        global.battleWorld.stopBattle();
    };

    proto.killBattle = function()
    {
        var dp =  global.battleWorld.getDisplayObject();
        global.stage.removeChild(dp);
        global.battleWorld.kill();
        global.battleWorld = null;
        global.effectLayerManager = null;
        global.battleReportReader.resetStep();
        var needAssets = global.battleReportReader.getNeedAsset();
        for (var libName in needAssets)
        {
            textureLoader.unloadLibrary(libName);
        }
        global.battleReportReader = null;

        global.configManager.unload("config/battle/skill_config");
        endCallBack && endCallBack();
        endCallBack = null;

    };

    proto.showResult = function(data)
    {
        global.battleWorld.hideImmediateEnd();
        var result = global.battleReportReader.getResult();
        var endData = {};
        switch(+result.result)
        {
            case 0:
                endData.result = 0;
                break;
            case 1:
                if(result.userSide == 1)
                {
                    endData.result = 1;
                    endData.legionLose = result.atklose;
                    endData.wounded = result.atkwounded;
                    endData.enemyLose = result.deflose;
                    if(global.battleWorld.enemy)
                    {
                        global.battleWorld.enemy.displayObject.visible = false;
                    }
                }
                else
                {
                    endData.result = 2;
                    endData.legionLose = result.deflose;
                    endData.wounded = result.defwounded;
                    endData.enemyLose = result.atklose;
                    if(global.battleWorld.legion)
                    {
                        global.battleWorld.legion.displayObject.visible = false;
                    }
                }
                break;
            case 2:
                if(result.userSide == 0)
                {
                    endData.result = 1;
                    endData.legionLose = result.deflose;
                    endData.wounded = result.defwounded;
                    endData.enemyLose = result.atklose;
                    if(global.battleWorld.legion)
                    {
                        global.battleWorld.legion.displayObject.visible = false;
                    }
                }
                else
                {
                    endData.result = 2;
                    endData.legionLose = result.atklose;
                    endData.wounded = result.atkwounded;
                    endData.enemyLose = result.deflose;
                    if(global.battleWorld.enemy)
                    {
                        global.battleWorld.enemy.displayObject.visible = false;
                    }
                }
                break;
        }

        if(result.battleNumber)
        {
            endData.battleNumber = result.battleNumber;
        }
        if(result.gold)
        {
            endData.gold = result.gold;
        }
        if(result.exp)
        {
            endData.exp = result.exp;
        }
        if(result.itemtype)
        {
            endData.itemtype = result.itemtype;
            endData.itemid = result.itemid;
            endData.itemcount = result.itemcount;
        }

        var endPanel = new global.BattleEndPanel();
        endPanel.setData(endData);
        endPanel.getDisplayObject().x = global.GAME_WIDTH / 2;
        endPanel.getDisplayObject().y = (global.GAME_HEIGHT - endPanel.getDisplayObject().getHeight()) / 2;
        global.stage.addChild(endPanel.getDisplayObject());
    };

    global.BattleManager = new BattleManager();
}());