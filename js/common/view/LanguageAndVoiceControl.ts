// Copyright 2023, University of Colorado Boulder

/**
 * LanguageAndVoiceControl contains two carousels: one for selecting a language, and one for selecting a voice. For use
 * in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberSuiteCommon from '../../numberSuiteCommon.js';
import { HBox, HBoxOptions, Node, RichText, RichTextOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import Property from '../../../../axon/js/Property.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Carousel, { CarouselItem, CarouselOptions } from '../../../../sun/js/Carousel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import TProperty from '../../../../axon/js/TProperty.js';
import LanguageAndVoiceSelectionNode from './LanguageAndVoiceSelectionNode.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';

const LABEL_TEXT_OPTIONS = {
  fontWeight: 'bold',
  fontSize: 16
};
const CAROUSEL_OPTIONS: CarouselOptions = {
  itemsPerPage: 10,
  spacing: 6,
  margin: 5,
  orientation: 'vertical'
};
const LABEL_Y_SPACING = 10;

type SelfOptions = EmptySelfOptions;
type LanguageAndVoiceControlOptions = SelfOptions & StrictOmit<HBoxOptions, 'children'>;

type LanguageCarouselItem = { locale: Locale } & CarouselItem;
type VoiceCarouselItem = { voice: SpeechSynthesisVoice } & CarouselItem;

export default class LanguageAndVoiceControl extends HBox {

  public constructor( localeProperty: Property<Locale>,
                      voiceProperty: TProperty<SpeechSynthesisVoice | null>,
                      speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
                      providedOptions?: LanguageAndVoiceControlOptions ) {

    const options = optionize<LanguageAndVoiceControlOptions, SelfOptions, HBoxOptions>()( {

      // HBoxOptions
      excludeInvisibleChildrenFromBounds: false,
      align: 'top',
      justify: 'left',
      spacing: 10
    }, providedOptions );

    const languageCarouselLabel = new Text( NumberSuiteCommonStrings.languageStringProperty, LABEL_TEXT_OPTIONS );

    // Carousel for choosing a language.
    const languageCarouselItems: LanguageCarouselItem[] = localeProperty.validValues!.map(
      locale => {
        return {
          locale: locale,
          createNode: ( tandem: Tandem ) =>
            new LanguageAndVoiceSelectionNode(
              localeProperty,
              locale,
              StringUtils.localeToLocalizedName( locale ),
              `${locale}`
            )
        };
      } );
    const languageCarousel = new Carousel( languageCarouselItems, CAROUSEL_OPTIONS );

    // Scroll the carousel so that the initial selection is shown. See https://github.com/phetsims/number-suite-common/issues/38
    const selectedNode = _.find( languageCarouselItems, item => item.locale === localeProperty.value )!;
    assert && assert( selectedNode );
    languageCarousel.scrollToItem( selectedNode );

    // Record the width of the language carousel for use to ensure the voice column matches.
    const languageCarouselWidth = languageCarousel.width;

    // Carousel for choosing a voice. Recreated when the language changes.
    let voiceCarousel: Node | Carousel = new Node();
    const voiceCarouselLabel = new Text( NumberSuiteCommonStrings.voiceStringProperty, LABEL_TEXT_OPTIONS );
    const noVoiceDescriptionNode = new NoVoiceDescriptionNode( languageCarouselWidth );

    const voiceControlVBox = new VBox( {
      children: [ voiceCarouselLabel, voiceCarousel ],
      spacing: LABEL_Y_SPACING,
      align: 'left',
      layoutOptions: {
        minContentWidth: languageCarouselWidth
      }
    } );

    options.children = [
      new VBox( {
        children: [ languageCarouselLabel, languageCarousel ],
        spacing: LABEL_Y_SPACING,
        align: 'left'
      } ),
      voiceControlVBox
    ];

    super( options );

    // Rebuild the voiceCarousel with the available voices when the locale changes
    localeProperty.link( locale => {

      // TODO: consider way of remembering the users preference for this locale https://github.com/phetsims/number-suite-common/issues/47
      speechSynthesisAnnouncer.setFirstAvailableVoiceForLocale( locale, voiceProperty );
      const availableVoicesForLocale = speechSynthesisAnnouncer.getPrioritizedVoicesForLocale( locale );

      if ( availableVoicesForLocale.length ) {
        const voiceCarouselItems: VoiceCarouselItem[] = availableVoicesForLocale.map(
          voice => {
            return {
              voice: voice,
              createNode: ( tandem: Tandem ) => new LanguageAndVoiceSelectionNode( voiceProperty, voice, voice.name, voice.lang )
            };
          } );

        voiceCarousel.dispose();
        voiceCarousel = new Carousel( voiceCarouselItems, CAROUSEL_OPTIONS );

        // Set the children so the new carousel is visible.
        voiceControlVBox.children = [ voiceCarouselLabel, voiceCarousel ];
      }
      else {

        // No available voices, so set the children so the noVoicesFoundDescriptionNode is visible instead of the voices.
        voiceControlVBox.children = [ voiceCarouselLabel, noVoiceDescriptionNode ];
      }
    } );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

class NoVoiceDescriptionNode extends VBox {

  public constructor( width: number ) {

    const richTextOptions: RichTextOptions = {
      font: new PhetFont( 16 ),
      lineWrap: width
    };

    const noVoiceFoundDescriptionRichText = new RichText(
      NumberSuiteCommonStrings.noVoiceFoundDescriptionStringProperty, richTextOptions );

    const yourDeviceMaySupportDescriptionRichText = new RichText(
      NumberSuiteCommonStrings.yourDeviceMaySupportDescriptionStringProperty, richTextOptions );

    super( {
      children: [ noVoiceFoundDescriptionRichText, yourDeviceMaySupportDescriptionRichText ],
      spacing: 20,
      align: 'left'
    } );
  }

}

numberSuiteCommon.register( 'LanguageAndVoiceControl', LanguageAndVoiceControl );
