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
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import { Locale } from '../../../../joist/js/i18n/localeProperty.js';

// preference Properties directly controlled by UI
class NumberSuiteCommonPreferences {

  // if a valid second locale was provided via a query parameter, display the second locale on sim startup
  public readonly showSecondLocaleProperty: Property<boolean>;
  public readonly secondLocaleProperty: Property<Locale>;
  public readonly showLabOnesProperty: Property<boolean>;
  public readonly readAloudProperty: Property<boolean>;

  // helper Properties derived from preference Properties
  public readonly secondLocaleStringsProperty: TReadOnlyProperty<IntentionalAny>;

  public constructor() {
    this.readAloudProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.readAloud );

    const isSecondLocaleProvided = QueryStringMachine.containsKey( 'secondLocale' );
    const isSecondLocaleValid = !!phet.chipper.strings[ NumberSuiteCommonQueryParameters.secondLocale! ] &&
                                Object.keys( phet.chipper.strings ).length > 1;

    if ( isSecondLocaleProvided && !isSecondLocaleValid ) {
      QueryStringMachine.addWarning( 'secondLocale', NumberSuiteCommonQueryParameters.secondLocale,
        `Second locale doesn't exist: ${NumberSuiteCommonQueryParameters.secondLocale}` );
      NumberSuiteCommonQueryParameters.secondLocale = phet.chipper.locale;
    }

    this.showSecondLocaleProperty = new BooleanProperty( isSecondLocaleProvided && isSecondLocaleValid );

    this.secondLocaleProperty = new Property<Locale>( NumberSuiteCommonQueryParameters.secondLocale! as Locale );

    this.showLabOnesProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.showLabOnes );

    this.secondLocaleStringsProperty = new DerivedProperty( [ this.secondLocaleProperty ], secondLocale => {
      return phet.chipper.strings[ secondLocale ];
    } );
  }

  public dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferences', NumberSuiteCommonPreferences );
export default NumberSuiteCommonPreferences;