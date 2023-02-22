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
import localeProperty from '../../../../joist/js/i18n/localeProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';

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

  public constructor( preferences: NumberSuiteCommonPreferences, maxWidth: number ) {

    const firstLanguageStringProperty = new DerivedProperty( [ localeProperty ], StringUtils.localeToLocalizedName );

    const secondLanguageStringProperty = new DerivedProperty( [ preferences.secondLocaleProperty ],
      StringUtils.localeToLocalizedName );

    const firstLanguageText = new Text( firstLanguageStringProperty, TEXT_OPTIONS );
    const secondLanguageText = new Text( secondLanguageStringProperty, TEXT_OPTIONS );

    super( preferences.isPrimaryLocaleProperty,
      true, firstLanguageText,
      false, secondLanguageText,
      AB_SWITCH_OPTIONS
    );

    preferences.showSecondLocaleProperty.link( showSecondLocale => {
      this.visible = showSecondLocale;
      if ( !showSecondLocale ) {
        preferences.isPrimaryLocaleProperty.value = true;
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