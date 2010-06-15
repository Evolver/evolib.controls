
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

with( Form) {
	
	// submission methods
	prototype.GET ='get';
	prototype.POST ='post';
	
	// control map
	prototype.controls =null;
	
	// additional argument map
	prototype.additionalArgs =null;
	
	// submission method
	prototype.method =prototype.GET;
	
	// submission action
	prototype.action ='';
	
	// enctype
	prototype.enctype ='multipart/form-data';
	prototype.target ='__self';
	
	// add element to form under specified name
	prototype.addControl =function( control, controlName) {
		if( this.controls.has( controlName))
			// duplicate name
			throw 'Control with name "' +controlName +'" already exists';
		
		this.controls.set( controlName, control);
	};
	
	// remove control from form
	prototype.removeControl =function( controlName) {
		this.controls.remove( controlName);
	};
	
	// get control by name
	prototype.getControl =function( controlName) {
		return this.controls.get( controlName);
	};
	
	// export values as array of key-value pair objects
	prototype.exportValues =function() {
		var ret =[];
		
		this.controls.iterate( function( controlName, control){
			switch( control.type) {
				// boolean control
				case control.BOOL:
					if( !control.checked)
						// control is not checked
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
	
	// export form values as URI
	prototype.exportURI =function() {
		var ret ='';
		var values =this.exportValues();
		
		if( values.length ==0)
			// no values, return empty string
			return ret;
		
		var i, value;
		for( i =0; i < values.length; ++i) {
			// reference value
			value =values[ i];
			
			// append args one by one
			ret +=encodeURIComponent( value.name) +'=' +encodeURIComponent( value.value) +'&';
		}
		
		// remove last ampersand from return value and return
		return ret.substring( 0, ret.length -1);
	};
	
	// triggered right before form is submitted
	prototype.onsubmit =function() {
		return true;
	};
	
	// submit form
	prototype.submit =function() {
		if( this.onsubmit() ===false)
			// form will not be submitted
			return false;
		
		// reference current form object
		var self =this;
		
		// create form element
		var form =document.createElement( 'FORM');
		
		// assign method and action
		form.method =this.method;
		form.action =this.action;
		
		if( this.method !=this.GET) {
			// assign enctype
			form.enctype =this.enctype;
		}
		
		if( this.target !='__self')
			// assign submission target
			form.target =this.target;

		// additional arguments were specified
		if( this.additionalArgs.length() >0) {
			// iterate additional arguments
			this.additionalArgs.iterate( function( name, value){
				// append element to the form element
				form.appendChild( self.__makeHiddenInputElement( name, value));
			});
		}

		// list control values
		var values =this.exportValues();
		var i;
		for( i =0; i < values.length; ++i) {
			// reference value
			var value =values[ i];

			// append element to fragment
			form.appendChild( this.__makeHiddenInputElement( value.name, value.value));
		}
		
		// append form to document (needs to be done for form.submit() to 
		//  do it's job)
		document.documentElement.appendChild( form);
		
		// submit form
		form.submit();
		
		// remove form from document
		form.parentNode.removeChild( form);
		
		// form submitted
		return true;
	};
	
	// make hidden INPUT element, that is named and valued according
	//  to specified arguments.
	prototype.__makeHiddenInputElement =function( name, value) {
		var elem =document.createElement( 'INPUT');
		elem.type ='hidden';
		elem.name =name;
		elem.value =value;
		
		// return element
		return elem;
	}
}

// form control abstraction
var Control =function() {
};

with( Control) {
	
	// control types
	prototype.BOOL =0;
	prototype.OPTION =1;
	prototype.MANUAL =2;
	
	// control type (should be overridden in sub prototype)
	prototype.type =null;
	
	// control initialization method
	prototype.initControl =function() {
		// do nothing
	};
	
	// control unloading method
	prototype.unloadControl =function() {
		// do nothing
	};
	
	// triggered when internal changes were made and
	//  view must now be updated.
	prototype.__onUpdateView =function() {
		//throw 'Override this';
	};
}

// boolean control abstraction
var BoolControl =function() {
};

// inherit from Control
lib.extend( BoolControl.prototype, Control.prototype);

with( BoolControl) {
	// assign type
	prototype.type =prototype.BOOL;
	
	// is control checked?
	prototype.checked =false;
	
	// initialize boolean control
	prototype.initBoolControl =function( checked) {
		// initialize control
		this.initControl();
		
		// assign checked flag
		this.checked =checked ===undefined ? false : checked;
	};
	
	// unload bool control
	prototype.unloadBoolControl =function() {
		// unload control
		this.unloadControl();
	};
	
	// check control (or uncheck)
	prototype.check =function( check) {
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
	prototype.isChecked =function() {
		return this.checked;
	};
	
	// toggle checkbox
	prototype.toggle =function() {
		if( this.checked)
			this.check( false);
		else
			this.check();
	};
	
	// triggered when control is being checked
	prototype.__onChecked =function() {
		throw 'Override this';
	};
	
	// triggered when control is being unchecked
	prototype.__onUnchecked =function() {
		throw 'Override this';
	};
};

// checkbox control
var CheckboxControl =api.CheckboxControl =function( object) {
	// reference current object
	var self =this;
	
	// initialize control
	this.initBoolControl( lib.attr.has( object, 'data-checked'));
	
	// reference object
	this.object =object;
	
	if( !lib.attr.has( object, 'data-value'))
		// value is not set on an element
		throw 'data-value attribute is missing on an object';
	
	// read value
	this.value =lib.attr.get( object, 'data-value');
	
	// listen for click events
	lib.event.bind( object, 'click', this.__clickHandler =function(){
		// toggle checkbox
		self.toggle();
	});
	
	// create current object's reference on an element
	object.control =this;
	
	// update view
	this.__onUpdateView();
};

// inherit from BoolControl
lib.extend( CheckboxControl.prototype, BoolControl.prototype);

with( CheckboxControl) {
	
	// associated object
	prototype.object =null;
	
	// value
	prototype.value =null;
	
	// control unloading method
	prototype.unloadCheckboxControl =function() {
		// unbind event handler
		lib.event.unbind( this.object, 'click', this.__clickHandler);
		
		// dereference object
		this.object =undefined;
		
		// unload boolean control
		this.unloadBoolControl();
	};
	
	// triggered when control is being checked
	prototype.__onChecked =function() {
		lib.attr.set( this.object, 'data-checked', 'checked');
	};
	
	// triggered when control is being unchecked
	prototype.__onUnchecked =function() {
		lib.attr.remove( this.object, 'data-checked');
	};
	
	// triggered when internal changes were made and
	//  view must now be updated.
	prototype.__onUpdateView =function( triggerChange) {
		// default args
		if( triggerChange ===undefined)
			triggerChange =true;
		
		// do nothing
		
		if( triggerChange)
			// fire change event on an element
			lib.event.trigger( this.object, 'change');
	};
}

// manual text input control
var ManualInputControl =function(){
};

// inherit from Control
lib.extend( ManualInputControl.prototype, Control.prototype);

with( ManualInputControl) {

	// set control type
	prototype.type =prototype.MANUAL;
	
	// regexp pattern to validate against
	prototype.pattern =undefined;
	
	// min and max lengths
	prototype.minLength =undefined;
	prototype.maxLength =undefined;
	
	// is input multi-line?
	prototype.multiline =false;
	
	// allow empty input?
	prototype.allowEmpty =true;
	
	// should input be secret (like password input)?
	prototype.secret =false;
	
	// currently stored value in the input
	prototype.value ='';
	
	// is provided input conforming to the constraints?
	prototype.valid =true;
	
	// initialize manual input control
	prototype.initManualInputControl =function( multiline, value) {
		// assign multiline flag
		this.multiline =multiline;
		
		// assign initial value
		this.__updateValue( value);
		
		// validate
		this.__validate();
	};
	
	// unload manual input control
	prototype.unloadManualInputControl =function() {
		// unload control
		this.unloadControl();
	};
	
	// update value to the specified one
	prototype.__updateValue =function( value) {
		// assign value
		this.value =value;
	};
	
	// check if input is valid
	prototype.__validate =function() {
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
	prototype.validate =function() {
		// validate
		var ret =this.__validate();
	
		// update view
		this.__onUpdateView();
		
		// return validation result
		return ret;
	};
	
	// set new input's value
	prototype.setValue =function( value) {
		// assign new value
		this.__updateValue( value);
		
		// validate value
		this.__validate();
		
		// update view
		this.__onUpdateView( true);
	};
};

// single line text input
var StringControl =api.StringControl =function( object) {
	// reference object
	this.object =object;
	
	// read multiline flag
	var multiline =lib.attr.get( object, 'data-multiline');
	if( multiline ===undefined)
		multiline =false;
	else
		multiline =true;
	
	if( multiline) {
		// read initial value from inside of object
		var value =lib.html.get( object);
		
	} else {
		// read initial value from attribute
		var value =lib.attr.get( object, 'data-value');
		if( value ===undefined) {
			// value is not set
			value ='';
		}
	}
	
	// wipe all contents inside object
	lib.html.empty( object);
	
	// initialize manual input control
	this.initManualInputControl( multiline, value);
	
	// load placeholder value
	var placeholder =lib.attr.get( object, 'data-placeholder');
	if( placeholder !==undefined)
		// store placeholder's value
		this.placeholder =placeholder;
	
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
			// see if placeholder needs to be hidden
			self.__hidePlaceholder();
			
			// put in activated state
			lib.attr.set( object, 'data-activated', 'activated');
			
			// trigger focus event
			lib.event.trigger( object, 'control-activate');
		});
		
		lib.event.bind( elem, 'blur', this.__blurHandler =function(){
			// see if placeholder should be shown
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

// inherit from ManualInputControl
lib.extend( StringControl.prototype, ManualInputControl.prototype);

with( StringControl) {
	
	// associated object
	prototype.object =undefined;
	
	// input element, that is being user for text input
	prototype.inputElement =undefined;
	
	// placeholder text
	prototype.placeholder ='';
	
	// control unloading method
	prototype.unloadStringControl =function() {
		// remove event listeners from input element
		lib.event.unbind( this.inputElement, 'keyup', this.__keyUpHandler);
		lib.event.unbind( this.inputElement, 'focus', this.__focusHandler);
		lib.event.unbind( this.inputElement, 'blur', this.__blurHandler);
		
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
	
	// triggered when internal changes were made and
	//  view must now be updated.
	prototype.__onUpdateView =function( triggerChange) {
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
	prototype.__showPlaceholder =function() {
		if( this.value.length ==0) {
			// display placeholder
			if( !lib.attr.hasClass( this.inputElement, 'placeholder'))
				lib.attr.addClass( this.inputElement, 'placeholder');
			
			// assign placeholder's value
			this.inputElement.value =this.placeholder;
		}
	};
	
	// hide placeholder if needed
	prototype.__hidePlaceholder =function() {
		if( this.inputElement.value !=this.value)
			// sync values (hide placeholder, show value)
			this.inputElement.value =this.value;
		
		// remove placeholder class if existed
		lib.attr.removeClass( this.inputElement, 'placeholder');
	};
}

// option
var Option =api.Option =function() {
};

with( Option) {
	// associated form element (initialized at construction)
	
	// associated control
	prototype.control =undefined;
	
	// value (initialized at construction)
	prototype.value =undefined;
	
	// html code and text content
	prototype.html ='';
	prototype.text ='';
	
	// label html code or string
	prototype.label =undefined;
	
	// initialize option
	prototype.initOption =function( html, text, label, value, object) {
		// assign info
		this.html =html;
		this.text =text;
		this.label =label;
		this.value =value;
	};
	
	// unload option
	prototype.unloadOption =function() {
		// do nothing
	};
	
	// check if option is selected
	prototype.isSelected =function() {
		// get selected value and compare
		return this.control.isOptionSelected( this);
	};
}

// option control abstraction
var OptionControl =function() {
};

// inherit from Control
lib.extend( OptionControl.prototype, Control.prototype);

with( OptionControl) {
	
	// assign type
	prototype.type =prototype.OPTION;
	
	// list of options (initialized at construction)
	prototype.options =undefined;
	
	// list of selected options (initialized at construction)
	prototype.selected =undefined;
	
	// multiple option selection allowed?
	prototype.multi =false;
	
	// initialize option control
	prototype.initOptionControl =function( options, multi, selected) {
		// initialize control
		this.initControl();
		
		// initialize option list
		this.options =[];
		
		// initialize selected option list
		this.selected =[];
		
		if( multi !==undefined) {
			// set multi flag
			this.multi =multi;
		}
		
		if( options !==undefined) {
			// add options
			this.__addOptions( options);
		}
		
		if( selected !==undefined) {
			// select options
			this.__selectOptions( selected);
		}
	};
	
	// unload option control
	prototype.unloadOptionControl =function() {
		// unload control
		this.unloadControl();
	};
	
	// triggered when option is added to control
	prototype.__onOptionAdded =function( option, afterOption) {
		throw 'Override this';
	};
	
	// triggered when option is removed from control
	prototype.__onOptionRemoved =function( option) {
		throw 'Override this';
	};
	
	// triggered when option is being selected
	prototype.__onOptionSelected =function( option) {
		throw 'Override this';
	};
	
	// triggered when option is being deselected
	prototype.__onOptionDeselected =function( option) {
		throw 'Override this';
	};
	
	// triggered when option ordering is being changed
	prototype.__onOptionOrderingChanged =function() {
		throw 'Override this';
	};
	
	// select all options
	prototype.__selectAllOptions =function() {
		this.__selectOptions( this.options);
	};
	
	// deselect all options
	prototype.__deselectAllOptions =function() {
		this.__selectOptions( this.selected, false);
	};
	
	// select option
	prototype.__selectOptions =function( options, select) {
		// default args
		if( select ===undefined)
			select =true;
		
		// make sure option array is not the same object as 
		//  this.selected array
		if( options ===this.selected)
			options =lib.clone( this.selected, false);
		
		if( select) {
			// select options
			for( var i =0; i < options.length; ++i) {
				var alreadySelected =false;
				var opt =options[ i];
				
				for( var o =0; o < this.selected.length; ++o) {
					if( this.selected[ o] ===opt) {
						alreadySelected =true;
						break;
					}
				}
				
				if( !alreadySelected) {
					// add new selected option
					this.selected.push( opt);
					
					// mark option as selected
					this.__onOptionSelected( opt);
				}
			}
			
		} else {
			// deselect options
			var opt;
			
			for( var i =0; i < options.length; ++i) {
				opt =options[ i];
				
				for( var o =0; o < this.selected.length; ++o) {
					if( this.selected[ o] ===opt) {
						// remove selected attribute
						this.__onOptionDeselected( opt);

						// remove option from selected list
						this.selected.splice( o, 1);
						break;
					}
				}
			}
		}
	};
	
	// sort options using specified algorithm
	prototype.__sort =function( algo, triggerOrderingChange) {
		switch( algo) {
			case 'asc':
				this.options.sort( this.__sortAsc);
			break;
			case 'desc':
				this.options.sort( this.__sortDesc);
			break;
			case 'asc-numeric':
				this.options.sort( this.__sortAscNumeric);
			break;
			case 'desc-numeric':
				this.options.sort( this.__sortDescNumeric);
			break;
			default:
				this.options.sort();
			break;
		}
		
		if( triggerOrderingChange ===undefined || triggerOrderingChange)
			// option ordering was changed
			this.__onOptionOrderingChanged();
	};
	
	// perform ascending string sort
	prototype.__sortAsc =function( a, b) {
		return a.text > b.text ? 1 : -1;
	};
	
	// perform descending string sort
	prototype.__sortDesc =function( a, b) {
		return a.text < b.text ? 1 : -1;
	};
	
	// perform ascending number sort
	prototype.__sortAscNumeric =function( a, b) {
		return parseInt( a.text) > parseInt( b.text) ? 1 : -1;
	};
	
	// perform descending number sort
	prototype.__sortDescNumeric =function( a, b) {
		return parseInt( a.text) < parseInt( b.text) ? 1 : -1;
	};
	
	// check if option is added
	prototype.__isOptionAdded =function( option) {
		for( var i =0; i < this.options.length; ++i)
			if( this.options[ i] ===option)
				// option found
				return true;
		
		// option not found
		return false;
	};
	
	// add multiple options
	prototype.__addOptions =function( options, afterOption) {
		
		// option insertion index
		var insertIndex =0, i;
		
		if( afterOption !==undefined) {
			// determine insertion index
			var found =false;
			
			for( i =0; i < this.options.length; ++i) {
				if( this.options[ i] ===afterOption) {
					insertIndex =i;
					found =true;
					break;
				}
			}
			
			if( !found)
				// specified option was not found
				afterOption =undefined;
		}
		
		// iterate option list
		for( i =0; i < options.length; ++i) {
			// reference option
			var opt =options[ i];
			// reference option
			
			if( this.__isOptionAdded( opt))
				// option is already added
				continue;
			
			// associate option with control
			opt.control =this;
			
			// insert option
			this.options.splice( insertIndex++, 0, opt);
			
			// handle option addition
			this.__onOptionAdded( opt, afterOption);
		}
		
		// update view
		this.__onUpdateView();
	};
	
	// remove target options
	prototype.__removeOptions =function( options) {
		// number of options removed
		var optionsRemoved =0;
		
		if( options ===this.options)
			// make sure same array is not referenced
			options =lib.clone( options, false);
		
		// iterate options
		var o, i;
		for( o =0; o < options.length; ++o) {
			// reference option
			var option =options[ o];
			
			for( i =0; i < this.options.length; ++i) {
				if( this.options[ i] ===option) {
					// option found, remove it from option list
					this.options.splice( i, 1);
					
					// find option within selected option list
					for( i =0; i < this.selected.length; ++i) {
						if( this.selected[ i] ===option) {
							// remove option from selected option list
							this.selected.splice( i, 1);
							break;
						}
					}
					
					// handle option removal
					this.__onOptionRemoved( option);
					
					// option was removed
					++optionsRemoved;
					break;
				}
			}
		}
		
		// return removed option count
		return optionsRemoved;
	};
	
	// sort options using specified ordering algorithm
	prototype.sort =function( algo) {
		this.__sort( algo);
	};
	
	// add option to the option list
	prototype.addOption =function( option, afterOption) {
		// add option
		this.__addOptions( [option], afterOption);
		
		// update view
		this.__onUpdateView();
	};
	
	// add multiple options to the option list
	prototype.addOptions =function( options, afterOption) {
		// add options
		this.__addOptions( options, afterOption);
		
		// update view
		this.__onUpdateView();
	};
	
	// remove option from option list
	prototype.removeOption =function( option) {
		// remove single option
		var removed =this.__removeOptions( [option]) >0;
		
		if( removed)
				// update view
				this.__onUpdateView();
				
		// option was not found
		return removed;
	};
	
	// remove multiple options from option list
	prototype.removeOptions =function( options) {
		// remove options
		var removedOptionCount =this.__removeOptions( options);
		
		if( removedOptionCount >0)
				// update view
				this.__onUpdateView();
				
		// return amount of options removed
		return removedOptionCount;
	};
	
	// check if all options are selected
	prototype.allOptionsSelected =function() {
		return this.options.length ==this.selected.length;
	};
	
	// select option or options
	//  selectOption( value)
	//  selectOption([ value1, value2, ...]);
	prototype.selectOption =function( value, select) {
		if( !this.multi && lib.isArray( value) && value.length >1)
			throw new ErrorException( 'Unable to select multiple options in single-value dropdown');
		
		// default args
		if( select ===undefined)
			select =true;
		
		if( !lib.isArray( value))
			var values =[ value];
		else
			var values =value;
		
		// list of options to select
		var options =[];
		
		for( var i =0; i < values.length; ++i) {
			for( var o =0; o < this.options.length; ++o) {
				if( this.options[ o].value ==values[ i]) {
					options.push( this.options[ o]);
					break;
				}
			}
		}
		
		if( options.length ==0)
			// no options to select
			return;
		
		// select options
		this.__selectOptions( options, select);
		
		// update view
		this.__onUpdateView();
	};
	
	// get first selected option
	prototype.getSelectedOption =function() {
		if( this.selected.length ==0)
			return undefined;
		else
			return this.selected[ 0]
	};
	
	// get list of selected options
	prototype.getSelectedOptions =function() {
		return this.selected;
	};
	
	// check if option is selected
	prototype.isOptionSelected =function( option) {
		for( var i =0; i < this.selected.length; ++i)
			if( this.selected[ i] ===option)
				return true;
		
		// not selected
		return false;
	};
	
	// check if option with specified value is selected
	prototype.isValueSelected =function( value) {
		for( var i =0; i < this.selected.length; ++i)
			if( this.selected[ i].value ===value)
				return true;
		
		// not selected
		return false;
	};
	
	// select option
	prototype.selectAllOptions =function( select) {
		// select options
		this.__selectOptions( this.options, select);
		
		// update view
		this.__onUpdateView();
	};
}

// dropdown option
var DropdownOption =api.DropdownOption =function() {
};

// inherit from option
lib.extend( DropdownOption.prototype, Option.prototype);

with( DropdownOption) {

	// associated object
	prototype.object =undefined;
	
	// initialize dropdown option
	prototype.initDropdownOption =function( html, text, label, value, object) {
		// initialize option
		this.initOption( html, text, label, value);
		
		if( object !==undefined) {
			// attach object
			this.attachObject( object);
		}
	};
	
	// unload dropdown option
	prototype.unloadDropdownOption =function() {
		// detach object
		this.detachObject();
		
		// unload option
		this.unloadOption();
	};
	
	// attach object
	prototype.attachObject =function( object) {
		if( this.object !==undefined)
			// detach object if any attached
			this.detachObject();
		
		// reference object
		this.object =object;
		
		// reference current option
		var self =this;
		
		// listen for click events on object
		lib.event.bind( object, 'click', this.__clickHandler =function( e){
			// handle option click
			self.control.__handleOptionClick( self);
		});
	};
	
	// detach current object
	prototype.detachObject =function() {
		if( this.object ===undefined)
			// no object attached
			return;
		
		// remove click event listener
		lib.event.unbind( this.object, 'click', this.__clickHandler);
		
		// dereference object
		this.object =undefined;
	};
};

// option dropdown control
var DropdownOptionControl =api.DropdownOptionControl =function( object) {
	
	// reference object
	this.object =object;
	
	// load option list and initialize option control
	var options =[], selected =[];
	
	for( var i =0; i < object.childNodes.length; ++i) {
		// reference option
		var opt =object.childNodes[ i];
		
		if( opt.nodeType !=lib.NodeType.ELEMENT_NODE)
			// skip non-element nodes
			continue;
		
		// read value
		var optValue =lib.attr.get( opt, 'data-value');
		if( optValue ===undefined) {
			// value is missing
			throw new ErrorException( 'Value attribute (data-value) is missing on an option entry');
		}
		
		// read html and text content
		var optHtml =lib.html.get( opt);
		var optText =lib.html.getText( opt);
		
		// read label
		var optLabel =lib.attr.get( opt, 'data-label');
		if( optLabel ===undefined) {
			// assign label same as text
			optLabel =optText;
		}
		
		// create new option
		var option =new DropdownOption();
		
		// initialize option
		option.initDropdownOption( optHtml, optText, optLabel, optValue);
		
		// add new option entry
		options.push( option);
		
		if( lib.attr.get( opt, 'data-selected') !==undefined)
			// add selected option
			selected.push( option);
	}
	
	// wipe all inner contents of object
	lib.html.empty( object);

	// read 'multi' setting
	var multi =lib.attr.has( object, 'data-multi');
	
	// prepare inner content of the control element
	var controlInnerContent =document.createDocumentFragment();
	
	{// create title element
		var title =this.title =document.createElement( 'DIV');
		
		// set attributes on title
		lib.attr.set( title, 'class', 'title');
		
		// append
		controlInnerContent.appendChild( title);
	}
	
	{//create dropdown container object
		var dropdown =this.dropdown =document.createElement( 'DIV');
		
		// set attributes on dropdown
		lib.attr.set( dropdown, 'class', 'dropdown');
		
		{// create tools object
			var toolsContainer =dropdown.toolsContainer =document.createElement( 'DIV');
			
			// set attributes
			lib.attr.set( toolsContainer, 'class', 'tools');
			
			// temporary variable to hold tool
			var tool;
			
			if( multi) {
				// create 'select all / deselect all' tool for multi mode control
				tool =toolsContainer.selectDeselectContainer =document.createElement( 'DIV');
				
				// set attributes
				lib.attr.set( tool, 'class', 'select-deselect');
				
				// listen for click events
				lib.event.bind( tool, 'click', tool.clickHandler =function( e){
					// handle select/deselect all
					self.__handleSelectDeselect();
				});
				
				// append
				toolsContainer.appendChild( tool);
			}
			
			{// create 'close dropdown' tool
				tool =toolsContainer.closeContainer =document.createElement( 'DIV');
				
				// set attributes
				lib.attr.set( tool, 'class', 'close');
				
				// listen for click events
				lib.event.bind( tool, 'click', tool.clickHandler =function( e){
					// hide dropdown
					self.__hideDropdown();
				});
				
				// append
				toolsContainer.appendChild( tool);
			}
			
			// append
			dropdown.appendChild( toolsContainer);
		}
		
		{// create option container object
			var optionContainer =dropdown.optionContainer =document.createElement( 'DIV');
			
			// set attributes on option container object
			lib.attr.set( optionContainer, 'class', 'options');
			
			// append
			dropdown.appendChild( optionContainer);
		}
		
		// append
		controlInnerContent.appendChild( dropdown);
	}
	
	// initialize option control
	this.initOptionControl( options, multi, selected);
	
	var sort =lib.attr.get( object, 'data-sort');
	if( sort !==undefined) {
		// sort options according to requested sorting algo
		this.__sort( sort);
	}
	
	// append control content to document
	object.appendChild( controlInnerContent);
	
	// reference current object
	var self =this;
	
	// define click handler for object
	this.__objectClickHandler =function( e){
		if( e.eventPhase ==e.BUBBLING_PHASE)
			// we should open dropdown only in AT_TARGET
			//  or CAPURING_PHASE.
			return;
		
		if( !self.__isDropdownVisible())
			// show dropdown if hidden
			self.__showDropdown();
	};
	
	// bind user action handlers
	lib.event.bind( this.object, 'click', this.__objectClickHandler);
	lib.event.bind( this.object, 'click', this.__objectClickHandler, true);
	
	// define click handler that closes option control when user
	//  clicks behind control
	lib.event.bind( document, 'click', this.__documentClickHandler =function( e){
		if( lib.dom.isDescendantOf( e.target, self.object, true))
			// clicked within control
			return;
		
		if( self.__isDropdownVisible())
			self.__hideDropdown();
	});
	
	// reference control
	this.object.control =this;
	
	// read placeholder value
	var placeholder =lib.attr.get( this.object, 'data-control-placeholder');
	if( placeholder !==undefined)
		this.placeholder =placeholder;
	else
		this.placeholder =placeholder ='';
	
	// update view
	this.__onUpdateView( false);
};

// inherit from OptionControl
lib.extend( DropdownOptionControl.prototype, OptionControl.prototype);

with( DropdownOptionControl) {
	
	// associated object
	prototype.object =null;
	
	// title element
	prototype.title =undefined;
	
	// dropdown element
	prototype.dropdown =undefined;
	
	// dropdown scrolling
	prototype.optionContainerScrollLeft =0;
	prototype.optionContainerScrollTop =0;
	
	// placeholder text
	prototype.placeholder ='';
	
	// deinitialize control
	prototype.unloadDropdownOptionControl =function() {
		
		// unbind event handlers
		lib.event.unbind( this.object, 'click', this.__objectClickHandler);
		lib.event.unbind( this.object, 'click', this.__objectClickHandler, true);
		lib.event.unbind( document, 'click', this.__documentClickHandler);

		// dereference title element
		this.title =undefined;
		
		// dereference dropdown element
		this.dropdown =undefined;
		
		// dereference all objects from options and write down
		//  all options for export back to DOM
		var frag =document.createDocumentFragment();
		
		for( var i =0; i < this.options.length; ++i) {
			var opt =this.options[ i];
			var el =document.createElement( 'DIV');
			
			// set value and class
			lib.attr.set( el, 'data-value', opt.value);
			
			if( opt.isSelected())
				// mark as selected
				lib.attr.set( el, 'data-selected', 'selected');
			
			if( opt.label !==undefined)
				// set label
				lib.attr.set( el, 'data-label', opt.label);
			
			// assign html code
			lib.html.set( el, opt.html);
			
			// append to fragment
			frag.appendChild( el);
			
			// detach object
			opt.detachObject();
		}
		
		// wipe all contents
		lib.html.empty( this.object);
		
		// write options
		this.object.appendChild( frag);
		
		// dereference object
		this.object =undefined;
		
		// unload option control
		this.unloadOptionControl();
	};
	
	// triggered when option is added to control
	prototype.__onOptionAdded =function( option, afterOption) {
		// create option list item element
		var elem =document.createElement( 'DIV');
		
		// assign option's html
		lib.html.set( elem, option.html);
		
		// assign value and class name
		lib.attr.set( elem, {
			'class': 'option',
			'data-value': option.value
		});
		
		if( option.isSelected())
			// mark option as selected
			lib.attr.set( elem, 'data-selected', 'selected');
		
		// attach list item to option
		option.attachObject( elem);
		
		if( afterOption !==undefined) {
			// insert after target option
			this.dropdown.optionContainer.insertBefore( elem, afterOption.object.nextSibling);
			
		} else {
			// insert in the beginning
			this.dropdown.optionContainer.insertBefore( elem, this.dropdown.optionContainer.firstChild);
		}
	};
	
	// triggered when option is removed from control
	prototype.__onOptionRemoved =function( option) {
		// get attached object
		var obj =option.object;
		
		// detach object from element
		option.unloadDropdownOption();
		
		// remove object from DOM
		obj.parentNode.removeChild( obj);
	};
	
	// triggered when option is being selected
	prototype.__onOptionSelected =function( option) {
		lib.attr.set( option.object, 'data-selected', 'selected');
	};
	
	// triggered when option is being deselected
	prototype.__onOptionDeselected =function( option) {
		lib.attr.remove( option.object, 'data-selected');
	};
	
	// triggered when option ordering is being changed
	prototype.__onOptionOrderingChanged =function() {
		// previous option
		var prevOpt =undefined;
		
		// iterate all options
		for( var i =0; i < this.options.length; ++i) {
			// reference option
			var opt =this.options[ i];
			
			if( prevOpt ===undefined) {
				// this option should be first
				this.dropdown.optionContainer.insertBefore( opt.object, this.dropdown.optionContainer.firstChild);
				
			} else {
				// this option follows previous option
				this.dropdown.optionContainer.insertBefore( opt.object, prevOpt.object.nextSibling);
			}
			
			// remember previous option
			prevOpt =opt;
		}
	};
	
	// update view basing on selection of options
	prototype.__onUpdateView =function( triggerChange) {
		// default args
		if( triggerChange ===undefined)
			triggerChange =true;
		
		// html code to assign to title
		var html ='';
		
		if( this.selected.length ==0) {
			// show placeholder
			html =this.placeholder;
			
			// put title in placeholder mode
			lib.attr.addClass( this.title, 'placeholder');
			
		} else {
			// build selected option list
			for( var i =0; i < this.selected.length; ++i) {
				var opt =this.selected[ i];
				
				html +=(opt.label !==undefined ? opt.label : opt.html) +', ';
			}
			
			// remove last comma
			html =html.substr( 0, html.length -2);
			
			// remove from placeholder mode if previously was in it
			lib.attr.removeClass( this.title, 'placeholder');
		}
		
		// assign title's html
		lib.html.set( this.title, html);
		
		if( this.multi) {
			if( this.allOptionsSelected()) {
				// if all options selected in multi mode, add additional
				//  attribute on control, that will indicate that
				//  all options are selected.
				lib.attr.set( this.object, 'data-all-selected', 'selected');
				
			} else {
				// remove 'all selected' attribute
				lib.attr.remove( this.object, 'data-all-selected');
			}
		}
		
		// assign title text for title (alt text)
		lib.attr.set( this.title, 'title', lib.html.getText( this.title));
		
		if( triggerChange)
			// trigger change event
			lib.event.trigger( this.object, 'change');
	};
	
	// check if dropdown is currently visible
	prototype.__isDropdownVisible =function() {
		return lib.css.visible( this.dropdown);
	};
	
	// show dropdown
	prototype.__showDropdown =function() {
		
		// reference self
		var self =this;
		
		// remove any styling available on dropdown
		lib.css.clearStyle( this.dropdown);
		
		// vaporize
		lib.css.vaporize( this.dropdown);
		
		// set dropdown width to auto so that browser computes widths
		lib.css.style( this.dropdown, 'width', 'auto');

		// read position
		var position =lib.css.style( this.dropdown, 'position');
		
		// read metrics
		var height =this.dropdown.scrollHeight;
		
		if( position =='absolute') {
			// compute offset into view
			var offsetForView =lib.css.computeOffsetIntoView( this.dropdown, 'left', 'top');
			
			// get available spare space
			var avail =offsetForView.availSpace;
			
			// compute how much space did dropdown overflow by y
			var resizeHeight =avail.top +avail.bottom;
			
			if( resizeHeight < 0) {
				// shrink dropdown
				height +=resizeHeight;
				
				lib.css.style( this.dropdown, 'height', height +'px');
			}
			
			// assign offset
			lib.css.offset( this.dropdown, offsetForView.offset);
		}
		
		// compute scrollbar width
		var scrollbarWidth =this.dropdown.optionContainer.offsetWidth -this.dropdown.optionContainer.clientWidth;
		
		// compute planned width and height
		var width =Math.max( this.dropdown.optionContainer.scrollWidth, this.dropdown.optionContainer.offsetWidth) +scrollbarWidth;
		
		// get control and dropdown sizing
		var controlSizing =lib.css.sizing( this.object);
		
		if( controlSizing.width > width)
			// make sure width is not less than width of control
			width =controlSizing.width;
		
		// widen dropdown
		lib.css.style( this.dropdown, 'width', width +'px');
		
		// restore element
		lib.css.restore( this.dropdown);

		// trigger focus event
		var e =lib.event.trigger( this.object, 'control-activate', {
			'restoreScrolling': function() { self.__restoreScrolling(); }
		});
		
		// mark as activated
		lib.attr.set( this.object, 'data-activated', 'activated');
		
		// read position
		var position =lib.css.style( this.dropdown, 'position');
		
		if( !e.isDefaultPrevented()) {
			// show dropdown
			lib.css.show( this.dropdown);
			
			// restore scrolling
			this.__restoreScrolling();
		}
		
		if(( position =='absolute' || position =='relative') && lib.bugs.zIndexAutoUnsupported()) {
			// fix z-index
			lib.css.style( this.dropdown, 'zIndex', lib.css.style( this.object, 'zIndex') +1);
		}
	};
	
	// hide dropdown
	prototype.__hideDropdown =function() {
		// get current scrolling offsets
		this.optionContainerScrollTop =this.dropdown.optionContainer.scrollTop;
		this.optionContainerScrollLeft =this.dropdown.optionContainer.scrollLeft;

		// remove activated flag
		lib.attr.remove( this.object, 'data-activated');
		
		// trigger blur event
		var e =lib.event.trigger( this.object, 'control-deactivate');
		
		if( !e.isDefaultPrevented()) {
			// hide dropdown
			lib.css.hide( this.dropdown);
		}
	};
	
	// toggle dropdown
	prototype.__toggleDropdown =function( close) {
		if( this.__isDropdownVisible())
			this.__hideDropdown();
		else
			this.__showDropdown();
	};
	
	// handle select/deselect event
	prototype.__handleSelectDeselect =function() {
		if( this.allOptionsSelected())
			this.__deselectAllOptions();
		else
			this.__selectAllOptions();
		
		// update view
		this.__onUpdateView();
	};
	
	// option click handler
	prototype.__handleOptionClick =function( opt) {

		if( this.multi) {
			// select or deselect option if in multi mode
			if( opt.isSelected())
				this.__selectOptions([ opt], false);
			else
				this.__selectOptions([ opt]);
			
		} else {
			// deselect all options
			this.__deselectAllOptions();
			
			// select target option
			this.__selectOptions([ opt]);
			
			// hide dropdown
			this.__hideDropdown();
		}
		
		// update view
		this.__onUpdateView();
	};
	
	// restore scrolling
	prototype.__restoreScrolling =function() {
		// set scrolling offsets
		this.dropdown.optionContainer.scrollTop =this.optionContainerScrollTop;
		this.dropdown.optionContainer.scrollLeft =this.optionContainerScrollLeft;
	};
}

// initialize control
api.initControl =function( object) {
	if( object.control !==undefined)
		// already initialized
		throw 'Unable to initialize already initialized control';
	
	// get type of control
	var type =lib.attr.get( object, 'data-control');
	
	switch( type) {
		case 'dropdown':
			return object.control =new DropdownOptionControl( object);
		break;
		case 'string':
			return object.control =new StringControl( object);
		break;
		case 'checkbox':
			return object.control =new CheckboxControl( object);
		break;
		default:
			throw 'Could not determine control type or specified control type is not supported';
		break;
	}
};

// deinitialize control
api.unloadControl =function( object) {
	if( object.control ===undefined)
		// already unloaded
		return;
	
	// reference control object
	var control =object.control;
	
	if( control instanceof DropdownOptionControl) {
		control.unloadDropdownOptionControl();
		
	} else if( control instanceof StringControl) {
		control.unloadStringControl();
		
	} else if( control instanceof CheckboxControl) {
		control.unloadCheckboxControl();
	}
	
	// remove control reference from object
	if( lib.bugs.propertyDeletionThrowsException())
		object.control =undefined;
	else
		delete object.control;
};
	
})( EVOLIB_EXPORT, 'controls');
