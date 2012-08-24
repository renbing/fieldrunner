/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 * altered By DeyongZ
 * add tavern dialog
 */

/**
 * 酒馆类
 *
 * 工厂模式
 *
 */
(function () {
    var proto = BuildingTavern.prototype;

    /**
     * 构造器
     * @param container
     */
    function BuildingTavern(container) {
        this.buildingName = 'tavernBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 3;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'tavernBuilding1':[1, 1, 1, 1],
            'tavernBuilding2':[1, 1, 1, 1],
            'tavernBuilding3':[1, 1, 1, 1],
            'tavernBuilding4':[1, 1, 1, 1]
        };
        this.levelPhotoHash = {
            'tavernBuilding1':1,
            'tavernBuilding2':1,
            'tavernBuilding3':2,
            'tavernBuilding4':3
        };

        global.Building.call(this, container);

        this.mc.setUseAlphaTest(true);
        this.mc.setOnClick(function () {
            if(global.isMyHome){
                global.ui.tavernDialog.showDialog();
            }
        });
    }

    proto.update = function () {
        var data = global.dataCenter.data.builds[global.BuildType.Tavern];
        if (!data) return;

        this.changeLevel(data.level);

        if( this.level > 0 ) {
            var levelMc = this.mc.getChildByName("level_photo");
            var photoLevel = this.levelPhotoHash[this.buildingConfig.upgrade[this.level].background];
            for( var i=1; i<=3; i++ ) {
                var isVisible = ( i == photoLevel );
                levelMc.getChildByName("level_" + i).visible = isVisible;
            }
        }
    }

    global.BuildingTavern = BuildingTavern;


})();
