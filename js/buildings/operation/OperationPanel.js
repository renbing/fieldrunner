/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-26
 * Time: 下午5:18
 *
 */

(function () {

    var TYPE_WITH_PROCESSING = 0;
    var TYPE_WITHOUT_PROCESSING = 1;
    var TYPE_ONLY_PROCESSING = 2;

    var ICON_GARRISON = 0;//驻军
    var ICON_RETREATICON = 1;//撤军
    var ICON_UPICON = 2;//升级
    var ICON_PREEMPTIVEICON = 3;//加速
    var ICON_RESISTICON = 4;//反抗
    var ICON_OCCUPYICON = 5;//占领
    var ICON_RELEASEICON = 6;//解救
    var ICON_DRIVEICON = 7;//驱赶
    var ICON_PLUNDERICON = 8;//掠夺

    var panelWidth = 370;
    var panelHeight = 120;
    var animationDuration = 200;
    var proto = OperationPanel.prototype;

    function OperationPanel() {
        this._init(this);
    }

    proto._init = function () {
        this._initMc();
        this.iconArr = [];
    };

    proto._initMc = function () {
        this.mcBuildingWindowsPanel = textureLoader.createMovieClip('ui', 'building_windows_panel');
        this.mcGarrisonIcon = textureLoader.createMovieClip('ui', 'garrisonIcon');
        this.mcRetreatIcon = textureLoader.createMovieClip('ui', 'retreatIcon');
        this.mcUpIcon = textureLoader.createMovieClip('ui', 'upIcon');
        this.mcPreemptiveIcon = textureLoader.createMovieClip('ui', 'preemptiveIcon');
        this.mcResistIcon = textureLoader.createMovieClip('ui', 'resistIcon');
        this.mcOccupyIcon = textureLoader.createMovieClip('ui', 'occupantIcon2');
        this.mcReleaseIcon = textureLoader.createMovieClip('ui', 'saveIcon');
        this.mcDriveIcon = textureLoader.createMovieClip('ui', 'driveIcon');
        this.mcPlunderIcon = textureLoader.createMovieClip('ui', 'plunderIcon');
        this.mcCloseBtn = this.mcBuildingWindowsPanel.getChildByName('close_btn');
        this.mcBtnContainer = new MovieClip('mcBtnContainer');
        this.mcBtnAddHarvest = this.mcBuildingWindowsPanel.getChildByPath('win_2/addHarvestIcon');
        this.textAddHarvest = this.mcBuildingWindowsPanel.getChildByPath('win_2/text');
        this.textTimer = this.mcBuildingWindowsPanel.getChildByPath('win_1/time_text');
        this.mcBuildingWindowsPanel.stop();
        this.mcGarrisonIcon.stop();
        this.mcRetreatIcon.stop();
        this.mcUpIcon.stop();
        this.mcPreemptiveIcon.stop();
        this.mcCloseBtn.stop();
        this.mcBuildingWindowsPanel.setIsSwallowTouch(true);
        this.mcBuildingWindowsPanel.getChildByPath('win_1/progress_panel').visible = false;
        var self = this;
        this.mcCloseBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
            self.hide();
        });
    };

    proto.getPanelOfAddHarvest = function () {
        return this.mcBuildingWindowsPanel.getChildByName('win2');
    };

    proto.setOnlyIconWithType = function (type, icon) {
        this._updateType(type);
        this.mcBtnAddHarvest.visible = false;
        if(icon){
            var iconBtn = this._getIcon(icon);
            iconBtn.x = this.mcBtnAddHarvest.x;
            iconBtn.y = this.mcBtnAddHarvest.y;
        }
    }

    proto._updateType = function (type) {
        switch (type) {
            case TYPE_WITH_PROCESSING:
                this.mcBuildingWindowsPanel.getChildByName('win_1').visible = true;
                this.mcBuildingWindowsPanel.getChildByName('win_2').visible = false;

                break;
            case TYPE_WITHOUT_PROCESSING:
                this.mcBuildingWindowsPanel.getChildByName('win_1').visible = false;
                this.mcBuildingWindowsPanel.getChildByName('win_2').visible = true;
                this.mcBtnAddHarvest.visible = true;
                break;
            case TYPE_ONLY_PROCESSING:
                break;
        }
        this.type = type;
    };

    proto._getIcon = function (iconEnum) {
        var icon;
        switch (iconEnum) {
            case ICON_GARRISON:
                icon = this.mcGarrisonIcon;
                break;
            case ICON_RETREATICON:
                icon = this.mcRetreatIcon;
                break;
            case ICON_UPICON:
                icon = this.mcUpIcon;
                break;
            case ICON_PREEMPTIVEICON:
                icon = this.mcPreemptiveIcon;
                break;
            case ICON_DRIVEICON:
                icon = this.mcDriveIcon;
                break;
            case ICON_OCCUPYICON:
                icon = this.mcOccupyIcon;
                break;
            case ICON_PLUNDERICON:
                icon = this.mcPlunderIcon;
                break;
            case ICON_RESISTICON:
                icon = this.mcResistIcon;
                break;
            case ICON_RELEASEICON:
                icon = this.mcReleaseIcon;
                break;
        }
        return icon;
    };

    proto._updateIcon = function (arr) {
        var iconArr = this.iconArr;
        var icon;
        arr = arr || [];
        var iconNum = arr.length;
        var posX = [];
        switch (iconNum) {
            case 1:
                posX.push(85 + 70);
                break;
            case 2:
                posX.push(85 + 35);
                posX.push(85 + 105);
                break;
            case 3:
                posX.push(85);
                posX.push(85 + 70);
                posX.push(85 + 140);
                break;
            default:
                break;
        }
        for(var i=0; i<iconArr.length; ++i){
            iconArr[i].visible = false;
        }
        iconArr.length = 0;
        var posY = 85;
        for (var n = 0, m = arr.length; n < m; n++) {
            icon = arr[n];
            icon = this._getIcon(icon);
            iconArr.push(icon);
            icon.visible = true;
            icon.x = posX[n];
            icon.y = posY;
            this.mcBuildingWindowsPanel.addChild(icon);
        }
    };

    proto.updateAppearance = function (type, iconArr) {
        this._updateType(type);
        this._updateIcon(iconArr);
    };

    proto.show = function () {
        if (this.isLock) {
            return;
        }
        this.lock();

        var dialogMc = this.mcBuildingWindowsPanel;
        dialogMc.x = global.GAME_WIDTH / 2 - panelWidth / 2;
        dialogMc.y = -panelHeight;
        var dropDown = Tween({
            duration:animationDuration,
            trans:Tween.REGULAR_EASE_OUT,
            from:dialogMc.y,
            to:global.GAME_HEIGHT / 2.5 - panelHeight / 2,
            func:function () {
                dialogMc.y = this.tween;
            }
        });

        var callback = global.ActFunc(function () {
            this.unlock();
        }.bind(this));
        global.ActSeq().add(dropDown).add(callback).start();
        global.stage.addChild(dialogMc);
    };

    proto.hide = function () {
        if (this.isLock) {
            return;
        }
        this.lock();

        var dialogMc = this.mcBuildingWindowsPanel;
        dialogMc.x = global.GAME_WIDTH / 2 - panelWidth / 2;
        dialogMc.y = global.GAME_HEIGHT / 2.5 - panelHeight / 2;
        var fly = Tween({
            duration:animationDuration,
            trans:Tween.REGULAR_EASE_OUT,
            from:dialogMc.y,
            to:-panelHeight,
            func:function () {
                dialogMc.y = this.tween;
            }
        });

        var callback = global.ActFunc(function () {
            this.unlock();
            global.stage.removeChild(dialogMc);
        }.bind(this));
        global.ActSeq().add(fly).add(callback).start();

    };

    proto.lock = function () {
        this.isLock = true;
    };

    proto.unlock = function () {
        this.isLock = false;
    };

    OperationPanel.TYPE_WITH_PROCESSING = TYPE_WITH_PROCESSING;
    OperationPanel.TYPE_WITHOUT_PROCESSING = TYPE_WITHOUT_PROCESSING;
    OperationPanel.TYPE_ONLY_PROCESSING = TYPE_ONLY_PROCESSING;

    OperationPanel.ICON_GARRISON = ICON_GARRISON;
    OperationPanel.ICON_RETREATICON = ICON_RETREATICON;
    OperationPanel.ICON_UPICON = ICON_UPICON;
    OperationPanel.ICON_PREEMPTIVEICON = ICON_PREEMPTIVEICON;
    OperationPanel.ICON_RESISTICON = ICON_RESISTICON;
    OperationPanel.ICON_DRIVEICON = ICON_DRIVEICON;
    OperationPanel.ICON_OCCUPYICON = ICON_OCCUPYICON;
    OperationPanel.ICON_RELEASEICON = ICON_RELEASEICON;
    OperationPanel.ICON_PLUNDERICON = ICON_PLUNDERICON;

    global.OperationPanel = OperationPanel;
})();
