
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;
var OverlayOption =api.OverlayOption;
var OverlayAlphabet =api.OverlayAlphabet;

// phrase namespace
var phraseNamespace ='OverlayOptionControl';

// get phrase
function GetPhrase( name, args) {
	return api.getPhrase( phraseNamespace, name, args);
};

// Option overlay control.
var OverlayOptionControl =api.OverlayOptionControl =function( object) {

	// reference object
	this.object =object;
	
	// initialize alphabet letter controller
	this.letters =new OverlayAlphabet( this);
	
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
			throw 'Value attribute (data-value) is missing on an option entry';
		}
		
		// read html and text content
		var optHtml =lib.html.get( opt);
		var optText =(lib.attr.has( opt, 'data-text') ? lib.attr.get( opt, 'data-text') : lib.html.getText( opt));
		
		// read label
		var optLabel =lib.attr.get( opt, 'data-label');
		if( optLabel ===undefined) {
			// assign label same as text
			optLabel =optText;
		}
		
		// create new option
		var option =new OverlayOption();
		
		// initialize option
		option.initOverlayOption( optHtml, optText, optLabel, optValue);
		
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
	
	// read placeholder value
	var placeholder =lib.attr.get( this.object, 'data-placeholder');
	if( placeholder !==undefined)
		this.placeholder =placeholder;
	else
		this.placeholder =placeholder ='';
	
	// read heading value
	var heading =lib.attr.get( this.object, 'data-heading');
	if( heading !==undefined)
		this.heading =heading;
	else
		this.heading =heading ='';
	
	// reference current object
	var self =this;
	
	// prepare inner content of the control element
	var controlInnerContent =document.createDocumentFragment();
	
	{// create title element
		var title =this.title =document.createElement( 'DIV');
		
		// set attributes on title
		lib.attr.set( title, 'class', 'title');
		
		// append
		controlInnerContent.appendChild( title);
	}
	
	{// create overlay container object
		var overlay =this.overlay =document.createElement( 'DIV');
		
		// set according attributes
		lib.attr.set( overlay, 'class', 'overlay');
		
		{// create heading
			var heading =overlay.headingContainer =document.createElement( 'DIV');
			
			// set according attributes
			lib.attr.set( heading, {
				'class': 'heading',
				'title': this.heading
			});
			lib.html.set( heading, this.heading);
			
			// append
			overlay.appendChild( heading);
		}
		
		{// create alphabet container
			var alphabet =overlay.alphabetContainer =document.createElement( 'DIV');
			
			// set according attributes
			lib.attr.set( alphabet, 'class', 'alphabet');
			
			{// create letter container
				var letters =alphabet.letterContainer =document.createElement( 'DIV');
				
				// set according attributes
				lib.attr.set( letters, 'class', 'letters');
				
				// append
				alphabet.appendChild( letters);
			}
			
			{// create tool container
				var tools =alphabet.toolContainer =document.createElement( 'DIV');
				
				// set according attributes
				lib.attr.set( tools, 'class', 'tools');
				
				// create all tools
				var tool;
				
				{// create 'show all' tool
					tool =tools.showAllContainer =document.createElement( 'A');
					lib.attr.addClass( tool, 'all');
					lib.html.set( tool, GetPhrase( 'showAll'));
					
					lib.event.bind( tool, 'click', tool.__clickHandler =function(){
						self.letters.filter();
					});
					
					// append
					tools.appendChild( tool);
				}
				
				// append
				alphabet.appendChild( tools);
			}
			
			// append
			overlay.appendChild( alphabet);
		}
		
		{// create option container
			var optionContainer =overlay.optionContainer =document.createElement( 'DIV');
			
			// set according attrs
			lib.attr.set( optionContainer, 'class', 'options');
			
			// append
			overlay.appendChild( optionContainer);
		}
		
		{// create tool container
			var tools =overlay.toolContainer =document.createElement( 'DIV');
			
			// set according attrs
			lib.attr.set( tools, 'class', 'tools');
			
			// create tools
			var tool;
			
			if( multi) {
				{// create 'select-all' tool
					tool =tools.selectAllContainer =document.createElement( 'A');
					lib.attr.addClass( tool, 'check-all');
					lib.html.set( tool, GetPhrase( 'checkAll'));
					
					lib.event.bind( tool, 'click', tool.__clickHandler =function(){
						// select all options
						self.__handleSelectAll();
					});
					
					// append
					tools.appendChild( tool);
				}
				
				{// create 'deselect-all' tool
					tool =tools.deselectAllContainer =document.createElement( 'A');
					lib.attr.addClass( tool, 'uncheck-all');
					lib.html.set( tool, GetPhrase( 'uncheckAll'));
					
					lib.event.bind( tool, 'click', tool.__clickHandler =function(){
						// select all options
						self.__handleDeselectAll();
					});
					
					// append
					tools.appendChild( tool);
				}
			}
			
			{// create 'close' tool
				tool =tools.closeContainer =document.createElement( 'A');
				lib.attr.addClass( tool, 'close');
				lib.html.set( tool, GetPhrase( 'close'));
				
				lib.event.bind( tool, 'click', tool.__clickHandler =function(){
					// close overlay
					self.__hideOverlay();
				});
				
				// append
				tools.appendChild( tool);
			}
			
			// append
			overlay.appendChild( tools);
		}
		
		// append
		controlInnerContent.appendChild( overlay);
	}
	
	// initialize option control. We initialize option control now because initialization
	//  requires controlInnerContent data to be present within object.
	this.initOptionControl( lib.attr.has( object, 'data-required'), options, multi, selected);
	
	var sort =lib.attr.get( object, 'data-sort');
	if( sort !==undefined) {
		// sort options according to requested sorting algo
		this.__sort( sort);
	}
	
	// create inner structure of control within object element
	object.appendChild( controlInnerContent);
	
	// define click handler for object
	this.__objectClickHandler =function( e){
		if( e.eventPhase ==e.BUBBLING_PHASE)
			// we should open dropdown only in AT_TARGET
			//  or CAPURING_PHASE.
			return;
		
		if( !self.__isOverlayVisible())
			// show if hidden
			self.__showOverlay();
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
		
		if( self.__isOverlayVisible())
			self.__hideOverlay();
		
	}, true);
	
	// reference control
	this.object.control =this;
	
	// show all options
	this.letters.filter();

	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView( false);
};

