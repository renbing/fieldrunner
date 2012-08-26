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
    this.mask = {};
    this.underLoad = {};
}

ResourceManager.prototype.add = function(path, type, args){
    if( path in this.pool ) {
        return;
    }

    this.underLoad[path] = {"type":type, "data":null, "args":args};
};

ResourceManager.prototype.remove = function(path) {
    delete this.pool[path];
};

ResourceManager.prototype.get = function(path) {
    var obj = this.pool[path];
    if(obj && obj.type == "image" && obj.args == "masked") {
        // PNG -> JPG + mask PNG
        if( path in this.mask ) {
            obj.data = this.mergeImageMask(obj.data, this.mask[path]);
            delete this.mask[path];
        }
    }

    return obj;
};

ResourceManager.prototype.load = function(onAllLoad, onLoad) {

    var loadProcessor = new LoadProcessor(onAllLoad, onLoad);
    var pool = this.pool;
    for(var path in this.underLoad) {
        pool[path] = this.underLoad[path];
        var type = pool[path].type;

        loadProcessor.deliveryPackage(); 
        if(type == "image") {
            var img = new Image();
            img.onload = function (url) {
                return function(){
                    pool[url].data = this;
                    loadProcessor.loadSuccess();
                };
            }(path);

            if( pool[path].args == "masked" ) {
                img.src = path.replace("\.png", "\.jpg");
            } else {
                img.src = path;
            }
            
            var mask = this.mask;
            if( pool[path].args == "masked" ) {
                //加载对应的Mask图
                loadProcessor.deliveryPackage(); 
                var maskImg = new Image();
                maskImg.onload = function (url) {
                    return function(){
                        mask[url] = this;
                        loadProcessor.loadSuccess();
                    };
                }(path);
                maskImg.src = path.replace("\.png", "_a\.png");
            }
        }else{
            ajax.get(path, function(url, type) {
                    return function(url, xhr){
                        if(type == "xml") {
                            pool[url].data = new DOMParser().parseFromString(xhr.responseText, "text/xml");
                        }else if(type == "json") {
                            pool[url].data = eval("(" + xhr.responseText + ")");
                        }else{
                            pool[url].data = xhr.responseText;
                        }
                        loadProcessor.loadSuccess();
                    };
            }(path, type));
        }
    }
    
    loadProcessor.start();
    this.underLoad = {};
}

ResourceManager.prototype.mergeImageMask = function(img, mask) {

    var imgCanvas = document.createElement("canvas");
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    var imgCtx = imgCanvas.getContext("2d");
    imgCtx.drawImage(img, 0, 0);
    var imgData = imgCtx.getImageData(0, 0, img.width, img.height);

    var maskCanvas = document.createElement("canvas");
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    var maskCtx = maskCanvas.getContext("2d");
    maskCtx.drawImage(mask, 0, 0);
    var maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
    
    for( var y=0, maxY=imgData.height; y<maxY; y++ ) {
        for( var x=0, maxX=imgData.width; x<maxX; x++ ) {
            var r = maskData.data[(x + y * maxX) * 4];
            imgData.data[(x + y * maxX) * 4 + 3] = r;
        }
    }
    imgCtx.putImageData(imgData, 0, 0);

    return imgCanvas;
}
