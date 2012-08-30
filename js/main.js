/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-10
 * Time: 上午11:28
 *
 */


var resourceManager = new ResourceManager();
var enemyManager = new EnemyManager();
var towerManager = new TowerManager();
var uiManager = new UIManager();
var useTowers = ["Gatling", "Glue", "Missile", "Flame", "Lightning", "Laser"];

var mapCoords = [[1,0],
    [1,0],[1,0],[1,0],[1,0],[1,0],[1,0],
    [0,-1],[0,-1],[1,0],[1,0],[1,0],[1,0],
    [0,1],[0,1],[0,1],[0,1],[-1,0],[-1,0],
    [0,-1],[0,-1],[1,0],[1,0],[1,0],[1,0],
    [1,0],[1,0],[0,1],[0,1],[-1,0],[-1,0],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [1,0],[1,0],[1,0],[1,0],[0,1],[0,1],[1,0],[1,0],[1,0]
];

var placingTower = null;

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
        var tower = useTowers[i];
        resourceManager.add("Tower_"+tower+".arc", "xml");
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

        var tower = useTowers[i];
        if( global.towers[tower][0] ) {
            resourceManager.add("Tower_"+tower+"_Turret.asc", "text");
        }else{
            resourceManager.add("Tower_"+tower+".asc", "text");
        }

        if( global.towers[tower][1] ) {
            resourceManager.add("Tower_"+tower+"_Base.asc", "text");
        }
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

    for(var i=0; i<useTowers.length; i++) {
        var imgs = towerManager.parse(useTowers[i]);
        for(var k=0; k<imgs.length; k++) {
            resourceManager.add(imgs[k], "image", "masked");
        }
    }

    resourceManager.load(start);
}

function start() {
    trace("resource loaded, prepare to start game");
    global.stage.removeChild(global.stage.getChildByName("loading"));
    
    prepareMap();

    prepareEnemy();

    prepareTower();

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
            icon.addEventListener(Event.MOUSE_CLICK, function(e) {
                if( !placingTower ) {
                    placingTower = this.name;
                }
            });
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

    map.addEventListener(Event.MOUSE_CLICK, function(e) {
        if( !placingTower ) {
            return;
        }

        var mc = towerManager.get(placingTower, "level1", "run", 180);
        mc.scaleX = mc.scaleY = 0.4;
        mc.x = Math.floor((e.data.x-26)/43) * 43 + 26 + 22;
        mc.y = Math.floor((e.data.y-5)/45) * 45 + 5 + 23;

        mc.addEventListener(Event.GESTURE_DRAG, function(e){
            mc.x += e.data.x;
            mc.y += e.data.y;
        });

        map.addChild(mc);
        placingTower = null;
    });

    global.stage.addChild(map);
}

function prepareEnemy() {
    var map = global.stage.getChildByName("map");
    
    var mc = new MovieClip("enemy");
    mc.orientation = 90;
    mc.data.coord = 0;
    mc.data.next = 41;
    mc.y = 300;
    mc.x = 36;

    var enemy = enemyManager.get("Soldier_Light", "run", 90);
    mc.addChild(enemy);
    mc.addEventListener(Event.ENTER_FRAME, function(e) {
        if( this.data.orientation == 90 ) {
            this.x += 2;
        }else if( this.data.orientation == 0 ) {
            this.y -= 2;
        }else if( this.data.orientation == 180) {
            this.y += 2;
        }else if( this.data.orientation == -90 ) {
            this.x -= 2;
        }
        this.data.next -= 2;
        if( this.data.next <= 0 ) {
            this.data.coord += 1;
            if( this.data.coord >= mapCoords.length ) {
                this.removeEventListener(Event.ENTER_FRAME);
                return;
            }
            this.data.next = 45;

            var orientation = 90;
            var nextCoord = this.data.coord + 1;
            if( mapCoords[nextCoord][0] == 1 ) {
                orientation = 90;
            }else if( mapCoords[nextCoord][0] == -1 ) {
                orientation = -90;
            }else if( mapCoords[nextCoord][1] == 1 ) {
                orientation = 180;
            }else if( mapCoords[nextCoord][1] == -1 ) {
                orientation= 0;
            }

            if( orientation != this.data.orientation ) {
                this.data.orientation = orientation;
                var enemy = enemyManager.get("Soldier_Light", "run", Math.abs(orientation));
                if( orientation < 0 ) {
                    enemy.scaleX = -1;
                }
                this.removeAllChild();
                this.addChild(enemy);
            }
        }
    });

    map.addChild(mc);
}

function prepareTower() {
    var map = global.stage.getChildByName("map");


    var mc = towerManager.get("Gatling", "level1", "attack", 180);
    mc.scaleX = mc.scaleY = 0.4;
    mc.y = 253;
    mc.x = 200;
    mc.addEventListener(Event.GESTURE_DRAG, function(e){
        mc.x += e.data.x;
        mc.y += e.data.y;
    });
    map.addChild(mc);
}
