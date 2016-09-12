/* filePath fetchtemp/scripts/liveStreamVideo_main_pc_7edcb4dc_81c22ac2.js*/

/* filePath fetchtemp/scripts/utils_34612ecc.js*/

define("liveStreamVideo#1.0.9/utils" , [], function () {
  'use strict';

  var containParams = function (orginObj, newObj) {
    var o = {};

    for (var key in orginObj) {
      o[key] = key in newObj ? newObj[key] : orginObj[key];
    }

    return o;
  };

  var filterParams = function (keys, obj) {
    var o = {};
    var key;

    for (var i = 0, iLen = keys.length; i < iLen; i++) {
      key = keys[i];

      if (key in obj) {
        o[key] = obj[key];
      }
    }

    return o;
  };

  var getStarTime = function () {
    return 0;
  };

  var getFrom = function () {
    var from = '',
        url = window.location.href;
    var startIndex = url.indexOf('http://') + 'http://'.length,
        endIndex = url.indexOf('.ifeng.com');

    if (startIndex !== -1 && endIndex !== -1) {
      from = url.substr(startIndex, (endIndex - startIndex));
      return from;
    }

    return from;
  };

  var getCookie = function (name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;

    while (i < clen) {
      var j = i + alen;

      if (document.cookie.substring(i, j) === arg) {
        return (function (offset) {
          var endstr = document.cookie.indexOf(";", offset);

          if (endstr === -1) {
            endstr = document.cookie.length;
          }

          return decodeURIComponent(document.cookie.substring(offset, endstr));
        })(j);
      }

      i = document.cookie.indexOf(" ", i) + 1;

      if (i === 0) {
        break;
      }
    }

    return "";
  };

  return {
    containParams: containParams,
    filterParams: filterParams,
    getStarTime: getStarTime,
    getCookie: getCookie,
    getFrom: getFrom
  };

});
/* filePath fetchtemp/scripts/videoPc_189089d4.js*/

define("liveStreamVideo#1.0.9" , ['F_glue',
   'F_WidgetBase',
   'videoCore#1.0.6',
   "liveStreamVideo#1.0.9/utils",
   'jquery#1.8.1'], function (glue, WidgetBase, video, utils, $) {

  'use strict';

  var win = window;
  var doc = document;
  var uuid = 0;

  var defaultConf = {
    swfUrl: 'http://vxml.ifengimg.com/swf/ifengLivePlayer_v5.0.66_p.swf',
    containerId: '',
    width: 600,
    height: 455
  };

  var defaultParamConf = {
    'allowFullScreen': 'true',
    'wmode': 'transparent',
    'allowScriptAccess': 'always'
  };

  var defaultVarConf = {
    'ChannelID': '',
    'RealStreamUrl':'',
    'from': utils.getFrom(),
    'ADPlay': true,
    'adcpid': 1210,
    'AutoPlay': true,
    'uid': utils.getCookie('userid'),
    'sid': utils.getCookie('sid'),
    'locid': utils.getCookie('ilocid'),
    'subject': 'live',
    'pageurl': window.location.href,
    'PlayerName': 'vLivePlayer',
    'color': '0xC2C2C2',
    'picUrl': 'http://vimg.ifeng.com/live/images/click.jpg',
    'AutoP2P': false,
    'picP2PUrl': 'http://vimg.ifeng.com/live/images/clickp2p.jpg',
    'picP2PLink': 'http://v.ifeng.com/live/phlive.shtml',
    'DisableEPG': false,
    'columnName': '',
    'danmuSpeed': 100,
    'danmu': false,
    'danmuInterval': 3,
    'isVR': false
    // 'preAdType': 0,
    // 'parent': 0,
    // 'adType': 1,
  };

  var transParams = function (params) {

    var transKeys = [
      {key: 'autoPlay', value: 'AutoPlay'},
      {key: 'poster', value: 'picUrl'}
    ];

    for (var i = 0, iLen = transKeys.length; i < iLen; i++) {
      if (transKeys[i].key in params) {
        params[transKeys[i].value] = params[transKeys[i].key];
      }
    }

    return params;
  };

  var Video = WidgetBase.extend({

    version: '1.0.9',
    type: 'liveVideo',
    createModel: function () {
      this.swfId = 'js_streamVideo' + uuid++;
      // this.container = document.getElementById(this.container);
    },

    // create: function (opts) {
    //   Video.superclass.create.call(this, null, {});
    //   this.initModel(opts);
    //   this.createPlayer();
    // },

    mixProperties: function (properties) {
      properties = transParams(properties);
      Video.superclass.mixProperties.call(this, properties);
    },

    resolveTemplate: function () {
      this.conf = utils.containParams(defaultConf, this);
      this.paramConf = utils.containParams(defaultParamConf, this);
      //console.log(this.paramConf);
      this.varConf = utils.containParams(defaultVarConf, this);
      //console.log(this.varConf);
    },

    renderer: function () {
      this.createPlayer();
    },

    bindDataEvent: function () {
    },

    // initModel: function (opts) {
    //   this.swfId = 'js_playVideo' + uuid++;
    //   this.conf = utils.containParams(defaultConf, opts);
    //   this.paramConf = utils.containParams(defaultParamConf, opts);
    //   this.varConf = utils.containParams(defaultVarConf, opts);
    // },

    createPlayer: function () {
      var key;
      var conf = this.conf;
      var param = this.paramConf;
      var varConf = this.varConf;
      var player = new video.Player(this.container, {
        url: conf.swfUrl,
        height: conf.height,
        width: conf.width,
        id: this.swfId
      });

      for (key in param) {
        player.addParam(key, param[key]);
      }

      for (key in varConf) {
        player.addVariable(key, varConf[key]);
      }

      player.play();
      this.player = player;
      player.addCallback("swfplay", videoEnd);
      player.addCallback('shareTo', shareTo);
      player.addCallback('goPage', goPage);
      this.flash = doc.getElementById(this.swfId);
    },

    play: function () {
      console.log(this.flash)
      this.flash.videoPlay();
    },

    pause: function () {
      this.flash.videoPause();
    },

    show: function () {
      $(this.flash).show();
    },

    hide: function () {
      $(this.flash).hide();
    },

    destroy: function () {
      $(this.flash).remove();
    }

  });

  var videoEnd = function () {
    return "the last!";
  };

  var goPage = function (url) {
    window.open(url);
  };

  //分享到各个网站
  var shareTo = function (site, pic, url, title, smallimg) {
    var videoinfo = videoinfo || {url: document.location.href, title: document.title};
    var e = encodeURIComponent;
    var vlink = url || videoinfo.url;//'http://v.ifeng.com/news/world/201101/57b5bddb-36b4-4178-90d3-0f96bad889af.shtml';
    var _url = e(vlink);
    var vtitle = title || videoinfo.title;
    var _title = e(vtitle);
    /*if (eval("_oFlv_c.Content != null")) {
        _content = encodeURIComponent(_oFlv_c.Content);
    }*/
    switch (site) {

    case "ifengkuaibo" :
      break;

    case "ifengteew" :
      var t = _title, z = _url, id = "凤凰视频", type = 1, s = screen;
      var f = "http://t.ifeng.com/interface.php?_c=share&_a=share&", pa = ["sourceUrl=", _url, "&title=", _title, "&pic=", e(smallimg || ""), "&source=", e(id || ""), "&type=", e(type || 0)].join("");

      var a = function () {
        if (!window.open([f, pa].join(""), "", ["toolbar=0,status=0,resizable=1,width=640,height=481,left=", (s.width - 640) / 2, ",top=", (s.height - 480) / 2].join(""))) {
          location.href = [f, pa].join("");
        }
      }

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(a, 0);

      } else {
        a();
      }
      break;

    case "kaixin" :
      window.open("http://www.kaixin001.com/repaste/share.php?rurl=" + _url + "&rtitle=" + _title);
      break;

    case "renren":
      window.open("http://share.renren.com/share/buttonshare.do?link=" + _url + "&title=" + _title);
      break;

    case "sinateew" :
      var l = (screen.width - 440) / 2;
      var t = (screen.height - 430) / 2;
      var smallimg = smallimg || "";

      $.ajax({
        url: 'http://api.t.sina.com.cn/friendships/create/1806128454.xml?source=168486312',
        dataType: 'script',
        success: function () {}  //没有回调
      });
      window.open("http://v.t.sina.com.cn/share/share.php?appkey=168486312&url=" + _url + "&title=" + _title + "&source=ifeng&searchPic=false&sourceUrl=http://v.ifeng.com/&content=utf8&pic=" + smallimg + "&ralateUid=1806128454", "_blank", "toolbar=0,status=0,resizable=1,width=440,height=430,left=" + l + ",top=" + t);
      break;

    case "qqzone" :
      window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + _url);
      break;

    case "qqteew" :
      var _appkey = encodeURI("f8ca1cd768da4529ab190fae9f1bf21d"), _pic = encodeURI(smallimg || ""), _site = "http://v.ifeng.com";
      var _u = "http://v.t.qq.com/share/share.php?title=" + _title + "&url=" + _url + "&appkey=" + _appkey + "&site=" + _site + "&pic=" + _pic;
      window.open(_u, "\u8F6C\u64AD\u5230\u817E\u8BAF\u5FAE\u535A", "width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no");
      break;

    case "163" :
      var url = "link=http://www.ifeng.com&source=" + encodeURIComponent("凤凰网") + "&info=" + _title + " " + _url;
      window.open("http://t.163.com/article/user/checkLogin.do?" + url + "&" + new Date().getTime(), "newwindow", "height=330,width=550,top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "feixin" :
      var u = "http://space.fetion.com.cn/api/share?Source=" + encodeURIComponent("凤凰视频") + "&Title=" + _title + "&url=" + _url + "&IsEditTitle=false";
      window.open(u, "newwindow", "top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "sohuteew" :
      var s = screen, z = vlink, t = vtitle;
      var f = "http://t.sohu.com/third/post.jsp?", p = ["&url=", e(z), "&title=", e(t), "&content=utf-8", "&pic=", e(smallimg || "")].join("");
      var b = function () {
        if (!window.open([f, p].join(""), "mb", ["toolbar=0,status=0,resizable=1,width=660,height=470,left=", (s.width - 660) / 2, ",top=", (s.height - 470) / 2].join(""))) {
          location.href = [f, p].join("");
        }
      }

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(b, 0);
      } else {
        b();
      }
      break;

    case "51com" :
      var u = "http://share.51.com/share/out_share_video.php?from=" + encodeURIComponent("凤凰视频") + "&title=" + _title + "&vaddr=" + _url + "&IsEditTitle=false&charset=utf-8";
      window.open(u, "newwindow", "top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "baiduI":
      var u = 'http://tieba.baidu.com/i/app/open_share_api?link=' + _url,
          o = function () {
            if (!window.open(u)) {
              location.href = u;
            }
          };

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(o, 0);

      } else {
        o();
      }

      return false;

    default:
      return false;
    }
  };

  return Video;
});
/* filePath fetchtemp/scripts/test_main_pc_24ed333d_24ed333d.js*/

