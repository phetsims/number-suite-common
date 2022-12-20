// Copyright 2021-2022, University of Colorado Boulder

/**
 * NumberSuiteCommonColors defines the colors used commonly across Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import numberSuiteCommon from '../numberSuiteCommon.js';

const NumberSuiteCommonColors = {

  // backgrounds for screens, accordion boxes, and more. they are named by color instead of by what they are
  // used for because so many are reused for multiple applications and should remain in sync.
  purpleBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'purpleBackgroundColor', {
    default: new Color( 214, 209, 255 )
  } ),
  purpleHighlightColorProperty: new ProfileColorProperty( numberSuiteCommon, 'purpleHighlightColor', {
    default: new Color( 200, 194, 255 )
  } ),
  mediumPurpleBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'mediumPurpleBackgroundColor', {
    default: new Color( 238, 238, 255 )
  } ),
  lightPurpleBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'lightPurpleBackground', {
    default: new Color( 248, 248, 255 )
  } ),
  orangeBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'orangeBackgroundColor', {
    default: new Color( 249, 210, 172 )
  } ),
  orangeHighlightColorProperty: new ProfileColorProperty( numberSuiteCommon, 'orangeHighlightColor', {
    default: new Color( 247, 209, 159 )
  } ),
  lightOrangeBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'lightOrangeBackgroundColor', {
    default: new Color( 255, 247, 235 )
  } ),
  pinkBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'pinkBackgroundColor', {
    default: new Color( 252, 220, 255 )
  } ),
  blueBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'blueBackgroundColor', {
    default: new Color( 204, 239, 255 )
  } ),
  whiteBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'whiteBackgroundColor', {
    default: new Color( 255, 255, 255 )
  } )
};

numberSuiteCommon.register( 'NumberSuiteCommonColors', NumberSuiteCommonColors );
export default NumberSuiteCommonColors;