/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-27
 * Time: 下午5:57
 *
 */

/**
 * 武器店类
 *
 * 工厂模式
 *
 */
(function() {

    /**
     * 构造器
     * @param container
     */

    var proto = BuildingWeaponshop.prototype;

    function BuildingWeaponshop(container) {

        this.buildingName = 'weaponshopBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 7;
        this.buildingConfig = {};
        this.levelDisplayHash = {
            'weaponshopBuilding1': [1,1,1]
        };

        global.Building.call(this, container);

        this.mc.addEventListener(Event.MOUSE_CLICK, function() {
            if(global.isMyHome){
                global.weaponshopPanel.show();
            }
        });
    }

    proto.update = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return; }

        this.changeLevel(data.level);
    };

    global.BuildingWeaponshop = BuildingWeaponshop;

})();
