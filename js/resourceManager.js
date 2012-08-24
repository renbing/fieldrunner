/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-7
 * Time: 下午2:47
 *
 */

/**
 * 资源管理器
 */

function ResourceManager() {
    this.pool = {};
    this.underLoad = {};
}

ResourceManager.prototype.add = function(path, type){
    if( path in this.pool ) {
        return;
    }

    this.underLoad[path] = type;
};

ResourceManager.prototype.remove = function(path) {
    delete this.pool[path];
};

ResourceManager.prototype.get = function(path) {
    return this.pool[path];
};

ResourceManager.prototype.load = function(onAllLoad, onLoad) {
    var loadProcessor = new LoadProcessor(onAllLoad, onLoad);
    var pool = this.pool;
    for(var path in this.underLoad) {
        var url = path;
        var type = this.underLoad[path];
        pool[path] = {'type':type, 'data':null};

        loadProcessor.deliveryPackage(); 
        if(type == "image") {
            var img = new Image();
            img.onload = function (url) {
                return function(){
                    pool[url].data = this;
                    loadProcessor.loadSuccess();
                };
            }(url);
            img.src = url;
        }else{
            ajax.get(path, function(url, xhr){
                if(type == "xml") {
                    pool[url].data = xhr.responseXML;
                }else if(type == "json") {
                    pool[url].data = eval('(' + xhr.responseText + ')');
                }else{
                    pool[url].data = xhr.responseText;
                }
                loadProcessor.loadSuccess();
            });
        }
    }
    
    loadProcessor.start();
    this.underLoad = {};
}
