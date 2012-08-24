/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-29
 * Time: 下午5:19
 *
 */

/**
 * loading界面
 *
 * 单例
 * 
 */
(function (){

    var proto = LoadingUI.prototype;

    function LoadingUI(){
    }

    proto.init = function(){
        this.loadingMc = textureLoader.createMovieClip('loading', 'loading');
        this.loadingMc.x = (global.GAME_WIDTH - this.loadingMc.getWidth()) / 2;
        this.loadingMc.y = (global.GAME_HEIGHT - this.loadingMc.getHeight()) / 2;
        this.loadingMc.gotoAndStop(1);

        this.progressBar = this.loadingMc.getChildByName('bar').getChildAt(0).getChildAt(0);
        this.progressBarWidth = this.progressBar.dw;
        this.updatePercent(0);

        global.stage.addChild(this.loadingMc);
    };

    proto.remove = function (){
        global.stage.removeChild(this.loadingMc);
        this.progressBar = null;
        this.loadingMc = null;
    };

    proto.updatePercent = function (value){
        this.progressBar.sw = this.progressBar.dw = this.progressBarWidth * (value/100); 
    };

    global.uiLoading = new LoadingUI();
    
})();
