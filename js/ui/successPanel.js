/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-6
 * Time: 下午5:58
 *
 */

/**
 * 成就弹窗
 * 单例
 */

(function(){

    var proto = SuccessPanelHero.prototype;
    var ITEM_PER_PAGE = 16;

    function SuccessPanelHero(mc) {
        this.mc = mc;
        this.superHeros = [];
        this.page = 0;

        this.heroNameText = this.mc.getChildByName("hero_name_text");
        this.heroExplainText = this.mc.getChildByName("explain_text");
        this.heroPhoto = this.mc.getChildByName("hero_photo");
        
        // 所有已经拥有的超级英雄
        var havedSuperHerosSet = {};
        if(global.isMyHome){
            var heros = global.dataCenter.data.heros;
        }else{
            var heros = global.dataCenter.data.visitinfo.heros;
        }
        for( var id in heros ) {
            var hero = heros[id];
            if( hero.herotype > 0 ) {
                havedSuperHerosSet[hero.herotype] = true;
            }
        }
        // 当前酒馆等级能招募的所有超级英雄
        var tavernLevel = global.sceneMyZone.buildingTavern.getLevel();
        var superHeroGrades = global.heroConfigHelper.getGradesByTavernLevel(tavernLevel);
        var allSuperHeros = global.heroConfigHelper.getSuperHerosByGrades(superHeroGrades);
        for( var i=0,max=allSuperHeros.length; i<max; i++ ) {
/*            if( allSuperHeros[i]["@attributes"].holidayhero ) {
                return;
            }*/
            var haved = allSuperHeros[i]["@attributes"].type in havedSuperHerosSet;
            this.superHeros.push({'hero' : allSuperHeros[i]["@attributes"], 'haved' : haved});
        }

        this.changePage( 0 );
    }
    /*
     * @index:  1<= index <= 所有超级英雄个数
     */
    proto.selectItem = function(index) {
        var indexInPage = index % ITEM_PER_PAGE;
        if( indexInPage == 0 ) {
            indexInPage = ITEM_PER_PAGE;
        }

        for(var i=1; i<=ITEM_PER_PAGE; i++ ) {
            var item = this.mc.getChildByName("hero_item_"+ i);
            if( indexInPage == i ) {
                item.getChildByName('bg').gotoAndStop(2);
                var superHero = this.superHeros[index - 1];
                if(superHero.haved == true){
                    this.heroNameText.setText(superHero.hero.name);
                    this.heroExplainText.setText(superHero.hero.desc);
                    this.heroNameText.setText(superHero.hero.name);
                    this.heroExplainText.setText(superHero.hero.desc);
                    this.heroPhoto.setMovieClip("hero", "hero" + superHero.hero.image);
                }
            } else {
                item.getChildByName('bg').gotoAndStop(1);
            }
        }
    };

    /*
     * @page:  0<= page < 最多翻页页数
     */
    proto.changePage = function(page) {
        if( page >= this.getPageCount() || page < 0 ) {
            return;
        }
        this.page = page;

        var superHeroCount = this.superHeros.length;
        for(var m=0,max=superHeroCount;m<max;m++){
            if(this.superHeros[m].haved == true){
                //trace([this.superHeros[m].hero.name]);
            }
        }

        this.sortHeros(this.superHeros);
        //trace(['count',superHeroCount]);//这个count数并不是所有英雄，有的英雄需要酒馆更高才能解锁
        var panel = this;

        for(var i=1; i<=ITEM_PER_PAGE; i++ ) {
            var item = this.mc.getChildByName("hero_item_"+ i);
            var index = page * ITEM_PER_PAGE + i;

            if( index > superHeroCount ) {
                item.visible = false;
            } else {
                item.visible = true;
                item.getChildByName('bg').gotoAndStop(1);
                // 需要判断是否拥有改英雄haved
                item.setOnClick( function(value) {
                    return function(e) {
                        panel.selectItem(value);
                    };
                }(index));

                var superHero = this.superHeros[index - 1];
                //item.getChildByName("hero_name_text").setText(superHero.hero.name);

                // 设置Item上英雄头像显示
                var heroBg = item.getChildByName("photo_bg");
                heroBg.setMovieClip( null );
                item.getChildByName("hero_name_text").setText('');
                if(superHero.haved == true){
                    /*heroBg.setMovieClip("hero", "hero"+superHero.hero.image, function(mc) {
                    mc.scaleX = mc.scaleY = 57/170;
                });*/
                    this.addHeroPhoto(item,superHero);
                }
            }
        }

        this.heroNameText.setText('');
        this.heroExplainText.setText('');
        this.heroPhoto.setMovieClip(null);
    };

    proto.sortHeros = function(superHeros){
        var canCallHeros = [];
        var heroA = [];
        var heroB = [];
        var heroC = [];
        var heroD = [];
        var heroS = [];
        var heroSS = [];
        var grade;
        for(var i=0,max=superHeros.length; i<max; i++){
            grade = superHeros[i].hero.grade;
            switch(grade){
                case 'D':
                    heroD.push(superHeros[i]);
                    break;
                case 'C':
                    heroC.push(superHeros[i]);
                    break;
                case 'B':
                    heroB.push(superHeros[i]);
                    break;
                case 'A':
                    heroA.push(superHeros[i]);
                    break;
                case 'S':
                    heroS.push(superHeros[i]);
                    break;
                case 'SS':
                    heroSS.push(superHeros[i]);
                    break;
            }
        }
        this.superHeros = canCallHeros.concat(heroD,heroC,heroB,heroA,heroS,heroSS);
    };

    proto.addHeroPhoto = function(item,superHero){
        item.getChildByName("hero_name_text").setText(superHero.hero.name);
        // 设置Item上英雄头像显示
        var heroBg = item.getChildByName("photo_bg");
        heroBg.setMovieClip(null);
        heroBg.setMovieClip("hero", "hero"+superHero.hero.image, function(mc) {
            mc.scaleX = mc.scaleY = 57/170;
        });
        //heroBg.addChild( item.heroPhoto );
    };

    proto.getPageCount = function() {
        var pageCount = Math.ceil(this.superHeros.length / ITEM_PER_PAGE);
        if( pageCount < 1 ) {
            pageCount = 1;
        }

        return pageCount;
    };

    proto.getPage = function() {
        return this.page;
    };

    global.SuccessPanelHero = SuccessPanelHero;
})();

