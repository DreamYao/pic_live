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
                ? compile(content, {
                filename: filename
            })
                : renderFile(filename, content);
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

        };
        /**
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

            function render(data) {

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
        function getVariable(code) {
            return code
                .replace(REMOVE_RE, '')
                .replace(SPLIT_RE, ',')
                .replace(KEYWORDS_RE, '')
                .replace(NUMBER_RE, '')
                .replace(BOUNDARY_RE, '')
                .split(/^$|,+/);
        };


        // 字符串转义
        function stringify(code) {
            return "'" + code
                    // 单引号与反斜杠转义
                    .replace(/('|\\)/g, '\\$1')
                    // 换行符转义(windows + linux)
                    .replace(/\r/g, '\\r')
                    .replace(/\n/g, '\\n') + "'";
        }


        function compiler(source, options) {

            var debug = options.debug;
            var openTag = options.openTag;
            var closeTag = options.closeTag;
            var parser = options.parser;
            var compress = options.compress;
            var escape = options.escape;


            var line = 1;
            var uniq = {$data: 1, $filename: 1, $utils: 1, $helpers: 1, $out: 1, $line: 1};


            var isNewEngine = ''.trim;// '__proto__' in {}
            var replaces = isNewEngine
                ? ["$out='';", "$out+=", ";", "$out"]
                : ["$out=[];", "$out.push(", ");", "$out.join('')"];

            var concat = isNewEngine
                ? "$out+=text;return $out;"
                : "$out.push(text);";

            var print = "function(){"
                + "var text=''.concat.apply('',arguments);"
                + concat
                + "}";

            var include = "function(filename,data){"
                + "data=data||$data;"
                + "var text=$utils.$include(filename,data,$filename);"
                + concat
                + "}";

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
                    + "throw {"
                    + "filename:$filename,"
                    + "name:'Render Error',"
                    + "message:e.message,"
                    + "line:$line,"
                    + "source:" + stringify(source)
                    + ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
                    + "};"
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
            function html(code) {

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
            function logic(code) {

                var thisLine = line;

                if (parser) {

                    // 语法转换插件钩子
                    code = parser(code, options);

                } else if (debug) {

                    // 记录行号
                    code = code.replace(/\n/g, function () {
                        line++;
                        return "$line=" + line + ";";
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
                    var as = split[1] || 'as';
                    var value = split[2] || '$value';
                    var index = split[3] || '$index';

                    var param = value + ',' + index;

                    if (as !== 'as') {
                        object = '[]';
                    }

                    code = '$each(' + object + ',function(' + param + '){';
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

                        for (; i < len; i++) {
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
        define('artTemplate#3.0.3', [], function () {
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

define("livesurvey#1.0.6/template", ["artTemplate#3.0.3"], function (artTemplate) {
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

    _template.surveyForm = artTemplate("surveyForm", surveyForm.join(''));

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

    _template.surveyResult = artTemplate("surveyResult", surveyResult.join(''));

    _template.helper = function (name, helper) {
        artTemplate.helper(name, helper);
    }
    return _template;
});
/* filePath fetchtemp/scripts/livesurvey_0616545b.js*/

define("livesurvey#1.0.6", ["F_glue", 'F_WidgetBase', "livesurvey#1.0.6/template", 'jquery#1.8.1'],
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
                this.container.on('click', '#surveySubmit', function () {

                    var qid = parseInt(_this.container.find('a[data-id]').data('id'));
                    var aid = [];
                    var aDomList = _this.container.find('input[data-id]');

                    for (var i = 0, len = aDomList.length; i < len; i++) {
                        if (aDomList[i].checked) {
                            aid.push(parseInt(aDomList.eq(i).data('id')));
                        }
                    }

                    var answer = 'sur[' + qid + '][]';
                    var params = {
                        'format': 'js',
                        'surveyid': _this.surveyId,
                        'callback': 'voteSurvey'
                    };

                    if (aid.length == 0) { // 如果用户未作选择
                        window.alert('您没有投票哦～');
                    } else {

                        params[answer] = aid.join(',');
                        $.ajax({
                            url: _this.pollSurveyUrl,
                            dataType: 'jsonp',
                            data: params,
                            jsonp: 'callback',
                            jsonpCallback: 'voteSurvey',
                            cache: false,
                            success: function (surveyJson) {
                                if (surveyJson && surveyJson.ifsuccess) {
                                    _this.getAndRenderSurveyResult();

                                }
                            }

                        });
                    }


                    return false;
                });

                // 如果选择直接查看结果，不再重新请求数据，使用页面加载时的数据渲染
                this.container.on('click', '#viewResult', function () {
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

            getAndRenderSurveyForm: function () {

                var _this = this;

                var params = {
                    'format': 'js',
                    'surveyid': this.surveyId,
                    'callback': 'renderSurveyForm'
                };

                $.ajax({
                    url: this.showSurveyUrl,
                    dataType: 'jsonp',
                    data: params,
                    jsonp: 'callback',
                    jsonpCallback: 'renderSurveyForm',
                    cache: false,
                    success: function (surveyJson) {
                        _this.renderSurveyForm(surveyJson);

                    }
                });
            },

            getAndRenderSurveyResult: function () {

                var _this = this;

                var params = {
                    'format': 'js',
                    'surveyid': this.surveyId,
                    'callback': 'renderSurveyResult'
                };

                $.ajax({
                    url: this.showSurveyUrl,
                    dataType: 'jsonp',
                    data: params,
                    jsonp: 'callback',
                    jsonpCallback: 'renderSurveyResult',
                    cache: false,
                    success: function (surveyJson) {
                        _this.renderSurveyResult(surveyJson);
                    }
                });
            },

            renderSurveyForm: function (surveyJson) {

                if (surveyJson && surveyJson.ifsuccess) {
                    this.surveyJson = surveyJson;
                    var data = surveyJson.data.result;
                    if (data.length > 0) { // 该调查最少有一个问题
                        var questionObj = data[0];
                        questionObj.chooseType = questionObj.choosetype == 'single' ? 'radio' : 'checkbox';
                        questionObj.className = questionObj.choosetype == 'single' ? 'dx' : 'fx';
                        questionObj.chooseTypeZh = questionObj.choosetype == 'single' ? '' : '（多选）';
                        questionObj.url = this.surveyUrlPrefix + surveyJson.data.surveyinfo.channel + '/' + this.surveyId + '.html';

                        // 渲染后填入调查dom

                        this.container.html(template.surveyForm({questionObj: questionObj}));
                    }

                }
            },

            renderSurveyResult: function (surveyJson) {

                if (surveyJson && surveyJson.ifsuccess) {
                    var data = surveyJson.data.result;
                    if (data.length > 0) { // 该调查最少有一个问题
                        var questionObj = data[0];
                        questionObj.chooseTypeZh = questionObj.choosetype == 'single' ? '' : '（多选）';
                        questionObj.url = this.surveyUrlPrefix + surveyJson.data.surveyinfo.channel + '/' + this.surveyId + '.html';
                        // 渲染后填入调查dom
                        this.container.html(template.surveyResult({questionObj: questionObj}));
                    }
                }
            }



            // 组件内部方法
        });

        return livesurvey;
    });
/* filePath fetchtemp/scripts/handlebars_9705c7d9.js*/

