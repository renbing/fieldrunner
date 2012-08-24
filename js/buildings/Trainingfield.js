/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 训练场类
 *
 * 工厂模式
 *
 */
(function () {

    var BuildType = 6;


    var proto = BuildingTrainingfield.prototype;

    /**
     * 构造器
     * @param container
     */
    function BuildingTrainingfield(container) {
        this.buildingName = 'trainingfieldBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = BuildType;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'trainingfieldBuilding1':[1]
        };
        global.Building.call(this, container);

        var self = this;
        this.mc.setUseAlphaTest(true);
        this.mc.setOnClick( function () {
            if(global.isMyHome){
                global.ui.trainningfeildDialog.showDialog();
            }
        });

        this.trainingHeros = [];
        var heros = global.dataCenter.data.heros;
        for(var key in heros){
            var heroInfo = heros[key];
            if(heroInfo.trainingtype){
                this.trainingHeros.push(heroInfo);
            }
        }

        var spriteName = 'trainingfield_soldier';
        var spriteConfig = global.citySceneSpriteConfig;
        this.processingMc = textureLoader.createMovieClip('building', spriteName);
        container.addChild(this.processingMc);
        this.processingMc.x = spriteConfig[spriteName][0];
        this.processingMc.y = spriteConfig[spriteName][1];
        this.inProcessing(false);
        this.onSecond = this._onSeond.bind(this);
        global.gameSchedule.scheduleFunc(this.onSecond, 1000);

    }

    proto.update = function () {
        var data = global.dataCenter.data.builds[BuildType];
        if (!data) {
            return;
        }
        this.changeLevel(data.level);
        this.delTopTip();
    };

    proto.inProcessing = function (isProcessing) {
        if (isProcessing) {
            this.processingMc.visible = 1;
        } else {
            this.processingMc.visible = 0;
        }
    };

    proto._onSeond = function(){

        var bAllFinished = true;
        for(var i=0; i<this.trainingHeros.length; ++i){
            var heroInfo = this.trainingHeros[i];
            if(heroInfo.endtrainingtime > global.common.getServerTime() ){
                bAllFinished = false;
                break;
            }
        }

        if(bAllFinished){
            this.inProcessing(false);
            if(this.trainingHeros.length) {
                if(!this.topTip && global.isMyHome)
                    this.addTopTip('harvest_hero_icon');
            }else{
                this.delTopTip();
            }
        }else{
            this.inProcessing(true);
            this.delTopTip();
        }
    };

    proto.addTrainingHero = function(hero){
        if(!hero) return;

        this.trainingHeros.push(hero);
    };

    proto.removeFromTrainingHerosList = function(hero){
        var index  = -1;
        for(var i=0; i<this.trainingHeros.length; ++i){
            if(this.trainingHeros[i].heroid == hero.heroid){
                index = i;
                break;
            }
        }

        if(index >= 0){
            this.trainingHeros.splice(index, 1);
        }
    }

    global.BuildingTrainingfield = BuildingTrainingfield;

})();
