//w2api - Version 0.0.4
exports.install = function() {
	ROUTE('/', view_index);
};

function view_index() {
	var self = this;
	self.view('index');
}