
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// Single line text input.
var StringControl =api.StringControl =function( object) {
	// reference object
	this.object =object;
	
	var multiline =lib.attr.has( object, 'data-multiline');
	
	var pattern =lib.attr.get( object, 'data-pattern');
	if( pattern !==undefined)
		// store pattern's value
		this.pattern =pattern;
	
	var minLength =lib.attr.get( object, 'data-min-length');
	if( minLength !==undefined)
		// store min. length
		this.minLength =parseInt( minLength);
	
	var maxLength =lib.attr.get( object, 'data-max-length');
	if( maxLength !==undefined)
		// store max. length
		this.maxLength =parseInt( maxLength);
	
	var allowEmpty =lib.attr.get( object, 'data-allow-empty');
	if( allowEmpty !==undefined)
		// set allow empty flag
		this.allowEmpty =true;
	
	var secret =lib.attr.get( object, 'data-secret');
	if( secret !==undefined)
		// set secret flag
		this.secret =true;
	
	var placeholder =lib.attr.get( object, 'data-placeholder');
	if( placeholder !==undefined)
		// store placeholder's value
		this.placeholder =placeholder;
	
	// read initial value from inside of object
	var value =lib.html.get( object);
	
	// initialize manual input control
	this.initManualInputControl( lib.attr.has( object, 'data-required'), multiline, value);
	
	// wipe all contents inside object
	lib.html.empty( object);
	
	// reference current object
	var self =this;
	
	{// put text input control inside object
		if( multiline) {
			// init textarea
			var elem =this.inputElement =document.createElement( 'TEXTAREA');
			
		} else {
			// init text input
			var elem =this.inputElement =document.createElement( 'INPUT');
		}
		
		if( !multiline)
			// assign input type
			elem.type =this.secret ? 'password' : 'text';
		
		// assign value
		elem.value =value;
		
		// listen for changes
		lib.event.bind( elem, 'keyup', this.__keyUpHandler =function(){
			// copy value from input to the control
			self.__updateValue( this.value);
			
			// validate value
			self.__validate();
			
			// update view
			self.__onUpdateView( true);
		});
		
		// listen for blur and focus
		lib.event.bind( elem, 'focus', this.__focusHandler =function(){
			// hide placeholder if needed
			self.__hidePlaceholder();
			
			// put in activated state
			lib.attr.set( object, 'data-activated', 'activated');
			
			// trigger focus event
			lib.event.trigger( object, 'control-activate');
		});
		
		lib.event.bind( elem, 'blur', this.__blurHandler =function(){
			// show placeholder if needed
			self.__showPlaceholder();
			
			// put in deactivated state
			lib.attr.remove( object, 'data-activated');
			
			// trigger blur event
			lib.event.trigger( object, 'control-deactivate');
		});
		
		// append element
		object.appendChild( elem);
	}
	
	// reference control on an object
	object.control =this;
	
	// show placeholder
	this.__showPlaceholder();
	
	// update view
	this.__onUpdateView();
};

// reference prototype
var p =StringControl.prototype;

// inherit from ManualInputControl
lib.extend( p, api.ManualInputControl.prototype);

// associated object
p.object =undefined;

// input element, that is being user for text input
p.inputElement =undefined;

// placeholder text
p.placeholder ='';

// control unloading method
p.unloadStringControl =function() {
	// remove event listeners from input element
	lib.event.unbind( this.inputElement, 'keyup', this.__keyUpHandler);
	lib.event.unbind( this.inputElement, 'focus', this.__focusHandler);
	lib.event.unbind( this.inputElement, 'blur', this.__blurHandler);
	
	// remove internal attrs
	lib.attr.remove( this.object, ['data-invalid', 'data-activated']);
	
	if( this.multiline) {
		// dump value to the object
		lib.html.set( this.object, this.value);
		
	} else {
		// wipe inner contents of associated object
		lib.html.empty( this.object);
		
		// dump value to attribute
		lib.attr.set( this.object, 'data-value', this.value);
	}
	
	// dereference object
	this.object =undefined;
	
	// unload manual input control
	this.unloadManualInputControl();
};

// control focusing method
p.focus =function() {
	this.inputElement.focus();
};

// triggered when internal changes were made and
//  view must now be updated.
p.__onUpdateView =function( triggerChange) {
	// default args
	if( triggerChange ===undefined)
		triggerChange =false;
	
	if( this.valid) {
		// put object in a valid state
		lib.attr.remove( this.object, 'data-invalid');
		
	} else {
		// pub object in an invalid state
		lib.attr.set( this.object, 'data-invalid', 'invalid');
	}
	
	if( triggerChange)
		// trigger change event on an object
		lib.event.trigger( this.object, 'change');
};

// show placeholder if needed
p.__showPlaceholder =function() {
	
	if( this.value.length ==0) {
		// display placeholder
		if( !lib.attr.hasClass( this.inputElement, 'placeholder'))
			lib.attr.addClass( this.inputElement, 'placeholder');
		
		// assign placeholder's value
		this.inputElement.value =this.placeholder;
	}
};

// hide placeholder if needed
p.__hidePlaceholder =function() {
	if( this.inputElement.value !=this.value)
		// sync values (hide placeholder, show value)
		this.inputElement.value =this.value;
	
	// remove placeholder class if existed
	lib.attr.removeClass( this.inputElement, 'placeholder');
};

// synchronize value
p.__sync =function() {
	// sync input element with control's state
	this.inputElement.value =this.value;
	
	// show placeholder if needed
	this.__showPlaceholder();
};

})( EVOLIB_EXPORT, 'controls');
