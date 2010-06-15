
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
var Map =lib.Map;

// checkbox control
var CheckboxControl =api.CheckboxControl =function( object) {
	// reference current object
	var self =this;
	
	// initialize control
	this.initBoolControl( lib.attr.has( object, 'data-required'), lib.attr.has( object, 'data-checked'));
	
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

// reference prototype
var p =CheckboxControl.prototype;

// inherit from BoolControl
lib.extend( p, api.BoolControl.prototype);

// (read-only) associated object
p.object =null;

// (read-only) value
p.value =null;

// control unloading method
p.unloadCheckboxControl =function() {
	// unbind event handler
	lib.event.unbind( this.object, 'click', this.__clickHandler);
	
	// dereference object
	this.object =undefined;
	
	// unload boolean control
	this.unloadBoolControl();
};

// triggered when control is being checked
p.__onChecked =function() {
	lib.attr.set( this.object, 'data-checked', 'checked');
};

// triggered when control is being unchecked
p.__onUnchecked =function() {
	lib.attr.remove( this.object, 'data-checked');
};

// triggered when internal changes were made and
//  view must now be updated.
p.__onUpdateView =function( triggerChange) {
	// default args
	if( triggerChange ===undefined)
		triggerChange =true;
	
	// do nothing, since UI is being accordingly changed via
	//  CSS attribute selectors ([data-checked])
	
	if( triggerChange)
		// fire change event on an element
		lib.event.trigger( this.object, 'change');
};

})( EVOLIB_EXPORT, 'controls');