define("handlebar#1.3.3", [], function () {
    var t = function () {
        var t = function () {
            "use strict";
            function t(t) {
                this.string = t
            }

            var e;
            return t.prototype.toString = function () {
                return "" + this.string
            }, e = t
        }(), e = function (t) {
            "use strict";
            function e(t) {
                return a[t] || "&amp;"
            }

            function i(t, e) {
                for (var i in e)Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i])
            }

            function n(t) {
                return t instanceof o ? t.toString() : t || 0 === t ? (t = "" + t, c.test(t) ? t.replace(h, e) : t) : ""
            }

            function r(t) {
                return t || 0 === t ? u(t) && 0 === t.length ? !0 : !1 : !0
            }

            var s = {}, o = t, a = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "`": "&#x60;"
            }, h = /[&<>"'`]/g, c = /[&<>"'`]/;
            s.extend = i;
            var p = Object.prototype.toString;
            s.toString = p;
            var l = function (t) {
                return "function" == typeof t
            };
            l(/x/) && (l = function (t) {
                return "function" == typeof t && "[object Function]" === p.call(t)
            });
            var l;
            s.isFunction = l;
            var u = Array.isArray || function (t) {
                    return t && "object" == typeof t ? "[object Array]" === p.call(t) : !1
                };
            return s.isArray = u, s.escapeExpression = n, s.isEmpty = r, s
        }(t), i = function () {
            "use strict";
            function t(t, e) {
                var n;
                e && e.firstLine && (n = e.firstLine, t += " - " + n + ":" + e.firstColumn);
                for (var r = Error.prototype.constructor.call(this, t), s = 0; s < i.length; s++)this[i[s]] = r[i[s]];
                n && (this.lineNumber = n, this.column = e.firstColumn)
            }

            var e, i = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
            return t.prototype = new Error, e = t
        }(), n = function (t, e) {
            "use strict";
            function i(t, e) {
                this.helpers = t || {}, this.partials = e || {}, n(this)
            }

            function n(t) {
                t.registerHelper("helperMissing", function (t) {
                    if (2 === arguments.length)return void 0;
                    throw new a("Missing helper: '" + t + "'")
                }), t.registerHelper("blockHelperMissing", function (e, i) {
                    var n = i.inverse || function () {
                        }, r = i.fn;
                    return u(e) && (e = e.call(this)), e === !0 ? r(this) : e === !1 || null == e ? n(this) : l(e) ? e.length > 0 ? t.helpers.each(e, i) : n(this) : r(e)
                }), t.registerHelper("each", function (t, e) {
                    var i, n = e.fn, r = e.inverse, s = 0, o = "";
                    if (u(t) && (t = t.call(this)), e.data && (i = g(e.data)), t && "object" == typeof t)if (l(t))for (var a = t.length; a > s; s++)i && (i.index = s, i.first = 0 === s, i.last = s === t.length - 1), o += n(t[s], {data: i}); else for (var h in t)t.hasOwnProperty(h) && (i && (i.key = h, i.index = s, i.first = 0 === s), o += n(t[h], {data: i}), s++);
                    return 0 === s && (o = r(this)), o
                }), t.registerHelper("if", function (t, e) {
                    return u(t) && (t = t.call(this)), !e.hash.includeZero && !t || o.isEmpty(t) ? e.inverse(this) : e.fn(this)
                }), t.registerHelper("unless", function (e, i) {
                    return t.helpers["if"].call(this, e, {fn: i.inverse, inverse: i.fn, hash: i.hash})
                }), t.registerHelper("with", function (t, e) {
                    return u(t) && (t = t.call(this)), o.isEmpty(t) ? void 0 : e.fn(t)
                }), t.registerHelper("log", function (e, i) {
                    var n = i.data && null != i.data.level ? parseInt(i.data.level, 10) : 1;
                    t.log(n, e)
                })
            }

            function r(t, e) {
                m.log(t, e)
            }

            var s = {}, o = t, a = e, h = "1.3.0";
            s.VERSION = h;
            var c = 4;
            s.COMPILER_REVISION = c;
            var p = {1: "<= 1.0.rc.2", 2: "== 1.0.0-rc.3", 3: "== 1.0.0-rc.4", 4: ">= 1.0.0"};
            s.REVISION_CHANGES = p;
            var l = o.isArray, u = o.isFunction, f = o.toString, d = "[object Object]";
            s.HandlebarsEnvironment = i, i.prototype = {
                constructor: i,
                logger: m,
                log: r,
                registerHelper: function (t, e, i) {
                    if (f.call(t) === d) {
                        if (i || e)throw new a("Arg not supported with multiple helpers");
                        o.extend(this.helpers, t)
                    } else i && (e.not = i), this.helpers[t] = e
                },
                registerPartial: function (t, e) {
                    f.call(t) === d ? o.extend(this.partials, t) : this.partials[t] = e
                }
            };
            var m = {
                methodMap: {0: "debug", 1: "info", 2: "warn", 3: "error"},
                DEBUG: 0,
                INFO: 1,
                WARN: 2,
                ERROR: 3,
                level: 3,
                log: function (t, e) {
                    if (m.level <= t) {
                        var i = m.methodMap[t];
                        "undefined" != typeof console && console[i] && console[i].call(console, e)
                    }
                }
            };
            s.logger = m, s.log = r;
            var g = function (t) {
                var e = {};
                return o.extend(e, t), e
            };
            return s.createFrame = g, s
        }(e, i), r = function (t, e, i) {
            "use strict";
            function n(t) {
                var e = t && t[0] || 1, i = u;
                if (e !== i) {
                    if (i > e) {
                        var n = f[i], r = f[e];
                        throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + n + ") or downgrade your runtime to an older version (" + r + ").")
                    }
                    throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + t[1] + ").")
                }
            }

            function r(t, e) {
                if (!e)throw new l("No environment passed to template");
                var i = function (t, i, n, r, s, o) {
                    var a = e.VM.invokePartial.apply(this, arguments);
                    if (null != a)return a;
                    if (e.compile) {
                        var h = {helpers: r, partials: s, data: o};
                        return s[i] = e.compile(t, {data: void 0 !== o}, e), s[i](n, h)
                    }
                    throw new l("The partial " + i + " could not be compiled when running in runtime-only mode")
                }, n = {
                    escapeExpression: p.escapeExpression,
                    invokePartial: i,
                    programs: [],
                    program: function (t, e, i) {
                        var n = this.programs[t];
                        return i ? n = o(t, e, i) : n || (n = this.programs[t] = o(t, e)), n
                    },
                    merge: function (t, e) {
                        var i = t || e;
                        return t && e && t !== e && (i = {}, p.extend(i, e), p.extend(i, t)), i
                    },
                    programWithDepth: e.VM.programWithDepth,
                    noop: e.VM.noop,
                    compilerInfo: null
                };
                return function (i, r) {
                    r = r || {};
                    var s, o, a = r.partial ? r : e;
                    r.partial || (s = r.helpers, o = r.partials);
                    var h = t.call(n, a, i, s, o, r.data);
                    return r.partial || e.VM.checkRevision(n.compilerInfo), h
                }
            }

            function s(t, e, i) {
                var n = Array.prototype.slice.call(arguments, 3), r = function (t, r) {
                    return r = r || {}, e.apply(this, [t, r.data || i].concat(n))
                };
                return r.program = t, r.depth = n.length, r
            }

            function o(t, e, i) {
                var n = function (t, n) {
                    return n = n || {}, e(t, n.data || i)
                };
                return n.program = t, n.depth = 0, n
            }

            function a(t, e, i, n, r, s) {
                var o = {partial: !0, helpers: n, partials: r, data: s};
                if (void 0 === t)throw new l("The partial " + e + " could not be found");
                return t instanceof Function ? t(i, o) : void 0
            }

            function h() {
                return ""
            }

            var c = {}, p = t, l = e, u = i.COMPILER_REVISION, f = i.REVISION_CHANGES;
            return c.checkRevision = n, c.template = r, c.programWithDepth = s, c.program = o, c.invokePartial = a, c.noop = h, c
        }(e, i, n), s = function (t, e, i, n, r) {
            "use strict";
            var s, o = t, a = e, h = i, c = n, p = r, l = function () {
                var t = new o.HandlebarsEnvironment;
                return c.extend(t, o), t.SafeString = a, t.Exception = h, t.Utils = c, t.VM = p, t.template = function (e) {
                    return p.template(e, t)
                }, t
            }, u = l();
            return u.create = l, s = u
        }(n, t, i, e, r), o = function (t) {
            "use strict";
            function e(t) {
                t = t || {}, this.firstLine = t.first_line, this.firstColumn = t.first_column, this.lastColumn = t.last_column, this.lastLine = t.last_line
            }

            var i, n = t, r = {
                ProgramNode: function (t, i, n, s) {
                    var o, a;
                    3 === arguments.length ? (s = n, n = null) : 2 === arguments.length && (s = i, i = null), e.call(this, s), this.type = "program", this.statements = t, this.strip = {}, n ? (a = n[0], a ? (o = {
                        first_line: a.firstLine,
                        last_line: a.lastLine,
                        last_column: a.lastColumn,
                        first_column: a.firstColumn
                    }, this.inverse = new r.ProgramNode(n, i, o)) : this.inverse = new r.ProgramNode(n, i), this.strip.right = i.left) : i && (this.strip.left = i.right)
                }, MustacheNode: function (t, i, n, s, o) {
                    if (e.call(this, o), this.type = "mustache", this.strip = s, null != n && n.charAt) {
                        var a = n.charAt(3) || n.charAt(2);
                        this.escaped = "{" !== a && "&" !== a
                    } else this.escaped = !!n;
                    this.sexpr = t instanceof r.SexprNode ? t : new r.SexprNode(t, i), this.sexpr.isRoot = !0, this.id = this.sexpr.id, this.params = this.sexpr.params, this.hash = this.sexpr.hash, this.eligibleHelper = this.sexpr.eligibleHelper, this.isHelper = this.sexpr.isHelper
                }, SexprNode: function (t, i, n) {
                    e.call(this, n), this.type = "sexpr", this.hash = i;
                    var r = this.id = t[0], s = this.params = t.slice(1), o = this.eligibleHelper = r.isSimple;
                    this.isHelper = o && (s.length || i)
                }, PartialNode: function (t, i, n, r) {
                    e.call(this, r), this.type = "partial", this.partialName = t, this.context = i, this.strip = n
                }, BlockNode: function (t, i, r, s, o) {
                    if (e.call(this, o), t.sexpr.id.original !== s.path.original)throw new n(t.sexpr.id.original + " doesn't match " + s.path.original, this);
                    this.type = "block", this.mustache = t, this.program = i, this.inverse = r, this.strip = {
                        left: t.strip.left,
                        right: s.strip.right
                    }, (i || r).strip.left = t.strip.right, (r || i).strip.right = s.strip.left, r && !i && (this.isInverse = !0)
                }, ContentNode: function (t, i) {
                    e.call(this, i), this.type = "content", this.string = t
                }, HashNode: function (t, i) {
                    e.call(this, i), this.type = "hash", this.pairs = t
                }, IdNode: function (t, i) {
                    e.call(this, i), this.type = "ID";
                    for (var r = "", s = [], o = 0, a = 0, h = t.length; h > a; a++) {
                        var c = t[a].part;
                        if (r += (t[a].separator || "") + c, ".." === c || "." === c || "this" === c) {
                            if (s.length > 0)throw new n("Invalid path: " + r, this);
                            ".." === c ? o++ : this.isScoped = !0
                        } else s.push(c)
                    }
                    this.original = r, this.parts = s, this.string = s.join("."), this.depth = o, this.isSimple = 1 === t.length && !this.isScoped && 0 === o, this.stringModeValue = this.string
                }, PartialNameNode: function (t, i) {
                    e.call(this, i), this.type = "PARTIAL_NAME", this.name = t.original
                }, DataNode: function (t, i) {
                    e.call(this, i), this.type = "DATA", this.id = t
                }, StringNode: function (t, i) {
                    e.call(this, i), this.type = "STRING", this.original = this.string = this.stringModeValue = t
                }, IntegerNode: function (t, i) {
                    e.call(this, i), this.type = "INTEGER", this.original = this.integer = t, this.stringModeValue = Number(t)
                }, BooleanNode: function (t, i) {
                    e.call(this, i), this.type = "BOOLEAN", this.bool = t, this.stringModeValue = "true" === t
                }, CommentNode: function (t, i) {
                    e.call(this, i), this.type = "comment", this.comment = t
                }
            };
            return i = r
        }(i), a = function () {
            "use strict";
            var t, e = function () {
                function t(t, e) {
                    return {left: "~" === t.charAt(2), right: "~" === e.charAt(0) || "~" === e.charAt(1)}
                }

                function e() {
                    this.yy = {}
                }

                var i = {
                    trace: function () {
                    },
                    yy: {},
                    symbols_: {
                        error: 2,
                        root: 3,
                        statements: 4,
                        EOF: 5,
                        program: 6,
                        simpleInverse: 7,
                        statement: 8,
                        openInverse: 9,
                        closeBlock: 10,
                        openBlock: 11,
                        mustache: 12,
                        partial: 13,
                        CONTENT: 14,
                        COMMENT: 15,
                        OPEN_BLOCK: 16,
                        sexpr: 17,
                        CLOSE: 18,
                        OPEN_INVERSE: 19,
                        OPEN_ENDBLOCK: 20,
                        path: 21,
                        OPEN: 22,
                        OPEN_UNESCAPED: 23,
                        CLOSE_UNESCAPED: 24,
                        OPEN_PARTIAL: 25,
                        partialName: 26,
                        partial_option0: 27,
                        sexpr_repetition0: 28,
                        sexpr_option0: 29,
                        dataName: 30,
                        param: 31,
                        STRING: 32,
                        INTEGER: 33,
                        BOOLEAN: 34,
                        OPEN_SEXPR: 35,
                        CLOSE_SEXPR: 36,
                        hash: 37,
                        hash_repetition_plus0: 38,
                        hashSegment: 39,
                        ID: 40,
                        EQUALS: 41,
                        DATA: 42,
                        pathSegments: 43,
                        SEP: 44,
                        $accept: 0,
                        $end: 1
                    },
                    terminals_: {
                        2: "error",
                        5: "EOF",
                        14: "CONTENT",
                        15: "COMMENT",
                        16: "OPEN_BLOCK",
                        18: "CLOSE",
                        19: "OPEN_INVERSE",
                        20: "OPEN_ENDBLOCK",
                        22: "OPEN",
                        23: "OPEN_UNESCAPED",
                        24: "CLOSE_UNESCAPED",
                        25: "OPEN_PARTIAL",
                        32: "STRING",
                        33: "INTEGER",
                        34: "BOOLEAN",
                        35: "OPEN_SEXPR",
                        36: "CLOSE_SEXPR",
                        40: "ID",
                        41: "EQUALS",
                        42: "DATA",
                        44: "SEP"
                    },
                    productions_: [0, [3, 2], [3, 1], [6, 2], [6, 3], [6, 2], [6, 1], [6, 1], [6, 0], [4, 1], [4, 2], [8, 3], [8, 3], [8, 1], [8, 1], [8, 1], [8, 1], [11, 3], [9, 3], [10, 3], [12, 3], [12, 3], [13, 4], [7, 2], [17, 3], [17, 1], [31, 1], [31, 1], [31, 1], [31, 1], [31, 1], [31, 3], [37, 1], [39, 3], [26, 1], [26, 1], [26, 1], [30, 2], [21, 1], [43, 3], [43, 1], [27, 0], [27, 1], [28, 0], [28, 2], [29, 0], [29, 1], [38, 1], [38, 2]],
                    performAction: function (e, i, n, r, s, o) {
                        var a = o.length - 1;
                        switch (s) {
                            case 1:
                                return new r.ProgramNode(o[a - 1], this._$);
                            case 2:
                                return new r.ProgramNode([], this._$);
                            case 3:
                                this.$ = new r.ProgramNode([], o[a - 1], o[a], this._$);
                                break;
                            case 4:
                                this.$ = new r.ProgramNode(o[a - 2], o[a - 1], o[a], this._$);
                                break;
                            case 5:
                                this.$ = new r.ProgramNode(o[a - 1], o[a], [], this._$);
                                break;
                            case 6:
                                this.$ = new r.ProgramNode(o[a], this._$);
                                break;
                            case 7:
                                this.$ = new r.ProgramNode([], this._$);
                                break;
                            case 8:
                                this.$ = new r.ProgramNode([], this._$);
                                break;
                            case 9:
                                this.$ = [o[a]];
                                break;
                            case 10:
                                o[a - 1].push(o[a]), this.$ = o[a - 1];
                                break;
                            case 11:
                                this.$ = new r.BlockNode(o[a - 2], o[a - 1].inverse, o[a - 1], o[a], this._$);
                                break;
                            case 12:
                                this.$ = new r.BlockNode(o[a - 2], o[a - 1], o[a - 1].inverse, o[a], this._$);
                                break;
                            case 13:
                                this.$ = o[a];
                                break;
                            case 14:
                                this.$ = o[a];
                                break;
                            case 15:
                                this.$ = new r.ContentNode(o[a], this._$);
                                break;
                            case 16:
                                this.$ = new r.CommentNode(o[a], this._$);
                                break;
                            case 17:
                                this.$ = new r.MustacheNode(o[a - 1], null, o[a - 2], t(o[a - 2], o[a]), this._$);
                                break;
                            case 18:
                                this.$ = new r.MustacheNode(o[a - 1], null, o[a - 2], t(o[a - 2], o[a]), this._$);
                                break;
                            case 19:
                                this.$ = {path: o[a - 1], strip: t(o[a - 2], o[a])};
                                break;
                            case 20:
                                this.$ = new r.MustacheNode(o[a - 1], null, o[a - 2], t(o[a - 2], o[a]), this._$);
                                break;
                            case 21:
                                this.$ = new r.MustacheNode(o[a - 1], null, o[a - 2], t(o[a - 2], o[a]), this._$);
                                break;
                            case 22:
                                this.$ = new r.PartialNode(o[a - 2], o[a - 1], t(o[a - 3], o[a]), this._$);
                                break;
                            case 23:
                                this.$ = t(o[a - 1], o[a]);
                                break;
                            case 24:
                                this.$ = new r.SexprNode([o[a - 2]].concat(o[a - 1]), o[a], this._$);
                                break;
                            case 25:
                                this.$ = new r.SexprNode([o[a]], null, this._$);
                                break;
                            case 26:
                                this.$ = o[a];
                                break;
                            case 27:
                                this.$ = new r.StringNode(o[a], this._$);
                                break;
                            case 28:
                                this.$ = new r.IntegerNode(o[a], this._$);
                                break;
                            case 29:
                                this.$ = new r.BooleanNode(o[a], this._$);
                                break;
                            case 30:
                                this.$ = o[a];
                                break;
                            case 31:
                                o[a - 1].isHelper = !0, this.$ = o[a - 1];
                                break;
                            case 32:
                                this.$ = new r.HashNode(o[a], this._$);
                                break;
                            case 33:
                                this.$ = [o[a - 2], o[a]];
                                break;
                            case 34:
                                this.$ = new r.PartialNameNode(o[a], this._$);
                                break;
                            case 35:
                                this.$ = new r.PartialNameNode(new r.StringNode(o[a], this._$), this._$);
                                break;
                            case 36:
                                this.$ = new r.PartialNameNode(new r.IntegerNode(o[a], this._$));
                                break;
                            case 37:
                                this.$ = new r.DataNode(o[a], this._$);
                                break;
                            case 38:
                                this.$ = new r.IdNode(o[a], this._$);
                                break;
                            case 39:
                                o[a - 2].push({part: o[a], separator: o[a - 1]}), this.$ = o[a - 2];
                                break;
                            case 40:
                                this.$ = [{part: o[a]}];
                                break;
                            case 43:
                                this.$ = [];
                                break;
                            case 44:
                                o[a - 1].push(o[a]);
                                break;
                            case 47:
                                this.$ = [o[a]];
                                break;
                            case 48:
                                o[a - 1].push(o[a])
                        }
                    },
                    table: [{
                        3: 1,
                        4: 2,
                        5: [1, 3],
                        8: 4,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 11],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {1: [3]}, {
                        5: [1, 16],
                        8: 17,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 11],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {1: [2, 2]}, {
                        5: [2, 9],
                        14: [2, 9],
                        15: [2, 9],
                        16: [2, 9],
                        19: [2, 9],
                        20: [2, 9],
                        22: [2, 9],
                        23: [2, 9],
                        25: [2, 9]
                    }, {
                        4: 20,
                        6: 18,
                        7: 19,
                        8: 4,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 21],
                        20: [2, 8],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {
                        4: 20,
                        6: 22,
                        7: 19,
                        8: 4,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 21],
                        20: [2, 8],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {
                        5: [2, 13],
                        14: [2, 13],
                        15: [2, 13],
                        16: [2, 13],
                        19: [2, 13],
                        20: [2, 13],
                        22: [2, 13],
                        23: [2, 13],
                        25: [2, 13]
                    }, {
                        5: [2, 14],
                        14: [2, 14],
                        15: [2, 14],
                        16: [2, 14],
                        19: [2, 14],
                        20: [2, 14],
                        22: [2, 14],
                        23: [2, 14],
                        25: [2, 14]
                    }, {
                        5: [2, 15],
                        14: [2, 15],
                        15: [2, 15],
                        16: [2, 15],
                        19: [2, 15],
                        20: [2, 15],
                        22: [2, 15],
                        23: [2, 15],
                        25: [2, 15]
                    }, {
                        5: [2, 16],
                        14: [2, 16],
                        15: [2, 16],
                        16: [2, 16],
                        19: [2, 16],
                        20: [2, 16],
                        22: [2, 16],
                        23: [2, 16],
                        25: [2, 16]
                    }, {17: 23, 21: 24, 30: 25, 40: [1, 28], 42: [1, 27], 43: 26}, {
                        17: 29,
                        21: 24,
                        30: 25,
                        40: [1, 28],
                        42: [1, 27],
                        43: 26
                    }, {17: 30, 21: 24, 30: 25, 40: [1, 28], 42: [1, 27], 43: 26}, {
                        17: 31,
                        21: 24,
                        30: 25,
                        40: [1, 28],
                        42: [1, 27],
                        43: 26
                    }, {21: 33, 26: 32, 32: [1, 34], 33: [1, 35], 40: [1, 28], 43: 26}, {1: [2, 1]}, {
                        5: [2, 10],
                        14: [2, 10],
                        15: [2, 10],
                        16: [2, 10],
                        19: [2, 10],
                        20: [2, 10],
                        22: [2, 10],
                        23: [2, 10],
                        25: [2, 10]
                    }, {10: 36, 20: [1, 37]}, {
                        4: 38,
                        8: 4,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 11],
                        20: [2, 7],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {
                        7: 39,
                        8: 17,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 21],
                        20: [2, 6],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {17: 23, 18: [1, 40], 21: 24, 30: 25, 40: [1, 28], 42: [1, 27], 43: 26}, {
                        10: 41,
                        20: [1, 37]
                    }, {18: [1, 42]}, {
                        18: [2, 43],
                        24: [2, 43],
                        28: 43,
                        32: [2, 43],
                        33: [2, 43],
                        34: [2, 43],
                        35: [2, 43],
                        36: [2, 43],
                        40: [2, 43],
                        42: [2, 43]
                    }, {18: [2, 25], 24: [2, 25], 36: [2, 25]}, {
                        18: [2, 38],
                        24: [2, 38],
                        32: [2, 38],
                        33: [2, 38],
                        34: [2, 38],
                        35: [2, 38],
                        36: [2, 38],
                        40: [2, 38],
                        42: [2, 38],
                        44: [1, 44]
                    }, {21: 45, 40: [1, 28], 43: 26}, {
                        18: [2, 40],
                        24: [2, 40],
                        32: [2, 40],
                        33: [2, 40],
                        34: [2, 40],
                        35: [2, 40],
                        36: [2, 40],
                        40: [2, 40],
                        42: [2, 40],
                        44: [2, 40]
                    }, {18: [1, 46]}, {18: [1, 47]}, {24: [1, 48]}, {
                        18: [2, 41],
                        21: 50,
                        27: 49,
                        40: [1, 28],
                        43: 26
                    }, {18: [2, 34], 40: [2, 34]}, {18: [2, 35], 40: [2, 35]}, {18: [2, 36], 40: [2, 36]}, {
                        5: [2, 11],
                        14: [2, 11],
                        15: [2, 11],
                        16: [2, 11],
                        19: [2, 11],
                        20: [2, 11],
                        22: [2, 11],
                        23: [2, 11],
                        25: [2, 11]
                    }, {21: 51, 40: [1, 28], 43: 26}, {
                        8: 17,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 11],
                        20: [2, 3],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {
                        4: 52,
                        8: 4,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 11],
                        20: [2, 5],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {
                        14: [2, 23],
                        15: [2, 23],
                        16: [2, 23],
                        19: [2, 23],
                        20: [2, 23],
                        22: [2, 23],
                        23: [2, 23],
                        25: [2, 23]
                    }, {
                        5: [2, 12],
                        14: [2, 12],
                        15: [2, 12],
                        16: [2, 12],
                        19: [2, 12],
                        20: [2, 12],
                        22: [2, 12],
                        23: [2, 12],
                        25: [2, 12]
                    }, {
                        14: [2, 18],
                        15: [2, 18],
                        16: [2, 18],
                        19: [2, 18],
                        20: [2, 18],
                        22: [2, 18],
                        23: [2, 18],
                        25: [2, 18]
                    }, {
                        18: [2, 45],
                        21: 56,
                        24: [2, 45],
                        29: 53,
                        30: 60,
                        31: 54,
                        32: [1, 57],
                        33: [1, 58],
                        34: [1, 59],
                        35: [1, 61],
                        36: [2, 45],
                        37: 55,
                        38: 62,
                        39: 63,
                        40: [1, 64],
                        42: [1, 27],
                        43: 26
                    }, {40: [1, 65]}, {
                        18: [2, 37],
                        24: [2, 37],
                        32: [2, 37],
                        33: [2, 37],
                        34: [2, 37],
                        35: [2, 37],
                        36: [2, 37],
                        40: [2, 37],
                        42: [2, 37]
                    }, {
                        14: [2, 17],
                        15: [2, 17],
                        16: [2, 17],
                        19: [2, 17],
                        20: [2, 17],
                        22: [2, 17],
                        23: [2, 17],
                        25: [2, 17]
                    }, {
                        5: [2, 20],
                        14: [2, 20],
                        15: [2, 20],
                        16: [2, 20],
                        19: [2, 20],
                        20: [2, 20],
                        22: [2, 20],
                        23: [2, 20],
                        25: [2, 20]
                    }, {
                        5: [2, 21],
                        14: [2, 21],
                        15: [2, 21],
                        16: [2, 21],
                        19: [2, 21],
                        20: [2, 21],
                        22: [2, 21],
                        23: [2, 21],
                        25: [2, 21]
                    }, {18: [1, 66]}, {18: [2, 42]}, {18: [1, 67]}, {
                        8: 17,
                        9: 5,
                        11: 6,
                        12: 7,
                        13: 8,
                        14: [1, 9],
                        15: [1, 10],
                        16: [1, 12],
                        19: [1, 11],
                        20: [2, 4],
                        22: [1, 13],
                        23: [1, 14],
                        25: [1, 15]
                    }, {18: [2, 24], 24: [2, 24], 36: [2, 24]}, {
                        18: [2, 44],
                        24: [2, 44],
                        32: [2, 44],
                        33: [2, 44],
                        34: [2, 44],
                        35: [2, 44],
                        36: [2, 44],
                        40: [2, 44],
                        42: [2, 44]
                    }, {18: [2, 46], 24: [2, 46], 36: [2, 46]}, {
                        18: [2, 26],
                        24: [2, 26],
                        32: [2, 26],
                        33: [2, 26],
                        34: [2, 26],
                        35: [2, 26],
                        36: [2, 26],
                        40: [2, 26],
                        42: [2, 26]
                    }, {
                        18: [2, 27],
                        24: [2, 27],
                        32: [2, 27],
                        33: [2, 27],
                        34: [2, 27],
                        35: [2, 27],
                        36: [2, 27],
                        40: [2, 27],
                        42: [2, 27]
                    }, {
                        18: [2, 28],
                        24: [2, 28],
                        32: [2, 28],
                        33: [2, 28],
                        34: [2, 28],
                        35: [2, 28],
                        36: [2, 28],
                        40: [2, 28],
                        42: [2, 28]
                    }, {
                        18: [2, 29],
                        24: [2, 29],
                        32: [2, 29],
                        33: [2, 29],
                        34: [2, 29],
                        35: [2, 29],
                        36: [2, 29],
                        40: [2, 29],
                        42: [2, 29]
                    }, {
                        18: [2, 30],
                        24: [2, 30],
                        32: [2, 30],
                        33: [2, 30],
                        34: [2, 30],
                        35: [2, 30],
                        36: [2, 30],
                        40: [2, 30],
                        42: [2, 30]
                    }, {17: 68, 21: 24, 30: 25, 40: [1, 28], 42: [1, 27], 43: 26}, {
                        18: [2, 32],
                        24: [2, 32],
                        36: [2, 32],
                        39: 69,
                        40: [1, 70]
                    }, {18: [2, 47], 24: [2, 47], 36: [2, 47], 40: [2, 47]}, {
                        18: [2, 40],
                        24: [2, 40],
                        32: [2, 40],
                        33: [2, 40],
                        34: [2, 40],
                        35: [2, 40],
                        36: [2, 40],
                        40: [2, 40],
                        41: [1, 71],
                        42: [2, 40],
                        44: [2, 40]
                    }, {
                        18: [2, 39],
                        24: [2, 39],
                        32: [2, 39],
                        33: [2, 39],
                        34: [2, 39],
                        35: [2, 39],
                        36: [2, 39],
                        40: [2, 39],
                        42: [2, 39],
                        44: [2, 39]
                    }, {
                        5: [2, 22],
                        14: [2, 22],
                        15: [2, 22],
                        16: [2, 22],
                        19: [2, 22],
                        20: [2, 22],
                        22: [2, 22],
                        23: [2, 22],
                        25: [2, 22]
                    }, {
                        5: [2, 19],
                        14: [2, 19],
                        15: [2, 19],
                        16: [2, 19],
                        19: [2, 19],
                        20: [2, 19],
                        22: [2, 19],
                        23: [2, 19],
                        25: [2, 19]
                    }, {36: [1, 72]}, {18: [2, 48], 24: [2, 48], 36: [2, 48], 40: [2, 48]}, {41: [1, 71]}, {
                        21: 56,
                        30: 60,
                        31: 73,
                        32: [1, 57],
                        33: [1, 58],
                        34: [1, 59],
                        35: [1, 61],
                        40: [1, 28],
                        42: [1, 27],
                        43: 26
                    }, {
                        18: [2, 31],
                        24: [2, 31],
                        32: [2, 31],
                        33: [2, 31],
                        34: [2, 31],
                        35: [2, 31],
                        36: [2, 31],
                        40: [2, 31],
                        42: [2, 31]
                    }, {18: [2, 33], 24: [2, 33], 36: [2, 33], 40: [2, 33]}],
                    defaultActions: {3: [2, 2], 16: [2, 1], 50: [2, 42]},
                    parseError: function (t) {
                        throw new Error(t)
                    },
                    parse: function (t) {
                        function e() {
                            var t;
                            return t = i.lexer.lex() || 1, "number" != typeof t && (t = i.symbols_[t] || t), t
                        }

                        var i = this, n = [0], r = [null], s = [], o = this.table, a = "", h = 0, c = 0, p = 0;
                        this.lexer.setInput(t), this.lexer.yy = this.yy, this.yy.lexer = this.lexer, this.yy.parser = this, "undefined" == typeof this.lexer.yylloc && (this.lexer.yylloc = {});
                        var l = this.lexer.yylloc;
                        s.push(l);
                        var u = this.lexer.options && this.lexer.options.ranges;
                        "function" == typeof this.yy.parseError && (this.parseError = this.yy.parseError);
                        for (var f, d, m, g, v, y, x, S, b, k = {}; ;) {
                            if (m = n[n.length - 1], this.defaultActions[m] ? g = this.defaultActions[m] : ((null === f || "undefined" == typeof f) && (f = e()), g = o[m] && o[m][f]), "undefined" == typeof g || !g.length || !g[0]) {
                                var E = "";
                                if (!p) {
                                    b = [];
                                    for (y in o[m])this.terminals_[y] && y > 2 && b.push("'" + this.terminals_[y] + "'");
                                    E = this.lexer.showPosition ? "Parse error on line " + (h + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + b.join(", ") + ", got '" + (this.terminals_[f] || f) + "'" : "Parse error on line " + (h + 1) + ": Unexpected " + (1 == f ? "end of input" : "'" + (this.terminals_[f] || f) + "'"), this.parseError(E, {
                                        text: this.lexer.match,
                                        token: this.terminals_[f] || f,
                                        line: this.lexer.yylineno,
                                        loc: l,
                                        expected: b
                                    })
                                }
                            }
                            if (g[0]instanceof Array && g.length > 1)throw new Error("Parse Error: multiple actions possible at state: " + m + ", token: " + f);
                            switch (g[0]) {
                                case 1:
                                    n.push(f), r.push(this.lexer.yytext), s.push(this.lexer.yylloc), n.push(g[1]), f = null, d ? (f = d, d = null) : (c = this.lexer.yyleng, a = this.lexer.yytext, h = this.lexer.yylineno, l = this.lexer.yylloc, p > 0 && p--);
                                    break;
                                case 2:
                                    if (x = this.productions_[g[1]][1], k.$ = r[r.length - x], k._$ = {
                                            first_line: s[s.length - (x || 1)].first_line,
                                            last_line: s[s.length - 1].last_line,
                                            first_column: s[s.length - (x || 1)].first_column,
                                            last_column: s[s.length - 1].last_column
                                        }, u && (k._$.range = [s[s.length - (x || 1)].range[0], s[s.length - 1].range[1]]), v = this.performAction.call(k, a, c, h, this.yy, g[1], r, s), "undefined" != typeof v)return v;
                                    x && (n = n.slice(0, -1 * x * 2), r = r.slice(0, -1 * x), s = s.slice(0, -1 * x)), n.push(this.productions_[g[1]][0]), r.push(k.$), s.push(k._$), S = o[n[n.length - 2]][n[n.length - 1]], n.push(S);
                                    break;
                                case 3:
                                    return !0
                            }
                        }
                        return !0
                    }
                }, n = function () {
                    var t = {
                        EOF: 1, parseError: function (t, e) {
                            if (!this.yy.parser)throw new Error(t);
                            this.yy.parser.parseError(t, e)
                        }, setInput: function (t) {
                            return this._input = t, this._more = this._less = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
                                first_line: 1,
                                first_column: 0,
                                last_line: 1,
                                last_column: 0
                            }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this
                        }, input: function () {
                            var t = this._input[0];
                            this.yytext += t, this.yyleng++, this.offset++, this.match += t, this.matched += t;
                            var e = t.match(/(?:\r\n?|\n).*/g);
                            return e ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), t
                        }, unput: function (t) {
                            var e = t.length, i = t.split(/(?:\r\n?|\n)/g);
                            this._input = t + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - e - 1), this.offset -= e;
                            var n = this.match.split(/(?:\r\n?|\n)/g);
                            this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), i.length - 1 && (this.yylineno -= i.length - 1);
                            var r = this.yylloc.range;
                            return this.yylloc = {
                                first_line: this.yylloc.first_line,
                                last_line: this.yylineno + 1,
                                first_column: this.yylloc.first_column,
                                last_column: i ? (i.length === n.length ? this.yylloc.first_column : 0) + n[n.length - i.length].length - i[0].length : this.yylloc.first_column - e
                            }, this.options.ranges && (this.yylloc.range = [r[0], r[0] + this.yyleng - e]), this
                        }, more: function () {
                            return this._more = !0, this
                        }, less: function (t) {
                            this.unput(this.match.slice(t))
                        }, pastInput: function () {
                            var t = this.matched.substr(0, this.matched.length - this.match.length);
                            return (t.length > 20 ? "..." : "") + t.substr(-20).replace(/\n/g, "")
                        }, upcomingInput: function () {
                            var t = this.match;
                            return t.length < 20 && (t += this._input.substr(0, 20 - t.length)), (t.substr(0, 20) + (t.length > 20 ? "..." : "")).replace(/\n/g, "")
                        }, showPosition: function () {
                            var t = this.pastInput(), e = new Array(t.length + 1).join("-");
                            return t + this.upcomingInput() + "\n" + e + "^"
                        }, next: function () {
                            if (this.done)return this.EOF;
                            this._input || (this.done = !0);
                            var t, e, i, n, r;
                            this._more || (this.yytext = "", this.match = "");
                            for (var s = this._currentRules(), o = 0; o < s.length && (i = this._input.match(this.rules[s[o]]), !i || e && !(i[0].length > e[0].length) || (e = i, n = o, this.options.flex)); o++);
                            return e ? (r = e[0].match(/(?:\r\n?|\n).*/g), r && (this.yylineno += r.length), this.yylloc = {
                                first_line: this.yylloc.last_line,
                                last_line: this.yylineno + 1,
                                first_column: this.yylloc.last_column,
                                last_column: r ? r[r.length - 1].length - r[r.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + e[0].length
                            }, this.yytext += e[0], this.match += e[0], this.matches = e, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._input = this._input.slice(e[0].length), this.matched += e[0], t = this.performAction.call(this, this.yy, this, s[n], this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), t ? t : void 0) : "" === this._input ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                                text: "",
                                token: null,
                                line: this.yylineno
                            })
                        }, lex: function () {
                            var t = this.next();
                            return "undefined" != typeof t ? t : this.lex()
                        }, begin: function (t) {
                            this.conditionStack.push(t)
                        }, popState: function () {
                            return this.conditionStack.pop()
                        }, _currentRules: function () {
                            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules
                        }, topState: function () {
                            return this.conditionStack[this.conditionStack.length - 2]
                        }, pushState: function (t) {
                            this.begin(t)
                        }
                    };
                    return t.options = {}, t.performAction = function (t, e, i, n) {
                        function r(t, i) {
                            return e.yytext = e.yytext.substr(t, e.yyleng - i)
                        }

                        switch (i) {
                            case 0:
                                if ("\\\\" === e.yytext.slice(-2) ? (r(0, 1), this.begin("mu")) : "\\" === e.yytext.slice(-1) ? (r(0, 1), this.begin("emu")) : this.begin("mu"), e.yytext)return 14;
                                break;
                            case 1:
                                return 14;
                            case 2:
                                return this.popState(), 14;
                            case 3:
                                return r(0, 4), this.popState(), 15;
                            case 4:
                                return 35;
                            case 5:
                                return 36;
                            case 6:
                                return 25;
                            case 7:
                                return 16;
                            case 8:
                                return 20;
                            case 9:
                                return 19;
                            case 10:
                                return 19;
                            case 11:
                                return 23;
                            case 12:
                                return 22;
                            case 13:
                                this.popState(), this.begin("com");
                                break;
                            case 14:
                                return r(3, 5), this.popState(), 15;
                            case 15:
                                return 22;
                            case 16:
                                return 41;
                            case 17:
                                return 40;
                            case 18:
                                return 40;
                            case 19:
                                return 44;
                            case 20:
                                break;
                            case 21:
                                return this.popState(), 24;
                            case 22:
                                return this.popState(), 18;
                            case 23:
                                return e.yytext = r(1, 2).replace(/\\"/g, '"'), 32;
                            case 24:
                                return e.yytext = r(1, 2).replace(/\\'/g, "'"), 32;
                            case 25:
                                return 42;
                            case 26:
                                return 34;
                            case 27:
                                return 34;
                            case 28:
                                return 33;
                            case 29:
                                return 40;
                            case 30:
                                return e.yytext = r(1, 2), 40;
                            case 31:
                                return "INVALID";
                            case 32:
                                return 5
                        }
                    }, t.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:-?[0-9]+(?=([~}\s)])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/], t.conditions = {
                        mu: {
                            rules: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
                            inclusive: !1
                        },
                        emu: {rules: [2], inclusive: !1},
                        com: {rules: [3], inclusive: !1},
                        INITIAL: {rules: [0, 1, 32], inclusive: !0}
                    }, t
                }();
                return i.lexer = n, e.prototype = i, i.Parser = e, new e
            }();
            return t = e
        }(), h = function (t, e) {
            "use strict";
            function i(t) {
                return t.constructor === s.ProgramNode ? t : (r.yy = s, r.parse(t))
            }

            var n = {}, r = t, s = e;
            return n.parser = r, n.parse = i, n
        }(a, o), c = function (t) {
            "use strict";
            function e() {
            }

            function i(t, e, i) {
                if (null == t || "string" != typeof t && t.constructor !== i.AST.ProgramNode)throw new s("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + t);
                e = e || {}, "data"in e || (e.data = !0);
                var n = i.parse(t), r = (new i.Compiler).compile(n, e);
                return (new i.JavaScriptCompiler).compile(r, e)
            }

            function n(t, e, i) {
                function n() {
                    var n = i.parse(t), r = (new i.Compiler).compile(n, e), s = (new i.JavaScriptCompiler).compile(r, e, void 0, !0);
                    return i.template(s)
                }

                if (null == t || "string" != typeof t && t.constructor !== i.AST.ProgramNode)throw new s("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + t);
                e = e || {}, "data"in e || (e.data = !0);
                var r;
                return function (t, e) {
                    return r || (r = n()), r.call(this, t, e)
                }
            }

            var r = {}, s = t;
            return r.Compiler = e, e.prototype = {
                compiler: e, disassemble: function () {
                    for (var t, e, i, n = this.opcodes, r = [], s = 0, o = n.length; o > s; s++)if (t = n[s], "DECLARE" === t.opcode)r.push("DECLARE " + t.name + "=" + t.value); else {
                        e = [];
                        for (var a = 0; a < t.args.length; a++)i = t.args[a], "string" == typeof i && (i = '"' + i.replace("\n", "\\n") + '"'), e.push(i);
                        r.push(t.opcode + " " + e.join(" "))
                    }
                    return r.join("\n")
                }, equals: function (t) {
                    var e = this.opcodes.length;
                    if (t.opcodes.length !== e)return !1;
                    for (var i = 0; e > i; i++) {
                        var n = this.opcodes[i], r = t.opcodes[i];
                        if (n.opcode !== r.opcode || n.args.length !== r.args.length)return !1;
                        for (var s = 0; s < n.args.length; s++)if (n.args[s] !== r.args[s])return !1
                    }
                    if (e = this.children.length, t.children.length !== e)return !1;
                    for (i = 0; e > i; i++)if (!this.children[i].equals(t.children[i]))return !1;
                    return !0
                }, guid: 0, compile: function (t, e) {
                    this.opcodes = [], this.children = [], this.depths = {list: []}, this.options = e;
                    var i = this.options.knownHelpers;
                    if (this.options.knownHelpers = {
                            helperMissing: !0,
                            blockHelperMissing: !0,
                            each: !0,
                            "if": !0,
                            unless: !0,
                            "with": !0,
                            log: !0
                        }, i)for (var n in i)this.options.knownHelpers[n] = i[n];
                    return this.accept(t)
                }, accept: function (t) {
                    var e, i = t.strip || {};
                    return i.left && this.opcode("strip"), e = this[t.type](t), i.right && this.opcode("strip"), e
                }, program: function (t) {
                    for (var e = t.statements, i = 0, n = e.length; n > i; i++)this.accept(e[i]);
                    return this.isSimple = 1 === n, this.depths.list = this.depths.list.sort(function (t, e) {
                        return t - e
                    }), this
                }, compileProgram: function (t) {
                    var e, i = (new this.compiler).compile(t, this.options), n = this.guid++;
                    this.usePartial = this.usePartial || i.usePartial, this.children[n] = i;
                    for (var r = 0, s = i.depths.list.length; s > r; r++)e = i.depths.list[r], 2 > e || this.addDepth(e - 1);
                    return n
                }, block: function (t) {
                    var e = t.mustache, i = t.program, n = t.inverse;
                    i && (i = this.compileProgram(i)), n && (n = this.compileProgram(n));
                    var r = e.sexpr, s = this.classifySexpr(r);
                    "helper" === s ? this.helperSexpr(r, i, n) : "simple" === s ? (this.simpleSexpr(r), this.opcode("pushProgram", i), this.opcode("pushProgram", n), this.opcode("emptyHash"), this.opcode("blockValue")) : (this.ambiguousSexpr(r, i, n), this.opcode("pushProgram", i), this.opcode("pushProgram", n), this.opcode("emptyHash"), this.opcode("ambiguousBlockValue")), this.opcode("append")
                }, hash: function (t) {
                    var e, i, n = t.pairs;
                    this.opcode("pushHash");
                    for (var r = 0, s = n.length; s > r; r++)e = n[r], i = e[1], this.options.stringParams ? (i.depth && this.addDepth(i.depth), this.opcode("getContext", i.depth || 0), this.opcode("pushStringParam", i.stringModeValue, i.type), "sexpr" === i.type && this.sexpr(i)) : this.accept(i), this.opcode("assignToHash", e[0]);
                    this.opcode("popHash")
                }, partial: function (t) {
                    var e = t.partialName;
                    this.usePartial = !0, t.context ? this.ID(t.context) : this.opcode("push", "depth0"), this.opcode("invokePartial", e.name), this.opcode("append")
                }, content: function (t) {
                    this.opcode("appendContent", t.string)
                }, mustache: function (t) {
                    this.sexpr(t.sexpr), this.opcode(t.escaped && !this.options.noEscape ? "appendEscaped" : "append")
                }, ambiguousSexpr: function (t, e, i) {
                    var n = t.id, r = n.parts[0], s = null != e || null != i;
                    this.opcode("getContext", n.depth), this.opcode("pushProgram", e), this.opcode("pushProgram", i), this.opcode("invokeAmbiguous", r, s)
                }, simpleSexpr: function (t) {
                    var e = t.id;
                    "DATA" === e.type ? this.DATA(e) : e.parts.length ? this.ID(e) : (this.addDepth(e.depth), this.opcode("getContext", e.depth), this.opcode("pushContext")), this.opcode("resolvePossibleLambda")
                }, helperSexpr: function (t, e, i) {
                    var n = this.setupFullMustacheParams(t, e, i), r = t.id.parts[0];
                    if (this.options.knownHelpers[r])this.opcode("invokeKnownHelper", n.length, r); else {
                        if (this.options.knownHelpersOnly)throw new s("You specified knownHelpersOnly, but used the unknown helper " + r, t);
                        this.opcode("invokeHelper", n.length, r, t.isRoot)
                    }
                }, sexpr: function (t) {
                    var e = this.classifySexpr(t);
                    "simple" === e ? this.simpleSexpr(t) : "helper" === e ? this.helperSexpr(t) : this.ambiguousSexpr(t)
                }, ID: function (t) {
                    this.addDepth(t.depth), this.opcode("getContext", t.depth);
                    var e = t.parts[0];
                    e ? this.opcode("lookupOnContext", t.parts[0]) : this.opcode("pushContext");
                    for (var i = 1, n = t.parts.length; n > i; i++)this.opcode("lookup", t.parts[i])
                }, DATA: function (t) {
                    if (this.options.data = !0, t.id.isScoped || t.id.depth)throw new s("Scoped data references are not supported: " + t.original, t);
                    this.opcode("lookupData");
                    for (var e = t.id.parts, i = 0, n = e.length; n > i; i++)this.opcode("lookup", e[i])
                }, STRING: function (t) {
                    this.opcode("pushString", t.string)
                }, INTEGER: function (t) {
                    this.opcode("pushLiteral", t.integer)
                }, BOOLEAN: function (t) {
                    this.opcode("pushLiteral", t.bool)
                }, comment: function () {
                }, opcode: function (t) {
                    this.opcodes.push({opcode: t, args: [].slice.call(arguments, 1)})
                }, declare: function (t, e) {
                    this.opcodes.push({opcode: "DECLARE", name: t, value: e})
                }, addDepth: function (t) {
                    0 !== t && (this.depths[t] || (this.depths[t] = !0, this.depths.list.push(t)))
                }, classifySexpr: function (t) {
                    var e = t.isHelper, i = t.eligibleHelper, n = this.options;
                    if (i && !e) {
                        var r = t.id.parts[0];
                        n.knownHelpers[r] ? e = !0 : n.knownHelpersOnly && (i = !1)
                    }
                    return e ? "helper" : i ? "ambiguous" : "simple"
                }, pushParams: function (t) {
                    for (var e, i = t.length; i--;)e = t[i], this.options.stringParams ? (e.depth && this.addDepth(e.depth), this.opcode("getContext", e.depth || 0), this.opcode("pushStringParam", e.stringModeValue, e.type), "sexpr" === e.type && this.sexpr(e)) : this[e.type](e)
                }, setupFullMustacheParams: function (t, e, i) {
                    var n = t.params;
                    return this.pushParams(n), this.opcode("pushProgram", e), this.opcode("pushProgram", i), t.hash ? this.hash(t.hash) : this.opcode("emptyHash"), n
                }
            }, r.precompile = i, r.compile = n, r
        }(i), p = function (t, e) {
            "use strict";
            function i(t) {
                this.value = t
            }

            function n() {
            }

            var r, s = t.COMPILER_REVISION, o = t.REVISION_CHANGES, a = t.log, h = e;
            n.prototype = {
                nameLookup: function (t, e) {
                    var i, r;
                    return 0 === t.indexOf("depth") && (i = !0), r = /^[0-9]+$/.test(e) ? t + "[" + e + "]" : n.isValidJavaScriptVariableName(e) ? t + "." + e : t + "['" + e + "']", i ? "(" + t + " && " + r + ")" : r
                }, compilerInfo: function () {
                    var t = s, e = o[t];
                    return "this.compilerInfo = [" + t + ",'" + e + "'];\n"
                }, appendToBuffer: function (t) {
                    return this.environment.isSimple ? "return " + t + ";" : {
                        appendToBuffer: !0,
                        content: t,
                        toString: function () {
                            return "buffer += " + t + ";"
                        }
                    }
                }, initializeBuffer: function () {
                    return this.quotedString("")
                }, namespace: "Handlebars", compile: function (t, e, i, n) {
                    this.environment = t, this.options = e || {}, a("debug", this.environment.disassemble() + "\n\n"), this.name = this.environment.name, this.isChild = !!i, this.context = i || {
                            programs: [],
                            environments: [],
                            aliases: {}
                        }, this.preamble(), this.stackSlot = 0, this.stackVars = [], this.registers = {list: []}, this.hashes = [], this.compileStack = [], this.inlineStack = [], this.compileChildren(t, e);
                    var r, s = t.opcodes;
                    this.i = 0;
                    for (var o = s.length; this.i < o; this.i++)r = s[this.i], "DECLARE" === r.opcode ? this[r.name] = r.value : this[r.opcode].apply(this, r.args), r.opcode !== this.stripNext && (this.stripNext = !1);
                    if (this.pushSource(""), this.stackSlot || this.inlineStack.length || this.compileStack.length)throw new h("Compile completed with content left on stack");
                    return this.createFunctionContext(n)
                }, preamble: function () {
                    var t = [];
                    if (this.isChild)t.push(""); else {
                        var e = this.namespace, i = "helpers = this.merge(helpers, " + e + ".helpers);";
                        this.environment.usePartial && (i = i + " partials = this.merge(partials, " + e + ".partials);"), this.options.data && (i += " data = data || {};"), t.push(i)
                    }
                    t.push(this.environment.isSimple ? "" : ", buffer = " + this.initializeBuffer()), this.lastContext = 0, this.source = t
                }, createFunctionContext: function (t) {
                    var e = this.stackVars.concat(this.registers.list);
                    if (e.length > 0 && (this.source[1] = this.source[1] + ", " + e.join(", ")), !this.isChild)for (var i in this.context.aliases)this.context.aliases.hasOwnProperty(i) && (this.source[1] = this.source[1] + ", " + i + "=" + this.context.aliases[i]);
                    this.source[1] && (this.source[1] = "var " + this.source[1].substring(2) + ";"), this.isChild || (this.source[1] += "\n" + this.context.programs.join("\n") + "\n"), this.environment.isSimple || this.pushSource("return buffer;");
                    for (var n = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"], r = 0, s = this.environment.depths.list.length; s > r; r++)n.push("depth" + this.environment.depths.list[r]);
                    var o = this.mergeSource();
                    if (this.isChild || (o = this.compilerInfo() + o), t)return n.push(o), Function.apply(this, n);
                    var h = "function " + (this.name || "") + "(" + n.join(",") + ") {\n  " + o + "}";
                    return a("debug", h + "\n\n"), h
                }, mergeSource: function () {
                    for (var t, e = "", i = 0, n = this.source.length; n > i; i++) {
                        var r = this.source[i];
                        r.appendToBuffer ? t = t ? t + "\n    + " + r.content : r.content : (t && (e += "buffer += " + t + ";\n  ", t = void 0), e += r + "\n  ")
                    }
                    return e
                }, blockValue: function () {
                    this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                    var t = ["depth0"];
                    this.setupParams(0, t), this.replaceStack(function (e) {
                        return t.splice(1, 0, e), "blockHelperMissing.call(" + t.join(", ") + ")"
                    })
                }, ambiguousBlockValue: function () {
                    this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                    var t = ["depth0"];
                    this.setupParams(0, t);
                    var e = this.topStack();
                    t.splice(1, 0, e), this.pushSource("if (!" + this.lastHelper + ") { " + e + " = blockHelperMissing.call(" + t.join(", ") + "); }")
                }, appendContent: function (t) {
                    this.pendingContent && (t = this.pendingContent + t), this.stripNext && (t = t.replace(/^\s+/, "")), this.pendingContent = t
                }, strip: function () {
                    this.pendingContent && (this.pendingContent = this.pendingContent.replace(/\s+$/, "")), this.stripNext = "strip"
                }, append: function () {
                    this.flushInline();
                    var t = this.popStack();
                    this.pushSource("if(" + t + " || " + t + " === 0) { " + this.appendToBuffer(t) + " }"), this.environment.isSimple && this.pushSource("else { " + this.appendToBuffer("''") + " }")
                }, appendEscaped: function () {
                    this.context.aliases.escapeExpression = "this.escapeExpression", this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"))
                }, getContext: function (t) {
                    this.lastContext !== t && (this.lastContext = t)
                }, lookupOnContext: function (t) {
                    this.push(this.nameLookup("depth" + this.lastContext, t, "context"))
                }, pushContext: function () {
                    this.pushStackLiteral("depth" + this.lastContext)
                }, resolvePossibleLambda: function () {
                    this.context.aliases.functionType = '"function"', this.replaceStack(function (t) {
                        return "typeof " + t + " === functionType ? " + t + ".apply(depth0) : " + t
                    })
                }, lookup: function (t) {
                    this.replaceStack(function (e) {
                        return e + " == null || " + e + " === false ? " + e + " : " + this.nameLookup(e, t, "context")
                    })
                }, lookupData: function () {
                    this.pushStackLiteral("data")
                }, pushStringParam: function (t, e) {
                    this.pushStackLiteral("depth" + this.lastContext), this.pushString(e), "sexpr" !== e && ("string" == typeof t ? this.pushString(t) : this.pushStackLiteral(t))
                }, emptyHash: function () {
                    this.pushStackLiteral("{}"), this.options.stringParams && (this.push("{}"), this.push("{}"))
                }, pushHash: function () {
                    this.hash && this.hashes.push(this.hash), this.hash = {values: [], types: [], contexts: []}
                }, popHash: function () {
                    var t = this.hash;
                    this.hash = this.hashes.pop(), this.options.stringParams && (this.push("{" + t.contexts.join(",") + "}"), this.push("{" + t.types.join(",") + "}")), this.push("{\n    " + t.values.join(",\n    ") + "\n  }")
                }, pushString: function (t) {
                    this.pushStackLiteral(this.quotedString(t))
                }, push: function (t) {
                    return this.inlineStack.push(t), t
                }, pushLiteral: function (t) {
                    this.pushStackLiteral(t)
                }, pushProgram: function (t) {
                    this.pushStackLiteral(null != t ? this.programExpression(t) : null)
                }, invokeHelper: function (t, e, i) {
                    this.context.aliases.helperMissing = "helpers.helperMissing", this.useRegister("helper");
                    var n = this.lastHelper = this.setupHelper(t, e, !0), r = this.nameLookup("depth" + this.lastContext, e, "context"), s = "helper = " + n.name + " || " + r;
                    n.paramsInit && (s += "," + n.paramsInit), this.push("(" + s + ",helper ? helper.call(" + n.callParams + ") : helperMissing.call(" + n.helperMissingParams + "))"), i || this.flushInline()
                }, invokeKnownHelper: function (t, e) {
                    var i = this.setupHelper(t, e);
                    this.push(i.name + ".call(" + i.callParams + ")")
                }, invokeAmbiguous: function (t, e) {
                    this.context.aliases.functionType = '"function"', this.useRegister("helper"), this.emptyHash();
                    var i = this.setupHelper(0, t, e), n = this.lastHelper = this.nameLookup("helpers", t, "helper"), r = this.nameLookup("depth" + this.lastContext, t, "context"), s = this.nextStack();
                    i.paramsInit && this.pushSource(i.paramsInit), this.pushSource("if (helper = " + n + ") { " + s + " = helper.call(" + i.callParams + "); }"), this.pushSource("else { helper = " + r + "; " + s + " = typeof helper === functionType ? helper.call(" + i.callParams + ") : helper; }")
                }, invokePartial: function (t) {
                    var e = [this.nameLookup("partials", t, "partial"), "'" + t + "'", this.popStack(), "helpers", "partials"];
                    this.options.data && e.push("data"), this.context.aliases.self = "this", this.push("self.invokePartial(" + e.join(", ") + ")")
                }, assignToHash: function (t) {
                    var e, i, n = this.popStack();
                    this.options.stringParams && (i = this.popStack(), e = this.popStack());
                    var r = this.hash;
                    e && r.contexts.push("'" + t + "': " + e), i && r.types.push("'" + t + "': " + i), r.values.push("'" + t + "': (" + n + ")")
                }, compiler: n, compileChildren: function (t, e) {
                    for (var i, n, r = t.children, s = 0, o = r.length; o > s; s++) {
                        i = r[s], n = new this.compiler;
                        var a = this.matchExistingProgram(i);
                        null == a ? (this.context.programs.push(""), a = this.context.programs.length, i.index = a, i.name = "program" + a, this.context.programs[a] = n.compile(i, e, this.context), this.context.environments[a] = i) : (i.index = a, i.name = "program" + a)
                    }
                }, matchExistingProgram: function (t) {
                    for (var e = 0, i = this.context.environments.length; i > e; e++) {
                        var n = this.context.environments[e];
                        if (n && n.equals(t))return e
                    }
                }, programExpression: function (t) {
                    if (this.context.aliases.self = "this", null == t)return "self.noop";
                    for (var e, i = this.environment.children[t], n = i.depths.list, r = [i.index, i.name, "data"], s = 0, o = n.length; o > s; s++)e = n[s], r.push(1 === e ? "depth0" : "depth" + (e - 1));
                    return (0 === n.length ? "self.program(" : "self.programWithDepth(") + r.join(", ") + ")"
                }, register: function (t, e) {
                    this.useRegister(t), this.pushSource(t + " = " + e + ";")
                }, useRegister: function (t) {
                    this.registers[t] || (this.registers[t] = !0, this.registers.list.push(t))
                }, pushStackLiteral: function (t) {
                    return this.push(new i(t))
                }, pushSource: function (t) {
                    this.pendingContent && (this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))), this.pendingContent = void 0), t && this.source.push(t)
                }, pushStack: function (t) {
                    this.flushInline();
                    var e = this.incrStack();
                    return t && this.pushSource(e + " = " + t + ";"), this.compileStack.push(e), e
                }, replaceStack: function (t) {
                    var e, n, r, s = "", o = this.isInline();
                    if (o) {
                        var a = this.popStack(!0);
                        if (a instanceof i)e = a.value, r = !0; else {
                            n = !this.stackSlot;
                            var h = n ? this.incrStack() : this.topStackName();
                            s = "(" + this.push(h) + " = " + a + "),", e = this.topStack()
                        }
                    } else e = this.topStack();
                    var c = t.call(this, e);
                    return o ? (r || this.popStack(), n && this.stackSlot--, this.push("(" + s + c + ")")) : (/^stack/.test(e) || (e = this.nextStack()), this.pushSource(e + " = (" + s + c + ");")), e
                }, nextStack: function () {
                    return this.pushStack()
                }, incrStack: function () {
                    return this.stackSlot++, this.stackSlot > this.stackVars.length && this.stackVars.push("stack" + this.stackSlot), this.topStackName()
                }, topStackName: function () {
                    return "stack" + this.stackSlot
                }, flushInline: function () {
                    var t = this.inlineStack;
                    if (t.length) {
                        this.inlineStack = [];
                        for (var e = 0, n = t.length; n > e; e++) {
                            var r = t[e];
                            r instanceof i ? this.compileStack.push(r) : this.pushStack(r)
                        }
                    }
                }, isInline: function () {
                    return this.inlineStack.length
                }, popStack: function (t) {
                    var e = this.isInline(), n = (e ? this.inlineStack : this.compileStack).pop();
                    if (!t && n instanceof i)return n.value;
                    if (!e) {
                        if (!this.stackSlot)throw new h("Invalid stack pop");
                        this.stackSlot--
                    }
                    return n
                }, topStack: function (t) {
                    var e = this.isInline() ? this.inlineStack : this.compileStack, n = e[e.length - 1];
                    return !t && n instanceof i ? n.value : n
                }, quotedString: function (t) {
                    return '"' + t.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"'
                }, setupHelper: function (t, e, i) {
                    var n = [], r = this.setupParams(t, n, i), s = this.nameLookup("helpers", e, "helper");
                    return {
                        params: n,
                        paramsInit: r,
                        name: s,
                        callParams: ["depth0"].concat(n).join(", "),
                        helperMissingParams: i && ["depth0", this.quotedString(e)].concat(n).join(", ")
                    }
                }, setupOptions: function (t, e) {
                    var i, n, r, s = [], o = [], a = [];
                    s.push("hash:" + this.popStack()), this.options.stringParams && (s.push("hashTypes:" + this.popStack()), s.push("hashContexts:" + this.popStack())), n = this.popStack(), r = this.popStack(), (r || n) && (r || (this.context.aliases.self = "this", r = "self.noop"), n || (this.context.aliases.self = "this", n = "self.noop"), s.push("inverse:" + n), s.push("fn:" + r));
                    for (var h = 0; t > h; h++)i = this.popStack(), e.push(i), this.options.stringParams && (a.push(this.popStack()), o.push(this.popStack()));
                    return this.options.stringParams && (s.push("contexts:[" + o.join(",") + "]"), s.push("types:[" + a.join(",") + "]")), this.options.data && s.push("data:data"), s
                }, setupParams: function (t, e, i) {
                    var n = "{" + this.setupOptions(t, e).join(",") + "}";
                    return i ? (this.useRegister("options"), e.push("options"), "options=" + n) : (e.push(n), "")
                }
            };
            for (var c = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "), p = n.RESERVED_WORDS = {}, l = 0, u = c.length; u > l; l++)p[c[l]] = !0;
            return n.isValidJavaScriptVariableName = function (t) {
                return !n.RESERVED_WORDS[t] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(t) ? !0 : !1
            }, r = n
        }(n, i), l = function (t, e, i, n, r) {
            "use strict";
            var s, o = t, a = e, h = i.parser, c = i.parse, p = n.Compiler, l = n.compile, u = n.precompile, f = r, d = o.create, m = function () {
                var t = d();
                return t.compile = function (e, i) {
                    return l(e, i, t)
                }, t.precompile = function (e, i) {
                    return u(e, i, t)
                }, t.AST = a, t.Compiler = p, t.JavaScriptCompiler = f, t.Parser = h, t.parse = c, t
            };
            return o = m(), o.create = m, s = o
        }(s, o, h, c, p);
        return l
    }();
    return t
});

