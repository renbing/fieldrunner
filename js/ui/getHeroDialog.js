/**
 * Created by DeyongZ
 * User: DeyongZ
 * Date: 12-4-23
 * Time: 下午1:27
 *
 */

(function () {
    var proto = GetHeroDialog.prototype;

    var lessFactor = 0.92; //英雄平均属性的这个倍数为较差值
    var highFactor = 1.02; //英雄平均属性的这个倍数为较好值

    function _setColorByAttr(text, attr, value) {
        var less = attr * lessFactor;
        var high = attr * highFactor;
        var arrow = text.arrow;
        text.parent.removeChild(arrow);
        text.arrow = null;
        if (value < less) {
            text.setColor(global.Color.GREEN);
            text.arrow = textureLoader.createMovieClip('window_pub', 'tavern_excite_down_arrow');
            text.arrow.x = text.x + 28;
            text.arrow.y = text.y;
            text.parent.addChild(text.arrow);
        } else if (value > high) {
            text.setColor(global.Color.RED);
            text.arrow = textureLoader.createMovieClip('window_pub', 'tavern_excite_up_arrow');
            text.arrow.x = text.x + 28;
            text.arrow.y = text.y;
            text.parent.addChild(text.arrow);
        } else {
            text.setColor(global.Color.WHITE);
        }
    }

    function GetHeroDialog(hero) {
        this.hero = hero;
        this.isShowing = false;
        this.width = 446;
        this.height = 338;
        this.mc = textureLoader.createMovieClip('window_pub', 'summon_hero_panel');
        this.mc.getChildByName('accept_btn').setButton(true, this.closeDialog.bind(this));
        this.mc.x = (global.GAME_WIDTH - this.width) / 2;
        this.mc.y = (global.GAME_HEIGHT - this.height) / 2;
        if (hero) {
            this.mc.getChildByName('hero_photo').setMovieClip('hero', 'hero' + hero.image, function(heroMovie){
                if(hero.herotype != 0){
                    var star = textureLoader.createMovieClip('window_pub', 'superHero_star');
                    heroMovie.addChild(star);
                }
            });

            var grade = this.mc.getChildByName('hero_grade_icon');
            grade.gotoAndStop(global.heroConfigHelper.getGradeLevel(hero.grade));
            this.mc.getChildByName('level_text').setText(hero.herolevel);
            this.mc.getChildByName('name_text').setText(hero.heroname);
            var attackText = this.mc.getChildByName('attack_text');
            var weaponText = this.mc.getChildByName('weapon_text');
            var luckyText = this.mc.getChildByName('lucky_text');
            var barrackText = this.mc.getChildByName('barrack_text');

            var troopInfo = global.configHelper.getTroopByClassId(hero.corpstype);
            var name = troopInfo['@attributes'].name;
            barrackText.setText(name);

            var average = global.getHeroAvarate(hero.grade).value;
            attackText.setText(hero.attack);
            _setColorByAttr(attackText, average, hero.attack);
            weaponText.setText(hero.defense);
            _setColorByAttr(weaponText, average, hero.defense);
            luckyText.setText(hero.luck);
            _setColorByAttr(luckyText, average, hero.luck);
        }
    }

    proto.showDialog = function () {
        if (!this.isShowing) {
            this.isShowing = true;
            global.windowManager.addChild(this.mc);
        }
        Event.enableDrag = false;
    };

    proto.closeDialog = function () {
        if (this.isShowing) {
            this.isShowing = false;
            this.mc.getChildByName('hero_photo').setMovieClip();
            global.windowManager.removeChild(this.mc);
            this.mc = undefined;
        }
        Event.enableDrag = true;
    };

    global.getHeroDialog = GetHeroDialog;

})();
