
(function( lib, namespace){
	
// resolve namespace
var api =lib.namespace( namespace), undefined;

// import classes
var Map =lib.Map;

// Map control abstraction. Map control may have single or multiple points
//  selected on a map.
var MapControl =api.MapControl =function() {
};

// reference prototype
var p =MapControl.prototype;

// inherit from Control
lib.extend( p, api.Control.prototype);

// (read-only) multiple point selection allowed?
p.multi =false;

// (read-only) list of selected points
p.points =undefined;

// (read-only) list of default selected points
p.defaultPoints =undefined;

// initialize map control
p.initMapControl =function( required, multi, selected) {
	// initialize control
	this.initControl( required);
	
	// initialize point list
	this.points =[];
	
	if( multi !==undefined) {
		// set multi flag
		this.multi =multi;
	}
	
	if( selected !==undefined) {
		// select options
		this.__selectPoints( selected);
	}
	
	// store default selected points
	this.defaultPoints =lib.clone( this.points, false);
};

// unload map control
p.unloadMapControl =function() {
	// deselect all points
	this.__selectPoints( this.points, false);
	
	// unload control
	this.unloadControl();
};

// triggered when point is selected
p.__onPointSelected =function( point) {
	throw 'Override this';
};

// triggered when point is deselected
p.__onPointDeselected =function( point) {
	throw 'Override this';
};

// select points
p.__selectPoints =function( points, select) {
	// default args
	if( select ===undefined)
		select =true;
	
	// make sure points array is not the same object as 
	//  this.points array
	if( points ===this.points)
		points =lib.clone( this.points, false);
	
	if( select) {
		// select points
		for( var i =0; i < points.length; ++i) {
			var alreadySelected =false;
			var point =points[ i];
			
			for( var p =0; p < this.points.length; ++p) {
				if( this.points[ p] ===point) {
					alreadySelected =true;
					break;
				}
			}
			
			if( !alreadySelected) {
				// add new point
				this.points.push( point);
				
				// mark option as selected
				this.__onPointSelected( point);
			}
		}
		
	} else {
		// deselect points
		var point;
		
		for( var i =0; i < points.length; ++i) {
			point =points[ i];
			
			for( var p =0; p < this.points.length; ++p) {
				if( this.points[ p] ===point) {
					// trigger deselection routine
					this.__onPointDeselected( point);

					// remove point from point list
					this.points.splice( p, 1);
					break;
				}
			}
		}
	}
};

// check if point is selected
p.__isPointSelected =function( point) {
	for( var i =0; i < this.points.length; ++i)
		if( this.points[ i] ===point)
			// point found
			return true;
	
	// point not found
	return false;
};

// triggered when control validation must be performed
p.__validate =function() {
	if( this.required && this.points.length ==0)
		// input is invalid
		return this.valid =false;
	
	// input is valid
	return this.valid =true;
};

// select point on the map
p.selectPoint =function( point) {
	// select point
	this.__selectPoints( [point], true);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// select multiple points on the map
p.selectPoints =function( points) {
	// select points
	this.__selectPoints( points, true);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// deselect point
p.deselectPoint =function( point) {
	// deselect point
	this.__selectPoints( [point], false);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// deselect multiple points on the map
p.deselectPoints =function( points) {
	// deselect points
	this.__selectPoints( points, false);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

// deselect all points on map
p.deselect =function() {
	// deselect all points
	this.deselectPoints( this.points);
};

// get list of selected points
p.getSelectedPoints =function() {
	return this.points;
};

// reset control
p.reset =function() {
	// deselect all points
	this.__selectPoints( this.points, false);
	
	// select default points
	this.__selectPoints( this.defaultPoints, true);
	
	// validate
	this.__validate();
	
	// update view
	this.__onUpdateView();
};

})( EVOLIB_EXPORT, 'controls');
