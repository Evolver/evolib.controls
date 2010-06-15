
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
var Map =lib.Map;

// Manual text input control abstraction. Menual text input may have any user-defined
//  input, validated according to developer-specific constraints.
var ManualInputControl =api.ManualInputControl =function(){
};

// reference prototype
var p =ManualInputControl.prototype;

// inherit from Control
lib.extend( p, api.Control.prototype);

// (read-only) set control type
p.type =p.MANUAL;

// regexp pattern to validate user input against
p.pattern =undefined;

// min and max lengths to validate user input against
p.minLength =undefined;
p.maxLength =undefined;

// (read-only) is input multi-line?
p.multiline =false;

// allow empty user input?
p.allowEmpty =true;

// (read-only) should input be secret (like password input)?
p.secret =false;

// currently stored value in the input
p.value ='';

// (read-only) is provided input conforming to the constraints?
p.valid =true;

// initialize manual input control
p.initManualInputControl =function( required, multiline, value) {
	// initialize control
	this.initControl( required);
	
	// assign multiline flag
	this.multiline =multiline;
	
	// assign initial value
	this.__updateValue( value);
	
	// validate
	this.__validate();
};

// unload manual input control
p.unloadManualInputControl =function() {
	// unload control
	this.unloadControl();
};

// update value to the specified one
p.__updateValue =function( value) {
	// assign value
	this.value =value;
};

// check if input is valid
p.__validate =function() {
	// reference value
	var value =this.value;
	
	if( value.length ==0) {
		// empty strings are allowed or disallowed
		return this.valid =this.allowEmpty;
	}
	
	if( !this.multiline && this.pattern !==undefined) {
		// validate single-line strings against regexp pattern
		if( !(new RegExp( this.pattern)).test( value))
			// input does not match regexp pattern
			return this.valid =false;
	}
	
	if( !this.multiline && (new RegExp( '[\\n]')).test( value))
		// single-line input expected
		return this.valid =false;
	
	if(( this.minLength !==undefined && this.minLength > value.length) || ( this.maxLength !==undefined && this.maxLength < value.length))
		// input is too short or too long
		return this.valid =false;
	
	// input is valid
	return this.valid =true;
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

// set new input's value
p.setValue =function( value) {
	// assign new value
	this.__updateValue( value);
	
	// validate value
	this.__validate();
	
	// update view
	this.__onUpdateView( true);
};

})( EVOLIB_EXPORT, 'controls');
