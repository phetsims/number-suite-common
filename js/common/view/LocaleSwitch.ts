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
const TEXT_OPTIONS = {
  font: new PhetFont( 14 )
};

export default class LocaleSwitch extends ABSwitch<boolean> {

  public constructor( isPrimaryLocaleProperty: Property<boolean>, showSecondLocaleProperty: TReadOnlyProperty<boolean>,
                      secondLocaleProperty: TReadOnlyProperty<Locale>, maxWidth: number ) {

    const firstLanguageStringProperty = new DerivedProperty( [ localeProperty ],
      locale => localeInfoModule[ locale ].localizedName );

    const secondLanguageStringProperty = new DerivedProperty( [ secondLocaleProperty ],
      locale => localeInfoModule[ locale ].localizedName );

    const firstLanguageText = new Text( firstLanguageStringProperty, TEXT_OPTIONS );
    const secondLanguageText = new Text( secondLanguageStringProperty, TEXT_OPTIONS );

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

    const availableTextSpace = maxWidth - AB_SWITCH_OPTIONS.toggleSwitchOptions.size.width - AB_SWITCH_OPTIONS.spacing * 2;
    let isAdjusting = false; // to prevent recursion that will exceed maximum call stack size
    this.boundsProperty.link( () => {
      if ( !isAdjusting ) {
        isAdjusting = true;

        // Assume that neither label needs to be scaled.
        firstLanguageText.maxWidth = null;
        secondLanguageText.maxWidth = null;

        // If there's not enough space for both full-size labels, give each Text label half of the available space.
        if ( firstLanguageText.width + secondLanguageText.width > availableTextSpace ) {
          firstLanguageText.maxWidth = availableTextSpace / 2;
          secondLanguageText.maxWidth = availableTextSpace / 2;
        }
        isAdjusting = false;
      }
    } );
  }
}

numberSuiteCommon.register( 'LocaleSwitch', LocaleSwitch );