/* filePath fetchtemp/scripts/livePic_template_f3f522ad.js*/

define("livePic#1.0.9/template" , ["artTemplate#3.0.3"] , function(artTemplate){
   artTemplate = new artTemplate();
   var _template = {};
   var layout = [];
   layout.push('<div class=\"mod-picPop__109\">')
   layout.push('  <div class=\"w-imgBox js_imgBox\">')
   layout.push('  </div>')
   layout.push('</div>\'')

   _template.layout = artTemplate("layout" , layout.join(''));

   var mask = [];
   mask.push('<div class=\"mod-mask__109\" ></div>')

   _template.mask = artTemplate("mask" , mask.join(''));

   _template.helper = function(name, helper){
      artTemplate.helper(name, helper);
   }
   return _template;
});
/* filePath fetchtemp/scripts/utils_1752f6ff.js*/

define("livePic#1.0.9/utils" , [], function () {
  'use strict';

  return {
  };

});
/* filePath fetchtemp/scripts/mask_f584d013.js*/

define("livePic#1.0.9/mask" , ['F_glue',
   'F_WidgetBase',
   "livePic#1.0.9/template",
   'jquery#1.8.1'], function (glue, WidgetBase, template, $) {

  'use strict';

  var win = window;

  var Mask = WidgetBase.extend({

    type: 'livePic/mask',

    createModel: function () {
      this.isHide = true;
    },

    // create: function (opts) {
    //   Mask.superclass.create.call(this, null, {});
    //   opts = opts || {};
    //   this.isHide = true;
    // },

    resolveTemplate: function () {
      this.layout = $(template.mask());
      this.layout.hide();
    },

    renderer: function () {
      $('body').append(this.layout);
      this.resize();
    },

    bindDataEvent: function () {
      var _this = this;
      var resizeTimer = null;
      this.layout.on('click', function () {
        _this.trigger('click');
      });

      $(win).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          _this.resize();
        }, 100);
      });
    },

    show: function () {
      if (this.isHide === true) {
        this.isHide = false;
        this.layout.show();
      }
    },

    hide: function () {
      if (this.isHide === false) {
        this.isHide = true;
        this.layout.hide();
      }
    },

    resize: function () {
      this.resizeHeight();
      // this.resizeTop();
    },

    resizeHeight: function () {
      this.layout.height($(win).height());
    }

  });

  glue.Events.mixTo(Mask);
  return Mask;
});

/* filePath fetchtemp/scripts/picPc_184122fc.js*/

define("livePic#1.0.9" , ['F_glue',
   'F_WidgetBase',
   "livePic#1.0.9/template",
   "livePic#1.0.9/utils",
   "livePic#1.0.9/mask",
   'jquery#1.8.1'], function (glue, WidgetBase, template, utils, Mask, $) {

  'use strict';

  var win = window;
  var doc = document;

  var Pic = glue.Class(WidgetBase).extend({

    version: '1.0.9',
    type: 'livePic',

    createModel: function () {
      this.src = '';
      this.srcServeUrl = 'http://d.ifengimg.com';
      this.srcRatio = 'mw700';
      this.isHide = true;
      this.mask = new Mask(this);
      this.mask.create();

    },

    // create: function (opts) {
    //   Pic.superclass.create.call(this, null, {});
    //   opts = opts || {};
    //   this.src = opts.src || '';
    //   this.srcServeUrl = opts.srcServeUrl || 'http://d.ifengimg.com';
    //   this.srcRatio = opts.srcRatio || 'mw700';
    //   this.isHide = true;
    //   this.mask = new Mask();
    //   this.mask.create();
    // },

    resolveTemplate: function () {
      this.layout = $(template.layout());

      this.imgBox = this.layout.find('.js_imgBox');
      this.layout.hide();
    },

    bindDomEvent: function () {
      var resizeTimer = null;
      var _this = this;
      this.layout.on('click', $.proxy(this.hide, this));

      $(win).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          _this.resize();
        }, 100);
      });
    },

    renderer: function () {
      $('body').append(this.layout);
    },

    show: function (src) {

      if (this.isHide === false) {
        return;
      }

      this.isHide = false;
      this.layout.fadeIn();
      this.hideHtmlScroll();
      this.mask.show();

      if (typeof src !== 'undfined') {
        this.update(src);
      } else {
        this.resize();
      }

    },

    hide: function () {
      var _this = this;

      if (this.isHide === true) {
        return;
      }

      this.isHide = true;
      this.layout.fadeOut(function () {
        _this.restoreHtmlScroll();
      });
      this.mask.hide();
    },

    update: function (src) {
      var _this = this;
      var img = new Image();

      img.onload = function () {
        _this.resize();
      };

      img.src = this.getSrc(src);
      this.imgBox.html(img);
    },

    getSrc: function (src) {
      var srcRatio = this.srcRatio.lastIndexOf('/') === 0 ?
          this.srcRatio : this.srcRatio + '/';
      var srcServeUrl = this.srcServeUrl.lastIndexOf('/') === 0 ?
          this.srcServeUrl : this.srcServeUrl + '/';
      src = src.replace('http://', '');
      return srcServeUrl + srcRatio + src;
    },

    resize: function () {

      if (this.isHide) {
        return;
      }

      var boxTop;
      var winHeight = $(win).height();
      var imgHeight = this.imgBox.find('img').height();
      this.layout.height(winHeight);

      if (imgHeight > winHeight - 100) {
        boxTop = 50;
      } else {
        boxTop = (winHeight - imgHeight) / 2;
      }

      this.imgBox.css('top', boxTop + 'px');
      this.mask.resize();
    },

    hideHtmlScroll: function () {
      $('html').css('overflow', 'hidden');

      if (!($.browser.msie && $.browser.version === '6.0')) {
        $('html').css('padding-right', '17px');
      }

    },

    restoreHtmlScroll: function () {
      $('html').css('overflow', '');

      if (!($.browser.msie && $.browser.version === '6.0')) {
        $('html').css('padding-right', '');
      }

    }

  });

  return Pic;
});
/* filePath fetchtemp/scripts/livecomment-pc_d2c86050_7d865bbb.js*/

/* filePath fetchtemp/scripts/login_9470f711.js*/

define("comment#1.1.14/Login" , ["F_glue" , 'jquery#1.8.1'] , function(glue , $){

    var listeners = [];
    var Login = function(){};
    //判断是否已经登录
    Login.prototype.execListener = function(userInfo){
        var tmp = [];
        //clone一份，防止执行完毕的用户删除监听，导致不能执行完成
        for(var i=0 ; i<listeners.length; i++){ 
            tmp.push(listeners[i]);
        }

        for(var i=0 ; i<tmp.length; i++){
            tmp[i](userInfo);
        }
    };

    Login.prototype.getCookie =  function (name) {
        var cookie = document.cookie;
        var str = this.removeBlanks(cookie);
        var pairs = str.split(';');
        for (var i = 0; i < pairs.length; i++) {
           var pairSplit = pairs[i].split('=');
           if (pairSplit.length > 1 && pairSplit[0] === name) {
               return pairSplit[1];
           }
        }
        return '';
    };

    Login.prototype.removeBlanks =  function (content) {
        var temp = '';
        for (var i = 0; i < content.length; i++) {
           var c = content.charAt(i);
           if (c !== ' ') {
              temp += c;
           }
        }
        return temp;
    }

    Login.prototype.getUserInfo = function(){
        var sid = this.getCookie('sid');
        if(sid == '' || sid == null){
            return null;
        }else{
            var _userName = decodeURIComponent(sid).substring(32);
            return {'userName' : _userName};
        }
    }
    /**
     * 注册登录后事件
     */
    Login.prototype.addLoginedListener = function(fn){
        listeners.push(fn);
    }


    Login.prototype.removeLoginedListener = function(fn){
        var temp = [];
        for(var i=0 ; i<listeners.length; i++){
            if(listeners[i] != fn){
                temp.push(listeners[i]);
            }
        }
        listeners = temp;
    }

    /**
     * 用户
     */
    Login.prototype.login = function(){
         var _self = this;
         var userInfo = this.getUserInfo();
         if(userInfo !=null){
             _self.execListener(userInfo);
         }else{
              window['REG_LOGIN_CALLBACK'](1, function (optionsORname) {
                  var _userName = 'string' === typeof optionsORname ? optionsORname : optionsORname['uname'];
                  var userInfo = {'userName' : _userName};
                  isLogin = true;
                  _self.execListener(userInfo);
              });
              window['GLOBAL_LOGIN']();
         }
    }

    return new Login();

});

/* filePath fetchtemp/scripts/comment.picture_4ffd0709.js*/

