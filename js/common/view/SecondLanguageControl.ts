// Copyright 2023, University of Colorado Boulder

/**
 * SecondLanguageControl is the 'Second Language' control in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import { allowLinksProperty, RichText, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import localeProperty, { availableRuntimeLocales, Locale } from '../../../../joist/js/i18n/localeProperty.js';
import Property from '../../../../axon/js/Property.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import Carousel, { CarouselItem } from '../../../../sun/js/Carousel.js';
import LanguageSelectionNode from '../../../../joist/js/preferences/LanguageSelectionNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';

const ALL_URL = 'https://phet.colorado.edu/sims/html/number-play/latest/number-play_all.html';

type SelfOptions = EmptySelfOptions;

type SecondLanguageControlOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'>;

type SecondLanguageCarouselItem = { locale: Locale } & CarouselItem;

export default class SecondLanguageControl extends VBox {

  public constructor( showSecondLocaleProperty: Property<boolean>, secondLocaleProperty: Property<Locale>,
                      providedOptions?: SecondLanguageControlOptions ) {

    const options = optionize<SecondLanguageControlOptions, SelfOptions, VBoxOptions>()( {

      // VBoxOptions
      excludeInvisibleChildrenFromBounds: false,
      align: 'center',
      spacing: NumberSuiteCommonConstants.PREFERENCES_VBOX_SPACING
    }, providedOptions );

    const labelText = new Text( NumberSuiteCommonStrings.secondLanguageStringProperty, {
      fontSize: NumberSuiteCommonConstants.PREFERENCES_FONT_SIZE,
      fontWeight: 'bold'
    } );

    const descriptionText = new Text( NumberSuiteCommonStrings.secondLanguageDescriptionStringProperty, {
      fontSize: NumberSuiteCommonConstants.PREFERENCES_FONT_SIZE
    } );

    const toggleSwitch = new ToggleSwitch( showSecondLocaleProperty, false, true,
      PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    const preferencesControl = new PreferencesControl( {
      labelNode: labelText,
      descriptionNode: descriptionText,
      controlNode: toggleSwitch,
      enabled: ( availableRuntimeLocales.length > 1 ), // disabled if we do not have multiple locales available
      ySpacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING
    } );

    // Additional description that is visible when the Second Language control is disabled.
    const additionalDescriptionNode = new AdditionalDescriptionNode( !preferencesControl.enabled );

    // Carousel for choosing the second language.
    const carouselItems: SecondLanguageCarouselItem[] = localeProperty.validValues!.map(
      locale => {
        return {
          locale: locale,
          createNode: ( tandem: Tandem ) => new LanguageSelectionNode( secondLocaleProperty, locale )
        };
      } );
    const secondLanguageCarousel = new Carousel( carouselItems, {
      visibleProperty: showSecondLocaleProperty,
      itemsPerPage: 10,
      spacing: 6,
      margin: 5,
      orientation: 'vertical'
    } );

    // Scroll the carousel so that the initial selection is shown. See https://github.com/phetsims/number-suite-common/issues/38
    const selectedNode = _.find( carouselItems, item => item.locale === secondLocaleProperty.value )!;
    assert && assert( selectedNode );
    secondLanguageCarousel.scrollToItem( selectedNode );

    options.children = [
      new VBox( {
        children: [ preferencesControl, additionalDescriptionNode ],
        spacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING,
        align: 'left'
      } ),
      secondLanguageCarousel
    ];

    super( options );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

/**
 * Additional description that is displayed below the 'Second Language' toggle switch when we do not have
 * multiple locales. It instructs the user how to run the version of the sim that supports multiple locales.
 * If allowLinks is true, a hyperlink to the 'all' version of the sim is included.
 */
class AdditionalDescriptionNode extends VBox {

  public constructor( visible: boolean ) {

    const toDisplayASecondLanguageText = new RichText( NumberSuiteCommonStrings.toDisplayASecondLanguageDescriptionStringProperty, {
      font: new PhetFont( 12 )
    } );

    // If links are not allowed, show the URL as plain text.
    const urlStringProperty = new DerivedProperty( [ allowLinksProperty ],
      allowLinks => allowLinks ? `<a href="{{url}}">${ALL_URL}</a>` : ALL_URL
    );
    const urlText = new RichText( urlStringProperty, {
      links: { url: ALL_URL },
      font: new PhetFont( 12 )
    } );

    // Additional description that is visible when the Second Language control is disabled.
    super( {
      visible: visible,
      children: [ toDisplayASecondLanguageText, urlText ],
      spacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING,
      align: 'left'
    } );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

numberSuiteCommon.register( 'SecondLanguageControl', SecondLanguageControl );
