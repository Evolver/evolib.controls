<?php
// Author: Dmitry Stepanov <dmitrij@stepanov.lv>
// URL: http://www.stepanov.lv
// Sun Dec 20 21:00:07 GMT 2009 21:00:07 build.php

// where to take source files from
define( 'SOURCE_ROOT', dirname( __DIR__) .'/');

// UI language
define( 'UI_LANG', 'en');

// compile library file
function lib_file( $path) {
  return file_get_contents( SOURCE_ROOT .'lib/' .$path);
}

// Library package builder

$authorNote =<<<NOTE
/**
 * Evolib Controls - extension to Evolver's JavaScript library.
 * http://github.com/Evolver/evolib.controls
 *
 * Copyright (C) 2010 Dmitry Stepanov <dmitrij@stepanov.lv>
 * URL: http://www.stepanov.lv
 *
 * Publicly available for non-commercial use under GPL v2 license terms.
 */

NOTE;

file_put_contents( __DIR__ .'/evolib.controls.js',
	$authorNote .
  lib_file( 'controls.Control.js') ."\n\n" .
  lib_file( 'controls.BoolControl.js') ."\n\n" .
  lib_file( 'controls.ManualInputControl.js') ."\n\n" .
  lib_file( 'controls.Option.js') ."\n\n" .
  lib_file( 'controls.OptionControl.js') ."\n\n" .
  lib_file( 'controls.DropdownOption.js') ."\n\n" .
  lib_file( 'controls.DropdownOptionControl.js') ."\n\n" .
  lib_file( 'controls.OverlayAlphabet.js') ."\n\n" .
  lib_file( 'controls.OverlayOption.js') ."\n\n" .
  lib_file( 'controls.OverlayOptionControl.js') ."\n\n" .
  lib_file( 'controls.OverlayOptionControl.' .UI_LANG .'.js') ."\n\n" .
  lib_file( 'controls.StringControl.js') ."\n\n" .
  lib_file( 'controls.CheckboxControl.js') ."\n\n" .
  lib_file( 'controls.MapPoint.js') ."\n\n" .
  lib_file( 'controls.MapControl.js') ."\n\n" .
  lib_file( 'controls.GoogleMapPoint.js') ."\n\n" .
  lib_file( 'controls.GoogleMapPoint.' .UI_LANG .'.js') ."\n\n" .
  lib_file( 'controls.GoogleMapControl.js') ."\n\n" .
  lib_file( 'controls.GoogleMapControl.' .UI_LANG .'.js') ."\n\n" .
  lib_file( 'controls.Form.js') ."\n\n" .
  lib_file( 'controls.js')
);

?>