/* filePath fetchtemp/scripts/barrage_5e4a4652.js*/

var Barrage =
    /******/ (function (modules) { // webpackBootstrap
    /******/  // The module cache
    /******/
    var installedModules = {};

    /******/  // The require function
    /******/
    function __webpack_require__(moduleId) {

        /******/    // Check if module is in cache
        /******/
        if (installedModules[moduleId])
        /******/      return installedModules[moduleId].exports;

        /******/    // Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
            /******/      exports: {},
            /******/      id: moduleId,
            /******/      loaded: false
            /******/
        };

        /******/    // Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        /******/    // Flag the module as loaded
        /******/
        module.loaded = true;

        /******/    // Return the exports of the module
        /******/
        return module.exports;
        /******/
    }


    /******/  // expose the modules object (__webpack_modules__)
    /******/
    __webpack_require__.m = modules;

    /******/  // expose the module cache
    /******/
    __webpack_require__.c = installedModules;

    /******/  // __webpack_public_path__
    /******/
    __webpack_require__.p = "";

    /******/  // Load entry module and return exports
    /******/
    return __webpack_require__(0);
    /******/
})
    /************************************************************************/
    /******/([
    /* 0 */
    /***/ function (module, exports, __webpack_require__) {

        eval("var Timeline = __webpack_require__(1);\nvar Screen = __webpack_require__(2);\nvar jsonp = __webpack_require__(8);\n\nvar lastT = null;\nvar cacheIds = {};\n\nvar fliteById = function (data) {\n  var result = [];\n  var item;\n  for (var i = 0, iLen = data.length; i < iLen; i++) {\n    item = data[i];\n    if (typeof cacheIds[item.id] == 'undefined') {\n      cacheIds[item.id] = 1;\n      result.push(item);\n    }\n  }\n  return result;\n};\nvar App = function (video, containerId, options) {\n  this.options = options;\n  this.options.interval = options.interval || 15;\n  this.video = video;\n  this.containerId = containerId;\n  this.datas = [];\n  this.init();\n};\n\nApp.prototype = {\n  init: function () {\n    this.sc = new Screen(this.containerId, this.options);\n    this.tm = new Timeline();\n    this.initEvent();\n    setInterval(function () {\n      if (this.tm.status == 2) {\n        this.getData();\n      } else {\n        lastT = null;\n      }\n    }.bind(this), this.options.interval * 1000);\n  },\n  initEvent: function () {\n    var tm = this.tm;\n    var sc = this.sc;\n    this.tm.addStepCallBack(function (fgs, spend) {\n        sc.clear();\n        for(var i = 0, iLen = fgs.length; i < iLen; i++) {\n            var fg = fgs[i];\n            fg.updateSpend(spend);\n            // console.log(fgs[i].getCurrentPosition());\n            sc.render(fg);\n            if (sc.isOut(fg)) {\n              fg.del = true;\n            }\n        }\n\n        for(var i = fgs.length; i > 0; i--) {\n            var fg = fgs[i - 1];\n            if (fg.del == true) {\n                tm.remove(fg);\n                sc.remove(fg);\n            }\n        }\n\n        var row = sc.checkRow();\n        if (row != null && this.datas.length > 0) {\n            var data = this.datas.shift();\n            tm.add(sc.createFragment(data, row))\n        }\n    }.bind(this));\n\n    this.video.addEventListener('pause', function() {\n      this.tm.pause();\n    }.bind(this))\n\n    this.video.addEventListener('play', function() {\n      if (this.tm.status == 1) {\n        this.tm.start();\n      } else {\n        this.tm.play();\n      }\n    }.bind(this))\n\n  },\n  getData: function () {\n    var id = this.options.id;\n    var url = this.options.getUrl;\n    var data = {\n      format: 'jsonp'\n    };\n    if (lastT) {\n      data.t = lastT - 1;\n    }\n    lastT = null;\n    jsonp({\n      url: url + id,\n      data: data,\n      success: function (msg) {\n        // this.datas = [{\"content\":\"测试一下\",\"color\":\"0\",\"fontsize\":\"14\",\"offset\":\"100\",\"create_time\":\"1471052661\"},{\"content\":\"测试\",\"color\":\"0\",\"fontsize\":\"14\",\"offset\":\"100\",\"create_time\":\"1471053358\"},{\"content\":\"开心啊\",\"color\":\"0\",\"fontsize\":\"14\",\"offset\":\"100\",\"create_time\":\"1471053371\"},{\"content\":\"我是带颜色的测试\",\"color\":\"0\",\"fontsize\":\"14\",\"offset\":\"100\",\"create_time\":\"1471053434\"},{\"content\":\"带颜色滴\",\"color\":\"0\",\"fontsize\":\"14\",\"offset\":\"100\",\"create_time\":\"1471054005\"},{\"content\":\"颜色\",\"color\":\"1663125\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471054039\"},{\"content\":\"测试1\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471054187\"},{\"content\":\"测试2\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471054252\"},{\"content\":\"带颜色的\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471054465\"},{\"content\":\"测试颜色4\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471054906\"},{\"content\":\"测试6\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057006\"},{\"content\":\"测试7\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057068\"},{\"content\":\"测试8\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057120\"},{\"content\":\"测试9\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057172\"},{\"content\":\"再测试\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057296\"},{\"content\":\"在阿里\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057317\"},{\"content\":\"啦啦啦\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057352\"},{\"content\":\"发送不到正确服务器上啦\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057416\"},{\"content\":\"来吧\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057550\"},{\"content\":\"测试100\",\"color\":\"196095\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057651\"},{\"content\":\"测试300\",\"color\":\"15074685\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057753\"},{\"content\":\"再来一个\",\"color\":\"65280\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471057792\"},{\"content\":\"我是弹幕\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471058732\"},{\"content\":\"弹幕君，出来吧\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471058842\"},{\"content\":\"再来一次\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471058918\"},{\"content\":\"啦啦啦\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059077\"},{\"content\":\"喵喵喵\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059094\"},{\"content\":\"咔咔咔\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059121\"},{\"content\":\"吃吃吃\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059151\"},{\"content\":\"哈哈哈\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059169\"},{\"content\":\"我去了个\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059192\"},{\"content\":\"为什么有个服务器是坏的？\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471059262\"},{\"content\":\"测试啦啦\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075763\"},{\"content\":\"测试\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075829\"},{\"content\":\"一起嗨～～～～～～～～～\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075858\"},{\"content\":\"啦啦啦\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075879\"},{\"content\":\"我了个去\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075906\"},{\"content\":\"测试一十二\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075937\"},{\"content\":\"测试十三\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075965\"},{\"content\":\"\\b我了个去\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471075980\"},{\"content\":\"我了个去\",\"color\":\"15074685\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076163\"},{\"content\":\"我不去了\",\"color\":\"15074685\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076235\"},{\"content\":\"lalala\",\"color\":\"15074685\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076451\"},{\"content\":\"我两个去\",\"color\":\"15074685\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076498\"},{\"content\":\"我三个去\",\"color\":\"15074685\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076515\"},{\"content\":\"我是谁呀\",\"color\":\"15989574\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076625\"},{\"content\":\"喵了个米\",\"color\":\"15989574\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076650\"},{\"content\":\"一起来嗨皮吧～～～～～～～～～\",\"color\":\"15989574\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076690\"},{\"content\":\"我两个去\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076752\"},{\"content\":\"我两个去\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076784\"},{\"content\":\"我两个去\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471076859\"},{\"content\":\"不是吧，弹幕呢？\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471077064\"},{\"content\":\"测试\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471077142\"},{\"content\":\"发射～～～\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471077605\"},{\"content\":\"发射～～～\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471077628\"},{\"content\":\"发射～～～\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471077656\"},{\"content\":\"发射～～～\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471077702\"},{\"content\":\"卡达\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471078047\"},{\"content\":\"卡的\",\"color\":\"16777215\",\"fontsize\":\"20\",\"offset\":\"100\",\"create_time\":\"1471078068\"}]\n        lastT = msg.t;\n        var data = msg.data;\n        // console.log(msg);\n        if (data.length > 0) {\n          data = fliteById(data);\n          this.datas = data;\n        }\n      }.bind(this)\n    });\n  },\n  sendData: function (content) {\n    var id = this.options.id;\n    var url = this.options.sendUrl;\n    jsonp({\n      url: url,\n      data: {\n        article_id: id,\n        title: document.title.replace('凤凰', ''),\n        url: window.location.href,\n        content: content,\n        offset: this.video.currentTime,\n        color: '0Xffffff',\n        format: 'jsonp'\n      },\n      success: function (msg) {\n        // console.log(msg);\n        // this.datas = this.datas.concat(msg)\n      }\n    });\n  }\n};\n\nmodule.exports = App;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/app.js\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/app.js?");

        /***/
    },
    /* 1 */
    /***/ function (module, exports) {

        eval("var Timeline = function () {\n  this.fragments = [];\n  this.status = 1; // 1 未开始 2 运行中 3 暂停 4 结束\n  this.lastTime = null;\n  this.stepCallbacks = [];\n}\n\nTimeline.prototype = {\n  add: function (fragment) {\n    this.fragments.push(fragment);\n  },\n  remove: function (fragment) {\n    var index = this.fragments.indexOf(fragment);\n    if (index >= 0) {\n      this.fragments.splice(index, 1)\n    }\n  },\n  clear: function () {\n    this.fragments = [];\n  },\n  __step: function () {\n    if (this.status > 1 && this.status < 4) {\n      // console.log('----------');\n      var now = new Date().valueOf();\n      var spendTime = now - this.lastTime;\n      this.lastTime = now;\n      if (this.status == 2) {\n        for (var i = 0 , iLen = this.stepCallbacks.length; i < iLen; i++) {\n          this.stepCallbacks[i](this.fragments, spendTime);\n        }\n      }\n      requestAnimationFrame(this.__step.bind(this));\n    }\n  },\n  start: function () {\n    this.status = 2;\n    this.lastTime = new Date().valueOf();\n    requestAnimationFrame(this.__step.bind(this))\n  },\n  pause: function () {\n    if(this.status == 2) {\n      this.status = 3;\n    }\n  },\n  play: function () {\n    if (this.status == 3) {\n      this.status = 2;\n    }\n  },\n  end: function () {\n    this.status = 4;\n    this.clear();\n  },\n  addStepCallBack: function (callback) {\n    this.stepCallbacks.push(callback)\n  }\n};\n\nmodule.exports = Timeline;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/timeline.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/timeline.js?");

        /***/
    },
    /* 2 */
    /***/ function (module, exports, __webpack_require__) {

        eval("__webpack_require__(3);\nvar Fragment = __webpack_require__(7);\n\nvar paddingLeft = function (str, v) {\n  var padding = v - str.length;\n  for (var i = 0; i < padding; i++) {\n    str = '0' + str;\n  }\n  return str;\n};\n\nvar Screen = function (containerId, options) {\n  this.containerId = containerId;\n  this.options = options;\n  this.options.speed = options.speed || 100;\n  this.options.rows = options.rows || 4;\n  this.options.offsetTop = options.offsetTop || 20;\n  this.options.offsetLeft = options.offsetLeft || 40;\n  this.options.base = options.base || 375;\n  this.options.per = options.per || 0.75;\n  this.ratio = 2;\n  this.init();\n};\n\nScreen.prototype = {\n  init: function () {\n    var createRow = function (value) {\n      var result = [];\n      for (var i = 0; i < value; i++) {\n        result.push([]);\n      }\n      return result;\n    };\n    this.rows = createRow(this.options.rows);\n    this.box = this.createBox();\n    this.ctx = this.box.getContext(\"2d\");\n    this.resize();\n  },\n  resize: function () {\n    var canvas = this.box;\n    var container = document.getElementById(this.containerId);\n    canvas.width = container.offsetWidth * 2;\n    canvas.height = container.offsetHeight * 2;\n    canvas.style.width = container.offsetWidth + 'px';\n    canvas.style.height = container.offsetHeight + 'px';\n\n    this.boxHeight = this.box.offsetHeight;\n    this.rowHeight = (this.boxHeight * this.options.per - this.options.offsetTop) / this.options.rows;\n    this.fontSize = 14 * window.innerWidth / this.options.base;\n    this.dur = 1000 * window.innerWidth / this.options.speed;\n\n    var ctx = this.ctx;\n    ctx.font = this.fontSize * this.ratio + 'px SimSun';\n    ctx.shadowColor = \"RGBA(0,0,0,1)\";\n    ctx.shadowOffsetX = 0;\n    ctx.shadowOffsetY = 4;\n    ctx.shadowBlur = 8;\n  },\n  isAllShow: function (fragment) {\n    var left = fragment.options.begin.left;\n    var now = fragment.getCurrentPosition().left;\n    var size = fragment.options.size;\n    if (left - now > size) {\n      return true;\n    } else {\n      return false;\n    }\n  },\n  isOut: function (fragment) {\n    if (fragment.options.spend >= fragment.options.dur) {\n      return true;\n    } else {\n      return false;\n    }\n  },\n  render: function (fragment) {\n    var ctx = this.ctx;\n    var position = fragment.getCurrentPosition();\n    if (fragment.options.color != '0') {\n      ctx.fillStyle = '#' + paddingLeft(Number(fragment.options.color).toString(16), 6);\n    } else {\n      ctx.fillStyle = '#fff';\n    }\n    ctx.fillText(fragment.options.text, position.left, position.top);\n  },\n  remove: function (fragment) {\n    var row = fragment.options.row;\n    var id = fragment.id;\n    var index = this.rows[row].indexOf(fragment);\n\n    if (index >= 0) {\n      this.rows[row].splice(index, 1);\n    }\n\n    if (document.getElementById(id)) {\n      this.box.removeChild(document.getElementById(id));\n    }\n  },\n  checkRow: function () {\n    var result = [];\n    var row;\n    var fragment;\n    for (var i = 0, iLen = this.rows.length; i < iLen; i++) {\n      row = this.rows[i];\n      if (row.length <= 0) {\n        result.push(i);\n      } else {\n        fragment = row[row.length - 1];\n        if (this.isAllShow(fragment)) {\n          result.push(i);\n        }\n      }\n    }\n    if (result.length > 0) {\n      return result[Math.floor(Math.random() * result.length)];\n\n    } else {\n      return null;\n    }\n  },\n  createFragment: function (data, row) {\n    var top = this.options.offsetTop * this.ratio + (row + 0.5) * this.rowHeight * this.ratio;\n    var paddSize = Math.floor(Math.random() * this.options.offsetLeft * this.ratio);\n    var left = this.box.offsetWidth * 2 + paddSize;\n    var size = this.ctx.measureText(data.content).width;\n    var fragment = new Fragment({\n          begin: {\n              top: top,\n              left: left\n          },\n          end: {\n              top: top,\n              left: 0 - size\n          },\n          dur: this.dur,\n          spend: 0,\n          text: data.content,\n          color: data.color,\n          fontsize: this.fontsize,\n          row: row,\n          size: size + paddSize\n      });\n    this.rows[row].push(fragment);\n    return fragment;\n\n  },\n  createBox: function () {\n    var container = document.getElementById(this.containerId);\n    var canvas = document.createElement('canvas');\n    canvas.className = 'screenBox';\n    container.appendChild(canvas);\n    return canvas;\n  },\n  clear: function () {\n    this.ctx.clearRect(0, 0, 10000, 10000);\n  },\n  hide: function () {\n    this.box.style.visibility = 'hidden';\n  },\n  show: function () {\n    this.box.style.visibility = 'visible';\n  }\n};\n\nmodule.exports = Screen;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/screen.js\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/screen.js?");

        /***/
    },
    /* 3 */
    /***/ function (module, exports) {

        eval("// removed by extract-text-webpack-plugin\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/screen.css\n ** module id = 3\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/screen.css?");

        /***/
    },
    /* 4 */,
    /* 5 */,
    /* 6 */,
    /* 7 */
    /***/ function (module, exports) {

        eval("var index = 1;\nvar Fragment = function (options) {\n  this.options = options;\n  this.id = 'fragment_' + index++;\n};\n\nFragment.prototype = {\n  getCurrentPosition: function () {\n    var top, left;\n    if (this.options.spend <= this.options.dur) {\n      top = this.options.begin.top - (this.options.begin.top - this.options.end.top) * this.options.spend / this.options.dur;\n      left = this.options.begin.left - (this.options.begin.left - this.options.end.left) * this.options.spend / this.options.dur;\n    } else {\n      top = this.options.end.top;\n      left = this.options.end.left;\n    }\n    return {\n      top: top,\n      left: left\n    };\n  },\n  updateSpend: function (time) {\n    this.options.spend = this.options.spend + time;\n  }\n};\n\nmodule.exports = Fragment;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/fragment.js\n ** module id = 7\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/fragment.js?");

        /***/
    },
    /* 8 */
    /***/ function (module, exports) {

        eval("var win = window;\nvar doc = document;\nvar timestampIndex = 0;\nvar jsonp = function (options) {\n\n  var cache = typeof options.cache !== \"undefined\" ? cache : false;\n  var url = options.url;\n  var success = options.success;\n  var data = [];\n  var scope = options.scope || win;\n  var callback;\n  // 暂时只支持对象传入\n  if (typeof options.data === \"object\") {\n    for (var k in options.data) {\n      data.push(k + \"=\" + encodeURIComponent(options.data[k]));\n    }\n  }\n\n  if (typeof options.callback === \"string\" && options.callback !== \"\") {\n    callback = options.callback;\n  } else {\n    callback = \"f\" + new Date().valueOf().toString(16) + timestampIndex;\n    timestampIndex++;\n  }\n\n  data.push(\"callback=\" + callback);\n\n  if (cache === false) {\n    data.push(\"_=\" + new Date().valueOf() + timestampIndex);\n    timestampIndex++;\n  }\n\n  // 回头要不要对这地址进行更多特殊处理？\n  if (url.indexOf(\"?\") < 0) {\n    url = url + \"?\" + data.join(\"&\");\n  } else {\n    url = url + \"&\" + data.join(\"&\");\n  }\n\n  var insertScript = doc.createElement(\"script\");\n  insertScript.src = url;\n\n  win[callback] = function () {\n    success.apply(scope, [].slice.apply(arguments).concat(\"success\", options));\n  };\n\n  insertScript.onload = insertScript.onreadystatechange = function () {\n    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {\n      insertScript.onload = insertScript.onreadystatechange = null;\n      insertScript.parentNode.removeChild(insertScript);\n    }\n  };\n\n  var oScript = doc.getElementsByTagName(\"script\")[0];\n  oScript.parentNode.insertBefore(insertScript, oScript);\n\n};\n\nmodule.exports = jsonp;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/jsonp.js\n ** module id = 8\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/jsonp.js?");

        /***/
    }
    /******/]);
