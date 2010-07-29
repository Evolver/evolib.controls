
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;
var MapControl =api.MapControl;
var GoogleMapPoint =api.GoogleMapPoint;

// cache result of Google Maps API presence
var googleMapsAPIPresent =undefined;

// check google maps API presence
function IsGoogleMapsAPIPresent() {
	if( googleMapsAPIPresent !==undefined)
		return googleMapsAPIPresent;
	
	// check presence
	if( googleMapsAPIPresent =(google !==undefined && google.maps !==undefined)) {
		// API is present, patch API
		PatchGoogleMapsAPI();
	}
	
	// return result
	return googleMapsAPIPresent;
}

// Applies patch to an event system being used by google maps internally.
// This patch makes google maps compatible with evolib's event system.
function PatchGoogleMapsAPI() {
	// store original instance of addDomListener function
	var originalAddDomListener =google.maps.event.addDomListener;
	
	// patch addDomListener to be compatible with evolib's event system.
	google.maps.event.addDomListener =function( instance, eventName, handler) {

		if( instance.__evolibPatched || (!instance.addEventListener && !instance.attachEvent))
			// pass control to Google Maps API
			return originalAddDomListener( instance, eventName, handler);
	
		// mark element as patched
		instance.__evolibPatched =true;
	
		// store original listener methods
		instance.__originalAddEventListener =instance.addEventListener || null;
		instance.__originalRemoveEventListener =instance.removeEventListener || null;
	
		// create evolib-compatible methods
		
		instance.addEventListener =function( type, listener, useCapture) {
			
			// get current method reference
			var currentMethod =instance.addEventListener;
			
			// restore original method
			instance.addEventListener =instance.__originalAddEventListener;
	
			// execute evolib
			lib.event.bind( instance, type, listener, useCapture);
	
			// restore method reference
			instance.addEventListener =currentMethod;
		};
	
		instance.removeEventListener =function( type, listener, useCapture) {
			
			// get current method reference
			var currentMethod =instance.removeEventListener;
			
			// restore original method
			instance.removeEventListener =instance.__originalRemoveEventListener;
	
			// execute evolib
			lib.event.unbind( instance, type, listener, useCapture);
	
			// restore method reference
			instance.removeEventListener =currentMethod;
		};
		
		// pass control to original Google Maps API
		return originalAddDomListener( instance, eventName, handler);
	};
}

