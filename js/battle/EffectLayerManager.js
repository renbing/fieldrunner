/**
 * Created By zhaonan.
 * User: gulu
 * Date: 12-4-25
 * Time: 下午4:00
 */

/**
 * 效果层管理类
 */

(function(){
    var layer = new MovieClip();
    var proto = EffectLayerManager.prototype;
    var info;
    var skillTips;

    function EffectLayerManager()
    {
          info = textureLoader.createMovieClip('battleUI','battle_hero_tips');
          skillTips = textureLoader.createMovieClip('battleUI','battle_skill_tips');
    }

    proto.getLayer = function()
    {
        return layer;
    };

    proto.showTroopInfo = function showTroopInfo(pos,heroName,lv,numText,photo,isMonster)
    {
        pos.x -= 20;
        if(pos.x + info.getWidth() > global.GAME_WIDTH)
        {
            pos.x = global.GAME_WIDTH - info.getWidth();
        }
        if(pos.x < 0)
        {
            pos.x = 0;
        }
        info.x = pos.x;
        info.y = pos.y;
        var heroNameText = info.getChildByName("hero_name_text");
        heroNameText.setText(heroName);
        var numTF = info.getChildByName("num_text");
        numTF.setText(numText);
        var levelText = info.getChildByName("level_text");
        levelText.setText("Lv"+lv);

        var pic;
        if(!isMonster)
        {
            pic = textureLoader.createMovieClip('hero',"hero"+photo);
        }
        else
        {
            pic = new MovieClip();
            pic.setImage("resources/icon/monster/monster" + photo + ".png");
        }
        if(!pic)
        {
            pic = new MovieClip();
            pic.setMovieClip("hero","default_hero",null);
        }

        var photoContainer = info.getChildByName("photo");
        var photoPic = photoContainer.getChildAt(0);
        if(photoPic)
        {
            photoContainer.removeChild(photoContainer.getChildAt(0));
        }
        pic.scaleX = pic.scaleY = 0.5;
        photoContainer.addChild(pic);
        layer.addChild(info);
    };

    proto.hideTroopInfo = function()
    {
       layer.removeChild(info);
    };

    proto.showSkillTips = function(skillName,photo,isMonster,legionPosition,callBack,callBackObj)
    {
        var pic;
        if(!isMonster)
        {
            pic = textureLoader.createMovieClip('hero',"hero"+photo);
        }
        else
        {
            pic = new MovieClip();
            pic.setImage("resources/icon/monster/monster" + photo + ".png");
        }
        pic.name = "heroPic";
        if(!pic)
        {
            pic = new MovieClip();
            pic.setMovieClip("hero","default_hero",null);
        }
        skillTips.removeChildByName("heroPic");
        pic.scaleX = pic.scaleY = 0.5;
        pic.x = skillTips.getChildByName('photo').x;
        pic.y = skillTips.getChildByName('photo').y;
        skillTips.addChild(pic);
        skillTips.getChildByName("skill_text").setText(skillName) ;
        var targetX = 0;
        if(legionPosition == "left")
        {
            targetX = 0;
            skillTips.x = -skillTips.getWidth();
        }
        else
        {
            targetX = global.GAME_WIDTH - skillTips.getWidth();
            skillTips.x = global.GAME_WIDTH + skillTips.getWidth();
        }
        skillTips.y = global.GAME_HEIGHT - skillTips.getHeight() - 50;
        layer.addChild(skillTips);
        new Tween({
            trans:Tween.SIMPLE,
            from:skillTips.x,
             to:targetX,
             duration:500,
             func:function () {
                 skillTips.x = this.tween;
             }
        }).start();
        setTimeout(this.OnFinishHeroTips(callBack,callBackObj),1000);
//    TweenLite.to( m_skillTips, 0.5 , { x:targetX, onComplete:OnFinishHeroTips,onCompleteParams:[callBack] } );
    };

    proto.OnFinishHeroTips = function OnFinishHeroTips(callBack,callBackObj)
    {
        callBack.bind(callBackObj)();
        setTimeout(function(){layer.removeChild(skillTips);},1000);
    };

    global.EffectLayerManager = EffectLayerManager;
}());