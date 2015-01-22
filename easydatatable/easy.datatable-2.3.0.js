/**
 * jQuery EasyDataTable Plugin
 * 
 * Version 2.3.0
 * 
 * http://easyproject.cn
 * https://github.com/ushelp/EasyDataTable
 * 
 * Copyright 2014 Ray [ inthinkcolor@gmail.com ]
 * 
 * Dependencies: jQuery
 * 
 */
(function(window){
	var cacheData={},
	cacheDataRow={},
	cacheThLength = {},
	cachePageTheme = {},
	cacheLanguage = {},
	cacheOrderArrow = {},
	cacheInitLoading = {},
	cacheStartFun = {},
	cacheEndFun = {},
	cacheUserPage = {},
	cacheInit = {},
	cacheDefaultRow = {},
	cacheInitStaticData={},
	cacheStaticData = {},
	cacheStaticTable = {},
	cacheLoadDefault = {},
	cacheSizeArray={},
	order_default="&uarr;&darr;",
	order_up="&uarr;",
	order_down="&darr;",
	orderCache={},//按DataTableID自定义排序指示符
	/**
 * DataTable数据加载
 * @param tableid 数据表格id
 * @param easydataParams 初始化参数
 * @param jsonData 静态查询加载的数据
 * @param staticFlag 是否静态查询
 */
innerLoad=function(tableid, easydataParams, jsonData, staticFlag) {
	var nowDataTable = $("[id='" + tableid + "']");
	if (nowDataTable.length == 0) {
		return;
	}
	easydataParams = easydataParams == undefined ? {} : easydataParams;
	var dataForm = $("form").has(nowDataTable);

	
	/*
	 * 提交分页数据验证
	 */
	var pagenoEle = dataForm.find("[name='pageNo']");
	var rowperpageEle = dataForm.find("[name='rowPerPage']");
	if (!Validate.integer.test(pagenoEle.val())) {
		pagenoEle.val(1);
	}
	if (!Validate.integer.test(rowperpageEle.val())) {
		rowperpageEle.val(this.default_row);
	}

	// 初始化标识(未初始化)
	if (!cacheInit[tableid]) {
		cacheInit[tableid] = false;
		// 第一次加载，未初始化
		// 初始化时，start函数缓存
		if (easydataParams.start) {
			cacheStartFun[tableid] = easydataParams.start;
		}
		// 初始化时，end函数缓存
		if (easydataParams.end) {
			cacheEndFun[tableid] = easydataParams.end;
		}
		// 初始页和初始每页条数
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
		var initPage = "<div id='datatable_initPageData' style='display:none'>"
				+ "<input type='hidden' name='pageNo' value='1'/>"
				+ "<input type='hidden' name='rowPerPage' value='"
				+ defRow
				+ "' />" + "</div>";
		dataForm.append(initPage);
	} else {
		// 如果分页页码不在当前分页列表
		// if(dataForm.find(".panelBar
		// [class~='pagego'][name='numgoto'][value='numgoto_"+pagenoEle.val()+"']").length==0){

		dataForm.find(".panelBar [id='datatable_pagenum']").html(
				pageNumSpan(tableid, pagenoEle.val(),
						cacheData[tableid]["totalCount"]));
		// }else{ //如果存在
		// 先显示分页状态
		// dataForm.find(".panelBar
		// [class~='pagego'][name='numgoto'][class~='nowpagenum']").removeClass("nowpagenum");
		// dataForm.find(".panelBar
		// [class~='pagego'][name='numgoto'][value='numgoto_"+pagenoEle.val()+"']").addClass("nowpagenum");

		// }
	}
	
	// start函数调用,数据加载开始时执行
	if (cacheStartFun[tableid]) {
		try {
			// 数据表格，是否是第一次加载
			cacheStartFun[tableid](nowDataTable[0],
					!cacheInit[tableid]);
		} catch (e) {
		}
	}
	// 使用的分页主题
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
			// 初始化时保存自定义分页content
			
			
			cacheUserPage[tableid] = dataForm.find(".panelBar")
					.html();
			if(cacheUserPage[tableid]){
				cacheUserPage[tableid]=cacheUserPage[tableid].replace(/\n/g, "").replace(/\r/g, "").replace("}%","}%\r\n");
			}
			
			dataForm.find(".panelBar").html("");
		}
	}

	if (!cacheDataRow[tableid]) {
		// 获取数据行
		var dataRow = ("<tr>" + nowDataTable.find(" tr:eq(1)").html() + "</tr>")
				.replace(/\n/g, "").replace(/\r/g, "").replace("}%",
						"}%\r\n");
		cacheDataRow[tableid] = dataRow;
		nowDataTable.find(" tr:eq(1)").find("td").css("border", "0");
		nowDataTable.find(" tr:eq(1)").css("border", "0");
	}
	// 分页加载数据时表格的显示方式
	if (cacheLoadDefault[tableid] == undefined) {
		var table_loading_attr = nowDataTable.attr("loading");
		if (table_loading_attr) {
			cacheLoadDefault[tableid] = table_loading_attr;
		} else {
			cacheLoadDefault[tableid] = DataTable.loading_show;
		}
		if (!(easydataParams.loading == undefined)) {
			cacheLoadDefault[tableid] = easydataParams.loading
					+ "";
		}
	}
	

	/*
	 * 表单参数
	 */
	postParam = dataForm.serialize();
	
	// 分页加载数据时,表格的显示方式,必须在表单参数获取完后
	loadShow(tableid, nowDataTable);
	if (easydataParams.language) {
		// 如果存在语言，则按照指定语言显示
		cacheLanguage[tableid] = easydataParams.language;
	}
	// 如果没有指定语言，则使用缓存语言
	if (cacheLanguage[tableid] == undefined) {
		cacheLanguage[tableid] = DataTable.default_lang;
	}


	if (staticFlag) {
		var data = jsonData;
		var valueObject = nowDataTable.attr("value");
		if (valueObject) {
			
			if($.isArray(data[valueObject].data)){
				data.totalCount = data[valueObject].data.length;
				data[valueObject].totalCount =data[valueObject].data.length;
			}else{
				var j=0;
				for(var i in data[valueObject].data){
					j++;
				}
				data.totalCount =j;
				data[valueObject].totalCount =j;
			}
		}else{
			if($.isArray(data.data)){
				data.totalCount = data.data.length;
				
			}else{
				var j=0;
				for(var i in data.data){
					j++;
				}
	
				data.totalCount =j;
			}
		
		}
		
		var rowPerPage=data.totalCount;
		
		if (valueObject) {
			if(jsonData.rowPerPage){
				dataForm.find("[name='rowPerPage']").val(jsonData.rowPerPage);
				rowPerPage=jsonData.rowPerPage;
			}else if(jsonData[valueObject].rowPerPage){
				dataForm.find("[name='rowPerPage']").val(jsonData[valueObject].rowPerPage);
				rowPerPage=jsonData[valueObject].rowPerPage;
			}
		}else{
			if(jsonData.rowPerPage){
				dataForm.find("[name='rowPerPage']").val(jsonData.rowPerPage);
				rowPerPage=jsonData.rowPerPage;
			}else if (Validate.integer.test(dataForm.find(".panelBar").attr("row"))) {
				rowPerPage =dataForm.find(".panelBar").attr("row");
			}
		}
		if(easydataParams.row){
			rowPerPage=easydataParams.row;
		}
		
		var pageNo=data.pageNo;
		if (valueObject) {
			if(!pageNo){
				pageNo=data[valueObject].pageNo;
			}
			if(!pageNo){
				pageNo=1;
			}
		}else{
			if(!pageNo){
				pageNo=1;
			}
		}

		var s=(pageNo-1)*rowPerPage;
		var e=parseInt(s)+parseInt(rowPerPage);
	
	
		if (valueObject) {

			var pageData={};
			if($.isArray(data[valueObject].data)){
				pageData=[];
			}
			
			var j=0;
			for (var i in data[valueObject].data){
				if(j>=s&&j<e){
					pageData[i]=data[valueObject].data[i];
				}
				j++;
			}
			
			data.pageNo=pageNo;
			data.rowPerPage=rowPerPage;
			
			data[valueObject].pageNo=pageNo;
			data[valueObject].rowPerPage=rowPerPage;
		
			data[valueObject].data=pageData;
		}else{

			
			var pageData={};
			if($.isArray(data.data)){
		
				pageData=[];
			}
			
			var j=0;
			for (var i in data.data){
				if(j>=s&&j<e){
					pageData[i]=data.data[i];
				}
				j++;
			}
			data.pageNo=pageNo;
			data.rowPerPage=rowPerPage;
			data.data=pageData;
		}
		
		cacheDefaultRow[tableid] =rowPerPage + "";
	
		// 分页数据筛选
		cacheData[tableid] = data;
		dataShow(tableid, nowDataTable, dataForm, data);

		// end函数调用,数据加载结束时执行
		if (cacheEndFun[tableid]) {
			try {
				// 数据表格，是否是第一次加载
				cacheEndFun[tableid](nowDataTable[0],
						!cacheInit[tableid]);
			} catch (e) {
			}
		}
		// 完成第一次加载，已初始化
		if (!cacheInit[tableid]) {
			cacheInit[tableid] = true;
			$("#datatable_initPageData").remove(); // 清除初始页和每页条数
		}
	} else {
		/*
		 * ajax请求数据
		 */
		$.post(dataForm.attr("action"), postParam, function(data) {
			if (typeof data == "string") {
				data = eval("(" + data + ")");
			}
			cacheData[tableid] = data;

			dataShow(tableid, nowDataTable, dataForm, data);

			// end函数调用,数据加载结束时执行
			if (cacheEndFun[tableid]) {
				try {
					// 数据表格，是否是第一次加载
					cacheEndFun[tableid](nowDataTable[0],
							!cacheInit[tableid]);
				} catch (e) {
				}
			}
			// 完成第一次加载，已初始化
			if (!cacheInit[tableid]) {
				cacheInit[tableid] = true;
				$("#datatable_initPageData").remove(); // 清除初始页和每页条数
			}
		});
	}
},
staticPagination = function(tableid) {
	DataTable.resetOrder(tableid); //静态分页取消排序效果
	var jsonData=clone(cacheStaticTable[tableid]); 
	
	var nowDataTable = $("[id='" + tableid + "']");
	if (nowDataTable.length == 0) {
		return;
	}
	
	var dataForm = $("form").has("[id='" + tableid + "']");
	
	jsonData.pageNo=dataForm.find("[name='pageNo']").val();
	jsonData.rowPerPage=dataForm.find("[name='rowPerPage']").val();

	innerLoad(tableid, {}, jsonData, true);
	
},
entityMap = {
		unescape : {
			'&amp;' : '&',
			'&lt;' : '<',
			'&gt;' : '>',
			'&quot;' : '"',
			'&#x27;' : "'"
		}
	},
	entityRegexes = {
		unescape : new RegExp('(' + ['&amp;','&lt;','&gt;','&quot;','&#x27;'].join('|') + ')',
				'g')
	}
	,
	unescape = function(string) {
			if (string == null)
				return '';
			return ('' + string).replace(entityRegexes['unescape'], function(
					match) {
				return entityMap['unescape'][match];
			});
	},