// google map control
var GoogleMapControl =api.GoogleMapControl =function( object) {

	if( !IsGoogleMapsAPIPresent())
		// google maps API is not present
		throw 'Google Maps API v3 is not present. Please load Google Maps API prior to using GoogleMapControl';
	
	// reference object
	this.object =object;
	
	// reference current object
	var self =this;
	
	// create document fragment to hold new inner contents of control
	var frag =document.createDocumentFragment();
	
	{// create map title
		var title =this.object.titleContainer =document.createElement( 'DIV');
		lib.attr.set( title, {
			'class': 'title'
		});
		
		// append
		frag.appendChild( title);
	}
	
	{// create overlay
		var overlay =this.object.overlayContainer =document.createElement( 'DIV');
		lib.attr.set( overlay, {
			'class': 'overlay'
		});
		
		{// create map container
			var mapContainer =overlay.mapContainer =document.createElement( 'DIV');
			lib.attr.set( mapContainer, {
				'class': 'map'
			});

			// append
			overlay.appendChild( mapContainer);
		}
		
		{// create tools
			var tools =overlay.toolsContainer =document.createElement( 'DIV');
			lib.attr.set( tools, {
				'class': 'tools'
			});
			
			var tool;
			
			{// create 'reset selection' tool
				tool =tools.resetToolContainer =document.createElement( 'INPUT');
				tool.type ='button';
				tool.value ='Reset'// TODO: i18n
					
				lib.attr.set( tool, {
					'class': 'reset'
				});
				
				lib.event.bind( tool, 'click', tool.__clickHandler =function(){
					// deselect all points
					self.deselect();
				});
				
				// append
				tools.appendChild( tool);
			}
			
			{// create 'search address' tool
				tool =tools.searchToolContainer =document.createElement( 'DIV');
				lib.attr.set( tool, {
					'class': 'search'
				});
				
				{// create title
					var title =tool.titleContainer =document.createElement( 'SPAN');
					lib.attr.set( title, {
						'class': 'title'
					});
					lib.html.set( title, 'Find address:');// FIXME: i18n
					
					// append
					tool.appendChild( title);
				}
				
				{// create address input
					var address =tool.addressContainer =document.createElement( 'INPUT');
					address.type ='text';
					address.value ='';
					
					lib.attr.set( address, {
						'class': 'address'
					});
					
					lib.event.bind( address, 'keypress', address.__keypressHandler =function( e){
						if( e.keyIdentifier ==13) {
							// find specified address
							self.__findAddress( address.value);
							
							// clear value of input
							address.value ='';
						}
					});
					
					// append
					tool.appendChild( address);
				}
				
				{// create search button
					var button =tool.searchButtonContainer =document.createElement( 'INPUT');
					button.type ='button';
					button.value ='Find';// FIXME: i18n
					
					lib.attr.set( button, {
						'class': 'button'
					});
					
					lib.event.bind( button, 'click', button.__clickHandler =function( e){
						// find address
						self.__findAddress( address.value);
					});
					
					// append
					tool.appendChild( button);
				}
				
				// append
				tools.appendChild( tool);
			}
			
			{// create 'close' tool
				tool =tools.closeToolContainer =document.createElement( 'INPUT');
				tool.type ='button';
				tool.value ='Close'// TODO: i18n
				
				lib.attr.set( tool, {
					'class': 'close'
				});
				
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
		frag.appendChild( overlay);
	}
	
	// clear all inner contents of object
	lib.html.empty( object);
	
	// insert created inner body of control
	object.appendChild( frag);
	
	// map types used within map
	var mapTypes =[
		google.maps.MapTypeId.SATELLITE,
		google.maps.MapTypeId.HYBRID,
		google.maps.MapTypeId.ROADMAP,
		google.maps.MapTypeId.TERRAIN
	];
	
	// map type container
	var mapType;
	
	if( !lib.attr.has( object, 'data-map-type') || lib.indexOf( mapTypes, mapType =lib.attr.get( object, 'data-map-type')) ===-1) {
		// show satellite map by default
		var mapType =google.maps.MapTypeId.SATELLITE;
	}
	
	if( !lib.attr.has( object, 'data-map-zoom')) {
		// use default zoom level
		var mapZoom =8;
		
	} else {
		// use specified zoom level
		var mapZoom =parseInt( lib.attr.get( object, 'data-map-zoom'));
	}
	
	// read indicator of multi-point selection
	var multi =lib.attr.has( object, 'data-multi');
	
	// read placeholder value
	var placeholder =lib.attr.get( this.object, 'data-placeholder');
	if( placeholder !==undefined)
		this.placeholder =placeholder;
	else
		this.placeholder =placeholder ='';
	
	// selected point list
	var selectPoints =[];
	var point, coordString;
	
	if( lib.attr.has( object, 'data-map-coord') && (( coordString =lib.attr.get( object, 'data-map-coord')) !='')) {
		// process specified map coordinates
		var coordSpec =coordString.split( ';');
		
		for( var i =0; i < coordSpec.length; ++i) {
			// get lat and lng
			var latlng =coordSpec[ i].split( ',');
			
			if( latlng.length !=2)
				// only latitude and longitude must be present in coordinate spec.
				throw 'Invalid coordinates specified in "data-map-coord" attribute';
			
			// load coordinates one by one
			selectPoints.push( point =new GoogleMapPoint( this, parseFloat( latlng[ 0]), parseFloat( latlng[ 1])));
		}
	}
	
	if( !multi && selectPoints.length > 1) {
		// Too much points specified for selection. In non-multi mode only one selected
		//  point may be present.
		selectPoints.splice( 1, selectPoints.length -1);
	}
	
	// load map's center from attribute of object
	if( !lib.attr.has( object, 'data-map-center'))
		// map's center must be specified
		throw 'Map\'s center coordinate (data-map-center attribute) is not specified';
	
	// read map's center coordinate
	var mapCenter =lib.attr.get( object, 'data-map-center').split( ',');
	
	// instantiate google map center coordinate object
	mapCenter =this.mapCenter =new google.maps.LatLng( parseFloat( mapCenter[0]), parseFloat( mapCenter[1]));
	
	// initialize google map (FIXME: IE still bugs due to event system substitution)
	var map =this.map =new google.maps.Map( this.object.overlayContainer.mapContainer, {
		// FIXME: implement 'data-map-zoom' to indicate default zoom level
		'zoom': mapZoom,
		// initial map type to use
		'mapTypeId': mapType,
		// initial map's center coordinate
		'center': mapCenter,
		// disable default UI
		'disableDefaultUI': true,
		// enable map type control
		'mapTypeControl': true,
		
		'mapTypeControlOptions': {
			// list of supported map types
			'mapTypeIds': mapTypes
		},
		// FIXME: IE7/8 throws Unspecified error)
		'navigationControl': true,
		// FIXME: IE7/8 may throw errors during init/deinit
		'streetViewControl': true,
		// enable possibility to control google map widget with keyboard
		'keyboardShortcuts': true
	});
	
	// listen for clicks on a map object
	google.maps.event.addListener( map, 'click', function( e){
		// handle map click
		self.__handleMapClick( e.latLng);
	});
	
	// initialize geocoder
	this.geocoder =new google.maps.Geocoder();
	
	// initialize map control
	this.initMapControl( lib.attr.has( object, 'data-required'), multi, selectPoints);
	
	// center map
	this.__centerMap();
	
	// define click handler for object
	this.__objectClickHandler =function( e){
		if( !self.__isOverlayVisible()) {
			// show if hidden
			self.__showOverlay();
		}
	};
	
	// bind user action handlers
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
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView( false);
};

// reference prototype
var p =GoogleMapControl.prototype;

// inherit from MapControl
lib.extend( p, MapControl.prototype);

// (read-only) associated object
p.object =undefined;

// (read-only) google maps object
p.map =undefined;

// (read-only) map's center
p.mapCenter =undefined;

// (read-only) google maps geocoder
p.geocoder =undefined;

// (read-only) currently opened or last opened info window
p.infowindow =undefined;

// (read-only) placeholder text
p.placeholder ='';

// unload google map control
p.unloadGoogleMapControl =function() {
	
	// unbind event handlers
	lib.event.unbind( this.object, 'click', this.__objectClickHandler, true);
	lib.event.unbind( document, 'click', this.__documentClickHandler, true);
	
	// unbind event handlers from tools
	lib.event.unbind( this.object.overlayContainer.toolsContainer.closeToolContainer, 'click', this.object.overlayContainer.toolsContainer.closeToolContainer.__clickHandler);
	lib.event.unbind( this.object.overlayContainer.toolsContainer.resetToolContainer, 'click', this.object.overlayContainer.toolsContainer.resetToolContainer.__clickHandler);
	lib.event.unbind( this.object.overlayContainer.toolsContainer.searchToolContainer.addressContainer, 'keypress', this.object.overlayContainer.toolsContainer.searchToolContainer.addressContainer.__keypressHandler);
	lib.event.unbind( this.object.overlayContainer.toolsContainer.searchToolContainer.searchButtonContainer, 'click', this.object.overlayContainer.toolsContainer.searchToolContainer.searchButtonContainer.__clickHandler);
	
	if( this.points.length >0) {
		// export current selected point list
		var pointAttribute ='';
		
		for( var i =0; i < this.points.length; ++i) {
			var point =this.points[ i];
			pointAttribute +=point.coord.lat() +',' +point.coord.lng() +';';
		}
		
		// assign attribute
		lib.attr.set( this.object, 'data-map-coord', pointAttribute.substr( 0, pointAttribute.length -1));
		
	} else {
		// assign to empty attribute
		lib.attr.set( this.object, 'data-map-coord', '');
	}
	
	// export currently selected map type
	lib.attr.set( this.object, 'data-map-type', this.map.getMapTypeId());
	
	// unload map control
	this.unloadMapControl();
	
	// empty contents of object
	lib.html.empty( this.object);
	
	// remove internal attributes
	lib.attr.remove( this.object, ['data-invalid','data-activated']);
	
	// dereference google maps objects
	this.map =undefined;
	this.geocoder =undefined;

	if( lib.bugs.propertyDeletionThrowsException()) {
		// dereference associated elements
		this.object.titleContainer =undefined;
		this.object.overlayContainer =undefined;
		
	} else {
		// delete properties
		delete this.object.titleContainer;
		delete this.object.overlayContainer;
	}
	
	// dereference object
	this.object =undefined;
};

// control focusing method
p.focus =function() {
	// scroll object into view
	this.object.scrollIntoView();
};

// triggered when point is selected
p.__onPointSelected =function( point) {
	// resolve point's address
	point.__resolveAddress();
	
	// show marker for point
	point.showMarker();
};

// triggered when point is deselected
p.__onPointDeselected =function( point) {
	point.showMarker( false);
};

// update control's view
p.__onUpdateView =function( triggerChange) {
	// default args
	if( triggerChange ===undefined)
		triggerChange =true;
	
	var title ='';
	
	if( this.points.length ==0) {
		// no points are selected
		title =this.placeholder;
		
		// put title in placeholder mode
		lib.attr.addClass( this.object.titleContainer, 'placeholder');
		
	} else {
		// points are selected
		var i;
		for( i =0; i < this.points.length; ++i)
			title +=this.points[ i].getAddress() +';';
		
		// remove last semicolon from title
		title =title.substr( 0, title.length -1);
		
		// remove from placeholder mode if previously was in it
		lib.attr.removeClass( this.object.titleContainer, 'placeholder');
	}
	
	// assign title's text
	lib.html.set( this.object.titleContainer, title);
	lib.attr.set( this.object.titleContainer, {
		'title': title
	});
	
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

// close info window
p.__closeInfoWindow =function() {
	if( this.infowindow !==undefined)
		// close active info window
		this.infowindow.close();
	
	// dereference infowindow
	this.infowindow =undefined;
};

// show info window
p.__showInfoWindow =function( infowindow, marker) {
	if( this.infowindow !==undefined)
		// close active info window
		this.infowindow.close();
	
	// open info window
	infowindow.open( this.map, marker);
	
	// set current info window
	this.infowindow =infowindow;
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
	
	// close info windows
	this.__closeInfoWindow();
	
	// center map
	this.__centerMap();
};

// toggle overlay
p.__toggleOverlay =function( close) {
	if( this.__isOverlayVisible())
		this.__hideOverlay();
	else
		this.__showOverlay();
};

// center map
p.__centerMap =function() {
	
	if( this.points.length ==0) {
		// no points selected, center map
		this.map.setCenter( this.mapCenter);
		
	} else if( this.points.length ==1) {
		// single point selected, center map at that point
		this.map.setCenter( this.points[ 0].coord);
		
	} else {
		// multiple points selected, fit them all within map's viewport
		var mapBounds =new google.maps.LatLngBounds();
		var i;
		
		for( i =0; i < this.points.length; ++i)
			// extend bounds
			mapBounds.extend( this.points[ i].coord);
		
		// fit bounds
		this.map.fitBounds( mapBounds);
	}
};

// find address on a map
p.__findAddress =function( address) {
	
	// trim address
	address =address.trim();
	
	if( address =='')
		// no address specified
		return alert( 'Please specify address to find');// FIXME: i18n
	
	// reference current object
	var self =this;
	
	// create geocoder request object
	var req =new Object;
	req.address =address;
	
	// resolve address
	this.geocoder.geocode( req, function( results, status) {
		
		if( status !=google.maps.GeocoderStatus.OK) {
			// failed to geocode
			return alert( 'Could not resolve "' +address +'" (Geocoder status: ' +status +')');// FIXME: i18n
		}
		
		if( results.length ==0) {
			// no results found
			return alert( 'Address "' +address +'" was not found'); // FIXME: i18n
		}
		
		// pick first result
		var first =results[ 0];
		
		// move map to the center of the result
		self.map.fitBounds( first.geometry.bounds);
  });
};

// map was clicked
p.__handleMapClick =function( latLng) {
	// add new point to the map (FIXME: only for multi maps. For single maps - reposition existing point)
	this.selectPoint( new GoogleMapPoint( this, latLng.lat(), latLng.lng()));
};

})( EVOLIB_EXPORT, 'controls');