/* filePath fetchtemp/scripts/main_274adfa4.js*/

// var docUrl = window.location.href; //'http://ent.ifeng.com/renren/special/tuwenzhibo/index.shtml';
if (docUrl.indexOf('?') > 0) {
    docUrl = docUrl.substring(0, docUrl.indexOf('?'));
}
if (docUrl.indexOf('#') > 0) {
    docUrl = docUrl.substring(0, docUrl.indexOf('#'));
}
var speUrl = docUrl;
if (docUrl.lastIndexOf('/') > 0) {
    speUrl = docUrl.substring(0, docUrl.lastIndexOf('/') + 1);
}


glue.widgetRegist(document.getElementById('livepage'), 'livepageInstance', 'LivePage#1.6.3', null, 1
    , {
        'model.speUrl': speUrl
        , 'model.docUrl': docUrl
        , 'model.docName': liveConfig.docName
        , 'model.showHot': liveConfig.showHot
        , 'model.hotSize': liveConfig.hotSize
        , 'model.showLastTitle': liveConfig.showLastTitle
        , 'model.showHotMoreBtn': liveConfig.showHotMoreBtn
        , 'model.showLast': liveConfig.showLast
        , 'model.lastSize': liveConfig.lastSize
        , 'model.showLastMoreBtn': liveConfig.showLastMoreBtn
        , 'model.useComment': liveConfig.useComment
        , 'model.liveid': liveConfig.liveid
        , 'model.appSyn': liveConfig.appSyn
        , 'model.appAddr': liveConfig.appAddr
        , 'model.isSpecial': false
        , 'model.isFang': liveConfig.isFang
        , 'model.shareTypes': liveConfig.shareTypes
        , 'model.shareOrg': liveConfig.shareOrg
        , 'model.imageRatio': liveConfig.imageRatio
        , 'model.picImageRatio': liveConfig.picImageRatio
        , 'model.videoWidth': liveConfig.videoWidth
        , 'model.videoRatio': liveConfig.videoRatio
        , 'model.pageSize': liveConfig.pageSize
        , 'model.reqPageSize': liveConfig.pageSize
        , 'model.commentTheme': liveConfig.commentTheme
        , 'model.commentNeedLogin': liveConfig.commentNeedLogin
        , 'shareClassName': liveConfig.shareClassName
        , 'liveSwfUrl': liveConfig.liveSwfUrl
    });

