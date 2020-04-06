//w2api - Version 0.0.1
/*
* Method to capture erros from application
* To-do: Create route methods to send this over specific webhook
* (If you preffer you can embed some devOps service to track errors on production)
*/
global.ERROR_CATCHER = function(content, desc = ""){
	console.log(content,desc);
}