// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferences is the model for sim-specific preferences for all Number suite sims, accessed via the
 * Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonQueryParameters from '../NumberSuiteCommonQueryParameters.js';
import Property from '../../../../axon/js/Property.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import localeProperty, { availableRuntimeLocales, Locale } from '../../../../joist/js/i18n/localeProperty.js';

//TODO https://github.com/phetsims/number-suite-common/issues/18 type string map, perhaps getStringModule.TStringModule?
//TODO https://github.com/phetsims/number-suite-common/issues/18 replace any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SecondLocaleStrings = any;

class NumberSuiteCommonPreferences {

  // preference Properties directly controlled by UI
  // if a valid second locale was provided via a query parameter, display the second locale on sim startup
  public readonly showSecondLocaleProperty: Property<boolean>;
  public readonly secondLocaleProperty: Property<Locale>;
  public readonly showLabOnesProperty: Property<boolean>;
  public readonly readAloudProperty: Property<boolean>;

  // whether the sim is using the locale it was loaded in or a second locale
  public readonly isPrimaryLocaleProperty: Property<boolean>;

  // helper Properties derived from preference Properties
  public readonly secondLocaleStringsProperty: TReadOnlyProperty<SecondLocaleStrings>;

  // the 'all' link of this simulation
  public readonly allUrl: string;

  public constructor( allUrl: string ) {
    this.readAloudProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.readAloud );

    this.isPrimaryLocaleProperty = new BooleanProperty( true );

    this.showSecondLocaleProperty = new BooleanProperty( !!NumberSuiteCommonQueryParameters.secondLocale );

    this.secondLocaleProperty = new Property<Locale>( NumberSuiteCommonQueryParameters.secondLocale as Locale || localeProperty.value, {
      validValues: availableRuntimeLocales
    } );

    this.showLabOnesProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.showLabOnes );

    this.secondLocaleStringsProperty = new DerivedProperty( [ this.secondLocaleProperty ], secondLocale => {
      return phet.chipper.strings[ secondLocale ];
    } );

    this.allUrl = allUrl;
  }

  public dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferences', NumberSuiteCommonPreferences );
export default NumberSuiteCommonPreferences;