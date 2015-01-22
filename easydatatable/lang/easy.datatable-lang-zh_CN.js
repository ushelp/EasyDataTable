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
 * Dependencies: EasyDataTable
 * 
 */
$(function(){
	if (DataTable) {
		/*
		 * I18N Resources
		 * */
		DataTable.loading_msg="数据正在加载中.......",
		DataTable.default_lang={
            first:"首页",
            previous:"上一页",
            next:"下一页",
            last:"末页",
            totalCount:"共{0}条",
            totalPage:"共{0}页",
            rowPerPage:"每页显示{0}条"
        };
		/*
		 * Auto init DataTable
		 * 
		 * When you need to manually call can annotate the init code 
		 * 
		 * */
		DataTable.init();
	}
});