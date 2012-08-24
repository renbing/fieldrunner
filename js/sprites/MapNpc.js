/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-13
 * Time: 下午4:43
 *
 */

/**
 * 城镇npc类
 *
 * 工厂
 */
(function () {

    var libraryName = 'npc';
    var STATUS_WALK = 0;
    var STATUS_STOP = 1;

    var proto = MapNpc.prototype;

    /**
     * 构造器
     * @param cfg
     */
    function MapNpc(cfg) {
        this.init(cfg);
    }

    /**
     * 初始化方法
     * @param cfg
     */
    proto.init = function (cfg) {

        this._initCfg();
        this._initMc();
        this._initTrack();
        this._initCallBack(cfg);

        this.walk();
    };

    /**
     * 初始化配置文件
     */
    proto._initCfg = function () {
        var globalCfgData = global.configs.mapnpc.data;
        var infoObj = globalCfgData.mapnpc[(Math.floor(globalCfgData.mapnpc.length * Math.random()))];
        var trackObj = globalCfgData.track[(Math.floor(globalCfgData.track.length * Math.random()))];
        var instanceCfg = {
            npcInfo:infoObj['@attributes'],
            npcTrack:trackObj['@attributes']
        };
        instanceCfg.npcTrack.pointArr = [];
        for (var n = 0, m = trackObj.point.length; n < m; n++) {
            instanceCfg.npcTrack.pointArr.push({
                x:trackObj.point[n]['@attributes'].x,
                y:trackObj.point[n]['@attributes'].y
            });
        }
        this.cfg = instanceCfg;
    };

    /**
     * 初始化MovieClip
     */
    proto._initMc = function () {
        var npcInfo = this.cfg.npcInfo;
        var npcName = npcInfo.name;
        var stopNpcName = npcInfo.stopres;
        var walkNpcName = npcInfo.walkres;
        var stopNpcMc = new MovieClip();
        stopNpcMc.addChild(textureLoader.createMovieClip(libraryName, stopNpcName));
        var walkNpcMc = new MovieClip();
        walkNpcMc.addChild(textureLoader.createMovieClip(libraryName, walkNpcName));

        stopNpcMc.flipOffsetX = walkNpcMc.flipOffsetX = npcInfo.offsetX;

        this.mc = new MovieClip(npcName);
        this.mc.addChild(stopNpcMc);
        this.mc.addChild(walkNpcMc);
        this.stopNpcMc = stopNpcMc;
        this.walkNpcMc = walkNpcMc;
        stopNpcMc.alpha = 0;
        walkNpcMc.alpha = 0;
        this.frameCount = 0;
        this.mc.addEventListener(Event.ENTER_FRAME, handleEnterFrame.bind(this));

        function handleEnterFrame() {
            this.frameCount++;
            if (this.fadeOut) {
                if (this.frameCount <= 50) {
                    walkNpcMc.alpha = stopNpcMc.alpha = (1 - this.frameCount / 50);
                } else {
                    this.callback && this.callback(this);
                }
            } else {
                if (this.frameCount <= 50) {
                    walkNpcMc.alpha = stopNpcMc.alpha = this.frameCount / 50;
                }
            }
            if (this.cfg.npcInfo.id == '30' && Math.random() < 0.0001){
                global.soundManager.playEffect('/npc/dog.mp3');
            }
            if (this.cfg.npcInfo.id == '60' && Math.random() < 0.0001){
                global.soundManager.playEffect('/npc/hen.mp3');
            }

        }
    };

    /**
     * 初始化人物路径
     */
    proto._initTrack = function () {
        var pointArr = this.cfg.npcTrack.pointArr;
        var npcInfo = this.cfg.npcInfo;
        this.trackIndex = 0;
        this.maxTrackIndex = pointArr.length - 1;
        this.mc.x = +pointArr[0].x + npcInfo.offsetX;
        this.mc.y = +pointArr[0].y + npcInfo.offsetY;
        this.ratio = 1;
        nextPoint.call(this);

        if (this.cfg.npcTrack.id == '1000') {
            this.mc.addEventListener(Event.ENTER_FRAME, handleSpecialTrack.bind(this));
        }

        function handleSpecialTrack() {
            var offset = this.trackIndex / this.maxTrackIndex;
            var direction = this.walkNpcMc.scaleX > 0 ? 1 : -1;
            var length = 0.4;
            var change = 0.55;
            if (offset > length) {
                offset = length;
            }
            var ratio = (1 - change) + (1 - offset / length) * change;
            this.stopNpcMc.scaleX = this.walkNpcMc.scaleX = ratio * direction;
            this.stopNpcMc.scaleY = this.walkNpcMc.scaleY = ratio;
            this.ratio = ratio;
        }

        /**
         * 移动到下一个点
         */
        function nextPoint() {
            if (this.trackIndex < this.maxTrackIndex) {
                if (Math.random() < 0.85) {
                    var fromPoint = pointArr[this.trackIndex];
                    var toPoint = pointArr[this.trackIndex + 1];
                    var duration = 1000 / global.gameFPS * +npcInfo.walk_need_time;
                    var specialOffset = 0;
                    if (this.cfg.npcTrack.id == '1000') {
                        specialOffset = 13;
                    }
                    this._createTween(this.mc, {
                            x:+fromPoint.x + npcInfo.offsetX * this.ratio,
                            y:+fromPoint.y + npcInfo.offsetY * this.ratio + specialOffset
                        },
                        {
                            x:+toPoint.x + npcInfo.offsetX * this.ratio,
                            y:+toPoint.y + npcInfo.offsetY * this.ratio + specialOffset
                        }, duration, nextPoint.bind(this));
                    this.trackIndex++;
                    if (fromPoint.x < toPoint.x) {
                        this._flip(true);
                    } else {
                        this._flip(false);
                    }
                } else {
                    stay.call(this);
                }
            } else {
                this.fadeOut = true;
                this.frameCount = 0;
            }
        }

        /**
         * 停留一会儿
         */
        function stay() {
            this.stop && this.stop();
            var timePerFrame = 1000 / global.gameFPS;
            var minStayTime = +this.cfg.npcInfo.min_stay_time * timePerFrame;
            var maxStayTime = +this.cfg.npcInfo.max_stay_time * timePerFrame;

            setTimeout(function () {
                this.walk();
                nextPoint.call(this);
            }.bind(this), Math.random() * (maxStayTime - minStayTime) + minStayTime);
        }
    };

    /**
     * 初始化路径走完之后的回调
     * @param cfg
     */
    proto._initCallBack = function (cfg) {
        this.callback = cfg.callback;
    };

    /**
     * 创建两点之间的动画
     * @param mc
     * @param fromPoint
     * @param toPoint
     * @param walkNeedTime
     * @param callback
     */
    proto._createTween = function (mc, fromPoint, toPoint, walkNeedTime, callback) {
        var a = global.ActSeq().add(new Tween({
            trans:Tween.SIMPLE,
            from:fromPoint.x,
            to:toPoint.x,
            duration:walkNeedTime,
            func:function () {
                mc.x = this.tween;
            }
        })).add(global.ActFunc(callback));
        a.start();

        new Tween({
            trans:Tween.SIMPLE,
            from:fromPoint.y,
            to:toPoint.y,
            duration:walkNeedTime,
            func:function () {
                mc.y = this.tween;
            }
        }).start();
    };

    /**
     * 翻转npc
     */
    proto._flip = function (isFlipped) {
        if (isFlipped) {
            this.stopNpcMc.scaleX = -1;
            this.stopNpcMc.scaleY = 1;
            this.walkNpcMc.scaleX = -1;
            this.walkNpcMc.scaleY = 1;
        } else {
            this.stopNpcMc.scaleX = 1;
            this.stopNpcMc.scaleY = 1;
            this.walkNpcMc.scaleX = 1;
            this.walkNpcMc.scaleY = 1;
        }
    };

    /**
     * npc行走
     */
    proto.walk = function () {
        this.status = MapNpc.STATUS_WALK;
        this.updateStatus();
    };

    /**
     * npc停止
     */
    proto.stop = function () {
        this.status = MapNpc.STATUS_STOP;
        this.updateStatus();
    };

    /**
     * 改变npc当前状态
     */
    proto.updateStatus = function () {
        switch (this.status) {
            case STATUS_WALK:
                this.mc.removeChild(this.stopNpcMc);
                this.mc.addChild(this.walkNpcMc);
                this.walkNpcMc.gotoAndPlay(1);
                break;
            case STATUS_STOP:
                this.mc.removeChild(this.walkNpcMc);
                this.mc.addChild(this.stopNpcMc);
                this.stopNpcMc.gotoAndPlay(1);
                break;
        }
    };

    MapNpc.STATUS_WALK = STATUS_WALK;
    MapNpc.STATUS_STOP = STATUS_STOP;

    global.SpritesMapNpc = MapNpc;

})();
