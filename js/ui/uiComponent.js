/**
 * Created by Bing Ren.
 * User: Bing Ren
 * Date: 12-4-20
 * Time: 下午5:58
 *
 */

// UI组件
var UIComponent = {};

/**
 * 翻页组件
 * @onLeft, onRight 回调,传递当前页位置 0<= x <pageCount
 */
(function(){
    
    var proto = PageTurn.prototype;

    function PageTurn(leftBtn, rightBtn, pageCount, pageText, onLeft, onRight) {
        this.leftBtn = leftBtn;
        this.leftBtn.gotoAndStop(1);

        this.rightBtn = rightBtn;
        this.rightBtn.gotoAndStop(1);

        this.pageCount = pageCount;
        this.pageText = pageText;

        this.onLeft = onLeft;
        this.onRight = onRight;
        
        // 1 <= pageCursor <= pageCount
        this.pageCursor = 1;
        
        this.leftBtn.setButton(true, this.prev.bind(this));
        this.rightBtn.setButton(true, this.next.bind(this));
        
        this._update();
    }

    proto.setHeadTail = function(headBtn, tailBtn, onHead, onTail) {
        this.headBtn = headBtn;
        this.tailBtn = tailBtn;

        this.headBtn.setButton(true, this.head.bind(this));
        this.tailBtn.setButton(true, this.tail.bind(this));

        this.onHead = onHead;
        this.onTail = onTail;

        this._update();
    };

    proto.next = function() {
        if( this.pageCursor >= this.pageCount ) {
            return;
        }

        this.pageCursor ++;
        this._update();

        this.onRight && this.onRight( this.pageCursor - 1 );
    };

    proto.prev = function() {
        if( this.pageCursor <= 1 ) {
            return;
        }

        this.pageCursor --;
        this._update();

        this.onLeft && this.onLeft( this.pageCursor - 1 );
    };

    proto.head = function() {
        if( this.pageCursor <= 1 ) {
            return;
        }

        this.pageCursor = 1;
        this._update();

        this.onHead && this.onHead( 0 );
    };

    proto.tail = function() {
        if( this.pageCursor >= this.pageCount ) {
            return;
        }

        this.pageCursor = this.pageCount;
        this._update();

        this.onTail && this.onTail( this.pageCursor - 1 );
    };

    proto.changePageCount = function(pageCount) {
        this.pageCount = pageCount;
        this.pageCursor = 1;

        this._update();
    };

    // 传递当前页位置 0<= x <pageCount
    proto.changePageCursor = function(pageCursor) {
        if( pageCursor >= this.pageCount || pageCursor < 0 ) {
            return;
        }

        this.pageCursor = pageCursor + 1;
        this._update();
    };

    proto._update = function() {
        
        this.rightBtn.setIsEnabled(false);

        // 不能再右翻,按钮变灰
        var canTurnRight = (this.pageCursor < this.pageCount);
        this.rightBtn.setIsEnabled( canTurnRight );
        this.tailBtn && this.tailBtn.setIsEnabled( canTurnRight );

        // 不能再左翻,按钮变灰
        var canTurnLeft = (this.pageCursor > 1);
        this.leftBtn.setIsEnabled( canTurnLeft );
        this.headBtn && this.headBtn.setIsEnabled( canTurnLeft );

        this.pageText && this.pageText.setText( "" + this.pageCursor + "/" + this.pageCount );
    };

    UIComponent.PageTurn = PageTurn;
})();