(function(){

    var proto = SuccessPanelWeapon.prototype;
    var ITEM_PER_PAGE = 16;

    function SuccessPanelWeapon(mc) {
        this.mc = mc;
        this.rareItems = [];
        this.page = 0;

        this.weaponNameText = this.mc.getChildByName("weapon_name_text");
        this.weaponExplainText = this.mc.getChildByName("explain_text");

        this.armorPhoto = this.mc.getChildByName("armor_photo");
        this.weaponPhoto = this.mc.getChildByName("weapon_photo");

        // 计算英雄身上装备的所有稀有装备
        var equipedRareItems = {};
        if(global.isMyHome){
            var heros = global.dataCenter.data.heros;
        }else{
            var heros = global.dataCenter.data.visitinfo.heros;
        }
        for( var id in heros ) {
            var hero = heros[id];
            var items = [];
            if( hero.armorid > 0 && hero.armortype > 0 ) {
                items.push([hero.armorid, hero.armortype]);
            }

            if( hero.weaponid > 0 && hero.weapontype > 0 ) {
                items.push([hero.weaponid, hero.weapontype]);
            }
            for( var i=0,max=items.length; i<max; i++ ) {
                var itemType = items[i][1];
                var itemId = items[i][0];
                var rareItem = global.ItemFunction.getItemByTypeId( itemType, itemId );
                if( rareItem && rareItem["@attributes"].israre ) {
                    if( ! (itemType in equipedRareItems) ) {
                        equipedRareItems[itemType] = {}
                    }
                    equipedRareItems[itemType][itemId] = true;
                }
            }
        }
        // 获取所有稀有装备,并且判断是否拥有了(包裹中或者英雄已经装备)
        var allRareItems = [];
        global.ItemFunction.getRareItemsByType(global.ItemFunction.ITEM_TYPE_WEAPON, allRareItems);
        global.ItemFunction.getRareItemsByType(global.ItemFunction.ITEM_TYPE_ARMOR, allRareItems);
        var userLevel = global.dataCenter.getLevel();
        // 用于对稀有装备消重,因为同一稀有装备有多个品阶
        var rareItemSet = {};
        for( var i=0,max=allRareItems.length; i<max; i++ ) {
            var rareItem = allRareItems[i]["@attributes"];
            if( userLevel >= rareItem.limitlevel ) {
                var haved =  global.dataCenter.findInventoryCounter(rareItem.type, rareItem.id) > 0
                    || (rareItem.type in equipedRareItems && rareItem.id in equipedRareItems[rareItem.type]);
                var rareItemSetKey = rareItem.israre | rareItem.type << 16;
                if(rareItemSetKey in rareItemSet) {
                    if(haved == true){
                        for(var k=0,length=this.rareItems.length; k<length; k++){
                            if(this.rareItems[k].item.israre == rareItem.israre){
                                this.rareItems.splice(k,1,{'item' : rareItem, 'haved' : haved});
                            }
                        }
                    }
                    continue;
                }else{
                    this.rareItems.push({'item' : rareItem, 'haved' : haved});
                    rareItemSet[rareItemSetKey] = true;
                }
            }
        }

        this.changePage( 0 );
    }

    /*
     * @index:  1<= index <= 所有超级英雄个数
     */
    proto.selectItem = function(index) {
        var indexInPage = index % ITEM_PER_PAGE;
        if( indexInPage == 0 ) {
            indexInPage = ITEM_PER_PAGE;
        }

        for(var i=1; i<=ITEM_PER_PAGE; i++ ) {
            var item = this.mc.getChildByName("item_"+ i);
            if( indexInPage == i ) {
                item.getChildByName('bg').gotoAndStop(2);

                var rareItem = this.rareItems[index-1]; // {'item':config, 'haved':true}
                if(rareItem.haved == true){
                    this.weaponNameText.setText(rareItem.item.name);
                    this.weaponExplainText.setText(rareItem.item.desc);

                    var imagePath = "resources/icon/weapon/" + rareItem.item.iconres + ".png";
                    if( rareItem.item.type == global.ItemFunction.ITEM_TYPE_WEAPON ) {
                        this.armorPhoto.setImage(null);
                        this.weaponPhoto.setImage(imagePath);
                    } else if( rareItem.item.type == global.ItemFunction.ITEM_TYPE_ARMOR ) {
                        this.armorPhoto.setImage(imagePath);
                        this.weaponPhoto.setImage(null);
                    }
                }
            } else {
                item.getChildByName('bg').gotoAndStop(1);
            }
        }
    };

    /*
     * @page:  0<= page < 最多翻页页数
     */
    proto.changePage = function(page) {
        if( page >= this.getPageCount() || page < 0 ) {
            return;
        }
        this.page = page;

        var panel = this;
        var rareItemCount = this.rareItems.length;
        for(var i=1; i<=ITEM_PER_PAGE; i++ ) {
            var item = this.mc.getChildByName("item_"+ i);
            var index = page * ITEM_PER_PAGE + i;

            if( index > rareItemCount ) {
                item.visible = false;
            } else {
                item.visible = true;
                // 检查是否拥有
                item.getChildByName('bg').gotoAndStop(1);
                item.setOnClick( function(value) {
                    return function(e) {
                        panel.selectItem(value);
                    };
                }(index));

                var rareItem = this.rareItems[index-1]; // {'item':config, 'haved':true}
                //trace([index,rareItem,rareItem.haved])
                item.getChildByName("photo_bg").setImage(null);
                item.getChildByName("name_text").setText('');
                item.getChildByName("nothing_photo").visible = true;
                if(rareItem.haved == true){
                    this.addItemPhoto(item,rareItem);
                }
            }
        }

        this.weaponNameText.setText('');
        this.weaponExplainText.setText('');
        this.armorPhoto.setImage(null);
        this.weaponPhoto.setImage(null);
    };

    proto.addItemPhoto = function(item,rareItem){
        item.getChildByName("name_text").setText(rareItem.item.name);
        var imagePath = "resources/icon/shop/" + rareItem.item.shopicon + ".png";
        item.getChildByName("photo_bg").setImage(imagePath);
        item.getChildByName("nothing_photo").visible = false;
    };

    proto.getPageCount = function() {
        var pageCount = Math.ceil(this.rareItems.length / ITEM_PER_PAGE);
        if( pageCount < 1 ) {
            pageCount = 1;
        }
        
        return pageCount;
    };

    proto.getPage = function() {
        return this.page;
    };

    global.SuccessPanelWeapon = SuccessPanelWeapon;
})();