define("comment#1.1.14/picture" , [] , function(){

  "use strict";

  function crc32(str) {
    str = utf8_encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    var crc = 0;
    var x = 0;
    var y = 0;
    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
      y = (crc ^ str.charCodeAt(i)) & 0xFF;
      x = "0x" + table.substr(y * 9, 8);
      crc = (crc >>> 8) ^ x;
    }
    return crc ^ (-1);
  }

  function md5(str) {
    var xl;
    var rotateLeft = function (lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };
    var addUnsigned = function (lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = (lX & 0x80000000);
      lY8 = (lY & 0x80000000);
      lX4 = (lX & 0x40000000);
      lY4 = (lY & 0x40000000);
      lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) {
        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        } else {
          return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    };
    var _F = function (x, y, z) {
      return (x & y) | ((~x) & z);
    };
    var _G = function (x, y, z) {
      return (x & z) | (y & (~z));
    };
    var _H = function (x, y, z) {
      return (x ^ y ^ z);
    };
    var _I = function (x, y, z) {
      return (y ^ (x | (~z)));
    };
    var _FF = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };
    var _GG = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };
    var _HH = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };
    var _II = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };
    var convertToWordArray = function (str) {
      var lWordCount;
      var lMessageLength = str.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = new Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    };
    var wordToHex = function (lValue) {
      var wordToHexValue = "",
        wordToHexValue_temp = "",
        lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        wordToHexValue_temp = "0" + lByte.toString(16);
        wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
      }
      return wordToHexValue;
    };
    var x = [],
      k, AA, BB, CC, DD, a, b, c, d,
      S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22,
      S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20,
      S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23,
      S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;
    str = utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;
    xl = x.length;
    for (k = 0; k < xl; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
      a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
      a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
      a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
      a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }
    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return temp.toLowerCase();
  }

  function sprintf() {
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments,
      i = 0,
      format = a[i++];
    // pad()
    var pad = function (str, len, chr, leftJustify) {
      if (!chr) {
        chr = ' ';
      }
      var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr);
      return leftJustify ? str + padding : padding + str;
    };
    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
      var diff = minWidth - value.length;
      if (diff > 0) {
        if (leftJustify || !zeroPad) {
          value = pad(value, minWidth, customPadChar, leftJustify);
        } else {
          value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
        }
      }
      return value;
    };
    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
      // Note: casts negative numbers to positive ones
      var number = value >>> 0;
      prefix = prefix && number && {
        '2': '0b',
        '8': '0',
        '16': '0x'
      }[base] || '';
      value = prefix + pad(number.toString(base), precision || 0, '0', false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };
    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
      if (precision !== null) {
        value = value.slice(0, precision);
      }
      return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };
    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
      var number;
      var prefix;
      var method;
      var textTransform;
      var value;
      if (substring === '%%') {
        return '%';
      }
      // parse flags
      var leftJustify = false,
        positivePrefix = '',
        zeroPad = false,
        prefixBaseX = false,
        customPadChar = ' ';
      var flagsl = flags.length;
      for (var j = 0; flags && j < flagsl; j++) {
        switch (flags.charAt(j)) {
        case ' ':
          positivePrefix = ' ';
          break;
        case '+':
          positivePrefix = '+';
          break;
        case '-':
          leftJustify = true;
          break;
        case "'":
          customPadChar = flags.charAt(j + 1);
          break;
        case '0':
          zeroPad = true;
          break;
        case '#':
          prefixBaseX = true;
          break;
        }
      }
      // parameters may be null, undefined, empty-string or real valued
      // we want to ignore null, undefined and empty-string values
      if (!minWidth) {
        minWidth = 0;
      } else if (minWidth === '*') {
        minWidth = +a[i++];
      } else if (minWidth.charAt(0) === '*') {
        minWidth = +a[minWidth.slice(1, -1)];
      } else {
        minWidth = +minWidth;
      }
      // Note: undocumented perl feature:
      if (minWidth < 0) {
        minWidth = -minWidth;
        leftJustify = true;
      }
      if (!isFinite(minWidth)) {
        throw new Error('sprintf: (minimum-)width must be finite');
      }
      if (!precision) {
        precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
      } else if (precision === '*') {
        precision = +a[i++];
      } else if (precision.charAt(0) === '*') {
        precision = +a[precision.slice(1, -1)];
      } else {
        precision = +precision;
      }
      // grab value using valueIndex if required?
      value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
      switch (type) {
      case 's':
        return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
      case 'c':
        return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
      case 'b':
        return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'o':
        return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'x':
        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'X':
        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
      case 'u':
        return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'i':
      case 'd':
        number = parseInt(+value, 10);
        prefix = number < 0 ? '-' : positivePrefix;
        value = prefix + pad(String(Math.abs(number)), precision, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
      case 'e':
      case 'E':
      case 'f':
      case 'F':
      case 'g':
      case 'G':
        number = +value;
        prefix = number < 0 ? '-' : positivePrefix;
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
        value = prefix + Math.abs(number)[method](precision);
        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
      default:
        return substring;
      }
    };
    return format.replace(regex, doFormat);
  }

  function strtolower(str) {
    return (str + '').toLowerCase();
  }

  function substr(str, start, len) {
    str += '';
    var end = str.length;
    if (start < 0) {
      start += end;
    }
    end = typeof len === 'undefined' ? end : (len < 0 ? len + end : len + start);
    return start >= str.length || start < 0 || start > end ? !1 : str.slice(start, end);
  }

  function utf8_encode(argString) {
    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = "";
    var start, end;
    var stringl = 0;
    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
      var c1 = string.charCodeAt(n);
      var enc = null;
      if (c1 < 128) {
        end++;
      } else if (c1 > 127 && c1 < 2048) {
        enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
      } else {
        enc = String.fromCharCode((c1 >> 12) | 224) +
            String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.substring(start, end);
        }
        utftext += enc;
        start = end = n + 1;
      }
    }
    if (end > start) {
      utftext += string.substring(start, string.length);
    }
    return utftext;
  }

  var avatarUrl = 'http://ucimg.ifeng.com/upload';
  var getSpecCmtUserImg = function (username, blog) { //获取用户头像
    var img_domian = avatarUrl;
    var key = md5(strtolower(username));
    var dir_1_md = substr(key, 0, 16);
    var dir_1 = sprintf('%u', crc32(dir_1_md));
    dir_1 = dir_1 - Math.floor(dir_1 / 255) * 255;
    var dir_2_md = substr(key, 16);
    var dir_2 = sprintf('%u', crc32(dir_2_md));
    dir_2 = dir_2 - Math.floor(dir_2 / 255) * 255;
    // var filename = dir_1_md;
    var full_path = img_domian + "/" + dir_1 + "/" + dir_2 + "/" + dir_1_md;
    if (blog === true) {
      full_path += '_1';
    }
    return full_path + '.jpg';
  };


  return getSpecCmtUserImg;
});


/* filePath fetchtemp/scripts/comment-base_d1b86262.js*/

