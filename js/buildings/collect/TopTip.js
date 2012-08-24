/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-20
 * Time: 上午10:58
 *
 */

/** 顶部提示按钮，主要用于漂浮在对象头顶，以提示该物体具有某种状态，点击之后有些能够有所行为
 * 主要用于建筑物的收取状态
 */
(function()
{
    var libname = "ui";

    /**
     * 构造器
     * 只能是ui文件夹下面的图片能够作为顶部提示按钮
     */
    function TopTip(linkname, callbackobj, callbackfunc){
        this.linkname = linkname;
        this.mc = textureLoader.createMovieClip(libname, linkname);
        this.callbackobj = callbackobj;
        this.callbackfunc = callbackfunc;
        this.mc.addEventListener(Event.MOUSE_CLICK, this.handleOnClick.bind(this));
    }

    TopTip.prototype.handleOnClick = function(e){
        if(this.callbackfunc){
            if(this.callbackobj){
                this.callbackfunc.call(this.callbackobj, e);
            }else{
                this.callbackfunc(e);
            }
        }
        e.stopPropagation();//防止事件传递到父节点上面
    };

    TopTip.prototype.setCallback = function(callbackObj, callbackfunc){
        this.callbackfunc = callbackfunc;
        this.callbackobj = callbackObj;
    };

    TopTip.prototype.changeAnimation = function(linkname){
        if(linkname && this.linkname!= linkname){
            this.linkname = linkname;
            var newAni = textureLoader.createMovieClip(libname, linkname);
            if(newAni){
                newAni.x = this.mc.x;
                newAni.y = this.mc.y;
                newAni.scaleX = this.mc.scaleX;
                newAni.scaleY = this.mc.scaleY;
                newAni.alpha = this.mc.alpha;
                newAni.isStop = this.mc.isStop;
                this.mc.parent.addChild(newAni);
                this.mc.removeFromParent();
                return true;
            }
        }
        return false;
    };

    TopTip.prototype.removeSelf = function(){
        this.mc.removeFromParent();
    };


    global.TopTip = TopTip;

})();
