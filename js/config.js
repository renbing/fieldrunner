/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-13
 * Time: 下午2:17
 *
 */

global.GAME_WIDTH = 960;
global.GAME_HEIGHT = 640;
global.gameFPS = 25;
global.renderFPS = 60;
global.resourceDirectory = 'resources/';
global.mediaDirectory = 'resources/media/';
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

global.towers = [
    "Gatling","Glue","Missile","Flame","Lightning","Laser","Oil",
    "Beehive","Biowaste","Plasma","Pyro","Spark","Railgun","Mine",
    "Radiation","Nuke","Ice","Gas","Link","Power"
];
