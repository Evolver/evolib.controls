
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// Map point.
var MapPoint =api.MapPoint =function() {
};

// reference prototype
var p =MapPoint.prototype;

// (read-only) associated control
p.control =undefined;

// (read-only) coordinates of point
p.latitude =0;
p.longitude =0;

// initialize point
p.initMapPoint =function( control, lat, lng) {
	this.control =control;
	this.latitude =lat;
	this.longitude =lng;
};

// unload point
p.unloadMapPoint =function() {
	// do nothing
};

})( EVOLIB_EXPORT, 'controls');
