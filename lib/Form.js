
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
var Map =lib.Map;

// form object
var Form =api.Form =function() {
	// initialize control map
	this.controls =new Map();
	
	// initialize additional arg. map
	this.additionalArgs =new Map();
}

// reference prototype
var p =Form.prototype;

// (read-only) submission methods
p.GET ='get';
p.POST ='post';

// (read-only) control map
p.controls =null;

// additional argument map
p.additionalArgs =null;

// submission method
p.method =p.GET;

// submission action
p.action ='';

// enctype
p.enctype ='multipart/form-data';
p.target ='__self';

// add element to form under specified name
p.addControl =function( control, controlName) {
	
	if( this.controls.has( controlName))
		// specified control name is already within form
		throw 'Control with name "' +controlName +'" already exists';
	
	// store control reference
	this.controls.set( controlName, control);
};

// remove control from form
p.removeControl =function( controlName) {
	this.controls.remove( controlName);
};

// get control by name
p.getControl =function( controlName) {
	return this.controls.get( controlName);
};

// export values as array of name-value objects
p.exportValues =function() {
	// array of name-value objects to return
	var ret =[];
	
	// indicator of form readiness for submit.
	var formValidated =true;
	
	// iterate all controls in form and gather all available
	//  values from those controls.
	this.controls.iterate( function( controlName, control){
		
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
//  form submission or abort it
p.onsubmit =function() {
	return true;
};

// submit form
p.submit =function() {
	
	if( this.onsubmit() ===false)
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

	if( this.additionalArgs.length() >0) {
		// add additional arguments to the form element
		
		this.additionalArgs.iterate( function( name, value){
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

// make hidden INPUT element, that is named and valued according
//  to specified name and value.
p.__makeHiddenInputElement =function( name, value) {
	var elem =document.createElement( 'INPUT');
	elem.type ='hidden';
	elem.name =name;
	elem.value =value;
	
	return elem;
}

})( EVOLIB_EXPORT, 'controls');