formatContent = function(content, jsondata) {
	content=unescape(content);
	// EasyDataTable 属性表达式
	var reg = /\{([^}]+)\}/g;
	// var regExp=/\%\{([\s\S]+)\}/g;
	var regExp = /\%\{(.*)\}\%/g; //语句表达式
	var arrExp=/\[([0-9]+)\]/g;//数组表达式
	// EasyDataTable 语句表达式
	content = content.replace(regExp, function(m, i) {
		
		with (jsondata) {
			try {
				var res= eval($.trim(i).replace(arrExp,function(n,j){
					return jsondata[j];
				}));
				
				return res==undefined?"":res;
			} catch (e) {
				return m;
			}
		}
	});
	content = content.replace(reg, function(m, i,i2) {
		with (jsondata) {
			try {
				var res;
				if((i+"").indexOf(".")!=-1){
					res=jsondata[i];
				}
				if(res){
					return res;
				}
				if(/\[([0-9]+)\]/.test(i)){
					return jsondata[i.substring(1,i.length-1)];
				}
				
				return eval($.trim(i)) == null ? "" : eval($.trim(i));
			} catch (e) {
				// return m;
				return "";
			}
		}
	});
	return content;
},
clone=function(o){
	if(o==null||o==undefined){
		return o;
	}
	var o2 = o.constructor === Array ? [] : {};
	for(var i in o){
		o2[i] = typeof o[i] == "object" ? clone(o[i]) : o[i];
	}
	return o2;
},
staticMatch=function(name,value,match){
	this.name=name;
	this.value=value;
	this.match=match;
},
regFilter=function(v,sql){  //将正则表达式转为普通字符串
	return v.replace(/\\/g,"\\\\").replace(/\+|\.|\*|\?|\^|\$|\[|\]|\(|\)|\{|\}|\/|\|/g,"\\\$&");
},
sqlFilter=function(v){ //SQL不替换中括号,_和%替换
	return v.replace(/\\/g,"\\\\").replace(/\+|\.|\*|\?|\^|\$|\(|\)|\{|\}|\/|\|/g,"\\\$&").replace(/_/g,".").replace(/%/g,".*");
},
matchReg=function(matchMode,v,f){
	var s="^",e="$"; //正则开始，结束标记
	if(matchMode=="extra"||matchMode=="extra_i"){//EXTRA完全匹配(正则)
		v=regFilter(v);
	}else if(matchMode=="sql"||matchMode=="sql_i"){  //SQL匹配(正则)
		v=sqlFilter(v);
	}else if(matchMode=="like"||matchMode=="like_i"){  //LIKE匹配(正则)
		v=regFilter(v);
		s="",e=""; 
	}else{ //REG匹配(正则)
		s="",e=""; 
	}
	return new RegExp(s+v+e,f);
}
,
filterStaticData= function(data, params,or,dataForm) {
	
	var mode=DataTable.default_matchMode.toLowerCase(),
	f=mode.indexOf("_i")!=-1?"i":"", //正则匹配
	paramsMatch={}		;
	
	$.each(params,function(k,v){
		if(/\[([0-9]+)\]/.test(k)){
			k=k.substring(1,k.length-1);
		}
		if($.trim(v)!=""){
			paramsMatch[k]=new staticMatch(k,matchReg(mode,v,f),mode);
		}
	});
	
	
	
	dataForm.find(":input[mode]").each(function(k,v){
		var v=$.trim($(this).val());
		
		if(v!=""){
			var 
			name=$(this).attr("name"),
			mode=$(this).attr("mode").toLowerCase();
			
			if(/\[([0-9]+)\]/.test(name)){
				name=name.substring(1,name.length-1);
			}
			
			if(!(mode=="extra"||mode=="extra_i"||mode=="sql"||mode=="sql_i"||mode=="like"||mode=="like_i"||mode=="reg"||mode=="reg_i")){
				mode=DataTable.default_matchMode.toLowerCase();
			}
			var f=mode.indexOf("_i")!=-1?"i":""; //正则匹配
			paramsMatch[name]=new staticMatch(name,matchReg(mode,v,f),mode);
		}
		
	});
	
	var l = $.isArray(data); // 是List(非Map)
	var filterData = {};
	if (l) {
		filterData = [];
	}
	var noCondition = true;
	for ( var pname in paramsMatch) { // 如果没有条件，则返回所有
		if (paramsMatch[pname] != "") {
			noCondition = false;
		}
	}
	if (noCondition) {
		return data;
	}
	var j = 0;
	if (or) {// OR
		for ( var i in data) {
			var flag = false;
			for ( var pname in paramsMatch) {
				// 如果当前数据存在匹配条件
				try {
					if (paramsMatch[pname] != "" && data[i][pname]) { // 存在参数
						 // reg正则表达式匹配
						if(paramsMatch[pname].value.test(data[i][pname])){
							flag = true; // 数据匹配
							break;
						}
						
					}
				} catch (e) {
				}
			}
			if (flag) {
				if (l) {
					filterData[j] = data[i]; // 加入筛选集合
					j++;
				} else {
					filterData[i] = data[i]; // 加入筛选集合
				}
			}
		}
	} else { // AND
		for ( var i in data) {
			var flag = true;
			for ( var pname in paramsMatch) {
				
				// 如果当前数据存在匹配条件
				try {
					if (data[i][pname]) { // 存在参数
						// reg正则表达式匹配  
						if(!paramsMatch[pname].value.test(data[i][pname])){
							flag = false; // 数据不匹配
							break;
						}
						
					} else {
						flag = false; // 数据不匹配
						break;
					}
				} catch (e) {
					flag = false; // 数据不匹配
					break;
				}
			}
			if (flag) {
				if (l) {
					filterData[j] = data[i]; // 加入筛选集合
					j++;
				} else {
					filterData[i] = data[i]; // 加入筛选集合
				}
			}
		}
	}
	return filterData;
},
getPostParam = function(postParam) {
	var params = {};
	var exclued_params = "#maxPage#rowPerPage#datatableIndex#datatableCount#pageNo#totalCount#order#sort#"
			.toLowerCase();
	
	for ( var i in postParam) {
		if (exclued_params.indexOf("#" + postParam[i].name.toLowerCase()
				+ "#") == -1) {
			params[postParam[i].name] = postParam[i].value.replace(
					/(^\s+)|(\s+$)/g, "");
		}
	}

	return params;
},
loadShow = function(tableid, nowDataTable) {
	if(cacheLoadDefault[tableid]){
		var loading_type = cacheLoadDefault[tableid].toLowerCase();
		if (loading_type == 'default') {
			if (cacheInitLoading[tableid] == undefined) { // 初次加载
				nowDataTable.find(" tr:gt(0)").remove();
				cacheInitLoading[tableid] = "loaded";
			}
			// 新方式，切换页面时，禁用数据操作(禁用超链，按钮)，显示为灰色
			nowDataTable.find(" tr:gt(0)").find("*").on("click", function() {
				return false;
			});
			nowDataTable.find(" tr:gt(0)").find("*").css("color", "gray");
		} else if (loading_type == 'none') {
			if (cacheInitLoading[tableid] == undefined) { // 初次加载
				nowDataTable.find(" tr:gt(0)").remove();
				cacheInitLoading[tableid] = "loaded";
			}
			nowDataTable.find("tr:gt(0)").hide(); // 隐藏数据行内容
		} else if (loading_type == 'hide') {
			if (cacheInitLoading[tableid] == undefined) { // 初次加载
				nowDataTable.find(" tr:gt(0)").remove();
				cacheInitLoading[tableid] = "loaded";
			}
			// 旧方式，切换页面时隐藏当前页面数据
			nowDataTable.find("tr:gt(0)").css("visibility", "hidden"); // 完全隐藏数据行
		} else if (loading_type == 'show') {
			nowDataTable.find(" tr:gt(0)").remove();
			
			$("[id='" + tableid + "_loading_div']").hide();
			nowDataTable.after("<div id='" + tableid
					+ "_loading_div' class='DataTable_Loading'>"
					+ DataTable.loading_msg + "</div>");
		} else {
			nowDataTable.find(" tr:gt(0)").remove();
			
			$("[id='" + tableid + "_loading_div']").hide();
			nowDataTable.after("<div id='" + tableid
					+ "_loading_div' class='DataTable_Loading'>"
					+ cacheLoadDefault[tableid] + "</div>");
		}
	}
},
/**
 * 初始化需要显示的数据和内容。如果是静态全部查询，则负责筛选出缓存数据，再按照静态数据处理由分页加载显示这些缓存数据。
 *
 */
