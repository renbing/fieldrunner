/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-10
 * Time: 上午11:28
 *
 */


var resourceManager = new ResourceManager();
var useTowers = ["Gatling", "Glue", "Missile", "Flame", "Lightning", "Laser"];

function main() {
    gameStage.init();
    trace("start game");

    textureLoader.loadImage("resources/map/g2.jpg", "", function(img){
        global.stage.addChild(new Texture(img, 0, 0, img.width, img.height, 0, 0, global.GAME_WIDTH, global.GAME_HEIGHT));
    });

    loadResource();
}

function loadResource() {

    for(var i=0; i<useTowers.length; i++) {
        resourceManager.add("resources/tower/Tower_"+useTowers[i]+".arc", "xml");
    }

    for(var i=0; i<global.cfgs.length; i++) {
        resourceManager.add("resources/cfg/"+global.cfgs[i], "xml");
    }

    for(var i=0; i<=3; i++ ) {
        resourceManager.add("resources/enemy/"+"Enemy_Soldier_Light_0000"+i+".png", "image", "masked");
    }

    resourceManager.add("resources/enemy/Enemy_Soldier_Light.asc", "text");

    resourceManager.add("resources/a", "text");

    resourceManager.load(towerArcLoaded);
}

function towerArcLoaded() {
    
    for(var i=0;i<useTowers.length; i++) {
        var conf = resourceManager.get("resources/tower/Tower_"+useTowers[i]+".arc");
        var attrs = conf.data.childNodes[1].getElementsByTagName("Weapon")[0].attributes;
        resourceManager.add("resources/tower/"+attrs.getNamedItem("Icon").nodeValue, "image", "masked");
        resourceManager.add("resources/tower/"+attrs.getNamedItem("DisabledIcon").nodeValue, "image", "masked");
    }

    resourceManager.load(start);
}

function start() {
    trace("resource loaded, prepare to start game");
    

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
        var conf = resourceManager.get("resources/tower/Tower_"+useTowers[i]+".arc");
        var attrs = conf.data.childNodes[1].getElementsByTagName("Weapon")[0].attributes;

        var icon = new MovieClip(useTowers[i], 2);
        var img = resourceManager.get("resources/tower/"+attrs.getNamedItem("Icon").nodeValue);
        icon.addChild(new Texture(img.data));

        img = resourceManager.get("resources/tower/"+attrs.getNamedItem("DisabledIcon").nodeValue);
        icon.gotoAndStop(2);
        icon.addChild(new Texture(img.data));
        
        if( i<3 ) {
            icon.gotoAndStop(1);
        }
        icon.x = global.GAME_WIDTH - (useTowers.length-i) * 128;
        bottom.addChild(icon);
    }
}

function prepareMap() {
    var map = new MovieClip("map");

    global.stage.addChild(map);
}

function prepareEnemy() {
    var map = global.stage.getChildByName("map");

    var enemyTypeConf = resourceManager.get("resources/cfg/enemyarchetypelist.cfg");
    var enemyTypeNodes = enemyTypeConf.data.childNodes[1].getElementsByTagName('Archetype');

    for(var i=0; i<enemyTypeNodes.length; i++) {
        trace(enemyTypeNodes[i].childNodes[0].nodeValue);
    }

    var a = resourceManager.get("resources/a");
    var lines = a.data.split("\n");
    var animation = new MovieClip('run', lines.length-1);
    var img = resourceManager.get("resources/enemy/Enemy_Soldier_Light_00000.png");
    for(var i=0; i<lines.length-1; i++) {
        var segs = lines[i].split(" ");
        animation.gotoAndStop(i+1);
        var texture = new Texture(img.data, +segs[0], +segs[1], +segs[2], +segs[3],
                                            0, 0, +segs[2], +segs[3]);
        animation.addChild(texture);
    }

    animation.gotoAndPlay(1);
    animation.y = 300;

    map.addChild(animation);

    var asc = resourceManager.get("resources/enemy/Enemy_Soldier_Light.asc");
    lines = asc.data.split("\r\n");

    var img = null;
    var frames = [];
    var emptyLine = false;

    for(var i=0; i<lines.length; i++) {
        var line = lines[i];
        if(line.slice(0, 4) == "file") {
            img = resourceManager.get("resources/enemy/"+line.split(" ")[1]);
        }
        if(line.slice(0, 11) == "orientation") {
            if( frames.length > 0 ) {
                var animation = new MovieClip('animation', frames.length);
                for(var j=0; j<frames.length; j++) {
                    var segs = frames[j];
                    animation.gotoAndStop(j+1);
                    animation.addChild(new Texture(img.data, +segs[1], +segs[2],
                                    +segs[3], +segs[4], 0, 0, +segs[3], +segs[4]));
                    animation.gotoAndPlay(1);
                }
                animation.y = Math.floor(Math.random() * 400);
                animation.x = Math.floor(Math.random() * 600);
                trace(animation);
                map.addChild(animation);
            }
            frames = [];
        }

        if(emptyLine) {
            var segs = line.split(" ");
            if(segs.length == 6) {
                frames.push(segs);
            }
        }

        if(line == "") {
            emptyLine = true;
        }else{
            emptyLine = false;
        }
    }
}
