/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-20
 * Time: 下午4:48
 *
 * 客户端数据对象
 */

// recommend
// tb_attack
// tb_building
// tb_gameinfo
// tb_herobonus
// tb_heros
// tb_inventory
// tb_jail
// tb_mission
// tb_mission_completed
// tb_mission_day
// tb_neighbor
// tb_steal
// tb_troop
// tb_user
// tb_user_mark
// tb_user_status

(function(){
    var data = {};
    var dataTable = global.dataTable;
    var formatedData = {
        'dataTable' : dataTable
    };

    var getDataType = {
        'GET_PLAYER_ID': 1000 //
    };
    var updateDataType = {
        'UPDATE_PLAYER_ID': 1000
    };

    function init(oriData){
        mountEnum();
        formatData(oriData);
    }

    function formatData(oriData){
        formatedData = oriData;
    }

    function mountEnum(){
        var key;
        for (key in getDataType){
            data[key] = getDataType[key];
        }
        for (key in updateDataType){
            data[key] = updateDataType[key];
        }
    }

    function get(type){
        switch (type){
            case getDataType.GET_PLAYER_ID:
            break;
        }
    }

    function update(type, data){
        switch (type){
            case updateDataType.UPDATE_PLAYER_ID:
            break;
        }
    }

    data.init = init;
    data.get = get;
    data.update = update;

    global.data = data;

})();
