/**
 * Created by Bingnan Gao.
 * User: Bingnan Gao
 * Date: 12-5-7
 * Time: 下午3:18
 *
 */

(function(){
    var proto = visitFriend.prototype;
    var buildings;
    var achievement,heros,inventory,inventoryinfo;
    var score = 0,scores;
    var functionList;
    var home;
    var friendId;

    function visitFriend(){
        //myId = global.NetManager.uid;
    }

    proto.visit = function(id,name,headpic,isFriend){
        friendId = id;
        global.friendId = id;
        functionList = global.stage.getChildByName('gameUiLayer').getChildByName('bottomLayerBg');
        if(!home){
            home = textureLoader.createMovieClip('ui', 'icon_home');
            trace(['home',home]);
            home.gotoAndStop(1);
            functionList.addChild(home);
            home.x = functionList.getChildByName('Battle_Report_Icon').x;
            home.y = functionList.getChildByName('Battle_Report_Icon').y;
            home.setButton(true,function(){
//                friendId = global.NetManager.uid;
//                global.NetManager.call('Player', 'city', {"nid":global.NetManager.uid,"isfriend":1}, updateStatus);
                this.returnHome();
            }.bind(this));
        }
        switch(isFriend){
            case true :
                isFriend = 1;
                break;
            case false :
                isFriend = 0;
        }
        global.NetManager.call('Player', 'city', {"nid":id,"isfriend":isFriend}, updateStatus,'拜访好友中');
        //访问好友。。。中 panel，5秒后关闭
    };

    function updateStatus(data){
        switch(friendId){
            case global.NetManager.uid :
                global.isMyHome = 1;
                functionList.getChildByName('Icon_Build').visible = true;
                functionList.getChildByName('Icon_Hero').visible = true;
                functionList.getChildByName('Icon_Build').visible = true;
                functionList.getChildByName('Icon_Fighting').visible = true;
                functionList.getChildByName('Icon_Shop').visible = true;
                functionList.getChildByName('Icon_Goods').visible = true;
                functionList.getChildByName('Battle_Report_Icon').visible = true;
                functionList.getChildByName('icon_home').visible = false;
                var missionList = global.stage.getChildByName('gameUiLayer').getChildByName('missionListContainer');
                if(missionList){
                    missionList.visible = true;
                }
                break;
            default :
                global.isMyHome = 0;
                functionList.getChildByName('Icon_Build').visible = false;
                functionList.getChildByName('Icon_Hero').visible = false;
                functionList.getChildByName('Icon_Build').visible = false;
                functionList.getChildByName('Icon_Fighting').visible = false;
                functionList.getChildByName('Icon_Shop').visible = false;
                functionList.getChildByName('Icon_Goods').visible = false;
                functionList.getChildByName('Battle_Report_Icon').visible = false;
                trace(['functionList',functionList])
                functionList.getChildByName('icon_home').visible = true;
                var missionList = global.stage.getChildByName('gameUiLayer').getChildByName('missionListContainer');
                if(missionList){
                    missionList.visible = false;
                }
        }
        global.dataCenter.data.builds = data.data.builds;
        //global.controller.buildingController.update(data.data.builds);
        global.dataCenter.data.jail = data.data.jail;
        global.dataCenter.data.visitinfo = data.data.visitinfo;
        global.dataCenter.data.message = data.data.message;
        if(global.isMyHome){
            global.dataCenter.data.friends = data.data.friends;
            global.dataCenter.data.neighbor = data.data.neighbor;
            global.dataCenter.data.attackinfo = data.data.attackinfo;
            global.dataCenter.data.occupyinfo = data.data.occupyinfo;
        }else{
            global.dataCenter.data.stealinfo = data.data.stealinfo;
        }
        global.visitFriend.updateLevelAndIcon(data);
    }

    proto.updateLevelAndIcon = function(data){
        buildings = global.sceneMyZone.builds;
        var buildingsName = global.stage.getChildByName("cityScene");
        var friendbuildings = data.data.builds;
        var friendBuild = [];
        var newArr;
        for(var i in friendbuildings){
            if(i != 11){
                buildings[i].update();
            }
            friendBuild.push(i);
        }
        newArr = this.getDifferentEle(friendBuild);
        for(var key in buildings){
            for(var j=0,len=newArr.length; j<len; j++){
                if(key == newArr[j]){
                    buildingsName.getChildByName(buildings[key].buildingName).visible = false;
                }
            }
        }
        achievement = data.data.visitinfo;
        heros = achievement.heros;
        inventory = achievement.inventory;
        for(var key in heros){
            if(heros[key].herotype != 0){
                var heroinfo = global.configHelper.getSuperHeroData(heros[key].herotype);
                if(heroinfo && heroinfo['@attributes'].achivement){
                    score += parseInt(heroinfo['@attributes'].achivement);
                }
            }
        }
        for(var j=0,max=inventory.length; j<max; j++){
            var type = inventory[j].type;
            var id = inventory[j].id;
            inventoryinfo = global.ItemFunction.findItemByTypeId(type,id);
            if(inventoryinfo && inventoryinfo['@attributes'] && inventoryinfo['@attributes'].achivement){
                score += parseInt(inventoryinfo['@attributes'].achivement);
            }
        }
        global.configManager.load("config/achivement/achivement", function(resData){
            scores = resData.achivement.score;
            for( var j=0,max=scores.length; j<max; j++ ) {
                if( +(scores[j]["@attributes"].value) > score ) {
                    break;
                }
            }
            //global.sceneMyZone.knight.mc.frames[1][0].gotoAndStop(j);
            global.sceneMyZone.knight.mc.gotoAndStop(j);
            global.achivementScore = score;
            score = 0;
        },true);
    };

    proto.getDifferentEle = function(arr){
        var ra = [0,1,2,3,4,5,6,7,8,9,10];
            for(var j=0,len=arr.length; j<len; j++){
                for(var i=0;i<=10;i++){
                    if(arr[j] == ra[i]){
                        ra = ra.slice(0,i).concat(ra.slice(i+1,11));
                    }
                }
            }

        return ra;
    };

    proto.returnHome = function(){
        friendId = global.NetManager.uid;
        global.NetManager.call('Player', 'city', {"nid":global.NetManager.uid,"isfriend":1}, updateStatus,'返回领地中');
    };

    global.visitFriend = new visitFriend();
})();