define("comment#1.1.14/base" , ["F_glue" , 'jquery#1.8.1' , 'F_WidgetBase' , 'handlebar#1.3.3' , "comment#1.1.14/Login" , "comment#1.1.14/picture"] ,
       function(glue , $ , WidgetBase , Handlebars , Login , userPicture){

    // handlebars register
    Handlebars.registerHelper('each', function(context, options) {
      var ret = "";
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + options.fn(context[i]);
      }
      return ret;
    });

    //注册if/else
    Handlebars.registerHelper('if', function(conditional, options) {
      if(conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    Handlebars.registerHelper('content', function(context, options) {
         return context;
    });

    //盖楼方法
    Handlebars.registerHelper('fang' , function(context, options){

        var ret = '';
        if(context.length >0){
            var counter = context.length;
            var index = 1;
            for(var i=counter ; i > 0; i--){
                var _tmp = [];
                var item = context[i-1];
                _tmp.push('<div class="words mod-ori-comment">');
                _tmp.push('    <span class="t-num">'+(index)+'</span>');
                _tmp.push('    <p class="clearfix w-title">');
                _tmp.push('        <span class="name "><a href="http://comment.ifeng.com/viewpersonal.php?uname='+encodeURIComponent(item.uname)+'" target="_blank">'+item.uname+'</a>[凤凰网'+item.ip_from+']</span>');
                _tmp.push('    </p>');
                _tmp.push('    <p class="content">'+item.comment_contents+'</p>');
                _tmp.push('    <p class="rec"><span class="time">'+item.comment_date+'</span></p>');
                _tmp.push('</div>');
                index++;
                ret += _tmp.join('');
            }
        }
        return ret;
    });
    //end handlebars register


    var userInfo = null;
    var logoutUrl = 'http://my.ifeng.com/logout?backurl=' + encodeURIComponent(location.href);
    var vbUrl = 'http://t.ifent.com';
    var myIfengUrl = 'http://my.ifeng.com';
    var isHide = false;
    var commentCount = 0;
    var joinCount = 0;
    var replyCount = 0;

    var compiledTemplate = null;
    var compiledCommentInput = null;
    var compliedCommentItem = null;

    var comment = WidgetBase.extend({

        // 版本标识，请勿删除与更改
        version: '1.1.14',
        // 组件类型，请勿删除与更改
        type: 'comment',

        initialize: function() {
            var _self = this;
            comment.superclass.initialize.apply(this , arguments);
            this.userInfo = Login.getUserInfo();
            if(this.userInfo === null){ //得到用户信息
                var addListener = function(userInfo){
                    _self.logined(userInfo);
                    Login.removeLoginedListener(addListener); //登录完成后需要注销，防止第二次监听
                };
                Login.addLoginedListener(addListener); //注册用户登录监听事件
            }
        },

        //---------------
        getUserInfo : function(){
            return this.userInfo;
        },

        login : function(){
            Login.login();
        },

        createModel : function(){
            this.version = '1.1.14';
            this.userInfo = Login.getUserInfo(),
            this.hotCurrentStatue = {
                 pageIndex : 1,
                 pageSize :  10
            };
            this.lastCurrentStatue = {
                 pageIndex : 1,
                 pageSize :  10
            };
            this.itemCache = {};
            this.itemtCount = 0;
            this.scrollToDom = null;
            this.model =  glue.modelFactory.define(function(vm){
                vm.getAddr =  'http://comment.ifeng.com/getspecial.php'; //聚合的查询使用getspecial.php , 非聚合的使用get.php
                vm.postAddr = 'http://comment.ifeng.com/post.php';
                vm.joincount = 'http://comment.ifeng.com/joincount.php'; //参与人数
                vm.speUrl = ''; //聚合地址，如果为空则不是聚合
                vm.docUrl = '';      //评论相关地址
                vm.docName = '';      //相关标题
                vm.needLogin = false;  //会否需要登录
                vm.recommendUrl = 'http://comment.ifeng.com/vote.php';   //推荐地址
                vm.isFang = false; //是否盖楼

                vm.isInner = false;  //是否是内嵌，如果是内嵌需要显示箭头

                vm.hotSize = 10;     //最热的显示条数
                vm.showHot = true;   //是否显示最热？
                vm.showHotMoreBtn = true; //是否显示最热的更多
                vm.showHotTitle = true;  //是否显示评论头标题

                vm.lastSize = 10;   //最新条数
                vm.showLast = true; //是否显示最新？
                vm.showLastTitle = true;  //是否显示评论头标题
                vm.showLastMoreBtn = true; //是否显示最新的更多

                vm.useComment = true;   // 用户是否可评论.
                vm.isSpecial = false;
                vm.fllowScroll = true;   //评论输入是否跟随滚动
                vm.showLoginBtn = true;  //是否显示登录按钮
                vm.theme = '';          //组件主题名称
            });
        },

        resolveTemplate : function(){
            var isLogin = this.userInfo != null;
            var html = this.getCompiledTemplate()({'isLogin':isLogin,'userInfo':this.userInfo,'items':[] , 'showHot':this.model.showHot, 'showLast':this.model.showLast,commentCount:0
                                          , 'logoutUrl' : logoutUrl , 'vbUrl' : vbUrl , 'myIfengUrl' : myIfengUrl , 'encodeuname' : (isLogin ? encodeURIComponent(this.userInfo.userName):'')
                                          , 'useComment' : this.model.useComment, 'commentJoinCount':0 , isInner : this.model.isInner
                                          , 'isFang' : this.model.isFang , 'showLoginBtn' : this.model.showLoginBtn , 'theme':this.model.theme
                                        });
            this.container.innerHTML = html;
            //构建回复窗口
        },

        createComplete : function(){
            if(this.model.isSpecial){
               this.model.getAddr = 'http://comment.ifeng.com/getspecial.php';
            }else{
               this.model.getAddr = 'http://comment.ifeng.com/get.php';
            }
            this.hotCurrentStatue.pageSize = this.model.hotSize;
            this.lastCurrentStatue.pageSize = this.model.lastSize;
            this.requestCommentData();
        },

        requestCommentData : function(){
            var _self = this;
            if(this.model.showHot){
                this.getCommentList('hot');
            }
            if(this.model.showLast){
                this.getCommentList('last');
            }
            if(!this.model.showHot && !this.model.showLast){
                //使用joincount 进行计数
                $.ajax({
                    url:this.model.joincount,
                    data: {docUrl : _self.model.docUrl},
                    dataType: 'jsonp',
                    cache: true,
                    timeout : 10000, //10秒timeout
                    jsonpCallback: '__commentJoinCountCallback__',
                    success : function(){
                        _self.commentCount(commentCount);
                        _self.commentJoinCount(joinCount);
                    }
                })
            }
        },

        loadCompleted : function(){},

        bindDomEvent : function(){

            var _self = this;
            //专栏回复
            $(this.container).on('click' , '.js_submit' , function(){
                  if(_self.userInfo == null && _self.model.needLogin){
                     Login.login();
                  }else{
                      var conentEle = $(_self.container).find('.js_commentcontent')[0];
                      _self.publishComment(conentEle);
                  }
                  return false;
            });

            
            $(this.container).on('focus' , '.js_commentcontent' , function(){
                    var dv = $(this).val();
                    if(dv.match(/^文明上网，不传谣言/)){
                        $(this).val(dv.replace(/^文明上网，不传谣言/, ''));
                        return false;
                    }
            });

            $(this.container).on('blur' , '.js_commentcontent' , function(){
                    var dv = $(this).val();
                    if(dv == ''){
                        $(this).val('文明上网，不传谣言');
                        return false;
                    }
            });
            

            $(this.container).on('click' , '.uptimes' , function(){
                var id = $(this).attr('data-value');
                _self.vote(id , $(this));
                return false;
            });

            $(this.container).on('click' , '.js_login' , function(){
                 Login.login();
                 return false;
            });

            //更多数据
            $(this.container).on('click.lastmore' , '.js_lastmore' , function(){
                 var type = $(this).attr('data-type');
                 _self.getCommentList(type);
                 return false;
            });

            $(this.container).on('click.hotmore' , '.js_hotmore' , function(){
                 var type = $(this).attr('data-type');
                 _self.getCommentList(type);
                 return false;
            });

            $(this.container).on('click' , '.js_btn_submit' , function(){
                var qid = $(this).attr('data-quoteid');
                var contentEle = $(_self.container).find('#replycontent_'+qid);
                _self.reply(qid , contentEle);
                return false;
            });


            window.__commentJoinCountCallback__ = function(commentCount_ , joinCount_ , replyCount_){
                commentCount =commentCount_;
                joinCount = joinCount_;
                replyCount = replyCount_;
            };

        },


        bindDataEvent : function(){},

        /**
         * 登录后的回调方法
         * @params userInfo 登录的用户
         */
        logined : function(_userInfo){
             this.userInfo = _userInfo;
             this.refreshInput();
        },

        /**
         * 退出的回调方法
         */
        logout : function(){
            this.refreshInput();
        },

        //刷新回复、评论输入
        refreshInput : function(){
            var params = {'isLogin':this.userInfo != null ,'userInfo':this.userInfo, encodeuname : encodeURIComponent(this.userInfo.userName)
                           ,'logoutUrl':logoutUrl , 'vbUrl':vbUrl , 'myIfengUrl':myIfengUrl , useComment : this.model.useComment
                           , 'commentCount' : this.itemtCount , isFang : this.model.isFang , showLoginBtn : this.model.showLoginBtn
                         }
            var commentInput = $(this.container).find('.js_commentInput')[0];
            var val = $(commentInput).find('.js_commentcontent').val(); //得到评论中的文字
            params.oldValue = val;
            var html = this.getCompiledCommentInput()(params);
            $(commentInput).replaceWith(html);
        },

        /**
         * 发表评论
         * post.php  接口名称
         * quoteId : 回复的评论id
         * docName : 回复评论所在单页标题
         * docUrl  : 回复评论所在单页url
         * speUrl :  单页所在专题URL
         * content : 回复内容
         */
        publishComment : function(conentEle){
            var _self = this;
            var content = $(conentEle).val();
            if(content == ''){
                alert('请输入内容!')
                return false;
             }
            var params = {};
            params.docUrl = this.model.docUrl;
            params.speUrl = this.model.speUrl
            params.docName = this.model.docName;
            params.format = 'js';
            params.content = content;

            $.ajax({
                url : this.model.postAddr,
                data : params,
                dataType: 'jsonp',
                cache: true,
                jsonpCallback: '__publishCallback__',
                success : function(result){
                    alert('发布成功！');
                    $(conentEle).val('');
                    if(_self.userInfo != null && typeof _self.userInfo != 'undefined'){
                        var item = {
                            uname : _self.userInfo.userName,
                            comment_contents : content.replace(/\r|\n/g , '<br/>'),
                            isMock : true   //模拟回帖
                        }
                    }else{
                        var item = {
                            uname : "手机用户",
                            comment_contents : content.replace(/\r|\n/g , '<br/>'),
                            isMock : true   //模拟回帖
                        }
                    }
                    _self.addItems([item], 'last');
                },
                error : function(){
                }
            });
        },

        /**
         * 回复用户评论，
         * post.php  接口名称
         * @param qid : 评论id
         * @param contentEle 回复的内容的输入容器
         */
        reply : function(qid , contentEle){
             var content = $(contentEle).val();
             if(content == ''){
                alert('请输入内容!')
                return false;
             }
             var obj = this.itemCache[qid];
             if(typeof obj != 'undefined'){
                var params = {};
                params.docUrl = obj.doc_url;
                params.speUrl = obj.speUrl
                params.docName = obj.doc_name;
                params.quoteId = qid;
                params.format = 'js';
                params.content = content;
                $.ajax({
                    url : this.model.postAddr,
                    data : params,
                    dataType: 'jsonp',
                    cache: true,
                    jsonpCallback: '__replycallback__',
                    success : function(result){
                        alert('回复成功！');
                        $(contentEle).val('');
                    },
                    error : function(){
                        alert('error');
                    }
                });
             }
        },

        /**
         * 推荐
         */
        vote : function (coment_id , ele) {
            var lastTime = window._comment_vita_time || 0;
            var curTime = new Date();
            if(curTime.getTime() - lastTime < 5000){
                alert('5秒钟内不得重复投票，请稍后再试');
                return;
            }
            window._comment_vita_time = curTime.getTime();
            $.ajax({
                url : this.model.recommendUrl,
                data: { 'cmtId' : coment_id , job : 'up' , 'format':'js', rt: 'sj' , docUrl : this.model.docUrl},
                dataType: 'jsonp',
                cache: true,
                jsonpCallback: '__votecallback__',
                success : function(result){
                    var id = ele.attr('data-value');
                    $('#up'+id).text(parseInt($('#up'+id).text())+1);
                },
                error : function(){
                }
            });
        },

        //刷新整个评论
        refresh : function(){
            this.hotCurrentStatue.pageIndex = 1;
            this.lastCurrentStatue.pageIndex = 1;
            $("#commentlast").empty();
            $("#commentHot").empty();
            this.requestCommentData();
        },

        /**
         * docurl   评论相关的url
         * format   返回数据的格式 js xml
           job = 1  固定
           pagesize 每页的数量
           p  页号
         */
        getCommentList : function(commentType){
            this.morehide(commentType);  //隐藏更多按钮
            var speUrl = this.model.speUrl;
            var _self = this;
            var _pageSize = 5 , requestParams = {}, _p = 0;
            if (commentType == 'hot') {
                requestParams['orderby'] = 'uptimes';
                _pageSize = this.hotCurrentStatue.pageSize;
                _p = this.hotCurrentStatue.pageIndex;
            }

            if (commentType == 'last') {
                _pageSize = this.lastCurrentStatue.pageSize;
                _p = this.lastCurrentStatue.pageIndex;
            }

            requestParams.speurl = speUrl;
            requestParams.docurl = this.model.docUrl;
            requestParams.format = 'js';

            if(this.model.isSpecial){
                requestParams.job = '9';
            }else{
                requestParams.job = '1';
            }
            requestParams.pagesize = _pageSize;
            requestParams.p = _p;

            $.ajax({
                url : this.model.getAddr,
                data: requestParams,
                dataType: 'jsonp',
                cache: true,
                timeout : 10000, //10秒timeout
                jsonpCallback: commentType == 'hot' ? 'hotCommetCallback' : 'newCommentCallback',
                success : function(result){

                    var _list = null;
                    if(result.comments == 0){ //如果是数字
                        _list = [];
                    }else if($.isPlainObject(result.comments)){
                        _list  = [result.comments];
                    }else{
                        _list  = result.comments || [];
                    }
                    //设置用户头像
                    _self.commentCount(result.count);  //回复数
                    _self.commentJoinCount(result.join_count); //参与人数
                    _self.itemtCount = result.count;  //记录总数防止登录后刷新掉
                    if(_list.length >0){
                        _self.addItems(_list , commentType , requestParams.pagesize);
                        if(commentType == 'hot'){
                            _self.hotCurrentStatue.pageIndex = _self.hotCurrentStatue.pageIndex+1;
                        }else if(commentType == 'last'){
                            _self.lastCurrentStatue.pageIndex = _self.lastCurrentStatue.pageIndex+1;
                        }
                    }else{
                        _self.moreShow(commentType , false);
                    }
                },
                error : function(){
                    _self.moreShow(commentType);
                }
            })
        },

        /**
         * 添加数据
         * @param items 需要添加的发帖
         * @param commentType 评论的类型
         * @param pageSize 页大小
         */
        addItems : function(items , commentType , pageSize){
            $(this.container).find("ul li:last-child").removeClass("last-child");
             var _list = items;
             var _self = this;
             var lastItem = null;
             for(var i=0 ; i<_list.length; i++){
                var item = _list[i];
                _self.itemCache[item.comment_id] = item;
                item.userPicture = userPicture(item.uname , true);
                item.encodeuname = encodeURIComponent(item.uname);
                item.speUrl = speUrl;
                item.isFang = _self.model.isFang;
                item.isLogin = this.userInfo != null;
                item.hasParent = typeof item.parent  != 'undefined' && item.parent.length > 0;
                if(i==_list.length-1){
                    item.lastItem = true;
                }
            }
            var html = _self.getCompliedCommentItem()({'items':_list});
            if(commentType == 'hot' && _self.model.showHot){
                var hot = $(_self.container).find('#commentHot');
                var nodata  = false;
                if(hot.length == 0){
                     nodata = true;
                     var showTitle = _self.model.showHotTitle;
                     var _html = Handlebars.compile(_self.getCommentHead())({showHot:true,'showTitle':showTitle});
                     $(_self.container).find('.js_box_comment_hot').append(_html);
                     hot = $(_self.container).find('#commentHot');
                 }
                if(item.isMock){ //是模拟数据
                    var children = hot.children();
                    if(children.length >0){
                        children.first().before(html);
                    }else{
                        hot.append(html);
                    }
                }else{
                    hot.append(html);
                }
                hot.css('zoom','1');
                _self.moreShow(commentType , (_list.length >=  pageSize && _self.model.showHotMoreBtn) || (!item.isMock && !nodata));
            }else if(commentType == 'last' && _self.model.showLast){
                var last = $(_self.container).find('#commentlast');
                var  nodata = false;
                if(last.length == 0){
                     nodata = true;
                     var showTitle = _self.model.showLastTitle;
                     var _html = Handlebars.compile(_self.getCommentHead())({showLast:true,'showTitle':showTitle});
                     $(_self.container).find('.js_box_comment_last').append(_html);
                     last = $(_self.container).find('#commentlast');
                 }
                 if(item.isMock){
                    var children = last.children();
                    if(children.length>0){
                        children.first().before(html);
                    }else{
                        last.append(html);
                    }
                 }else{
                   last.append(html);
                 }
                last.css('zoom','1');
                _self.moreShow(commentType , (_list.length >=  pageSize && _self.model.showLastMoreBtn) || (!item.isMock && !nodata));
            }
            $(this.container).find("ul li:last-child").addClass("last-child");
        },

        //修改评论数
        commentCount : function(count){
            $(this.container).find('.js_commentCount').html(count);
        },

        commentJoinCount : function(count){
            $(this.container).find('.js_commentJoinCount').html(count);
        },

        hotAlreadyInit : false,
        lastAlreadyInit : false,
        /**
         * @commentType 评论类型
         * @hasType  是否有下一页
         */
        moreShow : function(commentType , hasNext){
            var _self = this;
            if(commentType == 'hot'){
                $(this.container).find('.js_hotloading').hide();
                $(this.container).find('.js_hotmore').show();
                if(!hasNext && !this.hotAlreadyInit){
                    //当没有数据时，需要能将原来的数据展开，关闭
                    $(this.container).find('.js_hotmore span').text('收起');
                    $(this.container).off('.hotmore');
                    var isshow = true;
                    this.hotAlreadyInit = true;
                    $(this.container).find('.js_hotmore').on('click' , function(){
                        $(_self.container).find('.js_box_comment_hot .mod-comment-con').toggle();
                        $(_self.container).css('zoom','1');
                        if(isshow){
                            if(_self.scrollToDom){
                                var offset = $(_self.scrollToDom).offset();
                            }else{
                                var offset = $(_self.container).find('.mod-list').offset();
                            }
                            var top = offset.top;
                            var stop =  $(window).scrollTop();
                            if(stop > top){
                                $(window).scrollTop(top);
                            }
                        }
                        isshow = !isshow;
                        var txt = isshow ? "收起" : "展开";
                        $(_self.container).find('.js_hotmore span').text(txt);
                        return false;
                    })
                }
            }

            if(commentType == 'last'){
                $(this.container).find('.js_lastloading').hide();
                $(this.container).find('.js_lastmore').show();
                if(!hasNext && !this.lastAlreadyInit){
                    $(this.container).find('.js_lastmore').show();
                    $(this.container).find('.js_lastmore span').text('收起');
                    $(this.container).off('.lastmore');
                    var isshow = true;
                    this.lastAlreadyInit = true;
                    $(this.container).find('.js_lastmore').on('click' , function(){
                        $(_self.container).find('.js_box_comment_last .mod-comment-con').toggle();
                        if(isshow){
                            if(_self.scrollToDom){
                                var offset = $(_self.scrollToDom).offset();
                            }else{
                                var offset = $(_self.container).find('.mod-list').offset();
                            }
                            var top = offset.top;
                            var stop =  $(window).scrollTop();
                            if(stop > top){
                                $(window).scrollTop(top);
                            }
                        }
                        isshow = !isshow;
                        var txt = isshow ? "收起" : "展开";
                        $(_self.container).find('.js_lastmore span').text(txt);
                        return false;
                    })
                }
            }
        },

        //隐藏更多按钮
        morehide : function(commentType){
            if(commentType == 'hot'){
                $(this.container).find('.js_hotloading').show();
                $(this.container).find('.js_hotmore').hide();
            }

            if(commentType == 'last'){
                $(this.container).find('.js_lastloading').show();
                $(this.container).find('.js_lastmore').hide();
            }
        },

        //隐藏组件
        hide : function(){
            $(this.container).hide();
            isHide = true;
        },

        show : function(){
            $(this.container).show();
            isHide = false;
        },


        isHide : function(){
            return isHide;
        },

        getCommentHead : function(){
            var comment = [];
            comment.push('{{#if showHot}}');
            comment.push('{{#if showTitle}}');
            comment.push('<div class="mod-comment-typeTitle">');
            comment.push('    <h4 class="title">最热评论</h4>');
            //comment.push('    <span class="arr"></span>');
            comment.push('</div>');
            comment.push('{{/if}}')
            comment.push('<div class="mod-comment-con" ><ul class="mod-comment-ul" id="commentHot"></ul></div>');
            comment.push('<div class="mod-loadBox">');
            comment.push('    <span class="mod-loading js_hotloading" style="display:none;"></span>');
            comment.push('    <a href="javascript:void(0)" class="more-btn js_hotmore js_a_more" target="_blank" data-type="hot"><span>查看更多评论</span></a>');
            comment.push('</div>');
            comment.push('{{/if}}');
            //最新评论
            comment.push('{{#if showLast}}');
            comment.push('{{#if showTitle}}');
            comment.push('<div class="mod-comment-typeTitle">');
            comment.push('    <h4 class="title">最新评论</h4>');
            //comment.push('    <span class="arr"></span>');
            comment.push('</div>');
            comment.push('{{/if}}')
            comment.push('<div class="mod-comment-con" ><ul class="mod-comment-ul" id="commentlast"></ul></div>');
            comment.push('<div class="mod-loadBox">');
            comment.push('    <span class="mod-loading js_lastloading" style="display:none;"></span>');
            comment.push('    <a href="javascript:void(0)" class="more-btn js_lastmore js_a_more" target="_blank" data-type="last"><span>查看更多评论</span></a>');
            comment.push('</div>');
            comment.push('{{/if}}');
            return comment.join('');
        },

        getCommentTemplate : function(){
            var comment = [];
            comment.push('<div class="mod-comment {{theme}}">');
            comment.push('<div class="mod-list">');
            comment.push(this.getCommentInput()); //回复的输入框
            comment.push('<div class="mod-comment-list">')
            comment.push('<div class="js_box_comment_hot mod-comment-blo"></div>');
            comment.push('<div class="js_box_comment_last mod-comment-blo"></div>');
            comment.push('</div>')
            comment.push('</div>');
            comment.push('</div>');
            return comment.join('');
        },

        //评论块
        getCommentItem : function(){
            var comment = [];

            comment.push('{{#each items}}');
            comment.push('{{#if isMock}}');

            comment.push('<li>')
            comment.push('    <div class="words js_item">')
            comment.push('        <p class="clearfix w-title"><span class="name "><a href="http://comment.ifeng.com/viewpersonal.php?uname={{uname}}" target="_blank">{{uname}}</a>[凤凰网{{ip_from}}网友]</span></p>')
            comment.push('        {{#if hasParent}}');
            comment.push('        <div class="mod-commentListTower">')
            comment.push('        </div>');
            comment.push('        {{/if}}');
            comment.push('        <p class="content">{{#content comment_contents}}{{/content}}</p>')
            comment.push('    </div>')
            comment.push('</li>');
            comment.push('{{else}}');
            comment.push('<li>')
            comment.push('    <div class="words js_item">')
            comment.push('        <p class="clearfix w-title"><span class="name "><a href="http://comment.ifeng.com/viewpersonal.php?uname={{uname}}" target="_blank">{{uname}}</a>[凤凰网{{ip_from}}网友]</span></p>')
            comment.push('        {{#if hasParent}}');
            comment.push('        <div class="mod-commentListTower">')
            comment.push('             {{#if isFang}}{{#fang parent}}{{/fang}}{{/if}}');
            comment.push('        </div>')
            comment.push('        {{/if}}');
            comment.push('        <p class="content">{{#content comment_contents}}{{/content}}</p>')
            comment.push('        <p class="rec js_showReply" data-quoteId="{{comment_id}}">')
            comment.push('            <span class="right-box">')
            comment.push('                <a href="javascript:;" target="_blank" class="uptimes" data-value="{{comment_id}}">推荐<em class="highlight" id="up{{comment_id}}">{{uptimes}}</em></a><em>/</em><a href="javascript:void(0);" data-quoteId="{{comment_id}}" class="js_msgReply">回复</a>')
            comment.push('            </span>')
            comment.push('            <span class="time">{{comment_date}}</span>')
            comment.push('        </p>')
            comment.push('        <div class="js_fuc"></div>');
            comment.push('          '+this.getPhoneReply());
            comment.push('    </div>')
            comment.push('</li>');
            comment.push('{{/if}}')
            comment.push('{{/each}}');
            return comment.join('');
        },

        //phone 回复
        getPhoneReply : function(){
            return '';
        },
        /**
         * 评论发表
         */
        getCommentInput : function(){

            var commentInput = [];
            commentInput.push('{{#if useComment}}');
            commentInput.push('{{#if isLogin}}');
            commentInput.push('<div class="mod-comment-area js_commentInput">')
            commentInput.push('    {{#if isInner}}<span class="re-arr"></span>{{/if}}');
            commentInput.push('    <div class="top clearfix">')
            commentInput.push('        <p class="top-txt">')
            commentInput.push('          <span class="right-box">')
            commentInput.push('            <a class="" href="javascript:;"><span class="num js_commentCount">{{commentCount}}</span>条评论</a>')
            commentInput.push('            <em>/</em>')
            commentInput.push('            <a class="" href="javascript:;"><span class="num js_commentJoinCount">{{commentJoinCount}}</span>人参与</a>')
            commentInput.push('           </span>')
            commentInput.push('            <span class="txt">网友评论</span>')
            commentInput.push('        </p>')
            commentInput.push('    </div>')
            commentInput.push('    <div class="middle">')
            commentInput.push('        <form action="">')
            commentInput.push('            <textarea name="comment" id="" class="comment-area  on js_commentcontent">文明上网，不传谣言</textarea>')
            commentInput.push('        </form>')
            commentInput.push('    </div>')
            commentInput.push('    <div class="submit">')
            commentInput.push('        <a href="javascript:;" class="submit-btn js_submit">发表评论</a>')
            commentInput.push('        <a class="user-name" href="http://comment.ifeng.com/viewpersonal.php?uname={{encodeuname}}">{{userInfo.userName}}</a><em>/</em><a href="{{logoutUrl}}">退出</a>')
            commentInput.push('    </div>')
            commentInput.push('</div>');
            commentInput.push('{{else}}'); //----------------
            commentInput.push('<div class="mod-comment-area js_commentInput">')
            commentInput.push('    {{#if isInner}}<span class="re-arr"></span>{{/if}}');
            commentInput.push('    <div class="top clearfix">')
            commentInput.push('        <p class="top-txt">')
            commentInput.push('          <span class="right-box">')
            commentInput.push('            <a class="" href="javascript:;"><span class="num js_commentCount">{{commentCount}}</span>条评论</a>')
            commentInput.push('            <em>/</em>')
            commentInput.push('            <a class="" href="javascript:;"><span class="num js_commentJoinCount">{{commentJoinCount}}</span>人参与</a>')
            commentInput.push('           </span>')
            commentInput.push('            <span class="txt">网友评论</span>')
            commentInput.push('        </p>')
            commentInput.push('    </div>')
            commentInput.push('    <div class="middle">')
            commentInput.push('        <form action="">')
            commentInput.push('            <textarea name="comment" id="" class="comment-area  on js_commentcontent">文明上网，不传谣言</textarea>')
            commentInput.push('        </form>')
            commentInput.push('    </div>')
            commentInput.push('    <div class="submit">')
            commentInput.push('        <a href="javascript:;" class="submit-btn js_submit">发表评论</a>')
            commentInput.push('        <a class="login js_login" href="javascript:;">登录</a>')
            commentInput.push('    </div>')
            commentInput.push('</div>');
            commentInput.push('{{/if}}');
            commentInput.push('{{/if}}');
            return commentInput.join('');
        },

        getCompiledTemplate : function(){
            if(compiledTemplate == null){
                compiledTemplate = Handlebars.compile(this.getCommentTemplate());
            }
            return compiledTemplate;
        },

        getCompiledCommentInput : function(){
            if(compiledCommentInput == null){
                compiledCommentInput = Handlebars.compile(this.getCommentInput());
            }
            return compiledCommentInput;
        },

        getCompliedCommentItem : function(){
            if(compliedCommentItem == null){
                compliedCommentItem = Handlebars.compile(this.getCommentItem());
            }
            return compliedCommentItem;
        }

    });

    return comment;
});

/* filePath fetchtemp/scripts/comment-pc_f558a6d4.js*/

define("comment#1.1.14" , ['jquery#1.8.1' , 'F_glue' , "comment#1.1.14/base" , 'handlebar#1.3.3'] , function($ , glue , CommentBase , Handlebars) {

     var logoutUrl = 'http://my.ifeng.com/logout?backurl=' + encodeURIComponent(location.href);
     var vbUrl = 'http://t.ifent.com';
     var myIfengUrl = 'http://my.ifeng.com';
     var CommentPc = glue.Class(CommentBase).extend({
        placeholderDiv : null,
        commentInput : null,
        commentTextAreaHeight : null,
        commentInputTop : null,
        commentInputPosTop : null,
        commentInputHeight : null,
        commentInputWidth : null,
        commentInputBottom : null,
        hotComment : null,
        hotCommentTop : null,
        hotCommentHeight : null,
        hotCommentBottom : null,
        lastComment : null,
        lastCommentTop : null,
        lastCommentHeight : null,
        lastCommentBottom : null,

        logined : function(_userInfo){
             CommentPc.superclass.logined.call(this , _userInfo);
             this.reloadEle();
        },

        reloadEle : function(){
            //计算高度
            this.hotComment = $(this.container).find('.js_box_comment_hot');
            this.hotCommentTop = this.hotComment.length == 0 ? this.commentInputBottom : this.hotComment.offset().top;
            this.hotCommentHeight = this.hotComment.length == 0 ? 0 : this.hotComment.outerHeight();
            this.hotCommentBottom = this.hotComment.length == 0 ? this.commentInputBottom : this.hotCommentTop + this.hotCommentHeight;
            this.lastComment = $(this.container).find('.js_box_comment_last');
            this.lastCommentTop = this.lastComment.length == 0 ? this.hotCommentBottom : this.lastComment.offset().top;
            this.lastCommentHeight = this.lastComment.length == 0 ? 0 : this.lastComment.outerHeight();
            this.lastCommentBottom = this.lastComment.length == 0 ? this.hotCommentBottom : this.lastCommentTop + this.lastCommentBottom;
        },
        //模板加载完毕后计算回复输入的位置
        resolveTemplate : function(){
            CommentPc.superclass.resolveTemplate.call(this , []);
            placeholderDiv = null;
            this.commentInput = $(this.container).find('.js_commentInput');
            var oset = this.commentInput.offset();
            this.commentInputTop = oset.top;
            this.commentInputPosTop = this.commentInput.position().top;
            this.commentInputHeight = this.commentInput.outerHeight();
            this.commentInputBottom = this.commentInputTop + this.commentInputHeight;
            this.commentTextArea = this.commentInput.find('textarea').height();
            this.commentInputWidth = this.commentInput.width();
        },
        //dom 绑定事件
        bindDomEvent : function(){

            CommentPc.superclass.bindDomEvent.call(this , []);
            var _self = this;
            //回复窗口
            $(this.container).on('click' , '.js_msgReply' , function(){
              if(_self.getUserInfo() == null && _self.model.needLogin){
                 _self.login();
              }else{
                 if($(this).attr('show')=='true'){
                     $(this).parents('.js_item').find('.js_fuc').empty();
                     $(this).text('回复');
                     $(this).attr('show' , 'false');
                 }else{
                     var params = {};
                     var userInfo = _self.getUserInfo();
                     var quoteid = $(this).attr('data-quoteId'); 
                     var allReply = $(_self.container).find('.js_msgReply');
                     allReply.text('回复');
                     allReply.attr('show' , 'false');
                     $(_self.container).find('.js_box_reply_input').remove(); //删除一个窗口
                     var html = compliedReplyInput({'isLogin':(userInfo!=null),'userInfo': userInfo, encodeuname : encodeURIComponent(userInfo==null?'':userInfo.userName)
                                                     ,'logoutUrl':logoutUrl , 'vbUrl':vbUrl , 'myIfengUrl':myIfengUrl , useComment : _self.model.useComment
                                                     , 'quoteid' : quoteid , isFang : _self.model.isFang
                                                   });
                     $(this).parents('.js_item').find('.js_fuc').append(html);
                     $(this).attr('show' , 'true');
                     $(this).text('取消');
                 }
              }
              return false;
            });

            placeholderDiv = null;
            //如果可以发帖
            if(_self.model.useComment && _self.model.fllowScroll){
                if($.browser.msie && ($.browser.version == "6.0")){
                    _self.ie6Scroll();
                }else{
                    _self.scroll();
                }
                $(_self.container).on('click' , '.js_commentcontent' , function(){
                    if(_self.commentInput.hasClass('dis_none') || _self.commentInput.hasClass('dis_none_abs')){
                        $('.js_commentcontent').height(65);
                    }
                    return false;
                });
                $('body').bind('click' , function(){
                    if(_self.commentInput.hasClass('dis_none') || _self.commentInput.hasClass('dis_none_abs')){
                        $('.js_commentcontent').height(28);
                    }
                })
            }
         },
         //IE6滚动
         ie6Scroll : function(){
            var _self = this;
            $(window).scroll(function(){
               if(!_self.isHide()){ //显示状态
                 var scrTop = $(window).scrollTop();
                 _self.reloadEle();
                 if(scrTop>=_self.commentInputBottom  && scrTop<_self.lastCommentBottom){
                         //添加一个占位div
                     /*
                     if(_self.placeholderDiv == null){
                         _self.placeholderDiv =  $('<div id="placeholderDiv">')
                         _self.placeholderDiv.css('height' , _self.commentInputHeight);
                         _self.commentInput.before(_self.placeholderDiv);
                     }
                     */
                     _self.commentInput.addClass('dis_none_abs');
                     _self.commentInput.css('top' , (_self.commentInputPosTop + (scrTop - _self.commentInputTop)));
                     _self.commentInput.css('width' , _self.commentInputWidth);
                     _self.commentInput.find('.js_commentcontent').height(28);
                 }else{
                     //$(_self.contianer).find('#placeholderDiv').remove();
                     _self.placeholderDiv = null;
                     _self.commentInput.removeClass('dis_none_abs');
                     _self.commentInput.css('width' , '');
                     _self.commentInput.css('top' , '');
                     _self.commentInput.find('.js_commentcontent').height(65);
                 }
              }
            });
         },

         //非IE6滚动
         scroll : function(){
            var _self = this;
            $(window).scroll(function(){
               if(!_self.isHide()){ //显示状态
                 var scrTop = $(window).scrollTop();
                 _self.reloadEle();
                 if(scrTop>=_self.commentInputBottom  && scrTop<_self.lastCommentBottom-110){
                         //添加一个占位div
                     if(_self.placeholderDiv == null){
                         _self.placeholderDiv =  $('<div id="placeholderDiv">')
                         _self.placeholderDiv.css('height' , _self.commentInputHeight);
                         _self.commentInput.before(_self.placeholderDiv);
                     }
                     _self.commentInput.addClass('dis_none');
                     _self.commentInput.css('width' , _self.commentInputWidth);
                     _self.commentInput.find('.js_commentcontent').height(28);
                 }else{
                     $(_self.container).find('#placeholderDiv').remove();
                     _self.placeholderDiv = null;
                     _self.commentInput.removeClass('dis_none');
                     _self.commentInput.css('width' , '');
                     _self.commentInput.find('.js_commentcontent').height(65);
                 }
              }
            });
         }
     });

     /**
     * 评论回复
     */
    var getReplyInput = function(){
        var replyInput = [];
        replyInput.push('<div class="mod-replyComment js_box_reply_input">');
        replyInput.push('    <span class="re-arr"></span>');
        replyInput.push('    <div class="mod-comment-area">');
        replyInput.push('        <div class="middle">');
        replyInput.push('            <form action="">');
        replyInput.push('                <textarea name="comment" id="replycontent_{{quoteid}}" class="comment-area  on" placeholder="文明上网，不传谣言"></textarea>');
        replyInput.push('            </form>');
        replyInput.push('        </div>');
        replyInput.push('        <div class="submit">');
        replyInput.push('            <a href="#" class="submit-btn js_btn_submit" data-quoteid="{{quoteid}}">提交</a>');
        replyInput.push('{{#if isLogin}}')
        replyInput.push('            <a class="user-name" target="_blank" href="http://comment.ifeng.com/viewpersonal.php?uname={{userInfo.userName}}">{{userInfo.userName}}</a><em>/</em><a class="login-out" href="{{logoutUrl}}">退出</a>');
        replyInput.push("{{else}}")
        replyInput.push('            <a class="login js_login" href="javascript:;">登录</a>');
        replyInput.push("{{/if}}")
        replyInput.push('        </div>');
        replyInput.push('    </div>');
        replyInput.push('</div>');
        return replyInput.join('');
    }
    var compliedReplyInput = Handlebars.compile(getReplyInput());
    return CommentPc;
})

/* filePath fetchtemp/scripts/liveVideo_pc_55d949da_2c31ac5e.js*/

/* filePath fetchtemp/scripts/utils_a26ff998.js*/

define("liveVideo#1.1.4/utils" , [], function () {
  'use strict';

  var containParams = function (orginObj, newObj) {
    var o = {};

    for (var key in orginObj) {
      o[key] = key in newObj ? newObj[key] : orginObj[key];
    }

    return o;
  };

  var filterParams = function (keys, obj) {
    var o = {};
    var key;

    for (var i = 0, iLen = keys.length; i < iLen; i++) {
      key = keys[i];

      if (key in obj) {
        o[key] = obj[key];
      }
    }

    return o;
  };

  var getStarTime = function () {
    return 0;
  };

  var getFrom = function () {
    var from = '',
        url = window.location.href;
    var startIndex = url.indexOf('http://') + 'http://'.length,
        endIndex = url.indexOf('.ifeng.com');

    if (startIndex !== -1 && endIndex !== -1) {
      from = url.substr(startIndex, (endIndex - startIndex));
      return from;
    }

    return from;
  };

  var getCookie = function (name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;

    while (i < clen) {
      var j = i + alen;

      if (document.cookie.substring(i, j) === arg) {
        return (function (offset) {
          var endstr = document.cookie.indexOf(";", offset);

          if (endstr === -1) {
            endstr = document.cookie.length;
          }

          return decodeURIComponent(document.cookie.substring(offset, endstr));
        })(j);
      }

      i = document.cookie.indexOf(" ", i) + 1;

      if (i === 0) {
        break;
      }
    }

    return "";
  };

  return {
    containParams: containParams,
    filterParams: filterParams,
    getStarTime: getStarTime,
    getCookie: getCookie,
    getFrom: getFrom
  };

});
/* filePath fetchtemp/scripts/videoPc_0c4cb25c.js*/

define("liveVideo#1.1.4" , ['F_glue',
   'F_WidgetBase',
   'videoCore#1.0.6',
   "liveVideo#1.1.4/utils",
   'jquery#1.8.1'], function (glue, WidgetBase, video, utils, $) {
  
  'use strict';

  var win = window;
  var doc = document;
  var uuid = 0;

  var defaultConf = {
    swfUrl: 'http://y0.ifengimg.com/swf/ifengFreePlayer_v5.0.71.swf',
    // swfUrl: 'http://img.ifeng.com/swf/ifengVplayer_v5.0.53.swf',
    containerId: '',
    width: 600,
    height: 455
  };

  var defaultParamConf = {
    'allowFullScreen': 'true',
    'wmode': 'transparent',
    'allowScriptAccess': 'always'
  };

  var defaultVarConf = {
    'guid': '',
    'from': utils.getFrom(),
    'AutoPlay': true,
    'ADPlay': true,
    'uid': utils.getCookie('userid'),
    'sid': utils.getCookie('sid'),
    'locid': utils.getCookie('ilocid'),
    'startTime': utils.getStarTime(),
    'parent': 0,
    'adType': 1,
    'preAdType': 0,
    'pageurl': window.location.href,
    'PlayerName': 'vFreePlayer'
  };

  var transParams = function (params) {

    var transKeys = [
      {key: 'autoPlay', value: 'AutoPlay'}
    ];

    for (var i = 0, iLen = transKeys.length; i < iLen; i++) {
      if (transKeys[i].key in params) {
        params[transKeys[i].value] = params[transKeys[i].key];
      }
    }

    return params;
  };

  var Video = WidgetBase.extend({

    version: '1.1.4',
    type: 'liveVideo',
    createModel: function () {
      this.swfId = 'js_playVideo' + uuid++;
      // this.container = document.getElementById(this.container);
    },

    // create: function (opts) {
    //   Video.superclass.create.call(this, null, {});
    //   this.initModel(opts);
    //   this.createPlayer();
    // },

    mixProperties: function (properties) {
      properties = transParams(properties);
      Video.superclass.mixProperties.call(this, properties);
    },

    resolveTemplate: function () {
      this.conf = utils.containParams(defaultConf, this);
      this.paramConf = utils.containParams(defaultParamConf, this);
      this.varConf = utils.containParams(defaultVarConf, this);
    },

    renderer: function () {
      this.createPlayer();
    },

    bindDataEvent: function () {
    },

    // initModel: function (opts) {
    //   this.swfId = 'js_playVideo' + uuid++;
    //   this.conf = utils.containParams(defaultConf, opts);
    //   this.paramConf = utils.containParams(defaultParamConf, opts);
    //   this.varConf = utils.containParams(defaultVarConf, opts);
    // },

    createPlayer: function () {
      var key;
      var conf = this.conf;
      var param = this.paramConf;
      var varConf = this.varConf;
      var player = new video.Player(this.container, {
        url: conf.swfUrl,
        height: conf.height,
        width: conf.width,
        id: this.swfId
      });

      for (key in param) {
        player.addParam(key, param[key]);
      }

      for (key in varConf) {
        player.addVariable(key, varConf[key]);
      }

      player.play();
      this.player = player;
      player.addCallback("swfplay", videoEnd);
      player.addCallback('shareTo', shareTo);
      player.addCallback('goPage', goPage);
      this.flash = doc.getElementById(this.swfId);
    },

    play: function () {
      this.flash.videoPlay();
    },

    pause: function () {
      this.flash.videoPause();
    },

    show: function () {
      $(this.flash).show();
    },

    hide: function () {
      $(this.flash).hide();
    },

    destroy: function () {
      $(this.flash).remove();
    }

  });

  var videoEnd = function () {
    return "the last!";
  };

  var goPage = function (url) {
    window.open(url);
  };

  //分享到各个网站
  var shareTo = function (site, pic, url, title, smallimg) {
    var videoinfo = videoinfo || {url: document.location.href, title: document.title};
    var e = encodeURIComponent;
    var vlink = url || videoinfo.url;//'http://v.ifeng.com/news/world/201101/57b5bddb-36b4-4178-90d3-0f96bad889af.shtml';
    var _url = e(vlink);
    var vtitle = title || videoinfo.title;
    var _title = e(vtitle);
    /*if (eval("_oFlv_c.Content != null")) {
        _content = encodeURIComponent(_oFlv_c.Content);
    }*/
    switch (site) {

    case "ifengkuaibo" :
      break;

    case "ifengteew" :
      var t = _title, z = _url, id = "凤凰视频", type = 1, s = screen;
      var f = "http://t.ifeng.com/interface.php?_c=share&_a=share&", pa = ["sourceUrl=", _url, "&title=", _title, "&pic=", e(smallimg || ""), "&source=", e(id || ""), "&type=", e(type || 0)].join("");

      var a = function () {
        if (!window.open([f, pa].join(""), "", ["toolbar=0,status=0,resizable=1,width=640,height=481,left=", (s.width - 640) / 2, ",top=", (s.height - 480) / 2].join(""))) {
          location.href = [f, pa].join("");
        }
      }

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(a, 0);

      } else {
        a();
      }
      break;

    case "kaixin" :
      window.open("http://www.kaixin001.com/repaste/share.php?rurl=" + _url + "&rtitle=" + _title);
      break;

    case "renren":
      window.open("http://share.renren.com/share/buttonshare.do?link=" + _url + "&title=" + _title);
      break;

    case "sinateew" :
      var l = (screen.width - 440) / 2;
      var t = (screen.height - 430) / 2;
      var smallimg = smallimg || "";

      $.ajax({
        url: 'http://api.t.sina.com.cn/friendships/create/1806128454.xml?source=168486312',
        dataType: 'script',
        success: function () {}  //没有回调
      });
      window.open("http://v.t.sina.com.cn/share/share.php?appkey=168486312&url=" + _url + "&title=" + _title + "&source=ifeng&searchPic=false&sourceUrl=http://v.ifeng.com/&content=utf8&pic=" + smallimg + "&ralateUid=1806128454", "_blank", "toolbar=0,status=0,resizable=1,width=440,height=430,left=" + l + ",top=" + t);
      break;

    case "qqzone" :
      window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + _url);
      break;

    case "qqteew" :
      var _appkey = encodeURI("f8ca1cd768da4529ab190fae9f1bf21d"), _pic = encodeURI(smallimg || ""), _site = "http://v.ifeng.com";
      var _u = "http://v.t.qq.com/share/share.php?title=" + _title + "&url=" + _url + "&appkey=" + _appkey + "&site=" + _site + "&pic=" + _pic;
      window.open(_u, "\u8F6C\u64AD\u5230\u817E\u8BAF\u5FAE\u535A", "width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no");
      break;

    case "163" :
      var url = "link=http://www.ifeng.com&source=" + encodeURIComponent("凤凰网") + "&info=" + _title + " " + _url;
      window.open("http://t.163.com/article/user/checkLogin.do?" + url + "&" + new Date().getTime(), "newwindow", "height=330,width=550,top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "feixin" :
      var u = "http://space.fetion.com.cn/api/share?Source=" + encodeURIComponent("凤凰视频") + "&Title=" + _title + "&url=" + _url + "&IsEditTitle=false";
      window.open(u, "newwindow", "top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "sohuteew" :
      var s = screen, z = vlink, t = vtitle;
      var f = "http://t.sohu.com/third/post.jsp?", p = ["&url=", e(z), "&title=", e(t), "&content=utf-8", "&pic=", e(smallimg || "")].join("");
      var b = function () {
        if (!window.open([f, p].join(""), "mb", ["toolbar=0,status=0,resizable=1,width=660,height=470,left=", (s.width - 660) / 2, ",top=", (s.height - 470) / 2].join(""))) {
          location.href = [f, p].join("");
        }
      }

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(b, 0);
      } else {
        b();
      }
      break;

    case "51com" :
      var u = "http://share.51.com/share/out_share_video.php?from=" + encodeURIComponent("凤凰视频") + "&title=" + _title + "&vaddr=" + _url + "&IsEditTitle=false&charset=utf-8";
      window.open(u, "newwindow", "top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "baiduI":
      var u = 'http://tieba.baidu.com/i/app/open_share_api?link=' + _url,
          o = function () {
            if (!window.open(u)) {
              location.href = u;
            }
          };

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(o, 0);

      } else {
        o();
      }

      return false;

    default:
      return false;
    }
  };

  return Video;
});
/* filePath fetchtemp/scripts/liveslide_main_pc_a270a1a4_0c44f2f8.js*/

/* filePath fetchtemp/scripts/liveslide_template_c26e9690.js*/

define("liveslide#1.0.7/template" , ["artTemplate#3.0.3"] , function(artTemplate){
   artTemplate = new artTemplate();
   var _template = {};
   var images_mobile = [];
   images_mobile.push('{{each list as img i}}')
   images_mobile.push('<div class=\"swiper-slide\" style=\"background-image: url({{img}});\"><img src=\"{{img}}\" /></div>')
   images_mobile.push('{{/each}}')

   _template.images_mobile = artTemplate("images_mobile" , images_mobile.join(''));

   var layout = [];
   layout.push('<div class=\"mod-picPop\">')
   layout.push('  <div class=\"w-imgBox js_imgBox\">')
   layout.push('  </div>')
   layout.push('</div>')

   _template.layout = artTemplate("layout" , layout.join(''));

   var layout_mobile = [];
   layout_mobile.push('<div class=\"swiper-container\">')
   layout_mobile.push('    <div class=\"swiper-wrapper\">')
   layout_mobile.push('    </div>')
   layout_mobile.push('    <div class=\"swiper-pagination\"></div>')
   layout_mobile.push('</div>')

   _template.layout_mobile = artTemplate("layout_mobile" , layout_mobile.join(''));

   var mask = [];
   mask.push('<div class=\"mod-mask\" ></div>')

   _template.mask = artTemplate("mask" , mask.join(''));

   _template.helper = function(name, helper){
      artTemplate.helper(name, helper);
   }
   return _template;
});
/* filePath fetchtemp/scripts/mask_2092aec1.js*/

define("liveslide#1.0.7/mask" , ['F_glue',
   'F_WidgetBase',
   "liveslide#1.0.7/template",
   'jquery#1.8.1'], function (glue, WidgetBase, template, $) {

  'use strict';

  var win = window;

  var Mask = WidgetBase.extend({

    type: 'livePic/mask',

    createModel: function () {
      this.isHide = true;
    },

    // create: function (opts) {
    //   Mask.superclass.create.call(this, null, {});
    //   opts = opts || {};
    //   this.isHide = true;
    // },

    resolveTemplate: function () {
      this.layout = $(template.mask());
      this.layout.hide();
    },

    renderer: function () {
      $('body').append(this.layout);
      this.resize();
    },

    bindDataEvent: function () {
      var _this = this;
      var resizeTimer = null;
      this.layout.on('click', function () {
        _this.trigger('click');
      });

      $(win).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          _this.resize();
        }, 100);
      });
    },

    show: function () {
      if (this.isHide === true) {
        this.isHide = false;
        this.layout.show();
      }
    },

    hide: function () {
      if (this.isHide === false) {
        this.isHide = true;
        this.layout.hide();
      }
    },

    resize: function () {
      this.resizeHeight();
      // this.resizeTop();
    },

    resizeHeight: function () {
      this.layout.height($(win).height());
    }

  });

  glue.Events.mixTo(Mask);
  return Mask;
});
/* filePath fetchtemp/scripts/liveslide_0b254c44.js*/

