// Copyright 2021-2023, University of Colorado Boulder

/**
 * An ABSwitch for choosing the primary or secondary locale.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import localeProperty, { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import localeInfoModule from '../../../../chipper/js/data/localeInfoModule.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

// constants
const AB_SWITCH_OPTIONS = {
  spacing: 8,
  toggleSwitchOptions: {
    size: new Dimension2( 40, 20 )
  }
};

export default class LocaleSwitch extends ABSwitch<boolean> {

  public constructor( isPrimaryLocaleProperty: Property<boolean>, showSecondLocaleProperty: TReadOnlyProperty<boolean>,
                      secondLocaleProperty: TReadOnlyProperty<Locale>, maxWidth: number ) {

    const firstLanguageStringProperty = new DerivedProperty( [ localeProperty ],
      locale => localeInfoModule[ locale ].localizedName );

    const secondLanguageStringProperty = new DerivedProperty( [ secondLocaleProperty ],
      locale => localeInfoModule[ locale ].localizedName );

    const textOptions = {
      font: new PhetFont( 14 ),

      // half of the available horizontal space without the ToggleSwitch or spacing.
      maxWidth: ( maxWidth - AB_SWITCH_OPTIONS.toggleSwitchOptions.size.width - AB_SWITCH_OPTIONS.spacing * 2 ) * 0.5
    };
    
    const firstLanguageText = new Text( firstLanguageStringProperty, textOptions );
    const secondLanguageText = new Text( secondLanguageStringProperty, textOptions );

    super( isPrimaryLocaleProperty,
      true, firstLanguageText,
      false, secondLanguageText,
      AB_SWITCH_OPTIONS
    );

    showSecondLocaleProperty.link( showSecondLocale => {
      this.visible = showSecondLocale;
      if ( !showSecondLocale ) {
        isPrimaryLocaleProperty.value = true;
      }
    } );
  }
}

numberSuiteCommon.register( 'LocaleSwitch', LocaleSwitch );