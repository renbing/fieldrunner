/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-16
 * Time: 下午3:50
 *
 */

/**
 * 建筑基类
 *
 * 0王城 1民居 2兵营 3酒馆 4教堂医院 5国库 6训练场 7武器商 8防具商 9农田 10监狱 11商会
 */
(function () {

    global.BuildType = {
        Castle:0,
        House:1,
        Barrack:2,
        Tavern:3,
        Church:4,
        Store:5,
        Trainingfield:6,
        Weaponshop:7,
        Armorshop:8,
        Farmland:9,
        Prison:10
    };

    /**
     * 构造器
     * @param container
     */
    function Building(container) {
        this.addTopTip = addTopTip;
        this.delTopTip = delTopTip;
        this.dropTopTip = dropTopTip;
        this.upgrade = upgrade;
        this.changeLevel = changeLevel;
        this.getLevel = getLevel;
        this.getUpgradeConfigs = getUpgradeConfigs;
        this.changeAppearance = changeAppearance;

        initCfg(this, container);
        initMc(this);
        
        this.update && this.update();
    }

    /**
     * 初始化实例配置
     * @param instance
     * @param container
     */
    function initCfg(instance, container) {
        var config = global.configs[instance.configFileName].main;
        instance.buildingConfig = {};
        instance.buildingConfig.info = config.build[instance.buildingType]['@attributes'];
        instance.buildingConfig.upgrade = {};
        for (var n = 0, m = config.upgrade.length; n < m; n++) {
            if (config.upgrade[n]['@attributes'].buildtype == instance.buildingType) {
                instance.buildingConfig.upgrade[config.upgrade[n]['@attributes'].level] = config.upgrade[n]['@attributes'];
            }
        }
        instance.name = instance.buildingConfig.info.name;
        instance.level = 1;
        instance.maxLevel = instance.buildingConfig.info.fulllevel;
        instance.container = container ? container : global.stage;
    }

    global.buildingList = [];
    /**
     * 初始化movieclip
     * @param instance
     */
    function initMc(instance) {
        if( instance.buildingName == 'prisonBuilding' ) {
            // 监狱特殊处理
            instance.mc = new MovieClip('prisonBuilding');
            for( var i=0, max=global.prisonBuildingConfig.length; i<max; i++ ) {
                var config = global.prisonBuildingConfig[i]; 
                var child = textureLoader.createMovieClip('building', config[0]);
                child.x = config[1];
                child.y = config[2];
                instance.mc.addChild(child);
            }
            instance.container.addChild(instance.mc);
        } else {
            var citySceneCfg, buildingCfg;
            citySceneCfg = global.citySceneBuildingConfig;
            for (var n = 0, m = citySceneCfg.length; n < m; n++) {
                if (citySceneCfg[n][0] != instance.buildingName) {
                    continue;
                }
                
                buildingCfg = citySceneCfg[n];
                instance.mc = textureLoader.createMovieClip('building', instance.buildingName);
                instance.container.addChild(instance.mc);
                instance.mc.x = buildingCfg[1];
                instance.mc.y = buildingCfg[2];
                instance.citySceneCfg = citySceneCfg[n];

    //            roseCore.drag(instance.topTip.mc, true);
    //            instance.addTopTip("message_icon", instance, collect);

            }
        }
        changeLevel.call(instance, 0);
        global.buildingList.push(instance);
    }

    function collect() {
        this.dropTopTip();
    }

    /**
     * 改变建筑物等级
     */
    function changeLevel(level) {
        this.level = level;
        if (level < 1) {
            this.mc.visible = 0;
        } else {
            this.mc.visible = true;
            if( this.buildingName == 'prisonBuilding' ) {
                // 监狱特殊处理
                return;
            } else {
                var displayArr = this.levelDisplayHash[this.buildingConfig.upgrade[this.level].background];
                var movieClips = this.mc.getCurrentFrame();
                for (var n = 0, m = displayArr.length; n < m; n++) {
                    movieClips[n].visible = displayArr[n];
                }
            }
        }
    }

    function getLevel() {
        return this.level;
    }

    /**
     * 升级
     */
    function upgrade() {
        if (this.level >= this.maxLevel) {
            return;
        }
        this.level++;
        this.changeLevel(this.level);
    }

    function getUpgradeConfigs() {
        return this.buildingConfig.upgrade;
    }

    /**
     * 测试用，改变外观
     * @param displayArr
     */
    function changeAppearance(displayArr) {
        displayArr = displayArr || [];
        var movieClips = this.mc.getCurrentFrame();
        for (var n = 0, m = displayArr.length; n < m; n++) {
            movieClips[n].visible = displayArr[n];
        }
    }

    /**
     * 添加顶部闪烁图标
     * @param linkname 图标在配置文件中的名字
     * @param onClickCallback 被点击时的回调方法
     */
    function addTopTip(linkname, callbackobj, onClickCallback) {
        this.delTopTip(); 
        if (!this.topTip && this.citySceneCfg.length > 4 && linkname) {
            var topTip = this.topTip = new global.TopTip(linkname, callbackobj, onClickCallback);

            if (topTip) {
                topTip.mc.x = this.citySceneCfg[3];
                topTip.mc.y = this.citySceneCfg[4];
                this.mc.addChild(topTip.mc);
                return topTip;
            }
        }
    }

    function changeTopTip(linkname, callbackobj, onClickCallBack) {
        if (this.topTip && linkname && this.topTip != linkname) {
            this.topTip.changeAnimation(linkname);
            this.topTip.setCallback(callbackobj, onClickCallBack);
        }
    }

    /**
     * 删除顶部闪烁图标
     */
    function delTopTip() {
        if (this.topTip) {
            this.topTip.mc.removeFromParent();
            this.topTip = null;
        }
    }

    function dropTopTip(callback) {
        var self = this;
        if (this.topTip) {
            this.topTip.setCallback(null);
            var dropX = new Tween({
                trans:Tween.SIMPLE,
                from:this.topTip.mc.x,
                to:this.topTip.mc.x - 100,
                duration:600,
                func:function () {
                    self.topTip.mc.x = this.tween;
                }
            });
            var dropY = new Tween({
                trans:Tween.STRONG_EASE_IN,
                from:this.topTip.mc.y,
                to:this.topTip.mc.y + 100,
                duration:600,
                func:function () {
                    self.topTip.mc.y = this.tween;
                }
            });

            var drop = global.ActSpawn().add(dropX).add(dropY);

            var flyX = Tween({
                trans:Tween.SIMPLE,
                from:this.topTip.mc.x-100,
                to:this.topTip.mc.x - 200,
                duration:1000,
                func:function () {
                    self.topTip.mc.x = this.tween;
                }
            });

            var flyY = Tween({
                trans:Tween.REGULAR_EASE_IN,
                from:this.topTip.mc.y+100,
                to:this.topTip.mc.y - 1000,
                duration:1000,
                func:function () {
                    self.topTip.mc.y = this.tween;
                }
            });

            var fly = global.ActSpawn().add(flyX).add(flyY);

            var seq = global.ActSeq().add(drop).add(fly);
            if(callback){
                seq.add(global.ActFunc(callback));
            }
            seq.start();
        }
    }

    global.Building = Building;

    global.controller.buildingController = {update:function(build){
        if(!build) return;
        var oldBuilds = global.dataCenter.data.builds;
        global.dataCenter.data.builds[build.type] = build;
        for(var key in oldBuilds){
            if(oldBuilds[key].type == build.type){
                oldBuilds[key] = build;
                global.sceneMyZone.builds[build.type].update();
                break;
            }
        }
    }};
})();
