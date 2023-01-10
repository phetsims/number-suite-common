// Copyright 2022, University of Colorado Boulder

/**
 * A carousel that contains buttons that can be selected to set the second locale of this sim.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberSuiteCommon from '../../numberSuiteCommon.js';
import Carousel from '../../../../sun/js/Carousel.js';
import localeProperty from '../../../../joist/js/i18n/localeProperty.js';
import LanguageSelectionNode from '../../../../joist/js/preferences/LanguageSelectionNode.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import Tandem from '../../../../tandem/js/Tandem.js';

class SecondLocaleSelectorCarousel<T extends NumberSuiteCommonPreferences> extends Carousel {

  public constructor( preferences: T ) {

    const createInteractiveLocales = () => {
      return localeProperty.validValues!.map( locale => {
        return {
          createNode: ( tandem: Tandem ) => new LanguageSelectionNode( preferences.secondLocaleProperty, locale )
        };
      } );
    };

    super( createInteractiveLocales(), {
      itemsPerPage: 10,
      spacing: 10,
      margin: 10,
      orientation: 'vertical'
    } );

    preferences.showSecondLocaleProperty.link( showSecondLocale => {
      this.visible = showSecondLocale;
    } );
  }
}

numberSuiteCommon.register( 'SecondLocaleSelectorCarousel', SecondLocaleSelectorCarousel );
export default SecondLocaleSelectorCarousel;