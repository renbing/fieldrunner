/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-27
 * Time: 下午6:43
 *
 */

(function () {

    var bInited = false;
    var _itemConfig = {data:{}};

    function _initItemConfig() {
        var itemConfig = global.configs["config/global/item_config"];
        var data = itemConfig.data;
        if(!data) return;
        for (var key in data) {
            if (key != 'item') {
                _itemConfig.data[key] = data[key]["@attributes"];
            } else {
                var items = data[key];
                _itemConfig.data.item = [];
                var ret = _itemConfig.data.item;
                var lastIndex = -1;
                for (var i = 0; i < items.length; ++i) {
                    var oneItem = items[i]["@attributes"];
                    oneItem.effect = items[i].effect;
                    if (lastIndex != oneItem.type) {
                        var item = {};
                        ret.push(item);
                        lastIndex = oneItem.type;
                    }
                    ret[lastIndex][oneItem.id] = oneItem;
                }
            }
        }
    }

    function getItemConfig() {
        if (!bInited) {
            _initItemConfig();
            bInited = true;
        }
        return _itemConfig;
    }

    var mapedConfig = null;

    function findItemByTypeId(type, id) {
        if( mapedConfig == null ) {
            mapedConfig = {};
            var items = global.configs["config/global/item_config"].data.item;
            for (var i = 0; i < items.length; ++i) {
                var itemType = items[i]["@attributes"].type;
                var itemId = items[i]["@attributes"].id;

                if( !(itemType in mapedConfig) ) {
                    mapedConfig[itemType] = {}
                }
                mapedConfig[itemType][itemId] = items[i];
            }
        }

        if( !(type in mapedConfig) ) {
            return null;
        }

        if( !(id in mapedConfig[type]) ) {
            return null;
        }

        return mapedConfig[type][id];
    }

    function calculateHurryup(time) {
        return global.common.second2hour(time);
    }

    if (!global.ItemFunction) global.ItemFunction = {};
    global.ItemFunction.getItemConfig = getItemConfig;
    global.ItemFunction.itemConfig = _itemConfig;
    global.ItemFunction.findItemByTypeId = findItemByTypeId;
    global.ItemFunction.calculateHurryup = calculateHurryup;
}());
