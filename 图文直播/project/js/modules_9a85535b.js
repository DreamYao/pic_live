/* filePath fetchtemp/scripts/template_2bfe3271.js*/

/*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */
 
!(function () {

var template = function () {
    /**
     * 模板引擎
     * @name    template
     * @param   {String}            模板名
     * @param   {Object, String}    数据。如果为字符串则编译并缓存编译结果
     * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
     */
    var template = function (filename, content) {
        return typeof content === 'string'
        ?   compile(content, {
                filename: filename
            })
        :   renderFile(filename, content);
    };


    template.version = '3.0.0';


    /**
     * 设置全局配置
     * @name    template.config
     * @param   {String}    名称
     * @param   {Any}       值
     */
    template.config = function (name, value) {
        defaults[name] = value;
    };



    var defaults = template.defaults = {
        openTag: '<%',    // 逻辑语法开始标签
        closeTag: '%>',   // 逻辑语法结束标签
        escape: true,     // 是否编码输出变量的 HTML 字符
        cache: true,      // 是否开启缓存（依赖 options 的 filename 字段）
        compress: false,  // 是否压缩输出
        parser: null      // 自定义语法格式器 @see: template-syntax.js
    };


    var cacheStore = template.cache = {};


    /**
     * 渲染模板
     * @name    template.render
     * @param   {String}    模板
     * @param   {Object}    数据
     * @return  {String}    渲染好的字符串
     */
    template.render = function (source, options) {
        return compile(source, options);
    };


    /**
     * 渲染模板(根据模板名)
     * @name    template.render
     * @param   {String}    模板名
     * @param   {Object}    数据
     * @return  {String}    渲染好的字符串
     */
    var renderFile = template.renderFile = function (filename, data) {
        var fn = template.get(filename) || showDebugInfo({
            filename: filename,
            name: 'Render Error',
            message: 'Template not found'
        });
        return data ? fn(data) : fn;
    };


    /**
     * 获取编译缓存（可由外部重写此方法）
     * @param   {String}    模板名
     * @param   {Function}  编译好的函数
     */
    template.get = function (filename) {

        var cache;
        
        if (cacheStore[filename]) {
            // 使用内存缓存
            cache = cacheStore[filename];
        } else if (typeof document === 'object') {
            // 加载模板并编译
            var elem = document.getElementById(filename);
            
            if (elem) {
                var source = (elem.value || elem.innerHTML)
                .replace(/^\s*|\s*$/g, '');
                cache = compile(source, {
                    filename: filename
                });
            }
        }

        return cache;
    };


    var toString = function (value, type) {

        if (typeof value !== 'string') {

            type = typeof value;
            if (type === 'number') {
                value += '';
            } else if (type === 'function') {
                value = toString(value.call(value));
            } else {
                value = '';
            }
        }

        return value;

    };


    var escapeMap = {
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    };


    var escapeFn = function (s) {
        return escapeMap[s];
    };

    var escapeHTML = function (content) {
        return toString(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
    };


    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };


    var each = function (data, callback) {
        var i, len;        
        if (isArray(data)) {
            for (i = 0, len = data.length; i < len; i++) {
                callback.call(data, data[i], i, data);
            }
        } else {
            for (i in data) {
                callback.call(data, data[i], i);
            }
        }
    };


    var utils = template.utils = {

        $helpers: {},

        $include: renderFile,

        $string: toString,

        $escape: escapeHTML,

        $each: each
        
    };/**
     * 添加模板辅助方法
     * @name    template.helper
     * @param   {String}    名称
     * @param   {Function}  方法
     */
    template.helper = function (name, helper) {
        helpers[name] = helper;
    };

    var helpers = template.helpers = utils.$helpers;




    /**
     * 模板错误事件（可由外部重写此方法）
     * @name    template.onerror
     * @event
     */
    template.onerror = function (e) {
        var message = 'Template Error\n\n';
        for (var name in e) {
            message += '<' + name + '>\n' + e[name] + '\n\n';
        }
        
        if (typeof console === 'object') {
            console.error(message);
        }
    };


    // 模板调试器
    var showDebugInfo = function (e) {

        template.onerror(e);
        
        return function () {
            return '{Template Error}';
        };
    };


    /**
     * 编译模板
     * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
     * @name    template.compile
     * @param   {String}    模板字符串
     * @param   {Object}    编译选项
     *
     *      - openTag       {String}
     *      - closeTag      {String}
     *      - filename      {String}
     *      - escape        {Boolean}
     *      - compress      {Boolean}
     *      - debug         {Boolean}
     *      - cache         {Boolean}
     *      - parser        {Function}
     *
     * @return  {Function}  渲染方法
     */
    var compile = template.compile = function (source, options) {
        
        // 合并默认配置
        options = options || {};
        for (var name in defaults) {
            if (options[name] === undefined) {
                options[name] = defaults[name];
            }
        }


        var filename = options.filename;


        try {
            
            var Render = compiler(source, options);
            
        } catch (e) {
        
            e.filename = filename || 'anonymous';
            e.name = 'Syntax Error';

            return showDebugInfo(e);
            
        }
        
        
        // 对编译结果进行一次包装

        function render (data) {
            
            try {
                
                return new Render(data, filename) + '';
                
            } catch (e) {
                
                // 运行时出错后自动开启调试模式重新编译
                if (!options.debug) {
                    options.debug = true;
                    return compile(source, options)(data);
                }
                
                return showDebugInfo(e)();
                
            }
            
        }
        

        render.prototype = Render.prototype;
        render.toString = function () {
            return Render.toString();
        };


        if (filename && options.cache) {
            cacheStore[filename] = render;
        }

        
        return render;

    };




    // 数组迭代
    var forEach = utils.$each;


    // 静态分析模板变量
    var KEYWORDS =
        // 关键字
        'break,case,catch,continue,debugger,default,delete,do,else,false'
        + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
        + ',throw,true,try,typeof,var,void,while,with'

        // 保留字
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
        + ',final,float,goto,implements,import,int,interface,long,native'
        + ',package,private,protected,public,short,static,super,synchronized'
        + ',throws,transient,volatile'

        // ECMA 5 - use strict
        + ',arguments,let,yield'

        + ',undefined';

    var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
    var SPLIT_RE = /[^\w$]+/g;
    var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
    var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
    var BOUNDARY_RE = /^,+|,+$/g;


    // 获取变量
    function getVariable (code) {
        return code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
        .split(/^$|,+/);
    };


    // 字符串转义
    function stringify (code) {
        return "'" + code
        // 单引号与反斜杠转义
        .replace(/('|\\)/g, '\\$1')
        // 换行符转义(windows + linux)
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n') + "'";
    }


    function compiler (source, options) {
        
        var debug = options.debug;
        var openTag = options.openTag;
        var closeTag = options.closeTag;
        var parser = options.parser;
        var compress = options.compress;
        var escape = options.escape;
        

        
        var line = 1;
        var uniq = {$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1};
        


        var isNewEngine = ''.trim;// '__proto__' in {}
        var replaces = isNewEngine
        ? ["$out='';", "$out+=", ";", "$out"]
        : ["$out=[];", "$out.push(", ");", "$out.join('')"];

        var concat = isNewEngine
            ? "$out+=text;return $out;"
            : "$out.push(text);";
              
        var print = "function(){"
        +      "var text=''.concat.apply('',arguments);"
        +       concat
        +  "}";

        var include = "function(filename,data){"
        +      "data=data||$data;"
        +      "var text=$utils.$include(filename,data,$filename);"
        +       concat
        +   "}";

        var headerCode = "'use strict';"
        + "var $utils=this,$helpers=$utils.$helpers,"
        + (debug ? "$line=0," : "");
        
        var mainCode = replaces[0];

        var footerCode = "return new String(" + replaces[3] + ");"
        
        // html与逻辑语法分离
        forEach(source.split(openTag), function (code) {
            code = code.split(closeTag);
            
            var $0 = code[0];
            var $1 = code[1];
            
            // code: [html]
            if (code.length === 1) {
                
                mainCode += html($0);
             
            // code: [logic, html]
            } else {
                
                mainCode += logic($0);
                
                if ($1) {
                    mainCode += html($1);
                }
            }
            

        });
        
        var code = headerCode + mainCode + footerCode;
        
        // 调试语句
        if (debug) {
            code = "try{" + code + "}catch(e){"
            +       "throw {"
            +           "filename:$filename,"
            +           "name:'Render Error',"
            +           "message:e.message,"
            +           "line:$line,"
            +           "source:" + stringify(source)
            +           ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
            +       "};"
            + "}";
        }
        
        
        
        try {
            
            
            var Render = new Function("$data", "$filename", code);
            Render.prototype = utils;

            return Render;
            
        } catch (e) {
            e.temp = "function anonymous($data,$filename) {" + code + "}";
            throw e;
        }



        
        // 处理 HTML 语句
        function html (code) {
            
            // 记录行号
            line += code.split(/\n/).length - 1;

            // 压缩多余空白与注释
            if (compress) {
                code = code
                .replace(/\s+/g, ' ')
                .replace(/<!--.*?-->/g, '');
            }
            
            if (code) {
                code = replaces[1] + stringify(code) + replaces[2] + "\n";
            }

            return code;
        }
        
        
        // 处理逻辑语句
        function logic (code) {

            var thisLine = line;
           
            if (parser) {
            
                 // 语法转换插件钩子
                code = parser(code, options);
                
            } else if (debug) {
            
                // 记录行号
                code = code.replace(/\n/g, function () {
                    line ++;
                    return "$line=" + line +  ";";
                });
                
            }
            
            
            // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
            // <%=#value%> 等同 v2.0.3 之前的 <%==value%>
            if (code.indexOf('=') === 0) {

                var escapeSyntax = escape && !/^=[=#]/.test(code);

                code = code.replace(/^=[=#]?|[\s;]*$/g, '');

                // 对内容编码
                if (escapeSyntax) {

                    var name = code.replace(/\s*\([^\)]+\)/, '');

                    // 排除 utils.* | include | print
                    
                    if (!utils[name] && !/^(include|print)$/.test(name)) {
                        code = "$escape(" + code + ")";
                    }

                // 不编码
                } else {
                    code = "$string(" + code + ")";
                }
                

                code = replaces[1] + code + replaces[2];

            }
            
            if (debug) {
                code = "$line=" + thisLine + ";" + code;
            }
            
            // 提取模板中的变量名
            forEach(getVariable(code), function (name) {
                
                // name 值可能为空，在安卓低版本浏览器下
                if (!name || uniq[name]) {
                    return;
                }

                var value;

                // 声明模板变量
                // 赋值优先级:
                // [include, print] > utils > helpers > data
                if (name === 'print') {

                    value = print;

                } else if (name === 'include') {
                    
                    value = include;
                    
                } else if (utils[name]) {

                    value = "$utils." + name;

                } else if (helpers[name]) {

                    value = "$helpers." + name;

                } else {

                    value = "$data." + name;
                }
                
                headerCode += name + "=" + value + ",";
                uniq[name] = true;
                
                
            });
            
            return code + "\n";
        }
        
        
    };



    // 定义模板引擎的语法


    defaults.openTag = '{{';
    defaults.closeTag = '}}';


    var filtered = function (js, filter) {
        var parts = filter.split(':');
        var name = parts.shift();
        var args = parts.join(':') || '';

        if (args) {
            args = ', ' + args;
        }

        return '$helpers.' + name + '(' + js + args + ')';
    }


    defaults.parser = function (code, options) {
        code = code.replace(/^\s/, '');
        
        var split = code.split(' ');
        var key = split.shift();
        var args = split.join(' ');

        switch (key) {

            case 'if':

                code = 'if(' + args + '){';
                break;

            case 'else':
                
                if (split.shift() === 'if') {
                    split = ' if(' + split.join(' ') + ')';
                } else {
                    split = '';
                }

                code = '}else' + split + '{';
                break;

            case '/if':

                code = '}';
                break;

            case 'each':
                
                var object = split[0] || '$data';
                var as     = split[1] || 'as';
                var value  = split[2] || '$value';
                var index  = split[3] || '$index';
                
                var param   = value + ',' + index;
                
                if (as !== 'as') {
                    object = '[]';
                }
                
                code =  '$each(' + object + ',function(' + param + '){';
                break;

            case '/each':

                code = '});';
                break;

            case 'echo':

                code = 'print(' + args + ');';
                break;

            case 'print':
            case 'include':

                code = key + '(' + split.join(',') + ');';
                break;

            default:

                // 过滤器（辅助方法）
                // {{value | filterA:'abcd' | filterB}}
                // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
                if (args.indexOf('|') !== -1) {

                    var escape = options.escape;

                    // {{#value | link}}
                    if (code.indexOf('#') === 0) {
                        code = code.substr(1);
                        escape = false;
                    }

                    var i = 0;
                    var array = code.split('|');
                    var len = array.length;
                    var pre = escape ? '$escape' : '$string';
                    var val = pre + '(' + array[i++] + ')';

                    for (; i < len; i ++) {
                        val = filtered(val, array[i]);
                    }

                    code = '=#' + val;

                // 即将弃用 {{helperName value}}
                } else if (template.helpers[key]) {
                    
                    code = '=#' + key + '(' + split.join(',') + ');';
                
                // 内容直接输出 {{value}}
                } else {

                    code = '=' + code;
                }

                break;
        }
        
        
        return code;
    };
    
    return template;
};

// RequireJS && SeaJS
if (typeof define === 'function') {
    define('artTemplate#3.0.3', [], function() {
        return template;
    });

// NodeJS
} else if (typeof exports !== 'undefined') {
    module.exports = template;
} else {
    this.template = template;
}

})();
/* filePath fetchtemp/scripts/livesurvey_main_d2fc6644_ec653e41.js*/

/* filePath fetchtemp/scripts/livesurvey_template_c0986a45.js*/

define("livesurvey#1.0.6/template" , ["artTemplate#3.0.3"] , function(artTemplate){
   artTemplate = new artTemplate();
   var _template = {};
   var surveyForm = [];
   surveyForm.push('{{if questionObj}}')
   surveyForm.push('<div class=\"rOut mt30\">')
   surveyForm.push('  <div class=\"rInner\">')
   surveyForm.push('    <h3><span>调查 |</span> <a href=\"{{questionObj.url}}\" target=\"_blank\" data-id=\"{{questionObj.questionid}}\">{{questionObj.question}}{{questionObj.chooseTypeZh}}</a></h3>')
   surveyForm.push('    <ul class=\"rList\">')
   surveyForm.push('    {{each questionObj.resultArray as item index}}')
   surveyForm.push('        <li class=\"clearfix\">')
   surveyForm.push('          <p>')
   surveyForm.push('            <input type=\"{{questionObj.chooseType}}\" class=\"{{questionObj.className}}\" data-id=\"{{item.itemid}}\" name=\"n1\" id=\"surveyOpt{{index + 1}}\"/><label for=\"surveyOpt{{index + 1}}\">{{item.title}}</label>')
   surveyForm.push('          </p>')
   surveyForm.push('        </li>')
   surveyForm.push('    {{/each}}')
   surveyForm.push('    </ul>')
   surveyForm.push('  </div>')
   surveyForm.push('  <div class=\"rResult clearfix\">')
   surveyForm.push('    <input type=\"button\" value=\"提交\" id=\"surveySubmit\">')
   surveyForm.push('    <p><a href=\"#\" target=\"_blank\" id=\"viewResult\">跳过，查看结果</a></p>')
   surveyForm.push('  </div>')
   surveyForm.push('</div>')
   surveyForm.push('{{/if}}')

   _template.surveyForm = artTemplate("surveyForm" , surveyForm.join(''));

   var surveyResult = [];
   surveyResult.push('{{if questionObj}}')
   surveyResult.push('<div class=\"rOut rPd mt30\">')
   surveyResult.push('  <div class=\"rInner\">')
   surveyResult.push('    <h3><span>调查 |</span> <a href=\"{{questionObj.url}}\" target=\"_blank\">{{questionObj.question}}{{questionObj.chooseTypeZh}} </a></h3>')
   surveyResult.push('    <ul class=\"rList02\">')
   surveyResult.push('    {{each questionObj.resultArray as item index}}')
   surveyResult.push('      <li>')
   surveyResult.push('        <div class=\"txt clearfix\">')
   surveyResult.push('          <p class=\"p1\">{{item.title}}</p>')
   surveyResult.push('          <p class=\"p2\">{{item.nump}}%</p>')
   surveyResult.push('        </div>')
   surveyResult.push('        <div class=\"pic\"><img src=\"http://y2.ifengimg.com/2f884665881596e4/2015/38/line.gif\" width=\"{{item.nump}}%\"/></div>')
   surveyResult.push('      </li>')
   surveyResult.push('    {{/each}}')
   surveyResult.push('    </ul>')
   surveyResult.push('  </div>')
   surveyResult.push('</div>')
   surveyResult.push('{{/if}}')

   _template.surveyResult = artTemplate("surveyResult" , surveyResult.join(''));

   _template.helper = function(name, helper){
      artTemplate.helper(name, helper);
   }
   return _template;
});
/* filePath fetchtemp/scripts/livesurvey_0616545b.js*/

define("livesurvey#1.0.6" , ["F_glue", 'F_WidgetBase', "livesurvey#1.0.6/template",'jquery#1.8.1'],
    function (glue, WidgetBase, template, $) {
     
  var livesurvey = WidgetBase.extend({
    // 版本标识，请勿删除与更改
    version: '1.0.6',
    // 组件类型，请勿删除与更改
    type: 'livesurvey',

    // 创建组件内部数据
    createModel: function () {
      // model声明方式
      // this.modelName = glue.modelFactory.define(function (vm) {
      //   vm.propertyName = '';
      //   vm.arrayPropertyName = [];
      // });
      this.showSurveyUrl = 'http://survey.ifeng.com/api/showSurvey.php';
      this.pollSurveyUrl = 'http://survey.ifeng.com/api/pollSurvey.php';
      this.surveyUrlPrefix = 'http://survey.ifeng.com/';
      this.surveyJson = {};
      
      // 普通属性声明
      // this.propertyName = '';
    },

    // 创建并解析模板
    resolveTemplate: function () {
      // 以jquery为例
      // 使用模板
      // this.ownerNode = template.tmplateName(data);
      this.container = $('#' + this.container);
      this.getAndRenderSurveyForm();

    },

    // 绑定dom事件
    bindDomEvent: function () {
      // 以jquery为例

      var _this = this;

      // 投票后查看结果，用投票接口返回的数据渲染
      this.container.on('click', '#surveySubmit', function(){

        var qid = parseInt(_this.container.find('a[data-id]').data('id'));
        var aid = [];
        var aDomList = _this.container.find('input[data-id]');

        for(var i = 0, len = aDomList.length; i < len; i++){
          if(aDomList[i].checked){
            aid.push(parseInt(aDomList.eq(i).data('id')));
          }
        }

        var answer = 'sur[' + qid +'][]';
        var params = {
          'format':'js',
          'surveyid': _this.surveyId,
          'callback': 'voteSurvey'
        };

        if(aid.length == 0){ // 如果用户未作选择
          window.alert('您没有投票哦～');
        } else {

          params[answer] = aid.join(',');
          $.ajax({
            url:_this.pollSurveyUrl,
            dataType:'jsonp',
            data: params,
            jsonp: 'callback',
            jsonpCallback:'voteSurvey',
            cache:false,
            success: function(surveyJson){
              if(surveyJson && surveyJson.ifsuccess){
                _this.getAndRenderSurveyResult();

              }
            }

          });
        }
        
        
        return false;
      });

      // 如果选择直接查看结果，不再重新请求数据，使用页面加载时的数据渲染
      this.container.on('click', '#viewResult', function(){
          _this.renderSurveyResult(_this.surveyJson);
          return false;
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
      // 以jquery为例
      // $(this.container).append(this.ownerNode);
    },

    // 创建完成后的处理。
    createComplete: function () {

    },

    // 销毁组件
    destroy: function () {
      livesurvey.superclass.destroy.call(this);
      // 以jquery为例
      // $(this.container).empty();
    },

    getAndRenderSurveyForm: function(){

      var _this = this;

      var params = {
        'format':'js',
        'surveyid': this.surveyId,
        'callback': 'renderSurveyForm'
      };

      $.ajax({
        url:this.showSurveyUrl,
        dataType:'jsonp',
        data: params,
        jsonp: 'callback',
        jsonpCallback:'renderSurveyForm',
        cache:false,
        success: function(surveyJson){
          _this.renderSurveyForm(surveyJson);

        }
      });
    },

    getAndRenderSurveyResult: function(){

      var _this = this;

      var params = {
        'format':'js',
        'surveyid': this.surveyId,
        'callback': 'renderSurveyResult'
      };

      $.ajax({
        url:this.showSurveyUrl,
        dataType:'jsonp',
        data: params,
        jsonp: 'callback',
        jsonpCallback:'renderSurveyResult',
        cache:false,
        success: function(surveyJson){
          _this.renderSurveyResult(surveyJson);
        }
      });
    },

    renderSurveyForm: function(surveyJson){

      if(surveyJson && surveyJson.ifsuccess){
        this.surveyJson = surveyJson;
        var data = surveyJson.data.result;
        if(data.length > 0){ // 该调查最少有一个问题
          var questionObj = data[0];
          questionObj.chooseType = questionObj.choosetype == 'single' ? 'radio' : 'checkbox'; 
          questionObj.className = questionObj.choosetype == 'single' ? 'dx' : 'fx'; 
          questionObj.chooseTypeZh = questionObj.choosetype == 'single' ? '' : '（多选）'; 
          questionObj.url = this.surveyUrlPrefix + surveyJson.data.surveyinfo.channel + '/' + this.surveyId + '.html';

          // 渲染后填入调查dom

          this.container.html(template.surveyForm({questionObj:questionObj}));
        }

      }
    },

    renderSurveyResult: function(surveyJson){

      if(surveyJson && surveyJson.ifsuccess){
        var data = surveyJson.data.result;
        if(data.length > 0){ // 该调查最少有一个问题
          var questionObj = data[0];
          questionObj.chooseTypeZh = questionObj.choosetype == 'single' ? '' : '（多选）'; 
          questionObj.url = this.surveyUrlPrefix + surveyJson.data.surveyinfo.channel + '/' + this.surveyId + '.html';
          // 渲染后填入调查dom
          this.container.html(template.surveyResult({questionObj:questionObj}));
        }
      }
    }



    // 组件内部方法
  });

  return livesurvey;
});
/* filePath fetchtemp/scripts/videoCore_3b31a880_8d8ab539.js*/

/* filePath fetchtemp/scripts/video_264daea0.js*/

/**
 * @description : 该文件用于实现播放器代码。(embed object video)
 * @version     : 1.0.6
 * 
 **/
var F = (function (F) {

  "use strict";

  // 合并对象。
  function _merge(s, t) {
    var result = {};

    if (!t) {
      return result;
    }

    for (var i in s) {
      result[i] = typeof t[i] !== "undefined" ? t[i] : s[i];
    }

    return result;
  }

  //获取cookie
  function _getCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return (function(offset){
                var endstr = document.cookie.indexOf (";", offset);
                if (endstr == -1) {
                    endstr = document.cookie.length;
                }
                return decodeURIComponent(document.cookie.substring(offset, endstr));
            })(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
    }
    return "";
  }

  //设置cookie
  function _setCookie(name, value, params) {    
    var cStrArr = [];
    cStrArr.push(name + '=' + encodeURIComponent(value));
    
    if (typeof params === 'undefined') {
      params = {};
    }
    if (typeof params.expires !== 'undefined') {
      var date = new Date();
      date.setTime(date.getTime() + (params.expires) * 1000 * 60);
      cStrArr.push('; expires=' + date.toGMTString());
    }
    cStrArr.push((typeof params.path !== 'undefined') ? '; path=' + params.path : '');
    cStrArr.push((typeof params.domain !== 'undefined') ? '; domain=' + params.domain : '');
    cStrArr.push((typeof params.secure !== 'undefined') ? '; secure' : '');

    document.cookie = cStrArr.join('');
  }

  //随机获取一个uid
  function getRandomUid () {
    var date = new Date().getTime(),
      uid = '',
      fn = '',
      sn = '';

    fn = ((Math.random() * 2147483648) | 0).toString(36);
    sn = Math.round(Math.random() * 10000);
    uid = date + '_' + fn + sn;
    return uid;
  }


  function sendXV (playermsg, type) {
    var params = {
      url: type
    };
    params.id = playermsg.videoid;
    params.sid = _getCookie('sid');

    //如果获取userid为空串的话，生成一个userid
    if (_getCookie('userid') === '') {
      _setCookie('userid', getRandomUid(), {domain: '.ifeng.com', path: '/', expires: 60 * 24 * 360});
    }
    params.uid = _getCookie('userid');
    params.loc = _getCookie('ilocid');

    var cid = typeof playermsg.categoryId !== 'undefined' ? playermsg.categoryId : '';
    var cname = playermsg.columnName;
    params.provider = playermsg.provider || '';
    params.cat = cid;
    params.se = typeof cname !== 'undefined' ? cname : '';
    params.ptype = cid === '' ? '' : cid.substr(0, 4);
    params.ref = window.location.href.replace(/#/g,'$');
    params.tm = new Date().getTime();
    params.from = window.location.href.split('//')[1].split('.')[0];
    sendHTML5VideoInfo(params);
  }

  /**
   * html5的构造函数
   * @param {String} elmId    放置视频的容器
   * @param {Object} settings 参数配置对象
   * -------------------------具体参数列表
   *
   * data:    {Array}   播放地址列表
   * width:     {Number}  播放器宽
   * height:    {Number}  播放器高
   * id:      {String}  播放器id
   * autoplay:  {Boolean} 是否自动播放
   * poster:    {String}  海报图地址
   * controls:  {Boolean} 是否显示控制条
   * loadingImg:  {String}  隐藏的很深的一个参数，和poster参数功能有重复，看是否需要去掉某个
   */
  var Html5Video = function (elmId, settings, playermsg) {
    
    if (!elmId) {
      return;
    }

    // 设置参数
    this.settings = _merge({
      data : [],
      width : 600,
      height : 455,
      id : "player",
      autoPlay : true,
      poster : "",
      controls : true,
      endedCallback: this.ended,
      playingCallback: this.playing,
      pauseCallback: this.pause
    }, settings);

    this.playermsg = playermsg;

    // 索引设置为0
    this.index = 0;
    // 获取放置视频的容器
    this.box = document.getElementById(elmId);
    //当前播放视频guid
    this.curGuid = '';
    //记录的guid
    this.remGuid = '';
    // 在容器中再生成一个容器，设置为相对定位
    var container = document.createElement("div");
    container.style.position = "relative";
    this.container = container;
    this.box.appendChild(this.container);
    // 开始初始化
    this.init();
  };

  Html5Video.prototype = {

    init : function () {
      var _this = this;
      var playermsg = this.playermsg;
      // 创建一个video对象
      this.video = this.videoFactory();
      // 将视频插入容器
      this.container.appendChild(this.video);
      this.curGuid = playermsg.videoid;
      sendXV(playermsg, 'vv');
      // 绑定播放开始事件
      this.bind(this.video, "play", function () {

        if (_this.remGuid !== _this.curGuid) {
          _this.remGuid = _this.curGuid;
          sendXV(playermsg, 'cv');
        }
      });

      this.bind(this.video, "pause", function() {
        _this.settings.pauseCallback.call(_this);
      });

      this.bind(this.video, "playing", function() {
        _this.settings.playingCallback.call(_this);
      });
      // 绑定播放结束事件，
      this.bind(this.video, "ended", function () {
        _this.settings.endedCallback.call(_this);
      });
      
      this.bind(this.video, "dataunavailble", function () {
        if (document.getElementById("player").readyState === 0) {
          alert("不支持该视频格式");
        }
      });

      this.checkVideoState(this.video);
    },

    playing: function() {},
    pause: function() {},

    ended: function () {

      var settings = this.settings;
      var data = settings.data;
      this.index = this.index + 1;
      var next = data[this.index];
      // 如果下一个地址为空，直接返回
      if (!next) {
        return;
      }
      this.video.setAttribute("src", next);
      this.video.play();
    },

    /**
     * 创造一个video对象
     */
    videoFactory : function () {
      var settings = this.settings;
      var video = document.createElement("video");
      video.width = settings.width;
      video.height = settings.height;
      video.setAttribute("id", settings.id);
      
      if (settings.poster !== "") {
        video.setAttribute("poster", settings.poster);
      }


      if (settings.controls === true) {
        video.setAttribute("controls", "controls");
      }

      if (settings.autoPlay === true) {
        video.setAttribute("autoplay", "autoplay");
      }

      // setting中并没有设置这个。
      // settings.loadingImg && video.setAttribute("poster", settings.loadingImg);
      if (typeof settings.data[0] !== "undefined") {
        video.setAttribute("src", settings.data[0]);
      }
      
      return video;
    },

    // 注册事件的封装
    bind : function (target, e, callback, useCapture) {
      try {
        target.addEventListener(e, function (event) {
          callback(event);
        }, useCapture ? useCapture : false);
      } catch (e) {
        throw new Error("check the params.");
      }
    },

    // 检查视频的状态
    checkVideoState : function (video) {
      var retry = 5;
      this.bind(video, "error", function () {
        if (!retry) {
          return;
        }
        retry = retry - 1;
        switch (video.readyState) {
        case 0 :
        case 1 :
        case 2 :
          var pos = video.currentTime;
          video.load();
          video.play();
          video.currentTime = pos;
          break;
        default :
          break;
        }
      });
    }
  };

  /**
   * flash player的构造函数
   * @param {String} elmId    放置播放器的容器
   * @param {Object} settings 参数配置对象
   * -------------------------具体参数列表
   *
   * url:     {String}  播放地址字符串
   * width:     {Number}  播放器的宽度值
   * height:    {Number}  播放器的高度值
   * id:      {String}  播放器的id
   * version:   {Array}   *不懂是什么
   *
   */
  var Player = function (elmId, settings) {
    if (!elmId) {
      return;
    }
    this.settings = _merge({
      url : "",
      width : 300,
      height : 225,
      id : "",
      version : [10, 0, 200]
    }, settings);
    this.el = document.getElementById(elmId);
    // 参数
    this.params = {};
    // 参数
    this.variables = {};
  };

  Player.prototype = {

    addParam : function (name, value) {
      this.params[name] = value;
    },

    addVariable : function (name, value) {
      this.variables[name] = value;
    },

    getVariables : function () {
      var a = [], o = this.variables;
      for (var i in o) {
        a.push(i + "=" + o[i]);
      }
      return a.join("&");
    },

    // todo: isIE并没有在此函数中声明和赋值。
    getParamString : function (isIE) {
      var a = [], o = this.params;
      var i;
      if (isIE) {
        for (i in o) {
          a.push('<param name="' + i + '" value="' + o[i] + '">');
        }
      } else {
        for (i in o) {
          a.push(i + "=" + o[i] + " ");
        }
      }
      return a.join("");
    },

    addCallback: function (callbackName, method, scope) {
      scope = scope || window;
      window[callbackName] = function () {
        return method.apply(scope, arguments);
      };
    },
    // 这个应该是调用扩展吧。
    callExternal : function (movieName, method, param, mathodCallback) {
      var o = navigator.appName.indexOf("Microsoft") !== -1 ? window[movieName] : document[movieName];
      o[method](param, mathodCallback);
    },

    play : function () {
      var fls = this.getVersion(), v = this.settings.version;
      
      // 如果当前浏览器flash版本号低于设置中规定的版本
      if (parseInt(fls[0], 10) < v[0] && parseInt(fls[1], 10) < v[1] && parseInt(fls[2], 10) < v[2]) {
        this.el.innerHTML = '<a style="display:block;height:31px;width:190px;line-height:31px;font-size:12px;text-decoration:none;text-align:center;position:absolute;top:100px;left:410px;border:2px outset #999;" href="http://get.adobe.com/flashplayer/" target="_blank">请下载最新版的flash播放器</a>';
        return;
      }
      
      var f = [];
      if (!!window.ActiveXObject) {
        f.push('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="');
        f.push(this.settings.width);
        f.push('" height="');
        f.push(this.settings.height);
        f.push('" id="');
        f.push(this.settings.id);
        f.push('"><param name="movie" value="');
        f.push(this.settings.url);
        f.push('"><param name="flashvars" value="');
        f.push(this.getVariables());
        f.push('">');
        f.push(this.getParamString(true));
        f.push("</object>");
      } else {
        f.push('<embed pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"');
        f.push(' src="');
        f.push(this.settings.url);
        f.push('" height="');
        f.push(this.settings.height);
        f.push('" width="');
        f.push(this.settings.width);
        f.push('" id="');
        f.push(this.settings.id);
        f.push('" flashvars="');
        f.push(this.getVariables());
        f.push('" ');
        f.push(this.getParamString(false));
        f.push(">");
      }
      this.el.innerHTML = f.join("");
    },
    
    // 获取flash插件版本
    getVersion : function () {
      var b = [0, 0, 0];
      var c, f;
      if (navigator.plugins && navigator.mimeTypes.length) {
        var plugins = navigator.plugins["Shockwave Flash"];
        if (plugins && plugins.description) {
          return plugins.description.replace(/^\D+/, "").replace(/\s*r/, ".").replace(/\s*[a-z]+\d*/, ".0").split(".");
        }
      }
      if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") !== -1) {
        c = 1;
        f = 3;
        while (c) {
          try {
            c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + (++f));
            return [f, 0, 0];
          } catch (d) {
            c = null;
          }
        }
      }
      try {
        c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
      } catch (d) {
        try {
          c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
          b = [6, 0, 21];
          c.AllowScriptAccess = "always";
        } catch (d) {
          if (b.major === 6) {
            return b;
          }
        }
        try {
          c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        } catch (d) {
        }
      }
      if (c) {
        b = c.GetVariable("$version").split(" ")[1].split(",");
      }
      return b;
    }
  };

  F.video = F.video || {};
  F.video.Player = Player;
  F.video.Html5Video = Html5Video;
  return F;

}(F || {}));


//移动设备

var ClientRedirect = (function () {
  "use strict";
  var sUserAgent = navigator.userAgent.toLowerCase();
  // var bIsIpad = sUserAgent.match(/ipad/i) === "ipad";
  // var bIsIphoneOs = sUserAgent.match(/iphone os/i) === "iphone os";
  // var bIsMidp = sUserAgent.match(/midp/i) === "midp";
  // var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) === "rv:1.2.3.4";
  // var bIsUc = sUserAgent.match(/ucweb/i) === "ucweb";
  // var bIsAndroid = sUserAgent.match(/android/i) === "android";
  // var bIsCE = sUserAgent.match(/windows ce/i) === "windows ce";
  // var bIsWM = sUserAgent.match(/windows phone/i) === "windows phone";

  var bIsIpad = sUserAgent.indexOf("ipad") > -1;
  var bIsIphoneOs = sUserAgent.indexOf("iphone os") > -1;
  var bIsMidp = sUserAgent.indexOf("midp") > -1;
  var bIsUc7 = sUserAgent.indexOf("rv:1.2.3.4") > -1;
  var bIsUc = sUserAgent.indexOf("ucweb") > -1;
  var bIsAndroid = sUserAgent.indexOf("android") > -1;
  var bIsCE = sUserAgent.indexOf("windows ce") > -1;
  var bIsWM = sUserAgent.indexOf("windows phone") > -1;

  return {
    bIsIpad : bIsIpad,
    bIsIphone : bIsIphoneOs,
    bIsMidp : bIsMidp,
    bIsUc : bIsUc,
    bIsAndroid : bIsAndroid,
    bIsCE : bIsCE,
    bIsWM : bIsWM,
    bIsUc7 : bIsUc7
  };
})();

//移动设备判定
ClientRedirect.isMobile = function () {

  "use strict";
  var result = ClientRedirect.bIsIpad || ClientRedirect.bIsIphone || ClientRedirect.bIsWM || ClientRedirect.bIsAndroid;
  return !!result;
};

//向统计系统发送html5的video播放器调用统计数据
var sendHTML5VideoInfo = function (params) {

  if (typeof params !== 'undefined') {
    // 合并对象。
    var _merge = function (s, t) {
      var result = {};

      if (!t) {
        return result;
      }

      for (var i in s) {
        result[i] = typeof t[i] !== "undefined" ? t[i] : s[i];
      }

      return result;
    };
  
    var url = 'http://stadig.ifeng.com/media.js';
    var data = _merge({
          url: '',
          id: '',
          sid: '',
          uid: '',
          from: '',
          provider: '',
          loc: '',
          cat: '',
          se: '',
          ptype: '',
          vid: 'HTML5Player',
          ref: '',//域名
          tm: ''//时间戳
        }, params);

    //针对影视做的特殊统计参数处理
    if (typeof paramInfo !== 'undefined' && typeof paramInfo.type !== 'undefined' && typeof videoinfo !== 'undefined' && typeof videoinfo.cpId !== 'undefined') {
      data.provider = videoinfo.cpId;
    }

    pArr = [];
    for (var i in data) {
      pArr.push(i + '=' + encodeURIComponent(data[i]));
    }
    var scriptDom = document.createElement('script');
    url = (pArr.length > 0) ? url + '?' + pArr.join('&') : url;
    scriptDom.src = url;
    document.getElementsByTagName("head").item(0).appendChild(scriptDom);    
  }
};

 /**
 * @description : 该文件用于实现播放器代码。(embed object video)
 * 
 * @version     : 1.0.6
 * 
 * @createTime  : 2013-06-21
 * 
 * @updateTime  : 2013-12-21
 * 
 * @updateLog   : 
 *   
 *         1.0.1 - 实现播放器代码
 *         1.0.2 - 将param.ref属性中的#替换为$
 *         1.0.3 - 加入了在userid为空的时候，自动生成并设置userid的功能。
 *         1.0.4 - 加入了对playing和pause事件的处理
 *         1.0.5 - 加入了在影视视频时候的provider字段处理
 *         1.0.6 - 加入了统计loc字段处理，在video时为pad或phone
 *
 **/
 //
/* filePath fetchtemp/scripts/adapter_2e3cf128.js*/

define("videoCore#1.0.6" , [], function () {
  return {
    version: '1.0.6',
    Player: F.video.Player,
    Html5Video: F.video.Html5Video,
    ClientRedirect: ClientRedirect,
    sendHTML5VideoInfo: sendHTML5VideoInfo
  };
});
/* filePath fetchtemp/scripts/handlebars_9705c7d9.js*/

define("handlebar#1.3.3",[],function(){var t=function(){var t=function(){"use strict";function t(t){this.string=t}var e;return t.prototype.toString=function(){return""+this.string},e=t}(),e=function(t){"use strict";function e(t){return a[t]||"&amp;"}function i(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])}function n(t){return t instanceof o?t.toString():t||0===t?(t=""+t,c.test(t)?t.replace(h,e):t):""}function r(t){return t||0===t?u(t)&&0===t.length?!0:!1:!0}var s={},o=t,a={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},h=/[&<>"'`]/g,c=/[&<>"'`]/;s.extend=i;var p=Object.prototype.toString;s.toString=p;var l=function(t){return"function"==typeof t};l(/x/)&&(l=function(t){return"function"==typeof t&&"[object Function]"===p.call(t)});var l;s.isFunction=l;var u=Array.isArray||function(t){return t&&"object"==typeof t?"[object Array]"===p.call(t):!1};return s.isArray=u,s.escapeExpression=n,s.isEmpty=r,s}(t),i=function(){"use strict";function t(t,e){var n;e&&e.firstLine&&(n=e.firstLine,t+=" - "+n+":"+e.firstColumn);for(var r=Error.prototype.constructor.call(this,t),s=0;s<i.length;s++)this[i[s]]=r[i[s]];n&&(this.lineNumber=n,this.column=e.firstColumn)}var e,i=["description","fileName","lineNumber","message","name","number","stack"];return t.prototype=new Error,e=t}(),n=function(t,e){"use strict";function i(t,e){this.helpers=t||{},this.partials=e||{},n(this)}function n(t){t.registerHelper("helperMissing",function(t){if(2===arguments.length)return void 0;throw new a("Missing helper: '"+t+"'")}),t.registerHelper("blockHelperMissing",function(e,i){var n=i.inverse||function(){},r=i.fn;return u(e)&&(e=e.call(this)),e===!0?r(this):e===!1||null==e?n(this):l(e)?e.length>0?t.helpers.each(e,i):n(this):r(e)}),t.registerHelper("each",function(t,e){var i,n=e.fn,r=e.inverse,s=0,o="";if(u(t)&&(t=t.call(this)),e.data&&(i=g(e.data)),t&&"object"==typeof t)if(l(t))for(var a=t.length;a>s;s++)i&&(i.index=s,i.first=0===s,i.last=s===t.length-1),o+=n(t[s],{data:i});else for(var h in t)t.hasOwnProperty(h)&&(i&&(i.key=h,i.index=s,i.first=0===s),o+=n(t[h],{data:i}),s++);return 0===s&&(o=r(this)),o}),t.registerHelper("if",function(t,e){return u(t)&&(t=t.call(this)),!e.hash.includeZero&&!t||o.isEmpty(t)?e.inverse(this):e.fn(this)}),t.registerHelper("unless",function(e,i){return t.helpers["if"].call(this,e,{fn:i.inverse,inverse:i.fn,hash:i.hash})}),t.registerHelper("with",function(t,e){return u(t)&&(t=t.call(this)),o.isEmpty(t)?void 0:e.fn(t)}),t.registerHelper("log",function(e,i){var n=i.data&&null!=i.data.level?parseInt(i.data.level,10):1;t.log(n,e)})}function r(t,e){m.log(t,e)}var s={},o=t,a=e,h="1.3.0";s.VERSION=h;var c=4;s.COMPILER_REVISION=c;var p={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:">= 1.0.0"};s.REVISION_CHANGES=p;var l=o.isArray,u=o.isFunction,f=o.toString,d="[object Object]";s.HandlebarsEnvironment=i,i.prototype={constructor:i,logger:m,log:r,registerHelper:function(t,e,i){if(f.call(t)===d){if(i||e)throw new a("Arg not supported with multiple helpers");o.extend(this.helpers,t)}else i&&(e.not=i),this.helpers[t]=e},registerPartial:function(t,e){f.call(t)===d?o.extend(this.partials,t):this.partials[t]=e}};var m={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,log:function(t,e){if(m.level<=t){var i=m.methodMap[t];"undefined"!=typeof console&&console[i]&&console[i].call(console,e)}}};s.logger=m,s.log=r;var g=function(t){var e={};return o.extend(e,t),e};return s.createFrame=g,s}(e,i),r=function(t,e,i){"use strict";function n(t){var e=t&&t[0]||1,i=u;if(e!==i){if(i>e){var n=f[i],r=f[e];throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+n+") or downgrade your runtime to an older version ("+r+").")}throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+t[1]+").")}}function r(t,e){if(!e)throw new l("No environment passed to template");var i=function(t,i,n,r,s,o){var a=e.VM.invokePartial.apply(this,arguments);if(null!=a)return a;if(e.compile){var h={helpers:r,partials:s,data:o};return s[i]=e.compile(t,{data:void 0!==o},e),s[i](n,h)}throw new l("The partial "+i+" could not be compiled when running in runtime-only mode")},n={escapeExpression:p.escapeExpression,invokePartial:i,programs:[],program:function(t,e,i){var n=this.programs[t];return i?n=o(t,e,i):n||(n=this.programs[t]=o(t,e)),n},merge:function(t,e){var i=t||e;return t&&e&&t!==e&&(i={},p.extend(i,e),p.extend(i,t)),i},programWithDepth:e.VM.programWithDepth,noop:e.VM.noop,compilerInfo:null};return function(i,r){r=r||{};var s,o,a=r.partial?r:e;r.partial||(s=r.helpers,o=r.partials);var h=t.call(n,a,i,s,o,r.data);return r.partial||e.VM.checkRevision(n.compilerInfo),h}}function s(t,e,i){var n=Array.prototype.slice.call(arguments,3),r=function(t,r){return r=r||{},e.apply(this,[t,r.data||i].concat(n))};return r.program=t,r.depth=n.length,r}function o(t,e,i){var n=function(t,n){return n=n||{},e(t,n.data||i)};return n.program=t,n.depth=0,n}function a(t,e,i,n,r,s){var o={partial:!0,helpers:n,partials:r,data:s};if(void 0===t)throw new l("The partial "+e+" could not be found");return t instanceof Function?t(i,o):void 0}function h(){return""}var c={},p=t,l=e,u=i.COMPILER_REVISION,f=i.REVISION_CHANGES;return c.checkRevision=n,c.template=r,c.programWithDepth=s,c.program=o,c.invokePartial=a,c.noop=h,c}(e,i,n),s=function(t,e,i,n,r){"use strict";var s,o=t,a=e,h=i,c=n,p=r,l=function(){var t=new o.HandlebarsEnvironment;return c.extend(t,o),t.SafeString=a,t.Exception=h,t.Utils=c,t.VM=p,t.template=function(e){return p.template(e,t)},t},u=l();return u.create=l,s=u}(n,t,i,e,r),o=function(t){"use strict";function e(t){t=t||{},this.firstLine=t.first_line,this.firstColumn=t.first_column,this.lastColumn=t.last_column,this.lastLine=t.last_line}var i,n=t,r={ProgramNode:function(t,i,n,s){var o,a;3===arguments.length?(s=n,n=null):2===arguments.length&&(s=i,i=null),e.call(this,s),this.type="program",this.statements=t,this.strip={},n?(a=n[0],a?(o={first_line:a.firstLine,last_line:a.lastLine,last_column:a.lastColumn,first_column:a.firstColumn},this.inverse=new r.ProgramNode(n,i,o)):this.inverse=new r.ProgramNode(n,i),this.strip.right=i.left):i&&(this.strip.left=i.right)},MustacheNode:function(t,i,n,s,o){if(e.call(this,o),this.type="mustache",this.strip=s,null!=n&&n.charAt){var a=n.charAt(3)||n.charAt(2);this.escaped="{"!==a&&"&"!==a}else this.escaped=!!n;this.sexpr=t instanceof r.SexprNode?t:new r.SexprNode(t,i),this.sexpr.isRoot=!0,this.id=this.sexpr.id,this.params=this.sexpr.params,this.hash=this.sexpr.hash,this.eligibleHelper=this.sexpr.eligibleHelper,this.isHelper=this.sexpr.isHelper},SexprNode:function(t,i,n){e.call(this,n),this.type="sexpr",this.hash=i;var r=this.id=t[0],s=this.params=t.slice(1),o=this.eligibleHelper=r.isSimple;this.isHelper=o&&(s.length||i)},PartialNode:function(t,i,n,r){e.call(this,r),this.type="partial",this.partialName=t,this.context=i,this.strip=n},BlockNode:function(t,i,r,s,o){if(e.call(this,o),t.sexpr.id.original!==s.path.original)throw new n(t.sexpr.id.original+" doesn't match "+s.path.original,this);this.type="block",this.mustache=t,this.program=i,this.inverse=r,this.strip={left:t.strip.left,right:s.strip.right},(i||r).strip.left=t.strip.right,(r||i).strip.right=s.strip.left,r&&!i&&(this.isInverse=!0)},ContentNode:function(t,i){e.call(this,i),this.type="content",this.string=t},HashNode:function(t,i){e.call(this,i),this.type="hash",this.pairs=t},IdNode:function(t,i){e.call(this,i),this.type="ID";for(var r="",s=[],o=0,a=0,h=t.length;h>a;a++){var c=t[a].part;if(r+=(t[a].separator||"")+c,".."===c||"."===c||"this"===c){if(s.length>0)throw new n("Invalid path: "+r,this);".."===c?o++:this.isScoped=!0}else s.push(c)}this.original=r,this.parts=s,this.string=s.join("."),this.depth=o,this.isSimple=1===t.length&&!this.isScoped&&0===o,this.stringModeValue=this.string},PartialNameNode:function(t,i){e.call(this,i),this.type="PARTIAL_NAME",this.name=t.original},DataNode:function(t,i){e.call(this,i),this.type="DATA",this.id=t},StringNode:function(t,i){e.call(this,i),this.type="STRING",this.original=this.string=this.stringModeValue=t},IntegerNode:function(t,i){e.call(this,i),this.type="INTEGER",this.original=this.integer=t,this.stringModeValue=Number(t)},BooleanNode:function(t,i){e.call(this,i),this.type="BOOLEAN",this.bool=t,this.stringModeValue="true"===t},CommentNode:function(t,i){e.call(this,i),this.type="comment",this.comment=t}};return i=r}(i),a=function(){"use strict";var t,e=function(){function t(t,e){return{left:"~"===t.charAt(2),right:"~"===e.charAt(0)||"~"===e.charAt(1)}}function e(){this.yy={}}var i={trace:function(){},yy:{},symbols_:{error:2,root:3,statements:4,EOF:5,program:6,simpleInverse:7,statement:8,openInverse:9,closeBlock:10,openBlock:11,mustache:12,partial:13,CONTENT:14,COMMENT:15,OPEN_BLOCK:16,sexpr:17,CLOSE:18,OPEN_INVERSE:19,OPEN_ENDBLOCK:20,path:21,OPEN:22,OPEN_UNESCAPED:23,CLOSE_UNESCAPED:24,OPEN_PARTIAL:25,partialName:26,partial_option0:27,sexpr_repetition0:28,sexpr_option0:29,dataName:30,param:31,STRING:32,INTEGER:33,BOOLEAN:34,OPEN_SEXPR:35,CLOSE_SEXPR:36,hash:37,hash_repetition_plus0:38,hashSegment:39,ID:40,EQUALS:41,DATA:42,pathSegments:43,SEP:44,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",35:"OPEN_SEXPR",36:"CLOSE_SEXPR",40:"ID",41:"EQUALS",42:"DATA",44:"SEP"},productions_:[0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,3],[37,1],[39,3],[26,1],[26,1],[26,1],[30,2],[21,1],[43,3],[43,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[38,1],[38,2]],performAction:function(e,i,n,r,s,o){var a=o.length-1;switch(s){case 1:return new r.ProgramNode(o[a-1],this._$);case 2:return new r.ProgramNode([],this._$);case 3:this.$=new r.ProgramNode([],o[a-1],o[a],this._$);break;case 4:this.$=new r.ProgramNode(o[a-2],o[a-1],o[a],this._$);break;case 5:this.$=new r.ProgramNode(o[a-1],o[a],[],this._$);break;case 6:this.$=new r.ProgramNode(o[a],this._$);break;case 7:this.$=new r.ProgramNode([],this._$);break;case 8:this.$=new r.ProgramNode([],this._$);break;case 9:this.$=[o[a]];break;case 10:o[a-1].push(o[a]),this.$=o[a-1];break;case 11:this.$=new r.BlockNode(o[a-2],o[a-1].inverse,o[a-1],o[a],this._$);break;case 12:this.$=new r.BlockNode(o[a-2],o[a-1],o[a-1].inverse,o[a],this._$);break;case 13:this.$=o[a];break;case 14:this.$=o[a];break;case 15:this.$=new r.ContentNode(o[a],this._$);break;case 16:this.$=new r.CommentNode(o[a],this._$);break;case 17:this.$=new r.MustacheNode(o[a-1],null,o[a-2],t(o[a-2],o[a]),this._$);break;case 18:this.$=new r.MustacheNode(o[a-1],null,o[a-2],t(o[a-2],o[a]),this._$);break;case 19:this.$={path:o[a-1],strip:t(o[a-2],o[a])};break;case 20:this.$=new r.MustacheNode(o[a-1],null,o[a-2],t(o[a-2],o[a]),this._$);break;case 21:this.$=new r.MustacheNode(o[a-1],null,o[a-2],t(o[a-2],o[a]),this._$);break;case 22:this.$=new r.PartialNode(o[a-2],o[a-1],t(o[a-3],o[a]),this._$);break;case 23:this.$=t(o[a-1],o[a]);break;case 24:this.$=new r.SexprNode([o[a-2]].concat(o[a-1]),o[a],this._$);break;case 25:this.$=new r.SexprNode([o[a]],null,this._$);break;case 26:this.$=o[a];break;case 27:this.$=new r.StringNode(o[a],this._$);break;case 28:this.$=new r.IntegerNode(o[a],this._$);break;case 29:this.$=new r.BooleanNode(o[a],this._$);break;case 30:this.$=o[a];break;case 31:o[a-1].isHelper=!0,this.$=o[a-1];break;case 32:this.$=new r.HashNode(o[a],this._$);break;case 33:this.$=[o[a-2],o[a]];break;case 34:this.$=new r.PartialNameNode(o[a],this._$);break;case 35:this.$=new r.PartialNameNode(new r.StringNode(o[a],this._$),this._$);break;case 36:this.$=new r.PartialNameNode(new r.IntegerNode(o[a],this._$));break;case 37:this.$=new r.DataNode(o[a],this._$);break;case 38:this.$=new r.IdNode(o[a],this._$);break;case 39:o[a-2].push({part:o[a],separator:o[a-1]}),this.$=o[a-2];break;case 40:this.$=[{part:o[a]}];break;case 43:this.$=[];break;case 44:o[a-1].push(o[a]);break;case 47:this.$=[o[a]];break;case 48:o[a-1].push(o[a])}},table:[{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:29,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:30,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:31,21:24,30:25,40:[1,28],42:[1,27],43:26},{21:33,26:32,32:[1,34],33:[1,35],40:[1,28],43:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,40:[1,28],42:[1,27],43:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,43],24:[2,43],28:43,32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],40:[2,43],42:[2,43]},{18:[2,25],24:[2,25],36:[2,25]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],40:[2,38],42:[2,38],44:[1,44]},{21:45,40:[1,28],43:26},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],42:[2,40],44:[2,40]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,41],21:50,27:49,40:[1,28],43:26},{18:[2,34],40:[2,34]},{18:[2,35],40:[2,35]},{18:[2,36],40:[2,36]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,40:[1,28],43:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,45],21:56,24:[2,45],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:[1,61],36:[2,45],37:55,38:62,39:63,40:[1,64],42:[1,27],43:26},{40:[1,65]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],40:[2,37],42:[2,37]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,66]},{18:[2,42]},{18:[1,67]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24],36:[2,24]},{18:[2,44],24:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],40:[2,44],42:[2,44]},{18:[2,46],24:[2,46],36:[2,46]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],40:[2,26],42:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],40:[2,27],42:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],40:[2,28],42:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],40:[2,29],42:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],40:[2,30],42:[2,30]},{17:68,21:24,30:25,40:[1,28],42:[1,27],43:26},{18:[2,32],24:[2,32],36:[2,32],39:69,40:[1,70]},{18:[2,47],24:[2,47],36:[2,47],40:[2,47]},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],41:[1,71],42:[2,40],44:[2,40]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],40:[2,39],42:[2,39],44:[2,39]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{36:[1,72]},{18:[2,48],24:[2,48],36:[2,48],40:[2,48]},{41:[1,71]},{21:56,30:60,31:73,32:[1,57],33:[1,58],34:[1,59],35:[1,61],40:[1,28],42:[1,27],43:26},{18:[2,31],24:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],40:[2,31],42:[2,31]},{18:[2,33],24:[2,33],36:[2,33],40:[2,33]}],defaultActions:{3:[2,2],16:[2,1],50:[2,42]},parseError:function(t){throw new Error(t)},parse:function(t){function e(){var t;return t=i.lexer.lex()||1,"number"!=typeof t&&(t=i.symbols_[t]||t),t}var i=this,n=[0],r=[null],s=[],o=this.table,a="",h=0,c=0,p=0;this.lexer.setInput(t),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,"undefined"==typeof this.lexer.yylloc&&(this.lexer.yylloc={});var l=this.lexer.yylloc;s.push(l);var u=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError&&(this.parseError=this.yy.parseError);for(var f,d,m,g,v,y,x,S,b,k={};;){if(m=n[n.length-1],this.defaultActions[m]?g=this.defaultActions[m]:((null===f||"undefined"==typeof f)&&(f=e()),g=o[m]&&o[m][f]),"undefined"==typeof g||!g.length||!g[0]){var E="";if(!p){b=[];for(y in o[m])this.terminals_[y]&&y>2&&b.push("'"+this.terminals_[y]+"'");E=this.lexer.showPosition?"Parse error on line "+(h+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+b.join(", ")+", got '"+(this.terminals_[f]||f)+"'":"Parse error on line "+(h+1)+": Unexpected "+(1==f?"end of input":"'"+(this.terminals_[f]||f)+"'"),this.parseError(E,{text:this.lexer.match,token:this.terminals_[f]||f,line:this.lexer.yylineno,loc:l,expected:b})}}if(g[0]instanceof Array&&g.length>1)throw new Error("Parse Error: multiple actions possible at state: "+m+", token: "+f);switch(g[0]){case 1:n.push(f),r.push(this.lexer.yytext),s.push(this.lexer.yylloc),n.push(g[1]),f=null,d?(f=d,d=null):(c=this.lexer.yyleng,a=this.lexer.yytext,h=this.lexer.yylineno,l=this.lexer.yylloc,p>0&&p--);break;case 2:if(x=this.productions_[g[1]][1],k.$=r[r.length-x],k._$={first_line:s[s.length-(x||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(x||1)].first_column,last_column:s[s.length-1].last_column},u&&(k._$.range=[s[s.length-(x||1)].range[0],s[s.length-1].range[1]]),v=this.performAction.call(k,a,c,h,this.yy,g[1],r,s),"undefined"!=typeof v)return v;x&&(n=n.slice(0,-1*x*2),r=r.slice(0,-1*x),s=s.slice(0,-1*x)),n.push(this.productions_[g[1]][0]),r.push(k.$),s.push(k._$),S=o[n[n.length-2]][n[n.length-1]],n.push(S);break;case 3:return!0}}return!0}},n=function(){var t={EOF:1,parseError:function(t,e){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,e)},setInput:function(t){return this._input=t,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var t=this._input[0];this.yytext+=t,this.yyleng++,this.offset++,this.match+=t,this.matched+=t;var e=t.match(/(?:\r\n?|\n).*/g);return e?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),t},unput:function(t){var e=t.length,i=t.split(/(?:\r\n?|\n)/g);this._input=t+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-e-1),this.offset-=e;var n=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),i.length-1&&(this.yylineno-=i.length-1);var r=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:i?(i.length===n.length?this.yylloc.first_column:0)+n[n.length-i.length].length-i[0].length:this.yylloc.first_column-e},this.options.ranges&&(this.yylloc.range=[r[0],r[0]+this.yyleng-e]),this},more:function(){return this._more=!0,this},less:function(t){this.unput(this.match.slice(t))},pastInput:function(){var t=this.matched.substr(0,this.matched.length-this.match.length);return(t.length>20?"...":"")+t.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var t=this.match;return t.length<20&&(t+=this._input.substr(0,20-t.length)),(t.substr(0,20)+(t.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var t=this.pastInput(),e=new Array(t.length+1).join("-");return t+this.upcomingInput()+"\n"+e+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var t,e,i,n,r;this._more||(this.yytext="",this.match="");for(var s=this._currentRules(),o=0;o<s.length&&(i=this._input.match(this.rules[s[o]]),!i||e&&!(i[0].length>e[0].length)||(e=i,n=o,this.options.flex));o++);return e?(r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],t=this.performAction.call(this,this.yy,this,s[n],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),t?t:void 0):""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return"undefined"!=typeof t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(t){this.begin(t)}};return t.options={},t.performAction=function(t,e,i,n){function r(t,i){return e.yytext=e.yytext.substr(t,e.yyleng-i)}switch(i){case 0:if("\\\\"===e.yytext.slice(-2)?(r(0,1),this.begin("mu")):"\\"===e.yytext.slice(-1)?(r(0,1),this.begin("emu")):this.begin("mu"),e.yytext)return 14;break;case 1:return 14;case 2:return this.popState(),14;case 3:return r(0,4),this.popState(),15;case 4:return 35;case 5:return 36;case 6:return 25;case 7:return 16;case 8:return 20;case 9:return 19;case 10:return 19;case 11:return 23;case 12:return 22;case 13:this.popState(),this.begin("com");break;case 14:return r(3,5),this.popState(),15;case 15:return 22;case 16:return 41;case 17:return 40;case 18:return 40;case 19:return 44;case 20:break;case 21:return this.popState(),24;case 22:return this.popState(),18;case 23:return e.yytext=r(1,2).replace(/\\"/g,'"'),32;case 24:return e.yytext=r(1,2).replace(/\\'/g,"'"),32;case 25:return 42;case 26:return 34;case 27:return 34;case 28:return 33;case 29:return 40;case 30:return e.yytext=r(1,2),40;case 31:return"INVALID";case 32:return 5}},t.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/],t.conditions={mu:{rules:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[3],inclusive:!1},INITIAL:{rules:[0,1,32],inclusive:!0}},t}();return i.lexer=n,e.prototype=i,i.Parser=e,new e}();return t=e}(),h=function(t,e){"use strict";function i(t){return t.constructor===s.ProgramNode?t:(r.yy=s,r.parse(t))}var n={},r=t,s=e;return n.parser=r,n.parse=i,n}(a,o),c=function(t){"use strict";function e(){}function i(t,e,i){if(null==t||"string"!=typeof t&&t.constructor!==i.AST.ProgramNode)throw new s("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+t);e=e||{},"data"in e||(e.data=!0);var n=i.parse(t),r=(new i.Compiler).compile(n,e);return(new i.JavaScriptCompiler).compile(r,e)}function n(t,e,i){function n(){var n=i.parse(t),r=(new i.Compiler).compile(n,e),s=(new i.JavaScriptCompiler).compile(r,e,void 0,!0);return i.template(s)}if(null==t||"string"!=typeof t&&t.constructor!==i.AST.ProgramNode)throw new s("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+t);e=e||{},"data"in e||(e.data=!0);var r;return function(t,e){return r||(r=n()),r.call(this,t,e)}}var r={},s=t;return r.Compiler=e,e.prototype={compiler:e,disassemble:function(){for(var t,e,i,n=this.opcodes,r=[],s=0,o=n.length;o>s;s++)if(t=n[s],"DECLARE"===t.opcode)r.push("DECLARE "+t.name+"="+t.value);else{e=[];for(var a=0;a<t.args.length;a++)i=t.args[a],"string"==typeof i&&(i='"'+i.replace("\n","\\n")+'"'),e.push(i);r.push(t.opcode+" "+e.join(" "))}return r.join("\n")},equals:function(t){var e=this.opcodes.length;if(t.opcodes.length!==e)return!1;for(var i=0;e>i;i++){var n=this.opcodes[i],r=t.opcodes[i];if(n.opcode!==r.opcode||n.args.length!==r.args.length)return!1;for(var s=0;s<n.args.length;s++)if(n.args[s]!==r.args[s])return!1}if(e=this.children.length,t.children.length!==e)return!1;for(i=0;e>i;i++)if(!this.children[i].equals(t.children[i]))return!1;return!0},guid:0,compile:function(t,e){this.opcodes=[],this.children=[],this.depths={list:[]},this.options=e;var i=this.options.knownHelpers;if(this.options.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0},i)for(var n in i)this.options.knownHelpers[n]=i[n];return this.accept(t)},accept:function(t){var e,i=t.strip||{};return i.left&&this.opcode("strip"),e=this[t.type](t),i.right&&this.opcode("strip"),e},program:function(t){for(var e=t.statements,i=0,n=e.length;n>i;i++)this.accept(e[i]);return this.isSimple=1===n,this.depths.list=this.depths.list.sort(function(t,e){return t-e}),this},compileProgram:function(t){var e,i=(new this.compiler).compile(t,this.options),n=this.guid++;this.usePartial=this.usePartial||i.usePartial,this.children[n]=i;for(var r=0,s=i.depths.list.length;s>r;r++)e=i.depths.list[r],2>e||this.addDepth(e-1);return n},block:function(t){var e=t.mustache,i=t.program,n=t.inverse;i&&(i=this.compileProgram(i)),n&&(n=this.compileProgram(n));var r=e.sexpr,s=this.classifySexpr(r);"helper"===s?this.helperSexpr(r,i,n):"simple"===s?(this.simpleSexpr(r),this.opcode("pushProgram",i),this.opcode("pushProgram",n),this.opcode("emptyHash"),this.opcode("blockValue")):(this.ambiguousSexpr(r,i,n),this.opcode("pushProgram",i),this.opcode("pushProgram",n),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},hash:function(t){var e,i,n=t.pairs;this.opcode("pushHash");for(var r=0,s=n.length;s>r;r++)e=n[r],i=e[1],this.options.stringParams?(i.depth&&this.addDepth(i.depth),this.opcode("getContext",i.depth||0),this.opcode("pushStringParam",i.stringModeValue,i.type),"sexpr"===i.type&&this.sexpr(i)):this.accept(i),this.opcode("assignToHash",e[0]);this.opcode("popHash")},partial:function(t){var e=t.partialName;this.usePartial=!0,t.context?this.ID(t.context):this.opcode("push","depth0"),this.opcode("invokePartial",e.name),this.opcode("append")},content:function(t){this.opcode("appendContent",t.string)},mustache:function(t){this.sexpr(t.sexpr),this.opcode(t.escaped&&!this.options.noEscape?"appendEscaped":"append")},ambiguousSexpr:function(t,e,i){var n=t.id,r=n.parts[0],s=null!=e||null!=i;this.opcode("getContext",n.depth),this.opcode("pushProgram",e),this.opcode("pushProgram",i),this.opcode("invokeAmbiguous",r,s)},simpleSexpr:function(t){var e=t.id;"DATA"===e.type?this.DATA(e):e.parts.length?this.ID(e):(this.addDepth(e.depth),this.opcode("getContext",e.depth),this.opcode("pushContext")),this.opcode("resolvePossibleLambda")},helperSexpr:function(t,e,i){var n=this.setupFullMustacheParams(t,e,i),r=t.id.parts[0];if(this.options.knownHelpers[r])this.opcode("invokeKnownHelper",n.length,r);else{if(this.options.knownHelpersOnly)throw new s("You specified knownHelpersOnly, but used the unknown helper "+r,t);this.opcode("invokeHelper",n.length,r,t.isRoot)}},sexpr:function(t){var e=this.classifySexpr(t);"simple"===e?this.simpleSexpr(t):"helper"===e?this.helperSexpr(t):this.ambiguousSexpr(t)},ID:function(t){this.addDepth(t.depth),this.opcode("getContext",t.depth);var e=t.parts[0];e?this.opcode("lookupOnContext",t.parts[0]):this.opcode("pushContext");for(var i=1,n=t.parts.length;n>i;i++)this.opcode("lookup",t.parts[i])},DATA:function(t){if(this.options.data=!0,t.id.isScoped||t.id.depth)throw new s("Scoped data references are not supported: "+t.original,t);this.opcode("lookupData");for(var e=t.id.parts,i=0,n=e.length;n>i;i++)this.opcode("lookup",e[i])},STRING:function(t){this.opcode("pushString",t.string)},INTEGER:function(t){this.opcode("pushLiteral",t.integer)},BOOLEAN:function(t){this.opcode("pushLiteral",t.bool)},comment:function(){},opcode:function(t){this.opcodes.push({opcode:t,args:[].slice.call(arguments,1)})},declare:function(t,e){this.opcodes.push({opcode:"DECLARE",name:t,value:e})},addDepth:function(t){0!==t&&(this.depths[t]||(this.depths[t]=!0,this.depths.list.push(t)))},classifySexpr:function(t){var e=t.isHelper,i=t.eligibleHelper,n=this.options;if(i&&!e){var r=t.id.parts[0];n.knownHelpers[r]?e=!0:n.knownHelpersOnly&&(i=!1)}return e?"helper":i?"ambiguous":"simple"},pushParams:function(t){for(var e,i=t.length;i--;)e=t[i],this.options.stringParams?(e.depth&&this.addDepth(e.depth),this.opcode("getContext",e.depth||0),this.opcode("pushStringParam",e.stringModeValue,e.type),"sexpr"===e.type&&this.sexpr(e)):this[e.type](e)},setupFullMustacheParams:function(t,e,i){var n=t.params;return this.pushParams(n),this.opcode("pushProgram",e),this.opcode("pushProgram",i),t.hash?this.hash(t.hash):this.opcode("emptyHash"),n}},r.precompile=i,r.compile=n,r}(i),p=function(t,e){"use strict";function i(t){this.value=t}function n(){}var r,s=t.COMPILER_REVISION,o=t.REVISION_CHANGES,a=t.log,h=e;n.prototype={nameLookup:function(t,e){var i,r;return 0===t.indexOf("depth")&&(i=!0),r=/^[0-9]+$/.test(e)?t+"["+e+"]":n.isValidJavaScriptVariableName(e)?t+"."+e:t+"['"+e+"']",i?"("+t+" && "+r+")":r},compilerInfo:function(){var t=s,e=o[t];return"this.compilerInfo = ["+t+",'"+e+"'];\n"},appendToBuffer:function(t){return this.environment.isSimple?"return "+t+";":{appendToBuffer:!0,content:t,toString:function(){return"buffer += "+t+";"}}},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(t,e,i,n){this.environment=t,this.options=e||{},a("debug",this.environment.disassemble()+"\n\n"),this.name=this.environment.name,this.isChild=!!i,this.context=i||{programs:[],environments:[],aliases:{}},this.preamble(),this.stackSlot=0,this.stackVars=[],this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.compileChildren(t,e);
var r,s=t.opcodes;this.i=0;for(var o=s.length;this.i<o;this.i++)r=s[this.i],"DECLARE"===r.opcode?this[r.name]=r.value:this[r.opcode].apply(this,r.args),r.opcode!==this.stripNext&&(this.stripNext=!1);if(this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new h("Compile completed with content left on stack");return this.createFunctionContext(n)},preamble:function(){var t=[];if(this.isChild)t.push("");else{var e=this.namespace,i="helpers = this.merge(helpers, "+e+".helpers);";this.environment.usePartial&&(i=i+" partials = this.merge(partials, "+e+".partials);"),this.options.data&&(i+=" data = data || {};"),t.push(i)}t.push(this.environment.isSimple?"":", buffer = "+this.initializeBuffer()),this.lastContext=0,this.source=t},createFunctionContext:function(t){var e=this.stackVars.concat(this.registers.list);if(e.length>0&&(this.source[1]=this.source[1]+", "+e.join(", ")),!this.isChild)for(var i in this.context.aliases)this.context.aliases.hasOwnProperty(i)&&(this.source[1]=this.source[1]+", "+i+"="+this.context.aliases[i]);this.source[1]&&(this.source[1]="var "+this.source[1].substring(2)+";"),this.isChild||(this.source[1]+="\n"+this.context.programs.join("\n")+"\n"),this.environment.isSimple||this.pushSource("return buffer;");for(var n=this.isChild?["depth0","data"]:["Handlebars","depth0","helpers","partials","data"],r=0,s=this.environment.depths.list.length;s>r;r++)n.push("depth"+this.environment.depths.list[r]);var o=this.mergeSource();if(this.isChild||(o=this.compilerInfo()+o),t)return n.push(o),Function.apply(this,n);var h="function "+(this.name||"")+"("+n.join(",")+") {\n  "+o+"}";return a("debug",h+"\n\n"),h},mergeSource:function(){for(var t,e="",i=0,n=this.source.length;n>i;i++){var r=this.source[i];r.appendToBuffer?t=t?t+"\n    + "+r.content:r.content:(t&&(e+="buffer += "+t+";\n  ",t=void 0),e+=r+"\n  ")}return e},blockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var t=["depth0"];this.setupParams(0,t),this.replaceStack(function(e){return t.splice(1,0,e),"blockHelperMissing.call("+t.join(", ")+")"})},ambiguousBlockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var t=["depth0"];this.setupParams(0,t);var e=this.topStack();t.splice(1,0,e),this.pushSource("if (!"+this.lastHelper+") { "+e+" = blockHelperMissing.call("+t.join(", ")+"); }")},appendContent:function(t){this.pendingContent&&(t=this.pendingContent+t),this.stripNext&&(t=t.replace(/^\s+/,"")),this.pendingContent=t},strip:function(){this.pendingContent&&(this.pendingContent=this.pendingContent.replace(/\s+$/,"")),this.stripNext="strip"},append:function(){this.flushInline();var t=this.popStack();this.pushSource("if("+t+" || "+t+" === 0) { "+this.appendToBuffer(t)+" }"),this.environment.isSimple&&this.pushSource("else { "+this.appendToBuffer("''")+" }")},appendEscaped:function(){this.context.aliases.escapeExpression="this.escapeExpression",this.pushSource(this.appendToBuffer("escapeExpression("+this.popStack()+")"))},getContext:function(t){this.lastContext!==t&&(this.lastContext=t)},lookupOnContext:function(t){this.push(this.nameLookup("depth"+this.lastContext,t,"context"))},pushContext:function(){this.pushStackLiteral("depth"+this.lastContext)},resolvePossibleLambda:function(){this.context.aliases.functionType='"function"',this.replaceStack(function(t){return"typeof "+t+" === functionType ? "+t+".apply(depth0) : "+t})},lookup:function(t){this.replaceStack(function(e){return e+" == null || "+e+" === false ? "+e+" : "+this.nameLookup(e,t,"context")})},lookupData:function(){this.pushStackLiteral("data")},pushStringParam:function(t,e){this.pushStackLiteral("depth"+this.lastContext),this.pushString(e),"sexpr"!==e&&("string"==typeof t?this.pushString(t):this.pushStackLiteral(t))},emptyHash:function(){this.pushStackLiteral("{}"),this.options.stringParams&&(this.push("{}"),this.push("{}"))},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:[],types:[],contexts:[]}},popHash:function(){var t=this.hash;this.hash=this.hashes.pop(),this.options.stringParams&&(this.push("{"+t.contexts.join(",")+"}"),this.push("{"+t.types.join(",")+"}")),this.push("{\n    "+t.values.join(",\n    ")+"\n  }")},pushString:function(t){this.pushStackLiteral(this.quotedString(t))},push:function(t){return this.inlineStack.push(t),t},pushLiteral:function(t){this.pushStackLiteral(t)},pushProgram:function(t){this.pushStackLiteral(null!=t?this.programExpression(t):null)},invokeHelper:function(t,e,i){this.context.aliases.helperMissing="helpers.helperMissing",this.useRegister("helper");var n=this.lastHelper=this.setupHelper(t,e,!0),r=this.nameLookup("depth"+this.lastContext,e,"context"),s="helper = "+n.name+" || "+r;n.paramsInit&&(s+=","+n.paramsInit),this.push("("+s+",helper ? helper.call("+n.callParams+") : helperMissing.call("+n.helperMissingParams+"))"),i||this.flushInline()},invokeKnownHelper:function(t,e){var i=this.setupHelper(t,e);this.push(i.name+".call("+i.callParams+")")},invokeAmbiguous:function(t,e){this.context.aliases.functionType='"function"',this.useRegister("helper"),this.emptyHash();var i=this.setupHelper(0,t,e),n=this.lastHelper=this.nameLookup("helpers",t,"helper"),r=this.nameLookup("depth"+this.lastContext,t,"context"),s=this.nextStack();i.paramsInit&&this.pushSource(i.paramsInit),this.pushSource("if (helper = "+n+") { "+s+" = helper.call("+i.callParams+"); }"),this.pushSource("else { helper = "+r+"; "+s+" = typeof helper === functionType ? helper.call("+i.callParams+") : helper; }")},invokePartial:function(t){var e=[this.nameLookup("partials",t,"partial"),"'"+t+"'",this.popStack(),"helpers","partials"];this.options.data&&e.push("data"),this.context.aliases.self="this",this.push("self.invokePartial("+e.join(", ")+")")},assignToHash:function(t){var e,i,n=this.popStack();this.options.stringParams&&(i=this.popStack(),e=this.popStack());var r=this.hash;e&&r.contexts.push("'"+t+"': "+e),i&&r.types.push("'"+t+"': "+i),r.values.push("'"+t+"': ("+n+")")},compiler:n,compileChildren:function(t,e){for(var i,n,r=t.children,s=0,o=r.length;o>s;s++){i=r[s],n=new this.compiler;var a=this.matchExistingProgram(i);null==a?(this.context.programs.push(""),a=this.context.programs.length,i.index=a,i.name="program"+a,this.context.programs[a]=n.compile(i,e,this.context),this.context.environments[a]=i):(i.index=a,i.name="program"+a)}},matchExistingProgram:function(t){for(var e=0,i=this.context.environments.length;i>e;e++){var n=this.context.environments[e];if(n&&n.equals(t))return e}},programExpression:function(t){if(this.context.aliases.self="this",null==t)return"self.noop";for(var e,i=this.environment.children[t],n=i.depths.list,r=[i.index,i.name,"data"],s=0,o=n.length;o>s;s++)e=n[s],r.push(1===e?"depth0":"depth"+(e-1));return(0===n.length?"self.program(":"self.programWithDepth(")+r.join(", ")+")"},register:function(t,e){this.useRegister(t),this.pushSource(t+" = "+e+";")},useRegister:function(t){this.registers[t]||(this.registers[t]=!0,this.registers.list.push(t))},pushStackLiteral:function(t){return this.push(new i(t))},pushSource:function(t){this.pendingContent&&(this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))),this.pendingContent=void 0),t&&this.source.push(t)},pushStack:function(t){this.flushInline();var e=this.incrStack();return t&&this.pushSource(e+" = "+t+";"),this.compileStack.push(e),e},replaceStack:function(t){var e,n,r,s="",o=this.isInline();if(o){var a=this.popStack(!0);if(a instanceof i)e=a.value,r=!0;else{n=!this.stackSlot;var h=n?this.incrStack():this.topStackName();s="("+this.push(h)+" = "+a+"),",e=this.topStack()}}else e=this.topStack();var c=t.call(this,e);return o?(r||this.popStack(),n&&this.stackSlot--,this.push("("+s+c+")")):(/^stack/.test(e)||(e=this.nextStack()),this.pushSource(e+" = ("+s+c+");")),e},nextStack:function(){return this.pushStack()},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var t=this.inlineStack;if(t.length){this.inlineStack=[];for(var e=0,n=t.length;n>e;e++){var r=t[e];r instanceof i?this.compileStack.push(r):this.pushStack(r)}}},isInline:function(){return this.inlineStack.length},popStack:function(t){var e=this.isInline(),n=(e?this.inlineStack:this.compileStack).pop();if(!t&&n instanceof i)return n.value;if(!e){if(!this.stackSlot)throw new h("Invalid stack pop");this.stackSlot--}return n},topStack:function(t){var e=this.isInline()?this.inlineStack:this.compileStack,n=e[e.length-1];return!t&&n instanceof i?n.value:n},quotedString:function(t){return'"'+t.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},setupHelper:function(t,e,i){var n=[],r=this.setupParams(t,n,i),s=this.nameLookup("helpers",e,"helper");return{params:n,paramsInit:r,name:s,callParams:["depth0"].concat(n).join(", "),helperMissingParams:i&&["depth0",this.quotedString(e)].concat(n).join(", ")}},setupOptions:function(t,e){var i,n,r,s=[],o=[],a=[];s.push("hash:"+this.popStack()),this.options.stringParams&&(s.push("hashTypes:"+this.popStack()),s.push("hashContexts:"+this.popStack())),n=this.popStack(),r=this.popStack(),(r||n)&&(r||(this.context.aliases.self="this",r="self.noop"),n||(this.context.aliases.self="this",n="self.noop"),s.push("inverse:"+n),s.push("fn:"+r));for(var h=0;t>h;h++)i=this.popStack(),e.push(i),this.options.stringParams&&(a.push(this.popStack()),o.push(this.popStack()));return this.options.stringParams&&(s.push("contexts:["+o.join(",")+"]"),s.push("types:["+a.join(",")+"]")),this.options.data&&s.push("data:data"),s},setupParams:function(t,e,i){var n="{"+this.setupOptions(t,e).join(",")+"}";return i?(this.useRegister("options"),e.push("options"),"options="+n):(e.push(n),"")}};for(var c="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),p=n.RESERVED_WORDS={},l=0,u=c.length;u>l;l++)p[c[l]]=!0;return n.isValidJavaScriptVariableName=function(t){return!n.RESERVED_WORDS[t]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(t)?!0:!1},r=n}(n,i),l=function(t,e,i,n,r){"use strict";var s,o=t,a=e,h=i.parser,c=i.parse,p=n.Compiler,l=n.compile,u=n.precompile,f=r,d=o.create,m=function(){var t=d();return t.compile=function(e,i){return l(e,i,t)},t.precompile=function(e,i){return u(e,i,t)},t.AST=a,t.Compiler=p,t.JavaScriptCompiler=f,t.Parser=h,t.parse=c,t};return o=m(),o.create=m,s=o}(s,o,h,c,p);return l}();return t});

/* filePath fetchtemp/scripts/liveShare_89b0a7ef_ef38efba.js*/

/* filePath fetchtemp/scripts/liveShare_template_1be776c9.js*/

define("liveShare#1.0.15/template" , ["artTemplate#3.0.3"] , function(artTemplate){
   artTemplate = new artTemplate();
   var _template = {};
   var shareLayout = [];
   shareLayout.push('<div class=\"mod-share__1015 {{cls}}\"><p>')
   shareLayout.push('  {{each types}}')
   shareLayout.push('    <a class=\"w-icon-{{$index}}\" data-sharetarget=\"{{$index}}\" href=\"#\"></a>')
   shareLayout.push('  {{/each }}')
   shareLayout.push('</p></div>')

   _template.shareLayout = artTemplate("shareLayout" , shareLayout.join(''));

   var tip = [];
   tip.push('<div class=\"mod-tips__1015 {{cls}}\">')
   tip.push('  <div class=\"mod-tips-inner\"></div>')
   tip.push('  <span class=\"w-arr {{directClass}}\"></span>')
   tip.push('</div>')

   _template.tip = artTemplate("tip" , tip.join(''));

   var weixin = [];
   weixin.push('<div class=\"mod-weixin__1015\">')
   weixin.push('  <iframe frameborder=\"0\" scrolling=\"no\" src=\"about:blank\"></iframe>')
   weixin.push('  <span class=\"weixin-code js_weixin_box\">')
   weixin.push('    <span class=\"arr\"></span>')
   weixin.push('  </span>')
   weixin.push('</div>')

   _template.weixin = artTemplate("weixin" , weixin.join(''));

   _template.helper = function(name, helper){
      artTemplate.helper(name, helper);
   }
   return _template;
});
/* filePath fetchtemp/scripts/utils_a21035aa.js*/

define("liveShare#1.0.15/utils" , [], function () {
  'use strict';

  var getUrlParams = function (url) {
    var aTemp = url.split('#');
    var aTemp1 = aTemp[0].split('?');
    var result = {
      link: aTemp1[0]
    };
    var search = aTemp1[1] || '';
    var hash = aTemp[1] || '';
    result.hash = traversalParams(hash);
    result.search = traversalParams(search);
    return result;
  };

  var traversalParams = function (value) {
    var result = {};

    if (value === '') {
      return result;
    }

    var values = value.split('&');
    var item;
    var key;
    var s;

    for (var i = 0, iLen = values.length; i < iLen; i++) {
      item = values[i].split('=');
      key = decodeURIComponent(item[0]);
      s =  decodeURIComponent(item[1]) || '';

      // 判断当前结果是否为数组
      if (typeof result[key] === 'undefined') {
        result[key] = [s];
      } else {
        result[key].push(s);
      }

    }

    return result;
  };

  var changeUrlParams = function (url, key, newValue) {
    var params = getUrlParams(url);
    var oldValue;
    var i, iLen;

    if (typeof params.hash[key] !== 'undefined') {

      for (i = 0, iLen = params.hash[key].length; i < iLen; i++) {
        oldValue = params.hash[key][i];
        url = url.replace(encodeURIComponent(key) + '=' + encodeURIComponent(oldValue),
            encodeURIComponent(key) + '=' + encodeURIComponent(newValue));
      }
    }

    if (typeof params.search[key] !== 'undefined') {

      for (i = 0, iLen = params.search[key].length; i < iLen; i++) {
        oldValue = params.search[key][i];
        url = url.replace(encodeURIComponent(key) + '=' + encodeURIComponent(oldValue),
            encodeURIComponent(key) + '=' + encodeURIComponent(newValue));
      }
    }

    return url;
  };

  var addUrlParams = function (url, key, value, type) {
    type = type || 'search';
    var aTemp = url.split('#');
    var aTemp1 = aTemp[0].split('?');
    var link = aTemp1[0];
    var hash = aTemp[1] || '';
    var search = aTemp1[1] || '';

    if (type === 'search') {
      search = search + (search === '' ? '' : '&') + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    if (type === 'hash') {
      hash = hash + (hash === '' ? '' : '&') + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    return link + (search === '' ? '' : '?') + search + (hash === '' ? '' : '#') + hash;
  };

  var setUrlParams = function (url, key, value, type) {

    if (url.indexOf(key + '=') > -1) {
      url = changeUrlParams(url, key, value);
    } else {
      url = addUrlParams(url, key, value, type);
    }

    return url;
  };

  return {
    getUrlParams: getUrlParams,
    changeUrlParams: changeUrlParams,
    addUrlParams: addUrlParams,
    setUrlParams: setUrlParams
  };


});
/* filePath fetchtemp/scripts/tip_b76f5cf3.js*/

define("liveShare#1.0.15/tip" , ['F_glue',
   'F_WidgetBase',
   "liveShare#1.0.15/template",
   'jquery#1.8.1'], function (glue, WidgetBase, template, $) {

  'use strict';

  var win = window;
  var doc = document;

  var Tip = WidgetBase.extend({

    type: 'liveShare/tip',

    createModel: function () {
      this.isHide = true;
      this.content = '';
      this.targetElm = null;
      this.cls = '';
      this.direct = 'top';
      // 分为5种样式，向上，向下，向左，向右，无箭头
      this.directClass = {top: 'w-arr-top', left: 'w-arr-left',
          right: 'w-arr-right', bottom: 'w-arr-bottom', none: ''};
    },

    // create: function (content, targetElm, cls, direct) {
    //   Tip.superclass.create.call(this, null, {});
    //   this.isHide = true;
    //   this.content = content || '';
    //   this.targetElm = targetElm || null;
    //   this.cls = cls || '';
    //   this.direct = direct || 'top';
    //   // 分为5种样式，向上，向下，向左，向右，无箭头
    //   this.directClass = {top: 'w-arr-top', left: 'w-arr-left',
    //       right: 'w-arr-right', bottom: 'w-arr-bottom', none: ''};
    // },

    resolveTemplate: function () {
      this.layout = $(template.tip({cls: this.cls, directClass: this.directClass[this.direct]}));
      // this.layout = $('<div class="mod-tips ' + this.cls + '">' +
      //   '<div class="mod-tips-inner"></div>' +
      //   '<span class="w-arr ' + this.directClass[this.direct] + '"></span>' +
      // '</div>');

      this.contentBox = this.layout.find('.mod-tips-inner');
      this.contentBox.html(this.content);
      this.arrow = this.layout.find('.w-arr');
      this.layout.hide();
    },

    renderer: function () {
      $('body').append(this.layout);
      // this.changePosition(this.changePositionByTargetElm());
    },

    bindDataEvent: function () {
      $(win).on('resize', $.proxy(this.hide, this));
    },

    show: function (targetElm, direct) {

      if (typeof targetElm === 'string') {
        direct = targetElm;
      }

      if (typeof targetElm === 'object') {
        this.changeTargetElm(targetElm);
      }

      if (typeof direct === 'string') {
        this.changeDirect(direct);
      }

      if (typeof targetElm === 'number') {
        this.changePosition({x: targetElm, y: direct});
      } else {
        this.changePosition(this.changePositionByTargetElm());
      }

      this.isHide = false;
      this.layout.show();
    },

    hide: function () {
      this.isHide = true;
      this.layout.hide();
    },

    changeTargetElm: function (newTargetElm) {
      this.targetElm = newTargetElm;
    },

    changeContent: function (newContent) {
      this.contentBox.html(newContent);
      this.content = newContent;
    },

    changeDirect: function (newDirect) {
      this.arrow.removeClass(this.directClass[this.direct]);
      this.arrow.addClass(this.directClass[newDirect]);
      this.direct = newDirect;
    },

    changePosition: function (opt) {

      var direct = this.direct;
      var x = opt.x;
      var y = opt.y;

      if (this.isHide) {
        this.layout.css('visibility', 'hide');
        this.layout.css('display', '');
      }
      var tipWidth = this.layout.outerWidth();
      var tipHeight = this.layout.outerHeight();
      var arrWidth = this.arrow.outerWidth();
      var arrHeight = this.arrow.outerHeight();
      if (this.isHide) {
        this.layout.css('visibility', '');
        this.layout.css('display', 'none');
      }

      switch (direct) {
      case 'top':
        x = x - tipWidth / 2;
        y = y - tipHeight - arrHeight;
        break;
      case 'left':
        x = x - tipWidth - arrWidth;
        y = y - tipHeight / 2;
        break;
      case 'right':
        x = x + arrWidth;
        y = y - tipHeight / 2;
        break;
      case 'bottom':
        x = x - tipWidth / 2;
        y = y + arrHeight;
        break;
      }

      this.layout.css({
        top: y + 'px',
        left: x + 'px'
      });
    },

    changePositionByTargetElm: function () {

      if (this.targetElm === null) {
        return {x: null, y: null};
      }

      var x, y;
      var targetElm = this.targetElm;
      var direct = this.direct;
      var offset = $(targetElm).offset();
      var left = offset.left;
      var top = offset.top;
      var width = $(targetElm).outerWidth();
      var height = $(targetElm).outerHeight();

      switch (direct) {
      case 'top':
        x = left + width / 2;
        y = top;
        break;
      case 'left':
        x = left;
        y = top + height / 2;
        break;
      case 'right':
        x = left + width;
        y = top + height / 2;
        break;
      case 'bottom':
        x = left + width / 2;
        y = top + height;
        break;
      }

      return {x: x, y: y};
    }

  });

  return Tip;
});

/* filePath fetchtemp/scripts/weixin_1ae3dda7.js*/

define("liveShare#1.0.15/weixin" , [
   'F_glue',
   'F_WidgetBase',
   "liveShare#1.0.15/template",
   "liveShare#1.0.15/utils",
   'jquery#1.8.1'], function (glue, WidgetBase, template, utils, $) {

  'use strict';

  var win = window;
  var doc = document;
  var url = 'http://qrcode.ifeng.com/qrcode.php';

  var Weixin = WidgetBase.extend({
    type: 'liveShare/weixin',

    createModel: function () {
      this.getQRCode();
      this.isHide = true;
    },

    // create: function (container) {
    //   Weixin.superclass.create.call(this, null, {});
    //   this.container = $(container);
    //   this.getQRCode();
    //   this.isHide = true;
    // },
    resolveTemplate: function () {
      this.container = $(this.container);

      this.layout = $(template.weixin());
      // this.layout = $('<div class="mod-weixin">' +
      //     '<iframe frameborder="0" scrolling="no" src="about:blank"></iframe>' +
      //     '<span class="weixin-code js_weixin_box">' +
      //       '<span class="arr"></span>' +
      //     '</span>' +
      //   '</div>');
      // this.closeHandle = this.layout.find('.js_weixin_close');
      this.box = this.layout.find('.js_weixin_box');
      this.inner = this.layout;
      this.iframe = this.layout.find('iframe');
    },
    bindDomEvent: function () {
      this.layout.on('click', $.proxy(this.hide, this));
      // this.closeHandle.on('click', $.proxy(this.hide, this));
    },
    renderer: function () {
      this.container.prepend(this.layout);
    },
    getQRCode: function () {
      $.ajax({
        url: url,
        dataType: 'jsonp',
        data: {
          url: utils.setUrlParams(win.location.href, '_share', 'weixin', 'search')
        },
        context: this,
        success: this.setQRCode
      });
    },
    setQRCode: function (data) {
      if (data.qrcode_url) {
        this.box.prepend('<img src="' + data.qrcode_url + '" >');
      }
    },
    show: function () {
      if (this.isHide) {
        this.isHide = false;
        this.iframe.animate({
          height: '100px'
        }, 400);
        this.inner.animate({
          height: '114px'
        }, 400).animate({
          height: '111px'
        }, 100).animate({
          height: '112px'
        }, 100);
      }
    },
    hide: function () {
      if (!this.isHide) {
        this.isHide = true;
        this.iframe.animate({
          height: '0px'
        }, 400);
        this.inner.animate({
          height: '0px'
        }, 400);
        return false;
      }
    }
  });


  return Weixin;
});


/* filePath fetchtemp/scripts/statistic_cb9a0864.js*/

define("liveShare#1.0.15/statistic" , ["liveShare#1.0.15/utils",
   'jquery#1.8.1'], function (utils, $) {

  'use strict';

  var win = window;
  var url = 'http://stadig.ifeng.com/actsta.js';

  // 发送分享的统计信息
  var statistic = {
    send: function (type) {
      var params = this.getInfo(type);
      $.ajax({
        url: url,
        data: params,
        dataType: 'script'
      });
    },

    getInfo: function (type) {
      var info = {};
      var uri = window.location.href;
      var key = '_share';
      info.datatype = 'share';
      info.value = type;

      $('script').each(function () {
        var src = this.src;
        var params;
        if (src.indexOf('http://stadig.ifeng.com/page.js') > -1) {
          params = utils.getUrlParams(src);
          info.ref = params.search.ref ? params.search.ref[0] : '';
          info.uid = params.search.uid ? params.search.uid[0] : '';
          info.sid = params.search.sid ? params.search.sid[0] : '';
          return false;
        }
      });

      // if (uri.indexOf(key + '=') > -1) {
      //   uri = utils.changeUrlParams(uri, key, type);
      // } else {
      //   uri = utils.addUrlParams(uri, key, type, 'hash');
      // }

      uri = utils.setUrlParams(uri, key, type, 'hash');

      info.uri = uri;
      info.time = new Date().getTime();

      //获取第三方参数，如果页面上定义了这些全局函数的话，则直接调用获取数据。
      if (typeof win.getChannelInfo === 'function') {
        info.ci = win.getChannelInfo();
      }

      if (typeof win.getStaPara === 'function') {
        info.pt = win.getStaPara();
      }

      return info;
    }
  };

  return statistic;
});


/* filePath fetchtemp/scripts/liveShare_94ffaa15.js*/

define("liveShare#1.0.15" , ['F_glue',
   'F_WidgetBase',
   "liveShare#1.0.15/template",
   "liveShare#1.0.15/tip",
   "liveShare#1.0.15/weixin",
   "liveShare#1.0.15/utils",
   "liveShare#1.0.15/statistic",
   'jquery#1.8.1'], function (glue, WidgetBase, template, Tip, Weixin, utils, statistic, $) {

  'use strict';

  var win = window;
  var doc = document;

  var index = 0;
  var getUuid = function () {
    return 'liveShare_' + index++;
  };

  var defaultTyps = {
    sina: {
      appkey: '115994778',
      ralateUid: '1900552512',
      searchPic: false,
      source: 'ifeng',
      rcontent: ''
    },
    qq: {
      appkey: '801cf76d3cfc44ada52ec13114e84a96',
      site: window.location.host
    },
    qqzone: {

    },
    weixin: {
    }
  };

  var defautContents = {
    title: '',
    content: '',
    pic: ''
  };

  var urls = {
    qq: 'http://v.t.qq.com/share/share.php',
    qqzone: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey',
    sina: 'http://v.t.sina.com.cn/share/share.php'
  };

  var Share = WidgetBase.extend({

    version: '1.0.15',

    type: 'liveShare',

    createModel: function () {
      this.cls = '';
      this.isHide = false;
      this.contents = defaultTyps;
      // this.container = null;
      this.types = ['qqzone', 'weixin', 'qq', 'sina'];
      this.uuid = getUuid();
    },

    /**
     * 分享组件构建
     * @param  {object} opts      配置可选项包括 types mode contents
     * --------------------------------------------------
     *   @param {domElement} container 放置分享按钮的容器。
     *   @param {object} types 分享到哪里的配置，内部结构是个数组['sina', 'qq', 'qqzone', 'weixin'];
     *   @param {string} mode 分享按钮渲染的形式，分inner（置入）pop（弹出）两种
     *   @param {oject} contents 分享内容，包括title, content, pic
     */
    // create: function (opts) {
    //   Share.superclass.create.call(this, null, {});
    //   opts = opts || {};
    //   this.cls = opts.cls || '';
    //   this.isHide = opts.isHide || false;
    //   this.initType(opts.types);
    //   this.contents = opts.contents || defautContents;
    //   if (typeof opts.container === 'undefined') {
    //     this.container = null;
    //   } else {
    //     this.container = $(opts.container);
    //   }

    //   this.uuid = getUuid();
    // },

    resolveTemplate: function () {

      // @todo 数据处理放在这里不太合适。
      this.initType(this.types);
      this.container = this.container ? $('#' + this.container) : null;
      this.layout = $(template.shareLayout({cls: this.cls, types: this.types}));
      // var links = [];

      // for (var name in this.types) {
      //   links.push('<a class="w-icon-' + name + '" data-sharetarget="' + name + '" href="#"></a>');
      // }

      // this.layout = $('<div class="mod-share ' + this.cls + '"><p>' + links.join('') + '</p></div>');
    },

    bindDomEvent: function () {
      var _this = this;
      this.layout.on('click', 'a', function () {
        var shareTarget = $(this).data('sharetarget');
        _this.shareTo(shareTarget);
        return false;
      });
    },


    renderer: function () {

      // 如果没有定义容器，则创建一个tip实例，将分享按钮放到tip内
      if (this.container === null) {
        this.tip = new Tip(this);
        this.tip.create(null, {content: this.layout, cls: (this.cls ? this.cls + '-tip' : '')});
      } else {

        if (this.isHide) {
          this.hide();
        }

        this.container.append(this.layout);
      }
    },

    initType: function (types) {

      if (typeof types === 'undefined') {
        this.types = defaultTyps;
        return;
      }

      this.types = {};

      for (var i = 0, iLen = types.length; i < iLen; i++) {
        this.initOneType(types[i]);
      }
    },

    initOneType: function (type) {

      if (typeof type === 'string' && typeof defaultTyps[type] !== 'undefined') {
        this.types[type] = defaultTyps[type];
        return;
      }

      if (typeof type === 'object' && typeof defaultTyps[type.name] !== 'undefined') {
        var name = type.name;
        delete type.name;
        this.types[name] = $.extend(defaultTyps[name], type);
      }
    },

    shareTo: function (type) {
      var params;
      var _this = this;
      statistic.send(type);

      if (type === 'weixin') {

        if (typeof this.weixin === 'undefined') {
          this.weixin = new Weixin(this);
          this.weixin.create(this.layout.find('.w-icon-weixin'));
        }

        setTimeout(function () {
          if (_this.weixin.isHide) {
            _this.weixin.show();
          } else {
            _this.weixin.hide();
          }
        }, 100);
      } else {
        params = this.encodeParams(this.getShareParams(type));
        this.createWindow(params, type);
      }
    },

    createWindow: function (params, type) {
      var url = urls[type] + '?' + params;
      var winWidth = 600,
          winHeight = 450;
      var winTop = (window.screen.availHeight - 30 - winHeight) / 2;
      var winLeft = (window.screen.availWidth - 10 - winWidth) / 2;
      var winParams = 'scrollbars=no,width=' + winWidth + ',height=' + winHeight +
          ',left=' + winLeft + ',top=' + winTop + ',status=no,resizable=yes';
      window.open(url, '_blank', winParams);
    },

    encodeParams: function (params) {
      var a = [];

      for (var key in params) {
        a.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }

      return a.join('&');
    },

    getShareParams: function (type) {

      // 获取一个当天的时间戳
      var date = new Date();
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      var contentParams = this.getContextParams(type);
      var commonParams = this.types[type];
      var params = $.extend({}, contentParams, commonParams);
      params.url = utils.setUrlParams(win.location.href, '_share', type, 'search');
      params.url = utils.setUrlParams(params.url, 'tp', date.getTime(), 'search');

      return params;
    },

    getContextParams: function (type) {
      var params = {};
      var title = this.contents.title ? '【' + this.contents.title + '】' : '';
      var content = this.contents.content;
      var pic = this.contents.pic;

      switch (type) {
      case 'sina':
        params.title =  title + content;
        params.pic = pic;
        break;
      case 'qq':
        params.title = title + content;
        params.pic = pic;
        break;
      case 'qqzone':
        params.title = title;
        params.summary = content;
        params.pics = pic;
        break;
      default:
      }

      return params;
    },

    changeContent: function (contents) {
      this.contents = {};
      $.extend(this.contents, defautContents, contents);
    },

    show: function (targetElm, direct) {

      if (typeof this.tip !== 'undefined') {
        this.tip.show(targetElm, direct);
      } else {
        this.layout.show();
      }

      this.isHide = false;
    },

    hide: function () {

      if (typeof this.tip !== 'undefined') {
        this.tip.hide();
      } else {
        this.layout.hide();
        this.showState = 'hide';
      }

      this.isHide = true;
    }

  });

  return Share;

});
/* filePath fetchtemp/scripts/liveaudio_main_c8dd7913_44b7776f.js*/

/* filePath fetchtemp/scripts/soundmanager2_bcbee091.js*/

/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20150601
 */

/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio, opera, module, define */
/*jslint regexp: true, sloppy: true, white: true, nomen: true, plusplus: true, todo: true */

/**
 * About this file
 * -------------------------------------------------------------------------------------
 * This is the fully-commented source version of the SoundManager 2 API,
 * recommended for use during development and testing.
 *
 * See soundmanager2-nodebug-jsmin.js for an optimized build (~11KB with gzip.)
 * http://schillmania.com/projects/soundmanager2/doc/getstarted/#basic-inclusion
 * Alternately, serve this file with gzip for 75% compression savings (~30KB over HTTP.)
 *
 * You may notice <d> and </d> comments in this source; these are delimiters for
 * debug blocks which are removed in the -nodebug builds, further optimizing code size.
 *
 * Also, as you may note: Whoa, reliable cross-platform/device audio support is hard! ;)
 */

(function(window, _undefined) {

"use strict";

if (!window || !window.document) {

  // Don't cross the [environment] streams. SM2 expects to be running in a browser, not under node.js etc.
  // Additionally, if a browser somehow manages to fail this test, as Egon said: "It would be bad."

  throw new Error('SoundManager requires a browser with window and document objects.');

}

var soundManager = null;

/**
 * The SoundManager constructor.
 *
 * @constructor
 * @param {string} smURL Optional: Path to SWF files
 * @param {string} smID Optional: The ID to use for the SWF container element
 * @this {SoundManager}
 * @return {SoundManager} The new SoundManager instance
 */

function SoundManager(smURL, smID) {

  /**
   * soundManager configuration options list
   * defines top-level configuration properties to be applied to the soundManager instance (eg. soundManager.flashVersion)
   * to set these properties, use the setup() method - eg., soundManager.setup({url: '/swf/', flashVersion: 9})
   */

  this.setupOptions = {

    'url': (smURL || null),             // path (directory) where SoundManager 2 SWFs exist, eg., /path/to/swfs/
    'flashVersion': 8,                  // flash build to use (8 or 9.) Some API features require 9.
    'debugMode': false,                  // enable debugging output (console.log() with HTML fallback)
    'debugFlash': false,                // enable debugging output inside SWF, troubleshoot Flash/browser issues
    'useConsole': true,                 // use console.log() if available (otherwise, writes to #soundmanager-debug element)
    'consoleOnly': true,                // if console is being used, do not create/write to #soundmanager-debug
    'waitForWindowLoad': false,         // force SM2 to wait for window.onload() before trying to call soundManager.onload()
    'bgColor': '#ffffff',               // SWF background color. N/A when wmode = 'transparent'
    'useHighPerformance': false,        // position:fixed flash movie can help increase js/flash speed, minimize lag
    'flashPollingInterval': null,       // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
    'html5PollingInterval': null,       // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
    'flashLoadTimeout': 1000,           // msec to wait for flash movie to load before failing (0 = infinity)
    'wmode': null,                      // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
    'allowScriptAccess': 'always',      // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
    'useFlashBlock': false,             // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
    'useHTML5Audio': true,              // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (MP3/MP4 support varies.) Ideally, transparent vs. Flash API where possible.
    'forceUseGlobalHTML5Audio': false,  // if true, a single Audio() object is used for all sounds - and only one can play at a time.
    'ignoreMobileRestrictions': false,  // if true, SM2 will not apply global HTML5 audio rules to mobile UAs. iOS > 7 and WebViews may allow multiple Audio() instances.
    'html5Test': /^(probably|maybe)$/i, // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
    'preferFlash': false,               // overrides useHTML5audio, will use Flash for MP3/MP4/AAC if present. Potential option if HTML5 playback with these formats is quirky.
    'noSWFCache': false,                // if true, appends ?ts={date} to break aggressive SWF caching.
    'idPrefix': 'sound'                 // if an id is not provided to createSound(), this prefix is used for generated IDs - 'sound0', 'sound1' etc.

  };

  this.defaultOptions = {

    /**
     * the default configuration for sound objects made with createSound() and related methods
     * eg., volume, auto-load behaviour and so forth
     */

    'autoLoad': false,        // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
    'autoPlay': false,        // enable playing of file as soon as possible (much faster if "stream" is true)
    'from': null,             // position to start playback within a sound (msec), default = beginning
    'loops': 1,               // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
    'onid3': null,            // callback function for "ID3 data is added/available"
    'onload': null,           // callback function for "load finished"
    'whileloading': null,     // callback function for "download progress update" (X of Y bytes received)
    'onplay': null,           // callback for "play" start
    'onpause': null,          // callback for "pause"
    'onresume': null,         // callback for "resume" (pause toggle)
    'whileplaying': null,     // callback during play (position update)
    'onposition': null,       // object containing times and function callbacks for positions of interest
    'onstop': null,           // callback for "user stop"
    'onfailure': null,        // callback function for when playing fails
    'onfinish': null,         // callback function for "sound finished playing"
    'multiShot': true,        // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
    'multiShotEvents': false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
    'position': null,         // offset (milliseconds) to seek to within loaded sound data.
    'pan': 0,                 // "pan" settings, left-to-right, -100 to 100
    'stream': true,           // allows playing before entire file has loaded (recommended)
    'to': null,               // position to end playback within a sound (msec), default = end
    'type': null,             // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
    'usePolicyFile': false,   // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
    'volume': 100             // self-explanatory. 0-100, the latter being the max.

  };

  this.flash9Options = {

    /**
     * flash 9-only options,
     * merged into defaultOptions if flash 9 is being used
     */

    'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
    'usePeakData': false,     // enable left/right channel peak (level) data
    'useWaveformData': false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
    'useEQData': false,       // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
    'onbufferchange': null,   // callback for "isBuffering" property change
    'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

  };

  this.movieStarOptions = {

    /**
     * flash 9.0r115+ MPEG4 audio options,
     * merged into defaultOptions if flash 9+movieStar mode is enabled
     */

    'bufferTime': 3,          // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
    'serverURL': null,        // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
    'onconnect': null,        // rtmp: callback for connection to flash media server
    'duration': null          // rtmp: song duration (msec)

  };

  this.audioFormats = {

    /**
     * determines HTML5 support + flash requirements.
     * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
     * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
     */

    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
      'required': true
    },

    'mp4': {
      'related': ['aac','m4a','m4b'], // additional formats under the MP4 container
      'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
      'required': false
    },

    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },

    'opus': {
      'type': ['audio/ogg; codecs=opus', 'audio/opus'],
      'required': false
    },

    'wav': {
      'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
      'required': false
    }

  };

  // HTML attributes (id + class names) for the SWF container

  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');

  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;

  // dynamic attributes

  this.versionNumber = 'V2.97a.20150601';
  this.version = null;
  this.movieURL = null;
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.didFlashBlock = false;
  this.filePattern = null;

  this.filePatterns = {
    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i
  };

  // support indicators, set at init

  this.features = {
    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false
  };

  // flash sandbox info, used primarily in troubleshooting

  this.sandbox = {
    // <d>
    'type': null,
    'types': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local+internet access)'
    },
    'description': null,
    'noRemote': null,
    'noLocal': null
    // </d>
  };

  /**
   * format support (html5/flash)
   * stores canPlayType() results based on audioFormats.
   * eg. { mp3: boolean, mp4: boolean }
   * treat as read-only.
   */

  this.html5 = {
    'usingFlash': null // set if/when flash fallback is needed
  };

  // file type support hash
  this.flash = {};

  // determined at init time
  this.html5Only = false;

  // used for special cases (eg. iPad/iPhone/palm OS?)
  this.ignoreFlash = false;

  /**
   * a few private internals (OK, a lot. :D)
   */

  var SMSound,
  sm2 = this, globalHTML5Audio = null, flash = null, sm = 'soundManager', smc = sm + ': ', h5 = 'HTML5::', id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document, doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false, appendSuccess = false, didInit = false, disabled = false, windowLoaded = false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents, initUserOnload, delayWaitForEI, waitForEI, rebootIntoHTML5, setVersionInfo, handleFocus, strings, initMovie, domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug, debugLevels = ['log', 'info', 'warn', 'error'], defaultFlashVersion = 8, disableObject, failSafely, normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS, toggleDebug, loopFix, policyFix, complain, idCheck, waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0, h5IntervalTimer = null, parseURL, messages = [],
  canIgnoreFlash, needsFlash = null, featureCheck, html5OK, html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice, useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events, showSupport, flushMessages, wrapCallback, idCounter = 0, didSetup, msecScale = 1000,
  is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i),
  isWebkit = ua.match(/webkit/i),
  isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i)),
  isOpera = (ua.match(/opera/i)),
  mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid),
  isBadSafari = (!wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
  hasConsole = (window.console !== _undefined && console.log !== _undefined),
  isFocused = (doc.hasFocus !== _undefined ? doc.hasFocus() : null),
  tryInitOnFocus = (isSafari && (doc.hasFocus === _undefined || !doc.hasFocus())),
  okToDisable = !tryInitOnFocus,
  flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i,
  emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
  emptyWAV = 'data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==', // tiny WAV for HTML5 unloading
  overHTTP = (doc.location ? doc.location.protocol.match(/http/i) : null),
  http = (!overHTTP ? 'http:/'+'/' : ''),
  // mp3, mp4, aac etc.
  netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
  // Flash v9.0r115+ "moviestar" formats
  netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'm4b', 'mp4v', '3gp', '3g2'],
  netStreamPattern = new RegExp('\\.(' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

  this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

  // use altURL if not "online"
  this.useAltURL = !overHTTP;

  swfCSS = {
    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked', // or loaded OK
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'
  };

  /**
   * basic HTML5 Audio() support test
   * try...catch because of IE 9 "not implemented" nonsense
   * https://github.com/Modernizr/Modernizr/issues/224
   */

  this.hasHTML5 = (function() {
    try {
      // new Audio(null) for stupid Opera 9.64 case, which throws not_enough_arguments exception otherwise.
      return (Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() < 10 ? new Audio(null) : new Audio()).canPlayType !== _undefined);
    } catch(e) {
      return false;
    }
  }());

  /**
   * Public SoundManager API
   * -----------------------
   */

  /**
   * Configures top-level soundManager properties.
   *
   * @param {object} options Option parameters, eg. { flashVersion: 9, url: '/path/to/swfs/' }
   * onready and ontimeout are also accepted parameters. call soundManager.setup() to see the full list.
   */

  this.setup = function(options) {

    var noURL = (!sm2.url);

    // warn if flash options have already been applied

    if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) {
      complain(str('setupLate'));
    }

    // TODO: defer: true?

    assign(options);

    if (!useGlobalHTML5Audio) {

      if (mobileHTML5) {

        // force the singleton HTML5 pattern on mobile, by default.
        if (!sm2.setupOptions.ignoreMobileRestrictions || sm2.setupOptions.forceUseGlobalHTML5Audio) {
          messages.push(strings.globalHTML5);
          useGlobalHTML5Audio = true;
        }

      } else {

        // only apply singleton HTML5 on desktop if forced.
        if (sm2.setupOptions.forceUseGlobalHTML5Audio) {
          messages.push(strings.globalHTML5);
          useGlobalHTML5Audio = true;
        }

      }

    }

    if (!didSetup && mobileHTML5) {

      if (sm2.setupOptions.ignoreMobileRestrictions) {
        
        messages.push(strings.ignoreMobile);
      
      } else {

        // prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.

        // <d>
        if (!sm2.setupOptions.useHTML5Audio || sm2.setupOptions.preferFlash) {
          // notify that defaults are being changed.
          sm2._wD(strings.mobileUA);
        }
        // </d>

        sm2.setupOptions.useHTML5Audio = true;
        sm2.setupOptions.preferFlash = false;

        if (is_iDevice) {

          // no flash here.
          sm2.ignoreFlash = true;

        } else if ((isAndroid && !ua.match(/android\s2\.3/i)) || !isAndroid) {
        
          /**
           * Android devices tend to work better with a single audio instance, specifically for chained playback of sounds in sequence.
           * Common use case: exiting sound onfinish() -> createSound() -> play()
           * Presuming similar restrictions for other mobile, non-Android, non-iOS devices.
           */

          // <d>
          sm2._wD(strings.globalHTML5);
          // </d>

          useGlobalHTML5Audio = true;

        }

      }

    }

    // special case 1: "Late setup". SM2 loaded normally, but user didn't assign flash URL eg., setup({url:...}) before SM2 init. Treat as delayed init.

    if (options) {

      if (noURL && didDCLoaded && options.url !== _undefined) {
        sm2.beginDelayedInit();
      }

      // special case 2: If lazy-loading SM2 (DOMContentLoaded has already happened) and user calls setup() with url: parameter, try to init ASAP.

      if (!didDCLoaded && options.url !== _undefined && doc.readyState === 'complete') {
        setTimeout(domContentLoaded, 1);
      }

    }

    didSetup = true;

    return sm2;

  };

  this.ok = function() {

    return (needsFlash ? (didInit && !disabled) : (sm2.useHTML5Audio && sm2.hasHTML5));

  };

  this.supported = this.ok; // legacy

  this.getMovie = function(smID) {

    // safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
    return id(smID) || doc[smID] || window[smID];

  };

  /**
   * Creates a SMSound sound object instance. Can also be overloaded, e.g., createSound('mySound', '/some.mp3');
   *
   * @param {object} oOptions Sound options (at minimum, url parameter is required.)
   * @return {object} SMSound The new SMSound object.
   */

  this.createSound = function(oOptions, _url) {

    var cs, cs_string, options, oSound = null;

    // <d>
    cs = sm + '.createSound(): ';
    cs_string = cs + str(!didInit ? 'notReady' : 'notOK');
    // </d>

    if (!didInit || !sm2.ok()) {
      complain(cs_string);
      return false;
    }

    if (_url !== _undefined) {
      // function overloading in JS! :) ... assume simple createSound(id, url) use case.
      oOptions = {
        'id': oOptions,
        'url': _url
      };
    }

    // inherit from defaultOptions
    options = mixin(oOptions);

    options.url = parseURL(options.url);

    // generate an id, if needed.
    if (options.id === _undefined) {
      options.id = sm2.setupOptions.idPrefix + (idCounter++);
    }

    // <d>
    if (options.id.toString().charAt(0).match(/^[0-9]$/)) {
      sm2._wD(cs + str('badID', options.id), 2);
    }

    sm2._wD(cs + options.id + (options.url ? ' (' + options.url + ')' : ''), 1);
    // </d>

    if (idCheck(options.id, true)) {
      sm2._wD(cs + options.id + ' exists', 1);
      return sm2.sounds[options.id];
    }

    function make() {

      options = loopFix(options);
      sm2.sounds[options.id] = new SMSound(options);
      sm2.soundIDs.push(options.id);
      return sm2.sounds[options.id];

    }

    if (html5OK(options)) {

      oSound = make();
      // <d>
      if (!sm2.html5Only) {
        sm2._wD(options.id + ': Using HTML5');
      }
      // </d>
      oSound._setup_html5(options);

    } else {

      if (sm2.html5Only) {
        sm2._wD(options.id + ': No HTML5 support for this sound, and no Flash. Exiting.');
        return make();
      }

      // TODO: Move HTML5/flash checks into generic URL parsing/handling function.

      if (sm2.html5.usingFlash && options.url && options.url.match(/data\:/i)) {
        // data: URIs not supported by Flash, either.
        sm2._wD(options.id + ': data: URIs not supported via Flash. Exiting.');
        return make();
      }

      if (fV > 8) {
        if (options.isMovieStar === null) {
          // attempt to detect MPEG-4 formats
          options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || (options.url && options.url.match(netStreamPattern)));
        }
        // <d>
        if (options.isMovieStar) {
          sm2._wD(cs + 'using MovieStar handling');
          if (options.loops > 1) {
            _wDS('noNSLoop');
          }
        }
        // </d>
      }

      options = policyFix(options, cs);
      oSound = make();

      if (fV === 8) {
        flash._createSound(options.id, options.loops || 1, options.usePolicyFile);
      } else {
        flash._createSound(options.id, options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, (options.isMovieStar ? options.bufferTime : false), options.loops || 1, options.serverURL, options.duration || null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
        if (!options.serverURL) {
          // We are connected immediately
          oSound.connected = true;
          if (options.onconnect) {
            options.onconnect.apply(oSound);
          }
        }
      }

      if (!options.serverURL && (options.autoLoad || options.autoPlay)) {
        // call load for non-rtmp streams
        oSound.load(options);
      }

    }

    // rtmp will play in onconnect
    if (!options.serverURL && options.autoPlay) {
      oSound.play();
    }

    return oSound;

  };

  /**
   * Destroys a SMSound sound object instance.
   *
   * @param {string} sID The ID of the sound to destroy
   */

  this.destroySound = function(sID, _bFromSound) {

    // explicitly destroy a sound before normal page unload, etc.

    if (!idCheck(sID)) {
      return false;
    }

    var oS = sm2.sounds[sID], i;

    oS.stop();
    
    // Disable all callbacks after stop(), when the sound is being destroyed
    oS._iO = {};
    
    oS.unload();

    for (i = 0; i < sm2.soundIDs.length; i++) {
      if (sm2.soundIDs[i] === sID) {
        sm2.soundIDs.splice(i, 1);
        break;
      }
    }

    if (!_bFromSound) {
      // ignore if being called from SMSound instance
      oS.destruct(true);
    }

    oS = null;
    delete sm2.sounds[sID];

    return true;

  };

  /**
   * Calls the load() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   */

  this.load = function(sID, oOptions) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].load(oOptions);

  };

  /**
   * Calls the unload() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   */

  this.unload = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].unload();

  };

  /**
   * Calls the onPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod The relevant callback to fire
   * @param {object} oScope Optional: The scope to apply the callback to
   * @return {SMSound} The SMSound object
   */

  this.onPosition = function(sID, nPosition, oMethod, oScope) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].onposition(nPosition, oMethod, oScope);

  };

  // legacy/backwards-compability: lower-case method name
  this.onposition = this.onPosition;

  /**
   * Calls the clearOnPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod Optional: The relevant callback to fire
   * @return {SMSound} The SMSound object
   */

  this.clearOnPosition = function(sID, nPosition, oMethod) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].clearOnPosition(nPosition, oMethod);

  };

  /**
   * Calls the play() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   * @return {SMSound} The SMSound object
   */

  this.play = function(sID, oOptions) {

    var result = null,
        // legacy function-overloading use case: play('mySound', '/path/to/some.mp3');
        overloaded = (oOptions && !(oOptions instanceof Object));

    if (!didInit || !sm2.ok()) {
      complain(sm + '.play(): ' + str(!didInit?'notReady':'notOK'));
      return false;
    }

    if (!idCheck(sID, overloaded)) {

      if (!overloaded) {
        // no sound found for the given ID. Bail.
        return false;
      }

      if (overloaded) {
        oOptions = {
          url: oOptions
        };
      }

      if (oOptions && oOptions.url) {
        // overloading use case, create+play: .play('someID', {url:'/path/to.mp3'});
        sm2._wD(sm + '.play(): Attempting to create "' + sID + '"', 1);
        oOptions.id = sID;
        result = sm2.createSound(oOptions).play();
      }

    } else if (overloaded) {

      // existing sound object case
      oOptions = {
        url: oOptions
      };

    }

    if (result === null) {
      // default case
      result = sm2.sounds[sID].play(oOptions);
    }

    return result;

  };

  // just for convenience
  this.start = this.play;

  /**
   * Calls the setPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nMsecOffset Position (milliseconds)
   * @return {SMSound} The SMSound object
   */

  this.setPosition = function(sID, nMsecOffset) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPosition(nMsecOffset);

  };

  /**
   * Calls the stop() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.stop = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }

    sm2._wD(sm + '.stop(' + sID + ')', 1);
    return sm2.sounds[sID].stop();

  };

  /**
   * Stops all currently-playing sounds.
   */

  this.stopAll = function() {

    var oSound;
    sm2._wD(sm + '.stopAll()', 1);

    for (oSound in sm2.sounds) {
      if (sm2.sounds.hasOwnProperty(oSound)) {
        // apply only to sound objects
        sm2.sounds[oSound].stop();
      }
    }

  };

  /**
   * Calls the pause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.pause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].pause();

  };

  /**
   * Pauses all currently-playing sounds.
   */

  this.pauseAll = function() {

    var i;
    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].pause();
    }

  };

  /**
   * Calls the resume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.resume = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].resume();

  };

  /**
   * Resumes all currently-paused sounds.
   */

  this.resumeAll = function() {

    var i;
    for (i = sm2.soundIDs.length- 1 ; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].resume();
    }

  };

  /**
   * Calls the togglePause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.togglePause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].togglePause();

  };

  /**
   * Calls the setPan() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPan The pan value (-100 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setPan = function(sID, nPan) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPan(nPan);

  };

  /**
   * Calls the setVolume() method of a SMSound object by ID
   * Overloaded case: pass only volume argument eg., setVolume(50) to apply to all sounds.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nVol The volume value (0 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setVolume = function(sID, nVol) {

    // setVolume(50) function overloading case - apply to all sounds

    var i, j;

    if (sID !== _undefined && !isNaN(sID) && nVol === _undefined) {
      for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
        sm2.sounds[sm2.soundIDs[i]].setVolume(sID);
      }
      return;
    }

    // setVolume('mySound', 50) case

    if (!idCheck(sID)) {
      return false;
    }

    return sm2.sounds[sID].setVolume(nVol);

  };

  /**
   * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.mute = function(sID) {

    var i = 0;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.mute(): Muting all sounds');
      for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].mute();
      }
      sm2.muted = true;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.mute(): Muting "' + sID + '"');
      return sm2.sounds[sID].mute();

    }

    return true;

  };

  /**
   * Mutes all sounds.
   */

  this.muteAll = function() {

    sm2.mute();

  };

  /**
   * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.unmute = function(sID) {

    var i;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.unmute(): Unmuting all sounds');
      for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].unmute();
      }
      sm2.muted = false;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.unmute(): Unmuting "' + sID + '"');
      return sm2.sounds[sID].unmute();

    }

    return true;

  };

  /**
   * Unmutes all sounds.
   */

  this.unmuteAll = function() {

    sm2.unmute();

  };

  /**
   * Calls the toggleMute() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.toggleMute = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].toggleMute();

  };

  /**
   * Retrieves the memory used by the flash plugin.
   *
   * @return {number} The amount of memory in use
   */

  this.getMemoryUse = function() {

    // flash-only
    var ram = 0;

    if (flash && fV !== 8) {
      ram = parseInt(flash._getMemoryUse(), 10);
    }

    return ram;

  };

  /**
   * Undocumented: NOPs soundManager and all SMSound objects.
   */

  this.disable = function(bNoDisable) {

    // destroy all functions
    var i;

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled) {
      return false;
    }

    disabled = true;
    _wDS('shutdown', 1);

    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
      disableObject(sm2.sounds[sm2.soundIDs[i]]);
    }

    // fire "complete", despite fail
    initComplete(bNoDisable);
    event.remove(window, 'load', initUserOnload);

    return true;

  };

  /**
   * Determines playability of a MIME type, eg. 'audio/mp3'.
   */

  this.canPlayMIME = function(sMIME) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({
        type: sMIME
      });
    }

    if (!result && needsFlash) {
      // if flash 9, test netStream (movieStar) types as well.
      result = (sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null); // TODO: make less "weird" (per JSLint)
    }

    return result;

  };

  /**
   * Determines playability of a URL based on audio support.
   *
   * @param {string} sURL The URL to test
   * @return {boolean} URL playability
   */

  this.canPlayURL = function(sURL) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({
        url: sURL
      });
    }

    if (!result && needsFlash) {
      result = (sURL && sm2.ok() ? !!(sURL.match(sm2.filePattern)) : null);
    }

    return result;

  };

  /**
   * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
   *
   * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
   * @return {boolean} URL playability
   */

  this.canPlayLink = function(oLink) {

    if (oLink.type !== _undefined && oLink.type) {
      if (sm2.canPlayMIME(oLink.type)) {
        return true;
      }
    }

    return sm2.canPlayURL(oLink.href);

  };

  /**
   * Retrieves a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.getSoundById = function(sID, _suppressDebug) {

    if (!sID) {
      return null;
    }

    var result = sm2.sounds[sID];

    // <d>
    if (!result && !_suppressDebug) {
      sm2._wD(sm + '.getSoundById(): Sound "' + sID + '" not found.', 2);
    }
    // </d>

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has successfully initialized.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.onready = function(oMethod, oScope) {

    var sType = 'onready',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents();

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has failed to initialize.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.ontimeout = function(oMethod, oScope) {

    var sType = 'ontimeout',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents({type:sType});

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Writes console.log()-style debug output to a console or in-browser element.
   * Applies when debugMode = true
   *
   * @param {string} sText The console message
   * @param {object} nType Optional log level (number), or object. Number case: Log type/style where 0 = 'info', 1 = 'warn', 2 = 'error'. Object case: Object to be dumped.
   */

  this._writeDebug = function(sText, sTypeOrObject) {

    // pseudo-private console.log()-style output
    // <d>

    var sDID = 'soundmanager-debug', o, oItem;

    if (!sm2.setupOptions.debugMode) {
      return false;
    }

    if (hasConsole && sm2.useConsole) {
      if (sTypeOrObject && typeof sTypeOrObject === 'object') {
        // object passed; dump to console.
        console.log(sText, sTypeOrObject);
      } else if (debugLevels[sTypeOrObject] !== _undefined) {
        console[debugLevels[sTypeOrObject]](sText);
      } else {
        console.log(sText);
      }
      if (sm2.consoleOnly) {
        return true;
      }
    }

    o = id(sDID);

    if (!o) {
      return false;
    }

    oItem = doc.createElement('div');

    if (++wdCount % 2 === 0) {
      oItem.className = 'sm2-alt';
    }

    if (sTypeOrObject === _undefined) {
      sTypeOrObject = 0;
    } else {
      sTypeOrObject = parseInt(sTypeOrObject, 10);
    }

    oItem.appendChild(doc.createTextNode(sText));

    if (sTypeOrObject) {
      if (sTypeOrObject >= 2) {
        oItem.style.fontWeight = 'bold';
      }
      if (sTypeOrObject === 3) {
        oItem.style.color = '#ff3333';
      }
    }

    // top-to-bottom
    // o.appendChild(oItem);

    // bottom-to-top
    o.insertBefore(oItem, o.firstChild);

    o = null;
    // </d>

    return true;

  };

  // <d>
  // last-resort debugging option
  if (wl.indexOf('sm2-debug=alert') !== -1) {
    this._writeDebug = function(sText) {
      window.alert(sText);
    };
  }
  // </d>

  // alias
  this._wD = this._writeDebug;

  /**
   * Provides debug / state information on all SMSound objects.
   */

  this._debug = function() {

    // <d>
    var i, j;
    _wDS('currentObj', 1);

    for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
      sm2.sounds[sm2.soundIDs[i]]._debug();
    }
    // </d>

  };

  /**
   * Restarts and re-initializes the SoundManager instance.
   *
   * @param {boolean} resetEvents Optional: When true, removes all registered onready and ontimeout event callbacks.
   * @param {boolean} excludeInit Options: When true, does not call beginDelayedInit() (which would restart SM2).
   * @return {object} soundManager The soundManager instance.
   */

  this.reboot = function(resetEvents, excludeInit) {

    // reset some (or all) state, and re-init unless otherwise specified.

    // <d>
    if (sm2.soundIDs.length) {
      sm2._wD('Destroying ' + sm2.soundIDs.length + ' SMSound object' + (sm2.soundIDs.length !== 1 ? 's' : '') + '...');
    }
    // </d>

    var i, j, k;

    for (i = sm2.soundIDs.length- 1 ; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].destruct();
    }

    // trash ze flash (remove from the DOM)

    if (flash) {

      try {

        if (isIE) {
          oRemovedHTML = flash.innerHTML;
        }

        oRemoved = flash.parentNode.removeChild(flash);

      } catch(e) {

        // Remove failed? May be due to flash blockers silently removing the SWF object/embed node from the DOM. Warn and continue.

        _wDS('badRemove', 2);

      }

    }

    // actually, force recreate of movie.

    oRemovedHTML = oRemoved = needsFlash = flash = null;

    sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;

    sm2.soundIDs = [];
    sm2.sounds = {};

    idCounter = 0;
    didSetup = false;

    if (!resetEvents) {
      // reset callbacks for onready, ontimeout etc. so that they will fire again on re-init
      for (i in on_queue) {
        if (on_queue.hasOwnProperty(i)) {
          for (j = 0, k = on_queue[i].length; j < k; j++) {
            on_queue[i][j].fired = false;
          }
        }
      }
    } else {
      // remove all callbacks entirely
      on_queue = [];
    }

    // <d>
    if (!excludeInit) {
      sm2._wD(sm + ': Rebooting...');
    }
    // </d>

    // reset HTML5 and flash canPlay test results

    sm2.html5 = {
      'usingFlash': null
    };

    sm2.flash = {};

    // reset device-specific HTML/flash mode switches

    sm2.html5Only = false;
    sm2.ignoreFlash = false;

    window.setTimeout(function() {

      // by default, re-init

      if (!excludeInit) {
        sm2.beginDelayedInit();
      }

    }, 20);

    return sm2;

  };

  this.reset = function() {

    /**
     * Shuts down and restores the SoundManager instance to its original loaded state, without an explicit reboot. All onready/ontimeout handlers are removed.
     * After this call, SM2 may be re-initialized via soundManager.beginDelayedInit().
     * @return {object} soundManager The soundManager instance.
     */

    _wDS('reset');
    return sm2.reboot(true, true);

  };

  /**
   * Undocumented: Determines the SM2 flash movie's load progress.
   *
   * @return {number or null} Percent loaded, or if invalid/unsupported, null.
   */

  this.getMoviePercent = function() {

    /**
     * Interesting syntax notes...
     * Flash/ExternalInterface (ActiveX/NPAPI) bridge methods are not typeof "function" nor instanceof Function, but are still valid.
     * Additionally, JSLint dislikes ('PercentLoaded' in flash)-style syntax and recommends hasOwnProperty(), which does not work in this case.
     * Furthermore, using (flash && flash.PercentLoaded) causes IE to throw "object doesn't support this property or method".
     * Thus, 'in' syntax must be used.
     */

    return (flash && 'PercentLoaded' in flash ? flash.PercentLoaded() : null); // Yes, JSLint. See nearby comment in source for explanation.

  };

  /**
   * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
   */

  this.beginDelayedInit = function() {

    windowLoaded = true;
    domContentLoaded();

    setTimeout(function() {

      if (initPending) {
        return false;
      }

      createMovie();
      initMovie();
      initPending = true;

      return true;

    }, 20);

    delayWaitForEI();

  };

  /**
   * Destroys the SoundManager instance and all SMSound instances.
   */

  this.destruct = function() {

    sm2._wD(sm + '.destruct()');
    sm2.disable(true);

  };

  /**
   * SMSound() (sound object) constructor
   * ------------------------------------
   *
   * @param {object} oOptions Sound options (id and url are required attributes)
   * @return {SMSound} The new SMSound object
   */

  SMSound = function(oOptions) {

    var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer, attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition, applyFromTo, lastURL = null, lastHTML5State, urlOmitted;

    lastHTML5State = {
      // tracks duration + position (time)
      duration: null,
      time: null
    };

    this.id = oOptions.id;

    // legacy
    this.sID = this.id;

    this.url = oOptions.url;
    this.options = mixin(oOptions);

    // per-play-instance-specific options
    this.instanceOptions = this.options;

    // short alias
    this._iO = this.instanceOptions;

    // assign property defaults
    this.pan = this.options.pan;
    this.volume = this.options.volume;

    // whether or not this object is using HTML5
    this.isHTML5 = false;

    // internal HTML5 Audio() object reference
    this._a = null;

    // for flash 8 special-case createSound() without url, followed by load/play with url case
    urlOmitted = (this.url ? false : true);

    /**
     * SMSound() public methods
     * ------------------------
     */

    this.id3 = {};

    /**
     * Writes SMSound object parameters to debug console
     */

    this._debug = function() {

      // <d>
      sm2._wD(s.id + ': Merged options:', s.options);
      // </d>

    };

    /**
     * Begins loading a sound per its *url*.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.load = function(oOptions) {

      var oSound = null, instanceOptions;

      if (oOptions !== _undefined) {
        s._iO = mixin(oOptions, s.options);
      } else {
        oOptions = s.options;
        s._iO = oOptions;
        if (lastURL && lastURL !== s.url) {
          _wDS('manURL');
          s._iO.url = s.url;
          s.url = null;
        }
      }

      if (!s._iO.url) {
        s._iO.url = s.url;
      }

      s._iO.url = parseURL(s._iO.url);

      // ensure we're in sync
      s.instanceOptions = s._iO;

      // local shortcut
      instanceOptions = s._iO;

      sm2._wD(s.id + ': load (' + instanceOptions.url + ')');

      if (!instanceOptions.url && !s.url) {
        sm2._wD(s.id + ': load(): url is unassigned. Exiting.', 2);
        return s;
      }

      // <d>
      if (!s.isHTML5 && fV === 8 && !s.url && !instanceOptions.autoPlay) {
        // flash 8 load() -> play() won't work before onload has fired.
        sm2._wD(s.id + ': Flash 8 load() limitation: Wait for onload() before calling play().', 1);
      }
      // </d>

      if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
        _wDS('onURL', 1);
        // if loaded and an onload() exists, fire immediately.
        if (s.readyState === 3 && instanceOptions.onload) {
          // assume success based on truthy duration.
          wrapCallback(s, function() {
            instanceOptions.onload.apply(s, [(!!s.duration)]);
          });
        }
        return s;
      }

      // reset a few state properties

      s.loaded = false;
      s.readyState = 1;
      s.playState = 0;
      s.id3 = {};

      // TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

      if (html5OK(instanceOptions)) {

        oSound = s._setup_html5(instanceOptions);

        if (!oSound._called_load) {

          s._html5_canplay = false;

          // TODO: review called_load / html5_canplay logic

          // if url provided directly to load(), assign it here.

          if (s.url !== instanceOptions.url) {

            sm2._wD(_wDS('manURL') + ': ' + instanceOptions.url);

            s._a.src = instanceOptions.url;

            // TODO: review / re-apply all relevant options (volume, loop, onposition etc.)

            // reset position for new URL
            s.setPosition(0);

          }

          // given explicit load call, try to preload.

          // early HTML5 implementation (non-standard)
          s._a.autobuffer = 'auto';

          // standard property, values: none / metadata / auto
          // reference: http://msdn.microsoft.com/en-us/library/ie/ff974759%28v=vs.85%29.aspx
          s._a.preload = 'auto';

          s._a._called_load = true;

        } else {

          sm2._wD(s.id + ': Ignoring request to load again');

        }

      } else {

        if (sm2.html5Only) {
          sm2._wD(s.id + ': No flash support. Exiting.');
          return s;
        }

        if (s._iO.url && s._iO.url.match(/data\:/i)) {
          // data: URIs not supported by Flash, either.
          sm2._wD(s.id + ': data: URIs not supported via Flash. Exiting.');
          return s;
        }

        try {
          s.isHTML5 = false;
          s._iO = policyFix(loopFix(instanceOptions));
          // if we have "position", disable auto-play as we'll be seeking to that position at onload().
          if (s._iO.autoPlay && (s._iO.position || s._iO.from)) {
            sm2._wD(s.id + ': Disabling autoPlay because of non-zero offset case');
            s._iO.autoPlay = false;
          }
          // re-assign local shortcut
          instanceOptions = s._iO;
          if (fV === 8) {
            flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile);
          } else {
            flash._load(s.id, instanceOptions.url, !!(instanceOptions.stream), !!(instanceOptions.autoPlay), instanceOptions.loops || 1, !!(instanceOptions.autoLoad), instanceOptions.usePolicyFile);
          }
        } catch(e) {
          _wDS('smError', 2);
          debugTS('onload', false);
          catchError({
            type: 'SMSOUND_LOAD_JS_EXCEPTION',
            fatal: true
          });
        }

      }

      // after all of this, ensure sound url is up to date.
      s.url = instanceOptions.url;

      return s;

    };

    /**
     * Unloads a sound, canceling any open HTTP requests.
     *
     * @return {SMSound} The SMSound object
     */

    this.unload = function() {

      // Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
      // Flash 9/AS3: Close stream, preventing further load
      // HTML5: Most UAs will use empty URL

      if (s.readyState !== 0) {

        sm2._wD(s.id + ': unload()');

        if (!s.isHTML5) {

          if (fV === 8) {
            flash._unload(s.id, emptyURL);
          } else {
            flash._unload(s.id);
          }

        } else {

          stop_html5_timer();

          if (s._a) {

            s._a.pause();

            // update empty URL, too
            lastURL = html5Unload(s._a);

          }

        }

        // reset load/status flags
        resetProperties();

      }

      return s;

    };

    /**
     * Unloads and destroys a sound.
     */

    this.destruct = function(_bFromSM) {

      sm2._wD(s.id + ': Destruct');

      if (!s.isHTML5) {

        // kill sound within Flash
        // Disable the onfailure handler
        s._iO.onfailure = null;
        flash._destroySound(s.id);

      } else {

        stop_html5_timer();

        if (s._a) {
          s._a.pause();
          html5Unload(s._a);
          if (!useGlobalHTML5Audio) {
            remove_html5_events();
          }
          // break obvious circular reference
          s._a._s = null;
          s._a = null;
        }

      }

      if (!_bFromSM) {
        // ensure deletion from controller
        sm2.destroySound(s.id, true);
      }

    };

    /**
     * Begins playing a sound.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.play = function(oOptions, _updatePlayState) {

      var fN, allowMulti, a, onready,
          audioClone, onended, oncanplay,
          startOK = true,
          exit = null;

      // <d>
      fN = s.id + ': play(): ';
      // </d>

      // default to true
      _updatePlayState = (_updatePlayState === _undefined ? true : _updatePlayState);

      if (!oOptions) {
        oOptions = {};
      }

      // first, use local URL (if specified)
      if (s.url) {
        s._iO.url = s.url;
      }

      // mix in any options defined at createSound()
      s._iO = mixin(s._iO, s.options);

      // mix in any options specific to this method
      s._iO = mixin(oOptions, s._iO);

      s._iO.url = parseURL(s._iO.url);

      s.instanceOptions = s._iO;

      // RTMP-only
      if (!s.isHTML5 && s._iO.serverURL && !s.connected) {
        if (!s.getAutoPlay()) {
          sm2._wD(fN +' Netstream not connected yet - setting autoPlay');
          s.setAutoPlay(true);
        }
        // play will be called in onconnect()
        return s;
      }

      if (html5OK(s._iO)) {
        s._setup_html5(s._iO);
        start_html5_timer();
      }

      if (s.playState === 1 && !s.paused) {

        allowMulti = s._iO.multiShot;

        if (!allowMulti) {

          sm2._wD(fN + 'Already playing (one-shot)', 1);

          if (s.isHTML5) {
            // go back to original position.
            s.setPosition(s._iO.position);
          }

          exit = s;

        } else {
          sm2._wD(fN + 'Already playing (multi-shot)', 1);
        }

      }

      if (exit !== null) {
        return exit;
      }

      // edge case: play() with explicit URL parameter
      if (oOptions.url && oOptions.url !== s.url) {

        // special case for createSound() followed by load() / play() with url; avoid double-load case.
        if (!s.readyState && !s.isHTML5 && fV === 8 && urlOmitted) {

          urlOmitted = false;

        } else {

          // load using merged options
          s.load(s._iO);

        }

      }

      if (!s.loaded) {

        if (s.readyState === 0) {

          sm2._wD(fN + 'Attempting to load');

          // try to get this sound playing ASAP
          if (!s.isHTML5 && !sm2.html5Only) {

            // flash: assign directly because setAutoPlay() increments the instanceCount
            s._iO.autoPlay = true;
            s.load(s._iO);

          } else if (s.isHTML5) {

            // iOS needs this when recycling sounds, loading a new URL on an existing object.
            s.load(s._iO);

          } else {

            sm2._wD(fN + 'Unsupported type. Exiting.');
            exit = s;

          }

          // HTML5 hack - re-set instanceOptions?
          s.instanceOptions = s._iO;

        } else if (s.readyState === 2) {

          sm2._wD(fN + 'Could not load - exiting', 2);
          exit = s;

        } else {

          sm2._wD(fN + 'Loading - attempting to play...');

        }

      } else {

        // "play()"
        sm2._wD(fN.substr(0, fN.lastIndexOf(':')));

      }

      if (exit !== null) {
        return exit;
      }

      if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
        // flash 9 needs a position reset if play() is called while at the end of a sound.
        sm2._wD(fN + 'Sound at end, resetting to position: 0');
        oOptions.position = 0;
      }

      /**
       * Streams will pause when their buffer is full if they are being loaded.
       * In this case paused is true, but the song hasn't started playing yet.
       * If we just call resume() the onplay() callback will never be called.
       * So only call resume() if the position is > 0.
       * Another reason is because options like volume won't have been applied yet.
       * For normal sounds, just resume.
       */

      if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {

        // https://gist.github.com/37b17df75cc4d7a90bf6
        sm2._wD(fN + 'Resuming from paused state', 1);
        s.resume();

      } else {

        s._iO = mixin(oOptions, s._iO);

        /**
         * Preload in the event of play() with position under Flash,
         * or from/to parameters and non-RTMP case
         */
        if (((!s.isHTML5 && s._iO.position !== null && s._iO.position > 0) || (s._iO.from !== null && s._iO.from > 0) || s._iO.to !== null) && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {

          onready = function() {
            // sound "canplay" or onload()
            // re-apply position/from/to to instance options, and start playback
            s._iO = mixin(oOptions, s._iO);
            s.play(s._iO);
          };

          // HTML5 needs to at least have "canplay" fired before seeking.
          if (s.isHTML5 && !s._html5_canplay) {

            // this hasn't been loaded yet. load it first, and then do this again.
            sm2._wD(fN + 'Beginning load for non-zero offset case');

            s.load({
              // note: custom HTML5-only event added for from/to implementation.
              _oncanplay: onready
            });

            exit = false;

          } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {

            // to be safe, preload the whole thing in Flash.

            sm2._wD(fN + 'Preloading for non-zero offset case');

            s.load({
              onload: onready
            });

            exit = false;

          }

          if (exit !== null) {
            return exit;
          }

          // otherwise, we're ready to go. re-apply local options, and continue

          s._iO = applyFromTo();

        }

        // sm2._wD(fN + 'Starting to play');

        // increment instance counter, where enabled + supported
        if (!s.instanceCount || s._iO.multiShotEvents || (s.isHTML5 && s._iO.multiShot && !useGlobalHTML5Audio) || (!s.isHTML5 && fV > 8 && !s.getAutoPlay())) {
          s.instanceCount++;
        }

        // if first play and onposition parameters exist, apply them now
        if (s._iO.onposition && s.playState === 0) {
          attachOnPosition(s);
        }

        s.playState = 1;
        s.paused = false;

        s.position = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0);

        if (!s.isHTML5) {
          s._iO = policyFix(loopFix(s._iO));
        }

        if (s._iO.onplay && _updatePlayState) {
          s._iO.onplay.apply(s);
          onplay_called = true;
        }

        s.setVolume(s._iO.volume, true);
        s.setPan(s._iO.pan, true);

        if (!s.isHTML5) {

          startOK = flash._start(s.id, s._iO.loops || 1, (fV === 9 ? s.position : s.position / msecScale), s._iO.multiShot || false);

          if (fV === 9 && !startOK) {
            // edge case: no sound hardware, or 32-channel flash ceiling hit.
            // applies only to Flash 9, non-NetStream/MovieStar sounds.
            // http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Sound.html#play%28%29
            sm2._wD(fN + 'No sound hardware, or 32-sound ceiling hit', 2);
            if (s._iO.onplayerror) {
              s._iO.onplayerror.apply(s);
            }

          }

        } else {

          if (s.instanceCount < 2) {

            // HTML5 single-instance case

            start_html5_timer();

            a = s._setup_html5();

            s.setPosition(s._iO.position);

            a.play();

          } else {

            // HTML5 multi-shot case

            sm2._wD(s.id + ': Cloning Audio() for instance #' + s.instanceCount + '...');

            audioClone = new Audio(s._iO.url);

            onended = function() {
              event.remove(audioClone, 'ended', onended);
              s._onfinish(s);
              // cleanup
              html5Unload(audioClone);
              audioClone = null;
            };

            oncanplay = function() {
              event.remove(audioClone, 'canplay', oncanplay);
              try {
                audioClone.currentTime = s._iO.position/msecScale;
              } catch(err) {
                complain(s.id + ': multiShot play() failed to apply position of ' + (s._iO.position/msecScale));
              }
              audioClone.play();
            };

            event.add(audioClone, 'ended', onended);

            // apply volume to clones, too
            if (s._iO.volume !== _undefined) {
              audioClone.volume = Math.max(0, Math.min(1, s._iO.volume/100));
            }

            // playing multiple muted sounds? if you do this, you're weird ;) - but let's cover it.
            if (s.muted) {
              audioClone.muted = true;
            }

            if (s._iO.position) {
              // HTML5 audio can't seek before onplay() event has fired.
              // wait for canplay, then seek to position and start playback.
              event.add(audioClone, 'canplay', oncanplay);
            } else {
              // begin playback at currentTime: 0
              audioClone.play();
            }

          }

        }

      }

      return s;

    };

    // just for convenience
    this.start = this.play;

    /**
     * Stops playing a sound (and optionally, all sounds)
     *
     * @param {boolean} bAll Optional: Whether to stop all sounds
     * @return {SMSound} The SMSound object
     */

    this.stop = function(bAll) {

      var instanceOptions = s._iO,
          originalPosition;

      if (s.playState === 1) {

        sm2._wD(s.id + ': stop()');

        s._onbufferchange(0);
        s._resetOnPosition(0);
        s.paused = false;

        if (!s.isHTML5) {
          s.playState = 0;
        }

        // remove onPosition listeners, if any
        detachOnPosition();

        // and "to" position, if set
        if (instanceOptions.to) {
          s.clearOnPosition(instanceOptions.to);
        }

        if (!s.isHTML5) {

          flash._stop(s.id, bAll);

          // hack for netStream: just unload
          if (instanceOptions.serverURL) {
            s.unload();
          }

        } else {

          if (s._a) {

            originalPosition = s.position;

            // act like Flash, though
            s.setPosition(0);

            // hack: reflect old position for onstop() (also like Flash)
            s.position = originalPosition;

            // html5 has no stop()
            // NOTE: pausing means iOS requires interaction to resume.
            s._a.pause();

            s.playState = 0;

            // and update UI
            s._onTimer();

            stop_html5_timer();

          }

        }

        s.instanceCount = 0;
        s._iO = {};

        if (instanceOptions.onstop) {
          instanceOptions.onstop.apply(s);
        }

      }

      return s;

    };

    /**
     * Undocumented/internal: Sets autoPlay for RTMP.
     *
     * @param {boolean} autoPlay state
     */

    this.setAutoPlay = function(autoPlay) {

      sm2._wD(s.id + ': Autoplay turned ' + (autoPlay ? 'on' : 'off'));
      s._iO.autoPlay = autoPlay;

      if (!s.isHTML5) {
        flash._setAutoPlay(s.id, autoPlay);
        if (autoPlay) {
          // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
          if (!s.instanceCount && s.readyState === 1) {
            s.instanceCount++;
            sm2._wD(s.id + ': Incremented instance count to '+s.instanceCount);
          }
        }
      }

    };

    /**
     * Undocumented/internal: Returns the autoPlay boolean.
     *
     * @return {boolean} The current autoPlay value
     */

    this.getAutoPlay = function() {

      return s._iO.autoPlay;

    };

    /**
     * Sets the position of a sound.
     *
     * @param {number} nMsecOffset Position (milliseconds)
     * @return {SMSound} The SMSound object
     */

    this.setPosition = function(nMsecOffset) {

      if (nMsecOffset === _undefined) {
        nMsecOffset = 0;
      }

      var position, position1K,
          // Use the duration from the instance options, if we don't have a track duration yet.
          // position >= 0 and <= current available (loaded) duration
          offset = (s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0)));

      s.position = offset;
      position1K = s.position/msecScale;
      s._resetOnPosition(s.position);
      s._iO.position = offset;

      if (!s.isHTML5) {

        position = (fV === 9 ? s.position : position1K);

        if (s.readyState && s.readyState !== 2) {
          // if paused or not playing, will not resume (by playing)
          flash._setPosition(s.id, position, (s.paused || !s.playState), s._iO.multiShot);
        }

      } else if (s._a) {

        // Set the position in the canplay handler if the sound is not ready yet
        if (s._html5_canplay) {

          if (s._a.currentTime !== position1K) {

            /**
             * DOM/JS errors/exceptions to watch out for:
             * if seek is beyond (loaded?) position, "DOM exception 11"
             * "INDEX_SIZE_ERR": DOM exception 1
             */
            sm2._wD(s.id + ': setPosition(' + position1K + ')');

            try {
              s._a.currentTime = position1K;
              if (s.playState === 0 || s.paused) {
                // allow seek without auto-play/resume
                s._a.pause();
              }
            } catch(e) {
              sm2._wD(s.id + ': setPosition(' + position1K + ') failed: ' + e.message, 2);
            }

          }

        } else if (position1K) {

          // warn on non-zero seek attempts
          sm2._wD(s.id + ': setPosition(' + position1K + '): Cannot seek yet, sound not ready', 2);
          return s;

        }

        if (s.paused) {

          // if paused, refresh UI right away by forcing update
          s._onTimer(true);

        }

      }

      return s;

    };

    /**
     * Pauses sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.pause = function(_bCallFlash) {

      if (s.paused || (s.playState === 0 && s.readyState !== 1)) {
        return s;
      }

      sm2._wD(s.id + ': pause()');
      s.paused = true;

      if (!s.isHTML5) {
        if (_bCallFlash || _bCallFlash === _undefined) {
          flash._pause(s.id, s._iO.multiShot);
        }
      } else {
        s._setup_html5().pause();
        stop_html5_timer();
      }

      if (s._iO.onpause) {
        s._iO.onpause.apply(s);
      }

      return s;

    };

    /**
     * Resumes sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    /**
     * When auto-loaded streams pause on buffer full they have a playState of 0.
     * We need to make sure that the playState is set to 1 when these streams "resume".
     * When a paused stream is resumed, we need to trigger the onplay() callback if it
     * hasn't been called already. In this case since the sound is being played for the
     * first time, I think it's more appropriate to call onplay() rather than onresume().
     */

    this.resume = function() {

      var instanceOptions = s._iO;

      if (!s.paused) {
        return s;
      }

      sm2._wD(s.id + ': resume()');
      s.paused = false;
      s.playState = 1;

      if (!s.isHTML5) {

        if (instanceOptions.isMovieStar && !instanceOptions.serverURL) {
          // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
          s.setPosition(s.position);
        }

        // flash method is toggle-based (pause/resume)
        flash._pause(s.id, instanceOptions.multiShot);

      } else {

        s._setup_html5().play();
        start_html5_timer();

      }

      if (!onplay_called && instanceOptions.onplay) {

        instanceOptions.onplay.apply(s);
        onplay_called = true;

      } else if (instanceOptions.onresume) {

        instanceOptions.onresume.apply(s);

      }

      return s;

    };

    /**
     * Toggles sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.togglePause = function() {

      sm2._wD(s.id + ': togglePause()');

      if (s.playState === 0) {
        s.play({
          position: (fV === 9 && !s.isHTML5 ? s.position : s.position / msecScale)
        });
        return s;
      }

      if (s.paused) {
        s.resume();
      } else {
        s.pause();
      }

      return s;

    };

    /**
     * Sets the panning (L-R) effect.
     *
     * @param {number} nPan The pan value (-100 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setPan = function(nPan, bInstanceOnly) {

      if (nPan === _undefined) {
        nPan = 0;
      }

      if (bInstanceOnly === _undefined) {
        bInstanceOnly = false;
      }

      if (!s.isHTML5) {
        flash._setPan(s.id, nPan);
      } // else { no HTML5 pan? }

      s._iO.pan = nPan;

      if (!bInstanceOnly) {
        s.pan = nPan;
        s.options.pan = nPan;
      }

      return s;

    };

    /**
     * Sets the volume.
     *
     * @param {number} nVol The volume value (0 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setVolume = function(nVol, _bInstanceOnly) {

      /**
       * Note: Setting volume has no effect on iOS "special snowflake" devices.
       * Hardware volume control overrides software, and volume
       * will always return 1 per Apple docs. (iOS 4 + 5.)
       * http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
       */

      if (nVol === _undefined) {
        nVol = 100;
      }

      if (_bInstanceOnly === _undefined) {
        _bInstanceOnly = false;
      }

      if (!s.isHTML5) {

        flash._setVolume(s.id, (sm2.muted && !s.muted) || s.muted ? 0 : nVol);

      } else if (s._a) {

        if (sm2.muted && !s.muted) {
          s.muted = true;
          s._a.muted = true;
        }

        // valid range for native HTML5 Audio(): 0-1
        s._a.volume = Math.max(0, Math.min(1, nVol/100));

      }

      s._iO.volume = nVol;

      if (!_bInstanceOnly) {
        s.volume = nVol;
        s.options.volume = nVol;
      }

      return s;

    };

    /**
     * Mutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.mute = function() {

      s.muted = true;

      if (!s.isHTML5) {
        flash._setVolume(s.id, 0);
      } else if (s._a) {
        s._a.muted = true;
      }

      return s;

    };

    /**
     * Unmutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.unmute = function() {

      s.muted = false;
      var hasIO = (s._iO.volume !== _undefined);

      if (!s.isHTML5) {
        flash._setVolume(s.id, hasIO ? s._iO.volume : s.options.volume);
      } else if (s._a) {
        s._a.muted = false;
      }

      return s;

    };

    /**
     * Toggles the muted state of a sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.toggleMute = function() {

      return (s.muted ? s.unmute() : s.mute());

    };

    /**
     * Registers a callback to be fired when a sound reaches a given position during playback.
     *
     * @param {number} nPosition The position to watch for
     * @param {function} oMethod The relevant callback to fire
     * @param {object} oScope Optional: The scope to apply the callback to
     * @return {SMSound} The SMSound object
     */

    this.onPosition = function(nPosition, oMethod, oScope) {

      // TODO: basic dupe checking?

      onPositionItems.push({
        position: parseInt(nPosition, 10),
        method: oMethod,
        scope: (oScope !== _undefined ? oScope : s),
        fired: false
      });

      return s;

    };

    // legacy/backwards-compability: lower-case method name
    this.onposition = this.onPosition;

    /**
     * Removes registered callback(s) from a sound, by position and/or callback.
     *
     * @param {number} nPosition The position to clear callback(s) for
     * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
     * @return {SMSound} The SMSound object
     */

    this.clearOnPosition = function(nPosition, oMethod) {

      var i;

      nPosition = parseInt(nPosition, 10);

      if (isNaN(nPosition)) {
        // safety check
        return false;
      }

      for (i=0; i < onPositionItems.length; i++) {

        if (nPosition === onPositionItems[i].position) {
          // remove this item if no method was specified, or, if the method matches
          
          if (!oMethod || (oMethod === onPositionItems[i].method)) {
            
            if (onPositionItems[i].fired) {
              // decrement "fired" counter, too
              onPositionFired--;
            }
            
            onPositionItems.splice(i, 1);
          
          }
        
        }

      }

    };

    this._processOnPosition = function() {

      var i, item, j = onPositionItems.length;

      if (!j || !s.playState || onPositionFired >= j) {
        return false;
      }

      for (i = j - 1; i >= 0; i--) {
        
        item = onPositionItems[i];
        
        if (!item.fired && s.position >= item.position) {
        
          item.fired = true;
          onPositionFired++;
          item.method.apply(item.scope, [item.position]);
        
          //  reset j -- onPositionItems.length can be changed in the item callback above... occasionally breaking the loop.
          j = onPositionItems.length;
        
        }
      
      }

      return true;

    };

    this._resetOnPosition = function(nPosition) {

      // reset "fired" for items interested in this position
      var i, item, j = onPositionItems.length;

      if (!j) {
        return false;
      }

      for (i = j - 1; i >= 0; i--) {
        
        item = onPositionItems[i];
        
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          onPositionFired--;
        }
      
      }

      return true;

    };

    /**
     * SMSound() private internals
     * --------------------------------
     */

    applyFromTo = function() {

      var instanceOptions = s._iO,
          f = instanceOptions.from,
          t = instanceOptions.to,
          start, end;

      end = function() {

        // end has been reached.
        sm2._wD(s.id + ': "To" time of ' + t + ' reached.');

        // detach listener
        s.clearOnPosition(t, end);

        // stop should clear this, too
        s.stop();

      };

      start = function() {

        sm2._wD(s.id + ': Playing "from" ' + f);

        // add listener for end
        if (t !== null && !isNaN(t)) {
          s.onPosition(t, end);
        }

      };

      if (f !== null && !isNaN(f)) {

        // apply to instance options, guaranteeing correct start position.
        instanceOptions.position = f;

        // multiShot timing can't be tracked, so prevent that.
        instanceOptions.multiShot = false;

        start();

      }

      // return updated instanceOptions including starting position
      return instanceOptions;

    };

    attachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // attach onposition things, if any, now.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.onPosition(parseInt(item, 10), op[item]);
          }
        }

      }

    };

    detachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // detach any onposition()-style listeners.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.clearOnPosition(parseInt(item, 10));
          }
        }

      }

    };

    start_html5_timer = function() {

      if (s.isHTML5) {
        startTimer(s);
      }

    };

    stop_html5_timer = function() {

      if (s.isHTML5) {
        stopTimer(s);
      }

    };

    resetProperties = function(retainPosition) {

      if (!retainPosition) {
        onPositionItems = [];
        onPositionFired = 0;
      }

      onplay_called = false;

      s._hasTimer = null;
      s._a = null;
      s._html5_canplay = false;
      s.bytesLoaded = null;
      s.bytesTotal = null;
      s.duration = (s._iO && s._iO.duration ? s._iO.duration : null);
      s.durationEstimate = null;
      s.buffered = [];

      // legacy: 1D array
      s.eqData = [];

      s.eqData.left = [];
      s.eqData.right = [];

      s.failures = 0;
      s.isBuffering = false;
      s.instanceOptions = {};
      s.instanceCount = 0;
      s.loaded = false;
      s.metadata = {};

      // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
      s.readyState = 0;

      s.muted = false;
      s.paused = false;

      s.peakData = {
        left: 0,
        right: 0
      };

      s.waveformData = {
        left: [],
        right: []
      };

      s.playState = 0;
      s.position = null;

      s.id3 = {};

    };

    resetProperties();

    /**
     * Pseudo-private SMSound internals
     * --------------------------------
     */

    this._onTimer = function(bForce) {

      /**
       * HTML5-only _whileplaying() etc.
       * called from both HTML5 native events, and polling/interval-based timers
       * mimics flash and fires only when time/duration change, so as to be polling-friendly
       */

      var duration, isNew = false, time, x = {};

      if (s._hasTimer || bForce) {

        // TODO: May not need to track readyState (1 = loading)

        if (s._a && (bForce || ((s.playState > 0 || s.readyState === 1) && !s.paused))) {

          duration = s._get_html5_duration();

          if (duration !== lastHTML5State.duration) {

            lastHTML5State.duration = duration;
            s.duration = duration;
            isNew = true;

          }

          // TODO: investigate why this goes wack if not set/re-set each time.
          s.durationEstimate = s.duration;

          time = (s._a.currentTime * msecScale || 0);

          if (time !== lastHTML5State.time) {

            lastHTML5State.time = time;
            isNew = true;

          }

          if (isNew || bForce) {

            s._whileplaying(time, x, x, x, x);

          }

        }/* else {
          // sm2._wD('_onTimer: Warn for "'+s.id+'": '+(!s._a?'Could not find element. ':'')+(s.playState === 0?'playState bad, 0?':'playState = '+s.playState+', OK'));
          return false;
        }*/

        return isNew;

      }

    };

    this._get_html5_duration = function() {

      var instanceOptions = s._iO,
          // if audio object exists, use its duration - else, instance option duration (if provided - it's a hack, really, and should be retired) OR null
          d = (s._a && s._a.duration ? s._a.duration * msecScale : (instanceOptions && instanceOptions.duration ? instanceOptions.duration : null)),
          result = (d && !isNaN(d) && d !== Infinity ? d : null);

      return result;

    };

    this._apply_loop = function(a, nLoops) {

      /**
       * boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
       * note that loop is either off or infinite under HTML5, unlike Flash which allows arbitrary loop counts to be specified.
       */

      // <d>
      if (!a.loop && nLoops > 1) {
        sm2._wD('Note: Native HTML5 looping is infinite.', 1);
      }
      // </d>

      a.loop = (nLoops > 1 ? 'loop' : '');

    };

    this._setup_html5 = function(oOptions) {

      var instanceOptions = mixin(s._iO, oOptions),
          a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
          dURL = decodeURI(instanceOptions.url),
          sameURL;

      /**
       * "First things first, I, Poppa..." (reset the previous state of the old sound, if playing)
       * Fixes case with devices that can only play one sound at a time
       * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
       */

      if (useGlobalHTML5Audio) {

        if (dURL === decodeURI(lastGlobalHTML5URL)) {
          // global HTML5 audio: re-use of URL
          sameURL = true;
        }

      } else if (dURL === decodeURI(lastURL)) {

        // options URL is the same as the "last" URL, and we used (loaded) it
        sameURL = true;

      }

      if (a) {

        if (a._s) {

          if (useGlobalHTML5Audio) {

            if (a._s && a._s.playState && !sameURL) {

              // global HTML5 audio case, and loading a new URL. stop the currently-playing one.
              a._s.stop();

            }

          } else if (!useGlobalHTML5Audio && dURL === decodeURI(lastURL)) {

            // non-global HTML5 reuse case: same url, ignore request
            s._apply_loop(a, instanceOptions.loops);

            return a;

          }

        }

        if (!sameURL) {

          // don't retain onPosition() stuff with new URLs.

          if (lastURL) {
            resetProperties(false);
          }

          // assign new HTML5 URL

          a.src = instanceOptions.url;

          s.url = instanceOptions.url;

          lastURL = instanceOptions.url;

          lastGlobalHTML5URL = instanceOptions.url;

          a._called_load = false;

        }

      } else {

        if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

          s._a = new Audio(instanceOptions.url);
          s._a.load();

        } else {

          // null for stupid Opera 9.64 case
          s._a = (isOpera && opera.version() < 10 ? new Audio(null) : new Audio());

        }

        // assign local reference
        a = s._a;

        a._called_load = false;

        if (useGlobalHTML5Audio) {

          globalHTML5Audio = a;

        }

      }

      s.isHTML5 = true;

      // store a ref on the track
      s._a = a;

      // store a ref on the audio
      a._s = s;

      add_html5_events();

      s._apply_loop(a, instanceOptions.loops);

      if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

        s.load();

      } else {

        // early HTML5 implementation (non-standard)
        a.autobuffer = false;

        // standard ('none' is also an option.)
        a.preload = 'auto';

      }

      return a;

    };

    add_html5_events = function() {

      if (s._a._added_events) {
        return false;
      }

      var f;

      function add(oEvt, oFn, bCapture) {
        return s._a ? s._a.addEventListener(oEvt, oFn, bCapture || false) : null;
      }

      s._a._added_events = true;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          add(f, html5_events[f]);
        }
      }

      return true;

    };

    remove_html5_events = function() {

      // Remove event listeners

      var f;

      function remove(oEvt, oFn, bCapture) {
        return (s._a ? s._a.removeEventListener(oEvt, oFn, bCapture || false) : null);
      }

      sm2._wD(s.id + ': Removing event listeners');
      s._a._added_events = false;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          remove(f, html5_events[f]);
        }
      }

    };

    /**
     * Pseudo-private event internals
     * ------------------------------
     */

    this._onload = function(nSuccess) {

      var fN,
          // check for duration to prevent false positives from flash 8 when loading from cache.
          loadOK = !!nSuccess || (!s.isHTML5 && fV === 8 && s.duration);

      // <d>
      fN = s.id + ': ';
      sm2._wD(fN + (loadOK ? 'onload()' : 'Failed to load / invalid sound?' + (!s.duration ? ' Zero-length duration reported.' : ' -') + ' (' + s.url + ')'), (loadOK ? 1 : 2));

      if (!loadOK && !s.isHTML5) {
        if (sm2.sandbox.noRemote === true) {
          sm2._wD(fN + str('noNet'), 1);
        }
        if (sm2.sandbox.noLocal === true) {
          sm2._wD(fN + str('noLocal'), 1);
        }
      }
      // </d>

      s.loaded = loadOK;
      s.readyState = (loadOK ? 3 : 2);
      s._onbufferchange(0);

      if (s._iO.onload) {
        wrapCallback(s, function() {
          s._iO.onload.apply(s, [loadOK]);
        });
      }

      return true;

    };

    this._onbufferchange = function(nIsBuffering) {

      if (s.playState === 0) {
        // ignore if not playing
        return false;
      }

      if ((nIsBuffering && s.isBuffering) || (!nIsBuffering && !s.isBuffering)) {
        return false;
      }

      s.isBuffering = (nIsBuffering === 1);
      
      if (s._iO.onbufferchange) {
        sm2._wD(s.id + ': Buffer state change: ' + nIsBuffering);
        s._iO.onbufferchange.apply(s, [nIsBuffering]);
      }

      return true;

    };

    /**
     * Playback may have stopped due to buffering, or related reason.
     * This state can be encountered on iOS < 6 when auto-play is blocked.
     */

    this._onsuspend = function() {

      if (s._iO.onsuspend) {
        sm2._wD(s.id + ': Playback suspended');
        s._iO.onsuspend.apply(s);
      }

      return true;

    };

    /**
     * flash 9/movieStar + RTMP-only method, should fire only once at most
     * at this point we just recreate failed sounds rather than trying to reconnect
     */

    this._onfailure = function(msg, level, code) {

      s.failures++;
      sm2._wD(s.id + ': Failure (' + s.failures + '): ' + msg);

      if (s._iO.onfailure && s.failures === 1) {
        s._iO.onfailure(msg, level, code);
      } else {
        sm2._wD(s.id + ': Ignoring failure');
      }

    };

    /**
     * flash 9/movieStar + RTMP-only method for unhandled warnings/exceptions from Flash
     * e.g., RTMP "method missing" warning (non-fatal) for getStreamLength on server
     */

    this._onwarning = function(msg, level, code) {

      if (s._iO.onwarning) {
        s._iO.onwarning(msg, level, code);
      }

    };

    this._onfinish = function() {

      // store local copy before it gets trashed...
      var io_onfinish = s._iO.onfinish;

      s._onbufferchange(0);
      s._resetOnPosition(0);

      // reset some state items
      if (s.instanceCount) {

        s.instanceCount--;

        if (!s.instanceCount) {

          // remove onPosition listeners, if any
          detachOnPosition();

          // reset instance options
          s.playState = 0;
          s.paused = false;
          s.instanceCount = 0;
          s.instanceOptions = {};
          s._iO = {};
          stop_html5_timer();

          // reset position, too
          if (s.isHTML5) {
            s.position = 0;
          }

        }

        if (!s.instanceCount || s._iO.multiShotEvents) {
          // fire onfinish for last, or every instance
          if (io_onfinish) {
            sm2._wD(s.id + ': onfinish()');
            wrapCallback(s, function() {
              io_onfinish.apply(s);
            });
          }
        }

      }

    };

    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

      var instanceOptions = s._iO;

      s.bytesLoaded = nBytesLoaded;
      s.bytesTotal = nBytesTotal;
      s.duration = Math.floor(nDuration);
      s.bufferLength = nBufferLength;

      if (!s.isHTML5 && !instanceOptions.isMovieStar) {

        if (instanceOptions.duration) {
          // use duration from options, if specified and larger. nobody should be specifying duration in options, actually, and it should be retired.
          s.durationEstimate = (s.duration > instanceOptions.duration) ? s.duration : instanceOptions.duration;
        } else {
          s.durationEstimate = parseInt((s.bytesTotal / s.bytesLoaded) * s.duration, 10);
        }

      } else {

        s.durationEstimate = s.duration;

      }

      // for flash, reflect sequential-load-style buffering
      if (!s.isHTML5) {
        s.buffered = [{
          'start': 0,
          'end': s.duration
        }];
      }

      // allow whileloading to fire even if "load" fired under HTML5, due to HTTP range/partials
      if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) {
        instanceOptions.whileloading.apply(s);
      }

    };

    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

      var instanceOptions = s._iO,
          eqLeft;

      if (isNaN(nPosition) || nPosition === null) {
        // flash safety net
        return false;
      }

      // Safari HTML5 play() may return small -ve values when starting from position: 0, eg. -50.120396875. Unexpected/invalid per W3, I think. Normalize to 0.
      s.position = Math.max(0, nPosition);

      s._processOnPosition();

      if (!s.isHTML5 && fV > 8) {

        if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) {
          s.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }

        if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) {
          s.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }

        if (instanceOptions.useEQData) {
          if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
            eqLeft = oEQData.leftEQ.split(',');
            s.eqData = eqLeft;
            s.eqData.left = eqLeft;
            if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) {
              s.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }

      }

      if (s.playState === 1) {

        // special case/hack: ensure buffering is false if loading from cache (and not yet started)
        if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) {
          s._onbufferchange(0);
        }

        if (instanceOptions.whileplaying) {
          // flash may call after actual finish
          instanceOptions.whileplaying.apply(s);
        }

      }

      return true;

    };

    this._oncaptiondata = function(oData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       *
       * @param {object} oData
       */

      sm2._wD(s.id + ': Caption data received.');

      s.captiondata = oData;

      if (s._iO.oncaptiondata) {
        s._iO.oncaptiondata.apply(s, [oData]);
      }

    };

    this._onmetadata = function(oMDProps, oMDData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       * RTMP may include song title, MovieStar content may include encoding info
       *
       * @param {array} oMDProps (names)
       * @param {array} oMDData (values)
       */

      sm2._wD(s.id + ': Metadata received.');

      var oData = {}, i, j;

      for (i = 0, j = oMDProps.length; i < j; i++) {
        oData[oMDProps[i]] = oMDData[i];
      }

      s.metadata = oData;

      if (s._iO.onmetadata) {
        s._iO.onmetadata.call(s, s.metadata);
      }

    };

    this._onid3 = function(oID3Props, oID3Data) {

      /**
       * internal: flash 8 + flash 9 ID3 feature
       * may include artist, song title etc.
       *
       * @param {array} oID3Props (names)
       * @param {array} oID3Data (values)
       */

      sm2._wD(s.id + ': ID3 data received.');

      var oData = [], i, j;

      for (i = 0, j = oID3Props.length; i < j; i++) {
        oData[oID3Props[i]] = oID3Data[i];
      }

      s.id3 = mixin(s.id3, oData);

      if (s._iO.onid3) {
        s._iO.onid3.apply(s);
      }

    };

    // flash/RTMP-only

    this._onconnect = function(bSuccess) {

      bSuccess = (bSuccess === 1);
      sm2._wD(s.id + ': ' + (bSuccess ? 'Connected.' : 'Failed to connect? - ' + s.url), (bSuccess ? 1 : 2));
      s.connected = bSuccess;

      if (bSuccess) {

        s.failures = 0;

        if (idCheck(s.id)) {
          if (s.getAutoPlay()) {
            // only update the play state if auto playing
            s.play(_undefined, s.getAutoPlay());
          } else if (s._iO.autoLoad) {
            s.load();
          }
        }

        if (s._iO.onconnect) {
          s._iO.onconnect.apply(s, [bSuccess]);
        }

      }

    };

    this._ondataerror = function(sError) {

      // flash 9 wave/eq data handler
      // hack: called at start, and end from flash at/after onfinish()
      if (s.playState > 0) {
        sm2._wD(s.id + ': Data error: ' + sError);
        if (s._iO.ondataerror) {
          s._iO.ondataerror.apply(s);
        }
      }

    };

    // <d>
    this._debug();
    // </d>

  }; // SMSound()

  /**
   * Private SoundManager internals
   * ------------------------------
   */

  getDocument = function() {

    return (doc.body || doc.getElementsByTagName('div')[0]);

  };

  id = function(sID) {

    return doc.getElementById(sID);

  };

  mixin = function(oMain, oAdd) {

    // non-destructive merge
    var o1 = (oMain || {}), o2, o;

    // if unspecified, o2 is the default options object
    o2 = (oAdd === _undefined ? sm2.defaultOptions : oAdd);

    for (o in o2) {

      if (o2.hasOwnProperty(o) && o1[o] === _undefined) {

        if (typeof o2[o] !== 'object' || o2[o] === null) {

          // assign directly
          o1[o] = o2[o];

        } else {

          // recurse through o2
          o1[o] = mixin(o1[o], o2[o]);

        }

      }

    }

    return o1;

  };

  wrapCallback = function(oSound, callback) {

    /**
     * 03/03/2013: Fix for Flash Player 11.6.602.171 + Flash 8 (flashVersion = 8) SWF issue
     * setTimeout() fix for certain SMSound callbacks like onload() and onfinish(), where subsequent calls like play() and load() fail when Flash Player 11.6.602.171 is installed, and using soundManager with flashVersion = 8 (which is the default).
     * Not sure of exact cause. Suspect race condition and/or invalid (NaN-style) position argument trickling down to the next JS -> Flash _start() call, in the play() case.
     * Fix: setTimeout() to yield, plus safer null / NaN checking on position argument provided to Flash.
     * https://getsatisfaction.com/schillmania/topics/recent_chrome_update_seems_to_have_broken_my_sm2_audio_player
     */
    if (!oSound.isHTML5 && fV === 8) {
      window.setTimeout(callback, 0);
    } else {
      callback();
    }

  };

  // additional soundManager properties that soundManager.setup() will accept

  extraOptions = {
    'onready': 1,
    'ontimeout': 1,
    'defaultOptions': 1,
    'flash9Options': 1,
    'movieStarOptions': 1
  };

  assign = function(o, oParent) {

    /**
     * recursive assignment of properties, soundManager.setup() helper
     * allows property assignment based on whitelist
     */

    var i,
        result = true,
        hasParent = (oParent !== _undefined),
        setupOptions = sm2.setupOptions,
        bonusOptions = extraOptions;

    // <d>

    // if soundManager.setup() called, show accepted parameters.

    if (o === _undefined) {

      result = [];

      for (i in setupOptions) {

        if (setupOptions.hasOwnProperty(i)) {
          result.push(i);
        }

      }

      for (i in bonusOptions) {

        if (bonusOptions.hasOwnProperty(i)) {

          if (typeof sm2[i] === 'object') {
            result.push(i + ': {...}');
          } else if (sm2[i] instanceof Function) {
            result.push(i + ': function() {...}');
          } else {
            result.push(i);
          }

        }

      }

      sm2._wD(str('setup', result.join(', ')));

      return false;

    }

    // </d>

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // if not an {object} we want to recurse through...

        if (typeof o[i] !== 'object' || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) {

          // check "allowed" options

          if (hasParent && bonusOptions[oParent] !== _undefined) {

            // valid recursive / nested object option, eg., { defaultOptions: { volume: 50 } }
            sm2[oParent][i] = o[i];

          } else if (setupOptions[i] !== _undefined) {

            // special case: assign to setupOptions object, which soundManager property references
            sm2.setupOptions[i] = o[i];

            // assign directly to soundManager, too
            sm2[i] = o[i];

          } else if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            /**
             * valid extraOptions (bonusOptions) parameter.
             * is it a method, like onready/ontimeout? call it.
             * multiple parameters should be in an array, eg. soundManager.setup({onready: [myHandler, myScope]});
             */

            if (sm2[i] instanceof Function) {

              sm2[i].apply(sm2, (o[i] instanceof Array ? o[i] : [o[i]]));

            } else {

              // good old-fashioned direct assignment
              sm2[i] = o[i];

            }

          }

        } else {

          // recursion case, eg., { defaultOptions: { ... } }

          if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            // recurse through object
            return assign(o[i], i);

          }

        }

      }

    }

    return result;

  };

  function preferFlashCheck(kind) {

    // whether flash should play a given type
    return (sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind]));

  }

  /**
   * Internal DOM2-level event helpers
   * ---------------------------------
   */

  event = (function() {

    // normalize event methods
    var old = (window.attachEvent),
    evt = {
      add: (old ? 'attachEvent' : 'addEventListener'),
      remove: (old ? 'detachEvent' : 'removeEventListener')
    };

    // normalize "on" event prefix, optional capture argument
    function getArgs(oArgs) {

      var args = slice.call(oArgs),
          len = args.length;

      if (old) {
        // prefix
        args[1] = 'on' + args[1];
        if (len > 3) {
          // no capture
          args.pop();
        }
      } else if (len === 3) {
        args.push(false);
      }

      return args;

    }

    function apply(args, sType) {

      // normalize and call the event method, with the proper arguments
      var element = args.shift(),
          method = [evt[sType]];

      if (old) {
        // old IE can't do apply().
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }

    }

    function add() {
      apply(getArgs(arguments), 'add');
    }

    function remove() {
      apply(getArgs(arguments), 'remove');
    }

    return {
      'add': add,
      'remove': remove
    };

  }());

  /**
   * Internal HTML5 event handling
   * -----------------------------
   */

  function html5_event(oFn) {

    // wrap html5 event handlers so we don't call them on destroyed and/or unloaded sounds

    return function(e) {

      var s = this._s,
          result;

      if (!s || !s._a) {
        // <d>
        if (s && s.id) {
          sm2._wD(s.id + ': Ignoring ' + e.type);
        } else {
          sm2._wD(h5 + 'Ignoring ' + e.type);
        }
        // </d>
        result = null;
      } else {
        result = oFn.call(this, e);
      }

      return result;

    };

  }

  html5_events = {

    // HTML5 event-name-to-handler map

    abort: html5_event(function() {

      sm2._wD(this._s.id + ': abort');

    }),

    // enough has loaded to play

    canplay: html5_event(function() {

      var s = this._s,
          position1K;

      if (s._html5_canplay) {
        // this event has already fired. ignore.
        return true;
      }

      s._html5_canplay = true;
      sm2._wD(s.id + ': canplay');
      s._onbufferchange(0);

      // position according to instance options
      position1K = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position/msecScale : null);

      // set the position if position was provided before the sound loaded
      if (this.currentTime !== position1K) {
        sm2._wD(s.id + ': canplay: Setting position to ' + position1K);
        try {
          this.currentTime = position1K;
        } catch(ee) {
          sm2._wD(s.id + ': canplay: Setting position of ' + position1K + ' failed: ' + ee.message, 2);
        }
      }

      // hack for HTML5 from/to case
      if (s._iO._oncanplay) {
        s._iO._oncanplay();
      }

    }),

    canplaythrough: html5_event(function() {

      var s = this._s;

      if (!s.loaded) {
        s._onbufferchange(0);
        s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
        s._onload(true);
      }

    }),

    durationchange: html5_event(function() {

      // durationchange may fire at various times, probably the safest way to capture accurate/final duration.

      var s = this._s,
          duration;

      duration = s._get_html5_duration();

      if (!isNaN(duration) && duration !== s.duration) {

        sm2._wD(this._s.id + ': durationchange (' + duration + ')' + (s.duration ? ', previously ' + s.duration : ''));

        s.durationEstimate = s.duration = duration;

      }

    }),

    // TODO: Reserved for potential use
    /*
    emptied: html5_event(function() {
      sm2._wD(this._s.id + ': emptied');
    }),
    */

    ended: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': ended');

      s._onfinish();

    }),

    error: html5_event(function() {

      sm2._wD(this._s.id + ': HTML5 error, code ' + this.error.code);
      /**
       * HTML5 error codes, per W3C
       * Error 1: Client aborted download at user's request.
       * Error 2: Network error after load started.
       * Error 3: Decoding issue.
       * Error 4: Media (audio file) not supported.
       * Reference: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
       */
      // call load with error state?
      this._s._onload(false);

    }),

    loadeddata: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': loadeddata');

      // safari seems to nicely report progress events, eventually totalling 100%
      if (!s._loaded && !isSafari) {
        s.duration = s._get_html5_duration();
      }

    }),

    loadedmetadata: html5_event(function() {

      sm2._wD(this._s.id + ': loadedmetadata');

    }),

    loadstart: html5_event(function() {

      sm2._wD(this._s.id + ': loadstart');
      // assume buffering at first
      this._s._onbufferchange(1);

    }),

    play: html5_event(function() {

      // sm2._wD(this._s.id + ': play()');
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    playing: html5_event(function() {

      sm2._wD(this._s.id + ': playing ' + String.fromCharCode(9835));
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    progress: html5_event(function(e) {

      // note: can fire repeatedly after "loaded" event, due to use of HTTP range/partials

      var s = this._s,
          i, j, progStr, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,
          // firefox 3.6 implements e.loaded/total (bytes)
          loaded = (e.loaded || 0),
          total = (e.total || 1);

      // reset the "buffered" (loaded byte ranges) array
      s.buffered = [];

      if (ranges && ranges.length) {

        // if loaded is 0, try TimeRanges implementation as % of load
        // https://developer.mozilla.org/en/DOM/TimeRanges

        // re-build "buffered" array
        // HTML5 returns seconds. SM2 API uses msec for setPosition() etc., whether Flash or HTML5.
        for (i = 0, j = ranges.length; i < j; i++) {
          s.buffered.push({
            'start': ranges.start(i) * msecScale,
            'end': ranges.end(i) * msecScale
          });
        }

        // use the last value locally
        buffered = (ranges.end(0) - ranges.start(0)) * msecScale;

        // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
        loaded = Math.min(1, buffered / (e.target.duration * msecScale));

        // <d>
        if (isProgress && ranges.length > 1) {
          progStr = [];
          j = ranges.length;
          for (i = 0; i < j; i++) {
            progStr.push((e.target.buffered.start(i) * msecScale) + '-' + (e.target.buffered.end(i) * msecScale));
          }
          sm2._wD(this._s.id + ': progress, timeRanges: ' + progStr.join(', '));
        }

        if (isProgress && !isNaN(loaded)) {
          sm2._wD(this._s.id + ': progress, ' + Math.floor(loaded * 100) + '% loaded');
        }
        // </d>

      }

      if (!isNaN(loaded)) {

        // TODO: prevent calls with duplicate values.
        s._whileloading(loaded, total, s._get_html5_duration());
        if (loaded && total && loaded === total) {
          // in case "onload" doesn't fire (eg. gecko 1.9.2)
          html5_events.canplaythrough.call(this, e);
        }

      }

    }),

    ratechange: html5_event(function() {

      sm2._wD(this._s.id + ': ratechange');

    }),

    suspend: html5_event(function(e) {

      // download paused/stopped, may have finished (eg. onload)
      var s = this._s;

      sm2._wD(this._s.id + ': suspend');
      html5_events.progress.call(this, e);
      s._onsuspend();

    }),

    stalled: html5_event(function() {

      sm2._wD(this._s.id + ': stalled');

    }),

    timeupdate: html5_event(function() {

      this._s._onTimer();

    }),

    waiting: html5_event(function() {

      var s = this._s;

      // see also: seeking
      sm2._wD(this._s.id + ': waiting');

      // playback faster than download rate, etc.
      s._onbufferchange(1);

    })

  };

  html5OK = function(iO) {

    // playability test based on URL or MIME type

    var result;

    if (!iO || (!iO.type && !iO.url && !iO.serverURL)) {

      // nothing to check
      result = false;

    } else if (iO.serverURL || (iO.type && preferFlashCheck(iO.type))) {

      // RTMP, or preferring flash
      result = false;

    } else {

      // Use type, if specified. Pass data: URIs to HTML5. If HTML5-only mode, no other options, so just give 'er
      result = ((iO.type ? html5CanPlay({type:iO.type}) : html5CanPlay({url:iO.url}) || sm2.html5Only || iO.url.match(/data\:/i)));

    }

    return result;

  };

  html5Unload = function(oAudio) {

    /**
     * Internal method: Unload media, and cancel any current/pending network requests.
     * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
     * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
     * However, Firefox has been seen loading a relative URL from '' and thus requesting the hosting page on unload.
     * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
     */

    var url;

    if (oAudio) {

      // Firefox and Chrome accept short WAVe data: URIs. Chome dislikes audio/wav, but accepts audio/wav for data: MIME.
      // Desktop Safari complains / fails on data: URI, so it gets about:blank.
      url = (isSafari ? emptyURL : (sm2.html5.canPlayType('audio/wav') ? emptyWAV : emptyURL));

      oAudio.src = url;

      // reset some state, too
      if (oAudio._called_unload !== _undefined) {
        oAudio._called_load = false;
      }

    }

    if (useGlobalHTML5Audio) {

      // ensure URL state is trashed, also
      lastGlobalHTML5URL = null;

    }

    return url;

  };

  html5CanPlay = function(o) {

    /**
     * Try to find MIME, test and return truthiness
     * o = {
     *  url: '/path/to/an.mp3',
     *  type: 'audio/mp3'
     * }
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      return false;
    }

    var url = (o.url || null),
        mime = (o.type || null),
        aF = sm2.audioFormats,
        result,
        offset,
        fileExt,
        item;

    // account for known cases like audio/mp3

    if (mime && sm2.html5[mime] !== _undefined) {
      return (sm2.html5[mime] && !preferFlashCheck(mime));
    }

    if (!html5Ext) {
      
      html5Ext = [];
      
      for (item in aF) {
      
        if (aF.hasOwnProperty(item)) {
      
          html5Ext.push(item);
      
          if (aF[item].related) {
            html5Ext = html5Ext.concat(aF[item].related);
          }
      
        }
      
      }
      
      html5Ext = new RegExp('\\.('+html5Ext.join('|')+')(\\?.*)?$','i');
    
    }

    // TODO: Strip URL queries, etc.
    fileExt = (url ? url.toLowerCase().match(html5Ext) : null);

    if (!fileExt || !fileExt.length) {
      
      if (!mime) {
      
        result = false;
      
      } else {
      
        // audio/mp3 -> mp3, result should be known
        offset = mime.indexOf(';');
      
        // strip "audio/X; codecs..."
        fileExt = (offset !== -1 ? mime.substr(0,offset) : mime).substr(6);
      
      }
    
    } else {
    
      // match the raw extension name - "mp3", for example
      fileExt = fileExt[1];
    
    }

    if (fileExt && sm2.html5[fileExt] !== _undefined) {
    
      // result known
      result = (sm2.html5[fileExt] && !preferFlashCheck(fileExt));
    
    } else {
    
      mime = 'audio/' + fileExt;
      result = sm2.html5.canPlayType({type:mime});
    
      sm2.html5[fileExt] = result;
    
      // sm2._wD('canPlayType, found result: ' + result);
      result = (result && sm2.html5[mime] && !preferFlashCheck(mime));
    }

    return result;

  };

  testHTML5 = function() {

    /**
     * Internal: Iterates over audioFormats, determining support eg. audio/mp3, audio/mpeg and so on
     * assigns results to html5[] and flash[].
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
    
      // without HTML5, we need Flash.
      sm2.html5.usingFlash = true;
      needsFlash = true;
    
      return false;
    
    }

    // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
    var a = (Audio !== _undefined ? (isOpera && opera.version() < 10 ? new Audio(null) : new Audio()) : null),
        item, lookup, support = {}, aF, i;

    function cp(m) {

      var canPlay, j,
          result = false,
          isOK = false;

      if (!a || typeof a.canPlayType !== 'function') {
        return result;
      }

      if (m instanceof Array) {
    
        // iterate through all mime types, return any successes
    
        for (i = 0, j = m.length; i < j; i++) {
    
          if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
    
            isOK = true;
            sm2.html5[m[i]] = true;
    
            // note flash support, too
            sm2.flash[m[i]] = !!(m[i].match(flashMIME));
    
          }
    
        }
    
        result = isOK;
    
      } else {
    
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        result = !!(canPlay && (canPlay.match(sm2.html5Test)));
    
      }

      return result;

    }

    // test all registered formats + codecs

    aF = sm2.audioFormats;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        lookup = 'audio/' + item;

        support[item] = cp(aF[item].type);

        // write back generic type too, eg. audio/mp3
        support[lookup] = support[item];

        // assign flash
        if (item.match(flashMIME)) {

          sm2.flash[item] = true;
          sm2.flash[lookup] = true;

        } else {

          sm2.flash[item] = false;
          sm2.flash[lookup] = false;

        }

        // assign result to related formats, too

        if (aF[item] && aF[item].related) {

          for (i = aF[item].related.length - 1; i >= 0; i--) {

            // eg. audio/m4a
            support['audio/' + aF[item].related[i]] = support[item];
            sm2.html5[aF[item].related[i]] = support[item];
            sm2.flash[aF[item].related[i]] = support[item];

          }

        }

      }

    }

    support.canPlayType = (a ? cp : null);
    sm2.html5 = mixin(sm2.html5, support);

    sm2.html5.usingFlash = featureCheck();
    needsFlash = sm2.html5.usingFlash;

    return true;

  };

  strings = {

    // <d>
    notReady: 'Unavailable - wait until onready() has fired.',
    notOK: 'Audio support is not available.',
    domError: sm + 'exception caught while appending SWF to DOM.',
    spcWmode: 'Removing wmode, preventing known SWF loading issue(s)',
    swf404: smc + 'Verify that %s is a valid path.',
    tryDebug: 'Try ' + sm + '.debugFlash = true for more security details (output goes to SWF.)',
    checkSWF: 'See SWF output for more debug info.',
    localFail: smc + 'Non-HTTP page (' + doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
    waitFocus: smc + 'Special case: Waiting for SWF to load with window focus...',
    waitForever: smc + 'Waiting indefinitely for Flash (will recover if unblocked)...',
    waitSWF: smc + 'Waiting for 100% SWF load...',
    needFunction: smc + 'Function object expected for %s',
    badID: 'Sound ID "%s" should be a string, starting with a non-numeric character',
    currentObj: smc + '_debug(): Current sound objects',
    waitOnload: smc + 'Waiting for window.onload()',
    docLoaded: smc + 'Document already loaded',
    onload: smc + 'initComplete(): calling soundManager.onload()',
    onloadOK: sm + '.onload() complete',
    didInit: smc + 'init(): Already called?',
    secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
    badRemove: smc + 'Failed to remove Flash node.',
    shutdown: sm + '.disable(): Shutting down',
    queue: smc + 'Queueing %s handler',
    smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
    fbTimeout: 'No flash response, applying .' + swfCSS.swfTimedout + ' CSS...',
    fbLoaded: 'Flash loaded',
    fbHandler: smc + 'flashBlockHandler()',
    manURL: 'SMSound.load(): Using manually-assigned URL',
    onURL: sm + '.load(): current URL already assigned.',
    badFV: sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
    as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
    noNSLoop: 'Note: Looping not implemented for MovieStar formats',
    needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
    mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
    needFlash: smc + 'Fatal error: Flash is needed to play some required formats, but is not available.',
    gotFocus: smc + 'Got window focus.',
    policy: 'Enabling usePolicyFile for data access',
    setup: sm + '.setup(): allowed parameters: %s',
    setupError: sm + '.setup(): "%s" cannot be assigned with this method.',
    setupUndef: sm + '.setup(): Could not find option "%s"',
    setupLate: sm + '.setup(): url, flashVersion and html5Test property changes will not take effect until reboot().',
    noURL: smc + 'Flash URL required. Call soundManager.setup({url:...}) to get started.',
    sm2Loaded: 'SoundManager 2: Ready. ' + String.fromCharCode(10003),
    reset: sm + '.reset(): Removing event callbacks',
    mobileUA: 'Mobile UA detected, preferring HTML5 by default.',
    globalHTML5: 'Using singleton HTML5 Audio() pattern for this device.',
    ignoreMobile: 'Ignoring mobile restrictions for this device.'
    // </d>

  };

  str = function() {

    // internal string replace helper.
    // arguments: o [,items to replace]
    // <d>

    var args,
        i, j, o,
        sstr;

    // real array, please
    args = slice.call(arguments);

    // first argument
    o = args.shift();

    sstr = (strings && strings[o] ? strings[o] : '');

    if (sstr && args && args.length) {
      for (i = 0, j = args.length; i < j; i++) {
        sstr = sstr.replace('%s', args[i]);
      }
    }

    return sstr;
    // </d>

  };

  loopFix = function(sOpt) {

    // flash 8 requires stream = false for looping to work
    if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      _wDS('as2loop');
      sOpt.stream = false;
    }

    return sOpt;

  };

  policyFix = function(sOpt, sPre) {

    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      sm2._wD((sPre || '') + str('policy'));
      sOpt.usePolicyFile = true;
    }

    return sOpt;

  };

  complain = function(sMsg) {

    // <d>
    if (hasConsole && console.warn !== _undefined) {
      console.warn(sMsg);
    } else {
      sm2._wD(sMsg);
    }
    // </d>

  };

  doNothing = function() {

    return false;

  };

  disableObject = function(o) {

    var oProp;

    for (oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = doNothing;
      }
    }

    oProp = null;

  };

  failSafely = function(bNoDisable) {

    // general failure exception handler

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled || bNoDisable) {
      sm2.disable(bNoDisable);
    }

  };

  normalizeMovieURL = function(smURL) {

    var urlParams = null, url;

    if (smURL) {
      
      if (smURL.match(/\.swf(\?.*)?$/i)) {
      
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
      
        if (urlParams) {
          // assume user knows what they're doing
          return smURL;
        }
      
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
      
        // append trailing slash, if needed
        smURL += '/';
      
      }
    
    }

    url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + sm2.movieURL;

    if (sm2.noSWFCache) {
      url += ('?ts=' + new Date().getTime());
    }

    return url;

  };

  setVersionInfo = function() {

    // short-hand for internal use

    fV = parseInt(sm2.flashVersion, 10);

    if (fV !== 8 && fV !== 9) {
      sm2._wD(str('badFV', fV, defaultFlashVersion));
      sm2.flashVersion = fV = defaultFlashVersion;
    }

    // debug flash movie, if applicable

    var isDebug = (sm2.debugMode || sm2.debugFlash ? '_debug.swf' : '.swf');

    if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
      sm2._wD(str('needfl9'));
      sm2.flashVersion = fV = 9;
    }

    sm2.version = sm2.versionNumber + (sm2.html5Only ? ' (HTML5-only mode)' : (fV === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)'));

    // set up default options
    if (fV > 8) {
    
      // +flash 9 base options
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
      sm2.features.buffering = true;
    
      // +moviestar support
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
      sm2.filePatterns.flash9 = new RegExp('\\.(mp3|' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      sm2.features.movieStar = true;
    
    } else {
    
      sm2.features.movieStar = false;
    
    }

    // regExp for flash canPlay(), etc.
    sm2.filePattern = sm2.filePatterns[(fV !== 8 ? 'flash9' : 'flash8')];

    // if applicable, use _debug versions of SWFs
    sm2.movieURL = (fV === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf').replace('.swf', isDebug);

    sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = (fV > 8);

  };

  setPolling = function(bPolling, bHighPerformance) {

    if (!flash) {
      return false;
    }

    flash._setPolling(bPolling, bHighPerformance);

  };

  initDebug = function() {

    // starts debug mode, creating output <div> for UAs without console object

    // allow force of debug mode via URL
    // <d>
    if (sm2.debugURLParam.test(wl)) {
      sm2.setupOptions.debugMode = sm2.debugMode = true;
    }

    if (id(sm2.debugID)) {
      return false;
    }

    var oD, oDebug, oTarget, oToggle, tmp;

    if (sm2.debugMode && !id(sm2.debugID) && (!hasConsole || !sm2.useConsole || !sm2.consoleOnly)) {

      oD = doc.createElement('div');
      oD.id = sm2.debugID + '-toggle';

      oToggle = {
        'position': 'fixed',
        'bottom': '0px',
        'right': '0px',
        'width': '1.2em',
        'height': '1.2em',
        'lineHeight': '1.2em',
        'margin': '2px',
        'textAlign': 'center',
        'border': '1px solid #999',
        'cursor': 'pointer',
        'background': '#fff',
        'color': '#333',
        'zIndex': 10001
      };

      oD.appendChild(doc.createTextNode('-'));
      oD.onclick = toggleDebug;
      oD.title = 'Toggle SM2 debug console';

      if (ua.match(/msie 6/i)) {
        oD.style.position = 'absolute';
        oD.style.cursor = 'hand';
      }

      for (tmp in oToggle) {
        if (oToggle.hasOwnProperty(tmp)) {
          oD.style[tmp] = oToggle[tmp];
        }
      }

      oDebug = doc.createElement('div');
      oDebug.id = sm2.debugID;
      oDebug.style.display = (sm2.debugMode ? 'block' : 'none');

      if (sm2.debugMode && !id(oD.id)) {
        try {
          oTarget = getDocument();
          oTarget.appendChild(oD);
        } catch(e2) {
          throw new Error(str('domError') + ' \n' + e2.toString());
        }
        oTarget.appendChild(oDebug);
      }

    }

    oTarget = null;
    // </d>

  };

  idCheck = this.getSoundById;

  // <d>
  _wDS = function(o, errorLevel) {

    return (!o ? '' : sm2._wD(str(o), errorLevel));

  };

  toggleDebug = function() {

    var o = id(sm2.debugID),
    oT = id(sm2.debugID + '-toggle');

    if (!o) {
      return false;
    }

    if (debugOpen) {
      // minimize
      oT.innerHTML = '+';
      o.style.display = 'none';
    } else {
      oT.innerHTML = '-';
      o.style.display = 'block';
    }

    debugOpen = !debugOpen;

  };

  debugTS = function(sEventType, bSuccess, sMessage) {

    // troubleshooter debug hooks

    if (window.sm2Debugger !== _undefined) {
      try {
        sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
      } catch(e) {
        // oh well
        return false;
      }
    }

    return true;

  };
  // </d>

  getSWFCSS = function() {

    var css = [];

    if (sm2.debugMode) {
      css.push(swfCSS.sm2Debug);
    }

    if (sm2.debugFlash) {
      css.push(swfCSS.flashDebug);
    }

    if (sm2.useHighPerformance) {
      css.push(swfCSS.highPerf);
    }

    return css.join(' ');

  };

  flashBlockHandler = function() {

    // *possible* flash block situation.

    var name = str('fbHandler'),
        p = sm2.getMoviePercent(),
        css = swfCSS,
        error = {
          type:'FLASHBLOCK'
        };

    if (sm2.html5Only) {
      // no flash, or unused
      return false;
    }

    if (!sm2.ok()) {

      if (needsFlash) {
        // make the movie more visible, so user can fix
        sm2.oMC.className = getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null ? css.swfTimedout : css.swfError);
        sm2._wD(name + ': ' + str('fbTimeout') + (p ? ' (' + str('fbLoaded') + ')' : ''));
      }

      sm2.didFlashBlock = true;

      // fire onready(), complain lightly
      processOnEvents({
        type: 'ontimeout',
        ignoreInit: true,
        error: error
      });

      catchError(error);

    } else {

      // SM2 loaded OK (or recovered)

      // <d>
      if (sm2.didFlashBlock) {
        sm2._wD(name + ': Unblocked');
      }
      // </d>

      if (sm2.oMC) {
        sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock ? ' ' + css.swfUnblocked : '')].join(' ');
      }

    }

  };

  addOnEvent = function(sType, oMethod, oScope) {

    if (on_queue[sType] === _undefined) {
      on_queue[sType] = [];
    }

    on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });

  };

  processOnEvents = function(oOptions) {

    // if unspecified, assume OK/error

    if (!oOptions) {
      oOptions = {
        type: (sm2.ok() ? 'onready' : 'ontimeout')
      };
    }

    if (!didInit && oOptions && !oOptions.ignoreInit) {
      // not ready yet.
      return false;
    }

    if (oOptions.type === 'ontimeout' && (sm2.ok() || (disabled && !oOptions.ignoreInit))) {
      // invalid case
      return false;
    }

    var status = {
          success: (oOptions && oOptions.ignoreInit ? sm2.ok() : !disabled)
        },

        // queue specified by type, or none
        srcQueue = (oOptions && oOptions.type ? on_queue[oOptions.type] || [] : []),

        queue = [], i, j,
        args = [status],
        canRetry = (needsFlash && !sm2.ok());

    if (oOptions.error) {
      args[0].error = oOptions.error;
    }

    for (i = 0, j = srcQueue.length; i < j; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }

    if (queue.length) {
    
      // sm2._wD(sm + ': Firing ' + queue.length + ' ' + oOptions.type + '() item' + (queue.length === 1 ? '' : 's')); 
      for (i = 0, j = queue.length; i < j; i++) {
      
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, args);
        } else {
          queue[i].method.apply(this, args);
        }
      
        if (!canRetry) {
          // useFlashBlock and SWF timeout case doesn't count here.
          queue[i].fired = true;
      
        }
      
      }
    
    }

    return true;

  };

  initUserOnload = function() {

    window.setTimeout(function() {

      if (sm2.useFlashBlock) {
        flashBlockHandler();
      }

      processOnEvents();

      // call user-defined "onload", scoped to window

      if (typeof sm2.onload === 'function') {
        _wDS('onload', 1);
        sm2.onload.apply(window);
        _wDS('onloadOK', 1);
      }

      if (sm2.waitForWindowLoad) {
        event.add(window, 'load', initUserOnload);
      }

    }, 1);

  };

  detectFlash = function() {

    /**
     * Hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau
     * http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt
     */

    if (hasFlash !== _undefined) {
      // this work has already been done.
      return hasFlash;
    }

    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;

    if (nP && nP.length) {
      
      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }
    
    } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
    
      // Windows 8 Store Apps (MSAppHost) are weird (compatibility?) and won't complain here, but will barf if Flash/ActiveX object is appended to the DOM.
      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        // oh well
        obj = null;
      }
      
      hasPlugin = (!!obj);
      
      // cleanup, because it is ActiveX after all
      obj = null;
    
    }

    hasFlash = hasPlugin;

    return hasPlugin;

  };

