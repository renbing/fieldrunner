/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-30
 * Time: 下午3:37
 *
 */

(function(){

    var proto = Tester.prototype;

    function Tester(){

    }

    /**
     * 测试资源用
     * @param libraryName
     */
    proto.resourceTest = function (libraryName) {
        if(!global.isInBrowser) return;

        var margin = 60;
        var countPerRow = 10;
        for (var n = 0, m = global.texturesConfig[libraryName].length; n < m; n++) {
            try {
                var testmc = this.test(libraryName, global.texturesConfig[libraryName][n]);
                testmc.addEventListener(Event.MOUSE_UP, function (e) {
                    e.stopPropagation();
                });
                testmc.addEventListener(Event.MOUSE_DOWN, function () {
                    this.parent.addChild(this);
                    trace([libraryName, this.name , this]);
                });
                this.testChild(testmc);
                var row = Math.floor(n / (countPerRow + 1));
                testmc.x = (n - row * (countPerRow + 1) + 1) * margin;
                testmc.y = (row + 1) * margin;
            } catch (e) {
                trace([libraryName, global.texturesConfig[libraryName][n] + ' failed.']);
            }
        }
        global.testLayer.visible = false;
    };

    /**
     * 测试用
     * @param mc
     */
    proto.testChild = function (mc) {
        var children = mc.getCurrentFrame();
        var child;
        for (var n = 0, m = children.length; n < m; n++) {
            child = children[n];
            if(typeof(child) == 'MovieClip')
            child.addEventListener(Event.MOUSE_DOWN, function () {
                this.parent.parent.addChild(this.parent);
                trace(['parentNode: '+this.parent.name, this.parent, 'node: ' + this.name , this]);
            });
        }
    };

    /**
     * 测试用
     * @param libName
     * @param mcName
     */
    proto.test = function (libName, mcName) {
        var testLayer = global.testLayer;
        var testLayerBtn;
        if (!testLayer) {
            testLayer = global.testLayer = new MovieClip('testLayer');
            global.stage.addChild(testLayer);
            testLayerBtn = textureLoader.createMovieClip('ui', 'harvestGoldIcon');
            global.stage.addChild(testLayerBtn);
            testLayerBtn.addEventListener(Event.MOUSE_CLICK, function () {
                testLayer.visible = !testLayer.visible;
            });
            testLayerBtn.x = 10;
            testLayerBtn.y = 10;
        }
        mcName = mcName || libName;
        var mc = textureLoader.createMovieClip(libName, mcName);
        testLayer.addChild(mc);
        mc.x = 100;
        mc.y = 100;
        roseCore.drag(mc, true);
        return mc;
    };

    global.tester = new Tester();

})();
