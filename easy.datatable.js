// jQuery EasyDataTable Plugin
//
// Version 1.7.0
//
// Copy By RAY
// inthinkcolor@gmail.com
// 2013
//
// https://github.com/ushelp/EasyDataTable
//
(function(window) {
  var cacheData = {}, cacheDataRow = {}, cacheThLength = {}, cachePageTheme = {}, cacheLanguage = {}, cacheOrderArrow = {}, cacheInitLoading = {}, cacheStartFun = {}, cacheEndFun = {}, cacheUserPage = {}, cacheInit = {}, cacheDefaultRow = {}, cacheLoadingDefault = {}, formatContent = function(content, jsondata) {
    var reg = /\{([^}]+)\}/g;
    // EasyDataTable 属性表达式
    // var regExp=/\%\{([\s\S]+)\}/g; //语句表达式
    var regExp = /\%\{(.*)\}\%/g;
    // EasyDataTable 语句表达式
    content = content.replace(regExp, function(m, i) {
      with (jsondata) {
        try {
          return eval($.trim(i));
        } catch (e) {
          return m;
        }
      }
    });
    content = content.replace(reg, function(m, i) {
      with (jsondata) {
        try {
          return eval($.trim(i)) == null ? "" :eval($.trim(i));
        } catch (e) {
          return "";
        }
      }
    });
    return content;
  }, Validate = {
    integer:/^[1-9][0-9]*$/
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
    first.off("click");
    prev.off("click");
    next.off("click");
    last.off("click");
    pagegoto.off("click");
    numgoto.off("click");
    first.on("click", function() {
      DataTable.first(tableid);
    });
    prev.on("click", function() {
      DataTable.prev(tableid);
    });
    next.on("click", function() {
      DataTable.next(tableid);
    });
    last.on("click", function() {
      DataTable.last(tableid);
    });
    pagegoto.on("click", function() {
      DataTable.gopage(tableid);
    });
    numgoto.on("click", function(e) {
      DataTable.numgoto(tableid, e);
    });
    first.unbind("mouseenter").unbind("mouseleave");
    prev.unbind("mouseenter").unbind("mouseleave");
    next.unbind("mouseenter").unbind("mouseleave");
    last.unbind("mouseenter").unbind("mouseleave");
    loadInit();
    first.removeClass("firstlastgo");
    prev.removeClass("firstlastgo");
    next.removeClass("firstlastgo");
    last.removeClass("firstlastgo");
    if (nowPage <= 1) {
      first.off("click");
      prev.off("click");
      first.removeClass("pageGoHover");
      prev.removeClass("pageGoHover");
      first.addClass("firstlastgo");
      prev.addClass("firstlastgo");
      first.unbind("mouseenter").unbind("mouseleave");
      prev.unbind("mouseenter").unbind("mouseleave");
    }
    if (nowPage >= maxPage) {
      last.off("click");
      next.off("click");
      last.removeClass("pageGoHover");
      next.removeClass("pageGoHover");
      last.addClass("firstlastgo");
      next.addClass("firstlastgo");
      last.unbind("mouseenter").unbind("mouseleave");
      next.unbind("mouseenter").unbind("mouseleave");
    }
  }, pageMsgCkeck = function(tableid) {
    if (!cacheLanguage[tableid].first) {
      cacheLanguage[tableid].first = DataTable.MSG.first;
    }
    if (!cacheLanguage[tableid].previous) {
      cacheLanguage[tableid].previous = DataTable.MSG.previous;
    }
    if (!cacheLanguage[tableid].next) {
      cacheLanguage[tableid].next = DataTable.MSG.next;
    }
    if (!cacheLanguage[tableid].last) {
      cacheLanguage[tableid].last = DataTable.MSG.last;
    }
    if (!cacheLanguage[tableid].totalPage) {
      cacheLanguage[tableid].totalPage = DataTable.MSG.totalPage;
    }
    if (!cacheLanguage[tableid].rowPerPage) {
      cacheLanguage[tableid].rowPerPage = DataTable.MSG.rowPerPage;
    }
    if (!cacheLanguage[tableid].totalCount) {
      cacheLanguage[tableid].totalCount = DataTable.MSG.totalCount;
    }
  }, pageNumSpan = function(tableid, nowPage) {
    nowPage = parseInt(nowPage);
    var maxPage = Math.floor((parseInt(cacheData[tableid]["totalCount"]) - 1) / parseInt(cacheData[tableid]["rowPerPage"]) + 1);
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
    // 如果使用自定义分页内容（不使用主题）
    if (theme && theme.toLowerCase() == "no") {
      //不使用主题
      content = cacheUserPage[tableid];
    } else {
      var pageshowCount = dataForm.find(".panelBar").length;
      if (pageshowCount != 0) {
        //存在分页标签
        var sizes = dataForm.find(".panelBar").attr("size");
        var sizeArray = [ cacheData[tableid].rowPerPage ];
        if (sizes) {
          sizeArray = sizes.split(",");
        }
        if (cacheDefaultRow[tableid]) {
          var sa = "#" + sizeArray.join("#") + "#";
          //如果已经存在,则不加入
          if (sa.indexOf("#" + cacheDefaultRow[tableid] + "#") != -1) {
            cacheDefaultRow[tableid] = null;
          } else {
            sizeArray.push(cacheDefaultRow[tableid]);
          }
        }
        sizeArray.sort(function(i, j) {
          return parseInt(i) - parseInt(j);
        });
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
        var pageNum = "<span id='datatable_pagenum'>" + pageNumSpan(tableid, cacheData[tableid]["pageNo"]) + "</span>";
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
  }, loadInit = function() {
    $(".pagego").hover(function() {
      $(this).addClass("pageGoHover");
    }, function() {
      $(this).removeClass("pageGoHover");
    });
  };
  var DataTable = {
    DEFAULT_ROW:5,
    SIMPLE_PAGE:"SIMPLE",
    FULL_PAGE:"FULL",
    lOADING_SHOW:"default",
    LOADING_MSG:"数据正在读取中……",
    MSG:{
      first:"首页",
      previous:"上一页",
      next:"下一页",
      last:"末页",
      totalCount:"共{0}条",
      totalPage:"共{0}页",
      rowPerPage:"每页显示{0}条"
    },
    load:function(tableid, easydataParams) {
      var nowDataTable = $("[id='" + tableid + "']");
      if (nowDataTable.length == 0) {
        //console.warn(tableid+" not found!");
        return;
      }
      easydataParams = easydataParams == undefined ? {} :easydataParams;
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    		 * 提交分页数据验证
	    		 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      var rowperpageEle = dataForm.find("[name='rowPerPage']");
      if (!Validate.integer.test(pagenoEle.val())) {
        pagenoEle.val(1);
      }
      if (!Validate.integer.test(rowperpageEle.val())) {
        rowperpageEle.val(DataTable.DEFAULT_ROW);
      }
      //初始化标识(未初始化)
      if (!cacheInit[tableid]) {
        cacheInit[tableid] = false;
        //第一次加载，未初始化
        //初始化时，start函数缓存
        if (easydataParams.start) {
          cacheStartFun[tableid] = easydataParams.start;
        }
        //初始化时，end函数缓存
        if (easydataParams.end) {
          cacheEndFun[tableid] = easydataParams.end;
        }
        //初始页和初始每页条数
        var defRow = DataTable.DEFAULT_ROW;
        if (Validate.integer.test(easydataParams.row)) {
          defRow = easydataParams.row;
        } else {
          var defRow = dataForm.find(".panelBar").attr("row");
          if (!Validate.integer.test(defRow)) {
            defRow = DataTable.DEFAULT_ROW;
          }
        }
        cacheDefaultRow[tableid] = defRow + "";
        var initPage = "<div id='datatable_initPageData' style='display:none'>" + "<input type='hidden' name='pageNo' value='1'/>" + "<input type='hidden' name='rowPerPage' value='" + defRow + "' />" + "</div>";
        dataForm.append(initPage);
      } else {
        //如果分页页码不在当前分页列表
        // if(dataForm.find(".panelBar [class~='pagego'][name='numgoto'][value='numgoto_"+pagenoEle.val()+"']").length==0){
        dataForm.find(".panelBar [id='datatable_pagenum']").html(pageNumSpan(tableid, pagenoEle.val()));
      }
      //start函数调用,数据加载开始时执行
      if (cacheStartFun[tableid]) {
        try {
          //数据表格，是否是第一次加载
          cacheStartFun[tableid](nowDataTable[0], !cacheInit[tableid]);
        } catch (e) {}
      }
      //使用的分页主题
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
          //初始化时保存自定义分页content
          cacheUserPage[tableid] = dataForm.find(".panelBar").html();
          dataForm.find(".panelBar").html("");
        }
      }
      if (!cacheDataRow[tableid]) {
        // 获取数据行
        var dataRow = ("<tr>" + nowDataTable.find(" tr:eq(1)").html() + "</tr>").replace(/\n/g, "").replace(/\r/g, "").replace("}%", "}%\r\n");
        cacheDataRow[tableid] = dataRow;
        nowDataTable.find(" tr:eq(1)").find("td").css("border", "0");
        nowDataTable.find(" tr:eq(1)").css("border", "0");
      }
      //分页加载数据时表格的显示方式
      if (cacheLoadingDefault[tableid] == undefined) {
        var table_loading_attr = nowDataTable.attr("loading");
        if (table_loading_attr) {
          cacheLoadingDefault[tableid] = table_loading_attr;
        } else {
          cacheLoadingDefault[tableid] = DataTable.lOADING_SHOW;
        }
        if (!(easydataParams.loading == undefined)) {
          cacheLoadingDefault[tableid] = easydataParams.loading + "";
        }
      }
      if (easydataParams.language) {
        // 如果存在语言，则按照指定语言显示
        cacheLanguage[tableid] = easydataParams.language;
      }
      // 如果没有指定语言，则使用缓存语言
      if (cacheLanguage[tableid] == undefined) {
        cacheLanguage[tableid] = DataTable.MSG;
      }
      /*
	    			 * 表单参数
	    			 */
      postParam = dataForm.serialize();
      //分页加载数据时,表格的显示方式
      var loading_type = cacheLoadingDefault[tableid].toLowerCase();
      if (loading_type == "default") {
        if (cacheInitLoading[tableid] == undefined) {
          //初次加载
          nowDataTable.find(" tr:gt(0)").remove();
          cacheInitLoading[tableid] = "loaded";
        }
        //新方式，切换页面时，禁用数据操作(禁用超链，按钮)，显示为灰色
        nowDataTable.find(" tr:gt(0)").find("*").on("click", function() {
          return false;
        });
        nowDataTable.find(" tr:gt(0)").find("*").css("color", "gray");
      } else if (loading_type == "none") {
        if (cacheInitLoading[tableid] == undefined) {
          //初次加载
          nowDataTable.find(" tr:gt(0)").remove();
          cacheInitLoading[tableid] = "loaded";
        }
        nowDataTable.find("tr:gt(0)").hide();
      } else if (loading_type == "hide") {
        if (cacheInitLoading[tableid] == undefined) {
          //初次加载
          nowDataTable.find(" tr:gt(0)").remove();
          cacheInitLoading[tableid] = "loaded";
        }
        //旧方式，切换页面时隐藏当前页面数据
        nowDataTable.find("tr:gt(0)").css("visibility", "hidden");
      } else if (loading_type == "show") {
        nowDataTable.find(" tr:gt(0)").remove();
        //style1
        //			nowDataTable.append("<tr name=\"DataTable_Loading\" ><td colspan='"
        //					+ $("#" + tableid + " tr:eq(0)").find("th").length
        //					+ "'><div class='DataTable_Loading'>"
        //					+ DataTable.LOADING_MSG + 
        //					"</div></td></tr>");
        //style2
        $("[id='" + tableid + "_loading_div']").hide();
        nowDataTable.after("<div id='" + tableid + "_loading_div' class='DataTable_Loading'>" + DataTable.LOADING_MSG + "</div>");
      } else {
        nowDataTable.find(" tr:gt(0)").remove();
        //style1
        //			nowDataTable.append("<tr name=\"DataTable_Loading\" ><td colspan='"
        //					+ $("#" + tableid + " tr:eq(0)").find("th").length
        //					+ "'><div class='DataTable_Loading'>"
        //					+ cacheLoadingDefault[tableid]  + 
        //					"</div></td></tr>");
        //style2
        $("[id='" + tableid + "_loading_div']").hide();
        nowDataTable.after("<div id='" + tableid + "_loading_div' class='DataTable_Loading'>" + cacheLoadingDefault[tableid] + "</div>");
      }
      /*
	    			 * ajax请求数据
	    			 */
      $.post(dataForm.attr("action"), postParam, function(data) {
        if (typeof data == "string") {
          data = eval("(" + data + ")");
        }
        cacheData[tableid] = data;
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
          for (var i in data[valueObject].data) {
            data[valueObject].data[i].datatableCount = parseInt(j) + 1;
            data[valueObject].data[i].datatableIndex = parseInt(j);
            for (var property in data) {
              if (property != valueObject) {
                data[valueObject].data[i][property] = data[property];
              }
            }
            data[valueObject].data[i].pageNo = parseInt(data[valueObject].pageNo);
            data[valueObject].data[i].rowPerPage = parseInt(data[valueObject].rowPerPage);
            data[valueObject].data[i].totalCount = parseInt(data[valueObject].totalCount);
            data[valueObject].data[i].maxPage = Math.floor((parseInt(data[valueObject].data[i].totalCount) - 1) / parseInt(data[valueObject].data[i].rowPerPage) + 1);
            data[valueObject].data[i].key = i;
            data[valueObject].data[i].order = dataTableOrder;
            data[valueObject].data[i].sort = dataTableSort;
            content += formatContent(cacheDataRow[tableid], data[valueObject].data[i]);
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
          for (var i in data.data) {
            for (var property in data) {
              if (property != "data") {
                data.data[i][property] = data[property];
              }
            }
            data.data[i].datatableCount = parseInt(j) + 1;
            data.data[i].datatableIndex = parseInt(j);
            data.data[i].key = i;
            data.data[i].maxPage = Math.floor((parseInt(data.data[i].totalCount) - 1) / parseInt(data.data[i].rowPerPage) + 1);
            data.data[i].order = dataTableOrder;
            data.data[i].sort = dataTableSort;
            content += formatContent(cacheDataRow[tableid], data.data[i]);
            j++;
          }
        }
        /*
	    	 	  * 分页部分
	    	 	  */
        pageTheme(tableid, cachePageTheme[tableid]);
        // 初始化分页显示的数据
        dataForm.find(" .pages .totalCount").html(data["totalCount"]);
        dataForm.find(" .mycombox").val(data["rowPerPage"]);
        dataForm.find(" [name='pageNo']").val(data["pageNo"]);
        dataForm.find(" .pages .maxPage").html(Math.floor((parseInt(data["totalCount"]) - 1) / parseInt(data["rowPerPage"]) + 1));
        dataForm.find("[name='rowPerPage']").off("change");
        dataForm.find("[name='rowPerPage']").on("change", function(e) {
          var row = $(this).val();
          //行
          var pagenoEle = dataForm.find("[name='pageNo']");
          var maxPage = Math.floor((cacheData[tableid]["totalCount"] - 1) / row + 1);
          //最大页
          if (pagenoEle.val() > maxPage) {
            pagenoEle.val(maxPage);
          }
          DataTable.load(tableid);
        });
        pageCheck(tableid);
        // 分页标签状态设置
        // 排序隐藏字段
        var orderInfo = '<tr name="sort_order_hidden" style="display:none"><td colspan=\'' + $("[id='" + tableid + "'] tr:eq(0)").find("th").length + "'><input type='hidden' name='order' value='" + dataTableOrder + "'/>" + "<input type='hidden' name='sort' value='" + dataTableSort + "'/></td></tr>";
        content += orderInfo;
        // 清除大于0的行和loading的msg
        nowDataTable.find(" tr:gt(0)").remove();
        $("[id='" + tableid + "_loading_div']").remove();
        // 显示数据
        nowDataTable.append(content);
        //表格效果事件
        nowDataTable.find(" tr:even").addClass("evenColor");
        nowDataTable.find(" tr").hover(function() {
          $(this).addClass("tdHover");
        }, function() {
          $(this).removeClass("tdHover");
        });
        var oldTr;
        nowDataTable.find(" tr").on("click", function() {
          if (oldTr) {
            oldTr.removeClass("tdClick");
          }
          $(this).addClass("tdClick");
          oldTr = $(this);
        });
        //end函数调用,数据加载结束时执行
        if (cacheEndFun[tableid]) {
          try {
            //数据表格，是否是第一次加载
            cacheEndFun[tableid](nowDataTable[0], !cacheInit[tableid]);
          } catch (e) {}
        }
        //完成第一次加载，已初始化
        if (!cacheInit[tableid]) {
          cacheInit[tableid] = true;
          $("#datatable_initPageData").remove();
        }
      });
    },
    reload:function(tableid) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      dataForm.find("[name='order']").val("");
      dataForm.find("[name='sort']").val("");
      if (cacheOrderArrow[tableid]) {
        cacheOrderArrow[tableid].html("&uarr;&darr;");
      }
      DataTable.load(tableid);
    },
    first:function(tableid) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    				 * 提交分页数据验证
	    				 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      pagenoEle.val(1);
      this.load(tableid);
    },
    prev:function(tableid) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    				 * 提交分页数据验证
	    				 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      pagenoEle.val(parseInt(cacheData[tableid]["pageNo"]) - 1);
      this.load(tableid);
    },
    next:function(tableid) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    				 * 提交分页数据验证
	    				 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      pagenoEle.val(parseInt(cacheData[tableid]["pageNo"]) + 1);
      this.load(tableid);
    },
    last:function(tableid) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    				 * 提交分页数据验证
	    				 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      pagenoEle.val(cacheData[tableid]["maxPage"]);
      this.load(tableid);
    },
    gopage:function(tableid) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    				 * 提交分页数据验证
	    				 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      var row = dataForm.find("[name='rowPerPage']").val();
      var maxPage = Math.floor((cacheData[tableid]["totalCount"] - 1) / row + 1);
      if (pagenoEle.val() > maxPage) {
        pagenoEle.val(maxPage);
      }
      if (cacheData[tableid]["pageNo"] != pagenoEle.val() && Validate.integer.test(pagenoEle.val())) {
        this.load(tableid);
      }
    },
    numgoto:function(tableid, e) {
      var dataForm = $("form").has("[id='" + tableid + "']");
      /*
	    				 * 提交分页数据验证
	    				 */
      var pagenoEle = dataForm.find("[name='pageNo']");
      pagenoEle.val($(e.target).text());
      if (cacheData[tableid]["pageNo"] != dataForm.find("[name='pageNo']").val()) {
        this.load(tableid);
      }
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
    out:function(msg) {
      return msg;
    },
    init:function() {
      $(".pagego").hover(function() {
        $(this).addClass("pageGoHover");
      }, function() {
        $(this).removeClass("pageGoHover");
      });
      $(".datatable").find("tr:eq(1)").css("visibility", "hidden");
      // 隐藏数据行
      $("[class~='easydatatable']").each(function() {
        var tableid = $(this).attr("id");
        if (!cacheInit[tableid]) {
          if (tableid) {
            DataTable.load(tableid);
          }
        }
      });
      $("[class~='easydatatable_search']").each(function() {
        var tableid = $(this.form).find("table[id]").attr("id");
        var o = $(this);
        o.off("click");
        o.on("click", function() {
          if (tableid) {
            DataTable.load(tableid);
          }
        });
      });
      $("table:has([order])").each(function() {
        var table = $(this);
        var tableid = table.attr("id");
        table.find("[order]").each(function() {
          var o = $(this);
          o.html(o.html() + "<span class='sortArrow' name='orderspan'>&uarr;&darr;</span>");
          o.css("cursor", "pointer");
          o.off("click");
          var dataForm = $("form").has("[id='" + tableid + "']");
          o.on("click", function(e) {
            var order = o.attr("order");
            if (dataForm.find("input[name='order']").length > 0) {
              dataForm.find("input[name='order']").val(order);
              dataForm.find("input[name='sort']").val(dataForm.find("input[name='sort']").val().toLowerCase() == "asc" ? "desc" :"asc");
              var arrowObj = $(this).find("[name='orderspan']");
              if (cacheOrderArrow[tableid]) {
                cacheOrderArrow[tableid].html("&uarr;&darr;");
              }
              if (dataForm.find("input[name='sort']").val() == "asc") {
                arrowObj.html("&uarr;");
              } else if (dataForm.find("input[name='sort']").val() == "desc") {
                arrowObj.html("&darr;");
              } else {
                arrowObj.html("&uarr;&darr;");
              }
              cacheOrderArrow[tableid] = arrowObj;
              DataTable.load(tableid);
            }
          });
        });
        table.find("[order]").hover(function() {
          var arrowObj = $(this).find("[name='orderspan']");
          arrowObj.removeClass("sortArrow");
          arrowObj.removeClass("sortArrowDown");
          arrowObj.addClass("sortArrowHover");
        }, function() {
          var arrowObj = $(this).find("[name='orderspan']");
          arrowObj.removeClass("sortArrowHover");
          arrowObj.addClass("sortArrow");
        });
        table.find("[order]").on("mousedown", function() {
          var arrowObj = $(this).find("[name='orderspan']");
          arrowObj.removeClass("sortArrowHover");
          arrowObj.addClass("sortArrowDown");
        });
        table.find("[order]").on("mouseup", function() {
          var arrowObj = $(this).find("[name='orderspan']");
          arrowObj.removeClass("sortArrowDown");
          arrowObj.addClass("sortArrowHover");
        });
      });
    }
  };
  window.DataTable = DataTable;
})(window);

$(function() {
  DataTable.init();
});