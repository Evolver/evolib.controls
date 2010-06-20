
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// Option.
var Option =api.Option =function() {
};

// reference prototype
var p =Option.prototype;

// (read-only) associated control
p.control =undefined;

// (read-only) value
p.value =undefined;

// (read-only) html code and text content
p.html ='';
p.text ='';

// (read-only) label html code or string
p.label =undefined;

// initialize option
p.initOption =function( html, text, label, value, object) {
	// assign info
	this.html =html;
	this.text =text;
	this.label =label;
	this.value =value;
};

// unload option
p.unloadOption =function() {
	// do nothing
};

// check if option is selected
p.isSelected =function() {
	// get selected value and compare
	return this.control.isOptionSelected( this);
};

})( EVOLIB_EXPORT, 'controls');
