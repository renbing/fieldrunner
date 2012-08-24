/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-20
 * Time: 下午2:33
 *
 */

(function(){

    var proto = ExternRewardDialog.prototype;

    var maxItemCount = 4;

    function ExternRewardDialog(){
        this.width = 458;
        this.height = 421;
        this.mc = textureLoader.createMovieClip('window', 'reward_panel');
        this.mc.x = (global.GAME_WIDTH - this.width) / 2;
        this.mc.y = (global.GAME_HEIGHT - this.height) / 2;
        var self = this;
        this.mc.getChildByName('closeIcon').setButton(true, function(){
            self.closeDialog();
        });
        this.mc.getChildByName('acceptBtn').setButton(true, function(){
            self.closeDialog();
        });

        this.bonusIndex = 1;
        this.isShowing = false;
    }

    proto.setExp = function(exp){
        if(exp > 0){
            var icon = textureLoader.createMovieClip('ui', 'levelIcon1');
            this.addBonus(icon, "经验", exp);
        }
    };

    proto.setGold = function(gold){
        if(gold > 0){
            var icon = textureLoader.createMovieClip('ui', 'harvestGoldIcon2');
            this.addBonus(icon, "金币", gold);
        }
    };

    proto.setBattleNumber = function(battlernumber){
        if(battlernumber > 0){
            var icon = textureLoader.createMovieClip('ui', 'harvestEnergyIcon');
            this.addBonus(icon, "军令", battlernumber);
        }
    };

    proto.setSoldier = function(soldier){
        if(soldier > 0){
            var icon = textureLoader.createMovieClip('ui', 'soldier_icon');
            this.addBonus(icon, "士兵", soldier);
        }
    };

    proto.addItem = function(item){
        if(item && item.count > 0){
            var itemInfo = global.ItemFunction.getItemInfo(item.type, item.id);
            if(itemInfo){
                var icon = global.ItemFunction.IconDir + itemInfo.tinyicon + '.png';
                this.addBonus(icon, itemInfo.name, item.count);
            }
        }
    };



    proto.addBonus = function(icon, name, count){
        if(icon && count > 0 && this.bonusIndex <= maxItemCount){
            var item = this.mc.getChildByName('item'+this.bonusIndex);
            var photo = item.getChildByName('icon');
            var nameText = item.getChildByName('nameText');
            var numText = item.getChildByName('numText');
            if(typeof(icon) == 'string'){
                photo.setImage(icon, global.ItemFunction.DefaultTinyIcon, function(){
                    if(this._asyncImage){
                        this._asyncImage.dw = 45;
                        this._asyncImage.dh = 45;
                    }
                }.bind(photo));
            }else{
                photo.addChild(icon);
            }
            nameText.setText(name);
            numText.setText(count);
            ++this.bonusIndex;
        }
    };

    proto.showDialog = function(){
        if(!this.isShowing && this.bonusIndex > 1){
            this.isShowing = true;
            global.windowManager.addChild(this.mc);
            for(var i=this.bonusIndex; i<=maxItemCount; ++i){
                this.mc.getChildByName('item'+i).visible = false;
            }
        }
        Event.enableDrag = false;
    };

    proto.closeDialog = function(){
        if(this.isShowing){
            this.isShowing = false;
            for(var i=this.bonusIndex; i<=maxItemCount; ++i){
                this.mc.getChildByName('item'+i).getChildByName('icon').setImage();
            }
            global.windowManager.removeChild(this.mc);
            this.mc = undefined;
        }
        Event.enableDrag = true;
    };


    global.externRewardDialog = ExternRewardDialog;
})();
