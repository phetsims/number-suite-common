// Copyright 2023, University of Colorado Boulder

/**
 * A subclass of UtteranceQueue that is used for voicing specific to voice preference controls in Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import UtteranceQueue from '../../../../utterance-queue/js/UtteranceQueue.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import SpeechSynthesisAnnouncer from '../../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';

const ONE_TWO_THREE_STRING_KEY = `${NumberSuiteCommonConstants.NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE}/oneTwoThree`;

export default class PreferencesUtteranceQueue extends UtteranceQueue {

  // The SpeechSynthesisAnnouncer used for this UtteranceQueue.
  private readonly speechSynthesisAnnouncer: SpeechSynthesisAnnouncer;

  // The Utterance that this UtteranceQueue uses for speaking.
  private readonly speechUtterance: Utterance;

  public constructor( speechSynthesisAnnouncer: SpeechSynthesisAnnouncer ) {
    super( speechSynthesisAnnouncer );

    this.speechSynthesisAnnouncer = speechSynthesisAnnouncer;
    this.speechUtterance = new Utterance();
  }

  /**
   * Cancels any ongoing speech and speaks a 'test' string in the provided voice and locale.
   */
  public testVoiceBySpeaking( voice: SpeechSynthesisVoice, locale: Locale ): void {

    this.speechSynthesisAnnouncer.voiceProperty.value = voice;

    this.speechUtterance.alert = this.getTestStringForLocale( locale );

    this.cancelUtterance( this.speechUtterance );
    this.addToBack( this.speechUtterance );
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
}

numberSuiteCommon.register( 'PreferencesUtteranceQueue', PreferencesUtteranceQueue );
