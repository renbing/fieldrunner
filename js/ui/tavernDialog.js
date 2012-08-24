/**
 * create by DeyongZ
 * author: DeyongZ
 * date: 2012/04/16
 */
(function () {
    //雇佣英雄弹窗
    var _dialog = {
        isShowing:false,
        width:600,
        height:400,
        heroItemCount:3,
        less:0.92, //英雄平均属性的这个倍数为较差值
        high:1.02, //英雄平均属性的这个倍数为较好值
        showDialog:showHireHeroDialog,
        closeDialog:closeHireHeroDialog
    };

    function _getHeroInfos() {
        if (global.dataCenter) {
            var heroes = global.dataCenter.data.heros;
            var ret = [];
            for (var heroid in heroes) {
                if (heroes[heroid].status == 0) {
                    ret.push(heroes[heroid]);
                }
            }
            return ret;
        }
    }

    function _getHeroHireItem(index) {
        if (_dialog.isShowing) {
            return _dialog.mc.getChildByName('item' + index);
        }
    }

    function _setColorByAttr(text, attr, value) {
        if (_dialog.isShowing) {
            var less = attr * _dialog.less;
            var high = attr * _dialog.high;
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
    }

    // 更新热闹度
    function _updateHotValue() {
        var hotValue = global.dataCenter.data.builds[global.BuildType.Tavern].workdata;
        var maxValue = 50;
        var progressBarTexture = _dialog.progressBar.getChildAt(0).getChildAt(0);
        var length = hotValue / maxValue * 207;
        progressBarTexture.sw = length;
        progressBarTexture.dw = length;

    }

    function _updateHireHeroDialog() {
        _updateHotValue();
        var heroes = _getHeroInfos();
        if (heroes) {
            for (var i = 0; i < _dialog.heroItemCount; ++i) {
                var heroItem = _getHeroHireItem(i + 1);
                var photo = _dialog.mc.getChildByName('hero_photo_' + (i + 1));
                var cup = _dialog.mc.getChildByName('cup' + (i + 1));

                //photo.removeChild(photo.heroPhoto);
                photo.setMovieClip(null);
                if (heroItem) {
                    var heroInfo = heroes[i];
                    if (heroInfo) {
                        var frameIndex = (heroInfo.style % 7) + 1;

                        cup.gotoAndStop(frameIndex);
                        var levelText = heroItem.getChildByName('levelText');
                        var nameText = heroItem.getChildByName('nameText');
                        var attackText = heroItem.getChildByName('attackText');
                        var weaponText = heroItem.getChildByName('weaponText');
                        var luckyText = heroItem.getChildByName('luckyText');
                        var barrackText = heroItem.getChildByName('barrackText');
                        var engageBtn = heroItem.getChildByName('engageBtn');
                        var goldText = heroItem.getChildByName('goldText');
                        var sIcon = heroItem.getChildByName('hero_grade_icon');

                        heroItem.heroInfo = heroInfo;
                        var average = global.getHeroAvarate(heroInfo.grade).value;
                        levelText.setText('Lv' + heroInfo.herolevel);
                        nameText.setText(heroInfo.heroname);
                        attackText.setText(heroInfo.attack);
                        _setColorByAttr(attackText, average, heroInfo.attack);
                        weaponText.setText(heroInfo.defense);
                        _setColorByAttr(weaponText, average, heroInfo.defense);
                        luckyText.setText(heroInfo.luck);
                        _setColorByAttr(luckyText, average, heroInfo.luck);
                        var troopInfo = global.configHelper.getTroopByClassId(heroInfo.corpstype);
                        var name = troopInfo['@attributes'].name;
                        barrackText.setText(name);
                        goldText.setText(heroInfo.prize);
                        sIcon.gotoAndStop(global.heroConfigHelper.getGradeLevel(heroInfo.grade));
                        photo.setMovieClip('hero', 'hero' + heroInfo.image, function (index) {
                            return function (heroMovie) {
                                _addTipEvent(index, heroMovie);
                            };
                        }(i));
                        heroItem.visible = true;

                        if (heroInfo.herotype != 0) {//0代表普通英雄，否则超级英雄
                            if (heroItem._star) {
                                heroItem._star.visible = true;
                            } else {
                                var star = textureLoader.createMovieClip('window_pub', 'superHero_star');
                                star.x = levelText.x - 10;
                                star.y = levelText.y - 25;
                                heroItem.addChild(star);
                                heroItem._star = star;
                            }
                        } else {
                            heroItem._star && (heroItem._star.visible = false);
                        }
                        //加杯子
                    }
                    else {
                        cup.visible = false;
                        heroItem.visible = false;
                    }
                } else {
                    break;
                }
            }
        }
    }


    function _getLeftTicks() {
        var buildInfo = global.dataCenter.data.builds[global.BuildType.Tavern];
        return buildInfo.endworktime - global.common.getServerTime();
    }

    function _updateTime() {
        if (_dialog.isShowing) {
            var leftTicks = _getLeftTicks();
            if (leftTicks <= 0) {
                global.NetManager.call('Player', 'refreshpub', null, _updateHero);
            } else {
                _dialog.mc.getChildByName('timeText').setText(global.common.second2stand(leftTicks));
            }
            /// 30秒选取随即英雄说话
            if (global.common.getServerTime() - _dialog._lastTalkTime > 30) {
                var randIndex = Math.random() * _dialog.heroItemCount | 0;
                _heroSayTip(randIndex);
            }
        }
    }

    function _showGetHardPanel(itemInfo) {
        if (!itemInfo) return;

        var mc = textureLoader.createMovieClip('window_pub', 'hero_card_panel');
        if (!mc) return;
        var cardnameLabel = mc.getChildByName("text_1");
        if (cardnameLabel) {
            cardnameLabel.setText(itemInfo.name);
        }
        var cardphotoPanel = mc.getChildByName("hero_card_photo");
        if (cardphotoPanel) {
            cardphotoPanel.setImage(global.ItemFunction.IconDir + itemInfo.shopicon + '.png',
                global.ItemFunction.DefaultIcon, function () {
                    if (this._asyncImage) {
                        this._asyncImage.dx = -12;
                        this._asyncImage.dy = -12;
                    }
                }.bind(cardphotoPanel));
        }
        var closeBtn = mc.getChildByName('close_icon');
        closeBtn && closeBtn.setButton(true, function () {
            var cardphotoPanel = mc.getChildByName("hero_card_photo");
            cardphotoPanel.setImage();
            global.windowManager.removeChild(mc);
        });
        var nextTimeUseBtn = mc.getChildByName('next_btn');
        nextTimeUseBtn && nextTimeUseBtn.setButton(true, function () {
            global.windowManager.removeChild(mc);
        });
        var nowUseCardBtn = mc.getChildByName('use_btn');
        nowUseCardBtn && nowUseCardBtn.setButton(true, function () {
            global.windowManager.removeChild(mc);
            global.ItemFunction.useItemWithoutDialog(itemInfo.type, itemInfo.id, 1);
        });
        global.windowManager.addChild(mc);
    }

    function _updateHero(data) {
        global.controller.playerStatusController.update(data.data.player);
        var newHeros = data.data.newheros;
        var oldHeros = global.dataCenter.data.heros;
        for (var key in oldHeros) {
            if (0 == oldHeros[key].status) {
                delete oldHeros[key];
            }
        }

        for (var key in newHeros) {
            oldHeros[key] = newHeros[key];
        }
        global.dataCenter.data.builds[global.BuildType.Tavern] = data.data.build;
        global.controller.gameinfoController.update(data.data.gameinfo);
        global.controller.missionController.update(data.data.mission);
        global.controller.dayMissionController.update(data.data.mission_day);

        if (data.data.inventory) {
            global.controller.inventoryController.update(data.data.inventory);
            var itemInfo = global.ItemFunction.getItemInfo(data.data.cardtype, data.data.cardid);

            if (data.data.isCustom) {//是英雄卡
                _showGetHardPanel(itemInfo);
            } else {//碎片
                var cardinfo = global.heroConfigHelper.getCardInfo(itemInfo.type, itemInfo.id);
                var destitem = null;
                if (cardinfo) {
                    destitem = global.ItemFunction.getItemInfo(cardinfo['@attributes'].destitemtype, cardinfo['@attributes'].destitemid);
                }

                if (itemInfo && destitem && cardinfo) {
                    var content = "获得了" + itemInfo.name + "*" + data.data.cardcount + "\n";
                    content += "凑齐" + cardinfo['@attributes'].srcitemcount + "张碎片可获得" + destitem.name + "\n";
                    content += "使用此卡可以立即招募到超级英雄";
                    global.dialog(content);
                }
            }
        }
        _updateHireHeroDialog();
    }

    var bNeedNotice = true;

    function _requestUpdateHero() {
        if (bNeedNotice) {
            for (var i = 0; i < _dialog.heroItemCount; ++i) {
                var heroItem = _getHeroHireItem(i + 1);
                if (heroItem.heroInfo && heroItem.heroInfo.herotype != 0) {
                    global.dialog("酒馆中现在有个超级英雄，您确定不要雇佣的话，请再次选择“举行派对”");
                    bNeedNotice = false;
                    return;
                }
            }
        } else {
            bNeedNotice = true;
        }

        if (global.dataCenter.data.player.gold <= 3000) {
            global.dialog("发展领地需要不少金币，还是留下一些，下次再来请客吧！");
        } else {
            var travernLevel = global.dataCenter.data.builds[global.BuildType.Tavern].level;
            var partyExpend = global.configHelper.getPartyExpendByTravernLevel(travernLevel);
            if (partyExpend > global.dataCenter.data.player.gold) {
                global.dialog('举行派对所需' + partyExpend + '金币不足\n' + '（通过城堡收税，爱心臣民，占领金矿等途径增加金币收入）');
            } else {
                global.NetManager.call('Player', 'party', null, _updateHero, "举行派对中");
            }
        }
    }

    function _engageHero(data) {
        global.controller.playerStatusController.update(data.data.player);
        global.controller.missionController.update(data.data.mission);
        global.controller.dayMissionController.update(data.data.mission_day);
        global.controller.gameinfoController.update(data.data.gameinfo);
        var hiredHero = data.data.hero;
        var oldHeros = global.dataCenter.data.heros;
        for (var key in oldHeros) {
            if (oldHeros[key].heroid == hiredHero.heroid) {
                oldHeros[key] = hiredHero;
                break;
            }
        }
        _updateHireHeroDialog();
    }

    function _addEngageBtnEvent() {
        for (var i = 0; i < _dialog.heroItemCount; ++i) {
            var heroItem = _getHeroHireItem(i + 1);
            var engageBtn = heroItem.getChildByName('engageBtn');
            var hireHero = function (item) {
                return function () {
                    var heroInfo = item.heroInfo;
                    var maxHeroCount = global.configHelper.getMaxHeroCount();
                    if (global.dataCenter.getHeroCount() >= maxHeroCount) {
                        global.dialog("拥有英雄的数量达到上限" + maxHeroCount);
                    } else if (global.dataCenter.data.player.gold < heroInfo.prize) {
                        global.dialog("雇佣英雄所需要的" + heroInfo.prize + "金币不足，无法雇佣。\n" + "（通过城堡收税，爱心臣民，占领金矿等途径增加金币收入）");
                    } else {
                        if (heroInfo) {
                            global.NetManager.call('Player', 'hirehero', {'heroid':heroInfo.heroid}, _engageHero);
                        }
                    }
                }
            }(heroItem);
            engageBtn.setButton(true, hireHero);
        }
    }

    function _heroSayTip(index) {
        if (index < 0 || index >= _dialog.heroItemCount) return;

        var heroItem = _getHeroHireItem(index + 1);
        if (heroItem.heroInfo) {
            for (var i = 0; i < _dialog.heroItemCount; ++i) {
                var heroPhotoItem = _getHeroHireItem(i + 1);
                heroPhotoItem.tips && (heroPhotoItem.tips.visible = false);
            }
            var heroInfo = heroItem.heroInfo;
            if (!heroItem.tips) {
                heroItem.tips = textureLoader.createMovieClip('window_pub', 'heroTalkTips');
                var photo = _dialog.mc.getChildByName('hero_photo_' + (index + 1));
                heroItem.tips.x = photo.x + 5;
                heroItem.tips.y = photo.y + 130;
                _dialog.mc.addChild(heroItem.tips);
            }
            heroItem.tips.visible = true;
            var troop = global.configHelper.getTroopByClassId(heroInfo.corpstype);
            var text;
            if (heroInfo.herotype == 0) {
                text = global.configHelper.getTroopDialog(heroInfo.ismale, heroInfo.style, false, heroInfo.heroid);
            }
            else {
                var temphero = global.configHelper.getSuperHeroData(heroInfo.herotype);
                if (temphero) {
                    var dialog = (Math.random() * 3) | 0;
                    text = temphero['@attributes']['dialog' + dialog];
                }
            }
            heroItem.tips.getChildByName('talkText').setText(text);
            _dialog._lastTalkTime = global.common.getServerTime();
        }
    }

    /// 英雄点击说话功能
    function _addTipEvent(i, heroPhoto) {
        if (i < 0 || i >= _dialog.heroItemCount) return;
        if (!heroPhoto) return;

        var makeSayTips = function (index) {
            return function () {
                _heroSayTip(index);
            };
        };

        heroPhoto.setOnClick(makeSayTips(i));
    }

    function showHireHeroDialog() {
        if (!_dialog.isShowing) {
            _dialog.isShowing = true;
            _dialog.mc = textureLoader.createMovieClip('window_building', 'pubPanel');
            _dialog.mc.setIsSwallowTouch(true);
            //居中
            _dialog.mc.x = (global.GAME_WIDTH - _dialog.width) * 0.5;
            _dialog.mc.y = (global.GAME_HEIGHT - _dialog.height) * 0.5;
            _dialog.mc.stopAtHead(true);
            //_dialog.mc.getChildByName('box_panel').gotoAndPlay(1);
            global.windowManager.addChild(_dialog.mc);

            _dialog.progressBar = _dialog.mc.getChildByPath('livelinessScale/bar');

            _addEngageBtnEvent();
            _addTipEvent();
            var autoRefreshTime = global.configHelper.getHeroRefreshTime();//hour
            var leftTicks = _getLeftTicks();
            autoRefreshTime = global.common.hour2Second(autoRefreshTime);
            if (leftTicks > autoRefreshTime || leftTicks <= 0) {
                global.NetManager.call('Player', 'refreshpub', null, _updateHero);
            } else {
                _updateHireHeroDialog();
            }

            var closeBtn = _dialog.mc.getChildByName('closeIcon');
            closeBtn.setButton(true, closeHireHeroDialog);

            var partyBtn = _dialog.mc.getChildByName('partyBtn');
            var travernLevel = global.dataCenter.data.builds[global.BuildType.Tavern].level;
            var partyExpend = global.configHelper.getPartyExpendByTravernLevel(travernLevel);
            partyBtn.getChildByPath('partyBtn_1/goldText').setText(partyExpend);
            partyBtn.setButton(true, _requestUpdateHero);
            global.gameSchedule.scheduleFunc(_updateTime, 1000);
            _dialog._lastTalkTime = global.common.getServerTime();
        }
        Event.enableDrag = false;
    }

    function _cleanCachedResource() {
        for (var i = 0; i < _dialog.heroItemCount; ++i) {
            var heroItem = _getHeroHireItem(i + 1);
            var photo = _dialog.mc.getChildByName('hero_photo_' + (i + 1));
            photo.setMovieClip(null);
        }

    }

    function closeHireHeroDialog() {
        if (_dialog.isShowing) {
            _dialog.isShowing = false;
            _cleanCachedResource();
            global.windowManager.removeChild(_dialog.mc);
            global.gameSchedule.unscheduleFunc(_updateTime);

            _dialog.mc = null;
        }
        Event.enableDrag = true;
    }

    global.getHeroAvarate = function (grade) {
        if (!grade) return;

        var heroConfig = global.configs['config/battle/hero'];
        var attributes = heroConfig['root']['heroattrib'];
        for (var i = 0; i < attributes.length; ++i) {
            if (attributes[i]['@attributes'].grade == grade) {
                return attributes[i]['@attributes'];
            }
        }
    };

    global.getHeroInfo = function (type) {
        var index = type - 1;
        var heroInfos = global.configs['config/battle/superhero'];
        if (index >= 0 && index < heroInfos.length) {
            return heroInfos[index];
        }
    };

    global.ui.tavernDialog = _dialog;
})();
