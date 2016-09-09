/* filePath fetchtemp/scripts/main_83df5eb8.js*/

// var docUrl = window.location.href; //'http://ent.ifeng.com/renren/special/tuwenzhibo/index.shtml';
if(docUrl.indexOf('?') >0){
    docUrl = docUrl.substring(0 , docUrl.indexOf('?'));
}
if(docUrl.indexOf('#') >0){
    docUrl = docUrl.substring(0 , docUrl.indexOf('#'));
}
var speUrl = docUrl;
if(docUrl.lastIndexOf('/') > 0){
    speUrl = docUrl.substring(0, docUrl.lastIndexOf('/')+1);
}


glue.widgetRegist(document.getElementById('livepage') , 'livepageInstance' , 'LivePage#1.5.21' , null , 1
    , { 'model.speUrl':speUrl
       ,'model.docUrl':docUrl
       ,'model.docName':liveConfig.docName
       ,'model.showHot' : liveConfig.showHot
       ,'model.hotSize' : liveConfig.hotSize
       ,'model.showLastTitle' : liveConfig.showLastTitle
       ,'model.showHotMoreBtn' : liveConfig.showHotMoreBtn
       ,'model.showLast' : liveConfig.showLast
       ,'model.lastSize' : liveConfig.lastSize
       ,'model.showLastMoreBtn' : liveConfig.showLastMoreBtn
       ,'model.useComment':liveConfig.useComment
       ,'model.liveid' : liveConfig.liveid
       ,'model.appSyn' : liveConfig.appSyn
       ,'model.appAddr': liveConfig.appAddr
       ,'model.isSpecial':false
       ,'model.isFang': liveConfig.isFang
       ,'model.shareTypes' : liveConfig.shareTypes
       ,'model.shareOrg' : liveConfig.shareOrg
       ,'model.imageRatio' : liveConfig.imageRatio
       ,'model.picImageRatio' : liveConfig.picImageRatio
       ,'model.videoWidth' : liveConfig.videoWidth
       ,'model.videoRatio' : liveConfig.videoRatio
       ,'model.pageSize' : liveConfig.pageSize
       ,'model.reqPageSize' : liveConfig.pageSize
       ,'model.commentTheme' : liveConfig.commentTheme
       ,'model.commentNeedLogin':liveConfig.commentNeedLogin
       ,'shareClassName' : liveConfig.shareClassName
       ,'liveSwfUrl': liveConfig.liveSwfUrl
      });

if(typeof surveyId !== 'undefined' && surveyId){
  glue.widgetRegist('livesurvey','livesurveyInstance', 'livesurvey#1.0.6', null, 1, {'surveyId':surveyId});
}

glue.scan();
glue.run();




//分享
require(['jquery#1.8.1', 'liveShare#1.0.15'], function ($, Share) {
        if(glue.device.type == 'mobile'){
            return;
        }
        var params ={};
        params.title = document.title;
        params.content = $('.p-topRead').text();
        var container = 'sideSharebox';
        var types = roomsharetypes;
        var theme =  'mod-shareTheme-4color';
        var isHide =  true;
        var share = new Share(glue);
        share.create(container , { 'container': container,
                       'types' : types,
                       'cls': theme,
                       'isHide' : isHide
                      });
        share.changeContent(params);
        $("#"+container).bind('click' , function(){
            if (share.isHide === true) {
               share.show('left');
            } else {
               share.hide();
            }
            return false;
        });
        $('body').bind('click' , function(){
            share.hide();
        });
});


