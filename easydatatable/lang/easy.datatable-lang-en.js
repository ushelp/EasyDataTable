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
		DataTable.loading_msg = "Data is loading ......";
		DataTable.default_lang = {
			first : "first",
			previous : "previous",
			next : "next",
			last : "last",
			totalCount : "total {0} rows",
			totalPage : "total {0} pages",
			rowPerPage : "page for {0} rows"
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