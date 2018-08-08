window.addEventListener('load', function () {
    // Put each <h1> and subsequent content into its own <section>.
    function makeSections(node) {
        var nextSection = null;
        var sections = [];
        while (true) {
            sections.push(nextSection ? nextSection : document.createElement('section'));
            nextSection = null;
            var section = sections[sections.length - 1];
            var sib;
            while (true) {
                sib = node.nextSibling;
                if (sib === null) {
                    section.appendChild(node);
                    return sections;
                }
                if (sib.nodeName === 'H1') {
                    break;
                }
                if (sib.nodeName === 'HR' && sib.classList.contains('pause')) {
                    nextSection = section.cloneNode(true);
                    nextSection.classList.add('post-pause');
                    var next = sib.nextSibling;
                    sib.parentNode.removeChild(sib);
                    sib = next;
                    break;
                }
                section.appendChild(node);
                node = sib;
            }
            node = sib;
        }
    }

    var title = document.getElementsByClassName('title')[0];
    [].forEach.call(makeSections(title), function (x) {
        document.body.appendChild(x);
    });

    // add a pair of arrows to the bottom right corner of the slides,
    // ensuring they're outside the slides.
    var nav = document.createElement('nav');
    nav.id = 'nav-symbols';
    var back = document.createElement('span');
    back.id = 'nav-back';
    back.classList.add('nav-symbol');
    back.textContent = '◀';
    var forward = document.createElement('span');
    forward.id = 'nav-forward';
    forward.classList.add('nav-symbol');
    forward.textContent = '▶';

    nav.appendChild(back);
    nav.appendChild(forward);
    document.body.appendChild(nav);

    var sections = document.getElementsByTagName('section');

    var hash = window.location.hash;
    var current = /^#[0-9]+$/.test(hash) ? parseInt(hash.substr(1), 10) : 0;
    var editable = false;

    function adjustClass(elem, should_add, klass) {
        if (should_add)
            elem.classList.add(klass);
        else
            elem.classList.remove(klass);
    }

    function toggleEditable() {
        editable = !editable;
        document.getElementsByTagName("body")[0]
                .setAttribute("contentEditable", ""+editable);
    }

    function update() {
        [].forEach.call(sections, function (x, i) {
            x.classList.remove('current');
            if (i == 0) { x.classList.add('title-slide'); }
        });

        var can_go_forward = true, can_go_back = true;

        if (current <= 0) {
            current = 0;
            can_go_back = false;
        }
        else if (current >= sections.length - 1) {
            current = sections.length - 1;
            can_go_forward = false;
        }
        adjustClass(forward, !can_go_forward, 'disabled');
        adjustClass(back,    !can_go_back,    'disabled');
        sections[current].classList.add('current');
        // servo doesn't support this
        if (window.location.replace) {
            window.location.replace('#' + current);
        }
    }

    update();

    document.body.addEventListener('keydown', function (ev) {
        switch (ev.keyCode) {
            case 39: if (!editable) current++; break; // ->
            case 37: if (!editable) current--; break; // <-
            case 192: toggleEditable(); break;        // `
            case 65: highlightSelection(); break;     // a
        }
        update();
    });
    forward.addEventListener('click', function(ev) {
        current++;
        update();
    });
    back.addEventListener('click', function(ev) {
        current--;
        update();
    });

    // Touch listeners, to change page if a user with a touch devices
    // swipes left or right.
    var start_x, start_y;
    document.body.addEventListener('touchstart', function(ev) {
        ev.preventDefault();
        if (ev.touches.length > 1) return;
        start_x = ev.touches[0].clientX;
        start_y = ev.touches[0].clientY;
    });
    document.body.addEventListener('touchmove', function(ev) { ev.preventDefault(); });
    document.body.addEventListener('touchend', function(ev) {
        if (ev.touches.length > 0) return;

        var dx = ev.changedTouches[0].clientX - start_x;
        var dy = ev.changedTouches[0].clientY - start_y;

        // if the touch is at least 40% of the page wide, and doesn't
        // move vertically too much, it counts as a swipe.
        if (Math.abs(dx) > 0.4 * window.innerWidth && Math.abs(dy) < 0.2 * window.innerHeight) {
            current += -Math.sign(dx);
            update();
        }
    });

    function height() {
        document.body.style.height = window.innerHeight + 'px';
    }
    //window.addEventListener('resize', function(ev) { height(); });
    //height();




    var highlight_idx = 0;

    function next_highlight() {
        // 1, 2, 3, 4
        highlight_idx += 1;
        if (highlight_idx > 4) { highlight_idx = 0; }
        return highlight_idx;
    }


    function highlightSelection() {
        var userSelection = window.getSelection().getRangeAt(0);
        var highlight = "highlight" + next_highlight();
        var safeRanges = getSafeRanges(userSelection);
        for (var i = 0; i < safeRanges.length; i++) {
            highlightRange(safeRanges[i], highlight);
        }
    }

    function highlightRange(range, highlight) {
        var newNode = document.createElement("span");
        newNode.classList.add(highlight);
        range.surroundContents(newNode);
    }

    function getSafeRanges(dangerous) {
        var a = dangerous.commonAncestorContainer;
        // Starts -- Work inward from the start, selecting the largest safe range
        var s = new Array(0), rs = new Array(0);
        if (dangerous.startContainer != a)
            for(var i = dangerous.startContainer; i != a; i = i.parentNode)
                s.push(i)
        ;
        if (0 < s.length) for(var i = 0; i < s.length; i++) {
            var xs = document.createRange();
            if (i) {
                xs.setStartAfter(s[i-1]);
                xs.setEndAfter(s[i].lastChild);
            }
            else {
                xs.setStart(s[i], dangerous.startOffset);
                xs.setEndAfter(
                    (s[i].nodeType == Node.TEXT_NODE)
                    ? s[i] : s[i].lastChild
                );
            }
            rs.push(xs);
        }

        // Ends -- basically the same code reversed
        var e = new Array(0), re = new Array(0);
        if (dangerous.endContainer != a)
            for(var i = dangerous.endContainer; i != a; i = i.parentNode)
                e.push(i)
        ;
        if (0 < e.length) for(var i = 0; i < e.length; i++) {
            var xe = document.createRange();
            if (i) {
                xe.setStartBefore(e[i].firstChild);
                xe.setEndBefore(e[i-1]);
            }
            else {
                xe.setStartBefore(
                    (e[i].nodeType == Node.TEXT_NODE)
                    ? e[i] : e[i].firstChild
                );
                xe.setEnd(e[i], dangerous.endOffset);
            }
            re.unshift(xe);
        }

        // Middle -- the uncaptured middle
        if ((0 < s.length) && (0 < e.length)) {
            var xm = document.createRange();
            xm.setStartAfter(s[s.length - 1]);
            xm.setEndBefore(e[e.length - 1]);
        }
        else {
            return [dangerous];
        }

        // Concat
        rs.push(xm);
        response = rs.concat(re);

        // Send to Console
        return response;
    }
});