if (typeof surveyId !== 'undefined' && surveyId) {
    glue.widgetRegist('livesurvey', 'livesurveyInstance', 'livesurvey#1.0.6', null, 1, {'surveyId': surveyId});
}

glue.scan();
glue.run();


//分享
require(['jquery#1.8.1', 'liveShare#1.0.15'], function ($, Share) {
    if (glue.device.type == 'mobile') {
        return;
    }
    var params = {};
    params.title = document.title;
    params.content = $('.p-topRead').text();
    var container = 'sideSharebox';
    var types = roomsharetypes;
    var theme = 'mod-shareTheme-4color';
    var isHide = true;
    var share = new Share(glue);
    share.create(container, {
        'container': container,
        'types': types,
        'cls': theme,
        'isHide': isHide
    });
    share.changeContent(params);
    $("#" + container).bind('click', function () {
        if (share.isHide === true) {
            share.show('left');
        } else {
            share.hide();
        }
        return false;
    });
    $('body').bind('click', function () {
        share.hide();
    });
});


require(['jquery#1.8.1'], function ($) {

    var commentsParams = encodeURI("docName=" + liveConfig.docName + "&docUrl=" + speUrl + "&skey=" + skey)
    $('.js_selectcomment').attr("href", "http://gentie.ifeng.com/view.html?" + commentsParams);

    $.ajax({
        url: 'http://comment.ifeng.com/getspecial.php',
        data: {docurl: docUrl, speurl: speUrl, p: 1, format: 'js', job: 9, pagesize: 1},
        dataType: 'jsonp',
        cache: true,
        jsonpCallback: '_ifengcmtcallback_',
        success: function (result) {
            ifengcmtcallback(result.count);  //回复数
        },
        error: function () {
        }
    });

    //$('.js_selectcomment').attr('href' , 'http://gentie.ifeng.com/view.html?docUrl='+encodeURIComponent(docUrl)+'&&docName='+encodeURIComponent(liveConfig.docName)+'&speUrl='+encodeURIComponent(speUrl));
    var optBoxRight = function () {
        if ($.browser.msie && ($.browser.version == "6.0")) {
            $('.p-optBox').css('left', (($(window).width() - 1000) / 2 + 950) + 'px');
            $('.p-optBox').css('position', 'absolute');
            $('.p-optBox').css('top', 100 + 'px');
        }
    }
    //optBoxRight();
    $(window).resize(function () {
        optBoxRight();
    });

    var getCookie = function (name) {
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
    var removeBlanks = function (content) {
        var temp = '';
        for (var i = 0; i < content.length; i++) {
            var c = content.charAt(i);
            if (c !== ' ') {
                temp += c;
            }
        }
        return temp;
    }
    var getUserInfo = function () {
        var sid = getCookie('sid');
        if (sid == '' || sid == null) {
            return null;
        } else {
            var _userName = decodeURIComponent(sid).substring(32);
            return {'userName': _userName};
        }
    }
    var logoutUrl = 'http://my.ifeng.com/logout?backurl=' + encodeURIComponent(location.href);
    var updateUserState = function (userInfo) {
        if (glue.device.type == 'pc' || glue.device.type == 'pad') {
            var html = '<a target="_blank" href="http://comment.ifeng.com/viewpersonal.php?uname=' + userInfo.userName + '"><span>' + userInfo.userName + '</span></a>\n<em class="gd9">|</em>\n<a href="' + logoutUrl + '"><span>退出</span></a>\n<em class="gd9">|</em>\n';
            $('.js_accountMgr').empty();
            $('.js_accountMgr').append(html);
        } else {
            var html = '<a target="_blank" href="http://comment.ifeng.com/viewpersonal.php?uname=' + userInfo.userName + '" class="username"><span>' + userInfo.userName + '</span></a>';
            $('.js_accountMgr').empty();
            $('.js_accountMgr').append(html);
        }
    }
    var userInfo = getUserInfo();
    if (userInfo == null) {
        window['REG_LOGIN_CALLBACK'](1, function (optionsORname) {
            var _userName = 'string' === typeof optionsORname ? optionsORname : optionsORname['uname'];
            var userInfo = {'userName': _userName};
            updateUserState(userInfo);
        });
        $('.login-btn').bind('click', function () {
            window['GLOBAL_LOGIN']();
            return false;
        })
    } else {
        updateUserState(userInfo);
    }

    $('.mod-backToTop-singleBlock').bind('click', function () {
        $('html,body').animate({scrollTop: '0px'}, 300);
        return false;
    });
})


var ifengcmtcallback = function (c) {
    require(['jquery'], function ($) {
        $('.js_commentCount').text(c); //评论数
    })
}

require(['jquery#1.8.1', 'liveStreamVideo#1.0.9', 'liveVideo#1.1.4'], function ($, Video, LiveVideo) {
    // if((isLive && channelID=='' && liveVideoId=='') || (!isLive && liveVideoId=='')){
    //   return;
    // }
    var livestreamIdDom = $("#livestreamId");
    if (livestreamIdDom.length > 0) {

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
                    picUrl = data.poster || (glue.device.type != 'pc' ? "http://y0.ifengimg.com/ffeefe4ba8f67e3e/2015/2/livepic-nobtn.png" : "http://y1.ifengimg.com/ffeefe4ba8f67e3e/2015/2/livepic.jpeg"),
                    liveVideoId = data.liveVideoId,
                    theFrom = data.from,
                    uid = data.uid,
                    width = glue.device.type != 'mobile' ? 527 : livewidth,
                    height = glue.device.type != 'mobile' ? 296 : livewidth * 0.56,
                    isDanmu = typeof data.isDanmu == 'undefined' ? false : data.isDanmu,
                    isVR = typeof data.isVR == 'undefined' ? false : data.isVR;

                // $('.livestreamPlane .news-title span').html(data.liveStreamTitle || '');
                // $('.livestreamPlane .info').html(data.liveStreamContent || '')

                if ((channelID != "" || realStreamUrl != '') && isLive) { //只有是直播，并且直播流地址不为空
                    $('#livestreamId').html('<span class="icon-video"></span><img src="' + picUrl + '" style="cursor: pointer; width: ' + width + 'px; height: ' + height + 'px"/>');
                    $('#livestreamId').one('click', function () {
                        $('#livestreamId img').remove();
                        $('#livestreamId span').remove();
                        video = new Video(glue);
                        video.create('livestreamId', {
                            'swfUrl': liveStreamSwfUrl,
                            'provider': provider,
                            'categoryId': categoryId,
                            'ChannelID': channelID,
                            'columnName': liveConfig.liveid,
                            'm3u8Url': m3u8Url,
                            'RealStreamUrl': realStreamUrl,
                            'width': glue.device.type != 'mobile' ? 527 : livewidth,
                            'height': glue.device.type != 'mobile' ? isDanmu ? 366 : 326 : livewidth * 0.56,
                            // 移动端视频占位图
                            'poster': picUrl,
                            pauseCallback: function () {
                            },
                            'autoPlay': true,
                            'danmu': isDanmu,
                            'isVR': isVR
                        });

                        if (glue.device.type !== 'pc') {
                            video.player.video.setAttribute('webkit-playsinline', true)
                            var barrage = new Barrage(video.player.video, 'livestreamId', {
                                rows: 4,
                                id: channelID,
                                getUrl: 'http://danmaku.ifeng.com/get/realtime/',
                                sendUrl: 'http://danmaku.ifeng.com/post',
                                interval: 3
                            });
                            $(barrage.sc.box).on('click', function () {
                                if (video.player.video.paused) {
                                    video.player.video.play();
                                } else {
                                    video.player.video.pause();
                                }
                            });
                        }
                    });

                    var removeBlanks = function (content) {
                        var temp = '';
                        for (var i = 0; i < content.length; i++) {
                            var c = content.charAt(i);
                            if (c !== ' ') {
                                temp += c;
                            }
                        }
                        return temp;
                    }

                    var getCookie = function (name) {
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

                    var delCookie = function (name) {
                        document.cookie = name + '=;expires=' + new Date(0).toGMTString() + ';domain=.ifeng.com;path=/';
                    }

                    var sidChecked = false;

                    var checkSid = function (callback) {
                        var sid = getCookie('sid');
                        if (sid) {
                            if (!sidChecked) {
                                $.ajax({
                                    url: 'http://id.ifeng.com/api/checklogin',
                                    data: {
                                        sid: sid
                                    },
                                    type: 'get',
                                    dataType: 'jsonp',
                                    success: function (msg) {
                                        sidChecked = true;
                                        if (msg.code == 1) {
                                            callback(sid);
                                        } else {
                                            callback(false);
                                        }
                                    }
                                });
                            } else {
                                callback(sid);
                            }
                        } else {
                            sidChecked = true;
                            callback(false)
                        }
                    };

                    window.sendDanmu = function (data) {
                        checkSid(function (result) {
                            if (!result) {
                                delCookie('sid');
                                window['REG_LOGIN_CALLBACK'](1, function (optionsORname) {
                                    sendDanmu(data);
                                });
                                window['GLOBAL_LOGIN']();
                            } else {
                                var params = {
                                    article_id: channelID,
                                    title: document.title.replace('凤凰', ''),
                                    url: window.location.href,
                                    content: data.txt,
                                    color: data.colorStr,
                                    fontsize: data.size,
                                    type: 'realtime',
                                    format: 'jsonp',
                                    offset: 100
                                };
                                $.ajax({
                                    url: 'http://danmaku.ifeng.com/post',
                                    type: 'get',
                                    dataType: 'jsonp',
                                    data: params,
                                    success: function (msg) {
                                        // console.log(msg);
                                        // this.datas = this.datas.concat(msg)
                                    }
                                });
                            }
                        })
                    };

                } else if (liveVideoId != '') {
                    $('#livestreamId').html('<span class="icon-video"></span><img src="' + picUrl + '" style="cursor: pointer; width: ' + width + 'px; height: ' + height + 'px"/>');
                    $('#livestreamId').one('click', function () {
                        $('#livestreamId img').remove();
                        $('#livestreamId span').remove();
                        var currentVideo1 = new LiveVideo(glue);
                        currentVideo1.create("livestreamId", {
                            swfUrl: liveSwfUrl,
                            guid: liveVideoId,
                            from: theFrom,
                            uid: uid,
                            width: glue.device.type != 'mobile' ? 527 : livewidth,
                            height: glue.device.type != 'mobile' ? 326 : livewidth * 0.56,
                            autoPlay: true,
                            poster: picUrl
                        });
                    });
                }
            }
        };

        window.live_video = live_video;

        $.getScript('http://rtst.ifeng.com/508df9aec9e2a/data/' + liveConfig.liveid + '/videolive.json', function () {
            // 回调函数
        });

    }


});

//贴定 背景资料
if (glue.device.type != 'mobile') {

    require(['jquery#1.8.1'], function ($) {
        var top = $('.p-optBox').offset().top;
        var left = $('.p-optBox').offset().left;
        $('.js_backTopBtn').bind('click', function () {
            $('html,body').animate({scrollTop: '0px'}, 300);
        });

        $(window).scroll(function () {
            var scrTop = $(window).scrollTop();
            if (scrTop > 600) {
                $('.js_backTopBtn').css('display', 'block');
            } else {
                $('.js_backTopBtn').css('display', 'none');
            }

            if ($.browser.msie && ($.browser.version == "6.0")) {
                $('.p-optBox').css('top', (scrTop) + 'px');
            }
        });
    });
}


//更新二维码
if (glue.device.type == 'pc') {

    require(['jquery#1.8.1'], function ($) {
        $.ajax({
            type: 'GET',
            url: "http://qrcode.ifeng.com/qrcode.php",
            dataType: 'jsonp',
            data: {url: pageData.url},
            success: function (data) {
                var src = data.qrcode_url;
                $('.js_qrcode').attr('src', src);
            }
        });
    });
}

/* filePath fetchtemp/scripts/version_6b481a07.js*/

var version = '@project-version@';