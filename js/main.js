/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-10
 * Time: 上午11:28
 *
 */

var towers = ["Gatling","Glue","Missile","Flame","Lightning","Laser","Oil",
            "Beehive","Biowaste","Plasma","Pyro","Spark","Railgun","Mine",
            "Radiation","Nuke","Ice","Gas","Link","Power"];

var useTowers = ["Gatling", "Glue", "Missile", "Flame", "Lightning", "Laser"];
var resourceManager = new ResourceManager();

function main() {
    gameStage.init();
    trace("start game");

    textureLoader.loadImage("resources/map/g2.jpg", "", function(img){
        global.stage.addChild(new Texture(img, 0, 0, img.width, img.height, 0, 0, global.GAME_WIDTH, global.GAME_HEIGHT));
    });

    for(var i=0; i<useTowers.length; i++) {
        resourceManager.add("resources/tower/Tower_"+useTowers[i]+".arc", "xml");
    }
    resourceManager.load(towerArcLoaded);
}

function towerArcLoaded() {
    
    for(var i=0;i<useTowers.length; i++) {
        var conf = resourceManager.get("resources/tower/Tower_"+useTowers[i]+".arc");
        var attrs = conf.data.childNodes[1].getElementsByTagName("Weapon")[0].attributes;
        resourceManager.add("resources/tower/"+attrs.getNamedItem("Icon").nodeValue.replace("\.png", "\.jpg"), "image");
        resourceManager.add("resources/tower/"+attrs.getNamedItem("Icon").nodeValue.replace("\.png", "_a\.png"), "image");
        resourceManager.add("resources/tower/"+attrs.getNamedItem("DisabledIcon").nodeValue.replace("\.png", "\.jpg"), "image");
        resourceManager.add("resources/tower/"+attrs.getNamedItem("DisabledIcon").nodeValue.replace("\.png", "_a\.png"), "image");
    }

    resourceManager.load(start);
}

function mergeImageMask(img, mask) {
    var imgCanvas = document.createElement("canvas");
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    var imgCtx = imgCanvas.getContext("2d");
    imgCtx.drawImage(img, 0, 0);
    var imgData = imgCtx.getImageData(0, 0, img.width, img.height);

    var maskCanvas = document.createElement("canvas");
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    var maskCtx = maskCanvas.getContext("2d");
    maskCtx.drawImage(mask, 0, 0);
    var maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
    
    for( var y=0, maxY=imgData.height; y<maxY; y++ ) {
        for( var x=0, maxX=imgData.width; x<maxX; x++ ) {
            var r = maskData.data[(x + y * maxX) * 4];
            imgData.data[(x + y * maxX) * 4 + 3] = (r > 254) ? 255 : 0;
        }
    }
    imgCtx.putImageData(imgData, 0, 0);

    return imgCanvas;
}

function start() {
    trace("resource loaded, prepare to start game");

    var hud = new MovieClip("hud");
    var bottom = new MovieClip("bottom");
    bottom.y = global.GAME_HEIGHT - 128;

    global.stage.addChild(hud);
    global.stage.addChild(bottom);

    for(var i=0;i<useTowers.length; i++) {
        var conf = resourceManager.get("resources/tower/Tower_"+useTowers[i]+".arc");
        var attrs = conf.data.childNodes[1].getElementsByTagName("Weapon")[0].attributes;

        var icon = new MovieClip(useTowers[i], 2);
        var img = resourceManager.get("resources/tower/"+attrs.getNamedItem("Icon").nodeValue.replace("\.png", "\.jpg"));
        var imgMask = resourceManager.get("resources/tower/"+attrs.getNamedItem("Icon").nodeValue.replace("\.png", "_a\.png"));
        icon.addChild(new Texture(mergeImageMask(img.data, imgMask.data)));

        img = resourceManager.get("resources/tower/"+attrs.getNamedItem("DisabledIcon").nodeValue.replace("\.png", "\.jpg"));
        imgMask = resourceManager.get("resources/tower/"+attrs.getNamedItem("DisabledIcon").nodeValue.replace("\.png", "_a\.png"));
        icon.gotoAndStop(2);
        icon.addChild(new Texture(mergeImageMask(img.data, imgMask.data)));
        
        if( i<3 ) {
            icon.gotoAndStop(1);
        }
        icon.x = global.GAME_WIDTH - (useTowers.length-i) * 128;
        bottom.addChild(icon);
    }
}
