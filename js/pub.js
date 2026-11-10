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



});