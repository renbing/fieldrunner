/**
 * Created by Bing Ren
 * User: Bing Ren
 * Date: 12-4-11
 * Time: 下午5:57
 *
 */

/**
 * 监狱
 *
 * 工厂模式
 *
 */
(function() {

    /**
     * 构造器
     * @param container
     */

    var proto = BuildingPrison.prototype;

    function BuildingPrison(container) {

        this.buildingName = 'prisonBuilding';
        this.configFileName = 'config/city/building';
        this.buildingType = 10;
        this.buildingConfig = {};

        global.Building.call(this, container);

        this.mc.addEventListener(Event.MOUSE_CLICK, function() {
        });
    }

    proto.update = function() {
        var data = global.dataCenter.data.builds[this.buildingType];
        if( !data ) { return; }
        
        // 根据监狱等级显示
        var config = this.buildingConfig.upgrade[data.level];
        var jailDatas = global.dataCenter.data.jail;
        var prisonerPos = {};
        for( var prisoner in jailDatas ) {
            var jailData = jailDatas[prisoner];
            prisonerPos[jailData.pos] = jailData;
        }

        for( var i=0; i<=3; i++ ) {
            var backgroundName = 'background' + (i ? i : '');
            if( config[backgroundName] ) {
                this.mc.getChildAt(i).visible = true;
                this.mc.getChildAt(i).gotoAndStop(1);
                (function(index){
                    if(!(index in prisonerPos) && global.isMyHome){
                        this.mc.getChildAt(index).setOnClick(function(e) {
                            if(global.isMyHome){
                                global.occupantPanel.show();
                            }
                        });
                    }
                }.bind(this))(i);
            }else{
                this.mc.getChildAt(i).visible = false;
            }
        }

        this.changeLevel(data.level);

        if( jailDatas ) {
            for( var prisoner in jailDatas ) {
                var jailData = jailDatas[prisoner];
                var prisonMC = this.mc.getChildAt(jailData.pos).getChildByName('prison');
                if(jailData.status == 0){
                    this.mc.getChildAt(jailData.pos).gotoAndStop(1);
                    if(!prisonMC) continue;
                    prisonMC.getChildByName('name_text').setText(jailData.un);
                    prisonMC.getChildByName('photo').setImage(jailData.headpic);
                    (function(prisoner,name,pic){
                        this.mc.getChildAt(jailData.pos).setOnClick(function(e) {
                            if(global.isMyHome && prisoner){
                                global.visitFriend.visit(prisoner,name,pic,false);
                            }
                        });
                    }.bind(this))(prisoner,jailData.un,jailData.headpic);
                }else{
                    if(!prisonMC) continue;
                    prisonMC.getChildByName('name_text').setText('');
                    prisonMC.getChildByName('photo').setImage('');
                    this.mc.getChildAt(jailData.pos).setOnClick(function(e) {
                        if(global.isMyHome){
                            global.occupantPanel.show();
                        }
                    });
                    if(jailData.status == 1){
                        this.mc.getChildAt(jailData.pos).gotoAndStop(2);
                    }else{
                        this.mc.getChildAt(jailData.pos).gotoAndStop(3);
                    }

                }
                /*arvesttime: 0
                headpic: "http://10.253.48.37/pic/9.jpg"
                level: null
                occupyharvest: 1334315433
                pos: 0
                prisoner: 718
                status: 0
                u: "1257"
                un: "杨千宇"
                */
            }
        }
    }

    global.BuildingPrison = BuildingPrison;

})();