(function () {

    var proto = SuccessPanel.prototype;

    var mainPanel;
    var width;
    var height;

    var isShow;
    var isInited;

    var closeIcon;
    var leftBtn;
    var rightBtn;
    var pageText;
    var pageTurn;

    var knightNameText;
    var knightNumberText;
    var userPhoto;
    var knightProgressbar;

    var tabNames = ["hero", "weapon"];

    var heroPanel;
    var weaponPanel;

    var scoreConf;
    var achievement;

    function SuccessPanel() {
        isShow = false;
        isInited = false;
    }

    proto.init = function () {
        var panel = this;
        mainPanel = textureLoader.createMovieClip("window", "success_panel");

        mainPanel.setIsSwallowTouch(true);

        width = mainPanel.getWidth();
        height = mainPanel.getHeight();
        mainPanel.x = (global.GAME_WIDTH - width) / 2;
        mainPanel.y = (global.GAME_HEIGHT - height) / 2;

        closeIcon = mainPanel.getChildByName("closeIcon");
        closeIcon.setButton(true, function(e) {
            panel.hide();
        });

        leftBtn = mainPanel.getChildByName("left_btn");
        rightBtn = mainPanel.getChildByName("right_btn");
        pageText = mainPanel.getChildByName("page_text");

        knightNameText = mainPanel.getChildByName("name_text");
        knightNumberText = mainPanel.getChildByName("number_text");

        knightProgressbar = mainPanel.getChildByName("knight_progress").getChildAt(0).getChildAt(0);
        userPhoto = mainPanel.getChildByName("photo");

        for( var i=0,max=tabNames.length; i<max; i++ ) {
            var tabName = tabNames[i];
            var tab = mainPanel.getChildByName(tabName + "_btn_1")
            tab.setButton(true, function(value) {
                return function(e) {
                    panel.changeTab(value);
                };
            }(i));
            
            switch( tabName ) {
                case "hero":
                    heroPanel = new global.SuccessPanelHero(mainPanel.getChildByName("hero_panel"));
                    break;
                case "weapon":
                    weaponPanel = new global.SuccessPanelWeapon(mainPanel.getChildByName("weapon_panel"));
                    break;
                default:
                    break;
            }
        }

        mainPanel.addEventListener(Event.GESTURE_SWIPE, function(e) {
            if( e.data == Event.SWIPE_LEFT ) {
                pageTurn.next();
            } else if( e.data == Event.SWIPE_RIGHT ){
                pageTurn.prev();
            }
        });

        mainPanel.getChildByName("success_btn_1").visible = false;
        mainPanel.getChildByName("success_btn_2").visible = false;
        mainPanel.getChildByName("producer_btn_1").visible = false;
        mainPanel.getChildByName("producer_btn_2").visible = false;
        mainPanel.getChildByName("help_btn_1").visible = false;
        mainPanel.getChildByName("help_btn_2").visible = false;
/*        if(global.isMyHome){
            var achievement = global.dataCenter.data.gameinfo.achivement;
        }else{
            var achievement = global.achivementScore;
        }*/
        var achievement = global.achivementScore;
        //var scores = global.configs["config/achivement/achivement"].achivement.score;
        global.configManager.load("config/achivement/achivement", function(data) {

            var scores = data.achivement.score;
            for( var i=0,max=scores.length; i<max; i++ ) {
                if( +(scores[i]["@attributes"].value) > achievement ) {
                    break;
                }
            }

            var scoreConf = scores[i-1];
            knightNameText.setText( scoreConf["@attributes"].name );
            knightNumberText.setText( achievement );

            var progressPercent = 1;
            if( i < scores.length ) {
                // 没有达到最高值
                progressPercent = achievement / scores[i]["@attributes"].value;
            }

            knightProgressbar.sw = knightProgressbar.dw = (knightProgressbar.sw * progressPercent);
        }, true);

        this.changeTab( 0 );
        isInited = true;
    };

    proto.show = function () {
        isInited || this.init();

        isShow || global.windowManager.addChild(mainPanel);
        this.updateMainPanel();
        isShow = true;
    };

    proto.hide = function () {
        !isShow || global.windowManager.removeChild(mainPanel);
        isShow = false;
    };

    proto.toggle = function () {
        if (isShow) {
            this.hide();
        } else {
            this.show();
        }
    };

    proto.changeTab = function(index) {
        for( var i=0,max=tabNames.length; i<max; i++ ) {
            var tabName = tabNames[i];
            if( index == i ) {
                mainPanel.getChildByName(tabName + "_btn_2").visible = true;
                mainPanel.getChildByName(tabName + "_btn_1").visible = false;
                if( tabName != "success" ) {
                    mainPanel.getChildByName(tabName + "_panel").visible = true;
                }

                if( tabName == "hero" || tabName == "weapon" ) {
                    var onNext,onPrev,pageCount,pageCursor;

                    if( tabName == "weapon" ) {
                        pageCount = weaponPanel.getPageCount();
                        onNext = onPrev = weaponPanel.changePage.bind(weaponPanel);
                        pageCursor = weaponPanel.getPage();
                    } else {
                        pageCount = heroPanel.getPageCount();
                        onNext = onPrev = heroPanel.changePage.bind(heroPanel);
                        pageCursor = heroPanel.getPage();
                    }
                    pageTurn = new UIComponent.PageTurn(leftBtn, rightBtn, pageCount,
                                                        pageText, onPrev, onNext);
                    pageTurn.changePageCursor( pageCursor ); 
                }
            } else {
                mainPanel.getChildByName(tabName + "_btn_2").visible = false;
                mainPanel.getChildByName(tabName + "_btn_1").visible = true;
                mainPanel.getChildByName(tabName + "_btn_1").gotoAndStop(1);
                if( tabName != "success" ) {
                    mainPanel.getChildByName(tabName + "_panel").visible = false;
                }
            }
        }
    };

    proto.updateMainPanel = function(){
        var achievement = global.achivementScore;
        knightNumberText.setText( achievement );
        heroPanel = new global.SuccessPanelHero(mainPanel.getChildByName("hero_panel"));
        weaponPanel = new global.SuccessPanelWeapon(mainPanel.getChildByName("weapon_panel"));
        this.changeTab(0);
    }

    global.successPanel = new SuccessPanel();

})();