featureCheck = function() {

    var flashNeeded,
        item,
        formats = sm2.audioFormats,
        // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (original iPad) + iOS4 works.
        isSpecial = (is_iDevice && !!(ua.match(/os (1|2|3_0|3_1)\s/i)));

    if (isSpecial) {

      // has Audio(), but is broken; let it load links directly.
      sm2.hasHTML5 = false;

      // ignore flash case, however
      sm2.html5Only = true;

      // hide the SWF, if present
      if (sm2.oMC) {
        sm2.oMC.style.display = 'none';
      }

    } else {

      if (sm2.useHTML5Audio) {

        if (!sm2.html5 || !sm2.html5.canPlayType) {
          sm2._wD('SoundManager: No HTML5 Audio() support detected.');
          sm2.hasHTML5 = false;
        }

        // <d>
        if (isBadSafari) {
          sm2._wD(smc + 'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - ' + (!hasFlash ? ' would use flash fallback for MP3/MP4, but none detected.' : 'will use flash fallback for MP3/MP4, if available'), 1);
        }
        // </d>

      }

    }

    if (sm2.useHTML5Audio && sm2.hasHTML5) {

      // sort out whether flash is optional, required or can be ignored.

      // innocent until proven guilty.
      canIgnoreFlash = true;

      for (item in formats) {
        
        if (formats.hasOwnProperty(item)) {
        
          if (formats[item].required) {
        
            if (!sm2.html5.canPlayType(formats[item].type)) {
        
              // 100% HTML5 mode is not possible.
              canIgnoreFlash = false;
              flashNeeded = true;
        
            } else if (sm2.preferFlash && (sm2.flash[item] || sm2.flash[formats[item].type])) {
        
              // flash may be required, or preferred for this format.
              flashNeeded = true;
        
            }
        
          }

        }

      }

    }

    // sanity check...
    if (sm2.ignoreFlash) {
      flashNeeded = false;
      canIgnoreFlash = true;
    }

    sm2.html5Only = (sm2.hasHTML5 && sm2.useHTML5Audio && !flashNeeded);

    return (!sm2.html5Only);

  };

  parseURL = function(url) {

    /**
     * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
     * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
     */

    var i, j, urlResult = 0, result;

    if (url instanceof Array) {

      // find the first good one
      for (i = 0, j = url.length; i < j; i++) {

        if (url[i] instanceof Object) {

          // MIME check
          if (sm2.canPlayMIME(url[i].type)) {
            urlResult = i;
            break;
          }

        } else if (sm2.canPlayURL(url[i])) {

          // URL string check
          urlResult = i;
          break;

        }

      }

      // normalize to string
      if (url[urlResult].url) {
        url[urlResult] = url[urlResult].url;
      }

      result = url[urlResult];

    } else {

      // single URL case
      result = url;

    }

    return result;

  };


  startTimer = function(oSound) {

    /**
     * attach a timer to this sound, and start an interval if needed
     */

    if (!oSound._hasTimer) {

      oSound._hasTimer = true;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        if (h5IntervalTimer === null && h5TimerCount === 0) {

          h5IntervalTimer = setInterval(timerExecute, sm2.html5PollingInterval);

        }

        h5TimerCount++;

      }

    }

  };

  stopTimer = function(oSound) {

    /**
     * detach a timer
     */

    if (oSound._hasTimer) {

      oSound._hasTimer = false;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        // interval will stop itself at next execution.

        h5TimerCount--;

      }

    }

  };

  timerExecute = function() {

    /**
     * manual polling for HTML5 progress events, ie., whileplaying()
     * (can achieve greater precision than conservative default HTML5 interval)
     */

    var i;

    if (h5IntervalTimer !== null && !h5TimerCount) {

      // no active timers, stop polling interval.

      clearInterval(h5IntervalTimer);

      h5IntervalTimer = null;

      return false;

    }

    // check all HTML5 sounds with timers

    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {

      if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) {
        sm2.sounds[sm2.soundIDs[i]]._onTimer();
      }

    }

  };

  catchError = function(options) {

    options = (options !== _undefined ? options : {});

    if (typeof sm2.onerror === 'function') {
      sm2.onerror.apply(window, [{
        type: (options.type !== _undefined ? options.type : null)
      }]);
    }

    if (options.fatal !== _undefined && options.fatal) {
      sm2.disable();
    }

  };

  badSafariFix = function() {

    // special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
    if (!isBadSafari || !detectFlash()) {
      // doesn't apply
      return false;
    }

    var aF = sm2.audioFormats, i, item;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        if (item === 'mp3' || item === 'mp4') {

          sm2._wD(sm + ': Using flash fallback for ' + item + ' format');
          sm2.html5[item] = false;

          // assign result to related formats, too
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length - 1; i >= 0; i--) {
              sm2.html5[aF[item].related[i]] = false;
            }
          }

        }

      }

    }

  };

  /**
   * Pseudo-private flash/ExternalInterface methods
   * ----------------------------------------------
   */

  this._setSandboxType = function(sandboxType) {

    // <d>
    // Security sandbox according to Flash plugin
    var sb = sm2.sandbox;

    sb.type = sandboxType;
    sb.description = sb.types[(sb.types[sandboxType] !== _undefined?sandboxType : 'unknown')];

    if (sb.type === 'localWithFile') {

      sb.noRemote = true;
      sb.noLocal = false;
      _wDS('secNote', 2);

    } else if (sb.type === 'localWithNetwork') {

      sb.noRemote = false;
      sb.noLocal = true;

    } else if (sb.type === 'localTrusted') {

      sb.noRemote = false;
      sb.noLocal = false;

    }
    // </d>

  };

  this._externalInterfaceOK = function(swfVersion) {

    // flash callback confirming flash loaded, EI working etc.
    // swfVersion: SWF build string

    if (sm2.swfLoaded) {
      return false;
    }

    var e;

    debugTS('swf', true);
    debugTS('flashtojs', true);
    sm2.swfLoaded = true;
    tryInitOnFocus = false;

    if (isBadSafari) {
      badSafariFix();
    }

    // complain if JS + SWF build/version strings don't match, excluding +DEV builds
    // <d>
    if (!swfVersion || swfVersion.replace(/\+dev/i,'') !== sm2.versionNumber.replace(/\+dev/i, '')) {

      e = sm + ': Fatal: JavaScript file build "' + sm2.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + sm2.url + '. Ensure both are up-to-date.';

      // escape flash -> JS stack so this error fires in window.
      setTimeout(function versionMismatch() {
        throw new Error(e);
      }, 0);

      // exit, init will fail with timeout
      return false;

    }
    // </d>

    // IE needs a larger timeout
    setTimeout(init, isIE ? 100 : 1);

  };

  /**
   * Private initialization helpers
   * ------------------------------
   */

  createMovie = function(smID, smURL) {

    if (didAppend && appendSuccess) {
      // ignore if already succeeded
      return false;
    }

    function initMsg() {

      // <d>

      var options = [],
          title,
          msg = [],
          delimiter = ' + ';

      title = 'SoundManager ' + sm2.version + (!sm2.html5Only && sm2.useHTML5Audio ? (sm2.hasHTML5 ? ' + HTML5 audio' : ', no HTML5 audio support') : '');

      if (!sm2.html5Only) {

        if (sm2.preferFlash) {
          options.push('preferFlash');
        }

        if (sm2.useHighPerformance) {
          options.push('useHighPerformance');
        }

        if (sm2.flashPollingInterval) {
          options.push('flashPollingInterval (' + sm2.flashPollingInterval + 'ms)');
        }

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

        if (sm2.wmode) {
          options.push('wmode (' + sm2.wmode + ')');
        }

        if (sm2.debugFlash) {
          options.push('debugFlash');
        }

        if (sm2.useFlashBlock) {
          options.push('flashBlock');
        }

      } else {

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

      }

      if (options.length) {
        msg = msg.concat([options.join(delimiter)]);
      }

      sm2._wD(title + (msg.length ? delimiter + msg.join(', ') : ''), 1);

      showSupport();

      // </d>

    }

    if (sm2.html5Only) {

      // 100% HTML5 mode
      setVersionInfo();

      initMsg();
      sm2.oMC = id(sm2.movieID);
      init();

      // prevent multiple init attempts
      didAppend = true;

      appendSuccess = true;

      return false;

    }

    // flash path
    var remoteURL = (smURL || sm2.url),
    localURL = (sm2.altURL || remoteURL),
    swfTitle = 'JS/Flash audio component (SoundManager 2)',
    oTarget = getDocument(),
    extraClass = getSWFCSS(),
    isRTL = null,
    html = doc.getElementsByTagName('html')[0],
    oEmbed, oMovie, tmp, movieHTML, oEl, s, x, sClass;

    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (smID === _undefined ? sm2.id : smID);

    function param(name, value) {
      return '<param name="' + name + '" value="' + value + '" />';
    }

    // safety check for legacy (change to Flash 9 URL)
    setVersionInfo();
    sm2.url = normalizeMovieURL(overHTTP ? remoteURL : localURL);
    smURL = sm2.url;

    sm2.wmode = (!sm2.wmode && sm2.useHighPerformance ? 'transparent' : sm2.wmode);

    if (sm2.wmode !== null && (ua.match(/msie 8/i) || (!isIE && !sm2.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      /**
       * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
       * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
       * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
       */
      messages.push(strings.spcWmode);
      sm2.wmode = null;
    }

    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'quality': 'high',
      'allowScriptAccess': sm2.allowScriptAccess,
      'bgcolor': sm2.bgColor,
      'pluginspage': http + 'www.macromedia.com/go/getflashplayer',
      'title': swfTitle,
      'type': 'application/x-shockwave-flash',
      'wmode': sm2.wmode,
      // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
      'hasPriority': 'true'
    };

    if (sm2.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }

    if (!sm2.wmode) {
      // don't write empty attribute
      delete oEmbed.wmode;
    }

    if (isIE) {

      // IE is "special".
      oMovie = doc.createElement('div');
      movieHTML = [
        '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
        param('movie', smURL),
        param('AllowScriptAccess', sm2.allowScriptAccess),
        param('quality', oEmbed.quality),
        (sm2.wmode? param('wmode', sm2.wmode): ''),
        param('bgcolor', sm2.bgColor),
        param('hasPriority', 'true'),
        (sm2.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
        '</object>'
      ].join('');

    } else {

      oMovie = doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }

    }

    initDebug();
    extraClass = getSWFCSS();
    oTarget = getDocument();

    if (oTarget) {

      sm2.oMC = (id(sm2.movieID) || doc.createElement('div'));

      if (!sm2.oMC.id) {

        sm2.oMC.id = sm2.movieID;
        sm2.oMC.className = swfCSS.swfDefault + ' ' + extraClass;
        s = null;
        oEl = null;

        if (!sm2.useFlashBlock) {
          if (sm2.useHighPerformance) {
            // on-screen at all times
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            // hide off-screen, lower priority
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left, 10)) + 'px';
            }
          }
        }

        if (isWebkit) {
          // soundcloud-reported render/crash fix, safari 5
          sm2.oMC.style.zIndex = 10000;
        }

        if (!sm2.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              sm2.oMC.style[x] = s[x];
            }
          }
        }

        try {

          if (!isIE) {
            sm2.oMC.appendChild(oMovie);
          }

          oTarget.appendChild(sm2.oMC);

          if (isIE) {
            oEl = sm2.oMC.appendChild(doc.createElement('div'));
            oEl.className = swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }

          appendSuccess = true;

        } catch(e) {

          throw new Error(str('domError') + ' \n' + e.toString());

        }

      } else {

        // SM2 container is already in the document (eg. flashblock use case)
        sClass = sm2.oMC.className;
        sm2.oMC.className = (sClass ? sClass + ' ' : swfCSS.swfDefault) + (extraClass ? ' ' + extraClass : '');
        sm2.oMC.appendChild(oMovie);

        if (isIE) {
          oEl = sm2.oMC.appendChild(doc.createElement('div'));
          oEl.className = swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }

        appendSuccess = true;

      }

    }

    didAppend = true;

    initMsg();

    // sm2._wD(sm + ': Trying to load ' + smURL + (!overHTTP && sm2.altURL ? ' (alternate URL)' : ''), 1);

    return true;

  };

  initMovie = function() {

    if (sm2.html5Only) {
      createMovie();
      return false;
    }

    // attempt to get, or create, movie (may already exist)
    if (flash) {
      return false;
    }

    if (!sm2.url) {

      /**
       * Something isn't right - we've reached init, but the soundManager url property has not been set.
       * User has not called setup({url: ...}), or has not set soundManager.url (legacy use case) directly before init time.
       * Notify and exit. If user calls setup() with a url: property, init will be restarted as in the deferred loading case.
       */

       _wDS('noURL');
       return false;

    }

    // inline markup case
    flash = sm2.getMovie(sm2.id);

    if (!flash) {

      if (!oRemoved) {

        // try to create
        createMovie(sm2.id, sm2.url);

      } else {

        // try to re-append removed movie after reboot()
        if (!isIE) {
          sm2.oMC.appendChild(oRemoved);
        } else {
          sm2.oMC.innerHTML = oRemovedHTML;
        }

        oRemoved = null;
        didAppend = true;

      }

      flash = sm2.getMovie(sm2.id);

    }

    if (typeof sm2.oninitmovie === 'function') {
      setTimeout(sm2.oninitmovie, 1);
    }

    // <d>
    flushMessages();
    // </d>

    return true;

  };

  delayWaitForEI = function() {

    setTimeout(waitForEI, 1000);

  };

  rebootIntoHTML5 = function() {

    // special case: try for a reboot with preferFlash: false, if 100% HTML5 mode is possible and useFlashBlock is not enabled.

    window.setTimeout(function() {

      complain(smc + 'useFlashBlock is false, 100% HTML5 mode is possible. Rebooting with preferFlash: false...');

      sm2.setup({
        preferFlash: false
      }).reboot();

      // if for some reason you want to detect this case, use an ontimeout() callback and look for html5Only and didFlashBlock == true.
      sm2.didFlashBlock = true;

      sm2.beginDelayedInit();

    }, 1);

  };

  waitForEI = function() {

    var p,
        loadIncomplete = false;

    if (!sm2.url) {
      // No SWF url to load (noURL case) - exit for now. Will be retried when url is set.
      return false;
    }

    if (waitingForEI) {
      return false;
    }

    waitingForEI = true;
    event.remove(window, 'load', delayWaitForEI);

    if (hasFlash && tryInitOnFocus && !isFocused) {
      // Safari won't load flash in background tabs, only when focused.
      _wDS('waitFocus');
      return false;
    }

    if (!didInit) {
      p = sm2.getMoviePercent();
      if (p > 0 && p < 100) {
        loadIncomplete = true;
      }
    }

    setTimeout(function() {

      p = sm2.getMoviePercent();

      if (loadIncomplete) {
        // special case: if movie *partially* loaded, retry until it's 100% before assuming failure.
        waitingForEI = false;
        sm2._wD(str('waitSWF'));
        window.setTimeout(delayWaitForEI, 1);
        return false;
      }

      // <d>
      if (!didInit) {

        sm2._wD(sm + ': No Flash response within expected time. Likely causes: ' + (p === 0 ? 'SWF load failed, ' : '') + 'Flash blocked or JS-Flash security error.' + (sm2.debugFlash ? ' ' + str('checkSWF') : ''), 2);

        if (!overHTTP && p) {

          _wDS('localFail', 2);

          if (!sm2.debugFlash) {
            _wDS('tryDebug', 2);
          }

        }

        if (p === 0) {

          // if 0 (not null), probably a 404.
          sm2._wD(str('swf404', sm2.url), 1);

        }

        debugTS('flashtojs', false, ': Timed out' + (overHTTP ? ' (Check flash security or flash blockers)':' (No plugin/missing SWF?)'));

      }
      // </d>

      // give up / time-out, depending

      if (!didInit && okToDisable) {

        if (p === null) {

          // SWF failed to report load progress. Possibly blocked.

          if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {

            if (sm2.useFlashBlock) {

              flashBlockHandler();

            }

            _wDS('waitForever');

          } else {

            // no custom flash block handling, but SWF has timed out. Will recover if user unblocks / allows SWF load.

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              _wDS('waitForever');

              // fire any regular registered ontimeout() listeners.
              processOnEvents({
                type: 'ontimeout',
                ignoreInit: true,
                error: {
                  type: 'INIT_FLASHBLOCK'
                }
              });

            }

          }

        } else {

          // SWF loaded? Shouldn't be a blocking issue, then.

          if (sm2.flashLoadTimeout === 0) {

            _wDS('waitForever');

          } else {

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              failSafely(true);

            }

          }

        }

      }

    }, sm2.flashLoadTimeout);

  };

  handleFocus = function() {

    function cleanup() {
      event.remove(window, 'focus', handleFocus);
    }

    if (isFocused || !tryInitOnFocus) {
      // already focused, or not special Safari background tab case
      cleanup();
      return true;
    }

    okToDisable = true;
    isFocused = true;
    _wDS('gotFocus');

    // allow init to restart
    waitingForEI = false;

    // kick off ExternalInterface timeout, now that the SWF has started
    delayWaitForEI();

    cleanup();
    return true;

  };

  flushMessages = function() {

    // <d>

    // SM2 pre-init debug messages
    if (messages.length) {
      sm2._wD('SoundManager 2: ' + messages.join(' '), 1);
      messages = [];
    }

    // </d>

  };

  showSupport = function() {

    // <d>

    flushMessages();

    var item, tests = [];

    if (sm2.useHTML5Audio && sm2.hasHTML5) {
      for (item in sm2.audioFormats) {
        if (sm2.audioFormats.hasOwnProperty(item)) {
          tests.push(item + ' = ' + sm2.html5[item] + (!sm2.html5[item] && needsFlash && sm2.flash[item] ? ' (using flash)' : (sm2.preferFlash && sm2.flash[item] && needsFlash ? ' (preferring flash)' : (!sm2.html5[item] ? ' (' + (sm2.audioFormats[item].required ? 'required, ' : '') + 'and no flash support)' : ''))));
        }
      }
      sm2._wD('SoundManager 2 HTML5 support: ' + tests.join(', '), 1);
    }

    // </d>

  };

  initComplete = function(bNoDisable) {

    if (didInit) {
      return false;
    }

    if (sm2.html5Only) {
      // all good.
      _wDS('sm2Loaded', 1);
      didInit = true;
      initUserOnload();
      debugTS('onload', true);
      return true;
    }

    var wasTimeout = (sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent()),
        result = true,
        error;

    if (!wasTimeout) {
      didInit = true;
    }

    error = {
      type: (!hasFlash && needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')
    };

    sm2._wD('SoundManager 2 ' + (disabled ? 'failed to load' : 'loaded') + ' (' + (disabled ? 'Flash security/load error' : 'OK') + ') ' + String.fromCharCode(disabled ? 10006 : 10003), disabled ? 2: 1);

    if (disabled || bNoDisable) {

      if (sm2.useFlashBlock && sm2.oMC) {
        sm2.oMC.className = getSWFCSS() + ' ' + (sm2.getMoviePercent() === null ? swfCSS.swfTimedout : swfCSS.swfError);
      }

      processOnEvents({
        type: 'ontimeout',
        error: error,
        ignoreInit: true
      });

      debugTS('onload', false);
      catchError(error);

      result = false;

    } else {

      debugTS('onload', true);

    }

    if (!disabled) {

      if (sm2.waitForWindowLoad && !windowLoaded) {

        _wDS('waitOnload');
        event.add(window, 'load', initUserOnload);

      } else {

        // <d>
        if (sm2.waitForWindowLoad && windowLoaded) {
          _wDS('docLoaded');
        }
        // </d>

        initUserOnload();

      }

    }

    return result;

  };

  /**
   * apply top-level setupOptions object as local properties, eg., this.setupOptions.flashVersion -> this.flashVersion (soundManager.flashVersion)
   * this maintains backward compatibility, and allows properties to be defined separately for use by soundManager.setup().
   */

  setProperties = function() {

    var i,
        o = sm2.setupOptions;

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // assign local property if not already defined

        if (sm2[i] === _undefined) {

          sm2[i] = o[i];

        } else if (sm2[i] !== o[i]) {

          // legacy support: write manually-assigned property (eg., soundManager.url) back to setupOptions to keep things in sync
          sm2.setupOptions[i] = sm2[i];

        }

      }

    }

  };


  init = function() {

    // called after onload()

    if (didInit) {
      _wDS('didInit');
      return false;
    }

    function cleanup() {
      event.remove(window, 'load', sm2.beginDelayedInit);
    }

    if (sm2.html5Only) {

      if (!didInit) {
        // we don't need no steenking flash!
        cleanup();
        sm2.enabled = true;
        initComplete();
      }

      return true;

    }

    // flash path
    initMovie();

    try {

      // attempt to talk to Flash
      flash._externalInterfaceTest(false);

      /**
       * Apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
       * (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
       */
      setPolling(true, (sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50)));

      if (!sm2.debugMode) {
        // stop the SWF from making debug output calls to JS
        flash._disableDebug();
      }

      sm2.enabled = true;
      debugTS('jstoflash', true);

      if (!sm2.html5Only) {
        // prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
        // http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
        event.add(window, 'unload', doNothing);
      }

    } catch(e) {

      sm2._wD('js/flash exception: ' + e.toString());

      debugTS('jstoflash', false);

      catchError({
        type: 'JS_TO_FLASH_EXCEPTION',
        fatal: true
      });

      // don't disable, for reboot()
      failSafely(true);

      initComplete();

      return false;

    }

    initComplete();

    // disconnect events
    cleanup();

    return true;

  };

  domContentLoaded = function() {

    if (didDCLoaded) {
      return false;
    }

    didDCLoaded = true;

    // assign top-level soundManager properties eg. soundManager.url
    setProperties();

    initDebug();

    if (!hasFlash && sm2.hasHTML5) {

      sm2._wD('SoundManager 2: No Flash detected' + (!sm2.useHTML5Audio ? ', enabling HTML5.' : '. Trying HTML5-only mode.'), 1);

      sm2.setup({
        'useHTML5Audio': true,
        // make sure we aren't preferring flash, either
        // TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
        'preferFlash': false
      });

    }

    testHTML5();

    if (!hasFlash && needsFlash) {

      messages.push(strings.needFlash);

      // TODO: Fatal here vs. timeout approach, etc.
      // hack: fail sooner.
      sm2.setup({
        'flashLoadTimeout': 1
      });

    }

    if (doc.removeEventListener) {
      doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
    }

    initMovie();

    return true;

  };

  domContentLoadedIE = function() {

    if (doc.readyState === 'complete') {
      domContentLoaded();
      doc.detachEvent('onreadystatechange', domContentLoadedIE);
    }

    return true;

  };

  winOnLoad = function() {

    // catch edge case of initComplete() firing after window.load()
    windowLoaded = true;

    // catch case where DOMContentLoaded has been sent, but we're still in doc.readyState = 'interactive'
    domContentLoaded();

    event.remove(window, 'load', winOnLoad);

  };

  // sniff up-front
  detectFlash();

  // focus and window load, init (primarily flash-driven)
  event.add(window, 'focus', handleFocus);
  event.add(window, 'load', delayWaitForEI);
  event.add(window, 'load', winOnLoad);

  if (doc.addEventListener) {

    doc.addEventListener('DOMContentLoaded', domContentLoaded, false);

  } else if (doc.attachEvent) {

    doc.attachEvent('onreadystatechange', domContentLoadedIE);

  } else {

    // no add/attachevent support - safe to assume no JS -> Flash either
    debugTS('onload', false);
    catchError({
      type: 'NO_DOM2_EVENTS',
      fatal: true
    });

  }

} // SoundManager()

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (window.SM2_DEFER === _undefined || !SM2_DEFER) {
  soundManager = new SoundManager();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

if (typeof module === 'object' && module && typeof module.exports === 'object') {

  /**
   * commonJS module
   */

  module.exports.SoundManager = SoundManager;
  module.exports.soundManager = soundManager;

} else if (typeof define === 'function' && define.amd) {

  /**
   * AMD - requireJS
   * basic usage:
   * require(["/path/to/soundmanager2.js"], function(SoundManager) {
   *   SoundManager.getInstance().setup({
   *     url: '/swf/',
   *     onready: function() { ... }
   *   })
   * });
   *
   * SM2_DEFER usage:
   * window.SM2_DEFER = true;
   * require(["/path/to/soundmanager2.js"], function(SoundManager) {
   *   SoundManager.getInstance(function() {
   *     var soundManager = new SoundManager.constructor();
   *     soundManager.setup({
   *       url: '/swf/',
   *       ...
   *     });
   *     ...
   *     soundManager.beginDelayedInit();
   *     return soundManager;
   *   })
   * }); 
   */

  define('soundManager2', [], function() {
    /**
     * Retrieve the global instance of SoundManager.
     * If a global instance does not exist it can be created using a callback.
     *
     * @param {Function} smBuilder Optional: Callback used to create a new SoundManager instance
     * @return {SoundManager} The global SoundManager instance
     */
    function getInstance(smBuilder) {
      if (!window.soundManager && smBuilder instanceof Function) {
        var instance = smBuilder(SoundManager);
        if (instance instanceof SoundManager) {
          window.soundManager = instance;
        }
      }
      return window.soundManager;
    }
    return {
      constructor: SoundManager,
      getInstance: getInstance
    }
  });

}

// standard browser case

// constructor
window.SoundManager = SoundManager;

/**
 * note: SM2 requires a window global due to Flash, which makes calls to window.soundManager.
 * Flash may not always be needed, but this is not known until async init and SM2 may even "reboot" into Flash mode.
 */

// public API, flash callbacks etc.
window.soundManager = soundManager;

}(window));
/* filePath fetchtemp/scripts/liveaudio_template_477aa648.js*/