initDataAndContent=function(tableid, nowDataTable, dataForm, data, params, or,all){

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
		cacheData[tableid].pageNo = parseInt(data[valueObject].pageNo);
		cacheData[tableid].rowPerPage = parseInt(data[valueObject].rowPerPage);
		cacheData[tableid].totalCount = parseInt(data[valueObject].totalCount);
		cacheData[tableid].order = dataTableOrder;
		cacheData[tableid].sort = dataTableSort;
		cacheData[tableid].maxPage = Math
				.floor(((cacheData[tableid].totalCount - 1) / cacheData[tableid].rowPerPage) + 1);
		var filterData = data[valueObject].data;
		if (params) { // 如果是静态查询
			filterData = filterStaticData(data[valueObject].data,
					params, or,dataForm);
		}
		cacheStaticData[tableid] = clone(filterData);
		
		for ( var i in filterData) {
			filterData[i].datatableCount = parseInt(j) + 1;
			filterData[i].datatableIndex = parseInt(j);
			for ( var property in data) {
				if (property != valueObject) {
					filterData[i][property] = data[property];
				}
			}
			filterData[i].pageNo = parseInt(data[valueObject].pageNo);
			filterData[i].rowPerPage = parseInt(data[valueObject].rowPerPage);
			filterData[i].totalCount = parseInt(data[valueObject].totalCount);
			filterData[i].maxPage = Math
					.floor(((parseInt(filterData[i].totalCount) - 1) / parseInt(filterData[i].rowPerPage)) + 1);
			filterData[i].key = i;
			filterData[i].order = dataTableOrder;
			filterData[i].sort = dataTableSort;
			if(!all){
				content += formatContent(
						cacheDataRow[tableid], filterData[i]);
			}

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

		cacheData[tableid].maxPage = Math
				.floor(((parseInt(data.totalCount) - 1) / parseInt(data.rowPerPage)) + 1);
		var filterData = data.data;
		
		if (params) { // 如果是静态查询
			filterData = filterStaticData(data.data, params, or,dataForm);
		}
		cacheStaticData[tableid] = clone(filterData);
		
		
		
		for ( var i in filterData) {
			for ( var property in data) {
				
				if (property != "data") {
					filterData[i][property] = data[property];
					
				}
			}
			
			filterData[i].datatableCount = parseInt(j) + 1;
			filterData[i].datatableIndex = parseInt(j);
			filterData[i].key = i;
			filterData[i].maxPage = Math
					.floor(((parseInt(filterData[i].totalCount) - 1) / parseInt(filterData[i].rowPerPage)) + 1);
			filterData[i].order = dataTableOrder;
			filterData[i].sort = dataTableSort;
			
			
			
			
			if(!all){
				content += formatContent(
						cacheDataRow[tableid], filterData[i]);
			}
			j++;
		}
	}
	

	
//		if (!all&&params) { // 如果不是全部静态数据筛选，并是静态查询
		dataForm.find(" .pages .totalCount").html(j); // 更新数据总条数
//		}
//		if(!all){ // 如果不是全部静态数据筛选，则处理数据
		return {"content":content,"dataTableOrder":dataTableOrder,"dataTableSort":dataTableSort};
//		}
}
,
/**
 * 展示数据
 * @param tableid 数据表格id
 * @param nowDataTable  数据表格对象
 * @param dataForm  数据表格所在表单
 * @param data 原始数据
 * @param params 静态查询时的条件参数
 * @param or 查询方式，是否OR
 * @param all 查询范围，是否ALL
 */
