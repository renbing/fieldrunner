/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 成就雕像类
 *
 * 工厂
 *
 */
(function() {

    var proto = SpriteKnight.prototype;

    /**
     * 构造器
     */
    function SpriteKnight() {

        var spriteName = 'knight';
        var spriteConfig = global.citySceneSpriteConfig;

        this.mc = textureLoader.createMovieClip('building', spriteName); //这个纹理打包在building库中
        this.mc.x = spriteConfig[spriteName][0];
        this.mc.y = spriteConfig[spriteName][1];
        this.mc.visible = false;

        this.mc.addEventListener(Event.MOUSE_CLICK, function(e) {
            global.successPanel.show(); 
        });
    };

    proto.update = function() {
        var achievement = global.dataCenter.data.gameinfo.achivement;
        var heros = global.dataCenter.data.heros;
        var inventory = global.dataCenter.data.inventory;
        var score = 0;
        var inventoryinfo;
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
        global.achivementScore = score;
        global.configManager.load("config/achivement/achivement", function(data) {
            var scores = data.achivement.score;
            for( var i=0,max=scores.length; i<max; i++ ) {
                if( +(scores[i]["@attributes"].value) > score ) {
                    break;
                }
            }
            this.mc.visible = true;
            this.mc.gotoAndStop(i);
        }.bind(this), true);
    };

    global.SpriteKnight = SpriteKnight;

})();