/* filePath fetchtemp/scripts/liveShare_89b0a7ef_ef38efba.js*/

/* filePath fetchtemp/scripts/liveShare_template_1be776c9.js*/

define("liveShare#1.0.15/template", ["artTemplate#3.0.3"], function (artTemplate) {
    artTemplate = new artTemplate();
    var _template = {};
    var shareLayout = [];
    shareLayout.push('<div class=\"mod-share__1015 {{cls}}\"><p>')
    shareLayout.push('  {{each types}}')
    shareLayout.push('    <a class=\"w-icon-{{$index}}\" data-sharetarget=\"{{$index}}\" href=\"#\"></a>')
    shareLayout.push('  {{/each }}')
    shareLayout.push('</p></div>')

    _template.shareLayout = artTemplate("shareLayout", shareLayout.join(''));

    var tip = [];
    tip.push('<div class=\"mod-tips__1015 {{cls}}\">')
    tip.push('  <div class=\"mod-tips-inner\"></div>')
    tip.push('  <span class=\"w-arr {{directClass}}\"></span>')
    tip.push('</div>')

    _template.tip = artTemplate("tip", tip.join(''));

    var weixin = [];
    weixin.push('<div class=\"mod-weixin__1015\">')
    weixin.push('  <iframe frameborder=\"0\" scrolling=\"no\" src=\"about:blank\"></iframe>')
    weixin.push('  <span class=\"weixin-code js_weixin_box\">')
    weixin.push('    <span class=\"arr\"></span>')
    weixin.push('  </span>')
    weixin.push('</div>')

    _template.weixin = artTemplate("weixin", weixin.join(''));

    _template.helper = function (name, helper) {
        artTemplate.helper(name, helper);
    }
    return _template;
});
/* filePath fetchtemp/scripts/utils_a21035aa.js*/

