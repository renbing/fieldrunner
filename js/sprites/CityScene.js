/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 城堡背景类
 *
 * 工厂
 *
 */
(function() {

    var proto = SpriteCityScene.prototype;

    /**
     * 构造器
     */
    function SpriteCityScene(spriteName) {
        this._init(spriteName);
    }

    /**
     * 初始化
     * @param spriteName
     */
    proto._init = function (spriteName) {
        var spriteConfig = global.citySceneSpriteConfig;
        this.mc = textureLoader.createMovieClip('building', spriteName);
        this.mc.x = spriteConfig[spriteName][0];
        this.mc.y = spriteConfig[spriteName][1];
    };

    global.SpriteCityScene = SpriteCityScene;

})();