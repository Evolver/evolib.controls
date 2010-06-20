
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// form object
var Form =api.Form =function( onsubmit) {
	// initialize control map
	this.controls =new Map();
	
	// initialize additional arg. map
	this.customArgs =new Map();
	
	if( onsubmit !==undefined) {
		// assign onsubmit callback
		this.onsubmit =onsubmit;
	}
}

// reference prototype
var p =Form.prototype;

// (read-only) submission methods
p.GET ='get';
p.POST ='post';

// (read-only) control map
p.controls =null;

// additional argument map
p.customArgs =null;

// submission method
p.method =p.GET;

// submission action
p.action ='';

// enctype
p.enctype ='multipart/form-data';
p.target ='__self';

// add control to form under specified name
p.addControl =function( object, controlName) {
	
	if( controlName ===undefined) {
		// get control name
		if(( controlName =lib.attr.get( object, 'data-control-name')) ===undefined)
			throw 'Unable to determine control\'s name';
	}
	
	if( this.controls.has( controlName))
		// specified control name is already within form
		throw 'Control name "' +controlName +'" is already taken';
	
	// initialize control
	api.initControl( object);
	
	// add control
	this.controls.set( controlName, {
		'object': object,
		'control': object.control
	});
	
	// return control instance
	return object.control;
};

// remove control from form
p.removeControl =function( controlName) {
	
	var entry =this.controls.get( controlName);
	if( entry ===undefined)
		// control is not within form
		return;
	
	// deinitialize control
	api.unloadControl( entry.object);
	
	// remove control from form
	this.controls.remove( controlName);
};

// get control by name
p.getControl =function( controlName, entry) {
	// default args
	if( entry)
		entry =false;
	
	if( !this.controls.has( controlName))
		// control not found
		return undefined;
	
	if( entry) {
		// return entry object
		return this.controls.get( controlName);
		
	} else {
		// return control object
		return this.controls.get( controlName).control;
	}
};

// export values as array of name-value objects
p.exportValues =function() {
	// array of name-value objects to return
	var ret =[];
	
	// indicator of form readiness for submit.
	var formValidated =true;
	
	// iterate all controls in form and gather all available
	//  values from those controls.
	this.controls.iterate( function( controlName, entry){
		// reference control
		var control =entry.control;
		
		switch( control.type) {
			// boolean control
			case control.BOOL:
				if( !control.checked)
					// control is not checked, skip it
					return;
				
				ret.push({'name': controlName, 'value': control.value});
			break;
			
			// option control
			case control.OPTION:
				// get all selected options
				var options =control.getSelectedOptions();
				var i;
				for( i =0; i < options.length; ++i)
					// add options one by one
					ret.push({'name': controlName, 'value': options[ i].value});
			break;
			
			// text control
			case control.MANUAL:
				ret.push({'name': controlName, 'value': control.value});
			break;
		}
	});
	
	// return list of values
	return ret;
};

// triggered right before form is submitted to determine whether to allow
//  form submission or abort it. Override method in order to customly handle
//  submission event.
p.onsubmit =function( invalidEntries) {
	
	if( invalidEntries.length ==0)
		// no invalid controls detected, allow submission
		return true;

	// grab first invalid control and focus it
	var entry =invalidEntries.shift();
	
	// reference control and object
	var control =entry.control;
	var object =entry.object;
	
	if( lib.attr.has( object, 'data-input-error'))
		var errormsg =lib.attr.get( object, 'data-input-error');
	else
		var errormsg =undefined;
	
	// call error handling callback for current control
	control.oninvalid( object, errormsg);

	// do not submit form
	return false;
};

// get invalid controls
p.getInvalidControls =function( controlsOnly) {
	// default args
	if( controlsOnly ===undefined)
		controlsOnly =false;
	
	// invalid entry container
	var ret =[];
	
	// iterate controls
	this.controls.iterate( function( controlName, entry){
		if( !entry.control.valid)
			// control is not valid, push entry
			ret.push( controlsOnly ? entry.control : entry);
	});
	
	// return list of invalid entries
	return ret;
};

// submit form
p.submit =function() {
	
	// find all invalid entries
	var invalid =this.getInvalidControls();
	
	if( this.onsubmit.call( this, invalid) ===false)
		// abort form submission
		return false;
	
	// reference current form object
	var self =this;
	
	// create form element that will be submit()ted later
	var form =document.createElement( 'FORM');
	
	// assign method and action
	form.method =this.method;
	form.action =this.action;
	
	if( this.method ==this.POST) {
		// assign enctype (enctypes are valid for POST requests)
		form.enctype =this.enctype;
	}
	
	if( this.target !='__self') {
		// assign submission target
		form.target =this.target;
	}

	if( this.customArgs.length() >0) {
		// add additional arguments to the form element
		
		this.customArgs.iterate( function( name, value){
			// append argument to form
			form.appendChild( self.__makeHiddenInputElement( name, value));
		});
	}

	// get form control values
	var values =this.exportValues();
	
	// add all form control values to form element
	for( var i =0; i < values.length; ++i) {
		// reference control's value
		var value =values[ i];

		// append value to form element
		form.appendChild( this.__makeHiddenInputElement( value.name, value.value));
	}
	
	// append form to document (otherwise submit() method call will not work)
	document.documentElement.appendChild( form);
	
	// submit form
	form.submit();
	
	// remove form from document
	form.parentNode.removeChild( form);
	
	// form submitted
	return true;
};

// reset form
p.reset =function( withCustomArgs) {
	// default args
	if( withCustomArgs ===undefined)
		withCustomArgs =false;
	
	if( withCustomArgs)
		// clear custom arguments
		this.customArgs.clear();
	
	this.controls.iterate( function( controlName, entry){
		// reset controls one by one
		entry.control.reset();
	});
};

// unload controls from form
p.unloadControls =function() {

	this.controls.iterate( function( controlName, entry){
		// unload controls one by one
		api.unloadControl( entry.object);
	});
	
	// empty control container
	this.controls.clear();
};

// make hidden INPUT element, that is named and valued according
//  to specified name and value.
p.__makeHiddenInputElement =function( name, value) {
	var elem =document.createElement( 'INPUT');
	elem.type ='hidden';
	elem.name =name;
	elem.value =value;
	
	return elem;
};

})( EVOLIB_EXPORT, 'controls');
