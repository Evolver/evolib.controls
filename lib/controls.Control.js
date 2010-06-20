
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// form control abstraction (base class for all form controls)
var Control =api.Control =function() {
};

// reference prototype
var p =Control.prototype;
	
// (read-only) control types
p.BOOL =0;
p.OPTION =1;
p.MANUAL =2;

// (read-only) control type (should be overridden in sub prototype)
p.type =null;

// (read-only) is control required for specification?
p.required =false;

// (read-only) indicates if control's input is valid
p.valid =true;

// control initialization method
p.initControl =function( required) {
	
	if( required !==undefined) {
		// assign required flag
		this.required =required;
	}
};

// control unloading method
p.unloadControl =function() {
	// override in subclasses in order to handle control unloading
};

// control resetting method
p.reset =function() {
	// override in subclasses in order to handle control resetting
};

// control focusing method
p.focus =function() {
	// override in subclasses in order to do focusing
};

// validate against constraints
p.validate =function() {
	// validate
	var ret =this.__validate();

	// update view
	this.__onUpdateView();
	
	// return validation result
	return ret;
};

// triggered when control is detected as invalid during
//  form submission. Override this method in order to customly
//  handle control validation errors during form submission.
p.oninvalid =function( object, errormsg) {
	if( errormsg !==undefined)
		// yield error
		alert( errormsg);
	
	// focus on control
	this.focus();
};

// triggered when control validation must be performed
p.__validate =function() {
	// override in order to perform control input's validation
	return this.valid;
};

// triggered when view must be updated for control.
p.__onUpdateView =function() {
	throw 'Override this';
};

})( EVOLIB_EXPORT, 'controls');
