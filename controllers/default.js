//w2api - Version 0.0.1
exports.install = function() {
	ROUTE('/', view_index);
	// or
	// ROUTE('/');
};

function view_index() {
	var self = this;
	self.view('index');
}