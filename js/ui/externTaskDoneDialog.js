/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-20
 * Time: 下午2:23
 *
 */

(function(){

    var proto = ExternTaskDoneDialog.prototype;

    function ExternTaskDoneDialog(){
        this.width = 400;
        this.height = 200;
        //this.mc = textureLoader.createMovieClip('')
    }

    proto.showDialog = function(){
        Event.enableDrag = false;

    };

    proto.closeDialog = function(){
        Event.enableDrag = true;

    };

    proto.addBonus = function(bonus){

    };

    var protoBonus = externTaskBonus.prototype;

    function externTaskBonus(){

    }



})();
