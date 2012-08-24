/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-23
 * Time: 下午5:19
 *
 */

(function () {
    // 用于ide语法分析,不要直接使用，这仅仅做语法提示，没有任何实际意义
    var serverData = {"code":0, "desc":269, "action":{"version":null, "appid":null, "userip":null, "svrip":null, "time":null, "domain":null, "worldid":null, "optype":null, "actionid":null, "opuid":null, "opopenid":null, "touid":null, "toopenid":null, "level":null, "source":null, "itemid":null, "itemtype":null, "itemcnt":null, "modifyexp":null, "totalexp":null, "modifycoin":null, "totalcoin":null, "modifyfee":null, "totalfee":null, "onlinetime":null, "key":null, "keycheckret":null, "safebuf":null, "remark":null, "user_num":null}, "data":{"player":{"u":"1217", "gold":10164, "cash":0, "exp":15, "food":550, "people":770, "soldier":5132, "wounded":0, "guard":0, "ismale":0, "viewsoldier":0, "viewtroopid":1, "viewstoryid":0, "viewenemyid":0, "battlenumber":393, "mineid":0, "taxpeoplenumber":47, "minefight":10, "minesec":14400, "occupytime":6, "promote":20, "leftbattlenumber":30, "lastbattletime":1332467575, "lastfighttime":1332324624, "herovalue":0, "trainnumber":1, "maxheroid":315, "openbattlenumber":0, "customvalue":0, "wishnumber":0, "lastminetime":0, "bonusgold":0, "tavernmaxlevel":0}, "playerinfo":{"vip":0, "viplevel":0}, "playermark":{"u":"1217", "tutorial":2066430, "day":"20120323", "freegift":1, "logongift":0, "attacktime":946656000, "vipgift":0, "viplogongift":0, "normalgift":0}, "inventory":[
        {"type":0, "id":1, "counter":18},
        {"type":0, "id":2, "counter":10},
        {"type":0, "id":100, "counter":1},
        {"type":0, "id":54, "counter":2},
        {"type":0, "id":47, "counter":1},
        {"type":0, "id":4, "counter":1},
        {"type":1, "id":31, "counter":1}
    ], "mission":{"101":{"mid":101, "status":[1, 0, 0], "isfinished":1}, "102":{"mid":102, "status":[2, 0, 0], "isfinished":1}, "201":{"mid":201, "status":[1, 0, 0], "isfinished":1}, "202":{"mid":202, "status":[1, 0, 0], "isfinished":1}, "203":{"mid":203, "status":[3, 0, 0], "isfinished":1}, "206":{"mid":206, "status":[1, 0, 0], "isfinished":1}, "301":{"mid":301, "status":[1, 0, 0], "isfinished":1}, "302":{"mid":302, "status":[1, 0, 0], "isfinished":1}, "303":{"mid":303, "status":[1, 0, 0], "isfinished":0}, "304":{"mid":304, "status":[1, 1, 0], "isfinished":1}, "305":{"mid":305, "status":[1, 0, 0], "isfinished":0}, "306":{"mid":306, "status":[4, 0, 0], "isfinished":1}, "401":{"mid":401, "status":[1, 0, 0], "isfinished":0}, "402":{"mid":402, "status":[1, 0, 0], "isfinished":1}, "403":{"mid":403, "status":[0, 0, 0], "isfinished":null}, "404":{"mid":404, "status":[1, 0, 0], "isfinished":0}, "405":{"mid":405, "status":[4, 0, 0], "isfinished":0}}, "mission_day":{"status":[2, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], "gifts":[0]}, "troops":{"1":{"playerid":"1217", "troopid":1, "heroid1":244, "heroid2":0, "heroid3":0, "heroid4":0, "heroid5":0, "heroid6":0, "heroid7":0, "heroid8":0, "heroid9":0, "soldier":0, "location":0, "locationname":" ", "ismine":0}}, "jail":[], "friends":[], "neighbor":null, "heros":{"244":{"u":"1217", "heroid":244, "heroname":"所罗门", "herotype":2, "herolevel":1, "herohidelevel":0, "attack":72, "defense":77, "luck":76, "corpstype":1001, "status":1, "image":51, "prize":500, "grade":"D", "ismale":1, "style":1, "endtrainingtime":1332324616, "trainingtype":1, "reborntime":0, "rebornlevel":0, "troopid":1, "skill1id":1, "skill1level":1, "skill2id":0, "skill2level":0, "weapontype":0, "weaponid":0, "armortype":0, "armorid":0, "exp":8, "itemattack":0, "itemdefense":0, "newattack":0, "newdefense":0, "newluck":0, "cardid":0, "cardtime":1332323965, "origrade":"D", "isdirty":1}, "313":{"u":"1217", "heroid":313, "heroname":"火鸟-夏洛特", "herotype":0, "herolevel":1, "herohidelevel":0, "attack":42, "defense":45, "luck":43, "corpstype":1001, "status":0, "image":5, "prize":500, "grade":"D", "ismale":0, "style":8, "endtrainingtime":1332404257, "trainingtype":0, "reborntime":0, "rebornlevel":0, "troopid":0, "skill1id":1, "skill1level":1, "skill2id":0, "skill2level":0, "weapontype":0, "weaponid":0, "armortype":0, "armorid":0, "exp":0, "itemattack":0, "itemdefense":0, "newattack":0, "newdefense":0, "newluck":0, "cardid":0, "cardtime":1332404257, "origrade":"D", "isdirty":0}, "314":{"u":"1217", "heroid":314, "heroname":"双子-克莱尔", "herotype":0, "herolevel":1, "herohidelevel":0, "attack":42, "defense":46, "luck":48, "corpstype":2001, "status":0, "image":15, "prize":500, "grade":"D", "ismale":1, "style":2, "endtrainingtime":1332404257, "trainingtype":0, "reborntime":0, "rebornlevel":0, "troopid":0, "skill1id":1, "skill1level":1, "skill2id":36, "skill2level":1, "weapontype":0, "weaponid":0, "armortype":0, "armorid":0, "exp":0, "itemattack":0, "itemdefense":0, "newattack":0, "newdefense":0, "newluck":0, "cardid":0, "cardtime":1332404257, "origrade":"D", "isdirty":0}, "315":{"u":"1217", "heroid":315, "heroname":"双鱼-达芙妮", "herotype":0, "herolevel":1, "herohidelevel":0, "attack":53, "defense":45, "luck":51, "corpstype":2001, "status":0, "image":31, "prize":500, "grade":"D", "ismale":0, "style":2, "endtrainingtime":1332404257, "trainingtype":0, "reborntime":0, "rebornlevel":0, "troopid":0, "skill1id":1, "skill1level":1, "skill2id":36, "skill2level":1, "weapontype":0, "weaponid":0, "armortype":0, "armorid":0, "exp":0, "itemattack":0, "itemdefense":0, "newattack":0, "newdefense":0, "newluck":0, "cardid":0, "cardtime":1332404257, "origrade":"D", "isdirty":0}}, "gameinfo":{"u":"1217", "refreshtime":1332467575, "continuelogin":2, "permit":8514, "permitdate":946656000, "taxtime":946656000, "taxnumber":0, "servertime":1332497715, "troopnumber":2, "storyid":2, "dragonid":[], "dragonmapid":0, "achivement":12, "friendgift":0, "sharenumber":0, "isadult":0, "firstlogontime":1332467575}, "builds":{"0":{"u":1217, "finishtime":1332324112, "level":4, "type":0, "endworktime":1332500433, "status":1, "workdata":2, "extradata":0, "occupy":0, "occupyharvest":946656000, "shielddata":946656000, "shieldtype":0, "occupydate":946656000, "harvesttime":0, "isdirty":0}, "1":{"u":"1217", "finishtime":1332324690, "level":1, "type":1, "endworktime":1332400528, "status":0, "workdata":0, "extradata":0, "occupy":0, "occupyharvest":1332323670, "shielddata":0, "shieldtype":0, "occupydate":1332323670, "harvesttime":0, "isdirty":0}, "2":{"u":"1217", "finishtime":1332325009, "level":1, "type":2, "endworktime":1332324861, "status":0, "workdata":0, "extradata":0, "occupy":0, "occupyharvest":1332323809, "shielddata":0, "shieldtype":0, "occupydate":1332323809, "harvesttime":0, "isdirty":0}, "3":{"u":"1217", "finishtime":1332357425, "level":1, "type":3, "endworktime":1332425854, "status":0, "workdata":3, "extradata":0, "occupy":0, "occupyharvest":1332323825, "shielddata":0, "shieldtype":0, "occupydate":1332323825, "harvesttime":0, "isdirty":0}, "4":{"u":"1217", "finishtime":1332325438, "level":1, "type":4, "endworktime":1332354634, "status":1, "workdata":24, "extradata":6, "occupy":0, "occupyharvest":1332323998, "shielddata":0, "shieldtype":0, "occupydate":1332323998, "harvesttime":0, "isdirty":0}, "5":{"u":1217, "finishtime":1331104990, "level":1, "type":5, "endworktime":1331104990, "status":0, "workdata":0, "extradata":0, "occupy":0, "occupyharvest":946656000, "shielddata":946656000, "shieldtype":0, "occupydate":946656000, "harvesttime":0, "isdirty":0}, "6":{"u":"1217", "finishtime":1332325802, "level":1, "type":6, "endworktime":1332324002, "status":0, "workdata":0, "extradata":0, "occupy":0, "occupyharvest":1332324002, "shielddata":0, "shieldtype":0, "occupydate":1332324002, "harvesttime":0, "isdirty":null}, "9":{"u":1217, "finishtime":1331104990, "level":1, "type":9, "endworktime":1332494346, "status":0, "workdata":0, "extradata":0, "occupy":0, "occupyharvest":946656000, "shielddata":946656000, "shieldtype":0, "occupydate":946656000, "harvesttime":0, "isdirty":0}}, "sysbattlenumber":50, "auth_key":"9404c461dba896ccf436ea732435d411", "auth_time":1332497715, "uid":1217, "newreport":0, "servertime":1332497715}, "num":1};

    var proto = DataCenter.prototype;

    function DataCenter() {
        this.listeners = global.createLinkList();
        this.data = null;
    }

    proto.getLevel = function () {
        return this.data.builds[0].level;
    };

    proto.getBuildLevel = function (type) {
        return this.data.builds[type].level;
    }

    proto.getPlayerGold = function () {
        return this.data.player.gold;
    }

    proto.getPlayerExp = function () {
        return this.data.player.exp;
    }

    proto.getHarryUpCounter = function () {
        return this.data.inventory[0].counter;
    }
    /**
     * 当你改变了data的值之后，如果想要触发其他监听对象的方法，就调用这个方法
     */
    proto.update = function () {
        var next, cur = this.listeners.first;
        while (cur != null) {
            next = cur.next;
            cur.func(this.data);
            cur = next;
        }
    };

    proto.addListener = function (listener) {
        this.listeners.add(listener);
    };

    proto.delListener = function (listener) {
        this.listeners.del(listener);
    };

    proto.findInventoryCounter = function (type, id) {
        if (!this.data || !this.data.inventory) return 0;

        if(global.isMyHome){
            var inventory = this.data.inventory;
        }else{
            var inventory = global.dataCenter.data.visitinfo.inventory;
        }
        for (var i = 0, max = inventory.length; i < max; i++) {
            if (inventory[i].id == id && inventory[i].type == type) {
                return inventory[i].counter;
            }
        }

        return 0;
    };

    proto.findInventory = function (type, id) {
        if (!type || !id) return;

        var oldItems = this.data.inventory;
        if (!oldItems) return;

        for (var i = 0; i < oldItems.length; ++i) {
            if (oldItems[i].type == type && oldItems[i].id == id) {
                return oldItems[i];
            }
        }
    };

    //向dataCenter里面添加指定物品，用于服务器返回数据中没有包含inventory，只包含相关物品字段的时候
    proto.addItem = function (type, id, count) {
        if (!type || !id) return;

        var oldItems = this.data.inventory;
        if (!oldItems) return;

        var bFind = false;
        for (var i = 0; i < oldItems.length; ++i) {
            if (oldItems[i].type == type && oldItems[i].id == id) {
                oldItems[i].counter += +count;
                if (oldItems[i].counter <= 0) {//若用完了，则删除该物品
                    oldItems.splice(i, 1);
                }
                bFind = true;
                break;
            }
        }
        //若之前没有该物品，添加物品时创建物品
        if (!bFind && count > 0) {
            oldItems.push({'type':type, 'id':id, 'counter':count});
        }
    };

    proto.getBuildByType = function (buildType) {
        return this.data.builds[buildType];
    };

    proto.getTrainingHeroCount = function (bIncludeFinished) {
        var heros = this.data.heros;
        var count = 0;
        for (var key in heros) {
            if (heros[key].trainingtype != 0 && ( bIncludeFinished || ( heros[key].endtrainingtime - global.common.getServerTime() ) > 0 )) {
                ++count;
            }
        }
        return count;
    };

    proto.getHeroCount = function (status) {
        var count = 0;
        var heros = this.data.heros;
        for (var key in heros) {
            if (status === undefined || heros[key].status == status) {
                ++count;
            }
        }
        return count;
    };

    proto.getHeroById = function (heroid) {
        var heros = this.data.heros;
        for (var key in heros) {
            if (heros[key].heroid == heroid) {
                return heros[key];
            }
        }
    };

    proto.getHeros = function(inHeros, status, withoutStatus){
        var retHerosArray = [];
        var heros = inHeros || this.data.heros;
        for(var key in heros) {
            if(heros[key] && (status === undefined || ((heros[key].status == status) && heros[key].status !== withoutStatus))) {
                retHerosArray.push(heros[key]);
            }
        }
        return retHerosArray;
    };

    global.dataCenter = new DataCenter();

    // default controller, just set value
    global.controller.gameinfoController = {update:function (gameinfo) {
        global.dataCenter.data.gameinfo = gameinfo;
    }};

    global.controller.singleHeroController = {update:function (hero) {
        if (!hero) return;
        var heros = global.dataCenter.data.heros;
        var bFind = false;
        for (var key in heros) {
            if (heros[key].heroid == hero.heroid) {
                heros[key] = hero;
                bFind = true;
                break;
            }
        }
        if(!bFind){
            if(!global.dataCenter.data.heros) global.dataCenter.data.heros = {};
            global.dataCenter.data.heros[hero.heroid] = hero;
        }
    }};

    global.controller.herosController = {
        update:function(heros){
            if(!heros) return;
            if(global.isMyHome)
                global.dataCenter.data.heros = heros;
            else
                global.oldDataCenter.data.heros = heros;
        }
    };

    global.controller.singleTroopController = {
        update:function(troop){
            if(!troop) return;

            var troops = global.dataCenter.data.troops;
            if(!troops) global.dataCenter.data.troops = {};
            if(troop.troopid){
                troops[troop.troopid] = troop;
            }
        }
    };

    global.controller.troopsController = {
        update:function(troops){
            if(troops){
                global.dataCenter.data.troops = troops;
            }
        }
    };

    global.controller.jailController = {
        update:function(jail){
            if(!jail) return;
            global.dataCenter.data.jail = jail;
            global.sceneMyZone.buildingPrison.update();

            var jails = {};
            for(var key in jail){
                jails[jail[key].prisoner] = jail[key];
            }

            var friends = global.dataCenter.data.friends;
            for(var key in friends){
                var friend = friends[key];
                if(jails[friend.uid]){
                    var prisoner = jails[friend.uid];
                    friend.occupyharvest = prisoner.occupyharvest;
                    friend.occupy = global.NetManager.uid;
                }
                else{
                    if(friend.occupy && friend.occupy != friend.uid){
                        friend.occupy = 0;
                    }
                }
            }

            global.uiFriendList.update();
        }
    };

    global.controller.visitInfoController = {
        update:function(visitInfo){
            if(!visitInfo) return;

            global.dataCenter.data.visitinfo = visitInfo;
        }
    };


})();
