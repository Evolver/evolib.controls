
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;
var MapPoint =api.MapPoint;

// Google MapPoint class implementation
var GoogleMapPoint =api.GoogleMapPoint =function( control, lat, lng) {
	// initialize map point
	this.initMapPoint( control, lat, lng);
	
	// create coord
	this.coord =new google.maps.LatLng( lat, lng);
	
	// create info window
	this.infowindow =new google.maps.InfoWindow();
};

// reference prototype
var p =GoogleMapPoint.prototype;

// inherit from MapPoint
lib.extend( p, api.MapPoint.prototype);

// (read-only) address at point's coordinate
p.address ='';

// coordinate object
p.coord =undefined;

// marker object on the map
p.marker =undefined;

// (read-only) point's address
p.address =null;

// unload google map point
p.unloadGoogleMapPoint =function() {
	// FIXME: teardown
	this.marker =undefined;
	this.coord =undefined;
	
	// unload map point
	this.unloadMapPoint();
};

// show marker
p.showMarker =function( show) {
	// default args
	if( show ===undefined)
		show =true;
	
	// reference current object
	var self =this;
	
	if( show && this.marker ===undefined) {
		// show marker
		var marker =this.marker =new google.maps.Marker({
	    'position': this.coord,
	    'map': this.control.map,
	    'draggable': true// FIXME: allow dragging only if map is not disabled
		});
		
		// listen for clicks
		google.maps.event.addListener( marker, 'click', function( e){
			// show information about point
			self.control.__showInfoWindow( self.infowindow, self.marker);
		});
		
		// listen for right clicks
		google.maps.event.addListener( marker, 'rightclick', function( e){
			// close any open info window
			self.control.__closeInfoWindow();
			
			// remove (deselect) point when right clicked
			self.control.deselectPoint( self);
		});
		
		// close info window if marker is being dragged
		google.maps.event.addListener( marker, 'dragstart', function( e){
			self.control.__closeInfoWindow();
		});
		
		// allow marker dragging (FIXME: only of map is not disabled)
		google.maps.event.addListener( marker, 'dragend', function( e){
			// reposition point
			self.__reposition( e.latLng.lat(), e.latLng.lng());
			
			// update control's view
			self.control.__onUpdateView( true);
		});
		
	} else if( !show && this.marker !==undefined) {
		// hide marker from map
		this.marker.setMap( null);
		// dereference marker object
		this.marker =undefined;
	}
};

// set point's address
p.setAddress =function( address) {
	this.address =address;
	
	// update infowindow's contents
	this.infowindow.setContent( this.getAddress());
};

// get point's address
p.getAddress =function() {
	if( this.address ===null || this.address =='')
		return '(' +this.coord.lat() +',' +this.coord.lng() +')';
	else
		return this.address;
};

// reposition point
p.__reposition =function( lat, lng) {
	// update coordinates
	this.latitude =lat;
	this.longitude =lng;
	
	// re-create google map's coord object
	this.coord =new google.maps.LatLng( lat, lng);
	
	if( this.marker !==undefined) {
		// update marker's position
		this.marker.setPosition( new google.maps.LatLng( lat, lng));
	}
	
	// resolve address of new coordinate
	this.__resolveAddress();
};

// reposition point
p.reposition =function( lat, lng) {
	// reposition point
	this.__reposition( lat, lng);
	
	// update view
	this.control.__onUpdateView( true);
};

// resolve address
p.__resolveAddress =function() {
	// reference current object
	var self =this;
	
	// create geocoder request
	var req =new Object;
	req.latLng =new google.maps.LatLng( this.latitude, this.longitude);
	
	// resolve point's address
	this.control.geocoder.geocode( req, function( results, status) {
		var address;
		
		if( status ==google.maps.GeocoderStatus.OK && results[ 1] !==undefined)
			address =results[1].formatted_address;
		else
			address =null;
		
		// set point's address
		self.setAddress( address);
		
		// update map's view
		self.control.__onUpdateView( false);
  });
};

})( EVOLIB_EXPORT, 'controls');
