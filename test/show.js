//定义常用数据:热点调查类型和数据条数
define("req_data_type", [], function () {
    return {
        "type": "hot",
        "num": 5,
        "survey_url": "",
        "hot_survey_url": "",
        "layerId": "surveyDiv"
    };
});
define("showResult", ["jquery#1.8.1"], function ($) {
    function showResult(data) {
        var li = $(".surList").find("li");
        var ul = $("#surveyDiv").find(".surList");
        ul.find(".sign").show();
        var i = 0,
            j = 0,
            len = data.length;
        for (i = 0; i < len; i++) {
            var option = data[i].resultArray.option;
            var option_len = option.length;
            var op = li.eq(i).find(".op");
            for (j = 0; j < option_len; j++) {
                var per = option[j].nump.toFixed(2);
                op.eq(j).find(".bar em").animate({
                    width: per + "%"
                }, 1000);
            }
            ;
        }
        ;
    };
    return showResult;
});
define("action", ["req_data_type", "jquery#1.8.1"], function (req_data_type, $) {
    //事件初始化
    var layerId = req_data_type.layerId;
    var initLayer = $("#" + layerId);
    var id, href;
    var init_event = {
        init: function (common_data) {
            this.initInputClick();
            this.initData(common_data);
            this.submit(common_data);
            this.showAll(id);
            this.hover(id);
        },
        initInputClick: function () {
            var inputDom = initLayer.find(".surList input");
            inputDom.on("click", function () {
                var thisDom = $(this);
                if (thisDom.attr("type") == "radio") {
                    thisDom.parent().addClass("js_label");
                    thisDom.parents(".op").siblings().find("label").removeClass("js_label");
                } else {
                    thisDom.parent().toggleClass("js_checklabel");
                }
            });
        },
        initData: function (common_data) {
            id = common_data.data.surveyinfo.id;
            href = common_data.data.surveyinfo.channelurl + "survey.html#id=" + id;
            var length = common_data.data.surveyinfo.questionids.length;
            var j;
            var data = common_data.data.result;
            var votecountList = [];
            for (j = 0; j < length; j++) {
                votecountList[j] = data[j].resultArray.votecount;
            }
            this.votecount = votecountList;
        },
        submit: function (common_data) {
            var _this = this;
            var re_url = "http://sv.ifeng.com/index.php/survey/postsurvey";
            initLayer.on("click", "#surveybtn", function () {
                var data = $('#surveyForm').serialize();
                var url = re_url + "?id=" + id + "&act=postsurvey&" + data + "&ref=" + href;
                var checkResult = _this.checkLi();
                if (checkResult) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'JSONP',
                        success: function get_data(data) {
                            if (data.ifsuccess) {
                                if (common_data.data.surveysetting.isshow == "0") {
                                    $('#surveybtn').removeClass('btn01').addClass('btn01_d');
                                    $('.opTxt input').attr('disabled', 'disabled');
                                    var p_num = parseInt($(".surTit .p_num em").html());
                                    $(".surTit .p_num em").html(p_num + 1);
                                } else {
                                    _this.show_result(common_data);
                                }
                                ;
                                $('#surveybtn').attr({'disabled': 'disabled', 'value': "已提交"});
                            } else {
                                alert(data.msg);
                            }
                            ;
                        },
                        error: function re_error() {
                            alert("error");
                        }
                    });
                }
                ;
            });
        },
        showAll: function (id) {
            var _this = this;
            var id = id;
            initLayer.on("click", ".surresult .all", function () {
                var request_url = "http://sv.ifeng.com/index.php/survey/votecnt?id=" + id;
                $.ajax({
                    url: request_url,
                    type: 'GET',
                    dataType: 'JSONP',
                    success: function get_data(data) {
                        if (data.ifsuccess) {
                            _this.show_result_all(data);
                        } else {
                            alert(data.msg);
                        }
                        ;
                    },
                    error: function re_error() {
                        alert("error");
                    }
                });
                return false;
            });
        },
        checkLi: function () {
            var form = $('form.formSur');
            var ul = form.find('ul.surList');
            var lis = ul.find('li');
            var result = true;
            $.each(lis, function (index, object) {
                if ($(object).attr('data-ismust') == 'true') {
                    if (typeof $(object).find('input:checked').val() == 'undefined') {
                        $(object).find('h3').addClass('error');
                        result = false;
                    } else {
                        $(object).find('h3').removeClass('error');
                    }
                }
            });
            return result;
        },
        show_result: function (common_data) {
            initLayer.find(".all").hide();
            $('#surveybtn').removeClass('btn01').addClass('btn01_d');
            $('.opTxt input').attr('disabled', 'disabled');
            var ul = initLayer.find(".surList");
            var li = ul.find("li");
            //投票总数数列
            var votecount = this.votecount;
            var i, j = 0;
            $.each(li, function (index, object) {
                //投票选项的投票数加1
                var result_div = $(object).find('input:checked').parents(".op");
                //投票总数进行加的假操作
                var count_total_init = parseFloat(votecount[index]);
                var count_total = parseFloat(count_total_init + result_div.length);
                //计算投票的百分比
                var result = $(object).find(".op");
                var perTotal = 0;
                for (i = 0; i < result.length; i++) {
                    //投票数加1
                    if (result.eq(i).find('input').attr("checked") == "checked") {
                        var num = parseInt(result.eq(i).find(".percent").html());
                        num = num + 1;
                        result.eq(i).find(".percent").html(num + "票");
                    }
                    //现在的投票数
                    var count_now = parseFloat(result.eq(i).find(".percent").html());
                    //计算百分数并保留两位小数
                    var per = (count_now / count_total * 100.0).toFixed(2);

                    if (i < result.length - 1) {
                        perTotal = perTotal + parseFloat(per);
                    } else {
                        per = (100 - perTotal).toFixed(2);
                    }
                    //更新百分数
                    result.eq(i).find(".ct").html(per + "%");
                    result.eq(i).find("#graphitem .bar em").animate({
                        width: per + "%"
                    }, 1000);
                }
                ;
            });
            //更新参与人数
            var p_num = parseInt($(".surTit .p_num em").html());
            $(".surTit .p_num em").html(p_num + 1);
            ul.find(".op .opTxt p").width(280);
            ul.find(".sign").show();
            if (common_data.data.surveysetting.jumplink) {
                window.open(common_data.data.surveysetting.jumplink);
            }
            ;
        },
        show_result_all: function (data) {
            var ul = initLayer.find(".surList");
            var li = ul.find("li");
            var data = data.data;
            $.each(li, function (index, object) {
                var option = data[index].resultArray.option;
                var result = $(object).find(".op");
                var i = 0;
                var perTotal = 0;
                for (i = 0; i < result.length; i++) {
                    //计算投票百分比,需考虑投票数为0的情况
                    if (data[index].resultArray.votecount == "0") {
                        per = 0;
                    } else {
                        per = (parseFloat(option[i].num) / parseFloat(data[index].resultArray.votecount) * 100).toFixed(2);
                        if (i < result.length - 1) {
                            perTotal = perTotal + parseFloat(per);
                        } else {
                            per = (100 - perTotal).toFixed(2);
                        }
                    }
                    ;
                    for (var j = 0; j < result.length; j++) {
                        if (result.eq(j).find("input").val() == option[i].itemid) {
                            result.eq(j).find("#graphitem .ct").html(per + "%");
                            result.eq(j).find("#graphitem .percent").html(option[i].num + "票");
                            result.eq(j).find("#graphitem .bar em").animate({
                                width: per + "%"
                            }, 1000);
                        }
                    }
                }
            });
            //更新投票总数
            initLayer.find(".surTit .p_num em").html(data[data.length - 1].survey.pnum);
            ul.find(".op .opTxt p").width(280);
            ul.find(".sign").show();
            $('.tips').fadeIn(2000).fadeOut(2000);
        },
        hover: function (id) {
            initLayer.find(".op").hover(function () {
                $(this).css("background", "#EEF7F7");
            }, function () {
                $(this).css("background", "rgb(255, 255, 255)")
            });
        }
    };
    return init_event;
});
define("getSurveyHtml", ["req_data_type", "showResult", "action", "jquery#1.8.1"], function (req_data_type, showResult, init_event, $) {
    var id;//文章id
    var err_msg = "抱歉，该调查不存在，感谢您的关注!";//错误信息
    var layerId = "surveyDiv";//需要操作的dom的id
    var initDom;
    var survey_url = "http://sv.ifeng.com/index.php/survey/getdata";//请求的接口

    function getSurveyHtml(id) {
        id = parseInt(id);
        //判断调查的id是否存在,存在渲染页面
        if (id) {
            //更新参数
            initParam(req_data_type);
            //请求接口，渲染页面
            renderPage(id);
        }
        ;
    };

    function initParam(req_data_type) {
        //更新需要操作的dom的id
        if (req_data_type.layerId) {
            layerId = req_data_type.layerId;
        }
        ;
        initDom = $("#" + layerId);
        //更新接口地址
        if (req_data_type.survey_url) {
            survey_url = req_data_type.survey_url;
        }
        ;
    };

    function renderPage(id) {
        var id = id;
        var request_url, common_data = null;
        request_url = survey_url + "?id=" + id;
        $.ajax({
            url: request_url,
            type: 'GET',
            dataType: 'JSONP',
            success: function get_data(data) {
                //判断文章上线还是下线 1上线 0下线
                if (data.ifsuccess == 1 && data.data.surveyinfo.isactive == "1") {
                    common_data = data;
                    callback(common_data, id);
                }
                ;
            },
            error: function re_error() {
            }
        });
    };

    function callback(common_data, id) {
        if (common_data) {
            //liststyle显示一条还是全部的标志位，0正常显示 1显示1条
            var showLimit = common_data.data.surveysetting.liststyle;
            var surUrl = common_data.data.surveyinfo.channelurl + "survey.shtml#id=" + id;
            //渲染调查页面主体结构
            var main_dom = pageDom(showLimit, surUrl);
            initDom.append(main_dom);
            //渲染问题部分
            if (showLimit == "0") {
                render_survey(common_data);
            } else {
                render_single_survey(common_data);
            }

            //渲染页面其它部分
            render_other_page(common_data);
            //初始化事件
            init_event.init(common_data);
        }
        ;
    };
    //渲染调查主体部分
    function render_survey(common_data) {
        var ul = initDom.find(".surList");
        //问题个数
        var question_len = common_data.data.surveyinfo.questionids.length;
        var i, j;
        var data = common_data.data.result;
        for (i = 0; i < question_len; i++) {
            var question_li = $("<li></li>");
            var ismust = data[i].resultArray.ismust;//问题是否是必答的标识位
            var option = data[i].resultArray.option;
            var option_len = option.length;
            var choosetype = data[i].resultArray.choosetype;

            //1必答 0选答
            if (ismust) {
                question_li.attr("data-ismust", "true");
            }
            ;
            //更新问题id
            question_li.attr("data-ismust-value", data[i].resultArray.questionid);

            //更新问题
            var question_h = $("<h3></h3>");
            var ismust_em = $("<em></em>");
            ismust_em.addClass("ismust");
            ismust_em.html("(此问必答)");
            var multiple = $("<em></em>");
            multiple.html("(多选)");
            multiple.addClass("multiple");
            question_h.html((i + 1) + "." + data[i].resultArray.question);
            //选项是单选还是多选
            if (choosetype == "single") {
                choosetype = "radio";
            } else {
                choosetype = "checkbox";
                question_h.append(multiple);
                question_h.find(".multiple").show();
            }
            ;

            question_h.append(ismust_em);
            question_li.append(question_h);


            //创建问题选项
            for (j = 0; j < option_len; j++) {
                var option_id = option[j].itemid;//选项id
                var question_id = data[i].resultArray.questionid;
                var choose_content = option[j].title;//选项标题
                var count_num = option[j].num;//投票数
                var per = option[j].nump.toFixed(2);//投票百分比
                //色条控制
                var color_index = parseInt((j + 1) % 7);
                if (!color_index) {
                    color_index = 7;
                }
                ;
                var option_j = question_option(question_id, option_id, choosetype, choose_content, per, count_num, color_index);
                option_j = $(option_j);
                if (choosetype == "checkbox") {
                    option_j.find("label").addClass("checklabel");
                }
                question_li.append(option_j);
            }
            ul.append(question_li);
        }
        ;
        //如果调查过期，显示调查结果
        if (common_data.data.surveyinfo.expire == "0") {
            //更新过期时间,并显示过期时间
            var endtime = common_data.data.surveyinfo.endtime;
            var temp = endtime.split(":");
            endtime = temp[0] + ":00";
            initDom.find(".surbefor span").html(endtime);
            showResult(data);
            ul.find(".op .opTxt input").attr("disabled", "disabled");
            initDom.find(".surresult").hide();
            initDom.find(".surbefor").show();
            initDom.find(".status").html("已结束");
        } else {
            initDom.find(".status").html("进行中");
        }
        ;
    };
    //渲染单条数据
    function render_single_survey(common_data) {
        var ul = initDom.find(".surList");
        var data = common_data.data.result[0].resultArray;
        var option = data.option;
        var question_li = $("<li></li>");
        var question_h = $("<h3></h3>");
        question_h.html(data.question);
        question_li.append(question_h);
        var optionNum = option[0].num;
        var index = 0;
        for (var i = 1, len = option.length; i < len; i++) {
            if (option[i] < optionNum) {
                optionNum = option[i];
                index = i;
            }
        }

        var choosetype = "single";
        var option_id = option[index].itemid;//选项id
        var question_id = data.questionid;
        var choose_content = option[index].title;//选项标题
        var count_num = option[index].num;//投票数
        var per = option[index].nump.toFixed(2);//投票百分比
        //色条控制
        var color_index = parseInt((0 + 1) % 7);
        var option_j = question_option(question_id, option_id, choosetype, choose_content, per, count_num, color_index);
        option_j = $(option_j);
        option_j.find(".bar em").css("width", per + "%");
        option_j.find("p").css("width", "auto");
        question_li.append(option_j).appendTo(ul);
        //如果调查过期，显示调查结果
        if (common_data.data.surveyinfo.expire == "0") {
            initDom.find(".status").html("已结束");
        } else {
            initDom.find(".status").html("进行中");
        }
        ;
    }

    //渲染页面的其它部分
    function render_other_page(common_data) {
        var mainData = common_data.data;
        //更新参与人数
        var pnum = mainData.surveyinfo.pnum;
        initDom.find(".surTit .p_num em").html(pnum);
        //更新标题
        var title = mainData.surveyinfo.title;
        var id = mainData.surveyinfo.id;
        var href = mainData.surveyinfo.channelurl + "/survey.html#id=" + id;
        initDom.find(".surTit h2 a").html(title);
        initDom.find(".surTit h2 a").attr("href", href);
        //问题个数，如果只有一个问题，问题隐藏
        var q_len = mainData.surveyinfo.questionids.length;
        if (q_len == 1) {
            initDom.find(".surList li h3").hide();
        }
        ;
        initDom.find("#surveyForm #surid").attr("value", id);
        //判断是否隐藏查看结果按钮
        if (mainData.surveysetting.isshow == "0") {
            $(".surresult .all").hide();
        }
        ;
        //有广告隐藏logo
        if (adFlagForSurvey && device.type == "pc") {
            initDom.find(".p_logo").addClass("shownone");
        } else {
            initDom.find(".surTit h2").addClass("js_h2");
        }
        ;
        //显示一条隐藏标题
        if (mainData.surveysetting.liststyle == "1") {
            if (adFlagForSurvey && device.type == "pc") {
                initDom.find(".surBox").addClass("js_surBox");
            } else {
                initDom.find(".surBox").addClass("js_no_surBox");
            }
            ;
        }
    };
    //问题选项
    function question_option(question_id, id, type, option, per, num, j) {
        var question_option = "<div class=\"op clearfix\"><span class=\"opTxt\"><label><input type=\"" + type + "\" value=\"" + id + "\" name=\"sur[" + question_id + "][]\"><p>" + option + "<\/p><\/label><\/span><div id=\"graphitem\" class=\"sign\"><p class=\"signbox\"><span class=\"bar\"><em class=\"sgn_" + j + " sgnTie\" style=\"width:0;\"><\/em><\/span><span class=\"ct\">" + per + "%<\/span><strong class=\"percent\">" + num + "票<\/strong><\/p><\/div><\/div>";
        return question_option;
    };
    //页面的dom结构
    function pageDom(showLimit, url) {
        var html_main, html_survey;
        //标题行
        var html_title = "<div class=\"surTit clearfix\"><div class=\"p_num\"><span class=\"status\"><\/span><em><\/em>人参与<\/div><div class=\"p_logo\"><img src=\"http://p1.ifengimg.com/a/2016/0810/8b802fc359c0beesize2_w36_h36.png\"><span>凤凰公测<\/span><\/div><h2><a target=\"_blank\"><\/a><\/h2><\/div>";
        //问题表单
        var html_question = "<form class=\"formSur\" id=\"surveyForm\"><input type=\"hidden\" id=\"surid\" name=\"surid\" value=\"0\"><ul class=\"surList\"><\/ul><\/form>";
        //提示项
        var html_tip = "<div class=\"tips\">请选择您的观点，然后提交<\/div>";
        //提交查看结果
        if (showLimit == "0") {
            var html_result = "<div class=\"surresult clearfix\"><div class=\"all cBlue\"><a href=\"javascript:void(0)\" id=\"getcntbtn\">点击查看结果&gt;&gt;<\/a><\/div><input type=\"button\" hidefoucs=\"true\" id=\"surveybtn\" class=\"btn01\" value=\"提交\"><\/div>";
        } else {
            if (device.type == "pc") {
                var html_result = "<div class=\"tosurvey\"><a target=\"_blank\" href=\"" + url + "\">参与调查<\/a><\/div>";
            } else {
                var html_result = "<div class=\"tosurvey\"><a href=\"" + url + "\">参与调查<\/a><\/div>";
            }
        }

        //调查过期显示内容
        var html_timeout = "<div class=\"surbefor\"><strong>抱歉，本调查已经结束。<\/strong> 截止时间:<span><\/span><\/div>";
        html_survey = "<div class=\"surAfter clearfix\">" + html_question + html_tip + html_result + html_timeout + "<\/div>";
        html_main = "<div class=\"surBox clearfix\" id=\"surBox\">" + html_title + html_survey + "<\/div>";
        return html_main;
    };
    return getSurveyHtml;
});