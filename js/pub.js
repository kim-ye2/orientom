// pub.js
$(function(){





    // 헤더 메뉴 hover
    $("#menu").mouseover(function(){
        $("#header").addClass("up");
    }).mouseleave(function(){
        $("#header").removeClass("up");
    });

    // 스크롤 시 header bg
    $(window).on('scroll', function(){
        $('#header').toggleClass('bg', $(window).scrollTop() > 0);
    }).trigger('scroll');


    // 모바일 메뉴 열기
    var scrollPos = 0;
    $('.menuBtn.mo').on('click', function(e){
        e.preventDefault();
        scrollPos = $(window).scrollTop();
        $('#menuArea').stop().fadeIn(300, function(){
            $('.menuList').css('right', '0');
        });    
    });


    // 모바일 메뉴 닫기
    $('.btnMenu_mClose').on('click', function(){
        $('.menuList').css('right', '-100%');
        setTimeout(function(){
            $('#menuArea').fadeOut(200);
            $('html, body').css('overflow', '');
            $('body').css({ 'position': '', 'top': '', 'width': '' });
            $(window).scrollTop(scrollPos);
        }, 400);
    });


    // 대메뉴 아코디언
    $('.menuList .list > li > a.dropdown-toggle').on('click', function(e){
        e.preventDefault();
        var $sMenu = $(this).next('.sMenu');
        if($sMenu.is(':visible')){
            $sMenu.slideUp(300);
            $(this).removeClass('active');
        } else {
            $('.menuList .sMenu').not($sMenu).slideUp(300);
            $('.menuList .list > li > a.dropdown-toggle').not(this).removeClass('active');
            $sMenu.slideUp(0).slideDown(300);
            $(this).addClass('active');
        }
    });

	const lenis = new Lenis({
		duration: 1.2,
		easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		smoothWheel: true
	});
	window.lenis = lenis; // 좌측메뉴 앵커이동(side_wrap)에서 사용
	function raf(time){
		lenis.raf(time);
		requestAnimationFrame(raf);
	}
	requestAnimationFrame(raf);

});


