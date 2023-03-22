// Copyright 2023, University of Colorado Boulder

/**
 * A subclass of UtteranceQueue that is used for voicing specific to Number Suite sims. This is needed because
 * Number Sims don't have the Voicing feature, but they still need to use speech synthesis.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import UtteranceQueue from '../../../../utterance-queue/js/UtteranceQueue.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';

// constants
const ONE_TWO_THREE_STRING_KEY = `${NumberSuiteCommonConstants.NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE}/oneTwoThree`;

// This reference exists to ensure that the string from the string key above does not get stripped out of the sim
// during a build. Since we need to be able to get the string in ANY language requested (instead of the language that
// the sim is running in), we can't use this string Property like normal.
NumberSuiteCommonStrings.oneTwoThreeStringProperty;

export default abstract class NumberSuiteCommonUtteranceQueue extends UtteranceQueue<NumberSuiteCommonSpeechSynthesisAnnouncer> {

  // Data that can be spoken to the user. The data comes from the screen that is currently being interacted with.
  private speechDataProperty: TReadOnlyProperty<string | null> | null;

  // Whether this class has been initialized.
  private initialized: boolean;

  // See doc in NumberSuiteCommonPreferences.
  private readonly readAloudProperty: TReadOnlyProperty<boolean>;

  // The Utterance used for speaking speechData.
  private readonly speechDataUtterance: Utterance;

  // The Utterance used for speaking when the user is testing a voice in Preferences.
  private readonly testVoiceUtterance: Utterance;

  // Whether the test voice is currently speaking.
  private isTestVoiceSpeaking: boolean;

  protected constructor(
    numberSuiteCommonAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
    readAloudProperty: TReadOnlyProperty<boolean>
  ) {
    super( numberSuiteCommonAnnouncer );

    this.speechDataProperty = null;
    this.initialized = false;
    this.readAloudProperty = readAloudProperty;

    this.speechDataUtterance = new Utterance( {
      priority: Utterance.DEFAULT_PRIORITY
    } );
    this.testVoiceUtterance = new Utterance( {
      priority: Utterance.HIGH_PRIORITY
    } );

    this.isTestVoiceSpeaking = false;
  }

  /**
   * Speaks the value of this.speechDataProperty.
   */
  public speakSpeechData(): void {
    assert && assert( this.initialized && this.speechDataProperty, 'Cannot speak before initialization' );
    const speechData = this.speechDataProperty!.value;

    speechData && this.announcer.voiceProperty.value && this.speak( speechData, this.speechDataUtterance );
  }

  /**
   * Speaks a 'test' string in the provided voice and locale. This temporarily sets the voice to read out the test
   * string, and then resets the voice to what it was before starting the test read.
   */
  public testVoiceBySpeaking( voiceToTest: SpeechSynthesisVoice, locale: Locale ): void {
    const currentVoice = this.announcer.voiceProperty.value;
    this.announcer.voiceProperty.value = voiceToTest;

    // Indicate when we are speaking with the test voice so we know if we should set the voice back to the non-testing
    // voice or not.
    this.isTestVoiceSpeaking = true;
    this.speak( this.getTestStringForLocale( locale ), this.testVoiceUtterance );
    this.isTestVoiceSpeaking = false;

    const resetVoiceListener = () => {
      if ( !this.isTestVoiceSpeaking ) {
        this.announcer.voiceProperty.value = currentVoice;
      }
      this.announcer.announcementCompleteEmitter.removeListener( resetVoiceListener );
    };

    // When the test speech is complete, set the voice back to what it was before testing, unless we have already
    // started speaking for a different test.
    this.announcer.announcementCompleteEmitter.addListener( resetVoiceListener );
  }

  /**
   * Speaks the provided string.
   */
  private speak( string: string, utterance: Utterance ): void {
    const voice = this.announcer.voiceProperty.value;
    assert && assert( voice, 'No voice set for voiceProperty: ', voice );

    utterance.alert = string;
    this.addToBack( utterance );
  }

  /**
   * Returns a test string in the provided locale. If the string isn't found in the desired locale, the english version
   * of the string is returned instead.
   */
  private getTestStringForLocale( locale: Locale ): string {
    const strings = phet.chipper.strings;
    const translatedStrings = strings[ locale ];
    const backupStrings = strings.en;

    const testString = translatedStrings && translatedStrings[ ONE_TWO_THREE_STRING_KEY ] ?
                       translatedStrings[ ONE_TWO_THREE_STRING_KEY ] : backupStrings[ ONE_TWO_THREE_STRING_KEY ];

    assert && assert( testString, `No test string found for locales ${locale} or en.` );

    return testString;
  }

  /**
   * Initializes this UtteranceQueue by providing speechDataProperty to use for speaking.
   */
  protected initializeNumberSuiteCommonUtteranceQueue( speechDataProperty: TReadOnlyProperty<string | null> ): void {
    assert && assert( !this.initialized, 'Tried to initialize NumberSuiteCommonUtteranceQueue more than once.' );

    this.speechDataProperty = speechDataProperty;

    // Speak the speechData if readAloud is turned on or the speechData changes. Also check that the announcer has a
    // voice because even if the voiceProperty is set to null, the browser still speaks with a default voice.
    Multilink.lazyMultilink(
      [ this.readAloudProperty, this.speechDataProperty ], readAloud => readAloud && this.speakSpeechData()
    );

    this.initialized = true;
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonUtteranceQueue', NumberSuiteCommonUtteranceQueue );