require(['jquery#1.8.1'] , function($){

  var  commentsParams =  encodeURI("docName="+liveConfig.docName+"&docUrl="+speUrl+"&skey="+skey)
   $('.js_selectcomment').attr("href" , "http://gentie.ifeng.com/view.html?"+commentsParams);

   $.ajax({
        url : 'http://comment.ifeng.com/getspecial.php',
        data : {docurl : docUrl , speurl:speUrl , p : 1 , format:'js' , job:9 ,pagesize:1},
        dataType: 'jsonp',
        cache: true,
        jsonpCallback: '_ifengcmtcallback_',
        success : function(result){
            ifengcmtcallback(result.count);  //回复数
        },
        error : function(){}
    });

    //$('.js_selectcomment').attr('href' , 'http://gentie.ifeng.com/view.html?docUrl='+encodeURIComponent(docUrl)+'&&docName='+encodeURIComponent(liveConfig.docName)+'&speUrl='+encodeURIComponent(speUrl));
    var optBoxRight = function(){
        if($.browser.msie && ($.browser.version == "6.0")){
            $('.p-optBox').css('left' , (($(window).width() - 1000)/2+950)+'px');
            $('.p-optBox').css('position' , 'absolute');
            $('.p-optBox').css('top' , 100+'px');
        }
    }
    //optBoxRight();
    $(window).resize(function() {
       optBoxRight();
    });

    var getCookie =  function (name) {
        var cookie = document.cookie;
        var str = removeBlanks(cookie);
        var pairs = str.split(';');
        for (var i = 0; i < pairs.length; i++) {
           var pairSplit = pairs[i].split('=');
           if (pairSplit.length > 1 && pairSplit[0] === name) {
               return pairSplit[1];
           }
        }
        return '';
    };
    var removeBlanks =  function (content) {
        var temp = '';
        for (var i = 0; i < content.length; i++) {
           var c = content.charAt(i);
           if (c !== ' ') {
              temp += c;
           }
        }
        return temp;
    }
    var getUserInfo = function(){
        var sid = getCookie('sid');
        if(sid == '' || sid == null){
            return null;
        }else{
            var _userName = decodeURIComponent(sid).substring(32);
            return {'userName' : _userName};
        }
    }
    var logoutUrl = 'http://my.ifeng.com/logout?backurl=' + encodeURIComponent(location.href);
    var updateUserState = function(userInfo){
        if(glue.device.type == 'pc' || glue.device.type == 'pad'){
            var html = '<a target="_blank" href="http://comment.ifeng.com/viewpersonal.php?uname='+userInfo.userName+'"><span>'+userInfo.userName+'</span></a>\n<em class="gd9">|</em>\n<a href="'+logoutUrl+'"><span>退出</span></a>\n<em class="gd9">|</em>\n';
            $('.js_accountMgr').empty();
            $('.js_accountMgr').append(html);
        }else{
            var html = '<a target="_blank" href="http://comment.ifeng.com/viewpersonal.php?uname='+userInfo.userName+'" class="username"><span>'+userInfo.userName+'</span></a>';
            $('.js_accountMgr').empty();
            $('.js_accountMgr').append(html);
        }
    }
    var userInfo = getUserInfo();
    if(userInfo == null){
        window['REG_LOGIN_CALLBACK'](1, function (optionsORname) {
                      var _userName = 'string' === typeof optionsORname ? optionsORname : optionsORname['uname'];
                      var userInfo = {'userName' : _userName};
                      updateUserState(userInfo);
              });
        $('.login-btn').bind('click' , function(){
                window['GLOBAL_LOGIN']();
                return false;
        })
    }else{
        updateUserState(userInfo);
    }

    $('.mod-backToTop-singleBlock').bind('click' , function(){
        $('html,body').animate({scrollTop: '0px'}, 300);
        return false;
    });
})


var ifengcmtcallback =function(c){
    require(['jquery'], function($){
        $('.js_commentCount').text(c); //评论数
    })
}

