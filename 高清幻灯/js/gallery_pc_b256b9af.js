define('gallery', ['detail', 'request_tongji'], function(detail, request_tongji) {
    if (window.ifeng) {
        return;
    }
    var ifeng = {};
    var staSign = true;
    var flagInit = true;
    var bigPicFlag = false;//是否加载大图的标志位
    //浏览模式
    var photoViewMode = {
        "loop": function(index) {
            var t = this;
            index = parseInt(index);
            return {
                prev: index > 1 ? '#p=' + (index - 1) : '#p=' + (t.size),
                next: index < t.size ? '#p=' + (index + 1) : '#p=0'
            };
        },
        "skip": function(index) {
            var t = this;
            var end = t.size;
            index = parseInt(index);
            return {
                prev: index > 1 ? '#p=' + (index - 1) : '#p=1',
                next: index < (t.size + 1) ? '#p=' + (index + 1) : '#p=' + (end + 1)
            };
        }
    };
    ifeng.Gallery = function(options) {
        var t = this;
        var o = this.o = {
            thumWidth: 63,//小图宽度
            thumGap: 8,
            thumMoveStep: 5,//小图每次移动距离
            moveSpeed: 300,
            smallpic_currentPage: 0,//当前小图页码，从0开始
            activeThumbCls: "current",
            photoViewMode: 'loop'
        };
        //更新参数
        (function(options) {
            for (var i in o) {
                (options[i] && (o[i] = options[i]));
            }
            t.data = options.data || [];
            t.turn = photoViewMode[options.photoViewMode];
            t.size = t.data.length;
        }
        )(options);
        //小图屏数
        var totalPage = Math.floor((t.size - 1) / o.thumMoveStep);
        var dom = t.dom = $('.mask .picWin img');
        
        //初始化显示，如果没有hash值增加，如果有根据hash值后面的页码显示当前图片
        var oHash = t.parseObj(window.location.hash);
        if (!oHash.p) {
            staSign = false;
            t.changeHash("p=1");
        } else {
            if (oHash.p == (t.size + 1)) {
                t.changeHash("p=" + (t.size + 1));
            }
        }
        t.showPhoto(oHash.p);
        //事件初始化开始
        $("#photoPrevLoading").on("load", function(ev, dom) {
            var oHash = t.parseObj($(".picNext").attr("href"));
            if (oHash.p) {
                if (oHash.p < t.data.length) {
                    (new Image).src = t.data[parseInt(oHash.p) - 1].big_img;
                }
            }
        });


        //图片和图片下方的透明遮罩 作为鼠标感应区
        $(".mouseMask,.photoSet,.bigpic,.picPrev").bind({
            mousemove: function(event) {
                var oHash = t.parseObj(window.location.hash);
                var i = $(".picSet").width() * 1 / 3
                  , e = $(".picSet").offset().left
                  , n = event.pageX;
                if (i > n - e) {
                    //左1/3  
                    $(".mask .picNext,.picSet .picNext").removeClass('js_picNext_hover');
                    if (oHash.p == 1) {
                        $(".picPrev").addClass('cursorchange');
                    } else {
                        $(".picPrev").addClass('js_picPrev_hover');
                        if ($(".picPrev").hasClass("cursorchange")) {
                            $(".picPrev").removeClass('cursorchange');
                        }
                    }
                    ;
                } else {
                    //右2/3
                    $(".picPrev").removeClass('js_picPrev_hover');
                    if ($(".picPrev").hasClass("cursorchange")) {
                        $(".picPrev").removeClass('cursorchange');
                    }
                    $(".picSet .picNext,.mask .picNext").addClass('js_picNext_hover');
                }
            },
            mouseout: function(event) {
                $(".picNext").removeClass('js_picNext_hover');
                $(".mask .picNext").removeClass('js_picNext_hover');
                $(".picPrev").removeClass('cursorchange');
                $(".picPrev").removeClass('js_picPrev_hover');
            },
            click: function(event) {
            // 遮罩层 左1/3，右2/3 点击切换功能
                var i = $(".picSet").width() * 1 / 3
                  , j = $(".mask .mouseMask").width() * 1 / 3
                  , e = $(".picSet").offset().left
                  , n = event.pageX;
                if (i > n - e || n < j) {
                    var oHash = t.parseObj($(".picPrev").attr("href"));
                    if (oHash.p) {
                        event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                        t.showPhoto(oHash.p).changeHash('p=' + oHash.p);
                    }
                } else {
                    var oHash = t.parseObj($(".picNext").attr("href"));
                    if (oHash.p) {
                        event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                        t.showPhoto(oHash.p).changeHash('p=' + oHash.p);
                    }
                }
                return false;
            }
        });
        $(".js_picPrev_hover,.picNext").on("click", function(event) {
            var oHash = t.parseObj($(this).attr("href"));
            if (oHash.p) {
                event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                t.showPhoto(oHash.p).changeHash('p=' + oHash.p);
            }
            return false;
        });
        // $("#thumb li a").on("click", function(event) {
        //     var oHash = t.parseObj($(this).attr("href"));
        //     if (oHash.p) {
        //         event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        //         t.showPhoto(oHash.p).changeHash('p=' + oHash.p);
        //     }
        // });
        //图片右上角 点击进入大图模式
        $(".bigOpen").on('click', function() {
            bigPicFlag = true;
            $('.mask').css('display', 'block');
            $(this).hide();
            $(".bigClos").show();
            $('.mask').siblings().addClass('hidden');
            $('body').addClass('bodyChange');
            var oHash = t.parseObj(window.location.hash);
            var index = parseInt(oHash.p);
            t.resize_pic(index, dom);
            var pad_pic_height = $('.mask .bigpic').height();
            if (device.type === "pad") {
                $('.mask .picPrev').css('height', pad_pic_height);
                $('.mask .picNext').css('height', pad_pic_height);
            };
            t.showPhoto(index);
            request_tongji('pic', 'f_scr');
        }
        );
        //大图模式 关闭
        $(".bigClos").on('click', function() {
            $('.mask').css('display', 'none');
            $(this).hide();
            $('.mask').siblings().removeClass('hidden');
            $('.bigOpen').show();
            $('body').removeClass('bodyChange');
            request_tongji('pic', 'c_scr');
        }
        );
        //查看大图窗口大小改变，图片自适应
        var oHash = t.parseObj(window.location.hash);
        var index = parseInt(oHash.p);
        t.resize_window(index);

        $(window).resize(function() {
            var index = parseInt(t.parseObj(window.location.hash).p);
            if ($('.mask').css('display') == 'block') {

                t.resize_pic(index, dom);
            } else {
                t.resize_window(index);
            }
        }
        );
        //再次浏览
        $('#picBoxPrev').on('click', function() {
            $('#over').hide().siblings().removeClass('hiddenrecommend');
            t.showPhoto(1).changeHash('p=' + 1);
        }
        );
        //下一图集
        $('#picBoxNext').on('click', function() {
            var href;
            if (returnAdValue.backCoverNextAtlas) {
                href = returnAdValue.backCoverNextAtlas + "?_cpb_slide_next&_cpb_slide_next_1";
            } else {
                href = detail.docUrl + "?_cpb_slide_next&_cpb_slide_next_1";
            }
            ;$(this).attr('href', href);
        }
        );
        //下一图集
        $('#overnext').on('click', function() {
            var href;
            if (returnAdValue.backCoverNextAtlas) {
                href = returnAdValue.backCoverNextAtlas + "?_cpb_slide_next&_cpb_slide_next_2";
            } else {
                href = detail.docUrl + "?_cpb_slide_next&_cpb_slide_next_2";
            }
            ;$(this).attr('href', href);
        }
        );
        //再次浏览
        $('#overprev').on('click', function() {
            $('#over').hide().siblings().removeClass('hiddenrecommend');
            $('#footer').removeClass('js_foo');
            t.showPhoto(t.size);
            t.changeHash('p=' + t.size);
        }
        );
        //键盘左右方向键切换和全屏退出功能
        $(document).ready(function() {
            $(document).bind('keydown', function(event) {
                var currKey = 0;
                var e = event || window.event || arguments.callee.caller.arguments[0];
                currKey = e.keyCode || e.which || e.charCode;
                var oHash = t.parseObj(window.location.hash);
                if (currKey == 37) {
                    if (parseInt(oHash.p) > 1) {
                        t.showPhoto(parseInt(oHash.p) - 1).changeHash('p=' + (parseInt(oHash.p) - 1));
                        if (parseInt(oHash.p) == t.size + 1) {
                            $('#over').hide().siblings().removeClass('hiddenrecommend');
                            $('#footer').removeClass('js_foo');
                            t.showPhoto(t.size);
                            t.changeHash('p=' + t.size);
                        }
                    }
                } else if (currKey == 39) {
                    if (parseInt(oHash.p) < (t.size + 1)) {
                        t.showPhoto(parseInt(oHash.p) + 1).changeHash('p=' + (parseInt(oHash.p) + 1));
                    } else {
                        var href;
                        if (returnAdValue.backCoverNextAtlas) {
                            href = returnAdValue.backCoverNextAtlas + "?_cpb_slide_next&_cpb_slide_next_2";
                        } else {
                            href = detail.docUrl + "?_cpb_slide_next&_cpb_slide_next_2";
                        }
                        ;window.open(href);
                    }
                } else if (currKey == 27) {
                    $('.mask').css('display', 'none');
                    $(this).hide();
                    $('.mask').siblings().removeClass('hidden');
                    $('.bigOpen').show();
                    $('body').removeClass('bodyChange');
                    request_tongji('pic', 'c_scr');
                }
            });
        });

        window.onhashchange=function(){ 
                var oHash = t.parseObj(window.location.hash); 
                if(parseInt(oHash.p) == t.size){
                    $('#over').hide().siblings().removeClass('hiddenrecommend');
                    $('#footer').removeClass('js_foo');
                    //t.showPhoto(oHash.p);
                }
                t.showPhoto(oHash.p);
        }
    }
    ifeng.Gallery.prototype = {
        parseObj: function(hash) {
            var rhash = /[#&]([^&=]+)=([^?&=]+)/ig
              , a = rhash.exec(hash)
              , o = {};
            while (a) {
                o[a[1]] = a[2];
                a = rhash.exec(hash);
            }
            return o;
        },
        showPhoto: function(id) {
            var t = this
              , index = isNaN(id) ? 1 : (parseInt(id) < 1 ? 1 : (parseInt(id) > (t.size + 1) ? (t.size + 1) : parseInt(id)))
              , info = t.data[index - 1]
              , turn = t.turn(index);

              returnAdValue.begin = 0;//广告标识位

            if (index < (t.size + 1)) {
                $('#footer').removeClass('js_foo');
                $(".DB_current").html(index);
                if (typeof returnAdValue != 'undefined') {
                    returnAdValue.backCoverCurrentNumber = index;
                }
                //图片加载完后的处理
                var temp = new Image();
                temp.onload = function() {
                    //loading图隐藏，幻灯集显示
                    $(".loading").hide();
                    $(".picSet").css('display', 'block');
            
                    //$("#photoPrevLoading").attr("src", info.big_img);
                    $("#photo").attr("src", info.big_img);
                    t.resize_window(index);
                    $('.photoOperate').css('float', 'left');
                    $('.photoOperate').css('float', '');//处理IE8的bug
                    returnAdValue.begin = 1; //广告标识位
                };
                temp.src = info.big_img;
                $('.hdpPic .bigOpen').show();
                if(bigPicFlag){
                    $("#photo_big").attr("src", info.originalimg);
                };
                
                $(".photoDesc").html(info.title);
                //若摘要存在链接，显示详情内容可点击
                if (info.morelink && info.morelink != '') {
                    var txt = $('<a></a>').attr({
                        'href': info.morelink,
                        'target': '_blank'
                    });
                    txt.html('详细内容&gt;&gt;');
                    $(".photoDesc").append(txt);
                    $(".photoDesc").find('a').addClass('contDetail');
                }
                //更新左右翻页的数码
                $(".picPrev").attr("href", turn.prev);
                $(".picNext").attr("href", turn.next);
                
                if ($('.mask').css('display') == 'block') {
                    t.dom.removeClass('big_Wpic');
                    t.dom.removeClass('big_Hpic');
                    t.resize_pic(index, t.dom);
                }
                $('#titL').show();
                $('.overReTit').css('display', 'none');
            } else {
                if ($('.mask').css('display') == 'block') {
                    $(".bigClos").hide();
                    $('.mask').siblings().removeClass('hidden');
                    $('.bigOpen').show();
                    $('.mask').css('display', 'none');
                    $('body').removeClass('bodyChange');
                }
                if(flagInit){
                    t.recommend();
                    flagInit = false;
                }           
                //最后一页更改标题
                $('#titL').hide();
                $('.overReTit').css('display', 'block');
                $(".picAgain").hover(function() {
                    $(".picAgain").find("span").css('background', 'url(http://y1.ifengimg.com/a/2016/0201/syj/returnbtnhover.png) no-repeat center');
                    $(".againBtn").addClass('js_span');
                }
                , function() {
                    $(".picAgain").find("span").css('background', 'url(http://y1.ifengimg.com/a/2016/0201/syj/returnbtn.png) no-repeat center');
                    $(".againBtn").removeClass('js_span');
                }
                );
                $(function() {
                    $('#over').show().siblings().addClass('hiddenrecommend');
                    $('.hdpHead,.hdpTit,#footer').show();
                    var footer_win = $(window).height();
                    var footer_height = $('#footer').height();
                    var footer_offsetHeight = $('#footer').offset().top;
                    if ((footer_win - footer_height - 1) > footer_offsetHeight) {
                        $('#footer').addClass('js_foo');
                    }
                })
                returnAdValue.backCoverCurrentNumber = index;
            }
            return t;
        },
        changeHash: function(hash) {
            if (parseInt(hash.split('=')[1]) == parseInt(this.size) + 1) {
                window.location.hash = hash + "&_cpb_slide_last";
            } else {
                window.location.hash = hash;
            }
            if (typeof (gaoqingAdImpression) == "function") {
                gaoqingAdImpression();
            }
            if (staSign == true) {
                try {
                    if (typeof hook === 'function') {
                        var str__ = window.location.href.replace(/&/g, '|');
                        hook('&uri=' + encodeURIComponent(str__) + '&HD=HD');
                    }
                } catch (ex) {}
            }
            staSign = true;
            return this;
        },

        resize_pic: function(index, dom) {
            var id = isNaN(index) ? 1 : (parseInt(index) < 1 ? 1 : (parseInt(index) > this.size ? this.size : parseInt(index)));
            var sW = $(window).width();
            var sH = $(window).height();
            var picH = G_listdata[id - 1].picheight;
            var picW = G_listdata[id - 1].picwidth;
            var current_H = sW * 5 / 8 - 27;
            var current_W = sW - 20 - 17;
            if (sW <= 1200) {
                $(".bigpic").height(sH);
                $('.mask .swiper-slide').height(sH);
                $(".bgchange").height(sH);
                if (picW > current_W) {
                    dom.addClass('big_Wpic');
                } else if (picH > current_H) {
                    dom.addClass('big_Hpic');
                }
            } else {
                $('.bigpic,.mask .swiper-slide').height(sH);
                $(".bgchange").height(sH);
                dom.removeClass('big_Wpic');
                dom.removeClass('big_Hpic');
            }
            ;
        },
        resize_window: function(index) {
            var sH = $(window).height();
            var isIE8 = !!window.ActiveXObject && !!document.documentMode;
            if (sH > 528 && sH < 845) {
                var h = sH - 45 - 97 - 19 - 80 + 25;
                $('.loading').height(h);
                if (index <= G_listdata.length) {
                    var imgH = G_listdata[index - 1].picheight;
                }
                $("#photoimg").height(h);
                if (imgH >= h) {
                    $('#photo').height(h);
                } else {
                    if (isIE8 == true) {
                        $("#photo").height(imgH);
                    } else {
                        $("#photo").height('auto');
                    }
                }
                $('.picSet .mouseMask').height(h);
                if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE6.0") {
                    $(".hdpPic .picSet .picWin td").css("font-size", sH - 45 - 97 - 19 - 80 + 25);
                } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE7.0") {
                    $(".hdpPic .picSet .picWin td").css("font-size", sH - 45 - 97 - 19 - 80 + 25);
                }
            } else if (sH < 529) {
                $("#photoimg,.picSet .mouseMask,.loading").height(786 - 45 - 97 - 19 - 80);
                $("#photo").height('auto');
                if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE6.0") {
                    $(".hdpPic .picSet .picWin td").css("font-size", 786 - 45 - 97 - 19 - 80);
                } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE7.0") {
                    $(".hdpPic .picSet .picWin td").css("font-size", 786 - 45 - 97 - 19 - 80);
                }
            } else {
                $("#photoimg,.picSet .mouseMask,.loading").height(600);
                $("#photo").height('auto');
            }
            ;
        },
        recommend:function(){
            var getValue = function(offset){
                var endstr = document.cookie.indexOf(";", offset);
                if (endstr == -1) {
                    endstr = document.cookie.length;
                }
                return unescape(document.cookie.substring(offset, endstr));
            };
            var getCookie = function(name){
                var arg = name + "=";
                var alen = arg.length;
                var clen = document.cookie.length;
                var i = 0;
                while (i < clen) {
                    var j = i + alen;
                    if (document.cookie.substring(i, j) == arg) {
                        return getValue(j);
                    }
                    i = document.cookie.indexOf(" ", i) + 1;
                    if (i == 0) break;
                }
                return "";                
            }
            var userId = getCookie("userid");//用户标识
            //请求智能推荐数据   
            // });
           //  alert(window.XMLHttpRequest)
           //  if(window.XMLHttpRequest){
           //      var xhr = new XMLHttpRequest();
           //      xhr.open('GET','http://10.90.3.227:8088/reco?action=getTopK&uid=1006951827195_y4qnjx2634',true);
           //      xhr.withCredentials = false;
           //      xhr.onload =function() {          
           //        //alert(xhr.response);//reposHTML;
           //        console.log(xhr.response)
           //      };  
           //      xhr.onerror =function() {
           //       alert('error making the request.');
           //      };
           //      xhr.send();
           //  }else{
           //      try{
           //         var xhr = new ActiveXObject("Msxml2.HTTP");
           //      }catch(e){

           //      };
           //      try{
           //         var xhr = new ActiveXObject("microsoft.HTTP");
           //      }catch(e){

           //      };
           //      xhr.onreadystatechange=function(){
           //          if(xhr.readyState==4){
           //              if(xhr.status==200){
           //                  alert(xhr.responseText);
           //              }
           //          }
           //      }
           //      //打开与服务器连接的通道
           //      xhr.open('GET','http://10.90.3.227:8088/reco?action=getTopK&uid=1006951827195_y4qnjx2634',true);
           //      //开始请求并发送参数 
           //      xhr.send();
           // }
            
           // function getXMLHttpRequest(){
           //  if(window.XMLHttpRequest){
           //      return new XMLHttpRequest();
           //  }else{
           //      var names = ["msxml","msxml2","msxml3","Microsoft"];
           //      for (var i = 0; i < names.length; i++){
           //          try{
           //              var name = name[i] + ".XMLHTTP";
           //              return 
           //          }
           //      }
           //  }
           // }

            // 日期格式化
            Date.prototype.pattern = function(fmt) {
                var o = {
                    "M+": this.getMonth() + 1,
                    "d+": this.getDate(),
                    "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
                    "H+": this.getHours(),
                    "m+": this.getMinutes(),
                    "s+": this.getSeconds(),
                    "q+": Math.floor((this.getMonth() + 3) / 3),
                    "S": this.getMilliseconds()
                };
                var week = {
                    "0": "/u65e5",
                    "1": "/u4e00",
                    "2": "/u4e8c",
                    "3": "/u4e09",
                    "4": "/u56db",
                    "5": "/u4e94",
                    "6": "/u516d"
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                if (/(E+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                }
                return fmt;
            }
             //推荐图集功能区开始
            remove = function(arr, dx) {
                if (isNaN(dx) || dx > arr.length) {
                    return false;
                }
                for (var i = 0, n = 0; i < arr.length; i++) {
                    if (arr[i] != arr[dx]) {
                        arr[n++] = arr[i];
                    } else {
                        var data = arr[i];
                    }
                }
                arr.length -= 1;
                return data;
            }
            RandomNumbers = function(arr) {
                var ret = [];
                var i = 0;
                var random_len;
                for (i = 0; i < 6; i++) {
                    random_len = arr.length - 1;
                    ret[i] = remove(arr, parseInt(Math.random() * random_len));
                    //parseInt(Math.random()*9)就是截取上面范围的整数部分，实际结果就是0-8（包括0和8)
                    random_len--;
                }
                return ret;
            }
            var li_list = $('#recommend_slide li');
            var len = li_list.length;
            var initArr = [];
            for (var i = 0; i < len; i++) {
                initArr[i] = i;
            }
            //时间过滤
            var nowDate = new Date();
            var yesterday_milliseconds = nowDate.getTime() - 1000 * 60 * 60 * 24 * 3;
            var yesterday_normal = new Date().setTime(yesterday_milliseconds);
            var yesterday = new Date(yesterday_normal).pattern('yyyy-MM-dd HH:mm:ss');
            var pubTime = [];
            var newArr = [];
            for (var i = 0; i < initArr.length; i++) {
                index = initArr[i];
                pubTime[i] = li_list.eq(index).find('span').html();
                if (pubTime[i] > yesterday) {
                    newArr.push(i);
                }
            }
            if (newArr.length > 6) {
                initArr = newArr;
            }
            var returnArr = RandomNumbers(initArr);
            //排序，使得加的统计跟显示的图片的位置一一对应
            returnArr.sort(function(a, b) {
                return a > b ? 1 : -1
            }
            );
            var flag = 0;
            function renderLi(returnArr) {
                li_list.hide();
                for (i = 0; i < 6; i++) {
                    index = returnArr[i];
                    li_list.eq(index).each(function(index, object) {
                        var href = $(object).find("a").attr("href");
                        href = href + "?_cpb_slide_re&_cpb_slide_re_" + (i + flag * 6 + 1);
                        $(object).find("a").attr("href", href);
                        var imgDom = $(object).find("img");
                        var imgSrc = imgDom.attr("src-info");
                        imgDom.attr("src",imgSrc);
                    });
                    li_list.eq(index).show();
                }
            }

            renderLi(returnArr);
            //换一组功能
            $("#picBoxChange").on('click', function() {
                if (initArr.length >= 6) {
                    returnArr = RandomNumbers(initArr);
                    returnArr.sort(function(a, b) {
                        return a > b ? 1 : -1
                    });
                    flag++;
                } else {
                    flag = 0;
                    for (var i = 0; i < len; i++) {
                        initArr[i] = i;
                        li_list.eq(i).find("a").each(function(index, object) {
                            var href = $(object).attr("href").split('?')[0];
                            $(object).attr("href", href);
                        });
                    }
                    var pubTime = [];
                    var newArr = [];
                    for (var i = 0; i < initArr.length; i++) {
                        index = initArr[i];
                        pubTime[i] = li_list.eq(index).find('span').html();
                        if (pubTime[i] > yesterday) {
                            newArr.push(i);
                        }
                    }
                    if (newArr.length > 6) {
                        initArr = newArr;
                    }
                    var returnArr = RandomNumbers(initArr);
                    returnArr.sort(function(a, b) {
                        return a > b ? 1 : -1
                    });
                }
                renderLi(returnArr);
            });
        }
    }
    window["ifeng"] = ifeng;
}
)
