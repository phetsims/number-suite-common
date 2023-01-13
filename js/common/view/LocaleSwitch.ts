// Copyright 2021-2023, University of Colorado Boulder

/**
 * An ABSwitch for choosing the primary or secondary locale.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignGroup, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import localeProperty, { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import localeInfoModule from '../../../../chipper/js/data/localeInfoModule.js';

// constants
const AB_SWITCH_OPTIONS = {
  centerOnSwitch: true,
  spacing: 8,
  toggleSwitchOptions: {
    size: new Dimension2( 40, 20 )
  }
};

class LocaleSwitch extends ABSwitch<boolean> {

  public constructor( isPrimaryLocaleProperty: Property<boolean>, showSecondLocaleProperty: TReadOnlyProperty<boolean>,
                      secondLocaleProperty: TReadOnlyProperty<Locale>, maxWidth: number ) {

    // options for the switch text. calculate the maxWidth for each string as half of the available horizontal space
    // without the ToggleSwitch or spacing.
    const switchTextOptions = {
      font: new PhetFont( 14 ),
      maxWidth: ( maxWidth - AB_SWITCH_OPTIONS.toggleSwitchOptions.size.width - AB_SWITCH_OPTIONS.spacing * 2 ) * 0.5
    };

    const firstLanguageText = new Text( localeInfoModule[ localeProperty.value ].localizedName, switchTextOptions );
    const secondLanguageText = new Text( '', switchTextOptions );

    secondLocaleProperty.link( locale => {
      secondLanguageText.setText( localeInfoModule[ locale ].localizedName );
    } );

    // To give the labels the same effective width
    const alignGroup = new AlignGroup();

    super( isPrimaryLocaleProperty,
      true,
      new AlignBox( firstLanguageText, {
        group: alignGroup,
        xAlign: 'right'
      } ),
      false,
      new AlignBox( secondLanguageText, {
        group: alignGroup,
        xAlign: 'left'
      } ),
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
export default LocaleSwitch;