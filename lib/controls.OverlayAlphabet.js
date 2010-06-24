
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

var OverlayAlphabet =api.OverlayAlphabet =function( control) {
	// assign control object
	this.control =control;
	
	// initialize letter map
	this.letters =new Map();
	
	// initialize visible option list
	this.visibleOptions =[];
};

// reference alphabet's prototype
var p =OverlayAlphabet.prototype;

// (read-only) control object
p.control =undefined;

// (read-only) options indexed by first letter
p.letters =undefined;

// (read-only) list of visible options
p.visibleOptions =undefined;

// active filtering entry
p.activeEntry =undefined;

// get option's first letter
p.getOptionLetter =function( option) {
	return option.text.substring( 0, 1).toUpperCase();
};

// add option to index
p.addOption =function( option) {
	// reference current object
	var self =this;
	
	// get option's first letter
	var letter =this.getOptionLetter( option);
	
	if( !this.letters.has( letter)) {
		// create new letter entry
		var object =document.createElement( 'A');
		var entry ={
			'object': object,
			'options': [ option]
		};
		
		// configure object
		lib.event.bind( object, 'click', object.__clickHandler =function(){
			self.filter( letter);
		});
		lib.html.set( object, letter);
		lib.attr.set( object, {
			'title': letter,
			'class': 'letter'
		});
		
		// find out after which object in the alphabet current object
		//  must be inserted (maintain letter ordering).
		var beforeLetter =null;
		
		// iterate all letters
		this.letters.iterate( function( l, info){
			if( l < letter)
				return;

			// insert after target letter
			self.control.overlay.alphabetContainer.letterContainer.insertBefore( object, info.object);
			
			// mark as inserted after specific letter
			beforeLetter =l;
			
			// do not continue iteration
			return false;
			
		});
		
		if( beforeLetter ===null) {
			// insert object at the end of alphabet
			this.control.overlay.alphabetContainer.letterContainer.appendChild( object);
		}
		
		// add letter entry
		this.letters.set( letter, entry);
		
		if( beforeLetter !==null) {
			// move after target letter
			this.letters.moveBefore( letter, beforeLetter);
		}
		
	} else {
		// append option to letter registry
		this.letters.get( letter).options.push( option);
	}
};

// remove option from index
p.removeOption =function( option) {
	// get option's first letter
	var letter =this.getOptionLetter( option);
	
	// get letter entry
	var entry =this.letters.get( letter);
	
	// remove option from within option list
	for( var i =0; i < entry.options.length; ++i) {
		if( entry.options[ i] ===option) {
			// remove option object from letter registry
			entry.options.splice( i, 1);
			break;
		}
	}
	
	if( entry.options.length ==0) {
		// no more options are associated with target letter,
		//  remove letter entry.
		lib.event.unbind( entry.object, 'click', entry.object.__clickHandler);
		
		// remove from DOM
		entry.object.parentNode.removeChild( entry.object);
		
		// remove entry
		this.letters.remove( letter);
	}
};

// filter options according to specified letter
p.filter =function( letter) {
	
	if( this.activeEntry !==undefined) {
		// remove 'selected' attribute from active filtering entry
		lib.attr.remove( this.activeEntry.object, 'data-selected');
	}
	
	for( var i =0; i < this.visibleOptions.length; ++i) {
		// hide currently visible options
		lib.attr.remove( this.visibleOptions[ i].object, 'data-visible');
	}
	
	if( letter ===undefined || !this.letters.has( letter)) {
		// show all options
		var options =this.control.options;
		
		// reset active entry
		this.activeEntry =undefined;
		
	} else {
		// set active entry
		var activeEntry =this.activeEntry =this.letters.get( letter);
		
		// set 'selected' attribute
		lib.attr.set( activeEntry.object, 'data-selected', 'selected');
		
		// show specific options
		var options =activeEntry.options;
	}
	
	for( var i =0; i < options.length; ++i) {
		var opt =options[ i];
		
		// make option visible
		lib.attr.set( opt.object, 'data-visible', 'visible');
		
		// add option to visible option list
		this.visibleOptions.push( opt);
	}
};

})( EVOLIB_EXPORT, 'controls');
