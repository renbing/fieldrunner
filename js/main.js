/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-10
 * Time: 上午11:28
 *
 */


var resourceManager = new ResourceManager();
var enemyManager = new EnemyManager();
var uiManager = new UIManager();
var useTowers = ["Gatling", "Glue", "Missile", "Flame", "Lightning", "Laser"];

function main() {
    gameStage.init();
    trace("start game");

    loadLoading();
}

function loadLoading() {
    resourceManager.add("LoadingLaunch.form", "xml");
    resourceManager.add("FR2Title.jpg", "image");
    resourceManager.add("BGTint.jpg", "image");
    resourceManager.add("Occlusion_Gradient.jpg", "image");
    resourceManager.add("BoltedBar.jpg", "image");

    resourceManager.load(loadingLoaded);
}

function loadingLoaded() {
    var launchForm = resourceManager.get("LoadingLaunch.form");
    var xmlRoot = launchForm.data.childNodes[1].childNodes[1];
    
    var loadingMC = new MovieClip("loading", 1);
    uiManager.parse(loadingMC, xmlRoot);
    global.stage.addChild(loadingMC);

    loadResource();
}

function loadResource() {

    resourceManager.add("g2.jpg", "image");
    
    for(var i=0; i<useTowers.length; i++) {
        resourceManager.add("Tower_"+useTowers[i]+".arc", "xml");
    }

    for(var i=0; i<global.cfgs.length; i++) {
        resourceManager.add(global.cfgs[i], "xml");
    }

    resourceManager.load(firstLoaded);
}

function firstLoaded() {

    // 当前选中使用的防御塔    
    for(var i=0;i<useTowers.length; i++) {
        var conf = resourceManager.get("Tower_"+useTowers[i]+".arc");
        var attrs = conf.data.childNodes[1].getElementsByTagName("Weapon")[0].attributes;
        resourceManager.add(attrs.getNamedItem("Icon").nodeValue, "image", "masked");
        resourceManager.add(attrs.getNamedItem("DisabledIcon").nodeValue, "image", "masked");
    }

    //所有敌人种类
    var enemyTypeConf = resourceManager.get("enemyarchetypelist.cfg");
    var enemyTypeNodes = enemyTypeConf.data.childNodes[1].getElementsByTagName("Archetype");

    for(var i=0; i<enemyTypeNodes.length; i++) {
        var arc = enemyTypeNodes[i].childNodes[0].nodeValue;
        if( arc.slice(0, 6) == "Enemy_" ) {
            resourceManager.add(arc, "xml");
            resourceManager.add(arc.replace("\.arc","\.asc"), "text");
        }else{
        }
    }

    resourceManager.load(secondLoaded);
}

function secondLoaded() {

    var enemyTypeConf = resourceManager.get("enemyarchetypelist.cfg");
    var enemyTypeNodes = enemyTypeConf.data.childNodes[1].getElementsByTagName("Archetype");

    for(var i=0; i<enemyTypeNodes.length; i++) {
        var arc = enemyTypeNodes[i].textContent;
        if( arc.slice(0, 6) != "Enemy_" ) {
            continue;
        }
        var imgs = enemyManager.parse(arc.slice(6, arc.length-4));
        for(var j=0; j<imgs.length; j++) {
            resourceManager.add(imgs[j], "image", "masked");
        }
    }

    //resourceManager.load(start);
}

function start() {
    trace("resource loaded, prepare to start game");
    global.stage.removeChild(global.stage.getChildByName("loading"));
    
    prepareMap();

    prepareEnemy();

    prepareUI();
}

function prepareUI() {

    var hud = new MovieClip("hud");
    var bottom = new MovieClip("bottom");
    bottom.y = global.GAME_HEIGHT - 128;

    global.stage.addChild(hud);
    global.stage.addChild(bottom);

    for(var i=0;i<useTowers.length; i++) {
        var conf = resourceManager.get("Tower_"+useTowers[i]+".arc");
        var attrs = conf.data.childNodes[1].getElementsByTagName("Weapon")[0].attributes;

        var icon = new MovieClip(useTowers[i], 2);
        var img = resourceManager.get(attrs.getNamedItem("Icon").nodeValue).data;
        icon.addChild(new Texture(img));

        img = resourceManager.get(attrs.getNamedItem("DisabledIcon").nodeValue).data;
        icon.gotoAndStop(2);
        icon.addChild(new Texture(img));
        
        if( i<3 ) {
            icon.gotoAndStop(1);
        }
        icon.x = global.GAME_WIDTH - (useTowers.length-i) * 128;
        bottom.addChild(icon);
    }
}

function prepareMap() {
    var map = new MovieClip("map");

    var bg = resourceManager.get("g2.jpg").data;
    map.addChild(new Texture(bg, 0, 0, bg.width, bg.height, 
                            0, 0, global.GAME_WIDTH, global.GAME_HEIGHT));

    global.stage.addChild(map);
}

function prepareEnemy() {
    var map = global.stage.getChildByName("map");

    var mc = enemyManager.get("Soldier_Light", "run", 90);
    mc.y = 300;
    mc.x = 100;
    mc.scaleX = -1;
    map.addChild(mc);
}