define("liveaudio#1.0.6/template" , ["artTemplate#3.0.3"] , function(artTemplate){
   artTemplate = new artTemplate();
   var _template = {};
   var layout = [];
   layout.push('<div id={{id}} class=\"liveaudio_container\" style=\"width: {{dur | formatSoundWidth}}%\">')
   layout.push('  <span>{{dur}}”</span>')
   layout.push('</div>')

   _template.layout = artTemplate("layout" , layout.join(''));

   _template.helper = function(name, helper){
      artTemplate.helper(name, helper);
   }
   return _template;
});
/* filePath fetchtemp/scripts/liveaudio_319a8000.js*/

define("liveaudio#1.0.6" , ["F_glue", 'F_WidgetBase', 'jquery#1.8.1', 'soundManager2', "liveaudio#1.0.6/template"],
    function (glue, WidgetBase, $, Soundmanager, template) {
  var soundmanager = Soundmanager.getInstance();
  soundmanager.setup({
    url: 'http://p1.ifengimg.com/386ce73cec45533b/2016/34/soundmanager2_flash9_debug.swf',
    preferFlash: false,
    useFlashBlock: true,
    useConsole: false,
    debugMode: false,
    flashVersion: 9
  });
  soundmanager.useConsole = false;

  template.helper('formatSoundWidth', function (time) {
      var width;
      if (time <= 2) {
          width = 30;
      } else if (time <= 10) {
          width = 30 + (time - 2) * 5;
      } else {
          width = 70 + Math.floor((time - 10) / 10) * 5;
      }
      if (width > 100) {
          width = 100;
      }
      return width;
  });

  var index = 0;
  var activeSound = null;

  var liveaudio = WidgetBase.extend({
    // 版本标识，请勿删除与更改
    version: '1.0.6',
    // 组件类型，请勿删除与更改
    type: 'liveaudio',

    // 创建组件内部数据
    createModel: function () {
      // model声明方式
      // this.modelName = glue.modelFactory.define(function (vm) {
      //   vm.propertyName = '';
      //   vm.arrayPropertyName = [];
      // });
      // 普通属性声明
      this.url = '';
      this.dur = '';
      this.id = 'audio_' + index++;
    },

    // 创建并解析模板
    resolveTemplate: function () {
      // 以jquery为例
      // 使用模板
      this.ownerNode = $(template.layout({dur: this.dur, id: this.id, url: this.url}));
    },

    // 绑定dom事件
    bindDomEvent: function () {
      // 以jquery为例
      var _this = this;
      this.ownerNode.on('click', function (e) {
        _this.play();
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
      // 以jquery为例
      $(this.container).append(this.ownerNode);
    },

    // 创建完成后的处理。
    createComplete: function () {

    },

    // 销毁组件
    destroy: function () {
      liveaudio.superclass.destroy.call(this);
      // 以jquery为例
      // $(this.container).empty();
    },

    play: function () {
      var _this = this;
      if (!this.sound) {
        this.sound = soundManager.createSound({
          id: this.id,
          url: this.url,
          onplay: function () {
            _this.onplay();
          },
          onstop: function () {
            _this.onstop()
          },
          onpause: function () {
            _this.onpause()
          },
          onresume: function () {
            _this.onresume()
          },
          onfinish: function () {
            _this.onfinish()
          }
        });
      }
      if (activeSound && activeSound != this.sound) {
        activeSound.pause();
      }
      activeSound = this.sound;
      if (this.sound.playState == 0) {
        this.sound.play();
      } else if (!this.sound.paused) {
        this.sound.pause();
      } else {
        this.sound.play();
      }
    },
    onplay: function () {
      this.ownerNode.addClass('liveaudio_play').removeClass('liveaudio_pause');
    },
    onstop: function () {
      this.ownerNode.removeClass('liveaudio_play').removeClass('liveaudio_pause');
    },
    onpause: function () {
      this.ownerNode.removeClass('liveaudio_play').addClass('liveaudio_pause');
    },
    onresume: function () {
      this.ownerNode.addClass('liveaudio_play').removeClass('liveaudio_pause');
    },
    onfinish: function () {
      this.ownerNode.removeClass('liveaudio_play').removeClass('liveaudio_pause');
    }


    // 组件内部方法
  });

  return liveaudio;
});
/* filePath fetchtemp/scripts/livepage_core_1cacdd18_05bbff2a.js*/

/* filePath fetchtemp/scripts/LivePage_template_bee214b7.js*/

define("LivePage#1.6.3/template" , ["artTemplate#3.0.3"] , function(artTemplate){
   artTemplate = new artTemplate();
   var _template = {};
   var Skeleton = [];
   Skeleton.push('<div class=\"mod-newsList-box\">')
   Skeleton.push('  <div class=\"js_timelineTop\"></div>')
   Skeleton.push('  ')
   Skeleton.push('  {{include \'statusLine\' $value}}')
   Skeleton.push('  <div class=\"js_timelineContainer\"></div>')
   Skeleton.push('  <div class=\"mod-showMoreBtn\">')
   Skeleton.push('    <span class=\"mod-loading\"></span>')
   Skeleton.push('    <a href=\"##\" class=\"w-wide box_more\"><span class=\"w-txt\">显示更多</span></a>')
   Skeleton.push('  </div>')
   Skeleton.push('<div>')

   _template.Skeleton = artTemplate("Skeleton" , Skeleton.join(''));

   var contentBlock = [];
   contentBlock.push('<div class=\"mod-news-content\">')
   contentBlock.push('    ')
   contentBlock.push('    <div class=\"news-con \">')
   contentBlock.push('        {{if title}}')
   contentBlock.push('        <h3 class=\"news-title\">')
   contentBlock.push('            {{if title_link}}')
   contentBlock.push('              <a href=\"{{title_link}}\" target=\"_blank\">{{#title}}</a>')
   contentBlock.push('            {{else}}')
   contentBlock.push('              <span>{{#title}}</span>')
   contentBlock.push('            {{/if}}')
   contentBlock.push('        </h3>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('        {{if abstract1}}')
   contentBlock.push('        <div class=\"info\">')
   contentBlock.push('            {{if hasContent}}')
   contentBlock.push('                {{#abstract1}}')
   contentBlock.push('                {{if abstract_link}}<a href=\"{{abstract_link}}\" target=\"_blank\">[详细]</a>{{/if}}')
   contentBlock.push('            {{/if}}')
   contentBlock.push('        </div>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('        {{include \'replyContent\' $value}}')
   contentBlock.push('        {{if image && !pictures}}')
   contentBlock.push('        <div class=\"news-pho news-type\" data-mid=\"{{mid}}\" data-image=\"{{image}}\">')
   contentBlock.push('            <span class=\"inner js_p_img\" data-mid=\"{{mid}}\" data-image=\"{{image}}\">')
   contentBlock.push('                <img src=\"{{converImage}}\" alt=\"\">')
   contentBlock.push('            </span>')
   contentBlock.push('        </div>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('        {{if pictures && pictures.length > 1}}')
   contentBlock.push('        <div class=\"news-phos news-phos-{{pictures.length | formatPhotoStyle}}\">')
   contentBlock.push('            {{each pictures as item i}}')
   contentBlock.push('                {{if i < 9}}')
   contentBlock.push('                <div class=\"mod-imgdiv mod-imgdiv-{{i}}\" data-mid={{mid}} style=\"background-image: url({{item.purl}})\"></div>')
   contentBlock.push('                {{/if}}')
   contentBlock.push('            {{/each}}')
   contentBlock.push('        </div>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('        {{if pictures && pictures.length == 1}}')
   contentBlock.push('            <div class=\"news-phos news-phos-{{pictures.length | formatPhotoStyle}}\">')
   contentBlock.push('                {{each pictures as item i}}')
   contentBlock.push('                    <div class=\"mod-imgdiv mod-imgdiv-{{i}}\" data-mid={{mid}} ><img src=\"{{item.purl}}\" border=\"0\" /></div>')
   contentBlock.push('                {{/each}}')
   contentBlock.push('            </div>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('        {{if audio_url}}')
   contentBlock.push('        <div class=\"news-audio\" id=\"audioBox\"></div>')
   contentBlock.push('        <script>')
   contentBlock.push('            new liveaudio(glue).create(\'#audioBox\', {')
   contentBlock.push('              url:\'{{audio_url | formatAudioUrl}}\',')
   contentBlock.push('              dur: {{audio_duration}}')
   contentBlock.push('            });')
   contentBlock.push('            document.getElementById(\'audioBox\').id = \'\';')
   contentBlock.push('        </script>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('        {{if video_image}}')
   contentBlock.push('        <div class=\"news-video  news-type js_p_video\">')
   contentBlock.push('            <a href=\"javascript:void(0)\" class=\"closeVideo\" data-vid=\"{{video_id}}\" ')
   contentBlock.push('               data-mid=\"{{mid}}\" data-isTop=\"{{isTop}}\" style=\"display:none;\">收起</a>')
   contentBlock.push('            <div id=\"{{isTop}}_{{mid}}_{{video_id}}\"></div>')
   contentBlock.push('            <span class=\"inner js_inner js_icon-video\" data-vid=\"{{video_id}}\" data-from=\"{{from}}\" data-uid=\"{{uid}}\" data-mid=\"{{mid}}\" data-isTop=\"{{isTop}}\">')
   contentBlock.push('                <span class=\"icon-video\"></span>')
   contentBlock.push('                <img src=\"{{video_image}}\" alt=\"\">')
   contentBlock.push('                </span>')
   contentBlock.push('        </div>')
   contentBlock.push('        {{/if}}')
   contentBlock.push('    </div>')
   contentBlock.push('    <div class=\"news-bottom-p news-bottom-p-bottom\">')
   contentBlock.push('            <span class=\"time\">{{daytime}}</span>')
   contentBlock.push('            <span class=\"right-btn\"><a href=\"javascript:;\" class=\"share-btn js_share_btn\" data-id=\"{{mid}}\"><span>分享</span></a><a href=\"javascript:void(0);\" class=\"comment-btn comment-btn js_commentArrow\" data-isTop=\"{{isTop}}\" data-id=\"{{mid}}\" data-title=\"{{title}}\"><i class=\"num commentCount_{{mid}}\">0</i><em class=\"txt\">条评论</em></a></span>')
   contentBlock.push('    </div>')
   contentBlock.push('    {{if deviceType != \'mobile\'}} ')
   contentBlock.push('    <div class=\"p-commentBox js_commentContainer\"></div>')
   contentBlock.push('    {{/if}}')
   contentBlock.push('</div>')

   _template.contentBlock = artTemplate("contentBlock" , contentBlock.join(''));

   var moreBtn = [];
   moreBtn.push('<div class=\"mod-showMoreBtn\">')
   moreBtn.push('        <a href=\"##\" class=\"w-wide\"><span class=\"w-txt\">显示更多</span></a>')
   moreBtn.push('        <a href=\"##\" class=\"w-narrow\"><span class=\"w-txt\">加载更多内容</span></a>')
   moreBtn.push('</div>')

   _template.moreBtn = artTemplate("moreBtn" , moreBtn.join(''));

   var newsItem = [];
   newsItem.push('{{each items}}')
   newsItem.push('{{if $value.dateStr}}')
   newsItem.push('<div class=\"mod-lineTitle\">')
   newsItem.push('    <h4 class=\"title\">{{$value.dateStr}}</h4>')
   newsItem.push('</div>')
   newsItem.push('{{/if}}')
   newsItem.push('{{if $value.deviceType == \'mobile\'}}  ')
   newsItem.push('<div class=\"mod-newListConWrap mod-newBlockWithComment js_liveComment\">')
   newsItem.push('<div class=\"mod-news-block clearfix\">')
   newsItem.push('{{else}}')
   newsItem.push('<div class=\"mod-news-block clearfix js_liveComment\">')
   newsItem.push('{{/if}}')
   newsItem.push('    <div class=\"mod-news-time\">')
   newsItem.push('        <span class=\"time\">{{$value.covertime}}</span>')
   newsItem.push('        <span class=\"icon-dot-blue\"></span>')
   newsItem.push('        <div class=\"news-author\">')
   newsItem.push('            {{if $value.user_image}}')
   newsItem.push('            <p class=\"ava-box\">')
   newsItem.push('                {{if $value.user_url}}')
   newsItem.push('                <a href=\"{{$value.user_url}}\" target=\"_blank\" class=\"link\">')
   newsItem.push('                    <img class=\"avatar\" src=\"{{$value.user_image}}\" alt=\"用户\">')
   newsItem.push('                    <span class=\"ava-mask\"></span>')
   newsItem.push('                </a>')
   newsItem.push('                {{else}}')
   newsItem.push('                <span class=\"link\">')
   newsItem.push('                    <img class=\"avatar\" src=\"{{$value.user_image}}\" alt=\"用户\">')
   newsItem.push('                    <span class=\"ava-mask\"></span>')
   newsItem.push('                </span>')
   newsItem.push('                {{/if}}')
   newsItem.push('            </p>')
   newsItem.push('            {{/if}}')
   newsItem.push('            ')
   newsItem.push('            <p class=\"name\">')
   newsItem.push('            {{if $value.user_url}}')
   newsItem.push('                <a href=\"{{$value.user_url}}\" target=\"_blank\" class=\"name-s\">{{$value.user}}</a>')
   newsItem.push('            {{else}}')
   newsItem.push('                 <span class=\"name-s\">{{$value.user}}</span>')
   newsItem.push('            {{/if}}')
   newsItem.push('            </p>')
   newsItem.push('           ')
   newsItem.push('        </div>')
   newsItem.push('    </div>')
   newsItem.push('    {{include \'contentBlock\' $value}}')
   newsItem.push('</div>')
   newsItem.push('{{if $value.deviceType == \'mobile\'}}  ')
   newsItem.push('<div class=\"js_commentContainer\"></div>')
   newsItem.push('</div>')
   newsItem.push('{{/if}}')
   newsItem.push('{{/each}}')

   _template.newsItem = artTemplate("newsItem" , newsItem.join(''));

   var newsListtop = [];
   newsListtop.push('{{each items}}')
   newsListtop.push('{{if $value.deviceType == \'mobile\'}}  ')
   newsListtop.push('<div class=\"mod-newListConWrap mod-newBlockWithComment js_liveComment\">')
   newsListtop.push('<div class=\"mod-news-block mod-newsList-topLine clearfix\">')
   newsListtop.push('{{else}}')
   newsListtop.push('<div class=\"mod-news-block mod-newsList-topLine clearfix js_liveComment\">')
   newsListtop.push('{{/if}}')
   newsListtop.push('    <div class=\"mod-news-time\">')
   newsListtop.push('        <span class=\"title time\"></span>')
   newsListtop.push('    </div>')
   newsListtop.push('    {{include \'contentBlock\' $value}}')
   newsListtop.push('</div>')
   newsListtop.push('{{if $value.deviceType == \'mobile\'}}  ')
   newsListtop.push('<div class=\"p-commentBox js_commentContainer\"></div>')
   newsListtop.push('</div>')
   newsListtop.push('{{/if}}')
   newsListtop.push('{{/each}}')

   _template.newsListtop = artTemplate("newsListtop" , newsListtop.join(''));

   var replyContent = [];
   replyContent.push('{{if hasRelyContent}}')
   replyContent.push('<div class=\"mod-fromNewsBlock\">')
   replyContent.push('    <span class=\"arr\"></span>')
   replyContent.push('    <div class=\"mod-fromNewsBlock-inner\">')
   replyContent.push('        <div class=\"f-txt\">{{#quote_message[0].abstract}}')
   replyContent.push('            {{if quote_message[0].abstract_link}}<a href=\"{{quote_message[0].abstract_link}}\" target=\"_blank\">[详情]</a>{{/if}}')
   replyContent.push('        </div>')
   replyContent.push('        {{if quote_message[0].image}}')
   replyContent.push('        <div class=\"news-pho news-type\" data-mid=\"{{quote_message[0].mid}}\" data-image=\"{{quote_message[0].image}}\">')
   replyContent.push('            <span class=\"inner js_p_img\" data-mid=\"{{quote_message[0].mid}}\" data-image=\"{{quote_message[0].image}}\">')
   replyContent.push('                <img src=\"{{quote_message[0].converImage}}\" alt=\"\">')
   replyContent.push('            </span>')
   replyContent.push('        </div>')
   replyContent.push('        {{/if}}')
   replyContent.push('        {{if quote_message[0].video_image}}')
   replyContent.push('        <div class=\"news-video  news-type reply-news-type js_p_video\">')
   replyContent.push('            <a href=\"javascript:void(0)\" class=\"closeVideo\" data-vid=\"{{quote_message[0].video_id}}\"')
   replyContent.push('               data-mid=\"{{mid}}\" data-isTop=\"{{isTop}}\" style=\"display:none;\">收起</a>')
   replyContent.push('            <div id=\"{{isTop}}_{{mid}}_{{quote_message[0].video_id}}\"></div>')
   replyContent.push('            <span class=\"inner js_inner js_icon-video\" data-vid=\"{{quote_message[0].video_id}}\" data-mid=\"{{mid}}\" data-isTop=\"{{isTop}}\">')
   replyContent.push('                <span class=\"icon-video\"></span>')
   replyContent.push('                <img src=\"{{quote_message[0].video_image}}\" alt=\"\">')
   replyContent.push('            </span>')
   replyContent.push('        </div>')
   replyContent.push('        {{/if}}')
   replyContent.push('        <p class=\"f-time\">{{quote_message[0].coverCtime}}</p>')
   replyContent.push('    </div>')
   replyContent.push('</div>')
   replyContent.push('{{/if}}')

   _template.replyContent = artTemplate("replyContent" , replyContent.join(''));

   var statusLine = [];
   statusLine.push('<div class=\"mod-news-block mod-onAirTitle clearfix\">')
   statusLine.push('    <div class=\"mod-news-time harrow\">')
   statusLine.push('        <span class=\"time title\"></span>')
   statusLine.push('        <span class=\"icon-dot-blue\"></span>')
   statusLine.push('    </div>')
   statusLine.push('    <div class=\"mod-news-content\">')
   statusLine.push('        <div class=\"p-numTips\">')
   statusLine.push('            <p class=\"txt\">')
   statusLine.push('                <a href=\"#\" class=\"refresh-btn js_refresh\"></a>')
   statusLine.push('                {{if deviceType != \'mobile\'}}')
   statusLine.push('                <a href=\"javascript:;\" class=\"sort-btn js_sort\">正序显示</a>')
   statusLine.push('                {{/if}}')
   statusLine.push('                <span class=\"num\">0</span> 人在线')
   statusLine.push('            </p>')
   statusLine.push('        </div>')
   statusLine.push('    </div>')
   statusLine.push('</div>')

   _template.statusLine = artTemplate("statusLine" , statusLine.join(''));

   var timeLine = [];
   timeLine.push('<div class=\"mod-lineTitle\">')
   timeLine.push('    <h4 class=\"title\">{{$value}}</h4>')
   timeLine.push('</div>')

   _template.timeLine = artTemplate("timeLine" , timeLine.join(''));

   _template.helper = function(name, helper){
      artTemplate.helper(name, helper);
   }
   return _template;
});
/* filePath fetchtemp/scripts/LivePage_5769a7fd.js*/

define("LivePage#1.6.3" , ["F_glue" , 'jquery#1.8.1' , 'liveaudio#1.0.6' , 'F_WidgetBase', 'handlebar#1.3.3' , 'liveslide#1.0.7' , 'comment#1.1.14' , 'liveShare#1.0.15' ,'liveVideo#1.1.4' , 'livePic#1.0.9', "LivePage#1.6.3/template"]
        , function(glue , $ , liveaudio, WidgetBase  , Handlebars, LiveSlide , Comment , LiveShare , LiveVideo , LivePic, template ){

    window.liveaudio = liveaudio;
    // handlebars register
    Handlebars.registerHelper('each', function(context, options) {
      var ret = "";
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + options.fn(context[i]);
      }
      return ret;
    });

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

    template.helper('formatPhotoStyle', function (value) {
      if (value == 1) {
        return 1;
      }
      if (value == 2 || value == 4) {
        return 2;
      }
      return 3;
    });

    template.helper('formatAudioUrl', function (url) {
        var houzhui = url.substring(url.lastIndexOf('.') + 1);
        return url.replace('.' + houzhui, '.mp3');
    });

    //end handlebars register

    //当前数据状态
    var currentStatus ={
        headPageNo : -1,  //最前接收的最后的页号
        headPageReceiveLength : 0, //最前接收页号接收的最后一条数据mid
        tailPageNo : 10000000,  //数据尾接收的页号
        tailPageReceiveLength : 0, //数据尾接收的最后一条数据的mid
        topMid :-1,  //最后一次接收的置顶消息
        update : 0   //最后一次接收新数据的更新时间
    };

    var receivingDatas = {}; //接收中的数据
    var reveiveParam = null; //接收到的元数据对象
    var alluserResult = {}; //接收的用户评论数
    //默认是5秒轮询param一次，该数据会根据查询的接口进行变化,f4与cdn的接口轮询周期不一样
    var interval = -1;
    var itemCache = {};  //item id的缓存列表
    var liveslide = null; //图片浏览组件
    var livePic = null; //图片浏览组件
    var liveShare = null;   //分享组件
    var commentCountIdPrefix = 'commentCount_';  //评论数元素的id前缀
    var itemCommentCache = {};   //图文与评论的映射关系
    var runStatus = 'running';   //运行状态， stop | running
    //时间分割线
    var lastItemDate = null; //最后一个比对的时间
    var firstItemDate = null;  //当前页上的第一个item的时间
    var tailDate = null; //最后一个
    var currentVideo = null;
    var lastUpdateTime = null; //最后一次更新时间

    var sortType = "desc"; //排序方式 desc|asc
    var receiveLengthReset = false;  //是否需要重置，这是为currentStatus.tailPageReceiveLength特殊处理
    var total = 0;   //图文直播的总页数

    var LivePage = WidgetBase.extend({

        version : '1.6.3',
        type : 'LivePage',
        /**
         * 创建对象模型
         */
        createModel : function(){
            this.shareClassName = "";
            this.paramError = false;  //数据请求异常
            this.liveSwfUrl = "http://y0.ifengimg.com/swf/ifengFreePlayer_v5.0.71.swf";
            this.model =  glue.modelFactory.define(function(vm){
                vm.metaAddr = ''; //元数据的请求地址
                vm.f4Addr = 'http://rtst.ifeng.com/508df9aec9e2a/data/'; //'http://f4.ifeng.com/508df9aec9e2a/data/';   //数据请求的地址
                vm.liveid  =  -1;     //直播间id
                vm.cdnAddr = 'http://h0.ifengimg.com/508df9aec9e2a/data/';//'http://h0.ifengimg.com/508df9aec9e2a/data/';   //当f4不存在，会直播间关闭时使用的cdn地址
                vm.appSyn = false;
                vm.appAddr = 'http://liveapi.ifeng.com/data/get/'; // 无线数据请求的地址
                vm.livestatus  = 1;   //图文直播的状态 , 1 开启， 0 关闭
                vm.itemList = [];  //图文元素对象列表
                vm.f4Interval = 10000;  //f4请求元数据的间隔
                vm.cdnInterval = 60 * 60 * 1000;  //cdn请求元数据的间隔
                vm.topItem = null;   //头条
                vm.pageSize = 10;  //一页数据的总数
                vm.reqPageSize = 10;  //一次请求的数据数量
                vm.updateMaxTime = 60 * 60 * 1000;
                vm.timeIncrease = 60 * 1000; //递增时间数
                vm.increaseabelRange = 10 * 60 * 1000;  //多长时间没有数据更新时递增时间
                vm.disapTime =  10 * 1000;   //新推送的内容的特效显示时间
                vm.imageServer = "http://d.ifengimg.com";  //图片服务器地址
                vm.imageRatio = 'mw220_mh240';   //图片服务器缩放比例
                vm.picImageRatio = 'mw220_mh240'; //图片组件需要的图片比例
                vm.videoWidth = 400;           //视频播放时的宽度
                vm.videoRatio = 0.75;          //视频比例 默认4:3
                vm.commentServer = "http://comment.ifeng.com/get.php?job=4&format=js&callback=livePage_commentAllUsercallback";  //评论服务器地址
                vm.speUrl = "";
                vm.docName = "";
                vm.docUrl = "";
                vm.showHot = true;
                vm.showLast = true;
                vm.showLastTitle = true;  //是否显示评论头标题
                vm.showHotTitle = true;  //是否显示评论头标题
                vm.hotSize= 10;   //最热评论显示的数量
                vm.lastSize= 10;  //最新评论显示的数量
                vm.showLastMoreBtn = true;
                vm.showHotMoreBtn = true;
                vm.commentTheme = '';
                vm.useComment = true;
                vm.isSpecial = false;
                vm.isFang = false;
                vm.shareTypes = ['sina', 'qq', 'qqzone']; //分享的类型
                vm.shareOrg = 'top';  //分享的显示方向
                vm.commentFllowScroll = false;
                vm.commentNeedLogin = true; //评论是否需要登录
            })
        },

        ////绑定元素中的代理事件
        bindDomEvent : function(){
            var _self = this;

            $(this.container).find(".js_refresh").bind("click" , function(){
               window.location.href = window.location.href;
            });

            $(this.container).find(".js_sort").bind("click" , function(){
                sortType = (sortType == "desc" ? "asc" : "desc");
                $(this).text((sortType == "desc" ? "正序显示" : "降序显示"));
                _self.restart();
                return false;
            })

            $(this.container).find('.mod-loading').hide();
            $(this.container).on('click' , '.box_more' , function(){
                 $(_self.container).find('.mod-loading').show();
                 $(this).hide();
                 var more = $(this);
                 _self.requestMore(function(){
                    $(_self.container).find('.mod-loading').hide();
                    more.show();
                 });
                 return false;
            });

            // 多图代理事件
            $(this.container).on('click', '.mod-imgdiv', function () {
                var list = _self.model.itemList;
                var mid = $(this).data('mid');
                var index = $(this).index();
                var item;
                for (var i = 0, iLen = list.length; i < iLen; i++) {
                    item = list[i];
                    if (list[i].mid == mid) {
                        break;
                    }
                }
                var pics = item.pictures;
                liveslide.show(pics, index);
            });

            $(this.container).on("click" , '.js_p_img' , function(){
                 if(currentVideo != null){
                    $(_self.container).find('.closeVideo').each(function(){
                        if($(this).css('display') != 'none'){
                            var vid = $(this).attr('data-vid');
                            var mid = $(this).attr('data-mid');
                            var isTop = $(this).attr('data-isTop');
                            var id = isTop+'_'+mid+'_'+vid;
                            currentVideo.destroy();
                            currentVideo = null;
                            $(this).hide();
                            $('#'+id).hide();
                            $(this).parents('.js_p_video').find('.js_inner').show();
                        }
                    })
                 }
                 var picSrc = $(this).attr('data-image');
                 if(picSrc != ''){
                    livePic.show(picSrc);
                 }
                 return false;
            });

            //视频代理事件
            $(this.container).on("click" , '.js_icon-video' , function(){
                 //先关闭正在播放的视屏
                 if(currentVideo!=null){
                    currentVideo.destroy();
                    currentVideo = null;
                    $('.js_p_video').find('.js_inner').show();
                    $('.closeVideo').hide()
                 }
                 var vid = $(this).attr('data-vid');
                 var mid = $(this).attr('data-mid');
                 var isTop = $(this).attr('data-isTop');
                 var from = $(this).attr('data-from');
                 var uid = $(this).attr('data-uid');
                 var id = isTop+'_'+mid+'_'+vid;
                 var videoContainer = $('#'+id);
                 videoContainer.show();
                 var vw = _self.model.videoWidth;
                 var vh =  _self.model.videoRatio * vw;
                 currentVideo = new LiveVideo(_self);
                 currentVideo.create(id , {
                    swfUrl: _self.liveSwfUrl,
                    guid: vid,
                    width: vw,
                    height: vh,
                    from: from,
                    uid: uid
                 });
                 $(this).parents('.js_p_video').find('.closeVideo').show();
                 $(this).hide();
            });
            $(this.container).on('click' , '.closeVideo' , function(){
                var vid = $(this).attr('data-vid');
                var mid = $(this).attr('data-mid');
                var isTop = $(this).attr('data-isTop');
                var id = isTop+'_'+mid+'_'+vid;
                if(currentVideo != null){
                  currentVideo.destroy();
                  currentVideo = null;
                }
                $(this).hide();
                $('#'+id).hide();
                $(this).parents('.js_p_video').find('.js_inner').show();
            })
            //展开评论
            $(this.container).on('click' , '.js_commentArrow' , function(){

                var _id = $(this).attr('data-id');
                var title = $(this).attr('data-title');
                var isTop = $(this).attr('data-isTop');
                var id = isTop+'_'+_id;  //置顶与普通的id可能是相同的，通过top防止id重复
                if(itemCommentCache[id] === undefined){
                    var comment = new  Comment(_self);
                    comment.create($(this).parents('.js_liveComment').find('.js_commentContainer')[0] , {
                        'model.docUrl' :  _self.model.speUrl+_id,
                        'model.docName' : title,
                        'model.speUrl' :  '', //_self.model.speUrl, 非专题不需要传递speUrl
                        'model.showHot' : _self.model.showHot,
                        'model.showLast' : _self.model.showLast,
                        'model.useComment' : _self.model.useComment,
                        'model.isSpecial' : _self.model.isSpecial,
                        'model.isFang' : _self.model.isFang,
                        'model.hotSize' : _self.model.hotSize,
                        'model.lastSize': _self.model.lastSize,
                        'model.showLastTitle' : _self.model.showLastTitle,
                        'model.showHotTitle' : _self.model.showHotTitle,
                        'model.showHotMoreBtn' : _self.model.showHotMoreBtn,
                        'model.showLastMoreBtn' : _self.model.showLastMoreBtn,
                        'model.theme' : _self.model.commentTheme,
                        'model.fllowScroll' : _self.model.commentFllowScroll,
                        'model.showLoginBtn' : false,
                        'model.isInner' : true,
                        'model.needLogin' : _self.model.commentNeedLogin,
                        'scrollToDom': $(this).parents('.js_liveComment')
                    });
                    itemCommentCache[id] = comment;
                    $(this).addClass('comment-btn-on');
                    $(this).parents('.news-bottom').find('.p-comment-line-arr').css('display','block');
                    $(this).parents('.js_liveComment').find('.js_commentContainer').addClass('p-commentBox');
                    $(this).parents('.news-bottom-p').removeClass('news-bottom-p-bottom');
                }else{
                    var comment = itemCommentCache[id];
                    if(comment.isHide()){
                        comment.show();
                        $(this).addClass('comment-btn-on');
                        $(this).parents('.news-bottom').find('.p-comment-line-arr').css('display','block');
                        $(this).parents('.js_liveComment').find('.js_commentContainer').addClass('p-commentBox');
                        $(this).parents('.news-bottom-p').removeClass('news-bottom-p-bottom');
                    }else{
                        comment.hide();
                        $(this).removeClass('comment-btn-on');
                        $(this).parents('.news-bottom').find('.p-comment-line-arr').css('display','none');
                        $(this).parents('.js_liveComment').find('.js_commentContainer').removeClass('p-commentBox');
                        $(this).parents('.news-bottom-p').addClass('news-bottom-p-bottom');
                    }
                }
                return false;
            })
            $(this.container).on('click' , '.js_share_btn' , function(){
                $('.js_share_btn').removeClass('share-btn-on');
                var mid = $(this).attr('data-id');
                if(liveShare){
                    if(liveShare.isHide != true){
                         liveShare.hide();
                         return false;
                    }
                    var items = _self.model.itemList;
                    var ret = null;
                    for(var i=0 ; i< items.length; i++){
                        var item = items[i];
                        if(item.mid == mid){
                            ret = item; 
                            break;
                        }
                    }
                    if(item != null){
                        var params = {};
                        params.title = item.title.replace(/<[^>]+>/g , '');
                        params.content = item.abstract.replace(/<[^>]+>/g , '');
                        if(item.image != '' && typeof item.image != 'undefined'){
                            params.pic = item.image;
                        }
                        liveShare.changeContent(params);
                        $(this).addClass('share-btn-on');
                        liveShare.show(this , _self.model.shareOrg);
                    }
                }
                return false;
            });
            $('body').bind('click' , function(){
                if(liveShare){
                    liveShare.hide();
                    $('.js_share_btn').removeClass('share-btn-on');
                }
            });
        },

        /**
         * 绑定事件，可以是数据对象绑定，或者是dom事件绑定
         */
        bindDataEvent : function(){
            var _self = this;
            //置顶消息，推送消息
            this.model.$watch('topItem' , function(newValue){
                 _self.renderTop($('.js_timelineTop') , newValue);
            });
            this.model.itemList.$watch('push'  , function(items){
                //当数据的发生变化时监控，items push的数据，绘制数据
                _self.renderItems($('.js_timelineContainer') , items , false);
            });
            this.model.itemList.$watch('unshift'  , function(items){
                //当数据的发生变化时监控，items push的数据，绘制数据
                _self.renderItems($('.js_timelineContainer') , items , true);
            });

            this.model.itemList.$watch('clear'  , function(){
                //清空数据
                _self.clearItem($('.js_timelineContainer'));
            });

            var live_content = {
                  //获取索引文件成功，服务器端回调函数(data:索引文件数据对象)
                  success: function (data) {
                       reveiveParam = data;
                  },
                  //获取单页数据成功，服务器端回调函数(dataList:单页数据列表 ， pageIndex：文件索引号)
                  singleSuccess: function (dataList , pageIndex) {
                     receivingDatas[pageIndex] = dataList;
                  }
            };
            window.live_content = live_content;
            //注册获取评论数回调事件
            window.livePage_commentAllUsercallback = function(_result){
                var result = null;
                if($.isPlainObject(_result)){
                  result = [_result];
                }else{
                  result = _result;
                }
                if(result != null && result.length){
                    for(var i=0; i<result.length; i++){
                        var resultItem = result[i]
                        alluserResult[resultItem.doc_url] = resultItem.allcount;
                    }
                }
            }
        },

        createComplete : function(){
             if(liveShare == null){
                liveShare = new LiveShare(this);
                liveShare.create(null, {types:this.model.shareTypes , 'cls': this.shareClassName, 'isHide' : true});
             }

             if(liveslide == null){
               liveslide = new LiveSlide(this);
               liveslide.create();
             }

             if(livePic == null){
               livePic = new LivePic(this);
               livePic.create(null, {
                     srcServeUrl : this.model.imageServer,
                     srcRatio : this.model.picImageRatio
               });
             }
             this.requestParam();
        },

        resolveTemplate : function(){
             //var html = compiledTemplate({});
             var html = template.Skeleton({deviceType : glue.device.type});
             this.container.innerHTML = html;
             this.ownerNode = this.container;
        },

        /**
         *  定时请求param数据，请求最新的索引文件
         */
        requestParam : function(){
          var _self = this;
          if(this.model.appSyn){
            
               interval = (interval == -1 ?  this.model.f4Interval : interval);
               this.request(this.model.appAddr + this.getParamUrl() ,
                           function(){
                           },
                           _self.processParamData);        

          } else {
             if(!this.paramError){ //如果有异常则调用cdn
                 interval = (interval == -1 ?  this.model.f4Interval : interval);
                 this.request(this.model.f4Addr + this.getParamUrl() ,
                             function(){
                                interval = this.model.cdnInterval;
                                this.model.livestatus = 0;  //设置为关闭状态
                                this.paramError = true
                                request(this.model.cdnAddr + this.getParamUrl(), function(){
                                    setTimeout(_self.requestParam , interval); //TODO 失败后继续查询，失败多次后需要有策略减少y0服务器的请求
                                }, _self.processParamData)
                             },
                             _self.processParamData);
             }else{
                 //如果是关闭则直接调用cdn地址
                 interval = (interval == -1 ?  this.model.cdnInterval : interval);
                 this.request(this.model.cdnAddr + this.getParamUrl(),
                         function(){
                            setTimeout(_self.requestParam , interval); //TODO 失败后继续查询
                         },
                         _self.processParamData)
             }           
          }

        },


        request : function(requestUrl , errorFn , sucessFn){
            var _self = this;
            $.getScript(requestUrl)
             .done(function( script, textStatus ) {
                 sucessFn.apply(_self);
             })
             .fail(function( jqxhr, settings, exception ) {
                 errorFn.apply(_self);
             });
        },

        /**
         * 得到请求的地址
         */
        getRequestHostAddr : function(){
            var host = '';
            if(this.model.appSyn){
              host = this.model.appAddr;
            } else {
              host = this.model.livestatus == 1 ? this.model.f4Addr : this.model.cdnAddr;
            }
            return host;
        },

        getOrgiInterval : function(){
            var interval = 0;
            if(this.model.appSyn){
              interval = this.model.f4Interval;
            } else {
              interval = this.model.livestatus == 1 ? this.model.f4Interval : this.model.cdnInterval;
            }
            return interval;
        },

        /**
         * 处理请求下来的param数据
         * @param paramData
         *        total    有多少个数据文件(多少页)
         *        status   直播间开启关闭状态，1为开启状态，0为关闭状态
         *        update   数据更新时间，时间戳。（只在创建消息时修改）
         *        topMid   置顶消息ID
         *        topPage  置顶消息所在数据文件页数
         */
        processParamData : function(){
            var _self = this;
            var paramData = reveiveParam;
            reveiveParam = {};
            this.model.livestatus = paramData.status; //设置当前的状态
            if(paramData.status){  //如果当前是正常状态则重置params的请求路径
              this.paramError = false;
            }
            this.setStatus(parseInt(paramData.status));
            if(paramData.onlinecount){  //设置在线人数
              this.setOnlineCount(paramData.onlinecount);
            }
            total = paramData.total;  //当前总数页
            if(currentStatus.update == 0){  //系统初始状态
                   currentStatus.update = paramData.update;
                   var reqPageIndex = []; //请求的数据页面
                   var reqCount = 0;

                   /**
                    * 数据请求
                    * @param pageIndex 请求页
                    * @param nextPageFn 当数据不够时下一页的方法
                    * @param pageIndexConditionFn  判断请求页是否超过最大或最小
                    */
                   var req = function(pageIndex , nextPageFn , pageIndexConditionFn){
                      _self.requestData(pageIndex , function(pageIndex , dataList){
                           reqPageIndex.push(pageIndex);
                           reqCount += dataList.length;
                           if(reqCount >= _self.model.reqPageSize || pageIndexConditionFn(pageIndex)){ //TODO 当升序时不需要
                                //数据已经获取完毕，记录当前请求状态调用显示
                                _self.tailData(reqPageIndex , _self.model.reqPageSize);
                                _self.setTimeoutParam();
                           }else{
                               req(nextPageFn(pageIndex) , nextPageFn , pageIndexConditionFn);
                           }
                      })
                   };
                   if(sortType == "asc"){
                      //升序查询
                      req(1 , function(pageIndex){return pageIndex+1} , function(pageIndex){ return pageIndex+1 > total});
                   }else{
                      //降序查询
                      req(total , function(pageIndex){return pageIndex-1} , function(pageIndex){ return pageIndex-1 < 1});
                   }
                   //req(total); //请求数据
                   _self.processTop(paramData);
            } else if(paramData.update > currentStatus.update && sortType == 'desc'){ //只有时间大于时上次请求才会更新,当升序时不在请求数据
                   currentStatus.update = paramData.update;
                   var reqPageIndex = []; //请求的数据页面
                   interval = _self.getOrgiInterval();
                   lostTime = 0;
                   var req = function(pageIndex , maxTotal){
                      _self.requestData(pageIndex , function(pageIndex , dataList){
                           reqPageIndex.push(pageIndex);
                           if(pageIndex + 1 <= maxTotal){
                               //继续请求页面
                               req(pageIndex + 1 , maxTotal);
                           }else{
                               //没有数据可以获取
                               _self.headData(reqPageIndex)
                               _self.setTimeoutParam();
                           }
                      })
                   };
                   req(currentStatus.headPageNo , total); //请求数据,从最低开始请求
                   _self.processTop(paramData);
            }else{
                //没有数据更新，检查没有更新的时间总量 lostTime > 10 * 60 * 1000 ,
                var curDate = new Date();
                if(lastUpdateTime == null){
                    lastUpdateTime = curDate;
                }else{
                     if(((curDate.getTime() - lastUpdateTime.getTime()) >= _self.model.increaseabelRange) && interval < _self.model.updateMaxTime){
                         interval += _self.model.timeIncrease;
                         lastUpdateTime = curDate;
                     }
                }
                this.setTimeoutParam();
                return;
            }
        },

        requestMore : function(completeFn){
            var _self = this;
            var reqPageIndex = []; //请求的数据页面
            var reqCount = 0;

            var req = function(pageIndex , nextPageFn , pageIndexConditionFn){
               _self.requestData(pageIndex , function(pageIndex , dataList){
                    reqPageIndex.push(pageIndex);
                    reqCount +=   currentStatus.tailPageNo == pageIndex ? dataList.length - currentStatus.tailPageReceiveLength : dataList.length; 
                    if(reqCount > _self.model.reqPageSize || pageIndexConditionFn(pageIndex)){
                         //currentStatus.tailPageNo = pageIndex;
                         //数据已经获取完毕，记录当前请求状态调用显示
                         _self.tailData(reqPageIndex , _self.model.reqPageSize);
                         if(completeFn){
                            completeFn();
                         }
                    }else{
                        req(nextPageFn(pageIndex), nextPageFn , pageIndexConditionFn);
                    }
               })
            };
            if(sortType == "asc"){
               //升序
               req(currentStatus.tailPageNo , function(pageIndex){return pageIndex+1} , function(pageIndex){return pageIndex+1 > total});
            }else{
              //降序
              req(currentStatus.tailPageNo , function(pageIndex){return pageIndex-1} , function(pageIndex){return pageIndex-1<1});
            }
        },

        setTimeoutParam : function(){
            var _self = this;
            if(runStatus != 'stop'){
                setTimeout(function(){
                    _self.requestParam();
                } , interval);
            }
        },

        stop : function(){
             runStatus = 'stop';
        },

        start : function(){
             if(runStatus == 'stop'){
                runStatus = 'running';
                this.requestParam();
             }
        },

        /**
         * 处理置顶信息，使用jquery getScript方式，得到的数据是reveiveParam
         * @param paramData 请求数据的元数据
         */
        processTop : function(paramData){
           //装载指定消息
           var _self = this;
           var hostAdd = this.getRequestHostAddr();
           if(paramData.topMid && (paramData.topMid != currentStatus.topMid)){ //处理置顶消息
               $.getScript(hostAdd+_self.getDataUrl(paramData.topPage)).done(function(){
                     var items = receivingDatas[paramData.topPage];
                     for(var i=0; i<items.length; i++){
                       if(paramData.topMid == items[i].mid){
                           currentStatus.topMid = items[i].mid;
                           _self.model.topItem = items[i];
                           _self.commentAllUser([items[i]]);
                           break;
                       }
                     }
               })
           }
        },

        /**
         * 得到数据
         * @param pageIndex 数据页号
         * @param fn  数据返回后的回调函数
         */
        requestData : function(pageIndex , fn){
             var _self = this;
             var hostAdd = this.getRequestHostAddr();
             $.getScript(hostAdd+_self.getDataUrl(pageIndex)).done(function(){
                  fn(pageIndex , receivingDatas[pageIndex]);
             });
        },

        /**
         * 添加数据到头
         * @param pageIndexs 添加数据的索引页位置列表
         */
        headData : function(pageIndexs){
             var temp = [];
             for(var i=0 ; i<pageIndexs.length ; i++){
                 if(currentStatus.tailPageNo == -1){
                     currentStatus.tailPageNo = pageIndexs[i]  //如果没有设置tailPageNo则初始化
                 }
                 var items = receivingDatas[pageIndexs[i]];
                 items.sort(function(a,b){  //需要升序
                     return a.mid - b.mid
                 });
                 for(var j=0; j<items.length; j++){
                    var item = items[j];
                    if(!itemCache[item.mid]){
                        itemCache[item.mid] = true;
                        temp.push(item);
                    }
                 }
             }
             if(temp.length >0){
                this.model.itemList.unshift.apply(this.model.itemList, temp);
                this.commentAllUser(temp);
             }
        },

        /**
         * 添加数据到尾
         * @param pageIndexs 添加数据的索引页位置列表
         * @param showCount  需要显示的数量
         */
        tailData : function(pageIndexs , showCount){
            var count = 0;
            var temp = [];
            for(var i=0 ; i<pageIndexs.length ; i++){
                 var items = receivingDatas[pageIndexs[i]];

                 if(currentStatus.headPageNo == -1){
                     currentStatus.headPageNo = pageIndexs[i] //如果没有设置headPageNo则初始化
                 }

                 if(sortType == "desc"){
                   for(var j=0; j<items.length; j++){
                      var item = items[j];
                      if(count < showCount //总数控制
                         && ( currentStatus.tailPageNo > pageIndexs[i] || (pageIndexs[i] == currentStatus.tailPageNo && currentStatus.tailPageReceiveLength < j) ) ){
                          currentStatus.tailPageReceiveLength = j;
                          currentStatus.tailPageNo = pageIndexs[i];
                          itemCache[item.mid] = true;
                          temp.push(item);
                          count++;
                      }
                   }
                    if(currentStatus.tailPageNo == 1 && currentStatus.tailPageReceiveLength+1 == receivingDatas[1].length){
                      $('.mod-showMoreBtn').hide();
                    }
                 }else{  //降序需要对数据排序
                    if(currentStatus.tailPageNo == 10000000){
                        currentStatus.tailPageNo = 1;
                    }
                    if(currentStatus.tailPageReceiveLength == 0 && receiveLengthReset == false){
                       currentStatus.tailPageReceiveLength = items.length;
                       receiveLengthReset = true;
                    }

                    for(var j=items.length-1 ; j>=0; j--){
                        if(count < showCount //总数控制
                         && (
                              currentStatus.tailPageNo < pageIndexs[i]
                              || (pageIndexs[i] == currentStatus.tailPageNo
                              && (currentStatus.tailPageReceiveLength > j))
                            )){
                          currentStatus.tailPageReceiveLength = j; //当前文件读的位置
                          currentStatus.tailPageNo = pageIndexs[i];
                          var item = items[j];
                          itemCache[item.mid] = true;
                          temp.push(item);
                          count++;
                        }
                     }
                 }
             }

             if(temp.length > 0){
                this.model.itemList.push.apply(this.model.itemList, temp);
                this.commentAllUser(temp);
             }
        },

        /**
         * 请求用户评论数
         */
        commentAllUser : function(items){
            var _self = this;
            var urls = [];
            for(var i=0; i<items.length; i++){
                var item = items[i];
                urls.push(encodeURIComponent(this.model.speUrl+item.mid));
            }
            var docurls = urls.join('|');
            $.getScript(this.model.commentServer+"&docurl="+docurls).done(function(){
                  for(var i=0; i<items.length; i++){
                      var item = items[i];
                      var alluserItem = alluserResult[_self.model.speUrl+item.mid];
                      var o = $("."+commentCountIdPrefix+item.mid);
                      /*
                      o.each(function(){
                         $(this).text(alluserItem);
                      });
                      */
                      if(o.text){
                        o.text(alluserItem);
                      }
                  }
            });
        },

        replaceImgServer : function(imageAddr){
               if(imageAddr == '') return '';
               return this.model.imageServer+'/'+ this.model.imageRatio + '/' + imageAddr.replace(/http[s]?:\/\// , '');
        },

        getParamUrl : function(){
             return this.model.liveid+'/param.json';
        },

        getDataUrl : function(pageIndex){
             return this.model.liveid+'/'+pageIndex+'.json';
        },

        /**
         * 设置直播间状态
         * @param isActive 是否是有效
         */
        setStatus : function(isActive){
            if(isActive){
              $('.mod-onAirTitle .title').removeClass('finishtitle').addClass('title');
            }else{
              $('.mod-onAirTitle .title').removeClass('title').addClass('finishtitle');
            }
        },

        setOnlineCount : function(onlinecount){
           if(onlinecount){
              $('.mod-onAirTitle .p-numTips .num').text(onlinecount);
           }
        },

        //============================ 页面渲染方法
        /**
         * 重画置顶
         * @param 需要绘制的容器
         */
        renderTop : function(container , itemData , isTop){
            itemData.topclass = 'js_timelineTop';
            itemData.converImage = this.replaceImgServer(itemData.image); //使用图片服务器转换图片大小
            itemData.isTop = 'true';
            itemData.abstract1 = itemData.abstract;
            itemData.hasRelyContent = itemData.quote_message.length>0;
            itemData.deviceType = glue.device.type;
            if(itemData.hasRelyContent){
                itemData.quote_message[0].converImage = this.replaceImgServer(itemData.quote_message[0].image);
                itemData.quote_message[0].covertime = timeHandleNosecond(itemData.quote_message[0].ctime);
            }
            itemData.hasContent =typeof itemData.abstract != 'undefined' &&  itemData.abstract != '';
            itemData.topctime = timeHandle(itemData.ctime);
            itemData.daytime = timeHandleDay(itemData.ctime);
            var html =  template.newsListtop({'items' :[itemData]});
            container.empty();
            container.append(html)
        },

        //排序
        restart : function(){
            //清除数据
            this.model.itemList.clear();
            this.stop(); //停止请求数据
            //重置初始参数
            //当前数据状态
            currentStatus ={
                headPageNo : -1,  //最前接收的最后的页号
                headPageReceiveLength : 0, //最前接收页号接收的最后一条数据mid
                tailPageNo : 10000000,  //数据尾接收的页号
                tailPageReceiveLength : 0, //数据尾接收的最后一条数据的mid
                topMid :-1,  //最后一次接收的置顶消息
                update : 0   //最后一次接收新数据的更新时间
            };

            receivingDatas = {}; //接收中的数据
            reveiveParam = null; //接收到的元数据对象
            alluserResult = {}; //接收的用户评论数
            //默认是5秒轮询param一次，该数据会根据查询的接口进行变化,f4与cdn的接口轮询周期不一样
            interval = -1;
            itemCache = {};  //item id的缓存列表
            commentCountIdPrefix = 'commentCount_';  //评论数元素的id前缀
            itemCommentCache = {};   //图文与评论的映射关系
            //时间分割线
            lastItemDate = null; //最后一个比对的时间
            firstItemDate = null;  //当前页上的第一个item的时间
            tailDate = null; //最后一个
            lastUpdateTime = null; //最后一次更新时间
            receiveLengthReset = false;
            this.start();
        },

        /**
         * 清空列表
         */
        clearItem : function(container){
            container.empty();
            $('.mod-showMoreBtn').show();
        },

        formatPictures: function (pics) {
            var item;
            var url = 'http://d.ifengimg.com/';
            var rat;
            for (var i = 0, iLen = pics.length; i < iLen; i++) {
                item = pics[i];
                if (pics.length == 1) {
                    rat = 'mw480_mh480/'
                } else if (pics.length == 2 || pics.length == 4) {
                    if (item.h / 1 > item.w / 1) {
                        rat = 'w255/';
                    } else {
                        rat = 'h255/';
                    }
                } else {
                    if (item.h / 1 > item.w / 1) {
                        rat = 'w166/';
                    } else {
                        rat = 'h166/';
                    }
                }
                item.purl = url + rat + item.url.split('http://')[1];
            }
            return pics;
        },

        /**
         * 绘制更新的内容
         * @param {Object}contain 需要绘制的容器
         * @param {Array}items 需要绘制的数据
         * @param {boolean}isHead  是否是头部添加
         */
        renderItems : function(container , items , ishead){
            var curDate = new Date();
            var year = curDate.getFullYear()
            var month = curDate.getMonth()+1;
            var date = curDate.getDate();
            var curDateStr = year+'-'+ ((month+'').length == 1 ? '0'+month : month) + '-' +  ((date+'').length == 1 ? '0'+date : date);
            var temp = [];
            for(var i=0; i<items.length; i++){
                var dateStr = getDate(items[i].ctime);
                items[i].isTop = 'false';
                items[i].abstract1 =  items[i].abstract;
                items[i].converImage = this.replaceImgServer(items[i].image); //使用图片服务器转换图片大小
                items[i].covertime = timeHandle(items[i].ctime);
                items[i].daytime = timeHandleDay(items[i].ctime);
                items[i].hasRelyContent = items[i].quote_message.length>0;
                items[i].hasContent =typeof items[i].abstract != 'undefined' &&  items[i].abstract != '';
                items[i].deviceType = glue.device.type;
                items[i].from = items[i].from;
                items[i].uid = items[i].ugcuid;

                if(items[i].hasRelyContent){
                    items[i].quote_message[0].converImage = this.replaceImgServer(items[i].quote_message[0].image);
                    items[i].quote_message[0].coverCtime = timeHandleNosecond(items[i].quote_message[0].ctime);
                }
                items[i].converVedioImage = this.replaceImgServer(items[i].video_image);
                if(ishead){
                   items[i].isTop = false;
                   items[i].ishead = true;
                }
                if((typeof lastItemDate == 'undefined' || dateStr != lastItemDate) && dateStr != curDateStr){
                    items[i].dateStr = dateStr;
                    lastItemDate = dateStr;
                }

                if (items[i].pictures && items[i].pictures.length > 0) {
                    items[i].pictures = this.formatPictures(items[i].pictures);
                }

                temp.push(items[i]);
            }
            if(temp.length == 0) return;
            var html = template.newsItem({'items' : temp})
            if(ishead){
                container.children().first().before(html);
                var st = function(){
                    setTimeout(function(){
                        if($('.mod-news-block-new').length == 0){
                            st();
                        }else{
                           $('.mod-news-block-new').removeClass('mod-news-block-new');
                        }
                    }, 5000)
                };
                st();
            }else{
                container.append(html);
            }
        }
    });

    //事件格式化
    var timeHandle = function (time) {
        try {
          var hmsStr = time.split(' ')[1];
          var hmsArr = hmsStr.split(':');
          hmsArr.length = 2;
          return hmsArr.join(':');
        } catch (e) {
          return time;
        }
    };

    //事件格式化
    var timeHandleNosecond = function (time) {
        try {
          return time.substring(0 , time.lastIndexOf(':'));
        } catch (e) {
          return time;
        }
    };

    //事件格式化
    var timeHandleDay = function (time) {
        try {
          return time.substring(0 , time.lastIndexOf(' '));
        } catch (e) {
          return time;
        }
    };

    var getDate = function(time){
        if(glue.device.type == 'mobile' ){
          var dateArray = time.split(' ')[0].split('-');
          dateArray.shift();
          return dateArray.join('/');
        }else{
          return time.split(' ')[0].split('-').join('/');
        }
    }


    return LivePage;
});
