/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 国库类
 *
 * 工厂模式
 *
 */
(function() {

    /**
     * 构造器
     * @param container
     */

    var proto = BuildingStore.prototype;

    function BuildingStore(container) {

        this.buildingName = 'storeBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 5;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'storeBuilding1': [1]
        };

        global.Building.call(this, container);
        
        var building = this;

        this.mc.setOnClick(function() {
            var bankLevel = global.dataCenter.getBuildByType(this.buildingType).level;
            var maxGoldLimit = global.configHelper.getGoldLimit(bankLevel);
            var tips = building.name + 'Lv' + bankLevel + ',金币最大上限' + maxGoldLimit + ',现在是否升级';
            if(global.isMyHome){
                global.dialog(tips, {
                    type:global.dialog.DIALOG_TYPE_CONFIRM,
                    closeDelay:0,
                    okFunc: function() {
                        if(global.isMyHome){
                            global.ui.uiBuildDialog.show(building.buildingType);
                        }
                    },
                    cancelFunc: function() {
                    }
                });
            }
        }.bind(this));
    }

    proto.update = function() {
        var data = global.dataCenter.getBuildByType(this.buildingType);
        if( !data ) { return; }

        this.changeLevel(data.level);
    };

    global.BuildingStore = BuildingStore;

})();