define("liveShare#1.0.15/utils", [], function () {
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
            s = decodeURIComponent(item[1]) || '';

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

define("liveShare#1.0.15/tip", ['F_glue',
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
            this.directClass = {
                top: 'w-arr-top', left: 'w-arr-left',
                right: 'w-arr-right', bottom: 'w-arr-bottom', none: ''
            };
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

define("liveShare#1.0.15/weixin", [
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

define("liveShare#1.0.15/statistic", ["liveShare#1.0.15/utils",
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

define("liveShare#1.0.15", ['F_glue',
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
        qqzone: {},
        weixin: {}
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
                    params.title = title + content;
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
/* filePath fetchtemp/scripts/videoCore_3b31a880_089aed40.js*/

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
                return (function (offset) {
                    var endstr = document.cookie.indexOf(";", offset);
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
    function getRandomUid() {
        var date = new Date().getTime(),
            uid = '',
            fn = '',
            sn = '';

        fn = ((Math.random() * 2147483648) | 0).toString(36);
        sn = Math.round(Math.random() * 10000);
        uid = date + '_' + fn + sn;
        return uid;
    }


    function sendXV(playermsg, type) {
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
        params.ref = window.location.href.replace(/#/g, '$');
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
            data: [],
            width: 600,
            height: 455,
            id: "player",
            autoPlay: true,
            poster: "",
            controls: true,
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

        init: function () {
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

            this.bind(this.video, "pause", function () {
                _this.settings.pauseCallback.call(_this);
            });

            this.bind(this.video, "playing", function () {
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

        playing: function () {
        },
        pause: function () {
        },

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
        videoFactory: function () {
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
        bind: function (target, e, callback, useCapture) {
            try {
                target.addEventListener(e, function (event) {
                    callback(event);
                }, useCapture ? useCapture : false);
            } catch (e) {
                throw new Error("check the params.");
            }
        },

        // 检查视频的状态
        checkVideoState: function (video) {
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
            url: "",
            width: 300,
            height: 225,
            id: "",
            version: [10, 0, 200]
        }, settings);
        this.el = document.getElementById(elmId);
        // 参数
        this.params = {};
        // 参数
        this.variables = {};
    };

    Player.prototype = {

        addParam: function (name, value) {
            this.params[name] = value;
        },

        addVariable: function (name, value) {
            this.variables[name] = value;
        },

        getVariables: function () {
            var a = [], o = this.variables;
            for (var i in o) {
                a.push(i + "=" + o[i]);
            }
            return a.join("&");
        },

        // todo: isIE并没有在此函数中声明和赋值。
        getParamString: function (isIE) {
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
        callExternal: function (movieName, method, param, mathodCallback) {
            var o = navigator.appName.indexOf("Microsoft") !== -1 ? window[movieName] : document[movieName];
            o[method](param, mathodCallback);
        },

        play: function () {
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
        getVersion: function () {
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
        bIsIpad: bIsIpad,
        bIsIphone: bIsIphoneOs,
        bIsMidp: bIsMidp,
        bIsUc: bIsUc,
        bIsAndroid: bIsAndroid,
        bIsCE: bIsCE,
        bIsWM: bIsWM,
        bIsUc7: bIsUc7
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

define("videoCore#1.0.6", [], function () {
    return {
        version: '1.0.6',
        Player: F.video.Player,
        Html5Video: F.video.Html5Video,
        ClientRedirect: ClientRedirect,
        sendHTML5VideoInfo: sendHTML5VideoInfo
    };
});
/* filePath fetchtemp/scripts/livepage_core_13a502a6_72a02852.js*/

/* filePath fetchtemp/scripts/LivePage_template_f66e2d7d.js*/

define("LivePage#1.5.21/template", ["artTemplate#3.0.3"], function (artTemplate) {
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

    _template.Skeleton = artTemplate("Skeleton", Skeleton.join(''));

    var contentBlock = [];
    contentBlock.push('<div class=\"mod-news-content\">')
    contentBlock.push('    ')
    contentBlock.push('    <div class=\"news-con \">')
    contentBlock.push('        <h3 class=\"news-title\">')
    contentBlock.push('            {{if title_link}}')
    contentBlock.push('              <a href=\"{{title_link}}\" target=\"_blank\">{{#title}}</a>')
    contentBlock.push('            {{else}}')
    contentBlock.push('              <span>{{#title}}</span>')
    contentBlock.push('            {{/if}}')
    contentBlock.push('        </h3>')
    contentBlock.push('        <div class=\"info\">')
    contentBlock.push('            {{if hasContent}}')
    contentBlock.push('                {{#abstract1}}')
    contentBlock.push('                {{if abstract_link}}<a href=\"{{abstract_link}}\" target=\"_blank\">[详细]</a>{{/if}}')
    contentBlock.push('            {{/if}}')
    contentBlock.push('        </div>')
    contentBlock.push('        {{include \'replyContent\' $value}}')
    contentBlock.push('        {{if image}}')
    contentBlock.push('        <div class=\"news-pho news-type\" data-mid=\"{{mid}}\" data-image=\"{{image}}\">')
    contentBlock.push('            <span class=\"inner js_p_img\" data-mid=\"{{mid}}\" data-image=\"{{image}}\">')
    contentBlock.push('                <img src=\"{{converImage}}\" alt=\"\">')
    contentBlock.push('            </span>')
    contentBlock.push('        </div>')
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

    _template.contentBlock = artTemplate("contentBlock", contentBlock.join(''));

    var moreBtn = [];
    moreBtn.push('<div class=\"mod-showMoreBtn\">')
    moreBtn.push('        <a href=\"##\" class=\"w-wide\"><span class=\"w-txt\">显示更多</span></a>')
    moreBtn.push('        <a href=\"##\" class=\"w-narrow\"><span class=\"w-txt\">加载更多内容</span></a>')
    moreBtn.push('</div>')

    _template.moreBtn = artTemplate("moreBtn", moreBtn.join(''));

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

    _template.newsItem = artTemplate("newsItem", newsItem.join(''));

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

    _template.newsListtop = artTemplate("newsListtop", newsListtop.join(''));

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

    _template.replyContent = artTemplate("replyContent", replyContent.join(''));

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

    _template.statusLine = artTemplate("statusLine", statusLine.join(''));

    var timeLine = [];
    timeLine.push('<div class=\"mod-lineTitle\">')
    timeLine.push('    <h4 class=\"title\">{{$value}}</h4>')
    timeLine.push('</div>')

    _template.timeLine = artTemplate("timeLine", timeLine.join(''));

    _template.helper = function (name, helper) {
        artTemplate.helper(name, helper);
    }
    return _template;
});
/* filePath fetchtemp/scripts/LivePage_de1de74a.js*/

define("LivePage#1.5.21", ["F_glue", 'jquery#1.8.1', 'F_WidgetBase', 'handlebar#1.3.3', 'livePic#1.0.9', 'comment#1.1.14', 'liveShare#1.0.15', 'liveVideo#1.1.4', "LivePage#1.5.21/template"]
    , function (glue, $, WidgetBase, Handlebars, LivePic, Comment, LiveShare, LiveVideo, template) {

        // handlebars register
        Handlebars.registerHelper('each', function (context, options) {
            var ret = "";
            for (var i = 0, j = context.length; i < j; i++) {
                ret = ret + options.fn(context[i]);
            }
            return ret;
        });

        Handlebars.registerHelper('if', function (conditional, options) {
            if (conditional) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('content', function (context, options) {
            return context;
        });

        //end handlebars register

        //当前数据状态
        var currentStatus = {
            headPageNo: -1,  //最前接收的最后的页号
            headPageReceiveLength: 0, //最前接收页号接收的最后一条数据mid
            tailPageNo: 10000000,  //数据尾接收的页号
            tailPageReceiveLength: 0, //数据尾接收的最后一条数据的mid
            topMid: -1,  //最后一次接收的置顶消息
            update: 0   //最后一次接收新数据的更新时间
        };

        var receivingDatas = {}; //接收中的数据
        var reveiveParam = null; //接收到的元数据对象
        var alluserResult = {}; //接收的用户评论数
        //默认是5秒轮询param一次，该数据会根据查询的接口进行变化,f4与cdn的接口轮询周期不一样
        var interval = -1;
        var itemCache = {};  //item id的缓存列表
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

            version: '1.5.21',
            type: 'LivePage',
            /**
             * 创建对象模型
             */
            createModel: function () {
                this.shareClassName = "";
                this.paramError = false;  //数据请求异常
                this.liveSwfUrl = "http://y0.ifengimg.com/swf/ifengFreePlayer_v5.0.71.swf";
                this.model = glue.modelFactory.define(function (vm) {
                    vm.metaAddr = ''; //元数据的请求地址
                    vm.f4Addr = 'http://rtst.ifeng.com/508df9aec9e2a/data/'; //'http://f4.ifeng.com/508df9aec9e2a/data/';   //数据请求的地址
                    vm.liveid = -1;     //直播间id
                    vm.cdnAddr = 'http://h0.ifengimg.com/508df9aec9e2a/data/';//'http://h0.ifengimg.com/508df9aec9e2a/data/';   //当f4不存在，会直播间关闭时使用的cdn地址
                    vm.appSyn = false;
                    vm.appAddr = 'http://liveapi.ifeng.com/data/get/'; // 无线数据请求的地址
                    vm.livestatus = 1;   //图文直播的状态 , 1 开启， 0 关闭
                    vm.itemList = [];  //图文元素对象列表
                    vm.f4Interval = 10000;  //f4请求元数据的间隔
                    vm.cdnInterval = 60 * 60 * 1000;  //cdn请求元数据的间隔
                    vm.topItem = null;   //头条
                    vm.pageSize = 10;  //一页数据的总数
                    vm.reqPageSize = 10;  //一次请求的数据数量
                    vm.updateMaxTime = 60 * 60 * 1000;
                    vm.timeIncrease = 60 * 1000; //递增时间数
                    vm.increaseabelRange = 10 * 60 * 1000;  //多长时间没有数据更新时递增时间
                    vm.disapTime = 10 * 1000;   //新推送的内容的特效显示时间
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
                    vm.hotSize = 10;   //最热评论显示的数量
                    vm.lastSize = 10;  //最新评论显示的数量
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
            bindDomEvent: function () {
                var _self = this;

                $(this.container).find(".js_refresh").bind("click", function () {
                    window.location.href = window.location.href;
                });

                $(this.container).find(".js_sort").bind("click", function () {
                    sortType = (sortType == "desc" ? "asc" : "desc");
                    $(this).text((sortType == "desc" ? "正序显示" : "降序显示"));
                    _self.restart();
                    return false;
                })

                $(this.container).find('.mod-loading').hide();
                $(this.container).on('click', '.box_more', function () {
                    $(_self.container).find('.mod-loading').show();
                    $(this).hide();
                    var more = $(this);
                    _self.requestMore(function () {
                        $(_self.container).find('.mod-loading').hide();
                        more.show();
                    });
                    return false;
                });
                //1、图片代理事件
                $(this.container).on("click", '.js_p_img', function () {
                    if (currentVideo != null) {
                        $(_self.container).find('.closeVideo').each(function () {
                            if ($(this).css('display') != 'none') {
                                var vid = $(this).attr('data-vid');
                                var mid = $(this).attr('data-mid');
                                var isTop = $(this).attr('data-isTop');
                                var id = isTop + '_' + mid + '_' + vid;
                                currentVideo.destroy();
                                currentVideo = null;
                                $(this).hide();
                                $('#' + id).hide();
                                $(this).parents('.js_p_video').find('.js_inner').show();
                            }
                        })
                    }
                    var picSrc = $(this).attr('data-image');
                    if (picSrc != '') {
                        livePic.show(picSrc);
                    }
                    return false;
                });
                //视频代理事件
                $(this.container).on("click", '.js_icon-video', function () {
                    //先关闭正在播放的视屏
                    if (currentVideo != null) {
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
                    var id = isTop + '_' + mid + '_' + vid;
                    var videoContainer = $('#' + id);
                    videoContainer.show();
                    var vw = _self.model.videoWidth;
                    var vh = _self.model.videoRatio * vw;
                    currentVideo = new LiveVideo(_self);
                    currentVideo.create(id, {
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
                $(this.container).on('click', '.closeVideo', function () {
                    var vid = $(this).attr('data-vid');
                    var mid = $(this).attr('data-mid');
                    var isTop = $(this).attr('data-isTop');
                    var id = isTop + '_' + mid + '_' + vid;
                    if (currentVideo != null) {
                        currentVideo.destroy();
                        currentVideo = null;
                    }
                    $(this).hide();
                    $('#' + id).hide();
                    $(this).parents('.js_p_video').find('.js_inner').show();
                })
                //展开评论
                $(this.container).on('click', '.js_commentArrow', function () {

                    var _id = $(this).attr('data-id');
                    var title = $(this).attr('data-title');
                    var isTop = $(this).attr('data-isTop');
                    var id = isTop + '_' + _id;  //置顶与普通的id可能是相同的，通过top防止id重复
                    if (itemCommentCache[id] === undefined) {
                        var comment = new Comment(_self);
                        comment.create($(this).parents('.js_liveComment').find('.js_commentContainer')[0], {
                            'model.docUrl': _self.model.speUrl + _id,
                            'model.docName': title,
                            'model.speUrl': '', //_self.model.speUrl, 非专题不需要传递speUrl
                            'model.showHot': _self.model.showHot,
                            'model.showLast': _self.model.showLast,
                            'model.useComment': _self.model.useComment,
                            'model.isSpecial': _self.model.isSpecial,
                            'model.isFang': _self.model.isFang,
                            'model.hotSize': _self.model.hotSize,
                            'model.lastSize': _self.model.lastSize,
                            'model.showLastTitle': _self.model.showLastTitle,
                            'model.showHotTitle': _self.model.showHotTitle,
                            'model.showHotMoreBtn': _self.model.showHotMoreBtn,
                            'model.showLastMoreBtn': _self.model.showLastMoreBtn,
                            'model.theme': _self.model.commentTheme,
                            'model.fllowScroll': _self.model.commentFllowScroll,
                            'model.showLoginBtn': false,
                            'model.isInner': true,
                            'model.needLogin': _self.model.commentNeedLogin,
                            'scrollToDom': $(this).parents('.js_liveComment')
                        });
                        itemCommentCache[id] = comment;
                        $(this).addClass('comment-btn-on');
                        $(this).parents('.news-bottom').find('.p-comment-line-arr').css('display', 'block');
                        $(this).parents('.js_liveComment').find('.js_commentContainer').addClass('p-commentBox');
                        $(this).parents('.news-bottom-p').removeClass('news-bottom-p-bottom');
                    } else {
                        var comment = itemCommentCache[id];
                        if (comment.isHide()) {
                            comment.show();
                            $(this).addClass('comment-btn-on');
                            $(this).parents('.news-bottom').find('.p-comment-line-arr').css('display', 'block');
                            $(this).parents('.js_liveComment').find('.js_commentContainer').addClass('p-commentBox');
                            $(this).parents('.news-bottom-p').removeClass('news-bottom-p-bottom');
                        } else {
                            comment.hide();
                            $(this).removeClass('comment-btn-on');
                            $(this).parents('.news-bottom').find('.p-comment-line-arr').css('display', 'none');
                            $(this).parents('.js_liveComment').find('.js_commentContainer').removeClass('p-commentBox');
                            $(this).parents('.news-bottom-p').addClass('news-bottom-p-bottom');
                        }
                    }
                    return false;
                })
                $(this.container).on('click', '.js_share_btn', function () {
                    $('.js_share_btn').removeClass('share-btn-on');
                    var mid = $(this).attr('data-id');
                    if (liveShare) {
                        if (liveShare.isHide != true) {
                            liveShare.hide();
                            return false;
                        }
                        var items = _self.model.itemList;
                        var ret = null;
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if (item.mid == mid) {
                                ret = item;
                                break;
                            }
                        }
                        if (item != null) {
                            var params = {};
                            params.title = item.title.replace(/<[^>]+>/g, '');
                            params.content = item.abstract.replace(/<[^>]+>/g, '');
                            if (item.image != '' && typeof item.image != 'undefined') {
                                params.pic = item.image;
                            }
                            liveShare.changeContent(params);
                            $(this).addClass('share-btn-on');
                            liveShare.show(this, _self.model.shareOrg);
                        }
                    }
                    return false;
                });
                $('body').bind('click', function () {
                    if (liveShare) {
                        liveShare.hide();
                        $('.js_share_btn').removeClass('share-btn-on');
                    }
                });
            },

            /**
             * 绑定事件，可以是数据对象绑定，或者是dom事件绑定
             */
            bindDataEvent: function () {
                var _self = this;
                //置顶消息，推送消息
                this.model.$watch('topItem', function (newValue) {
                    _self.renderTop($('.js_timelineTop'), newValue);
                });
                this.model.itemList.$watch('push', function (items) {
                    //当数据的发生变化时监控，items push的数据，绘制数据
                    _self.renderItems($('.js_timelineContainer'), items, false);
                });
                this.model.itemList.$watch('unshift', function (items) {
                    //当数据的发生变化时监控，items push的数据，绘制数据
                    _self.renderItems($('.js_timelineContainer'), items, true);
                });

                this.model.itemList.$watch('clear', function () {
                    //清空数据
                    _self.clearItem($('.js_timelineContainer'));
                });

                var live_content = {
                    //获取索引文件成功，服务器端回调函数(data:索引文件数据对象)
                    success: function (data) {
                        reveiveParam = data;
                    },
                    //获取单页数据成功，服务器端回调函数(dataList:单页数据列表 ， pageIndex：文件索引号)
                    singleSuccess: function (dataList, pageIndex) {
                        receivingDatas[pageIndex] = dataList;
                    }
                };
                window.live_content = live_content;
                //注册获取评论数回调事件
                window.livePage_commentAllUsercallback = function (_result) {
                    var result = null;
                    if ($.isPlainObject(_result)) {
                        result = [_result];
                    } else {
                        result = _result;
                    }
                    if (result != null && result.length) {
                        for (var i = 0; i < result.length; i++) {
                            var resultItem = result[i]
                            alluserResult[resultItem.doc_url] = resultItem.allcount;
                        }
                    }
                }
            },

            createComplete: function () {
                if (liveShare == null) {
                    liveShare = new LiveShare(this);
                    liveShare.create(null, {types: this.model.shareTypes, 'cls': this.shareClassName, 'isHide': true});
                }
                if (livePic == null) {
                    livePic = new LivePic(this);
                    livePic.create(null, {
                        srcServeUrl: this.model.imageServer,
                        srcRatio: this.model.picImageRatio
                    });
                }
                this.requestParam();
            },

            resolveTemplate: function () {
                //var html = compiledTemplate({});
                var html = template.Skeleton({deviceType: glue.device.type});
                this.container.innerHTML = html;
                this.ownerNode = this.container;
            },

            /**
             *  定时请求param数据，请求最新的索引文件
             */
            requestParam: function () {
                var _self = this;
                if (this.model.appSyn) {

                    interval = (interval == -1 ? this.model.f4Interval : interval);
                    this.request(this.model.appAddr + this.getParamUrl(),
                        function () {
                        },
                        _self.processParamData);

                } else {
                    if (!this.paramError) { //如果有异常则调用cdn
                        interval = (interval == -1 ? this.model.f4Interval : interval);
                        this.request(this.model.f4Addr + this.getParamUrl(),
                            function () {
                                interval = this.model.cdnInterval;
                                this.model.livestatus = 0;  //设置为关闭状态
                                this.paramError = true
                                request(this.model.cdnAddr + this.getParamUrl(), function () {
                                    setTimeout(_self.requestParam, interval); //TODO 失败后继续查询，失败多次后需要有策略减少y0服务器的请求
                                }, _self.processParamData)
                            },
                            _self.processParamData);
                    } else {
                        //如果是关闭则直接调用cdn地址
                        interval = (interval == -1 ? this.model.cdnInterval : interval);
                        this.request(this.model.cdnAddr + this.getParamUrl(),
                            function () {
                                setTimeout(_self.requestParam, interval); //TODO 失败后继续查询
                            },
                            _self.processParamData)
                    }
                }

            },


            request: function (requestUrl, errorFn, sucessFn) {
                var _self = this;
                $.getScript(requestUrl)
                    .done(function (script, textStatus) {
                        sucessFn.apply(_self);
                    })
                    .fail(function (jqxhr, settings, exception) {
                        errorFn.apply(_self);
                    });
            },

            /**
             * 得到请求的地址
             */
            getRequestHostAddr: function () {
                var host = '';
                if (this.model.appSyn) {
                    host = this.model.appAddr;
                } else {
                    host = this.model.livestatus == 1 ? this.model.f4Addr : this.model.cdnAddr;
                }
                return host;
            },

            getOrgiInterval: function () {
                var interval = 0;
                if (this.model.appSyn) {
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
            processParamData: function () {
                var _self = this;
                var paramData = reveiveParam;
                console.log(paramData);
                reveiveParam = {};
                this.model.livestatus = paramData.status; //设置当前的状态
                if (paramData.status) {  //如果当前是正常状态则重置params的请求路径
                    this.paramError = false;
                }
                this.setStatus(parseInt(paramData.status));
                if (paramData.onlinecount) {  //设置在线人数
                    this.setOnlineCount(paramData.onlinecount);
                }
                total = paramData.total;  //当前总数页
                if (currentStatus.update == 0) {  //系统初始状态
                    currentStatus.update = paramData.update;
                    var reqPageIndex = []; //请求的数据页面
                    var reqCount = 0;

                    /**
                     * 数据请求
                     * @param pageIndex 请求页
                     * @param nextPageFn 当数据不够时下一页的方法
                     * @param pageIndexConditionFn  判断请求页是否超过最大或最小
                     */
                    var req = function (pageIndex, nextPageFn, pageIndexConditionFn) {
                        _self.requestData(pageIndex, function (pageIndex, dataList) {
                            reqPageIndex.push(pageIndex);
                            reqCount += dataList.length;
                            if (reqCount >= _self.model.reqPageSize || pageIndexConditionFn(pageIndex)) { //TODO 当升序时不需要
                                //数据已经获取完毕，记录当前请求状态调用显示
                                _self.tailData(reqPageIndex, _self.model.reqPageSize);
                                _self.setTimeoutParam();
                            } else {
                                req(nextPageFn(pageIndex), nextPageFn, pageIndexConditionFn);
                            }
                        })
                    };
                    if (sortType == "asc") {
                        //升序查询
                        req(1, function (pageIndex) {
                            return pageIndex + 1
                        }, function (pageIndex) {
                            return pageIndex + 1 > total
                        });
                    } else {
                        //降序查询
                        req(total, function (pageIndex) {
                            return pageIndex - 1
                        }, function (pageIndex) {
                            return pageIndex - 1 < 1
                        });
                    }
                    //req(total); //请求数据
                    _self.processTop(paramData);
                } else if (paramData.update > currentStatus.update && sortType == 'desc') { //只有时间大于时上次请求才会更新,当升序时不在请求数据
                    currentStatus.update = paramData.update;
                    var reqPageIndex = []; //请求的数据页面
                    interval = _self.getOrgiInterval();
                    lostTime = 0;
                    var req = function (pageIndex, maxTotal) {
                        _self.requestData(pageIndex, function (pageIndex, dataList) {
                            reqPageIndex.push(pageIndex);
                            if (pageIndex + 1 <= maxTotal) {
                                //继续请求页面
                                req(pageIndex + 1, maxTotal);
                            } else {
                                //没有数据可以获取
                                _self.headData(reqPageIndex)
                                _self.setTimeoutParam();
                            }
                        })
                    };
                    req(currentStatus.headPageNo, total); //请求数据,从最低开始请求
                    _self.processTop(paramData);
                } else {
                    //没有数据更新，检查没有更新的时间总量 lostTime > 10 * 60 * 1000 ,
                    var curDate = new Date();
                    if (lastUpdateTime == null) {
                        lastUpdateTime = curDate;
                    } else {
                        if (((curDate.getTime() - lastUpdateTime.getTime()) >= _self.model.increaseabelRange) && interval < _self.model.updateMaxTime) {
                            interval += _self.model.timeIncrease;
                            lastUpdateTime = curDate;
                        }
                    }
                    this.setTimeoutParam();
                    return;
                }
            },

            requestMore: function (completeFn) {
                var _self = this;
                var reqPageIndex = []; //请求的数据页面
                var reqCount = 0;

                var req = function (pageIndex, nextPageFn, pageIndexConditionFn) {
                    _self.requestData(pageIndex, function (pageIndex, dataList) {
                        reqPageIndex.push(pageIndex);
                        reqCount += currentStatus.tailPageNo == pageIndex ? dataList.length - currentStatus.tailPageReceiveLength : dataList.length;
                        if (reqCount > _self.model.reqPageSize || pageIndexConditionFn(pageIndex)) {
                            //currentStatus.tailPageNo = pageIndex;
                            //数据已经获取完毕，记录当前请求状态调用显示
                            _self.tailData(reqPageIndex, _self.model.reqPageSize);
                            if (completeFn) {
                                completeFn();
                            }
                        } else {
                            req(nextPageFn(pageIndex), nextPageFn, pageIndexConditionFn);
                        }
                    })
                };
                if (sortType == "asc") {
                    //升序
                    req(currentStatus.tailPageNo, function (pageIndex) {
                        return pageIndex + 1
                    }, function (pageIndex) {
                        return pageIndex + 1 > total
                    });
                } else {
                    //降序
                    req(currentStatus.tailPageNo, function (pageIndex) {
                        return pageIndex - 1
                    }, function (pageIndex) {
                        return pageIndex - 1 < 1
                    });
                }
            },

            setTimeoutParam: function () {
                var _self = this;
                if (runStatus != 'stop') {
                    setTimeout(function () {
                        _self.requestParam();
                    }, interval);
                }
            },

            stop: function () {
                runStatus = 'stop';
            },

            start: function () {
                if (runStatus == 'stop') {
                    runStatus = 'running';
                    this.requestParam();
                }
            },

            /**
             * 处理置顶信息，使用jquery getScript方式，得到的数据是reveiveParam
             * @param paramData 请求数据的元数据
             */
            processTop: function (paramData) {
                //装载指定消息
                var _self = this;
                var hostAdd = this.getRequestHostAddr();
                if (paramData.topMid && (paramData.topMid != currentStatus.topMid)) { //处理置顶消息
                    $.getScript(hostAdd + _self.getDataUrl(paramData.topPage)).done(function () {
                        var items = receivingDatas[paramData.topPage];
                        for (var i = 0; i < items.length; i++) {
                            if (paramData.topMid == items[i].mid) {
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
            requestData: function (pageIndex, fn) {
                var _self = this;
                var hostAdd = this.getRequestHostAddr();
                $.getScript(hostAdd + _self.getDataUrl(pageIndex)).done(function () {
                    fn(pageIndex, receivingDatas[pageIndex]);
                });
            },

            /**
             * 添加数据到头
             * @param pageIndexs 添加数据的索引页位置列表
             */
            headData: function (pageIndexs) {
                var temp = [];
                for (var i = 0; i < pageIndexs.length; i++) {
                    if (currentStatus.tailPageNo == -1) {
                        currentStatus.tailPageNo = pageIndexs[i]  //如果没有设置tailPageNo则初始化
                    }
                    var items = receivingDatas[pageIndexs[i]];
                    items.sort(function (a, b) {  //需要升序
                        return a.mid - b.mid
                    });
                    for (var j = 0; j < items.length; j++) {
                        var item = items[j];
                        if (!itemCache[item.mid]) {
                            itemCache[item.mid] = true;
                            temp.push(item);
                        }
                    }
                }
                if (temp.length > 0) {
                    this.model.itemList.unshift.apply(this.model.itemList, temp);
                    this.commentAllUser(temp);
                }
            },

            /**
             * 添加数据到尾
             * @param pageIndexs 添加数据的索引页位置列表
             * @param showCount  需要显示的数量
             */
            tailData: function (pageIndexs, showCount) {
                var count = 0;
                var temp = [];
                for (var i = 0; i < pageIndexs.length; i++) {
                    var items = receivingDatas[pageIndexs[i]];

                    if (currentStatus.headPageNo == -1) {
                        currentStatus.headPageNo = pageIndexs[i] //如果没有设置headPageNo则初始化
                    }

                    if (sortType == "desc") {
                        for (var j = 0; j < items.length; j++) {
                            var item = items[j];
                            if (count < showCount //总数控制
                                && ( currentStatus.tailPageNo > pageIndexs[i] || (pageIndexs[i] == currentStatus.tailPageNo && currentStatus.tailPageReceiveLength < j) )) {
                                currentStatus.tailPageReceiveLength = j;
                                currentStatus.tailPageNo = pageIndexs[i];
                                itemCache[item.mid] = true;
                                temp.push(item);
                                count++;
                            }
                        }
                        if (currentStatus.tailPageNo == 1 && currentStatus.tailPageReceiveLength + 1 == receivingDatas[1].length) {
                            $('.mod-showMoreBtn').hide();
                        }
                    } else {  //降序需要对数据排序
                        if (currentStatus.tailPageNo == 10000000) {
                            currentStatus.tailPageNo = 1;
                        }
                        if (currentStatus.tailPageReceiveLength == 0 && receiveLengthReset == false) {
                            currentStatus.tailPageReceiveLength = items.length;
                            receiveLengthReset = true;
                        }

                        for (var j = items.length - 1; j >= 0; j--) {
                            if (count < showCount //总数控制
                                && (
                                    currentStatus.tailPageNo < pageIndexs[i]
                                    || (pageIndexs[i] == currentStatus.tailPageNo
                                    && (currentStatus.tailPageReceiveLength > j))
                                )) {
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

                if (temp.length > 0) {
                    this.model.itemList.push.apply(this.model.itemList, temp);
                    this.commentAllUser(temp);
                }
            },

            /**
             * 请求用户评论数
             */
            commentAllUser: function (items) {
                var _self = this;
                var urls = [];
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    urls.push(encodeURIComponent(this.model.speUrl + item.mid));
                }
                var docurls = urls.join('|');
                $.getScript(this.model.commentServer + "&docurl=" + docurls).done(function () {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var alluserItem = alluserResult[_self.model.speUrl + item.mid];
                        var o = $("." + commentCountIdPrefix + item.mid);
                        /*
                         o.each(function(){
                         $(this).text(alluserItem);
                         });
                         */
                        if (o.text) {
                            o.text(alluserItem);
                        }
                    }
                });
            },

            replaceImgServer: function (imageAddr) {
                if (imageAddr == '') return '';
                return this.model.imageServer + '/' + this.model.imageRatio + '/' + imageAddr.replace(/http[s]?:\/\//, '');
            },

            getParamUrl: function () {
                return this.model.liveid + '/param.json';
            },

            getDataUrl: function (pageIndex) {
                return this.model.liveid + '/' + pageIndex + '.json';
            },

            /**
             * 设置直播间状态
             * @param isActive 是否是有效
             */
            setStatus: function (isActive) {
                if (isActive) {
                    $('.mod-onAirTitle .title').removeClass('finishtitle').addClass('title');
                } else {
                    $('.mod-onAirTitle .title').removeClass('title').addClass('finishtitle');
                }
            },

            setOnlineCount: function (onlinecount) {
                if (onlinecount) {
                    $('.mod-onAirTitle .p-numTips .num').text(onlinecount);
                }
            },

            //============================ 页面渲染方法
            /**
             * 重画置顶
             * @param 需要绘制的容器
             */
            renderTop: function (container, itemData, isTop) {
                itemData.topclass = 'js_timelineTop';
                itemData.converImage = this.replaceImgServer(itemData.image); //使用图片服务器转换图片大小
                itemData.isTop = 'true';
                itemData.abstract1 = itemData.abstract;
                itemData.hasRelyContent = itemData.quote_message.length > 0;
                itemData.deviceType = glue.device.type;
                if (itemData.hasRelyContent) {
                    itemData.quote_message[0].converImage = this.replaceImgServer(itemData.quote_message[0].image);
                    itemData.quote_message[0].covertime = timeHandleNosecond(itemData.quote_message[0].ctime);
                }
                itemData.hasContent = typeof itemData.abstract != 'undefined' && itemData.abstract != '';
                itemData.topctime = timeHandle(itemData.ctime);
                itemData.daytime = timeHandleDay(itemData.ctime);
                var html = template.newsListtop({'items': [itemData]});
                container.empty();
                container.append(html)
            },

            //排序
            restart: function () {
                //清除数据
                this.model.itemList.clear();
                this.stop(); //停止请求数据
                //重置初始参数
                //当前数据状态
                currentStatus = {
                    headPageNo: -1,  //最前接收的最后的页号
                    headPageReceiveLength: 0, //最前接收页号接收的最后一条数据mid
                    tailPageNo: 10000000,  //数据尾接收的页号
                    tailPageReceiveLength: 0, //数据尾接收的最后一条数据的mid
                    topMid: -1,  //最后一次接收的置顶消息
                    update: 0   //最后一次接收新数据的更新时间
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
            clearItem: function (container) {
                container.empty();
                $('.mod-showMoreBtn').show();
            },

            /**
             * 绘制更新的内容
             * @param {Object}contain 需要绘制的容器
             * @param {Array}items 需要绘制的数据
             * @param {boolean}isHead  是否是头部添加
             */
            renderItems: function (container, items, ishead) {
                var curDate = new Date();
                var year = curDate.getFullYear()
                var month = curDate.getMonth() + 1;
                var date = curDate.getDate();
                var curDateStr = year + '-' + ((month + '').length == 1 ? '0' + month : month) + '-' + ((date + '').length == 1 ? '0' + date : date);
                var temp = [];
                for (var i = 0; i < items.length; i++) {
                    var dateStr = getDate(items[i].ctime);
                    items[i].isTop = 'false';
                    items[i].abstract1 = items[i].abstract;
                    items[i].converImage = this.replaceImgServer(items[i].image); //使用图片服务器转换图片大小
                    items[i].covertime = timeHandle(items[i].ctime);
                    items[i].daytime = timeHandleDay(items[i].ctime);
                    items[i].hasRelyContent = items[i].quote_message.length > 0;
                    items[i].hasContent = typeof items[i].abstract != 'undefined' && items[i].abstract != '';
                    items[i].deviceType = glue.device.type;
                    items[i].from = items[i].from;
                    items[i].uid = items[i].ugcuid;

                    if (items[i].hasRelyContent) {
                        items[i].quote_message[0].converImage = this.replaceImgServer(items[i].quote_message[0].image);
                        items[i].quote_message[0].coverCtime = timeHandleNosecond(items[i].quote_message[0].ctime);
                    }
                    items[i].converVedioImage = this.replaceImgServer(items[i].video_image);
                    if (ishead) {
                        items[i].isTop = false;
                        items[i].ishead = true;
                    }
                    if ((typeof lastItemDate == 'undefined' || dateStr != lastItemDate) && dateStr != curDateStr) {
                        items[i].dateStr = dateStr;
                        lastItemDate = dateStr;
                    }
                    temp.push(items[i])
                }
                if (temp.length == 0) return;
                var html = template.newsItem({'items': temp})
                if (ishead) {
                    container.children().first().before(html);
                    var st = function () {
                        setTimeout(function () {
                            if ($('.mod-news-block-new').length == 0) {
                                st();
                            } else {
                                $('.mod-news-block-new').removeClass('mod-news-block-new');
                            }
                        }, 5000)
                    };
                    st();
                } else {
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
                return time.substring(0, time.lastIndexOf(':'));
            } catch (e) {
                return time;
            }
        };

        //事件格式化
        var timeHandleDay = function (time) {
            try {
                return time.substring(0, time.lastIndexOf(' '));
            } catch (e) {
                return time;
            }
        };

        var getDate = function (time) {
            if (glue.device.type == 'mobile') {
                var dateArray = time.split(' ')[0].split('-');
                dateArray.shift();
                return dateArray.join('-');
            } else {
                return time.split(' ')[0];
            }
        }


        return LivePage;
    });
