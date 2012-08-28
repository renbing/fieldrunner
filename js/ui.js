/**
 * Created by renbing
 * User: renbing
 * Date: 12-8-27
 * Time: 下午2:47
 *
 */

/**
 * UI管理器
 */

function UIManager() {
}

UIManager.prototype.parse = function(mcRoot, xmlRoot, isRoot){
    
    isRoot = (isRoot != false);

    var nodes = xmlRoot.childNodes;
    for(var i=0; i<nodes.length; i++) {
        var node = nodes[i];
        if( node.tagName != "Element" ) {
            continue;
        }

        var mc = new MovieClip(node.getAttribute("Name"), 1);
        mcRoot.addChild(mc);

        var dimension = (node.getAttribute("Dimension") || "").split(",");
        var anchor = (node.getAttribute("Anchor") || "").split(",");
        if( anchor.length == 2 ) {
            mc.x = this.convertAnchorX(anchor[0], isRoot);
            mc.y = this.convertAnchorY(anchor[1], isRoot);
        }

        if( node.childNodes.length == 0 && node.hasAttribute("MirrorMode")) {
            if( node.getAttribute("MirrorMode") == "2" ) {
                mc.scaleY = -1;
            }
            if( node.getAttribute("MirrorMode") == "1" ) {
                mc.scaleX = -1;
            }
            if( node.getAttribute("MirrorMode") == "3" ) {
                mc.scaleX = mc.scaleY = -1;
            }
        }

        if( node.getAttribute("Type") == "2" && node.hasAttribute("TextureFilename") ) {
            //图片
            var img = resourceManager.get(node.getAttribute("TextureFilename")).data;
            var sw = img.width, 
                sh = img.height,
                dw = sw,
                dh = sh;
            if( dimension.length == 2 ) {
                dw = global.GAME_WIDTH * dimension[0];
                dh = global.GAME_HEIGHT * dimension[1];
            }
            var dx = -dw/2, dy = -dh/2;
            mc.addChild(new Texture(img, 0, 0, sw, sh, dx, dy, dw, dh));
        }

        if( node.getAttribute("Type") == "1" ) {
            //文字
            var tf = new TextField(node.getAttribute("Text"), "20px sans-serif", global.Color.PINK);
            tf.y = -20 * 2;
            mc.addChild(tf);
        }

        this.parse(mc, node, false);
    }
};

UIManager.prototype.convertAnchorX = function(anchor, isRoot) {
    return anchor * global.GAME_WIDTH;
}

UIManager.prototype.convertAnchorY = function(anchor, isRoot) {
    if( isRoot ) {
        return (1-anchor) * global.GAME_HEIGHT;
    }

    return anchor * global.GAME_HEIGHT;
}

UIManager.prototype.convertAnchorY = function(anchor, isRoot) {
    if( isRoot ) {
        return (1-anchor) * global.GAME_HEIGHT;
    }

    return (-anchor) * global.GAME_HEIGHT;
}
