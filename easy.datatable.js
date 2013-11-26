// jQuery EasyDataTable Plugin
//
// Version 1.5.0
//
// Copy By RAY
// inthinkcolor@gmail.com
// 2013
//
// https://github.com/ushelp/EasyDataTable
//
var DataTable = {

	"cacheData" : {},
	"cacheDataRow" : {},
	"cacheThLength" : {},
	"cachePageTheme" : {},
	"cacheLanguage" : {},
	"cacheOrderArrow" : {},
	"cacheInitLoading":{},
	"cacheStartFun":{},
	"cacheEndFun":{},
	"cacheUserPage":{},
	"cacheInit":{}, 
	"SIMPLE_PAGE" : 'SIMPLE',
	"FULL_PAGE" : 'FULL',
	"lOADING_SHOW" : 'default', //default,show,none,hide
	"lOADING_DEFALUT" : {},
	"LOADING_MSG" : '数据正在读取中……',
	"MSG" : {
		"first" : '首页',
		"previous" : '上一页',
		"next" : '下一页',
		"last" : '末页',
		"totalCount" : '共{0}条',
		"totalPage" : '共{0}页',
		"rowPerPage" : '每页显示{0}条'
	},
	/*
	 * 加载数据 tableid 数据表格id easydataParams 参数。目前支持的参数 {pagetheme 主题;loading
	 * 是否显示加载提示;language 语言}
	 */
	"load" : function(tableid, easydataParams) {
		
		var nowDataTable = $("[id='" + tableid+"']");
		if(nowDataTable.length==0){
			//console.warn(tableid+" not found!");
			return;
		}
		easydataParams = easydataParams == undefined ? {} : easydataParams;
		var dataForm = $("form").has("[id='" + tableid+"']");
		
		//初始化标识(未初始化)
		if(!(DataTable.cacheInit[tableid])){
			DataTable.cacheInit[tableid]=false; //第一次加载，未初始化
			
			//初始化时，start函数缓存
			if(easydataParams.start){  
				DataTable.cacheStartFun[tableid]=easydataParams.start;
			}
			//初始化时，end函数缓存
			if(easydataParams.end){  
				DataTable.cacheEndFun[tableid]=easydataParams.end;
			}
		}
		
		//start函数调用,数据加载开始时执行
		if(DataTable.cacheStartFun[tableid]){
			try {
				//数据表格，是否是第一次加载
				DataTable.cacheStartFun[tableid](nowDataTable[0],!DataTable.cacheInit[tableid]);
			} catch (e) {
				// console.warn(e.toLocaleString()); 
			}
		}
		
		
		//使用的分页主题
		if (!(easydataParams.pagetheme == undefined)) {
			DataTable.cachePageTheme[tableid] = easydataParams.pagetheme;
		} 
		if (!DataTable.cachePageTheme[tableid]) {
			var usetheme = dataForm.find(".panelBar").attr("pagetheme");
			
			if(usetheme){
				DataTable.cachePageTheme[tableid]=usetheme;
			}else{
				DataTable.cachePageTheme[tableid] = DataTable.FULL_PAGE;
			}
		
			if(!(DataTable.cacheInit[tableid])){ //初始化时保存自定义分页content
				DataTable.cacheUserPage[tableid]=dataForm.find(".panelBar").html();
				dataForm.find(".panelBar").html(""); //第一次前加载清除分页部分代码
			}
		}
		
		
		if (!DataTable.cacheDataRow[tableid]) {
			// 获取数据行
			var dataRow = ("<tr>" + nowDataTable.find(" tr:eq(1)").html() + "</tr>")
					.replace(/\n/g, "").replace(/\r/g, "").replace("\}\%",
							"\}\%\r\n");
			DataTable.cacheDataRow[tableid] = dataRow;
			nowDataTable.find(" tr:eq(1)").find("td").css("border", "0");
			nowDataTable.find(" tr:eq(1)").css("border", "0");
		}
		//分页加载数据时表格的显示方式
		if (DataTable.lOADING_DEFALUT[tableid] == undefined) {
			var table_loading_attr=nowDataTable.attr("loading");
			if(table_loading_attr){
				DataTable.lOADING_DEFALUT[tableid]=table_loading_attr;
			}else {
				DataTable.lOADING_DEFALUT[tableid] = DataTable.lOADING_SHOW;
			}
			if (!(easydataParams.loading == undefined)) {
				DataTable.lOADING_DEFALUT[tableid] = easydataParams.loading+"";
			} 
		}

		if (easydataParams.language) { // 如果存在语言，则按照指定语言显示
			DataTable.cacheLanguage[tableid] = easydataParams.language;
		}
		// 如果没有指定语言，则使用缓存语言
		if (DataTable.cacheLanguage[tableid] == undefined) {
			DataTable.cacheLanguage[tableid] = DataTable.MSG;
		}

		//分页加载数据时,表格的显示方式
		var loading_type=DataTable.lOADING_DEFALUT[tableid].toLowerCase();
		if (loading_type == 'default') {
			if(DataTable.cacheInitLoading[tableid]== undefined){ //初次加载
				nowDataTable.find(" tr:gt(0)").remove();
				DataTable.cacheInitLoading[tableid]="loaded";
			}
			//新方式，切换页面时，禁用数据操作(禁用超链，按钮)，显示为灰色
			nowDataTable.find(" tr:gt(0)").find("*").on("click",function(){return false;});
			nowDataTable.find(" tr:gt(0)").find("*").css("color","gray");
		}else if(loading_type == 'none') {
			if(DataTable.cacheInitLoading[tableid]== undefined){ //初次加载
				nowDataTable.find(" tr:gt(0)").remove();
				DataTable.cacheInitLoading[tableid]="loaded";
			}
			nowDataTable.find("tr:gt(0)").hide(); // 隐藏数据行内容
		}else if(loading_type == 'hide') {
			if(DataTable.cacheInitLoading[tableid]== undefined){ //初次加载
				nowDataTable.find(" tr:gt(0)").remove();
				DataTable.cacheInitLoading[tableid]="loaded";
			}
			//旧方式，切换页面时隐藏当前页面数据
			nowDataTable.find("tr:gt(0)").css("visibility", "hidden"); // 完全隐藏数据行
		}else if (loading_type == 'show') {
			nowDataTable.find(" tr:gt(0)").remove();
			//style1
//			nowDataTable.append("<tr name=\"DataTable_Loading\" ><td colspan='"
//					+ $("#" + tableid + " tr:eq(0)").find("th").length
//					+ "'><div class='DataTable_Loading'>"
//					+ DataTable.LOADING_MSG + 
//					"</div></td></tr>");
			
			//style2
			$("[id='" + tableid + "_loading_div']").hide();
			nowDataTable.after("<div id='"+tableid+"_loading_div' class='DataTable_Loading'>"
					+ DataTable.LOADING_MSG + 
					"</div>");
		}else{
			nowDataTable.find(" tr:gt(0)").remove();
			//style1
//			nowDataTable.append("<tr name=\"DataTable_Loading\" ><td colspan='"
//					+ $("#" + tableid + " tr:eq(0)").find("th").length
//					+ "'><div class='DataTable_Loading'>"
//					+ DataTable.lOADING_DEFALUT[tableid]  + 
//					"</div></td></tr>");
			//style2
			$("[id='" + tableid + "_loading_div']").hide();
			nowDataTable.after("<div id='"+tableid+"_loading_div' class='DataTable_Loading'>"
					+  DataTable.lOADING_DEFALUT[tableid] + 
					"</div>");
		}
		

		/*
		 * 提交分页数据验证
		 */
		var pagenoEle = dataForm.find("[name='pageNo']");

		var rowperpageEle = dataForm.find("[name='rowPerPage']");
		if (!this.Validate.integer.test(pagenoEle.val())) {
			pagenoEle.val(1);
		}
		if (!this.Validate.integer.test(rowperpageEle.val())) {
			rowperpageEle.val(5);
		}

		/*
		 * 表单参数
		 */
		postParam = dataForm.serialize();

		/*
		 * ajax请求数据
		 */
		$.post(
						dataForm.attr("action"),
						postParam,
						function(data) {

							if (typeof (data) == "string") {
								data = eval("(" + data + ")");
							}
							DataTable.cacheData[tableid] = data;

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
									dataTableOrder = '';
								}
								if (!dataTableSort) {
									dataTableSort = '';
								}

								DataTable.cacheData[tableid].pageNo = parseInt(data[valueObject].pageNo);
								;
								DataTable.cacheData[tableid].rowPerPage = parseInt(data[valueObject].rowPerPage);
								;
								DataTable.cacheData[tableid].totalCount = parseInt(data[valueObject].totalCount);
								;
								DataTable.cacheData[tableid].order = dataTableOrder;
								DataTable.cacheData[tableid].sort = dataTableSort;
								DataTable.cacheData[tableid].maxPage = Math
										.floor(((DataTable.cacheData[tableid].totalCount - 1) / DataTable.cacheData[tableid].rowPerPage) + 1);

								for ( var i in data[valueObject].data) {
									data[valueObject].data[i].datatableCount = parseInt(j) + 1;
									data[valueObject].data[i].datatableIndex = parseInt(j);
									for ( var property in data) {
										if (property != valueObject) {
											data[valueObject].data[i][property] = data[property];
										}
									}
									data[valueObject].data[i].pageNo = parseInt(data[valueObject].pageNo);
									data[valueObject].data[i].rowPerPage = parseInt(data[valueObject].rowPerPage);
									data[valueObject].data[i].totalCount = parseInt(data[valueObject].totalCount);
									data[valueObject].data[i].maxPage = Math
											.floor(((parseInt(data[valueObject].data[i].totalCount) - 1) / parseInt(data[valueObject].data[i].rowPerPage)) + 1);
									data[valueObject].data[i].key = i;
									data[valueObject].data[i].order = dataTableOrder;
									data[valueObject].data[i].sort = dataTableSort;
									content += DataTable.formatContent(
											DataTable.cacheDataRow[tableid],
											data[valueObject].data[i]);
									j++;
								}
							} else {

								dataTableOrder = data.order;
								dataTableSort = data.sort;
								if (!dataTableOrder) {
									dataTableOrder = '';
								}
								if (!dataTableSort) {
									dataTableSort = '';
								}

								DataTable.cacheData[tableid].maxPage = Math
										.floor(((parseInt(data.totalCount) - 1) / parseInt(data.rowPerPage)) + 1);

								for ( var i in data.data) {
									for ( var property in data) {
										if (property != "data") {
											data.data[i][property] = data[property];
										}
									}
									data.data[i].datatableCount = parseInt(j) + 1;
									data.data[i].datatableIndex = parseInt(j);
									data.data[i].key = i;
									data.data[i].maxPage = Math
											.floor(((parseInt(data.data[i].totalCount) - 1) / parseInt(data.data[i].rowPerPage)) + 1);
									data.data[i].order = dataTableOrder;
									data.data[i].sort = dataTableSort;
									content += DataTable.formatContent(
											DataTable.cacheDataRow[tableid],
											data.data[i]);
									j++;
								}
							}

							
							// 排序隐藏字段
							var orderInfo = "<tr name=\"sort_order_hidden\" style=\"display:none\"><td colspan='"
									+ $("[id='" + tableid + "'] tr:eq(0)").find("th").length
									+ "'><input type='hidden' name='order' value='"
									+ dataTableOrder
									+ "'/>"
									+ "<input type='hidden' name='sort' value='"
									+ dataTableSort + "'/></td></tr>";

							content += orderInfo;
							
							// 清除大于0的行和loading的msg
							nowDataTable.find(" tr:gt(0)").remove();
							$("[id='"+tableid+"_loading_div']").remove();
							// 显示数据
							nowDataTable.append(content);
							
							/*
							 * 分页部分
							 */
							DataTable.pageTheme(tableid,
									DataTable.cachePageTheme[tableid]);

							// 初始化分页显示的数据
							dataForm.find(" .pages .totalCount").html(
									data['totalCount']);
							dataForm.find(" .mycombox").val(data['rowPerPage']);
							dataForm.find(" [name='pageNo']").val(
									data['pageNo']);
							dataForm
									.find(" .pages .maxPage")
									.html(
											Math
													.floor(((parseInt(data['totalCount']) - 1) / parseInt(data['rowPerPage'])) + 1));
							dataForm.find("[name='rowPerPage']").off("change");
							dataForm.find("[name='rowPerPage']").on("change",
									function(e) {
								
										var row=$(this).val(); //行
										
										var pagenoEle = dataForm.find("[name='pageNo']");
										var maxPage = Math
										.floor(((DataTable.cacheData[tableid]['totalCount']- 1) / row) + 1);//最大页
										
									
										if(pagenoEle.val()>maxPage){
											pagenoEle.val(maxPage);
										}
								
										DataTable.load(tableid);
									});
							DataTable.pageCheck(tableid);// 分页标签状态设置
							
							
							
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
							if(DataTable.cacheEndFun[tableid]){
								try {
									//数据表格，是否是第一次加载
									DataTable.cacheEndFun[tableid](nowDataTable[0],!DataTable.cacheInit[tableid]);
								} catch (e) {
									// console.warn(e.toLocaleString()); 
								}
							}
							
							//完成第一次加载，已初始化
							if(!(DataTable.cacheInit[tableid])){
								DataTable.cacheInit[tableid]=true;
							}
							
						});

	},
	"reload" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		dataForm.find("[name='order']").val("");
		dataForm.find("[name='sort']").val("");
		if (DataTable.cacheOrderArrow[tableid]) {
			DataTable.cacheOrderArrow[tableid].html("&uarr;&darr;");
		}
		DataTable.load(tableid);

	},
	"out" : function(msg) {
		return msg;
	},
	"formatContent" : function(content, jsondata) {
		var reg = /\{([^}]+)\}/g; // EasyDataTable 属性表达式
		// var regExp=/\%\{([\s\S]+)\}/g; //语句表达式
		var regExp = /\%\{(.*)\}\%/g; // EasyDataTable 语句表达式
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
					return eval($.trim(i)) == null ? '' : eval($.trim(i));
				} catch (e) {
					// return m;
					return '';
				}
			}

		});
		return content;
	},
	"Validate" : {
		integer : /^[1-9][0-9]*$/
	},
	"first" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		/*
		 * 提交分页数据验证
		 */
		var pagenoEle = dataForm.find("[name='pageNo']");
		pagenoEle.val(1);
		this.load(tableid);
	},
	"prev" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		/*
		 * 提交分页数据验证
		 */
		var pagenoEle = dataForm.find("[name='pageNo']");
		pagenoEle.val(parseInt(this.cacheData[tableid]['pageNo']) - 1);
		this.load(tableid);
	},
	"next" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		/*
		 * 提交分页数据验证
		 */

		var pagenoEle = dataForm.find("[name='pageNo']");
		pagenoEle.val(parseInt(this.cacheData[tableid]['pageNo']) + 1);
		this.load(tableid);
	},
	"last" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		/*
		 * 提交分页数据验证
		 */
		var pagenoEle = dataForm.find("[name='pageNo']");
		pagenoEle
				.val(this.cacheData[tableid]['maxPage']);
		this.load(tableid);
	},
	"gopage" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		/*
		 * 提交分页数据验证
		 */
		var pagenoEle = dataForm.find("[name='pageNo']");
		var row= dataForm.find("[name='rowPerPage']").val();
		
		var maxPage = Math
		.floor(((this.cacheData[tableid]['totalCount']- 1) / row) + 1);
		if(pagenoEle.val()>maxPage){
			pagenoEle.val(maxPage);
		}
		
		if (this.cacheData[tableid]['pageNo'] != pagenoEle.val()
				&& DataTable.Validate.integer.test(pagenoEle.val())) {
			this.load(tableid);
		}
	},
	"numgoto" : function(tableid, e) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		/*
		 * 提交分页数据验证
		 */
		var pagenoEle = dataForm.find("[name='pageNo']");
		pagenoEle.val($(e.target).text());
		if (this.cacheData[tableid]['pageNo'] != dataForm.find(
				"[name='pageNo']").val()) {
			this.load(tableid);
		}
	},
	"go" : function(tableid, pagenum, row) {
	
		var dataForm =  $("form").has("[id='" + tableid+"']");
		if(dataForm&&DataTable.Validate.integer.test(pagenum)){
			pagenum=parseInt(pagenum);
			if(pagenum<=0){
				pagenum=1;
			}
			
			if(!row||(!DataTable.Validate.integer.test(row))){
				row=this.cacheData[tableid]['rowPerPage'];
			}
			var maxPage = Math
				.floor(((this.cacheData[tableid]['totalCount']- 1) / row) + 1);

				if(pagenum>maxPage){
					pagenum=maxPage;
				}
	
			
			
			var pagenoEle = dataForm.find("[name='pageNo']");
			if(pagenoEle.val()){
				pagenoEle.val(pagenum);
			}else{
				dataForm.append("<input type=\"hidden\" value=\""+pagenum+"\" name=\"pageNo\"/>");
			}

			var rowPerPageEle = dataForm.find("[name='rowPerPage']");
			if(rowPerPageEle.val()){
				rowPerPageEle.val(row);
			}else{
				dataForm.append("<input type=\"hidden\" value=\""+row+"\" name=\"rowPerPage\"/>");
			}
			
		
			dataForm.find("[name='rowPerPage']").val(row);
			
			
			if (this.cacheData[tableid]['pageNo'] != pagenum) {
				this.load(tableid);
			}
			
		}

	},
	"pageCheck" : function(tableid) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		var maxPage = this.cacheData[tableid]['maxPage'];
		var nowPage = parseInt(this.cacheData[tableid]['pageNo']);

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

		first.unbind('mouseenter').unbind('mouseleave');
		prev.unbind('mouseenter').unbind('mouseleave');
		next.unbind('mouseenter').unbind('mouseleave');
		last.unbind('mouseenter').unbind('mouseleave');
		DataTable.loadInit();
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
			first.unbind('mouseenter').unbind('mouseleave');
			prev.unbind('mouseenter').unbind('mouseleave');
		}

		if (nowPage >= maxPage) {
			last.off("click");
			next.off("click");
			last.removeClass("pageGoHover");
			next.removeClass("pageGoHover");
			last.addClass("firstlastgo");
			next.addClass("firstlastgo");
			last.unbind('mouseenter').unbind('mouseleave');
			next.unbind('mouseenter').unbind('mouseleave');
		}
	},
	"checkAll" : function(o, name) {
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
	"pageMsgCkeck" : function(tableid) {
		if (!DataTable.cacheLanguage[tableid].first) {
			DataTable.cacheLanguage[tableid].first = DataTable.MSG.first;
		}
		if (!DataTable.cacheLanguage[tableid].previous) {
			DataTable.cacheLanguage[tableid].previous = DataTable.MSG.previous;
		}
		if (!DataTable.cacheLanguage[tableid].next) {
			DataTable.cacheLanguage[tableid].next = DataTable.MSG.next;
		}
		if (!DataTable.cacheLanguage[tableid].last) {
			DataTable.cacheLanguage[tableid].last = DataTable.MSG.last;
		}
		if (!DataTable.cacheLanguage[tableid].totalPage) {
			DataTable.cacheLanguage[tableid].totalPage = DataTable.MSG.totalPage;
		}
		if (!DataTable.cacheLanguage[tableid].rowPerPage) {
			DataTable.cacheLanguage[tableid].rowPerPage = DataTable.MSG.rowPerPage;
		}
		if (!DataTable.cacheLanguage[tableid].totalCount) {
			DataTable.cacheLanguage[tableid].totalCount = DataTable.MSG.totalCount;
		}

	},
	"pageTheme" : function(tableid, theme) {
		var dataForm = $("form").has("[id='" + tableid+"']");
		var content="";
		// 如果使用自定义分页内容（不使用主题）
		if (theme && theme.toLowerCase() == "no") { //不使用主题
			content = DataTable.cacheUserPage[tableid];
		}else {
				var pageshowCount=dataForm.find(".panelBar").length;
				if(pageshowCount!=0){ //存在分页标签
					var sizes = dataForm.find(".panelBar").attr("size");
					var sizeArray =[DataTable.cacheData[tableid].rowPerPage];
					if (sizes) {
					
					  sizeArray = sizes.split(",");
					}
					DataTable.pageMsgCkeck(tableid);

					var rowPerPageIndex = DataTable.cacheLanguage[tableid].rowPerPage
							.indexOf("{0}");
					var rowPerPageStart = DataTable.cacheLanguage[tableid].rowPerPage
							.substring(0, rowPerPageIndex);
					var rowPerPageEnd = DataTable.cacheLanguage[tableid].rowPerPage
							.substring(rowPerPageIndex + 3);

					var rowNumSpan = "<div class=\"pages\"><span>"
							+ rowPerPageStart + "</span>"
							+ "<select class=\"mycombox\" name=\"rowPerPage\" >";

					$.each(sizeArray, function(i, v) {
						rowNumSpan += "<option value=\"" + v + "\" >" + v
								+ "</option>";
					});

					rowNumSpan += "</select><span>" + rowPerPageEnd + "，";

					var totalPageIndex = DataTable.cacheLanguage[tableid].totalPage
							.indexOf("{0}");
					var totalPageStart = DataTable.cacheLanguage[tableid].totalPage
							.substring(0, totalPageIndex);
					var totalPageEnd = DataTable.cacheLanguage[tableid].totalPage
							.substring(totalPageIndex + 3);

					var totalCountIndex = DataTable.cacheLanguage[tableid].totalCount
							.indexOf("{0}");
					var totalCountStart = DataTable.cacheLanguage[tableid].totalCount
							.substring(0, totalCountIndex);
					var totalCountEnd = DataTable.cacheLanguage[tableid].totalCount
							.substring(totalCountIndex + 3);

					rowNumSpan += totalCountStart
							+ "<label class=\"totalCount\"></label>"
							+ totalCountEnd + "</span></div>";

					var start = "<div class=\"pages \" style=\"float: right;text-align: right;\">";

					var totalPageSpan = "<span class=\"totalPage\">"
							+ totalPageStart + "<label class=\"maxPage\"></label>"
							+ totalPageEnd + "</span>";

					var back = "<span class=\"pagego\" name=\"first\">"
							+ DataTable.cacheLanguage[tableid].first + "</span>"
							+ "<span class=\"pagego\" name=\"prev\">"
							+ DataTable.cacheLanguage[tableid].previous + "</span>";

					var nowPage = parseInt(this.cacheData[tableid]['pageNo']);
					var maxPage = Math
							.floor(((parseInt(this.cacheData[tableid]['totalCount']) - 1) / parseInt(this.cacheData[tableid]['rowPerPage'])) + 1);

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
					for ( var i = pageStart; i <= pageEnd; i++) {
						if (i == nowPage) {
							pageNum += "<span class=\"pagego nowpagenum\" name=\"numgoto\">"
									+ i + "</span>";
						} else {
							pageNum += "<span class=\"pagego\" name=\"numgoto\">"
									+ i + "</span>";
						}
					}

					var forward = "<span class=\"pagego\" name=\"next\">"
							+ DataTable.cacheLanguage[tableid].next + "</span>"
							+ "<span class=\"pagego\" name=\"last\">"
							+ DataTable.cacheLanguage[tableid].last + "</span>";

					var pagegotoSpan = "<span class=\"pagego\"><input type=\"text\" class=\"gototxt\" name=\"pageNo\"  /></span>";
					pagegotoSpan += "<span class=\"pagegoto\" name=\"pagegoto\">&gt;&gt;</span>";

					var end = "</div>";

					if ((!theme) || theme.toUpperCase() == 'FULL') {
						content = rowNumSpan + start + totalPageSpan + back
								+ pageNum + forward + pagegotoSpan + end;
					} else if (theme.toUpperCase() == 'SIMPLE') {
						content = rowNumSpan + start + totalPageSpan + back
								+ forward + pagegotoSpan + end;
					}else{
						content = rowNumSpan + start + totalPageSpan + back
						+ pageNum + forward + pagegotoSpan + end;
					}
					
					
					
				}
				
				
			
		}
	
		dataForm.find(".panelBar").html(
				DataTable.formatContent(content, this.cacheData[tableid]));
		
		//dataForm.find(".panelBar").show();

	},
	"loadInit" : function() {
		$(".pagego").hover(function() {
			$(this).addClass("pageGoHover");
		}, function() {
			$(this).removeClass("pageGoHover");
		});
	},
	"init" : function() {
		$(".pagego").hover(function() {
			$(this).addClass("pageGoHover");
		}, function() {
			$(this).removeClass("pageGoHover");
		});
		$(".datatable").find("tr:eq(1)").css("visibility", "hidden"); // 隐藏数据行
		$("[class~='easydatatable']").each(function() {
			var tableid = $(this).attr("id");
			if(!DataTable.cacheInit[tableid]){
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

		$("table:has([order])")
				.each(
						function() {
							var table = $(this);
							var tableid = table.attr("id");
							table
									.find("[order]")
									.each(
											function() {
												var o = $(this);
												o
														.html(o.html()
																+ "<span class='sortArrow' name='orderspan'>&uarr;&darr;</span>");
												o.css("cursor", "pointer");
												o.off("click");
												var dataForm = $("form").has(
														"[id='" + tableid+"']");
												o
														.on(
																"click",
																function(e) {

																	var order = o
																			.attr("order");
																	dataForm
																			.find(
																					"input[name='order']")
																			.val(
																					order);

																	dataForm
																			.find(
																					"input[name='sort']")
																			.val(
																					dataForm
																							.find(
																									"input[name='sort']")
																							.val()
																							.toLowerCase() == "asc" ? "desc"
																							: "asc");

																	var arrowObj = $(
																			this)
																			.find(
																					"[name='orderspan']");

																	if (DataTable.cacheOrderArrow[tableid]) {
																		DataTable.cacheOrderArrow[tableid]
																				.html("&uarr;&darr;");
																	}

																	if (dataForm
																			.find(
																					"input[name='sort']")
																			.val() == "asc") {
																		arrowObj
																				.html("&uarr;");
																	} else if (dataForm
																			.find(
																					"input[name='sort']")
																			.val() == "desc") {
																		arrowObj
																				.html("&darr;");
																	} else {
																		arrowObj
																				.html("&uarr;&darr;");
																	}

																	DataTable.cacheOrderArrow[tableid] = arrowObj;
																	
																	DataTable
																			.load(tableid);
																	
																});
											});
							table.find("[order]").hover(
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

							table.find("[order]").on(
									"mousedown",
									function() {
										var arrowObj = $(this).find(
												"[name='orderspan']");
										arrowObj.removeClass("sortArrowHover");
										arrowObj.addClass("sortArrowDown");
									});
							table.find("[order]").on(
									"mouseup",
									function() {
										var arrowObj = $(this).find(
												"[name='orderspan']");
										arrowObj.removeClass("sortArrowDown");
										arrowObj.addClass("sortArrowHover");
									});

						});

	}
};

$(function() {
	
	DataTable.init();
});