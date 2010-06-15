
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
var Map =lib.Map;

// Boolean control abstraction. Boolean controls may have
//  either checked or unchecked state.
var BoolControl =api.BoolControl =function() {
};

// reference prototype
var p =BoolControl.prototype;

// inherit from Control
lib.extend( p, api.Control.prototype);

// (read-only) assign type
p.type =p.BOOL;

// (read-only) is control checked?
p.checked =false;

// initialize boolean control
p.initBoolControl =function( required, checked) {
	// initialize control
	this.initControl( required);
	
	// assign checked flag
	this.checked =checked ===undefined ? false : checked;
};

//unload boolean control
p.unloadBoolControl =function() {
	// unload control
	this.unloadControl();
};

// check control (or uncheck)
p.check =function( check) {
	// default args
	if( check ===undefined)
		check =true;
	
	if( check) {
		// check control
		if( this.checked)
			// already checked
			return;
		
		// change state
		this.checked =true;
		
		// trigger change
		this.__onChecked();
	
	} else {
		// uncheck control
		if( !this.checked)
			// already unchecked
			return;
		
		// change state
		this.checked =false;
		
		// trigger change
		this.__onUnchecked();
	}
	
	// update view
	this.__onUpdateView( true);
};

// see if control is checked
p.isChecked =function() {
	return this.checked;
};

// toggle control
p.toggle =function() {
	if( this.checked)
		this.check( false);
	else
		this.check();
};

// triggered when control is being checked
p.__onChecked =function() {
	throw 'Override this';
};

// triggered when control is being unchecked
p.__onUnchecked =function() {
	throw 'Override this';
};

})( EVOLIB_EXPORT, 'controls');
