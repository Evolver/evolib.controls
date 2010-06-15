
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
var Map =lib.Map;
var DropdownOption =api.DropdownOption;

// Option dropdown control.
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
	this.initOptionControl( lib.attr.has( object, 'data-required'), options, multi, selected);
	
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
	var placeholder =lib.attr.get( this.object, 'data-placeholder');
	if( placeholder !==undefined)
		this.placeholder =placeholder;
	else
		this.placeholder =placeholder ='';
	
	// update view
	this.__onUpdateView( false);
};

// reference prototype
var p =DropdownOptionControl.prototype;

// inherit from OptionControl
lib.extend( p, api.OptionControl.prototype);

// (read-only) associated object
p.object =null;

// (read-only) title element
p.title =undefined;

// (read-only) dropdown element
p.dropdown =undefined;

// (read-only) dropdown scrolling
p.optionContainerScrollLeft =0;
p.optionContainerScrollTop =0;

// (read-only) placeholder text
p.placeholder ='';

// deinitialize control
p.unloadDropdownOptionControl =function() {
	
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
p.__onOptionAdded =function( option, afterOption) {
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
p.__onOptionRemoved =function( option) {
	// get attached object
	var obj =option.object;
	
	// detach object from element
	option.unloadDropdownOption();
	
	// remove object from DOM
	obj.parentNode.removeChild( obj);
};

// triggered when option is being selected
p.__onOptionSelected =function( option) {
	lib.attr.set( option.object, 'data-selected', 'selected');
};

// triggered when option is being deselected
p.__onOptionDeselected =function( option) {
	lib.attr.remove( option.object, 'data-selected');
};

// triggered when option ordering is being changed
p.__onOptionOrderingChanged =function() {
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
p.__onUpdateView =function( triggerChange) {
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
p.__isDropdownVisible =function() {
	return lib.css.visible( this.dropdown);
};

// show dropdown
p.__showDropdown =function() {
	
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
p.__hideDropdown =function() {
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
p.__toggleDropdown =function( close) {
	if( this.__isDropdownVisible())
		this.__hideDropdown();
	else
		this.__showDropdown();
};

// handle select/deselect event
p.__handleSelectDeselect =function() {
	if( this.allOptionsSelected())
		this.__deselectAllOptions();
	else
		this.__selectAllOptions();
	
	// update view
	this.__onUpdateView();
};

// option click handler
p.__handleOptionClick =function( opt) {

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
p.__restoreScrolling =function() {
	// set scrolling offsets
	this.dropdown.optionContainer.scrollTop =this.optionContainerScrollTop;
	this.dropdown.optionContainer.scrollLeft =this.optionContainerScrollLeft;
};

})( EVOLIB_EXPORT, 'controls');