/* =========================================================
   좌측메뉴(leftmenu) 앵커이동 + 스크롤 active + URL 해시 접근  [공통]
   - side_wrap 이 있는 페이지에서만 실행
   - 마크업 규칙
     <div class="side_wrap 페이지클래스">
       <div class="leftmenu" data-lenis-prevent>
         <a href="#섹션id">...</a>
       </div>
       <div class="rightcont">
         <div class="cont_box" id="섹션id">...</div>
       </div>
     </div>
========================================================= */
$(function () {
    var $wrap = $('.side_wrap');
    if (!$wrap.length) return;   // 해당 레이아웃이 없는 페이지는 실행 안 함

    var $win   = $(window);
    var $lm    = $wrap.find('.leftmenu');
    var $menu  = $lm.find('a[href^="#"]');
    var $secs  = $wrap.find('.rightcont .cont_box[id]');
    var SPACE  = 30;      // 헤더 아래 여백 (필요 시 조정)
    var SPEED  = 1.8;     // 이동 속도(초)
    var isMoving = false, moveTimer = null, curId = null;

    if (!$secs.length) return;

    // 고정 헤더 높이
    function getHeaderH() {
        var $h = $('#header'), pos = $h.css('position');
        return (pos === 'fixed' || pos === 'sticky') ? $h.outerHeight() : 0;
    }

    // 섹션 이동 시 위쪽 여백
    function getOffset() {
        return getHeaderH() + SPACE;
    }

    // 이 페이지의 섹션 id인지 확인
    function isSection(id) {
        return !!id && $secs.filter('#' + id).length > 0;
    }

    // leftmenu 높이: 현재 위치 기준으로 화면 안에 다 들어오게 + 넘칠 때만 내부 스크롤
    function setLeftMenu() {
        var el = $lm[0];
        if (!el) return;
        var hh = getHeaderH();
        document.documentElement.style.setProperty('--hd-h', hh + 'px');

        var top = Math.max(el.getBoundingClientRect().top, hh);
        el.style.maxHeight = Math.max(200, window.innerHeight - top) + 'px';

        if (el.scrollHeight > el.clientHeight + 1) {
            $lm.attr('data-lenis-prevent', '');
        } else {
            $lm.removeAttr('data-lenis-prevent');
        }
    }

    // active 메뉴가 leftmenu 안에서 보이도록 내부 스크롤
    function menuIntoView($a) {
        var el = $lm[0];
        if (!el || !$a.length || el.scrollHeight <= el.clientHeight) return;
        var aTop = $a[0].offsetTop, aH = $a.outerHeight();
        var viewTop = el.scrollTop, viewBtm = viewTop + el.clientHeight;
        if (aTop >= viewTop && aTop + aH <= viewBtm) return; // 이미 보이면 그대로
        $lm.stop().animate({ scrollTop: aTop - (el.clientHeight - aH) / 2 }, 400);
    }

    function setActive(id) {
        if (id === curId) return;
        curId = id;
        var $a = $menu.removeClass('active').filter('[href="#' + id + '"]').addClass('active');
        menuIntoView($a);
    }

    // 해당 섹션으로 이동
    function moveTo(id, immediate) {
        if (!isSection(id)) return;
        var top = Math.max(0, $secs.filter('#' + id).offset().top - getOffset());

        isMoving = true;
        setActive(id);
        clearTimeout(moveTimer);
        moveTimer = setTimeout(function () { isMoving = false; }, immediate ? 50 : SPEED * 1000 + 100);

        var ln = window.lenis;
        if (ln && ln.scrollTo) {
            // Lenis 사용 중이면 Lenis로 이동 (충돌 방지)
            ln.scrollTo(top, { duration: immediate ? 0 : SPEED, immediate: !!immediate, force: true });
        } else {
            $('html, body').stop().animate({ scrollTop: top }, immediate ? 0 : SPEED * 1000, 'easeInOutQuart');
        }

        if (history.replaceState) history.replaceState(null, '', '#' + id);
    }

    // 스크롤 위치에 따라 active 변경
    function spy() {
        if (isMoving) return;
        var st   = $win.scrollTop();
        var line = st + getOffset() + $win.height() * 0.3;
        var cur  = $secs.first().attr('id');

        $secs.each(function () {
            if ($(this).offset().top <= line) cur = this.id;
        });
        // 페이지 맨 아래 도달 시 마지막 메뉴 active
        if (st + $win.height() >= $(document).height() - 5) cur = $secs.last().attr('id');

        setActive(cur);
    }

    // 좌측메뉴 클릭
    $menu.on('click', function (e) {
        e.preventDefault();
        moveTo(this.hash.replace('#', ''));
    });

        // 같은 페이지에서 헤더/모바일 메뉴 등 외부 링크 클릭 시 (예: research.html#q-traffic)
    $(document).on('click', 'a[href*="#"]', function (e) {
        if ($(this).closest('.side_wrap .leftmenu').length) return;
        var id = this.hash.replace('#', '');
        var samePage = this.pathname.replace(/^\//, '') === location.pathname.replace(/^\//, '');
        if (!samePage || !isSection(id)) return;
        e.preventDefault();

        // 모바일 메뉴에서 클릭한 경우 메뉴 닫고 이동
        if ($(this).closest('#menuArea').length) {
            $('.menuList').css('right', '-100%');
            $('#menuArea').fadeOut(200);
        }
        moveTo(id);
    });

    // 뒤로가기 / 주소창 해시 직접 변경
    $win.on('hashchange', function () {
        moveTo(location.hash.replace('#', ''));
    });

    // 다른 페이지에서 해시로 진입 시
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    $win.on('load', function () {
        var id = location.hash.replace('#', '');
        if (isSection(id)) {
            moveTo(id, true);
        } else {
            spy();
        }
    });

    setLeftMenu();
    $win.on('load resize scroll', setLeftMenu);
    $win.on('scroll resize', spy);
});
