
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
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

// control initialization method
p.initControl =function( required) {
	
	if( required !==undefined) {
		// assign required flag
		this.required =required;
	}
};

// control unloading method
p.unloadControl =function() {
	// do nothing
};

// triggered when view must be updated for control.
p.__onUpdateView =function() {
	throw 'Override this';
};

})( EVOLIB_EXPORT, 'controls');
