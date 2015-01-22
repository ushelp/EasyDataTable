/**
 * jQuery EasyDataTable Plugin
 * 
 * Version 1.11.0
 * 
 * http://easyproject.cn
 * https://github.com/ushelp/EasyDataTable
 * 
 * Copyright 2014 Ray [ inthinkcolor@gmail.com ]
 * 
 * Dependencies: jQuery
 * 
 */
(function(window) {
    var cacheData = {}, cacheDataRow = {}, cacheThLength = {}, cachePageTheme = {}, cacheLanguage = {}, cacheOrderArrow = {}, cacheInitLoading = {}, cacheStartFun = {}, cacheEndFun = {}, cacheUserPage = {}, cacheInit = {}, cacheDefaultRow = {},order_default="&uarr;&darr;",order_up="&uarr;",order_down="&darr;",orderCache={}, rowEvents={}, rowEventsDT={},cacheLoadDefault = {}, cacheSizeArray = {}, innerLoad = function(tableid, easydataParams, jsonData) {
        var nowDataTable = $("[id='" + tableid + "']");
        if (nowDataTable.length == 0) {
            return;
        }
        easydataParams = easydataParams == undefined ? {} :easydataParams;
        var dataForm = $("form").has(nowDataTable);
        var pagenoEle = dataForm.find("[name='pageNo']");
        var rowperpageEle = dataForm.find("[name='rowPerPage']");
        if (!Validate.integer.test(pagenoEle.val())) {
            pagenoEle.val(1);
        }
        if (!Validate.integer.test(rowperpageEle.val())) {
            rowperpageEle.val(this.default_row);
        }
        if (!cacheInit[tableid]) {
            cacheInit[tableid] = false;
            if (easydataParams.start) {
                cacheStartFun[tableid] = easydataParams.start;
            }
            if (easydataParams.end) {
                cacheEndFun[tableid] = easydataParams.end;
            }
            var defRow = DataTable.default_row;
            if (Validate.integer.test(easydataParams.row)) {
                defRow = easydataParams.row;
            } else {
                var defRow = dataForm.find(".panelBar").attr("row");
                if (!Validate.integer.test(defRow)) {
                    defRow = DataTable.default_row;
                }
            }
            cacheDefaultRow[tableid] = defRow + "";
            var initPage = "<div id='datatable_initPageData' style='display:none'>" + "<input type='hidden' name='pageNo' value='1'/>" + "<input type='hidden' name='rowPerPage' value='" + defRow + "' />" + "</div>";
            dataForm.append(initPage);
        } else {
            dataForm.find(".panelBar [id='datatable_pagenum']").html(pageNumSpan(tableid, pagenoEle.val(), cacheData[tableid]["totalCount"]));
        }
        if (cacheStartFun[tableid]) {
            try {
                cacheStartFun[tableid](nowDataTable[0], !cacheInit[tableid]);
            } catch (e) {}
        }
        if (!(easydataParams.pagetheme == undefined)) {
            cachePageTheme[tableid] = easydataParams.pagetheme;
        }
        if (!cachePageTheme[tableid]) {
            var usetheme = dataForm.find(".panelBar").attr("pagetheme");
            if (usetheme) {
                cachePageTheme[tableid] = usetheme;
            } else {
                cachePageTheme[tableid] = DataTable.FULL_PAGE;
            }
            if (!cacheInit[tableid]) {
                cacheUserPage[tableid] = dataForm.find(".panelBar").html();
                if (cacheUserPage[tableid]) {
                    cacheUserPage[tableid] = cacheUserPage[tableid].replace(/\n/g, "").replace(/\r/g, "").replace("}%", "}%\r\n");
                }
                dataForm.find(".panelBar").html("");
            }
        }
        if (!cacheDataRow[tableid]) {
            var dataRow = ("<tr>" + nowDataTable.find(" tr:eq(1)").html() + "</tr>").replace(/\n/g, "").replace(/\r/g, "").replace("}%", "}%\r\n");
            cacheDataRow[tableid] = dataRow;
            nowDataTable.find(" tr:eq(1)").find("td").css("border", "0");
            nowDataTable.find(" tr:eq(1)").css("border", "0");
        }
        if (cacheLoadDefault[tableid] == undefined) {
            var table_loading_attr = nowDataTable.attr("loading");
            if (table_loading_attr) {
                cacheLoadDefault[tableid] = table_loading_attr;
            } else {
                cacheLoadDefault[tableid] = DataTable.loading_show;
            }
            if (!(easydataParams.loading == undefined)) {
                cacheLoadDefault[tableid] = easydataParams.loading + "";
            }
        }
        postParam = dataForm.serialize();
        loadShow(tableid, nowDataTable);
        if (easydataParams.language) {
            cacheLanguage[tableid] = easydataParams.language;
        }
        if (cacheLanguage[tableid] == undefined) {
            cacheLanguage[tableid] = DataTable.default_lang;
        }
        $.post(dataForm.attr("action"), postParam, function(data) {
            if (typeof data == "string") {
                data = eval("(" + data + ")");
            }
            cacheData[tableid] = data;
            dataShow(tableid, nowDataTable, dataForm, data);
            if (cacheEndFun[tableid]) {
                try {
                    cacheEndFun[tableid](nowDataTable[0], !cacheInit[tableid]);
                } catch (e) {}
            }
            if (!cacheInit[tableid]) {
                cacheInit[tableid] = true;
                $("#datatable_initPageData").remove();
            }
        });
    }, entityMap = {
        unescape:{
            "&amp;":"&",
            "&lt;":"<",
            "&gt;":">",
            "&quot;":'"',
            "&#x27;":"'"
        }
    }, entityRegexes = {
        unescape:new RegExp("(" + [ "&amp;", "&lt;", "&gt;", "&quot;", "&#x27;" ].join("|") + ")", "g")
    }, unescape = function(string) {
        if (string == null) return "";
        return ("" + string).replace(entityRegexes["unescape"], function(match) {
            return entityMap["unescape"][match];
        });
    }, formatContent = function(content, jsondata) {
        content = unescape(content);
        var reg = /\{([^}]+)\}/g;
        var regExp = /\%\{(.*)\}\%/g;
        var arrExp = /\[([0-9]+)\]/g;
        content = content.replace(regExp, function(m, i) {
            with (jsondata) {
                try {
                    try {
                        var res = eval($.trim(i).replace(arrExp, function(n, j) {
                            return jsondata[j];
                        }));
                        return res == undefined ? "" :res;
                    } catch (e) {
                        return m;
                    }
                } catch (e) {
                    return m;
                }
            }
        });
        content = content.replace(reg, function(m, i) {
            with (jsondata) {
                try {
                    var res;
                    if ((i + "").indexOf(".") != -1) {
                        res = jsondata[i];
                    }
                    if (res) {
                        return res;
                    }
                    if (/\[([0-9]+)\]/.test(i)) {
                        return jsondata[i.substring(1, i.length - 1)];
                    }
                    return eval($.trim(i)) == null ? "" :eval($.trim(i));
                } catch (e) {
                    return "";
                }
            }
        });
        return content;
    }, clone = function(o) {
        if (o == null || o == undefined) {
            return o;
        }
        var o2 = o.constructor === Array ? [] :{};
        for (var i in o) {
            o2[i] = typeof o[i] == "object" ? clone(o[i]) :o[i];
        }
        return o2;
    }, getPostParam = function(postParam) {
        var params = {};
        var exclued_params = "#maxPage#rowPerPage#datatableIndex#datatableCount#pageNo#totalCount#order#sort#".toLowerCase();
        for (var i in postParam) {
            if (exclued_params.indexOf("#" + postParam[i].name.toLowerCase() + "#") == -1) {
                params[postParam[i].name] = postParam[i].value.replace(/(^\s+)|(\s+$)/g, "");
            }
        }
        return params;
    }, loadShow = function(tableid, nowDataTable) {
        if (cacheLoadDefault[tableid]) {
            var loading_type = cacheLoadDefault[tableid].toLowerCase();
            if (loading_type == "default") {
                if (cacheInitLoading[tableid] == undefined) {
                    nowDataTable.find(" tr:gt(0)").remove();
                    cacheInitLoading[tableid] = "loaded";
                }
                nowDataTable.find(" tr:gt(0)").find("*").on("click", function() {
                    return false;
                });
                nowDataTable.find(" tr:gt(0)").find("*").css("color", "gray");
            } else if (loading_type == "none") {
                if (cacheInitLoading[tableid] == undefined) {
                    nowDataTable.find(" tr:gt(0)").remove();
                    cacheInitLoading[tableid] = "loaded";
                }
                nowDataTable.find("tr:gt(0)").hide();
            } else if (loading_type == "hide") {
                if (cacheInitLoading[tableid] == undefined) {
                    nowDataTable.find(" tr:gt(0)").remove();
                    cacheInitLoading[tableid] = "loaded";
                }
                nowDataTable.find("tr:gt(0)").css("visibility", "hidden");
            } else if (loading_type == "show") {
                nowDataTable.find(" tr:gt(0)").remove();
                $("[id='" + tableid + "_loading_div']").hide();
                nowDataTable.after("<div id='" + tableid + "_loading_div' class='DataTable_Loading'>" + DataTable.loading_msg + "</div>");
            } else {
                nowDataTable.find(" tr:gt(0)").remove();
                $("[id='" + tableid + "_loading_div']").hide();
                nowDataTable.after("<div id='" + tableid + "_loading_div' class='DataTable_Loading'>" + cacheLoadDefault[tableid] + "</div>");
            }
        }
    }, initDataAndContent = function(tableid, nowDataTable, dataForm, data) {
        var content = "";
        var j = 0;
        var valueObject = nowDataTable.attr("value");
        var dataTableOrder = "";
        var dataTableSort = "";
        if (valueObject) {
            dataTableOrder = data[valueObject].order;
            dataTableSort = data[valueObject].sort;
            if (!dataTableOrder) {
                dataTableOrder = data.order;
            }
            if (!dataTableSort) {
                dataTableSort = data.sort;
            }
            if (!dataTableOrder) {
                dataTableOrder = "";
            }
            if (!dataTableSort) {
                dataTableSort = "";
            }
            cacheData[tableid].pageNo = parseInt(data[valueObject].pageNo);
            cacheData[tableid].rowPerPage = parseInt(data[valueObject].rowPerPage);
            cacheData[tableid].totalCount = parseInt(data[valueObject].totalCount);
            cacheData[tableid].order = dataTableOrder;
            cacheData[tableid].sort = dataTableSort;
            cacheData[tableid].maxPage = Math.floor((cacheData[tableid].totalCount - 1) / cacheData[tableid].rowPerPage + 1);
            var filterData = data[valueObject].data;
            for (var i in filterData) {
                filterData[i].datatableCount = parseInt(j) + 1;
                filterData[i].datatableIndex = parseInt(j);
                for (var property in data) {
                    if (property != valueObject) {
                        filterData[i][property] = data[property];
                    }
                }
                filterData[i].pageNo = parseInt(data[valueObject].pageNo);
                filterData[i].rowPerPage = parseInt(data[valueObject].rowPerPage);
                filterData[i].totalCount = parseInt(data[valueObject].totalCount);
                filterData[i].maxPage = Math.floor((parseInt(filterData[i].totalCount) - 1) / parseInt(filterData[i].rowPerPage) + 1);
                filterData[i].key = i;
                filterData[i].order = dataTableOrder;
                filterData[i].sort = dataTableSort;
                content += formatContent(cacheDataRow[tableid], filterData[i]);
                j++;
            }
        } else {
            dataTableOrder = data.order;
            dataTableSort = data.sort;
            if (!dataTableOrder) {
                dataTableOrder = "";
            }
            if (!dataTableSort) {
                dataTableSort = "";
            }
            cacheData[tableid].maxPage = Math.floor((parseInt(data.totalCount) - 1) / parseInt(data.rowPerPage) + 1);
            var filterData = data.data;
            for (var i in filterData) {
                for (var property in data) {
                    if (property != "data") {
                        filterData[i][property] = data[property];
                    }
                }
                filterData[i].datatableCount = parseInt(j) + 1;
                filterData[i].datatableIndex = parseInt(j);
                filterData[i].key = i;
                filterData[i].maxPage = Math.floor((parseInt(filterData[i].totalCount) - 1) / parseInt(filterData[i].rowPerPage) + 1);
                filterData[i].order = dataTableOrder;
                filterData[i].sort = dataTableSort;
                content += formatContent(cacheDataRow[tableid], filterData[i]);
                j++;
            }
        }
        dataForm.find(" .pages .totalCount").html(j);
        return {
            content:content,
            dataTableOrder:dataTableOrder,
            dataTableSort:dataTableSort
        };
    }, dataShow = function(tableid, nowDataTable, dataForm, data) {
        var res = initDataAndContent(tableid, nowDataTable, dataForm, data);
        pageTheme(tableid, cachePageTheme[tableid]);
        dataForm.find(" .pages .totalCount").html(data["totalCount"]);
        dataForm.find(" .mycombox").val(data["rowPerPage"]);
        dataForm.find(" [name='pageNo']").val(data["pageNo"]);
        dataForm.find(" .pages .maxPage").html(Math.floor((parseInt(data["totalCount"]) - 1) / parseInt(data["rowPerPage"]) + 1));
        dataForm.find("[name='rowPerPage']").off("change");
        dataForm.find("[name='rowPerPage']").on("change", function(e) {
            var row = $(this).val();
            var pagenoEle = dataForm.find("[name='pageNo']");
            var maxPage = Math.floor((cacheData[tableid]["totalCount"] - 1) / row + 1);
            if (pagenoEle.val() > maxPage) {
                pagenoEle.val(maxPage);
            }
            DataTable.load(tableid);
        });
        pageCheck(tableid);
        var orderInfo = '<tr name="sort_order_hidden" style="display:none"><td colspan=\'' + $("[id='" + tableid + "'] tr:eq(0)").find("th").length + "'><input type='hidden' name='order' value='" + res.dataTableOrder + "'/>" + "<input type='hidden' name='sort' value='" + res.dataTableSort + "'/></td></tr>";
        res.content += orderInfo;
        nowDataTable.find(" tr:gt(0)").remove();
        $("[id='" + tableid + "_loading_div']").remove();
        nowDataTable.append(res.content);
     // 表格效果事件
    	addRowEvent(nowDataTable);
    }, dataObject = function(k, v) {
        this.k = k;
        this.v = v;
    }, dataSort = function(data, dataTableSort, dataTableOrder) {
        var l = true;
        if (!$.isArray(data)) {
            l = false;
        }
        var a = new Array();
        for (var i in data) {
            a.push(new dataObject(i, data[i]));
        }
        if (/\[([0-9]+)\]/.test(dataTableSort)) {
            dataTableSort = dataTableSort.substring(1, dataTableSort.length - 1);
        }
        a.sort(function(x, y) {
            if (dataTableSort.toLowerCase() == "key") {
                if (x.k == y.k) {
                    return 0;
                }
                if (dataTableOrder.toLowerCase() == "asc") {
                    if (x.k > y.k) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    if (y.k > x.k) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            } else {
                if (x.v[dataTableSort] == y.v[dataTableSort]) {
                    return 0;
                }
                if (dataTableOrder.toLowerCase() == "asc") {
                    if (x.v[dataTableSort] > y.v[dataTableSort]) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    if (y.v[dataTableSort] > x.v[dataTableSort]) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            }
        });
        var b = [];
        if (l) {
            var j = 0;
            for (var i = 0; i < a.length; i++) {
                b[j] = a[i].v;
                j++;
            }
        } else {
            for (var i = 0; i < a.length; i++) {
                b[a[i].k] = a[i].v;
            }
        }
        return b;
    }, Validate = {
        integer:/^[1-9][0-9]*$/
    }, firstDisable = function(tableid, first, prev) {
        if (!first) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            first = dataForm.find("[name='first']");
            prev = dataForm.find("[name='prev']");
        }
        first.off("click");
        prev.off("click");
        first.removeClass("pageGoHover");
        prev.removeClass("pageGoHover");
        first.addClass("firstlastgo");
        prev.addClass("firstlastgo");
        first.unbind("mouseenter").unbind("mouseleave");
        prev.unbind("mouseenter").unbind("mouseleave");
    }, firstEnable = function(tableid, first, prev) {
        if (!first) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            first = dataForm.find("[name='first']");
            prev = dataForm.find("[name='prev']");
        }
        first.off("click");
        prev.off("click");
        first.on("click", function() {
            DataTable.first(tableid);
        });
        prev.on("click", function() {
            DataTable.prev(tableid);
        });
        first.unbind("mouseenter").unbind("mouseleave");
        prev.unbind("mouseenter").unbind("mouseleave");
        first.removeClass("firstlastgo");
        prev.removeClass("firstlastgo");
    }, lastDisable = function(tableid, last, next) {
        if (!last) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            last = dataForm.find("[name='last']");
            next = dataForm.find("[name='next']");
        }
        last.off("click");
        next.off("click");
        last.removeClass("pageGoHover");
        next.removeClass("pageGoHover");
        last.addClass("firstlastgo");
        next.addClass("firstlastgo");
        last.unbind("mouseenter").unbind("mouseleave");
        next.unbind("mouseenter").unbind("mouseleave");
    }, lastEnable = function(tableid, last, next) {
        if (!last) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            last = dataForm.find("[name='last']");
            next = dataForm.find("[name='next']");
        }
        next.off("click");
        last.off("click");
        next.on("click", function() {
            DataTable.next(tableid);
        });
        last.on("click", function() {
            DataTable.last(tableid);
        });
        next.unbind("mouseenter").unbind("mouseleave");
        last.unbind("mouseenter").unbind("mouseleave");
        next.removeClass("firstlastgo");
        last.removeClass("firstlastgo");
    }, pageCheck = function(tableid) {
        var dataForm = $("form").has("[id='" + tableid + "']");
        var maxPage = cacheData[tableid]["maxPage"];
        var nowPage = parseInt(cacheData[tableid]["pageNo"]);
        var first = dataForm.find("[name='first']");
        var prev = dataForm.find("[name='prev']");
        var next = dataForm.find("[name='next']");
        var last = dataForm.find("[name='last']");
        var pagegoto = dataForm.find("[name='pagegoto']");
        var numgoto = dataForm.find("[name='numgoto']");
        firstEnable(tableid, first, prev);
        lastEnable(tableid, last, next);
        pagegoto.off("click");
        numgoto.off("click");
        pagegoto.on("click", function() {
            DataTable.gopage(tableid);
        });
        numgoto.on("click", function(e) {
            DataTable.numgoto(tableid, e);
        });
        next.removeClass("firstlastgo");
        last.removeClass("firstlastgo");
        loadInit();
        if (nowPage <= 1) {
            firstDisable(tableid, first, prev);
        }
        if (nowPage >= maxPage) {
            lastDisable(tableid, last, next);
        }
    }, pageMsgCkeck = function(tableid) {
        if (!cacheLanguage[tableid].first) {
            cacheLanguage[tableid].first = DataTable.default_lang.first;
        }
        if (!cacheLanguage[tableid].previous) {
            cacheLanguage[tableid].previous = DataTable.default_lang.previous;
        }
        if (!cacheLanguage[tableid].next) {
            cacheLanguage[tableid].next = DataTable.default_lang.next;
        }
        if (!cacheLanguage[tableid].last) {
            cacheLanguage[tableid].last = DataTable.default_lang.last;
        }
        if (!cacheLanguage[tableid].totalPage) {
            cacheLanguage[tableid].totalPage = DataTable.default_lang.totalPage;
        }
        if (!cacheLanguage[tableid].rowPerPage) {
            cacheLanguage[tableid].rowPerPage = DataTable.default_lang.rowPerPage;
        }
        if (!cacheLanguage[tableid].totalCount) {
            cacheLanguage[tableid].totalCount = DataTable.default_lang.totalCount;
        }
    }, pageNumSpan = function(tableid, nowPage, totalCount) {
        nowPage = parseInt(nowPage);
        var maxPage = Math.floor((parseInt(totalCount) - 1) / parseInt(cacheData[tableid]["rowPerPage"]) + 1);
        var pageStart = nowPage - 3;
        var pageEnd = nowPage + 3;
        if (pageStart < 1) {
            pageStart = 1;
            pageEnd = pageStart + 6;
            if (pageEnd > maxPage) {
                pageEnd = maxPage;
            }
        }
        if (pageEnd > maxPage) {
            pageEnd = maxPage;
            pageStart = pageEnd - 6;
            if (pageStart < 1) {
                pageStart = 1;
            }
        }
        var pageNum = "";
        for (var i = pageStart; i <= pageEnd; i++) {
            if (i == nowPage) {
                pageNum += '<span class="pagego nowpagenum" name="numgoto"  value="numgoto_' + i + '">' + i + "</span>";
            } else {
                pageNum += '<span class="pagego" name="numgoto" value="numgoto_' + i + '">' + i + "</span>";
            }
        }
        return pageNum;
    }, pageTheme = function(tableid, theme) {
        var dataForm = $("form").has("[id='" + tableid + "']");
        var content = "";
        if (theme && theme.toLowerCase() == "no") {
            content = cacheUserPage[tableid];
        } else {
            var pageshowCount = dataForm.find(".panelBar").length;
            if (pageshowCount != 0) {
                var sizeArray = cacheSizeArray[tableid];
                if (!sizeArray) {
                    var sizes = dataForm.find(".panelBar").attr("size");
                    var sizeArray = [ cacheData[tableid].rowPerPage ];
                    if (sizes) {
                        sizeArray = sizes.split(",");
                    }
                    if (cacheDefaultRow[tableid]) {
                        var sa = "#" + sizeArray.join("#") + "#";
                        if (sa.indexOf("#" + cacheDefaultRow[tableid] + "#") != -1) {
                            cacheDefaultRow[tableid] = null;
                        } else {
                            sizeArray.push(cacheDefaultRow[tableid]);
                        }
                    }
                    sizeArray.sort(function(i, j) {
                        return parseInt(i) - parseInt(j);
                    });
                    cacheSizeArray[tableid] = sizeArray;
                }
                pageMsgCkeck(tableid);
                var rowPerPageIndex = cacheLanguage[tableid].rowPerPage.indexOf("{0}");
                var rowPerPageStart = cacheLanguage[tableid].rowPerPage.substring(0, rowPerPageIndex);
                var rowPerPageEnd = cacheLanguage[tableid].rowPerPage.substring(rowPerPageIndex + 3);
                var rowNumSpan = '<div class="pages"><span>' + rowPerPageStart + "</span>" + '<select class="mycombox" name="rowPerPage" >';
                $.each(sizeArray, function(i, v) {
                    rowNumSpan += '<option value="' + v + '" >' + v + "</option>";
                });
                rowNumSpan += "</select><span>" + rowPerPageEnd + "，";
                var totalPageIndex = cacheLanguage[tableid].totalPage.indexOf("{0}");
                var totalPageStart = cacheLanguage[tableid].totalPage.substring(0, totalPageIndex);
                var totalPageEnd = cacheLanguage[tableid].totalPage.substring(totalPageIndex + 3);
                var totalCountIndex = cacheLanguage[tableid].totalCount.indexOf("{0}");
                var totalCountStart = cacheLanguage[tableid].totalCount.substring(0, totalCountIndex);
                var totalCountEnd = cacheLanguage[tableid].totalCount.substring(totalCountIndex + 3);
                rowNumSpan += totalCountStart + '<label class="totalCount"></label>' + totalCountEnd + "</span></div>";
                var start = '<div class="pages " style="float: right;text-align: right;">';
                var totalPageSpan = '<span class="totalPage">' + totalPageStart + '<label class="maxPage"></label>' + totalPageEnd + "</span>";
                var back = '<span class="pagego" name="first">' + cacheLanguage[tableid].first + "</span>" + '<span class="pagego" name="prev">' + cacheLanguage[tableid].previous + "</span>";
                var pageNum = "<span id='datatable_pagenum'>" + pageNumSpan(tableid, cacheData[tableid]["pageNo"], cacheData[tableid]["totalCount"]) + "</span>";
                var forward = '<span class="pagego" name="next">' + cacheLanguage[tableid].next + "</span>" + '<span class="pagego" name="last">' + cacheLanguage[tableid].last + "</span>";
                var pagegotoSpan = '<span class="pagego"><input type="text" class="gototxt" name="pageNo"  /></span>';
                pagegotoSpan += '<span class="pagegoto" name="pagegoto">&gt;&gt;</span>';
                var end = "</div>";
                if (!theme || theme.toUpperCase() == "FULL") {
                    content = rowNumSpan + start + totalPageSpan + back + pageNum + forward + pagegotoSpan + end;
                } else if (theme.toUpperCase() == "SIMPLE") {
                    content = rowNumSpan + start + totalPageSpan + back + forward + pagegotoSpan + end;
                } else {
                    content = rowNumSpan + start + totalPageSpan + back + pageNum + forward + pagegotoSpan + end;
                }
            }
        }
        dataForm.find(".panelBar").html(formatContent(content, cacheData[tableid]));
        dataForm.find(".panelBar .customPaging").show();
    }, loadInit = function() {
        $(".pagego").hover(function() {
            $(this).addClass("pageGoHover");
        }, function() {
            $(this).removeClass("pageGoHover");
        });
    }, pageRangeChk = function(tableid) {
        var dataForm = $("form").has("[id='" + tableid + "']");
        var pagenoEle = dataForm.find("[name='pageNo']");
        var row = dataForm.find("[name='rowPerPage']").val();
        var maxPage = Math.floor((cacheData[tableid]["totalCount"] - 1) / row + 1);
        if (pagenoEle.val() > maxPage) {
            pagenoEle.val(maxPage);
        }
    }, fldeChk = function(tableid, nowpage) {
        firstEnable(tableid);
        lastEnable(tableid);
        if (nowpage <= 1) {
            firstDisable(tableid);
            if (cacheData[tableid]["maxPage"] > 1) {
                lastEnable(tableid);
            }
        }
        if (nowpage >= cacheData[tableid]["maxPage"]) {
            lastDisable(tableid);
            if (cacheData[tableid]["maxPage"] > 1) {
                firstEnable(tableid);
            }
        }
    },
  //渲染页面的排序指示符号
    dtSort=function(){
    	$("table:has([sort]),table:has([staticSort])")
    	.each(function() {
    		var table = $(this);
    		var tableid = table.attr("id");
    		table.find("[sort],[staticSort]").each(
    			function() {
    				var o = $(this);
    				var oDef=order_default;
    				var oU=order_up;
    				var oD=order_down;
    				
    				var oSel;
    				if(orderCache){
    					$.each(orderCache,function(k,v){
    						var k2=","+k.toLowerCase()+",";
    						tableidTmp=","+tableid.toLowerCase()+",";
    						
    						if(k2.indexOf(tableidTmp)!=-1){
    							oSel=true;
    						}
    						if(oSel){
    							orderCache[k].order_default?oDef=orderCache[k].order_default:"";
    							orderCache[k].order_up?oU=orderCache[k].order_up:"";
    							orderCache[k].order_down?oD=orderCache[k].order_down:"";
    							return;
    						}
    					});
    				}
    				var sortHtml;
    				if(o.find("span.sortArrow").length>0){
    					sortHtml=o.html().replace(o.find("span.sortArrow").html(),oDef);
    				}else{
    					sortHtml=o.html()+ "<span class='sortArrow' name='orderspan'>"+oDef+"</span>";
    				}
    				o.html(sortHtml);
    				o.css("cursor", "pointer");
    				o.off("click");
    				var dataForm = $("form").has(
    						"[id='" + tableid
    								+ "']");
    				o.on("click",function(e) {
    									var sort = o.attr("sort")|| o.attr("staticSort");
    									
    									if (dataForm
    											.find("input[name='sort']").length > 0) {
    										dataForm.find("input[name='sort']").val(sort);
    										
    										dataForm.find("input[name='order']")
    												.val(
    														dataForm
    																.find(
    																		"input[name='order']")
    																.val()
    																.toLowerCase() == "asc" ? "desc"
    																: "asc");

    										
    										var arrowObj = $(
    												this)
    												.find(
    														"[name='orderspan']");
    										if (cacheOrderArrow[tableid]) {
    											cacheOrderArrow[tableid]
    													.html(oDef);
    										}
    										if (dataForm
    												.find(
    														"input[name='order']")
    												.val() == "asc") {
    											arrowObj
    													.html(oU);
    										} else if (dataForm
    												.find(
    														"input[name='order']")
    												.val() == "desc") {
    											arrowObj
    													.html(oD);
    										} else {
    											arrowObj
    													.html(oDef);
    										}
    										cacheOrderArrow[tableid] = arrowObj;
    										if (o.attr("sort")) {
    											
    											DataTable.load(tableid);
    										} else {
    											DataTable
    													.staticDataSort(
    															tableid,
    															sort,
    															dataForm
    																	.find(
    																			"input[name='order']")
    																	.val());
    										}
    									}

    								});
    			});
    				table.find("[sort],[staticSort]").hover(
    						function() {
    							var arrowObj = $(this).find(
    									"[name='orderspan']");
    							arrowObj.removeClass("sortArrow");
    							arrowObj.removeClass("sortArrowDown");
    							arrowObj.addClass("sortArrowHover");
    						},
    						function() {
    							var arrowObj = $(this).find(
    									"[name='orderspan']");
    							arrowObj.removeClass("sortArrowHover");
    							arrowObj.addClass("sortArrow");
    						});
    				table.find("[sort],[staticSort]").on(
    						"mousedown",
    						function() {
    							var arrowObj = $(this).find(
    									"[name='orderspan']");
    							arrowObj.removeClass("sortArrowHover");
    							arrowObj.addClass("sortArrowDown");
    						});
    				table.find("[sort],[staticSort]").on(
    						"mouseup",
    						function() {
    							var arrowObj = $(this).find(
    									"[name='orderspan']");
    							arrowObj.removeClass("sortArrowDown");
    							arrowObj.addClass("sortArrowHover");
    							});
    				});
    },
  //表格效果事件
    addRowEvent=function(nowDataTable){
    	nowDataTable.find(" tr:even").addClass("evenColor");
    	nowDataTable.find(" tr").hover(function() {
    		$(this).addClass("trHover");
    	}, function() {
    		$(this).removeClass("trHover");
    	});
    	var oldTr;
    	nowDataTable.find(" tr").on("click", function() {
    		if($(this).hasClass("trClick")){
    			$(this).removeClass("trClick");
    			oldTr=null;
    		}else{
    			if (oldTr) {
    				oldTr.removeClass("trClick");
    			}
    			
    			$(this).addClass("trClick");
    			oldTr = $(this);			
    		}
    	});
    	var tableid=nowDataTable.attr("id");
    	
    	if(rowEventsDT[tableid]){
    		$.each(rowEventsDT[tableid],function(eventName,fn){
    			nowDataTable.find(" tr").on(eventName,fn);
    		});
    	}else{
    		if(rowEvents){
    			$.each(rowEvents,function(eventName,fn){
    				nowDataTable.find(" tr").on(eventName,fn);
    			});
    		}
    		
    	}

    }
    ;
    
    var DataTable = {
        default_row:5,
        default_matchMode:"like_i",
        loading_show:"default",
        order_default:"&uarr;&darr;",
        order_up:"&uarr;",
        order_down:"&darr;",
        sort:{},
        loading_msg:"Data is loading ......",
        default_lang:{
        	first : "first",
			previous : "previous",
			next : "next",
			last : "last",
			totalCount : "total {0} rows",
			totalPage : "total {0} pages",
			rowPerPage : "page for {0} rows"
        },
        load:function(tableid, easydataParams) {
            innerLoad(tableid, easydataParams);
        },
        resetOrder:function(tableid) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            dataForm.find("[name='order']").val("");
            dataForm.find("[name='sort']").val("");
            if (cacheOrderArrow[tableid]) {
                cacheOrderArrow[tableid].html("&uarr;&darr;");
            }
        },
        reload:function(tableid) {
            DataTable.resetOrder(tableid);
            DataTable.load(tableid);
        },
        out:function(msg) {
            return msg;
        },
        first:function(tableid) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            var pagenoEle = dataForm.find("[name='pageNo']");
            pagenoEle.val(1);
            fldeChk(tableid, 1);
            this.load(tableid);
        },
        prev:function(tableid) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            var pagenoEle = dataForm.find("[name='pageNo']");
            pagenoEle.val(parseInt(cacheData[tableid]["pageNo"]) - 1);
            fldeChk(tableid, pagenoEle.val());
            this.load(tableid);
        },
        next:function(tableid) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            var pagenoEle = dataForm.find("[name='pageNo']");
            pagenoEle.val(parseInt(cacheData[tableid]["pageNo"]) + 1);
            fldeChk(tableid, pagenoEle.val());
            this.load(tableid);
        },
        last:function(tableid) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            var pagenoEle = dataForm.find("[name='pageNo']");
            pagenoEle.val(cacheData[tableid]["maxPage"]);
            fldeChk(tableid, cacheData[tableid]["maxPage"]);
            this.load(tableid);
        },
        gopage:function(tableid) {
            pageRangeChk(tableid);
            var dataForm = $("form").has("[id='" + tableid + "']");
            var pagenoEle = dataForm.find("[name='pageNo']");
            if (cacheData[tableid]["pageNo"] != pagenoEle.val() && Validate.integer.test(pagenoEle.val())) {
                fldeChk(tableid, pagenoEle.val());
                this.load(tableid);
            }
        },
        numgoto:function(tableid, e) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            var pagenoEle = dataForm.find("[name='pageNo']");
            pagenoEle.val($(e.target).text());
            fldeChk(tableid, pagenoEle.val());
            this.load(tableid);
        },
        go:function(tableid, pagenum, row) {
            var dataForm = $("form").has("[id='" + tableid + "']");
            if (dataForm && Validate.integer.test(pagenum)) {
                pagenum = parseInt(pagenum);
                if (pagenum <= 0) {
                    pagenum = 1;
                }
                if (!row || !Validate.integer.test(row)) {
                    row = cacheData[tableid]["rowPerPage"];
                }
                var maxPage = Math.floor((cacheData[tableid]["totalCount"] - 1) / row + 1);
                if (pagenum > maxPage) {
                    pagenum = maxPage;
                }
                var pagenoEle = dataForm.find("[name='pageNo']");
                if (pagenoEle.val()) {
                    pagenoEle.val(pagenum);
                } else {
                    dataForm.append('<input type="hidden" value="' + pagenum + '" name="pageNo"/>');
                }
                var rowPerPageEle = dataForm.find("[name='rowPerPage']");
                if (rowPerPageEle.val()) {
                    rowPerPageEle.val(row);
                } else {
                    dataForm.append('<input type="hidden" value="' + row + '" name="rowPerPage"/>');
                }
                dataForm.find("[name='rowPerPage']").val(row);
                if (cacheData[tableid]["pageNo"] != pagenum) {
                    this.load(tableid);
                }
            }
        },
        checkAll:function(o, name) {
            var cs = o.checked;
            if (cs) {
                $(o.form).find("[name='" + name + "']").each(function() {
                    this.checked = true;
                });
            } else {
                $(o.form).find("[name='" + name + "']").each(function() {
                    this.checked = false;
                });
            }
        },
		setOrder: function(orderParams,datatableid){	
			if(datatableid){
				orderCache[datatableid]={};
				orderCache[datatableid].order_default=orderParams.order_default;
				orderCache[datatableid].order_up=orderParams.order_up;
				orderCache[datatableid].order_down=orderParams.order_down;
			}else{
				order_default=orderParams.order_default;
				order_up=orderParams.order_up;
				order_down=orderParams.order_down;
			}
			
			dtSort();
		},
		/**
		 * 为Datatable的行注册各种处理事件
		 * @param events 注册的事件处理列表
		 * @param datatableid 可选，将事件列表注册到id指定的DataTable
		 */
		setRowEvent: function(events, datatableid){
			if(datatableid){
				rowEventsDT[datatableid]=events;
			}else{
				rowEvents=events;
			}
			
			$(".datatable").each(function(){
				addRowEvent($(this));
			});
			
		},
        init:function() {
            $(".pagego").hover(function() {
                $(this).addClass("pageGoHover");
            }, function() {
                $(this).removeClass("pageGoHover");
            });
            $(".datatable").find("tr:eq(1)").css("visibility", "hidden");
            $(".easydatatable").each(function() {
                var tableid = $(this).attr("id");
                if (!cacheInit[tableid]) {
                    if (tableid) {
                        DataTable.load(tableid);
                    }
                }
            });
            $("[check]").on("click", function() {
                DataTable.checkAll(this, $(this).attr("check"));
            });
            $(".data_search").each(function() {
                var tableid = $(this.form).find("table[id]").attr("id");
                var o = $(this);
                o.off("click");
                o.on("click", function() {
                    if (tableid) {
                        DataTable.load(tableid);
                    }
                });
            });
            dtSort();
        }
    };
    window.DataTable = DataTable;
})(window);