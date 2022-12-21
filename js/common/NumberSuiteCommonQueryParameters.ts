// Copyright 2022, University of Colorado Boulder

/**
 * NumberSuiteCommonQueryParameters defines query parameters that are specific to Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberSuiteCommon from '../numberSuiteCommon.js';

const NumberSuiteCommonQueryParameters = QueryStringMachine.getAll( {

  // whether the current number on the 'Ten' and 'Twenty' screens or the compare statement on the 'Compare' screen
  // should be read out loud whenever their value changes
  readAloud: {
    public: true,
    type: 'flag'
  },

  // specifies a second locale to make available on the 'Ten', 'Twenty', and 'Compare' screens. Values are specified
  // with a locale code, e.g. 'en'.
  secondLocale: {
    public: true,
    type: 'string',
    defaultValue: phet.chipper.locale
  },

  // whether the paper ones are visible on the 'Lab' screen
  showLabOnes: {
    public: true,
    type: 'boolean',
    defaultValue: true
  }
} );

numberSuiteCommon.register( 'NumberSuiteCommonQueryParameters', NumberSuiteCommonQueryParameters );
export default NumberSuiteCommonQueryParameters;