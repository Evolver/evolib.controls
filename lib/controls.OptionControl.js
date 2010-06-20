
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// Option control abstraction. Option control may have multiple values selected
//  or single value selected.
var OptionControl =api.OptionControl =function() {
};

// reference prototype
var p =OptionControl.prototype;

// inherit from Control
lib.extend( p, api.Control.prototype);

// (read-only) assign type
p.type =p.OPTION;

// (read-only) list of options
p.options =undefined;

// (read-only) list of selected options
p.selected =undefined;

// (read-only) list of default selected options
p.defaultSelected =undefined;

// (read-only) multiple option selection allowed?
p.multi =false;

// initialize option control
p.initOptionControl =function( required, options, multi, selected) {
	// initialize control
	this.initControl( required);
	
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
	
	// store default selected options
	this.defaultSelected =lib.clone( this.selected, false);
};

// unload option control
p.unloadOptionControl =function() {
	// unload control
	this.unloadControl();
};

// triggered when option is added to control
p.__onOptionAdded =function( option, afterOption) {
	throw 'Override this';
};

// triggered when option is removed from control
p.__onOptionRemoved =function( option) {
	throw 'Override this';
};

// triggered when option is being selected
p.__onOptionSelected =function( option) {
	throw 'Override this';
};

// triggered when option is being deselected
p.__onOptionDeselected =function( option) {
	throw 'Override this';
};

// triggered when option ordering is being changed
p.__onOptionOrderingChanged =function() {
	throw 'Override this';
};

// select all options
p.__selectAllOptions =function() {
	this.__selectOptions( this.options);
};

// deselect all options
p.__deselectAllOptions =function() {
	this.__selectOptions( this.selected, false);
};

// select option
p.__selectOptions =function( options, select) {
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
p.__sort =function( algo, triggerOrderingChange) {
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
p.__sortAsc =function( a, b) {
	return a.text > b.text ? 1 : -1;
};

// perform descending string sort
p.__sortDesc =function( a, b) {
	return a.text < b.text ? 1 : -1;
};

// perform ascending number sort
p.__sortAscNumeric =function( a, b) {
	return parseInt( a.text) > parseInt( b.text) ? 1 : -1;
};

// perform descending number sort
p.__sortDescNumeric =function( a, b) {
	return parseInt( a.text) < parseInt( b.text) ? 1 : -1;
};

// check if option is added
p.__isOptionAdded =function( option) {
	for( var i =0; i < this.options.length; ++i)
		if( this.options[ i] ===option)
			// option found
			return true;
	
	// option not found
	return false;
};

// add multiple options
p.__addOptions =function( options, afterOption) {
	
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
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// remove target options
p.__removeOptions =function( options) {
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

// triggered when control validation must be performed
p.__validate =function() {
	if( this.required && this.selected.length ==0)
		// input is invalid
		return this.valid =false;
	
	// input is valid
	return this.valid =true;
};

// sort options using specified ordering algorithm
p.sort =function( algo) {
	this.__sort( algo);
};

// add option to the option list
p.addOption =function( option, afterOption) {
	// add option
	this.__addOptions( [option], afterOption);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// add multiple options to the option list
p.addOptions =function( options, afterOption) {
	// add options
	this.__addOptions( options, afterOption);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// remove option from option list
p.removeOption =function( option) {
	// remove single option
	var removed =this.__removeOptions( [option]) >0;
	
	if( removed) {
			// validate
			this.__validate();
		
			// update view
			this.__onUpdateView();
	}
			
	// option was not found
	return removed;
};

// remove multiple options from option list
p.removeOptions =function( options) {
	// remove options
	var removedOptionCount =this.__removeOptions( options);
	
	if( removedOptionCount >0) {
			// validate
			this.__validate();
			
			// update view
			this.__onUpdateView();
	}
			
	// return amount of options removed
	return removedOptionCount;
};

// check if all options are selected
p.allOptionsSelected =function() {
	return this.options.length ==this.selected.length;
};

// select option or options
//  selectOption( value)
//  selectOption([ value1, value2, ...]);
p.selectOption =function( value, select) {
	if( !this.multi && lib.isArray( value) && value.length >1)
		throw 'Unable to select multiple options in single-value dropdown';
	
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
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// get first selected option
p.getSelectedOption =function() {
	if( this.selected.length ==0)
		return undefined;
	else
		return this.selected[ 0];
};

// get list of selected options
p.getSelectedOptions =function() {
	return this.selected;
};

// check if option is selected
p.isOptionSelected =function( option) {
	for( var i =0; i < this.selected.length; ++i)
		if( this.selected[ i] ===option)
			return true;
	
	// not selected
	return false;
};

// check if option with specified value is selected
p.isValueSelected =function( value) {
	for( var i =0; i < this.selected.length; ++i)
		if( this.selected[ i].value ===value)
			return true;
	
	// not selected
	return false;
};

// select option
p.selectAllOptions =function( select) {
	// select options
	this.__selectOptions( this.options, select);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// reset control
p.reset =function() {
	// deselect all options
	this.__selectOptions( this.options, false);
	
	// select default options
	this.__selectOptions( this.defaultSelected, true);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

})( EVOLIB_EXPORT, 'controls');
