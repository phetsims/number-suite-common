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

class NumberSuiteCommonSpeechSynthesisAnnouncer extends SpeechSynthesisAnnouncer {

  private readonly updateVoiceListener: ( () => void ) | null;
  private readonly secondLocaleProperty: TReadOnlyProperty<Locale>;
  public readonly voiceEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor( isPrimaryLocaleProperty: TReadOnlyProperty<boolean>,
                      secondLocaleProperty: TReadOnlyProperty<Locale>
  ) {
    super();

    this.updateVoiceListener = () => this.updateVoice();
    this.secondLocaleProperty = secondLocaleProperty;

    this.voiceEnabledProperty = new DerivedProperty( [ this.voiceProperty ],
      ( voice: SpeechSynthesisVoice | null ) => !!voice );

    // When the SpeechSynthesisAnnouncer becomes initialized or when voices change, update the voice
    // currently being used by this Announcer.
    this.voicesProperty.lazyLink( this.updateVoiceListener );
    this.isInitializedProperty.link( initialized => {
      if ( initialized ) {
        this.updateVoice();
      }
    } );

    // Update the voice when the primary locale, secondary locale, or which of the two we are choosing changes.
    Multilink.multilink( [ isPrimaryLocaleProperty, localeProperty, secondLocaleProperty ], isPrimaryLocale => {
      this.updateVoice( isPrimaryLocale );
    } );
  }

  /**
   * Given if we should use the primary or secondary locale, set the voice of that locale.
   */
  public updateVoice( isPrimaryLocale = true ): void {

    const locale = isPrimaryLocale ? localeProperty.value : this.secondLocaleProperty.value;
    assert && assert( locale, `locale does not exist: ${locale}` );

    // in case we don't have any voices yet, wait until the voicesProperty is populated
    if ( this.initialized && this.voicesProperty.value.length > 0 ) {
      const translatedVoices = this.getPrioritizedVoicesForLocale( locale );
      if ( translatedVoices.length > 0 ) {
        this.voiceProperty.value = translatedVoices[ 0 ];
      }
      else {
        this.voiceProperty.value = null;
      }
    }
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonSpeechSynthesisAnnouncer', NumberSuiteCommonSpeechSynthesisAnnouncer );
export default NumberSuiteCommonSpeechSynthesisAnnouncer;
