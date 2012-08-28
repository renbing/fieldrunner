/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-13
 * Time: 下午2:17
 *
 */

global.GAME_WIDTH = 960;
global.GAME_HEIGHT = 640;
global.gameFPS = 60;
global.renderFPS = 60;
global.resourceDirectory = "resources/";
global.mediaDirectory = "resources/";
global.isShowRect = false;

//系统颜色定义
global.Color = {
    WHITE : "#ffffff",
    GREEN : "#00ff00",
    RED : "#ff0000",
    BLUE : "#0000ff",
    BLACK : "#000000",
    YELLOW : "#ffff00",
    PINK : "#ff00ff"
};

global.cfgs = [
    "GameTips.cfg",
    "achievements.cfg",
    "credits.cfg",
    "enemyarchetypelist.cfg",
    "shop.cfg",
    "storePurchase.cfg",
    "texteffects.cfg",
    "zones.cfg",
];

global.towers = {
    // name, turret, base
    "Gatling" : [1,0],
    "Glue" : [1,1],
    "Missile" : [0,0],
    "Flame" : [1,1],
    "Lightning" : [0,0],
    "Laser" : [1,1],
    "Oil" : [1,1],
    "Beehive" : [0,0],
    "Bio" : [1,1],
    "Plasma" : [0,0],
    "Pyro" : [1,1],
    "Spark" : [1,1],
    "Railgun" : [0,0],
    "Mine" : [0,0],
    "Radiation" : [0,0],
    "Nuke" : [0,0],
    "Ice" : [1,1],
    "Gas" : [0,0],
    "Link" : [0,0],
    "Power" : [0,0],
    "Railgun" : [1,1]
};
