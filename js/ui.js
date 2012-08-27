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

UIManager.prototype.parse = function(mcRoot, xmlRoot){

    var nodes = xmlRoot.childNodes;
    for(var i=0; i<nodes.length; i++) {
        var node = nodes[i];
        if( node.tagName != "Element" ) {
            continue;
        }

        var mc = new MovieClip(node.getAttribute("Name"), 1);
        mcRoot.addChild(mc);

        if( node.hasAttribute("TextureFilename") ) {
            var img = resourceManager.get(node.getAttribute("TextureFilename")).data;
            mc.addChild(new Texture(img));

            var anchor = (node.getAttribute("Anchor") || "").split(",");
            if( anchor.length == 2 ) {
                mc.x = this.convertAnchorX(anchor[0], img.width);
                mc.y = this.convertAnchorY(anchor[1], img.height);
            }
        }

        this.parse(mc, node);
    }
};

UIManager.prototype.convertAnchorX = function(anchor, width) {
    return (0.5-anchor) * width;
}

UIManager.prototype.convertAnchorY = function(anchor, height) {
    return (0.5-anchor) * height;
}

