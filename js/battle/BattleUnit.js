/**
 * Created by ZHAO NAN
 * User: gulu
 * Date: 4/24/12
 * Time: 12:07 PM
 */

/**
 * 作战单位类，单个兵种
 */

(function () {

    var proto = BattleUnit.prototype;

    function BattleUnit(data) {
        this.unitIndex = data.index;
        this.isAttack = data.isAttack;
        this.displayObject = new MovieClip();
        this.callBackFn = function(){};
        var libName = data.isSoldier ? "soldier" : "monster";
//        var libName = global.BattleManager.getMaterialLib(data.name + "_run");
//        if(!libName)
//        {
//            trace("can't find " + data.name + "_run in libs" );
//           libName = "soldier";
//            data.name = "archer";
//        }
        this.runMc = new MovieClip();
        this.runMc.addChild(textureLoader.createMovieClip(libName, data.name + "_run"));
        this.atkMc = new MovieClip();
        this.atkMc.addChild(textureLoader.createMovieClip(libName, data.name + "_atk"));
        this.playedFrameCount = 0;
        this.hurtMc = new MovieClip();
        this.hurtMc.addChild(textureLoader.createMovieClip(libName, data.name + "_hurt"));
        if(!this.isAttack)
        {
            this.runMc.scaleX = -1;
            this.atkMc.scaleX = -1;
            this.hurtMc.scaleX = -1;
            this.runMc.x += this.runMc.getWidth();
            this.atkMc.x += this.atkMc.getWidth();
            this.hurtMc.x += this.hurtMc.getWidth();
        }
        this.displayObject.addChild(this.runMc);

        this.atkMc.addEventListener(Event.ENTER_FRAME, this._handleEnterFrame.bind(this));
        this.hurtMc.addEventListener(Event.ENTER_FRAME, this._handleEnterFrame.bind(this));

    }

    proto.setCallback = function(fn)
    {
         this.callBackFn = fn;
    };

    proto._handleEnterFrame = function(e)
    {
        this.playedFrameCount += 0.42;

        if (this.playedFrameCount >= this.displayObject.getChildAt(0).getChildAt(0).totalFrames) {
            this.playAction("run");
            this.callBackFn();
        }
    };

    proto.playAction = function (type)
    {
        this.playedFrameCount = 0;
        this.displayObject.removeChild(this.displayObject.getChildAt(0));
        var mc;
        switch (type) {
            case "attack":
                mc = this.atkMc;
                break;
            case "hurt":
                mc = this.hurtMc;
                break;
            case "run":
                mc = this.runMc;
                break;
        }
        this.displayObject.addChild(mc);
        mc.gotoAndPlay(1);
    };

    proto.kill = function()
    {
        this.atkMc.removeEventListener(Event.ENTER_FRAME, this._handleEnterFrame);
        this.hurtMc.removeEventListener(Event.ENTER_FRAME, this._handleEnterFrame);
        this.displayObject.removeChild(this.displayObject.getChildAt(0));
        this.runMc = null;
        this.atkMc = null;
        this.hurtMc = null;
        this.displayObject = null;
    };
    global.BattleUnit = BattleUnit;
})();