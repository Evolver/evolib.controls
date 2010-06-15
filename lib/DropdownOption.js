
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.ErrorException;
var Map =lib.Map;

// Dropdown option.
var DropdownOption =api.DropdownOption =function() {
};

// reference prototype
var p =DropdownOption.prototype;

// inherit from option
lib.extend( p, api.Option.prototype);

// (read-only) associated object
p.object =undefined;

// initialize dropdown option
p.initDropdownOption =function( html, text, label, value, object) {
	// initialize option
	this.initOption( html, text, label, value);
	
	if( object !==undefined) {
		// attach object
		this.attachObject( object);
	}
};

// unload dropdown option
p.unloadDropdownOption =function() {
	// detach object
	this.detachObject();
	
	// unload option
	this.unloadOption();
};

// attach object
p.attachObject =function( object) {
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
p.detachObject =function() {
	if( this.object ===undefined)
		// no object attached
		return;
	
	// remove click event listener
	lib.event.unbind( this.object, 'click', this.__clickHandler);
	
	// dereference object
	this.object =undefined;
};

})( EVOLIB_EXPORT, 'controls');
