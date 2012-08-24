/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-5-22
 * Time: 上午11:52
 *
 */

(function () {

    var proto = MusicSettingCtr.prototype;

    function MusicSettingCtr(pakageName) {
        pakageName = pakageName || 'battleUI';
        var musicPanel = textureLoader.createMovieClip(pakageName, 'settings');
        musicPanel.name = 'settings';

        musicPanel.x = global.GAME_WIDTH - musicPanel.getWidth() - 10;
        musicPanel.y = 70;
        var musicToggleBtn = musicPanel.getChildByName('Music');
        if (musicToggleBtn) {
            global.soundManager.getIsBackgroundMuted() ? musicToggleBtn.gotoAndStop(3) : musicToggleBtn.gotoAndStop(1);
            musicToggleBtn.addEventListener(Event.MOUSE_DOWN, function (e) {
                if (!global.soundManager.getIsBackgroundMuted()) {
                    musicToggleBtn.gotoAndStop(2);
                } else {
                    musicToggleBtn.gotoAndStop(4);
                }
            });
            musicToggleBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
                if (!global.soundManager.getIsBackgroundMuted()) {
                    musicToggleBtn.gotoAndStop(3);
                    global.soundManager.setIsBackgroundMusicEnabled(false);
                } else {
                    musicToggleBtn.gotoAndStop(1);
                    global.soundManager.setIsBackgroundMusicEnabled(true);
                }
            });
            musicToggleBtn.addEventListener(Event.MOUSE_UP, function (e) {
                if (!global.soundManager.getIsBackgroundMuted()) {
                    musicToggleBtn.gotoAndStop(1);
                } else {
                    musicToggleBtn.gotoAndStop(3);
                }
            });
        }

        var sfxMusicToggleBtn = musicPanel.getChildByName('SfxMusic');
        if (sfxMusicToggleBtn) {
            global.soundManager.getIsEffectMuted() ? sfxMusicToggleBtn.gotoAndStop(3) : sfxMusicToggleBtn.gotoAndStop(1);
            sfxMusicToggleBtn.addEventListener(Event.MOUSE_DOWN, function (e) {
                if (!global.soundManager.getIsEffectMuted()) {
                    sfxMusicToggleBtn.gotoAndStop(2);
                } else {
                    sfxMusicToggleBtn.gotoAndStop(4);
                }
            });
            sfxMusicToggleBtn.addEventListener(Event.MOUSE_CLICK, function (e) {
                if (!global.soundManager.getIsEffectMuted()) {
                    sfxMusicToggleBtn.gotoAndStop(3);
                    global.soundManager.setIsEffectEnabled(false);
                } else {
                    sfxMusicToggleBtn.gotoAndStop(1);
                    global.soundManager.setIsEffectEnabled(true);
                }
            });
            sfxMusicToggleBtn.addEventListener(Event.MOUSE_UP, function (e) {
                if (!global.soundManager.getIsEffectMuted()) {
                    sfxMusicToggleBtn.gotoAndStop(1);
                } else {
                    sfxMusicToggleBtn.gotoAndStop(3);
                }
            });
        }
        this.mc = musicPanel;
    }

    proto.getDisplayObject = function () {
        return this.mc;
    };

    global.createMusicSettingCtr = function(){
        return new MusicSettingCtr();
    };

})();