require(['jquery#1.8.1', 'liveStreamVideo#1.0.7' , 'liveVideo#1.1.4'], function ($, Video ,LiveVideo) {
    // if((isLive && channelID=='' && liveVideoId=='') || (!isLive && liveVideoId=='')){
    //   return;
    // }
    var livestreamIdDom = $("#livestreamId");
    if(livestreamIdDom.length > 0){

          var live_video = {
                  //获取直播信息成功，服务器端回调函数(data:索引文件数据对象)
                  success: function (data) {
                      if (data.islive != true && (typeof data.liveVideoId == 'undefined' || data.liveVideoId == '')) {
                        return;
                      }
                      $(".livestreamPlane").show();
                      var livewidth = $("#livestreamId").width();

                      var video;
                      var channelID = data.channelId || '',
                          m3u8Url = data.m3u8 || '',
                          realStreamUrl = data.rtmp,
                          provider = data.provider || '',
                          columnName = data.columnName || '',
                          categoryId = data.categoryId || '0017',
                          isLive = data.islive,
                          picUrl = data.poster || (glue.device.type != 'pc' ? "http://y0.ifengimg.com/ffeefe4ba8f67e3e/2015/2/livepic-nobtn.png" :"http://y1.ifengimg.com/ffeefe4ba8f67e3e/2015/2/livepic.jpeg"),
                          liveVideoId = data.liveVideoId,
                          theFrom = data.from,
                          uid = data.uid,
                          width = glue.device.type != 'mobile'  ? 527 : livewidth,
                          height = glue.device.type != 'mobile' ?  288 : livewidth * 0.56;

                      $('.livestreamPlane .news-title span').html(data.liveStreamTitle || '');
                      $('.livestreamPlane .info').html(data.liveStreamContent || '')

                      if((channelID !="" || realStreamUrl !='') && isLive){ //只有是直播，并且直播流地址不为空
                        $('#livestreamId').html('<span class="icon-video"></span><img src="'+ picUrl +'" style="cursor: pointer; width: '+ width +'px; height: '+ height +'px"/>');
                        $('#livestreamId').one('click', function () {
                            $('#livestreamId img').remove();
                            $('#livestreamId span').remove();
                            video = new Video(glue);
                            video.create('livestreamId', {
                              'swfUrl':liveStreamSwfUrl,
                              'provider': provider,
                              'categoryId': categoryId,
                              'ChannelID': channelID,
                              'columnName': liveConfig.liveid,
                              'm3u8Url' : m3u8Url,
                              'RealStreamUrl': realStreamUrl,
                              'width':  glue.device.type != 'mobile'  ? 527 : livewidth,
                              'height': glue.device.type != 'mobile' ?  288 : livewidth * 0.56,
                              // 移动端视频占位图
                              'poster':  picUrl,
                              pauseCallback: function () {},
                              'autoPlay':true
                            });
                        });
                      }else if(liveVideoId!=''){
                        $('#livestreamId').html('<span class="icon-video"></span><img src="'+ picUrl +'" style="cursor: pointer; width: '+ width +'px; height: '+ height +'px"/>');
                        $('#livestreamId').one('click', function () {
                            $('#livestreamId img').remove();
                            $('#livestreamId span').remove();
                            var currentVideo1 = new LiveVideo(glue);
                            currentVideo1.create("livestreamId" , {
                               swfUrl: liveSwfUrl,
                               guid: liveVideoId,
                               from: theFrom,
                               uid: uid,
                               width: glue.device.type != 'mobile' ? 527 : livewidth,
                               height: glue.device.type != 'mobile' ? 288 : livewidth * 0.56,
                               autoPlay:true,
                               poster: picUrl
                            });
                        });
                      } 
                  }
            };

            window.live_video = live_video;

            $.getScript('http://rtst.ifeng.com/508df9aec9e2a/data/' + liveConfig.liveid + '/videolive.json',function(){
              // 回调函数
            });
    }


});

//贴定 背景资料
if(glue.device.type != 'mobile'){

  require(['jquery#1.8.1'] , function($){
    var top =  $('.p-optBox').offset().top;
    var left = $('.p-optBox').offset().left;
    $('.js_backTopBtn').bind('click' , function(){
           $('html,body').animate({scrollTop: '0px'}, 300);
    });

    $(window).scroll(function(){
         var scrTop = $(window).scrollTop();
         if(scrTop > 600){
            $('.js_backTopBtn').css('display','block');
         }else{
            $('.js_backTopBtn').css('display','none');
         }

         if($.browser.msie && ($.browser.version == "6.0")){
             $('.p-optBox').css('top' , (scrTop)+'px');
         }
    });
  });
}


//更新二维码
if(glue.device.type == 'pc'){

  require(['jquery#1.8.1'] , function($){
      $.ajax({
        type:'GET',
        url:"http://qrcode.ifeng.com/qrcode.php",
        dataType:'jsonp',
        data:{url:pageData.url},
        success: function(data) {
          var src = data.qrcode_url;
          $('.js_qrcode').attr('src',src);
        }
      });
  });
}

/* filePath fetchtemp/scripts/version_6b481a07.js*/

var version = '1.4.28';