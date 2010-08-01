
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// function to get phrase
api.getPhrase =function( subNamespace, name, args) {
	// get phrase
	var phrase =lib.lang.get( namespace +'.' +subNamespace, lib.config.lang, name);
	
	if( args !==undefined)
		// replace args
		phrase =lib.sprintfArg( phrase, args);
	
	// return phrase
	return phrase;
};

// Initialize any control
api.initControl =function( object) {
	
	if( object.control !==undefined)
		// already initialized
		throw 'Control already initialized';
	
	// get type of control
	var type =lib.attr.get( object, 'data-control');
	
	switch( type) {
		case 'option-overlay':
			return object.control =new api.OverlayOptionControl( object);
		break;
		case 'option-dropdown':
			return object.control =new api.DropdownOptionControl( object);
		break;
		case 'string':
			return object.control =new api.StringControl( object);
		break;
		case 'checkbox':
			return object.control =new api.CheckboxControl( object);
		break;
		case 'map-google':
			return object.control =new api.GoogleMapControl( object);
		break;
		default:
			throw 'Could not determine control type or specified control type is not supported';
		break;
	}
};

// Deinitialize control
api.unloadControl =function( object) {
	
	if( object.control ===undefined)
		// already unloaded
		return;
	
	// reference control object
	var control =object.control;
	
	if( control instanceof api.OverlayOptionControl) {
		// unload overlay option control
		control.unloadOverlayOptionControl();
		
	} else if( control instanceof api.DropdownOptionControl) {
		// unload dropdown option control
		control.unloadDropdownOptionControl();
		
	} else if( control instanceof api.StringControl) {
		// unload string control
		control.unloadStringControl();
		
	} else if( control instanceof api.CheckboxControl) {
		// unload checkbox control
		control.unloadCheckboxControl();
		
	} else if( control instanceof api.GoogleMapControl) {
		// unload google map control
		control.unloadGoogleMapControl();
	}
	
	// remove control reference from object
	if( lib.bugs.propertyDeletionThrowsException())
		object.control =undefined;
	else
		delete object.control;
};
	
})( EVOLIB_EXPORT, 'controls');