// reference prototype
var p =OverlayOptionControl.prototype;

// inherit from OptionControl
lib.extend( p, api.OptionControl.prototype);

// (read-only) associated object
p.object =null;

// (read-only) title element
p.title =undefined;

//(read-only) overlay element
p.overlay =undefined;

// (read-only) overlay's heading text
p.heading ='';

// (read-only) placeholder text
p.placeholder ='';

// (read-only) alphabet letter registry
p.letters =undefined;

// deinitialize control
p.unloadOverlayOptionControl =function() {
	
	// unbind event handlers
	lib.event.unbind( this.object, 'click', this.__objectClickHandler);
	lib.event.unbind( this.object, 'click', this.__objectClickHandler, true);
	lib.event.unbind( document, 'click', this.__documentClickHandler, true);
	
	if( this.multi) {
		lib.event.unbind( this.overlay.toolContainer.selectAllContainer, 'click', this.overlay.toolContainer.selectAllContainer.__clickHandler);
		lib.event.unbind( this.overlay.toolContainer.deselectAllContainer, 'click', this.overlay.toolContainer.deselectAllContainer.__clickHandler);
	}
	
	lib.event.unbind( this.overlay.toolContainer.closeContainer, 'click', this.overlay.toolContainer.closeContainer.__clickHandler);
	lib.event.unbind( this.overlay.alphabetContainer.toolContainer.showAllContainer, 'click', this.overlay.alphabetContainer.toolContainer.showAllContainer.__clickHandler);
	
	// remove internal attributes
	lib.attr.remove( this.object, ['data-invalid','data-activated']);

	// dereference title element
	this.title =undefined;
	
	// dereference overlay element
	this.overlay =undefined;
	
	// dereference all objects from options and write down
	//  all options for export back to DOM
	var frag =document.createDocumentFragment();
	
	for( var i =0; i < this.options.length; ++i) {
		var opt =this.options[ i];
		var el =document.createElement( 'DIV');
		
		// set common attrs
		lib.attr.set( el, {
			'data-value': opt.value,
			'data-text': opt.text
		});
		
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

// control focusing method
p.focus =function() {
	// scroll object into view
	this.object.scrollIntoView();
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
		'data-value': option.value,
		'title': option.text
	});
	
	if( option.isSelected())
		// mark option as selected
		lib.attr.set( elem, 'data-selected', 'selected');
	
	// attach list item to option
	option.attachObject( elem);
	
	if( afterOption !==undefined) {
		// insert after target option
		this.overlay.optionContainer.insertBefore( elem, afterOption.object.nextSibling);
		
	} else {
		// insert in the beginning
		this.overlay.optionContainer.insertBefore( elem, this.overlay.optionContainer.firstChild);
	}
	
	// register option within alphabet
	this.letters.addOption( option);
};

// triggered when option is removed from control
p.__onOptionRemoved =function( option) {
	// unregister option from alphabet
	this.letters.removeOption( option);
	
	// get attached object
	var obj =option.object;
	
	// detach object from element
	option.unloadOverlayOption();
	
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
			this.overlay.optionContainer.insertBefore( opt.object, this.overlay.optionContainer.firstChild);
			
		} else {
			// this option follows previous option
			this.overlay.optionContainer.insertBefore( opt.object, prevOpt.object.nextSibling);
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
	
	if( !this.valid)
		// control's input is not valid
		lib.attr.set( this.object, 'data-invalid', 'invalid');
	else
		// control's input is valid
		lib.attr.remove( this.object, 'data-invalid');
	
	if( triggerChange)
		// trigger change event
		lib.event.trigger( this.object, 'change');
};

// check if overlay is currently visible
p.__isOverlayVisible =function() {
	return lib.attr.has( this.object, 'data-activated');
};

// show overlay
p.__showOverlay =function() {
	
	// trigger focus event
	var e =lib.event.trigger( this.object, 'control-activate');
	
	if( !e.isDefaultPrevented()) {
		// mark as activated
		lib.attr.set( this.object, 'data-activated', 'activated');
	}
};

// hide overlay
p.__hideOverlay =function() {
	// trigger blur event
	var e =lib.event.trigger( this.object, 'control-deactivate');
	
	if( !e.isDefaultPrevented()) {
		// remove activated flag
		lib.attr.remove( this.object, 'data-activated');
	}
};

// toggle overlay
p.__toggleOverlay =function( close) {
	if( this.__isOverlayVisible())
		this.__hideOverlay();
	else
		this.__showOverlay();
};

// handle 'select all' event
p.__handleSelectAll =function() {
	// select all options
	this.__selectAllOptions();
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// handle 'deselect all' event
p.__handleDeselectAll =function() {
	// deselect all options
	this.__deselectAllOptions();
	
	// validate
	this.__validate();
	
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
		
		// hide overlay
		this.__hideOverlay();
	}
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

})( EVOLIB_EXPORT, 'controls');
