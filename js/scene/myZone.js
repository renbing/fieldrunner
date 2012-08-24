/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-29
 * Time: 下午5:47
 *
 */

/**
 * 我的领地
 *
 * 单例模式
 *
 */
(function () {

    var citySceneWidth = 0;
    var frameCount = 0;
    var npcNumber = 10;
    var addNpcFrameCount = 60;
    var cloudSpeed = 10;//每秒云移动的距离,为正向右，为负向左

    //云:宽w，高h，位置x，位置y
    // 云 = [w0, h0, x0, y0, w1, h1, x1, y1, ... , wn, hn, xn yn]
    var CloudConfig = {
        cloud1:[305, 124, 327, 480, 202, 82, 76, 389],
        cloud2:[175, 65, 442, 110, 310, 130, 378, 278],
        cloud3:[195 , 77, 168, 217, 175 , 69, 792 , 185],
        cloud4:[174 , 56 , 56 , 38, 111, 44, 709 , 50]
    };

    var proto = MyZone.prototype;

    function MyZone() {
        this.mapNpcArr = [];
    }

    proto.init = function () {
        global.isMyHome = 1;
        this._initBackgroundMusic();
        this._initSky();
        this._initCityScene();
        this.handleSceneEnterFrame = this._handleSceneEnterFrame.bind(this);
        this.cityScene.addEventListener(Event.ENTER_FRAME, this.handleSceneEnterFrame);
    };

    function CloudFlows() {
        this.cloudLayer.x = (this.cloudLayer.x + cloudSpeed * global.loopInterval * 0.001) % global.GAME_WIDTH;
    }

    ;

    proto._initSky = function () {
        this.skyMc = new MovieClip('sky');
        var skyBg = new FillRect(0, 0, global.GAME_WIDTH, global.GAME_HEIGHT, "rgb(122,196,224)", 1);
        this.skyMc.addChild(skyBg);
        this.cloudLayer = new MovieClip('cloudLayer');
        this.skyMc.addChild(this.cloudLayer);

        for (var i = 1; i <= 4; ++i) {
            var cloudName = 'cloud' + i;
            var cloudConfig = CloudConfig[cloudName];
            if (cloudConfig) {
                for (var j = 0, configLength = cloudConfig.length / 4 | 0; j < configLength; ++j) {
                    var index = j * 4;
                    var width = cloudConfig[index];
                    var height = cloudConfig[index + 1];
                    var posX = cloudConfig[index + 2];
                    var posY = cloudConfig[index + 3];
                    var cloud = textureLoader.createMovieClip('ui', cloudName);
                    cloud.x = posX;
                    cloud.y = posY;
                    cloud.scaleX = width / cloud.getWidth();
                    cloud.scaleY = height / cloud.getHeight();
                    this.cloudLayer.addChild(cloud);

                    var cloudCopy = textureLoader.createMovieClip('ui', cloudName);
                    cloudCopy.x = posX - global.GAME_WIDTH;
                    cloudCopy.y = posY;
                    cloudCopy.scaleX = width / cloudCopy.getWidth();
                    cloudCopy.scaleY = height / cloudCopy.getHeight();
                    this.cloudLayer.addChild(cloudCopy);
                }
            }
        }

        global.gameSchedule.scheduleFunc(CloudFlows.bind(this));

        global.stage.addChild(this.skyMc);

        this.skyMc.addEventListener(Event.GESTURE_DRAG, this._onDrag.bind(this));
    };

    proto._initCityScene = function () {
        this.cityScene = new MovieClip('cityScene');
        this.npcLayer = new MovieClip('npcLayer');
        this.backNpcLayer = new MovieClip('backNpcLayer');
        this.deepNpcLayer = new MovieClip('deepNpcLayer');
        this.gameUiLayer = new MovieClip('gameUiLayer');
        this.builds = {};

        //放置城堡背景
        this.cityScene.addChild(new global.SpriteCityScene('cityscene').mc);

        //放置城堡
        this.buildingCastle = new global.BuildingCastle(this.cityScene);
        this.builds[global.BuildType.Castle] = this.buildingCastle;

        // 放置监狱
        this.buildingPrison = new global.BuildingPrison(this.cityScene);
        this.builds[global.BuildType.Prison] = this.buildingPrison;

        //放置兵营
        this.buildingBarrack = new global.BuildingBarrack(this.cityScene);
        this.builds[global.BuildType.Barrack] = this.buildingBarrack;

        //放置雕像
        this.knight = new global.SpriteKnight();
        this.cityScene.addChild(this.knight.mc);
        this.knight.update();

        //放置训练场
        this.buildingTraningfield = new global.BuildingTrainingfield(this.cityScene);
        this.builds[global.BuildType.Trainingfield] = this.buildingTraningfield;

        //放置国库
        this.buildingStore = new global.BuildingStore(this.cityScene);
        this.builds[global.BuildType.Store] = this.buildingStore;

        //放置城堡前景
        var front2 = new global.SpriteCityScene('front2').mc;
        var front3 = new global.SpriteCityScene('front3').mc;
        var front4 = new global.SpriteCityScene('front4').mc;
        front2.setUseAlphaTest(true);
        front3.setUseAlphaTest(true);
        front4.setUseAlphaTest(true);

        this.cityScene.addChild(front2);
        this.cityScene.addChild(front3);
        this.cityScene.addChild(front4);

        //放置农田后面的npc层
        this.cityScene.addChild(this.deepNpcLayer);

        //放置农田
        this.buildingFarmland = new global.BuildingFarmland(this.cityScene);

        this.builds[global.BuildType.Farmland] = this.buildingFarmland;

        //放置教堂
        this.buildingChurch = new global.BuildingChurch(this.cityScene);

        this.builds[global.BuildType.Church] = this.buildingChurch;
        //放置防具店
        this.buildingArmorshop = new global.BuildingArmorshop(this.cityScene);

        this.builds[global.BuildType.Armorshop] = this.buildingArmorshop;
        //放置武器店
        this.buildingWeaponshop = new global.BuildingWeaponshop(this.cityScene);

        this.builds[global.BuildType.Weaponshop] = this.buildingWeaponshop;
        //放置民居后面的npc层
        this.cityScene.addChild(this.backNpcLayer);

        //放置民居
        this.buildingHouse = new global.BuildingHouse(this.cityScene);

        this.builds[global.BuildType.House] = this.buildingHouse;
        //放置旅馆后面的npc层
        this.cityScene.addChild(this.npcLayer);
        this.npcLayer.count = 0;
        this.npcLayer.addEventListener(Event.ENTER_FRAME, function () {
            this.npcLayer.count++;
            if (this.npcLayer.count % global.gameFPS == 0) {
                this.npcLayer.count = 0;
                var frame = this.npcLayer.getCurrentFrame();
                frame.sort(function (a, b) {
                    return a.y >= b.y ? 1 : -1
                });
            }
        }.bind(this));

        //放置酒馆
        this.buildingTavern = new global.BuildingTavern(this.cityScene);
        this.builds[global.BuildType.Tavern] = this.buildingTavern;
        this.cityScene.y = 86 + global.GAME_HEIGHT - 768;
        global.stage.addChild(this.cityScene);
        global.stage.addChild(this.gameUiLayer);
        this.cityScene.addEventListener(Event.GESTURE_SWIPE, function (e) {
        });

        this.cityScene.addEventListener(Event.GESTURE_DRAG, this._onDrag.bind(this));
        citySceneWidth = this.cityScene.getWidth();
    };

    proto._onDrag = function (e) {
        this.cityScene.x += e.data.x;
        if (this.cityScene.x > 0) {
            this.cityScene.x = 0;
        } else if (this.cityScene.x < (global.GAME_WIDTH - citySceneWidth)) {
            this.cityScene.x = (global.GAME_WIDTH - citySceneWidth);
        }
    };

    proto._initBackgroundMusic = function () {
        global.soundManager.playBackground(new Sound('map_bgm.mp3', true));
    };

    proto._handleSceneEnterFrame = function () {
        frameCount++;

        if (this.mapNpcArr.length < npcNumber && frameCount > addNpcFrameCount) {
            frameCount = 0;
            var self = this;
            var npc = new global.SpritesMapNpc({
                callback:self._mapNpcWalkEnd.bind(self)
            });
            if (npc.cfg.npcTrack.layer == 1) {
                this.backNpcLayer.addChild(npc.mc);
                npc.mc.addEventListener(Event.ENTER_FRAME, function () {
                    if (npc.trackIndex == 58) {
                        this.backNpcLayer.removeChild(npc.mc);
                        this.deepNpcLayer.addChild(npc.mc);
                    }
                }.bind(this));
            } else {
                this.npcLayer.addChild(npc.mc);
            }
            this.mapNpcArr.push(npc);
        }
    };

    proto._mapNpcWalkEnd = function (npc) {
        if (npc.cfg.npcTrack.layer == 1) {
            this.deepNpcLayer.removeChild(npc.mc);
        } else {
            this.npcLayer.removeChild(npc.mc);
        }
        var index = this.mapNpcArr.indexOf(npc);
        if( index >= 0 ) {
            this.mapNpcArr.splice(index, 1);
        }
    };

    proto.killMyZone = function () {
        //global.gameSchedule.unScheduleAll();

        this.childrenOfStage = global.stage.getChildren();
        this.hideChildren = [];
        for (var i = 0; i < this.childrenOfStage.length; ++i) {
            if (this.childrenOfStage[i].name != 'windowManager' && this.childrenOfStage[i].name != 'testLayer') {
                this.childrenOfStage[i].visible = false;
                this.hideChildren.push(this.childrenOfStage[i]);
            }
        }

        for (var key in global.texturesConfig) {
            if (key != 'ui')
                textureLoader.unloadLibrary(key);
        }
    };

    proto.initMyZone = function () {
        var self = this;

        var processor = new LoadProcessor(function () {
            if (self.hideChildren) {
                for (var i = 0; i < self.hideChildren.length; ++i) {
                    self.hideChildren[i].visible = true;
                }
                self.hideChildren = [];
            }
            global.waitingPanel.hide();
            self._initBackgroundMusic();
        });

        for (var key in global.texturesConfig) {
            if (key != 'ui')
                textureLoader.loadLibrary(key, global.texturesConfig[key], true, processor);
        }
        processor.start();
        global.waitingPanel.show();
    };

    global.sceneMyZone = new MyZone();
})();
