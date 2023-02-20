// Copyright 2022-2023, University of Colorado Boulder

/**
 * An Announcer for speech synthesis that can be used with an UtteranceQueue. Used in number-play
 * to support speaking numbers either when a "speak" button is pressed or when a value changes
 * with the ?readAloud query parameter.
 *
 * Not usable until initialized after the sim is created. See number-play-main.ts.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import SpeechSynthesisAnnouncer from '../../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import localeProperty, { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TProperty from '../../../../axon/js/TProperty.js';

class NumberSuiteCommonSpeechSynthesisAnnouncer extends SpeechSynthesisAnnouncer {

  private readonly updateVoiceListener: ( () => void ) | null;
  private readonly secondLocaleProperty: TReadOnlyProperty<Locale>;
  public readonly voiceEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor( isPrimaryLocaleProperty: TReadOnlyProperty<boolean>,
                      secondLocaleProperty: TReadOnlyProperty<Locale>,
                      primaryVoiceProperty: TProperty<SpeechSynthesisVoice | null>,
                      secondVoiceProperty: TProperty<SpeechSynthesisVoice | null>
  ) {
    super();

    this.updateVoiceListener = () => this.updateVoice( localeProperty.value, primaryVoiceProperty );
    this.secondLocaleProperty = secondLocaleProperty;

    this.voiceEnabledProperty = new DerivedProperty( [ this.voiceProperty ],
      ( voice: SpeechSynthesisVoice | null ) => !!voice );

    // When the SpeechSynthesisAnnouncer becomes initialized or when voices change, update the voice
    // currently being used by this Announcer.
    this.voicesProperty.lazyLink( this.updateVoiceListener );
    this.isInitializedProperty.link( initialized => {
      if ( initialized ) {
        this.updateVoice( localeProperty.value, primaryVoiceProperty );
      }
    } );

    // Update the voice when the primary locale, secondary locale, or which of the two we are choosing changes.
    Multilink.multilink( [ isPrimaryLocaleProperty, primaryVoiceProperty, secondVoiceProperty ],
      ( isPrimaryLocale, primaryVoice, secondVoice ) => {
      this.voiceProperty.value = isPrimaryLocale ? primaryVoice : secondVoice;
    } );
  }

  /**
   * Given if we should use the primary or secondary locale, set the voice of that locale for the provided Property.
   */
  public updateVoice( locale: Locale, voiceProperty: TProperty<SpeechSynthesisVoice | null> ): void {

    // in case we don't have any voices yet, wait until the voicesProperty is populated
    if ( this.initialized && this.voicesProperty.value.length > 0 ) {
      const translatedVoices = this.getPrioritizedVoicesForLocale( locale );
      if ( translatedVoices.length > 0 ) {
        voiceProperty.value = translatedVoices[ 0 ];
      }
      else {
        voiceProperty.value = null;
      }
    }
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonSpeechSynthesisAnnouncer', NumberSuiteCommonSpeechSynthesisAnnouncer );
export default NumberSuiteCommonSpeechSynthesisAnnouncer;
