/**
 * Created by DeyongZ.
 * User: Rui Luo
 * Date: 12-4-5
 * Time: 下午7:15
 */

(function () {

    var proto = HeroConfigHelper.prototype;

    proto.getExpOfLevel = function (level) {
        var config = global.configs['config/battle/hero'];
        if (1 <= level && level <= config.root.heroexp.length) {
            var expnode = config.root.heroexp[level - 1];
            return expnode['@attributes'].exp;
        }
    };

    proto.getSoldiersOfLevel = function (level) {
        var config = global.configs['config/battle/troop_ability'];
        if (1 <= level && level <= config.data.ability.length) {
            var abilitynode = config.data.ability[level - 1];
            return abilitynode['@attributes'].soldier;
        }
    };

    proto.getGradeLevel = function (grade) {
        switch (grade) {
            case "D":
                return 1;
            case "C":
                return 2;
            case "B":
                return 3;
            case "A":
                return 4;
            case "S":
                return 5;
            case "SS":
                return 6;
            default:
                return 1;
        }
    };

    proto.getGradeByLevel = function (gradeLevel) {
        if (gradeLevel > 6) return 'SS';
        if (gradeLevel < 1) return 'D';

        switch (gradeLevel) {
            case 1:
                return 'D';
            case 2:
                return 'C';
            case 3:
                return 'B';
            case 4:
                return 'A';
            case 5:
                return 'S';
            case 6:
                return 'SS';
        }
    };

    proto.findSuperHeroByType = function (type) {
        var heros = global.configs['config/battle/superhero'].root.hero;
        for (var i = 0, max = heros.length; i < max; i++) {
            if (heros[i]['@attributes'].type == type) {
                return heros[i];
            }
        }
        return null;
    };

    proto.getGradesByTavernLevel = function (level) {
        var grades = [];
        var confs = global.configs['config/battle/hero'].root.hero;
        for (var i = 0, max = confs.length; i < max; i++) {
            if (confs[i]['@attributes'].playerlevel <= level) {
                grades.push(confs[i]["@attributes"].type);
            }
        }

        return grades;
    };

    proto.getSuperHerosByGrades = function (grades) {
        var selectedHeros = [];

        var heros = global.configs['config/battle/superhero'].root.hero;
        for (var i = 0, max = heros.length; i < max; i++) {
            if (grades.indexOf(heros[i]['@attributes'].grade) >= 0) {
                selectedHeros.push(heros[i]);
            }
        }
        return selectedHeros;
    };

    var HeroColors = [
        '#ffffff',
        '#00ff00',
        '#00d8ff',
        '#f04dff',
        '#ff9600',
        '#ff0000'
    ];

    proto.getColor = function (heroInfo) {
        if (heroInfo) {
            return HeroColors[this.getGradeLevel(heroInfo.grade) - 1];
        }
        return HeroColors[0];
    };

    var heroConfigMap;
    proto.getHeroConfig = function () {
        if (!heroConfigMap) {
            heroConfigMap = {};
            var heroConfig = global.configs['config/battle/hero'];
            global.common.assert(heroConfig, '英雄配置文件丢失或已经被破坏');
            var heroexps = heroConfig.root.heroexp;
            var levelExpMap = {};
            for (var i = 0; i < heroexps.length; ++i) {
                var level = heroexps[i]['@attributes'].level;
                var exp = heroexps[i]['@attributes'].exp;
                levelExpMap[level] = exp;
            }

            var levelTypeMap = {};
            var heros = heroConfig.root.hero;
            for (var i = 0; i < heros.length; ++i) {
                var tarvenlevel = heros[i]['@attributes'].playerlevel;
                var herotype = heros[i]['@attributes'].type;
                if (levelTypeMap[tarvenlevel] == null) {
                    levelTypeMap[tarvenlevel] = [];
                }
                levelTypeMap[tarvenlevel].push(herotype.toUpperCase());
            }
            heroConfigMap.levelExpMap = levelExpMap;
            heroConfigMap.levelTypeMap = levelTypeMap;
        }
        return heroConfigMap;
    };

    proto.getHeroTarvenlevel = function (herograde) {
        var levelHeroMap = this.getHeroConfig().levelTypeMap;
        for (var levelKey in levelHeroMap) {
            var heroInfos = levelHeroMap[levelKey];
            for (var infoKey in heroInfos) {
                if (heroInfos[infoKey] == herograde) {
                    return levelKey;
                }
            }
        }
        return 0;
    };

    proto.getCardInfo = function (type, id) {
        var heroCard = global.configs['config/battle/hero'].root.herocard;
        for (var i = 0; i < heroCard.length; ++i) {
            if (heroCard[i]["@attributes"].srcitemtype == type && heroCard[i]["@attributes"].srcitemid == id) {
                return heroCard[i];
            }
        }
    };

    proto.getDescOfHeroStatus = function (hero) {
        var desc = "";
        if (hero) {
            switch (hero.status) {
                //1表示空闲，2表示训练，3表示驻防
                case 2:
                    desc = "驻防";
                    break;
                case 3:
                    desc = "占领";
                    break;
                case 1:
                    desc = "空闲";
                    break;
                default:
                    desc = '协防';
                    break;
            }
        }

        return desc;
    };

    function HeroConfigHelper() {
        this.IDLE_HERO = 1;
    }


    global.heroConfigHelper = new HeroConfigHelper();
})();
