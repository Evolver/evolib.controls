<?php
// Author: Dmitry Stepanov <dmitrij@stepanov.lv>
// URL: http://www.stepanov.lv
// Sun Dec 20 21:00:07 GMT 2009 21:00:07 build.php

// where to take source files from
define( 'SOURCE_ROOT', dirname( __DIR__) .'/');

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
  lib_file( 'Control.js') ."\n\n" .
  lib_file( 'BoolControl.js') ."\n\n" .
  lib_file( 'ManualInputControl.js') ."\n\n" .
  lib_file( 'Option.js') ."\n\n" .
  lib_file( 'OptionControl.js') ."\n\n" .
  lib_file( 'DropdownOption.js') ."\n\n" .
  lib_file( 'DropdownOptionControl.js') ."\n\n" .
  lib_file( 'StringControl.js') ."\n\n" .
  lib_file( 'CheckboxControl.js') ."\n\n" .
  lib_file( 'Form.js') ."\n\n" .
  lib_file( 'common_API.js')
);

?>