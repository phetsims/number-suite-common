// Copyright 2022, University of Colorado Boulder

/**
 * A carousel that contains buttons that can be selected to set the second locale of this sim.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberSuiteCommon from '../../numberSuiteCommon.js';
import Carousel, { CarouselOptions } from '../../../../sun/js/Carousel.js';
import localeProperty, { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import { GridBox } from '../../../../scenery/js/imports.js';
import LanguageSelectionNode from '../../../../joist/js/preferences/LanguageSelectionNode.js';
import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;

type SecondLocaleSelectorCarouselOptions = SelfOptions & CarouselOptions;

class SecondLocaleSelectorCarousel extends Carousel {

  public constructor( secondLocaleProperty: Property<Locale>, providedOptions?: SecondLocaleSelectorCarouselOptions ) {

    const options = optionize<SecondLocaleSelectorCarouselOptions, SelfOptions, CarouselOptions>()( {
      itemsPerPage: 1,
      spacing: 0,
      margin: 0,
      orientation: 'vertical'
    }, providedOptions );

    const createInteractiveLocales = () => {
      return localeProperty.validValues!.map( locale => {
        return new LanguageSelectionNode( secondLocaleProperty, locale );
      } );
    };

    // A prototype where we show all languages in grid managed by a Carousel so that there aren't too many items
    // displayed at one time
    const chunkedLocaleItems = _.chunk( createInteractiveLocales(), 10 );
    const carouselItems = chunkedLocaleItems.map( localeItem => {
      return new GridBox( {
        xMargin: 5,
        yMargin: 3,
        xAlign: 'center',
        autoRows: 10,
        children: [ ...localeItem ],
        resize: false
      } );
    } );

    super( carouselItems, options );
  }
}

numberSuiteCommon.register( 'SecondLocaleSelectorCarousel', SecondLocaleSelectorCarousel );
export default SecondLocaleSelectorCarousel;