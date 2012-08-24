/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 防具店类
 *
 * 工厂模式
 *
 */
(function() {

    /**
     * 构造器
     * @param container
     */

    var proto = BuildingArmorshop.prototype;

    function BuildingArmorshop(container) {

        this.buildingName = 'armorshopBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 8;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'armorshopBuilding1': [1,1,1]
        };

        global.Building.call(this, container);
        this.mc.addEventListener(Event.MOUSE_CLICK, function() {
            if(global.isMyHome){
                global.armorshopPanel.show();
            }
        });
    }

    proto.update = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return; }

        this.changeLevel(data.level);
    };

    global.BuildingArmorshop = BuildingArmorshop;

})();
