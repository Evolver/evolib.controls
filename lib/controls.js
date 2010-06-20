
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// Initialize any control
api.initControl =function( object) {
	
	if( object.control !==undefined)
		// already initialized
		throw 'Control already initialized';
	
	// get type of control
	var type =lib.attr.get( object, 'data-control');
	
	switch( type) {
		case 'dropdown':
			return object.control =new api.DropdownOptionControl( object);
		break;
		case 'string':
			return object.control =new api.StringControl( object);
		break;
		case 'checkbox':
			return object.control =new api.CheckboxControl( object);
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
	
	if( control instanceof api.DropdownOptionControl) {
		// unload dropdown option control
		control.unloadDropdownOptionControl();
		
	} else if( control instanceof api.StringControl) {
		// unload string control
		control.unloadStringControl();
		
	} else if( control instanceof api.CheckboxControl) {
		// unload checkbox control
		control.unloadCheckboxControl();
	}
	
	// remove control reference from object
	if( lib.bugs.propertyDeletionThrowsException())
		object.control =undefined;
	else
		delete object.control;
};
	
})( EVOLIB_EXPORT, 'controls');
