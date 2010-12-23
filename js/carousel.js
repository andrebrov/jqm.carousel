/*!
 * jQuery Mobile Carousel  Widget v 1.0.1
 * Developed by Rebrov Andrey
 * http://andrebrov.net/
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
if (!$.widgets) {
    $.widgets = function() {
        var getDimensions = function(n, min) {
            if (typeof n == 'undefined' ||
                n === null) {
                return null;
            }
            var _min = 0;
            if (typeof min != "undefined") {
                _min = min;
            }
            var rn = n.parent();
            while (rn && true) {
                if (rn.outerHeight() > _min) {
                    break;
                }
                if (rn.parent() && rn.parent().outerHeight()) {
                    rn = rn.parent();
                } else {
                    break;
                }
            }
            if (!rn) {
                return null;
            }
            return { h : rn.outerHeight(), w : rn.outerWidth() };
        };
        return {
            getDimensions : getDimensions
        };
    }();
}
$.widgets.Carousel = function(wargs) {
    var _widget = this;
    var items = [];
    var index = 0;
    var showNav = true;
    var itemHeight = 100;
    var itemWidth = 450;
    var baseWidth = "100%";
    _widget.node = $("#" + wargs.uuid);
    var template;
    var scrollInterval = 1000;
	touchStartEvent = $.support.touch ? "touchstart" : "mousedown";
	touchStopEvent = $.support.touch ? "touchend" : "mouseup";
	touchMoveEvent = $.support.touch ? "touchmove" : "mousemove";	
    if (wargs.args) {   
		if ( typeof wargs.args.showNav === "boolean") {
            showNav = wargs.args.showNav;
        }
        if (wargs.args.itemWidth) {
            baseWidth = wargs.args.itemWidth;
        }        
    }
    if (/%/i.test(baseWidth)) {
        var _w = new Number(baseWidth.split('%')[0]);
        var _dim = $.widgets.getDimensions(_widget.node);
        if (_dim != null) {
            itemWidth = (_dim.w) / _w * 100;
        }
    } else {
        itemWidth = baseWidth;
    }
    this.addItem = function(item) {
        if (!item.id) item.id = items.length;
        var id = item.id;
        var text = _widget.applyTemplate(item, template);
        $("<div id='"+wargs.uuid + "_item_" + item.id+"'>"+text+"</div>").css("zIndex", 1).width(itemWidth).height(itemHeight).css('display', 'inline').css("float", "left").appendTo(_widget.container)        
        $("#" + wargs.uuid + "_item_" + id).height(itemHeight - 50);        
        item.div = $("<div id='"+wargs.uuid + "_item_" + item.id+"'>"+text+"</div>");
        items.push(item);
        var _sel = $("<div id='"+id+"'></div>");        
        _sel.bind(touchStopEvent,function(e) {
            _widget.select(e.target.id);
        });
        _sel.append((id + 1)).removeClass().addClass("carousel-id carousel-id-theme");        
        _widget.mid.append(_sel);
        item.menu = _sel;
        return id;
    };
    this.select = function(itemId) {
        for (var _i = 0; _i < items.length; _i++) {
            var item = items[_i];
            if (item.id == itemId) {
                _widget.showIndex(_i);
                item.menu.addClass("carousel-id carousel-id-theme carousel-id-selected-theme");
            } else {
                item.menu.removeClass().addClass("carousel-id carousel-id-theme");
            }
        }
    };
    this.applyTemplate = function(obj, _t) {
        for (var i in obj) {
            var token = "@{" + i + "}";
            while (_t.indexOf(token) != -1) {
                _t = _t.replace(token, obj[i]);
            }
        }
        return _t;
    };
    this.showIndex = function(targetIndex) {
        if (targetIndex < index ||
            targetIndex >= index + 1) {
            if (targetIndex < index) {
                var _cb = function() {
                    index = targetIndex;
                };
                var targetPos = ( targetIndex * itemWidth) * -1;
                doScroll(targetPos, _cb);
            } else if (targetIndex >= index + 1) {
                var callback = function() {
                    index = targetIndex;
                };
                var tp = ( targetIndex * itemWidth) * -1;
                doScroll(tp, callback);
            }
        }
    };
    function doScroll(target, callback) {
        _widget.container.animate({left: target}, scrollInterval, callback);
    }
    this.getNext = function() {
        if (index < items.length - 1) {
            var _jumpTo = index + 1;
            if (_jumpTo > items.length - 1) {
                _jumpTo = items.length - 1;
            }
            _widget.select(items[_jumpTo].id);
        }
    };
    this.getPrevious = function() {
        if (index >= 1) {
            var _jumpTo = index - 1;
            if (_jumpTo < 0) {
                _jumpTo = 0;
            }
            _widget.select(items[_jumpTo].id);
        }
    };
    this.setItems = function(_in) {
        var data = _in;
        _widget.container.width((itemWidth + 10) * data.length );        
        for (var _i = 0; _i < data.length; _i++) {
            _widget.addItem(data[_i]);
        }
        _widget.mid.width(data.length * 30);
        if (data.length && data.length > 0) {
            _widget.select(0);
        }
    };
    this.load = function() {
        _widget.init();
        if (wargs.value) {
            data = wargs.value;
            _widget.setItems(data);
        }
    };
    this.init = function() {
        if (!_widget.node) return;
        _widget.container = $("#" + wargs.uuid + "_content");
        _widget.scrollpane = $("#" + wargs.uuid + "_scrollpane");			
		_widget.node.bind(touchStartEvent,function(e) {			
            _widget.touches = [];
            e.preventDefault();
        });
        _widget.scrollpane.bind("swipeleft",function(e) {			
            _widget.getNext();
        });
		_widget.scrollpane.bind("swiperight",function(e) {			
            _widget.getPrevious();
        });		
        _widget.node.bind(touchStopEvent,function(e) {
			
        });       
        _widget.nav = $("#" + wargs.uuid + "_nav");
        _widget.mid = $("#" + wargs.uuid + "_mid");
        _widget.node.addClass("carousel-theme");
        template = unescape($("#" + wargs.uuid + "_template").html() + "");
        _widget.container.css("left", "0");
        _widget.resize();
    };

    this.resize = function() {
        var _dim = $.widgets.getDimensions(_widget.node, 52);
        var _w = _dim.w;
        _widget.scrollpane.width(_w-12);
        if (!_dim) return;
        if (/%/i.test(baseWidth)) {
            var _w = new Number(baseWidth.split('%')[0]);
            itemWidth = (_dim.w) / _w * 100;
        } else {
            itemWidth = baseWidth;
        }
        for (var i = 0; items && i < items.length; i++) {
            $(items[i]).find("div").width(itemWidth).height(itemHeight);            
        }
        _widget.node.height(_dim.h - 12);
        if (showNav) {
            _widget.nav.css("display", "block");
            itemHeight = _dim.h - 42;            
            _widget.mid.width(items.length * 30);
            _widget.scrollpane.height(_dim.h - 40);
        } else {
            itemHeight = _dim.h - 4;
            _widget.scrollpane.height(_dim.h - 12);
        }
    };
    _widget.load();
};