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

class NumberSuiteCommonSpeechSynthesisAnnouncer extends SpeechSynthesisAnnouncer {

  private readonly updateVoiceListener: ( () => void ) | null;
  private readonly secondLocaleProperty: TReadOnlyProperty<Locale>;
  public readonly primaryLocaleVoiceEnabledProperty: TReadOnlyProperty<boolean>;
  public readonly secondaryLocaleVoiceEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor( secondLocaleProperty: TReadOnlyProperty<Locale> ) {
    super();

    this.updateVoiceListener = () => this.updateVoice();
    this.secondLocaleProperty = secondLocaleProperty;

    this.primaryLocaleVoiceEnabledProperty = new DerivedProperty( [ localeProperty, this.voiceProperty ],
      ( locale: Locale ) => this.testVoiceForLocale( locale ) );

    this.secondaryLocaleVoiceEnabledProperty = new DerivedProperty( [ secondLocaleProperty, this.voiceProperty ],
      locale => this.testVoiceForLocale( locale ) );

    // When the SpeechSynthesisAnnouncer becomes initialized or when voices change, update the voice
    // currently being used by this Announcer.
    this.voicesProperty.lazyLink( this.updateVoiceListener );
    this.isInitializedProperty.link( initialized => {
      if ( initialized ) {
        this.updateVoice();
      }
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
      if ( translatedVoices.length ) {
        const translatedVoice = translatedVoices[ 0 ];
        this.voiceProperty.set( translatedVoice );
      }
    }
  }

  /**
   * Given a locale, see if a voice is available for speech synthesis in the same locale.
   */
  public testVoiceForLocale( locale: Locale ): boolean {
    let isVoiceFound = false;

    if ( this.initialized ) {

      const translatedVoices = this.getPrioritizedVoicesForLocale( locale );
      if ( translatedVoices.length ) {
        isVoiceFound = true;
      }
    }

    return isVoiceFound;
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonSpeechSynthesisAnnouncer', NumberSuiteCommonSpeechSynthesisAnnouncer );
export default NumberSuiteCommonSpeechSynthesisAnnouncer;