dataShow= function(tableid, nowDataTable, dataForm, data, params, or,all) {
	
	
	//content,dataTableOrder,dataTableSort
	var res=initDataAndContent(tableid, nowDataTable, dataForm, data, params, or,all);
	
	
	if (!params) { // 非静态查询筛选分页
		/*
		 * 分页部分
		 */
		pageTheme(tableid, cachePageTheme[tableid]);

		// 初始化分页显示的数据
		dataForm.find(" .pages .totalCount").html(data['totalCount']);
		dataForm.find(" .mycombox").val(data['rowPerPage']);
		dataForm.find(" [name='pageNo']").val(data['pageNo']);
		dataForm
				.find(" .pages .maxPage")
				.html(
						Math
								.floor(((parseInt(data['totalCount']) - 1) / parseInt(data['rowPerPage'])) + 1));
		dataForm.find("[name='rowPerPage']").off("change");
		dataForm
				.find("[name='rowPerPage']")
				.on(
						"change",
						function(e) {

							var row = $(this).val(); // 行

							var pagenoEle = dataForm
									.find("[name='pageNo']");
							var maxPage = Math
									.floor(((cacheData[tableid]['totalCount'] - 1) / row) + 1);// 最大页

							if (pagenoEle.val() > maxPage) {
								pagenoEle.val(maxPage);
							}
							if(cacheStaticTable[tableid]){
								staticPagination(tableid);
						    }else{
						    	DataTable.load(tableid);
						    }
						});
		pageCheck(tableid);// 分页标签状态设置
	}

	// 排序隐藏字段
	var orderInfo = "<tr name=\"sort_order_hidden\" style=\"display:none\"><td colspan='"
			+ $("[id='" + tableid + "'] tr:eq(0)").find("th").length
			+ "'><input type='hidden' name='order' value='"
			+ res.dataTableOrder
			+ "'/>"
			+ "<input type='hidden' name='sort' value='"
			+ res.dataTableSort
			+ "'/></td></tr>";

	res.content += orderInfo;
	// 清除大于0的行和loading的msg
	nowDataTable.find(" tr:gt(0)").remove();
	$("[id='" + tableid + "_loading_div']").remove();
	// 显示数据
	nowDataTable.append(res.content);

	// 表格效果事件
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

},
dataObject = function(k, v) {
	this.k = k;
	this.v = v;
},
dataSort = function(data, dataTableSort,dataTableOrder) {

	var l = true;// List集合

	if (!$.isArray(data)) {// Map集合
		l = false;

	}

	var a = new Array(); // keyArray
	for ( var i in data) {
		a.push(new dataObject(i, data[i]));
	}
	
	//数组
	if(/\[([0-9]+)\]/.test(dataTableSort)){
		dataTableSort=dataTableSort.substring(1,dataTableSort.length-1);
	}

	a.sort(function(x, y) {
		if (dataTableSort.toLowerCase() == "key") { // MAP
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
	if (l) { // list集合
		var j = 0;
		for ( var i = 0; i < a.length; i++) {

			b[j] = a[i].v;

			j++;
		}
	} else { // map集合
		for ( var i = 0; i < a.length; i++) {
			b[a[i].k] = a[i].v;
		}
	}
	return b;

},Validate = {
	integer : /^[1-9][0-9]*$/
},
firstDisable=function(tableid,first,prev){
	if(!first){
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
	
},
firstEnable=function(tableid,first,prev){
	if(!first){
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

},
lastDisable=function(tableid,last,next){
	if(!last){
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
},
lastEnable=function(tableid,last,next){
	if(!last){
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
}
,pageCheck = function(tableid) {
	var dataForm = $("form").has("[id='" + tableid + "']");
	var maxPage = cacheData[tableid]["maxPage"];
	var nowPage = parseInt(cacheData[tableid]["pageNo"]);
	var first = dataForm.find("[name='first']");
	var prev = dataForm.find("[name='prev']");
	var next = dataForm.find("[name='next']");
	var last = dataForm.find("[name='last']");
	var pagegoto = dataForm.find("[name='pagegoto']");
	var numgoto = dataForm.find("[name='numgoto']");
	
	firstEnable(tableid,first,prev);
	lastEnable(tableid,last,next);
	
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
		firstDisable(tableid,first,prev);
	}
	if (nowPage >= maxPage) {
		lastDisable(tableid,last,next);
		
	}
},pageMsgCkeck = function(tableid) {
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
},
pageNumSpan = function(tableid, nowPage, totalCount) {
	nowPage = parseInt(nowPage);
	var maxPage = Math.floor((parseInt(totalCount) - 1)
			/ parseInt(cacheData[tableid]["rowPerPage"]) + 1);
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
			pageNum += '<span class="pagego nowpagenum" name="numgoto"  value="numgoto_'
					+ i + '">' + i + "</span>";
		} else {
			pageNum += '<span class="pagego" name="numgoto" value="numgoto_'
					+ i + '">' + i + "</span>";
		}
	}
	return pageNum;
},
pageTheme = function(tableid, theme) {
	var dataForm = $("form").has("[id='" + tableid + "']");
	var content = "";

	// 如果使用自定义分页内容（不使用主题）
	if (theme && theme.toLowerCase() == "no") {
		// 不使用主题
		content = cacheUserPage[tableid];
	} else {
		var pageshowCount = dataForm.find(".panelBar").length;
		if (pageshowCount != 0) {
			
			var sizeArray=cacheSizeArray[tableid];
			if(!sizeArray){

				// 存在分页标签
				var sizes = dataForm.find(".panelBar").attr("size");
				var sizeArray = [ cacheData[tableid].rowPerPage ];
				if (sizes) {
					sizeArray = sizes.split(",");
				}
				if (cacheDefaultRow[tableid]) {
					var sa = "#" + sizeArray.join("#") + "#";
					// 如果已经存在,则不加入
					if (sa.indexOf("#" + cacheDefaultRow[tableid] + "#") != -1) {
						cacheDefaultRow[tableid] = null;
					} else {
						sizeArray.push(cacheDefaultRow[tableid]);
					}
				}
		
				sizeArray.sort(function(i, j) {
					return parseInt(i) - parseInt(j);
				});
				cacheSizeArray[tableid]=sizeArray;
			}
			
			
			
			pageMsgCkeck(tableid);
			var rowPerPageIndex = cacheLanguage[tableid].rowPerPage
					.indexOf("{0}");
			var rowPerPageStart = cacheLanguage[tableid].rowPerPage
					.substring(0, rowPerPageIndex);
			var rowPerPageEnd = cacheLanguage[tableid].rowPerPage
					.substring(rowPerPageIndex + 3);
			var rowNumSpan = '<div class="pages"><span>' + rowPerPageStart
					+ "</span>"
					+ '<select class="mycombox" name="rowPerPage" >';
			$.each(sizeArray, function(i, v) {
				rowNumSpan += '<option value="' + v + '" >' + v
						+ "</option>";
			});
			rowNumSpan += "</select><span>" + rowPerPageEnd + "，";
			var totalPageIndex = cacheLanguage[tableid].totalPage
					.indexOf("{0}");
			var totalPageStart = cacheLanguage[tableid].totalPage
					.substring(0, totalPageIndex);
			var totalPageEnd = cacheLanguage[tableid].totalPage
					.substring(totalPageIndex + 3);
			var totalCountIndex = cacheLanguage[tableid].totalCount
					.indexOf("{0}");
			var totalCountStart = cacheLanguage[tableid].totalCount
					.substring(0, totalCountIndex);
			var totalCountEnd = cacheLanguage[tableid].totalCount
					.substring(totalCountIndex + 3);
			rowNumSpan += totalCountStart
					+ '<label class="totalCount"></label>' + totalCountEnd
					+ "</span></div>";
			var start = '<div class="pages " style="float: right;text-align: right;">';
			var totalPageSpan = '<span class="totalPage">' + totalPageStart
					+ '<label class="maxPage"></label>' + totalPageEnd
					+ "</span>";
			var back = '<span class="pagego" name="first">'
					+ cacheLanguage[tableid].first + "</span>"
					+ '<span class="pagego" name="prev">'
					+ cacheLanguage[tableid].previous + "</span>";

			var pageNum = "<span id='datatable_pagenum'>"
					+ pageNumSpan(tableid,
							cacheData[tableid]["pageNo"],
							cacheData[tableid]["totalCount"])
					+ "</span>";
			var forward = '<span class="pagego" name="next">'
					+ cacheLanguage[tableid].next + "</span>"
					+ '<span class="pagego" name="last">'
					+ cacheLanguage[tableid].last + "</span>";
			var pagegotoSpan = '<span class="pagego"><input type="text" class="gototxt" name="pageNo"  /></span>';
			pagegotoSpan += '<span class="pagegoto" name="pagegoto">&gt;&gt;</span>';
			var end = "</div>";

			if (!theme || theme.toUpperCase() == "FULL") {
				content = rowNumSpan + start + totalPageSpan + back
						+ pageNum + forward + pagegotoSpan + end;
			} else if (theme.toUpperCase() == "SIMPLE") {
				content = rowNumSpan + start + totalPageSpan + back
						+ forward + pagegotoSpan + end;
			} else {
				content = rowNumSpan + start + totalPageSpan + back
						+ pageNum + forward + pagegotoSpan + end;
			}
		}
	}

	dataForm.find(".panelBar").html(
			formatContent(content, cacheData[tableid]));
},
loadInit = function() {
	$(".pagego").hover(function() {
		$(this).addClass("pageGoHover");
	}, function() {
		$(this).removeClass("pageGoHover");
	});
},
/**
 * 静态数据查询
 * @param tableid 数据表格
 * @param or 查询方式，是否OR查询
 * @param data 原始数据
 * @param all 查询范围，是否对全部静态数据筛选
 */
doStaticSearch=function(tableid,or,data,all){
	DataTable.resetOrder(tableid); //取消排序效果
	
	// matchMode 检索模式，支持extra(绝对)、like(模糊)、sql(sql通配符)、reg(正则)
	var nowDataTable = $("[id='" + tableid + "']");
	if (nowDataTable.length == 0) {
		return;
	}
	var dataForm = $("form").has("[id='" + tableid + "']");
	var pagenoEle = dataForm.find("[name='pageNo']");
	pagenoEle.val(1); //显示第一页
	
	// start函数调用,数据加载开始时执行
	if (cacheStartFun[tableid]) {
		try {
			// 数据表格，是否是第一次加载
			cacheStartFun[tableid](nowDataTable[0],
					!cacheInit[tableid]);
		} catch (e) {
		}
	}

	// 分页加载数据时,表格的显示方式
	loadShow(tableid, nowDataTable);
	
	//表单参数，静态筛选条件
	postParam = dataForm.serializeArray();

	var params = getPostParam(postParam);

	if(all){
		   //初始化查询结果数据
		   initDataAndContent(tableid, nowDataTable, dataForm, data, params, or,all);
			var valueObject = nowDataTable.attr("value");
			var jsonData=cacheStaticTable[tableid]; 
	
			if (valueObject) {
				jsonData[valueObject].data=cacheStaticData[tableid] ;
			}else{
				jsonData.data=cacheStaticData[tableid] ;
			}
			
			//对ALL全部静态数据筛选时，缓存筛选后的数据，然后进行分页
			cacheStaticTable[tableid]=clone(jsonData); 
			
			var dataForm = $("form").has("[id='" + tableid + "']");
			
			jsonData.pageNo=dataForm.find("[name='pageNo']").val();
			
			jsonData.rowPerPage=dataForm.find("[name='rowPerPage']").val();

			//对全部数据筛选查询的结果进行分页加载显示
			innerLoad(tableid, {}, jsonData, true);
		
		
	}else{
		dataShow(tableid, nowDataTable, dataForm, data, params, or,all);
	}

	// end函数调用,数据加载结束时执行
	if (cacheEndFun[tableid]) {
		try {
			// 数据表格，是否是第一次加载
			cacheEndFun[tableid](nowDataTable[0],
					!cacheInit[tableid]);
		} catch (e) {
		}
	}
},
pageRangeChk=function(tableid){
	var dataForm = $("form").has("[id='" + tableid + "']");
	/*
	 * 提交分页数据验证
	 */
	var pagenoEle = dataForm.find("[name='pageNo']");
	var row = dataForm.find("[name='rowPerPage']").val();
	var maxPage = Math.floor((cacheData[tableid]["totalCount"] - 1)
			/ row + 1);
	if (pagenoEle.val() > maxPage) {
		pagenoEle.val(maxPage);
	}
},//first,last,disable,enable检测
fldeChk=function(tableid,nowpage){
	firstEnable(tableid);
	lastEnable(tableid);
	if(nowpage<=1){
		//由末页转到首页
		firstDisable(tableid); //禁用首页，上一页
		
		//总页数大于1页，则末页下一页启用
		if(cacheData[tableid]["maxPage"]>1){
			lastEnable(tableid);
		}
	}
	if(nowpage>=cacheData[tableid]["maxPage"]){
		//由首页转到末页
		lastDisable(tableid);
		//总页数大于1页，则首页上一页启用
		if(cacheData[tableid]["maxPage"]>1){
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
}
;

var DataTable = {
		default_row : 5,
		//extra,extra_i,like,like_i,sql,sql_i,reg,reg_i
		default_matchMode:'like_i', 
		loading_show : "default",
		loading_msg:"Data is loading ......",
	    default_lang:{
	      first:"first",
	      previous:"previous",
	      next:"next",
	      last:"last",
	      totalCount:"total {0} rows",
	      totalPage:"total {0} pages",
	      rowPerPage:"page for {0} rows"
	    },
		staticLoad: function(tableid, jsonData, easydataParams) {
			if (typeof jsonData == "string") {
				jsonData = eval("(" + jsonData + ")");
			}
			
			cacheStaticTable[tableid] = clone(jsonData); // 静态数据缓存
			cacheInitStaticData[tableid] = clone(jsonData); // 静态数据缓存
			innerLoad(tableid, easydataParams, clone(jsonData), true);
			
		},
		fileLoad: function(tableid, jsonFile, easydataParams) {
			$.post(jsonFile,function(jsonData){
				cacheStaticTable[tableid] = clone(jsonData); // 静态数据缓存
				cacheInitStaticData[tableid] = clone(jsonData); // 静态数据缓存
				innerLoad(tableid, easydataParams, clone(jsonData), true);
			});
		},
		load : function(tableid, easydataParams) {
			innerLoad(tableid, easydataParams);
		},
		 //取消排序效果
		resetOrder:function(tableid){
			var dataForm = $("form").has("[id='" + tableid + "']");
			dataForm.find("[name='order']").val("");
			dataForm.find("[name='sort']").val("");
			if (cacheOrderArrow[tableid]) {
				cacheOrderArrow[tableid].html("&uarr;&darr;");
			}
		},
		 //取消排序效果，刷新表格，重新加载数据
		reload : function(tableid) {
			DataTable.resetOrder(tableid);
			if(cacheStaticTable[tableid]){//如果是静态数据源
				staticPagination(tableid);
			}else{//如果是动态数据源
				DataTable.load(tableid);
			}
		},
		out : function(msg) {
			return msg;
		},staticDataSort : function(tableid, dataTableSort, dataTableOrder) {
			
			var nowDataTable = $("[id='" + tableid + "']");
			if (nowDataTable.length == 0) {
				return;
			}
			var dataForm = $("form").has("[id='" + tableid + "']");
			var content = "";
			var j = 0;
			var valueObject = nowDataTable.attr("value");

			var data = cacheData[tableid];
		
			if (valueObject) {
				
			
				// 获得排序后的数据
				var filterData = dataSort(cacheStaticData[tableid],
						dataTableSort, dataTableOrder);
				
				for ( var i in filterData) {
					filterData[i].datatableCount = parseInt(j) + 1;
					filterData[i].datatableIndex = parseInt(j);
					for ( var property in data) {
						if (property != valueObject) {
							filterData[i][property] = data[property];
						}
					}
					filterData[i].pageNo = parseInt(data[valueObject].pageNo);
					filterData[i].rowPerPage = parseInt(data[valueObject].rowPerPage);
					filterData[i].totalCount = parseInt(data[valueObject].totalCount);
					filterData[i].maxPage = Math
							.floor(((parseInt(filterData[i].totalCount) - 1) / parseInt(filterData[i].rowPerPage)) + 1);
					filterData[i].key = i;
					filterData[i].order = dataTableOrder;
					filterData[i].sort = dataTableSort;
					content += formatContent(
							cacheDataRow[tableid], filterData[i]);
					j++;
				}
				dataForm.find(" .pages .totalCount").html(j); // 更新数据总条数
				// 更新分页信息
				// dataForm.find(".panelBar
				// [id='datatable_pagenum']").html(pageNumSpan(tableid,1,j));
			} else {

				// 获得排序后的数据
				var filterData = dataSort( cacheStaticData[tableid],
						dataTableSort,dataTableOrder);
				
				
				for ( var i in filterData) {
					for ( var property in data) {
						if (property != "data") {
							filterData[i][property] = data[property];
						}
					}
			
					filterData[i].datatableCount = parseInt(j) + 1;
					filterData[i].datatableIndex = parseInt(j);
					filterData[i].key = i;
					filterData[i].maxPage = Math
							.floor(((parseInt(filterData[i].totalCount) - 1) / parseInt(filterData[i].rowPerPage)) + 1);
					filterData[i].order = dataTableOrder;
					filterData[i].sort = dataTableSort;
					content += formatContent(
							cacheDataRow[tableid], filterData[i]);
					j++;
				}
				dataForm.find(" .pages .totalCount").html(j); // 更新数据总条数
				// 更新分页信息
				// dataForm.find(".panelBar
				// [id='datatable_pagenum']").html(pageNumSpan(tableid,1,j));

			}

			// 排序隐藏字段
			var orderInfo = "<tr name=\"sort_order_hidden\" style=\"display:none\"><td colspan='"
					+ $("[id='" + tableid + "'] tr:eq(0)").find("th").length
					+ "'><input type='hidden' name='order' value='"
					+ dataTableOrder
					+ "'/>"
					+ "<input type='hidden' name='sort' value='"
					+ dataTableSort
					+ "'/></td></tr>";

			content += orderInfo;
			// 清除大于0的行和loading的msg
			nowDataTable.find(" tr:gt(0)").remove();
			$("[id='" + tableid + "_loading_div']").remove();
			// 显示数据
			nowDataTable.append(content);
			// 表格效果事件
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

		},
		/**
		 * 全部静态数据范围静态搜索 
		 * @param tableid 数据表格id
		 * @param or 是否使用or查询
		 */
		staticSearchAll:function(tableid,or) {
			//全部静态数据筛选
			doStaticSearch(tableid,or,cacheInitStaticData[tableid],true);
		},
		/**
		 * 当前页面静态数据范围静态搜索 
		 * @param tableid 数据表格id
		 * @param or 是否使用or查询
		 */
		staticSearch:function(tableid,or) {
			//当前静态页面数据筛选
			doStaticSearch(tableid,or,cacheData[tableid]);
		},
		first : function(tableid) {
			var dataForm = $("form").has("[id='" + tableid + "']");
			/*
			 * 提交分页数据验证
			 */
			var pagenoEle = dataForm.find("[name='pageNo']");
			pagenoEle.val(1);
			
			fldeChk(tableid,1);
			
			if (cacheStaticTable[tableid]) {
				staticPagination(tableid);
			} else {
				this.load(tableid);
			}
			
		},
		prev : function(tableid) {
			var dataForm = $("form").has("[id='" + tableid + "']");
			/*
			 * 提交分页数据验证
			 */
			var pagenoEle = dataForm.find("[name='pageNo']");
			pagenoEle.val(parseInt(cacheData[tableid]["pageNo"]) - 1);
			fldeChk(tableid,pagenoEle.val());
			if (cacheStaticTable[tableid]) {
				staticPagination(tableid);
			} else {
				this.load(tableid);
			}
		},
		next : function(tableid) {
			var dataForm = $("form").has("[id='" + tableid + "']");
			/*
			 * 提交分页数据验证
			 */
			var pagenoEle = dataForm.find("[name='pageNo']");
			pagenoEle.val(parseInt(cacheData[tableid]["pageNo"]) + 1);
			
			fldeChk(tableid,pagenoEle.val());
			
			if (cacheStaticTable[tableid]) {
				staticPagination(tableid);
			} else {
				this.load(tableid);
			}
		},
		last : function(tableid) {
			var dataForm = $("form").has("[id='" + tableid + "']");
		
			var pagenoEle = dataForm.find("[name='pageNo']");
			pagenoEle.val(cacheData[tableid]["maxPage"]);
			fldeChk(tableid,cacheData[tableid]["maxPage"]);
			
			if (cacheStaticTable[tableid]) {
				staticPagination(tableid);
			} else {
				this.load(tableid);
			}
		},
		gopage : function(tableid) {
			pageRangeChk(tableid);
			var dataForm = $("form").has("[id='" + tableid + "']");
			
			var pagenoEle = dataForm.find("[name='pageNo']");
			if (cacheData[tableid]["pageNo"] != pagenoEle.val()
					&& Validate.integer.test(pagenoEle.val())) {
				fldeChk(tableid,pagenoEle.val());
					if(cacheStaticTable[tableid]){
						staticPagination(tableid);
				    }else{
				    	this.load(tableid);
				    }
			}
		},
		numgoto : function(tableid, e) {
			var dataForm = $("form").has("[id='" + tableid + "']");
			/*
			 * 提交分页数据验证
			 */
			var pagenoEle = dataForm.find("[name='pageNo']");
			pagenoEle.val($(e.target).text());
			//当前页不允许点击
//				if (cacheData[tableid]["pageNo"] != dataForm.find(
//						"[name='pageNo']").val()) {
			fldeChk(tableid,pagenoEle.val());
					if(cacheStaticTable[tableid]){
						staticPagination(tableid);
				    }else{
				    	this.load(tableid);
				    }
//				}
		},
		go : function(tableid, pagenum, row) {
			var dataForm = $("form").has("[id='" + tableid + "']");
			if (dataForm && Validate.integer.test(pagenum)) {
				pagenum = parseInt(pagenum);
				if (pagenum <= 0) {
					pagenum = 1;
				}
				if (!row || !Validate.integer.test(row)) {
					row = cacheData[tableid]["rowPerPage"];
				}
				var maxPage = Math
						.floor((cacheData[tableid]["totalCount"] - 1) / row
								+ 1);
				if (pagenum > maxPage) {
					pagenum = maxPage;
				}
				var pagenoEle = dataForm.find("[name='pageNo']");
				if (pagenoEle.val()) {
					pagenoEle.val(pagenum);
				} else {
					dataForm.append('<input type="hidden" value="' + pagenum
							+ '" name="pageNo"/>');
				}
				var rowPerPageEle = dataForm.find("[name='rowPerPage']");
				if (rowPerPageEle.val()) {
					rowPerPageEle.val(row);
				} else {
					dataForm.append('<input type="hidden" value="' + row
							+ '" name="rowPerPage"/>');
				}
				dataForm.find("[name='rowPerPage']").val(row);
				if (cacheData[tableid]["pageNo"] != pagenum) {
					if(cacheStaticTable[tableid]){
						staticPagination(tableid);
					}else{
					    this.load(tableid);
					}
				}
			}
		},
		checkAll : function(o, name) {
			var cs = o.checked;
			if (cs) {
				$(o.form).find("[name='" + name + "']").each(function() {
					this.checked = true;
				});
			} else {
				$(o.form).find("[name='" + name + "']").each(function() {
					this.checked = false;
				});
			};
		},
		/**
		 * 设置排序指示的符号 
		 * @param orderParams 排序外观参数，包括order_default、order_up、order_down三个参数
		 * @param datatableid 可选，指定具体设置外观的表格id
		 */
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
		init:function(){
			$(".pagego").hover(function() {
				$(this).addClass("pageGoHover");
			}, function() {
				$(this).removeClass("pageGoHover");
			});
			$(".datatable").find("tr:eq(1)").css("visibility", "hidden");
			// 隐藏数据行
			$(".easydatatable").each(function() {
				var tableid = $(this).attr("id");
				if (!cacheInit[tableid]) {
					if (tableid) {
						DataTable.load(tableid);
					}
				}
			});
			
			$("[check]").on("click",function(){
				DataTable.checkAll(this,$(this).attr("check"));
			});
			
			//动态搜索
			$(".data_search").each(function(){
				var tableid = $(this.form).find("table[id]").attr("id");
				var o = $(this);
				o.off("click");
				o.on("click", function() {
					if (tableid) {
						DataTable.load(tableid);
					}
				});
			});
			
			/**
			 * 当前页的静态数据搜索
			 * @param o 表格对象
			 * @param param 参数 or 查询方式； all 查询范围
			 * */
			function search(o,param){
				var tableid = $(o.form).find("table[id]").attr("id");
				o = $(o);
				o.off("click");
				o.on("click", function() {
					if (tableid) {
						if(param.all){//全部静态数据搜索
							param.or?DataTable.staticSearchAll(tableid,true):DataTable.staticSearchAll(tableid);
						}else{//当前页的静态数据搜索
							param.or?DataTable.staticSearch(tableid,true):DataTable.staticSearch(tableid);
						}
					}
					
				});
			}
			
			//search AND
			$(".data_static_search").each(function() {
				search(this,{});
			});
			//search OR
			$(".data_static_search_or").each(function() {
				search(this,{"or":true});
			});
			//searchAll AND
			$(".data_static_searchAll").each(function() {
				search(this,{"all":true});
			});
			//searchAll OR
			$(".data_static_searchAll_or").each(function() {
				search(this,{"or":true,"all":true});
			});
			//sort
			dtSort();
			
			}
	};
	
	window.DataTable = DataTable;
	
})(window);

