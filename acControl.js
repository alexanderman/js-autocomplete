function autocomplete(textElem, list, options) {
    this.setHeight = function(height) {
        _height = height;
        _setHeightAndPos(false);
    }
    var _height = 150;
    var _selected = null;
    var _cont = document.createElement('div');
    var _inner = document.createElement('div');
    var _elemsList = [];
    var _timeOut = null;
    var _prevInput = null;
    var _originalInput = null;
    var _hoveredItem = null;
    var _inputBeforeOver = null;
    
    var _searchCaseSensitive = false;
    var _locateUnder = true;
    var _doHighlight = false;

    function _createElem(text) {
        var div = document.createElement('div');
        div.style.border = 'solid 1px #FFFFFF';
        div.style.padding = '1px 5px';
        div.style.font = '11px Verdana';
        div.style.whiteSpace = 'nowrap';
        div.style.backgroundColor = '#FFFFFF';
        div.innerHTML = text;
        div.title = text;
        div.onmouseover = function() { _onOver(div); }
        div.onclick = function() {
            textElem.value = text;
            _inputBeforeOver = null;
            _show(false);
        }
        return div;
    }
    function _onOver(elem) {
        if (_hoveredItem) {
            _hoveredItem.style.border = 'solid 1px #FFFFFF';
            _hoveredItem.style.backgroundColor = '#FFFFFF';
        }
        if (!elem) {
            _hoveredItem = null;
            return;
        }
        _hoveredItem = elem;
        elem.style.border = 'solid 1px #AFD0E6';
        elem.style.backgroundColor = '#C2E7FF';
        if (_inputBeforeOver == null) _inputBeforeOver = textElem.value;
        textElem.value = elem.title;
    }
    function _setHeightAndPos(show) {
        _show(show);
        var p = _getPos(textElem);
        if (_inner.offsetHeight < _height)
            _cont.style.height = _inner.offsetHeight + 'px';
        else
            _cont.style.height = _height + 'px';  
        if (_locateUnder) {
            _cont.style.left = p.left + 'px';
            _cont.style.top = (p.top + textElem.offsetHeight) + 'px';
        }
        else {
            _cont.style.left = p.left + 'px';
            _cont.style.top = (p.top - _cont.offsetHeight) + 'px';
        }
        if (_cont.offsetHeight < 3) {
            _show(false);
            _onOver(null);
        }
    }
    function _getPos(element, parent) {
        if (!element) return null;
        var top = 0, left = 0;
        do {top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element !== parent && element);
        return { top: top, left: left }
    }
    function _getInputText() { 
        return _inputBeforeOver != null ? _inputBeforeOver : textElem.value; 
    }
    function _attachEvents() {
        textElem.onfocus = function(e) { clearTimeout(_timeOut); _timeOut = null; _setAutoComplete(); }
        textElem.onblur = function(e) { _timeOut = setTimeout(_show, 100); }
        textElem.onkeydown = function(e) {
            _setAutoComplete();
            var elem = null;
            switch (e.keyCode) {
                case 38: //up
                    _onOver(elem = getNextItem(_hoveredItem, false));
                    break;
                case 40: //down
                    _onOver(elem = getNextItem(_hoveredItem, true));
                    break;
                default: _inputBeforeOver = null;
            }
            if (elem) { //handling div's scroll
                var pos = _getPos(elem, _cont);
                var padding = 0;//(_cont.offsetHeight - elem.offsetHeight) / 2;
                if (pos.top - padding < _cont.scrollTop) 
                    _cont.scrollTop = pos.top - padding;
                else if (pos.top + elem.offsetHeight + padding > _cont.scrollTop + _cont.offsetHeight) 
                    _cont.scrollTop = _cont.scrollTop + (pos.top + elem.offsetHeight - _cont.scrollTop - _cont.offsetHeight) + padding;
            }
        }
        function getNextItem(fromElem, isDown) {
            fromElem = !fromElem || fromElem.style.display == 'none' ? null : fromElem;
            if (!fromElem)
                return isDown ? getFirstItem() : getLastItem();
            var index = getNextIndex(fromElem.index, isDown);
            while(_elemsList[index].display == 'none')
                index = getNextIndex(fromElem.index, isDown);
            return _elemsList[index];
            function getNextIndex(index) {
                if (isDown) {
                    do { index = (index + 1) % _elemsList.length;
                    } while (_elemsList[index].style.display == 'none');
                }
                else {
                    do { --index;
                        if (index < 0) index = _elemsList.length + index;
                    } while (_elemsList[index].style.display == 'none');
                }
                return index;
            }
            function getFirstItem() {
                for (var i=0; i<_elemsList.length; i++)
                    if (_elemsList[i].style.display != 'none')
                        return _elemsList[i];
                return null;
            }
            function getLastItem() {
                for (var i=_elemsList.length - 1; i>=0; i--)
                    if (_elemsList[i].style.display != 'none')
                        return _elemsList[i];
                return null;
            }
        }
    }
    function _setListElems() {
        var text = _searchCaseSensitive ? _getInputText() : _getInputText().toLowerCase(), isEmpty = text.trim() == '';
        if (_prevInput == text)
            return;
        var searchInPrevRersults = text.indexOf(_prevInput) == 0;
        var regex = new RegExp('^' + text), rRes = null;
        for (var i in _elemsList) {
            var visible = true;
            if (searchInPrevRersults && _elemsList[i].style.display == 'none')
                continue;
            if (!isEmpty) {
                var itemText = _searchCaseSensitive ? _elemsList[i].title : _elemsList[i].title.toLowerCase();
                rRes = regex.exec(itemText);
                visible = rRes != null && text != itemText;
            }
            _elemsList[i].style.display = visible ? 'block' : 'none';
            if (_doHighlight) {
                if (visible) 
                    if (!isEmpty)
                        _highLight(_elemsList[i], rRes.index, text.length);
                else _removeHighLight(_elemsList[i]);
            }
        }
        _prevInput = text;
    }
    function _setTextCompletion(fullText) { // not in use
        _originalInput = textElem.value;
        var len = textElem.value.length;
        textElem.value = textElem.value + fullText.substr(textElem.value.length);
        textElem.selectionStart = len;
        textElem.selectionEnd = textElem.value.length;
    }
    function _removeHighLight(elem) {
        elem.innerHTML = elem.title;
    }
    function _highLight(elem, start, length) {
        var text = elem.title;
        text = text.substr(0,start) + '<label style="background-color:#FFFFAA;">' + text.substr(start, length) + '</label>' + text.substr(start+length,text.length);
        elem.innerHTML = text;        
    }
    function _setAutoComplete() {
       setTimeout(function() {
           _setListElems(); 
           _setHeightAndPos(true);
       }, 10);
    }
    function _show(show) { 
        _cont.style.display = show ? 'block' : 'none'; 
        if (!show) _inputBeforeOver = null;
    }
    
    function _construct() {
        if (options) {
            _locateUnder = options.hasOwnProperty('locateunder') ? options.locateunder : _locateUnder;
            _doHighlight = options.hasOwnProperty('highlight') ? options.highlight : _doHighlight;
            _searchCaseSensitive = options.hasOwnProperty('casesensitive') ? options.casesensitive : _searchCaseSensitive;
        }
        textElem.autocomplete = 'off';
        _cont.appendChild(_inner);
        document.body.appendChild(_cont);
        _cont.style.position = 'absolute';
        _cont.style.border = 'solid 1px #AAAAAA';
        _cont.style.overflow = 'auto';
        _cont.style.overflowX = 'hidden';
        _cont.onscroll = function(e) { 
            if (_timeOut) {
                clearTimeout(_timeOut);
                _timeOut = null;
            }
            textElem.focus();   
        }
        _elemsList = [];
        for (var i=0; i<list.length; i++) {
            var div = _createElem(list[i]);
            _elemsList.push(div);
            _inner.appendChild(div);
            div.index = _elemsList.length - 1;
        }
        _cont.style.width = textElem.offsetWidth - 2 + 'px';
        
        _setHeightAndPos(false);
        _attachEvents();
    }
    _construct();
    String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
}
