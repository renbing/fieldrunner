/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-28
 * Time: 下午1:58
 *
 */

/**
 * 通用对话框
 *
 * 单例
 * 
 */
(function () {

    var dialogMc;
    var textField;
    var width = 308;
    var height = 400;
    var animationDuration = 200;
    var type;
    var hideTimer;
    var okFunc;
    var cancelFunc;
    var alertBackground;
    var tipBackground;
    var closeBtn;
    var okBtn;
    var cancelBtn;

    function dialog(text, cfg) {
        cfg = cfg || {};
        var font = cfg.font || '16px sans-serif';
        var color = cfg.color || '#000000';
        var closeDelay = cfg.closeDelay || 0;
        type = cfg.type || dialog.DIALOG_TYPE_ALERT;
        okFunc = cfg.okFunc;
        cancelFunc = cfg.cancelFunc;

        if (!dialogMc) {
            dialogMc = new textureLoader.createMovieClip('common_tips', 'common_tips');
            dialogMc.setIsSwallowTouch(true);
            textField = new TextField(text, font, color, 256, 128);
            textField.x = 50;
            textField.y = 95;
            dialogMc.addChild(textField);

            closeBtn = dialogMc.getChildByName('common_tips_close_btn');
            okBtn = dialogMc.getChildByName('common_tips_ok_btn');
            cancelBtn = dialogMc.getChildByName('common_tips_cancel_btn');
            alertBackground = dialogMc.getChildByName('common_tips_background2');
            tipBackground = dialogMc.getChildByName('common_tips_background1');

            closeBtn.gotoAndStop(1);
            closeBtn.addEventListener(Event.MOUSE_IN, _handleCloseBtnMouseIn);
            closeBtn.addEventListener(Event.MOUSE_OUT, _handleCloseBtnMouseOut);
            closeBtn.addEventListener(Event.MOUSE_CLICK, _handleCloseBtnClick);
            okBtn.addEventListener(Event.MOUSE_CLICK, _handleOkBtnClick);
            cancelBtn.addEventListener(Event.MOUSE_CLICK, _handleCancelBtnClick);
            dialogMc.addEventListener(Event.MOUSE_UP, _handleAlertMcMouseUp);
            roseCore.drag(dialogMc, true, {});
        }
        if (closeDelay) {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(_handleCloseBtnClick, closeDelay);
        }

        switch (type) {
            case dialog.DIALOG_TYPE_ALERT:
                okBtn.visible = true;
                cancelBtn.visible = false;
                tipBackground.visible = false;
                alertBackground.visible = true;
                closeBtn.x = 85;
                okBtn.x = 80;
                textField.x = 50;
                textField.y = 95;
                break;
            case dialog.DIALOG_TYPE_CONFIRM:
                okBtn.visible = true;
                cancelBtn.visible = true;
                tipBackground.visible = false;
                alertBackground.visible = true;
                closeBtn.x = 85;
                okBtn.x = 0;
                textField.x = 50;
                textField.y = 95;
                break;
            case dialog.DIALOG_TYPE_TIP:
                okBtn.visible = false;
                cancelBtn.visible = false;
                tipBackground.visible = true;
                alertBackground.visible = false;
                closeBtn.x = 0;
                okBtn.x = 0;
                textField.x = 50;
                textField.y = 65;
                break;
        }

        closeBtn.enable = false;
        closeBtn.gotoAndStop(3);
        textField.setText(text);
        textField.setFont(font || '16px sans-serif');
        textField.setFillStyle(color || '#000000');
        _show();
    }

    function _handleCloseBtnMouseIn(e) {
        this.enable && this.gotoAndStop(2);
    }

    function _handleCloseBtnMouseOut(e) {
        this.enable && this.gotoAndStop(1);
    }

    function _handleAlertMcMouseUp(e) {
        e.stopPropagation();
    }

    function _handleOkBtnClick() {
        if (closeBtn.enable) {
            okFunc && okFunc();
            _hide();
        }
    }

    function _handleCloseBtnClick() {
        closeBtn.enable && _hide();
    }

    function _handleCancelBtnClick() {
        if (closeBtn.enable) {
            cancelFunc && cancelFunc();
            _hide();
        }
    }

    function _show() {
        dialogMc.x = global.GAME_WIDTH / 2 - width / 2;
        dialogMc.y = -height;
        var dropDown = Tween({
            duration: animationDuration,
            trans: Tween.REGULAR_EASE_OUT,
            from: -height,
            to: global.GAME_HEIGHT / 2 - height / 2,
            func:function() {
                dialogMc.y = this.tween;
            }
        });

        var callback = global.ActFunc(function() {
                        closeBtn.enable = true;
                        closeBtn.gotoAndStop(1);
                    });
        global.ActSeq().add(dropDown).add(callback).start();
        global.stage.addChild(dialogMc);
        Event.enableDrag = false;

    }

    function _hide() {
        if (!closeBtn.enable) return;
        closeBtn.enable = false;
        closeBtn.gotoAndStop(3);
        var fly = Tween({
            duration: animationDuration,
            trans: Tween.REGULAR_EASE_IN,
            from: dialogMc.y,
            to: -height,
            func:function() {
                dialogMc.y = this.tween;
            }
        });

        var remove = global.ActFunc(function() {
                        global.stage.removeChild(dialogMc);
                    });
        global.ActSeq().add(fly).add(remove).start();
        Event.enableDrag = true;
    }

    function hideAll(){
        _hide();
    }

    dialog.DIALOG_TYPE_ALERT = 0;
    dialog.DIALOG_TYPE_CONFIRM = 1;
    dialog.DIALOG_TYPE_TIP = 2;
    dialog.hideAll = hideAll;

    global.dialog = dialog;

})();
