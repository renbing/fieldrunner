/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-7
 * Time: 下午2:47
 *
 */

/**
 * 初始化预加载器
 *
 * 单例
 */
(function () {

    var proto = PreLoader.prototype;

    function PreLoader() {
        this.textureFinished = false; //纹理等载入标识
        this.serverFinished = false; //服务器载入完毕标识
        this.loadProcessor = null;
        this.started = false;
    };
    
    /* 开始预加载
     * 不可重入
     */
    proto.start = function( onAllLoaded ) {
        if( this.started ) {
            return;
        }

        this.onAllLoaded = onAllLoaded;

        // 先加载Loading显示动画素材
        this.loadProcessor = new LoadProcessor( this._onStart.bind(this) );
        textureLoader.preload(global.loadingConfig, this.loadProcessor);
        this.loadProcessor.start();
    };

    proto._onStart = function() {
        global.uiLoading.init();
        this.loadProcessor = new LoadProcessor(this._onAllLoaded.bind(this), this._onLoaded.bind(this));
        
        // 加载初始化数据
        this.loadProcessor.deliveryPackage();
        global.NetManager.uid = global.NetManager.platformId;
        global.NetManager.callWithoutWaiting("Player", "init", {"ref_id":0, "user":"{\"uid\":1257,\"name\":\"1\",\"headpic\":\"\",\"ismale\":\"0\",\"friends\":[\"lj28\",\"\",\"2\",\"1\",\"4300\",\"2008\",\"572\",\"117\",\"18\",\"911911\",\"1996\"]}", "platform":"renren", "flashVersion":"11.1.102.63"},
            this._onDataInited.bind(this)
        );

        // 加载游戏逻辑配置文件

        configLoader.preload(global.gameConfig, this.loadProcessor);

        // 加载游戏需要预加载的素材,图片
        textureLoader.preload(global.texturesConfig, this.loadProcessor);
        // 加载战斗场景需要素材，图片
        textureLoader.preload(global.battleTexturesConfig, this.loadProcessor);

        this.loadProcessor.start();
    };

    /**
     * 显示加载进度
     */
    proto._onLoaded = function() {
        global.uiLoading.updatePercent(this.loadProcessor.getProgressPercent());
    };


    /**
     * 所有资源载入完毕后的回调
     */
    proto._onAllLoaded = function () {
        global.uiLoading.remove();

        textureLoader.unloadLibrary('loading');
        this.onAllLoaded && this.onAllLoaded();
    };

    /**
     * 服务器数据回调，如果素材载入完毕就执行回调
     * @param retData
     */
    proto._onDataInited = function (retData) {
        global.NetManager.authTime = 1;

        if (retData.code == 0) {
            if (retData.data) {
                global.dataCenter.data = retData.data;
                global.common.timeDiff = retData.data.servertime - global.common.getLocalTime();
                global.NetManager.uid = retData.data.uid;
                global.NetManager.uid_sn = retData.data.uid + 1;
                global.NetManager.authTime = retData.data.auth_time;
                global.NetManager.authKey = retData.data.auth_key;
                global.NetManager.un = retData.data.playerinfo.un;
                global.NetManager.headpic = retData.data.playerinfo.headpic;
                this.serverFinished = true;
                if (this.textureFinished) {
                    this._onAllLoaded();
                }
            }
            else {
            }
        } else {
        }
        
        this.loadProcessor.loadSuccess();
    };

    global.preLoader = new PreLoader();

})();