define("liveslide#1.0.7" , ["F_glue", 'F_WidgetBase', "liveslide#1.0.7/template", 'jquery#1.8.1', "liveslide#1.0.7/mask"],
    function (glue, WidgetBase, template, $, Mask) {
  var win = window;
  var liveslide = WidgetBase.extend({
    // 版本标识，请勿删除与更改
    version: '1.0.7',
    // 组件类型，请勿删除与更改
    type: 'liveslide',

    // 创建组件内部数据
    createModel: function () {
      // model声明方式
      // this.modelName = glue.modelFactory.define(function (vm) {
      //   vm.propertyName = '';
      //   vm.arrayPropertyName = [];
      // });
      
      // 普通属性声明
      // this.propertyName = '';

      this.src = '';
      this.srcServeUrl = 'http://d.ifengimg.com';
      this.srcRatio = 'mw950';
      this.maxW = 950;
      this.padding = 50;
      this.isHide = true;
      this.isLoading = false;
      this.mask = new Mask(this);
      this.mask.create();

    },

    // 创建并解析模板
    resolveTemplate: function () {
      // 以jquery为例
      // 使用模板
      // this.ownerNode = template.tmplateName(data);
      this.layout = $(template.layout());
      this.imgBox = this.layout.find('.js_imgBox');
      this.layout.hide();
    },

    // 绑定dom事件
    bindDomEvent: function () {
      var resizeTimer = null;
      var _this = this;
      this.layout.on('click', $.proxy(this.hide, this));
      this.imgBox.on('click', 'img', $.proxy(this.change, this));
      this.imgBox.on('mousemove', 'img', $.proxy(this.cursor, this));
      $(win).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          _this.resize();
        }, 100);
      });
    },

    // 为数据模型绑定数据监听事件
    bindDataEvent: function () {
      // 监控属性变更
      // var _this = this;
      // this.watch(this.model, 'propertyName', function (newValue) {
      //   _this.method(newValue);
      // });

      // 监控数组方法(现在支持push, pop, shift, unshift)
      // this.watch(this.modelName.arrayPropertyName, 'push', function (newValue) {
      //   _this.method(newValue);
      // });
    },

    // 绑定自定义事件
    bindCustomEvent: function () {
      // 创建一个自定义事件
      // var _this = this;
      // this.on('customName', function (message) {
      //   _this.method(message);
      // });
    },

    // 绑定消息注册
    bindObserver: function () {
      // 创建一个消息监听
      // var _this = this;
      // this.observer('notifyName', function (message) {
      //   _this.method(message);
      // });
    },

    // 渲染组件。
    renderer: function () {
      $('body').append(this.layout);
    },

    // 创建完成后的处理。
    createComplete: function () {

    },

    // 销毁组件
    destroy: function () {
      liveslide.superclass.destroy.call(this);
      // 以jquery为例
      // $(this.container).empty();
    },

    show: function (pics, index) {
      if (typeof pics == 'string') {
        pics = [pics];
      }
      this.total = pics.length;
      this.index = typeof index == 'undefined' ? 0 : index;
      this.pics = pics;

      if (this.isHide === false) {
        return;
      }

      this.isHide = false;
      this.layout.fadeIn();
      this.hideHtmlScroll();
      this.mask.show();

      if (typeof pics !== 'undefined') {
        this.update(this.pics[this.index]);
      } else {
        this.resize();
      }

    },

    hide: function () {
      var _this = this;

      if (this.isHide === true) {
        return;
      }

      this.isHide = true;
      this.layout.fadeOut(function () {
        _this.restoreHtmlScroll();
      });
      this.mask.hide();
    },

    update: function (src) {
      var _this = this;
      var img = new Image();
      if (src.w/1 <= this.maxW) {
        this.imgWidth = src.w / 1 + this.padding;
        this.imgHeight = src.h / 1 + this.padding;
      } else {
        this.imgWidth = this.maxW / 1 + this.padding;
        this.imgHeight = this.maxW * src.h / src.w + this.padding;
      }
      img.width = this.imgWidth - this.padding;
      img.height = this.imgHeight - this.padding;
      this.resize();
      this.imgBox.html('<div class="w-page">' + (this.index + 1) + '<span> / ' + this.total + '</span></div>');
      this.imgBox.append(img);

      img.src = this.getSrc(src.url);
    },

    cursor: function (e) {
      var x = e.offsetX;
      if (x < this.imgWidth / 2) {
        this.imgBox.find('img').addClass('left').removeClass('right');
      } else {
        this.imgBox.find('img').addClass('right').removeClass('left');
      }
    },

    change: function (e) {
      if (this.isLoading || this.total == 1) {
        return false;
      }

      var x = e.offsetX;
      if (x < this.imgWidth / 2) {
        this.pre();
      } else {
        this.next();
      }
      return false;
    },

    pre: function () {
      if (this.index > 0 ) {
        this.index = this.index - 1;
      } else {
        this.index = this.total - 1;
      }

      this.update(this.pics[this.index]);
    },

    next: function () {

      if (this.index < this.total - 1) {
        this.index = this.index + 1;
      } else {
        this.index = 0;
      }

      this.update(this.pics[this.index]);
    },

    getSrc: function (src) {
      var srcRatio = this.srcRatio.lastIndexOf('/') === 0 ?
          this.srcRatio : this.srcRatio + '/';
      var srcServeUrl = this.srcServeUrl.lastIndexOf('/') === 0 ?
          this.srcServeUrl : this.srcServeUrl + '/';
      src = src.replace('http://', '');
      return srcServeUrl + srcRatio + src;
    },

    resize: function () {

      if (this.isHide) {
        return;
      }

      var boxTop;
      var winHeight = $(win).height();
      var winWidth = $(win).width();
      this.layout.height(winHeight);

      if (this.imgHeight > winHeight - 100) {
        boxTop = 50;
      } else {
        boxTop = (winHeight - this.imgHeight) / 2;
      }

      var boxLeft = (winWidth - this.imgWidth) / 2;
      this.imgBox.css('top', boxTop + 'px');
      this.imgBox.css('left', boxLeft + 'px');
      this.mask.resize();
    },

    hideHtmlScroll: function () {
      $('html').css('overflow', 'hidden');

      if (!($.browser.msie && $.browser.version === '6.0')) {
        $('html').css('padding-right', '17px');
      }

    },

    restoreHtmlScroll: function () {
      $('html').css('overflow', '');

      if (!($.browser.msie && $.browser.version === '6.0')) {
        $('html').css('padding-right', '');
      }

    }

    // 组件内部方法
  });

  return liveslide;
});