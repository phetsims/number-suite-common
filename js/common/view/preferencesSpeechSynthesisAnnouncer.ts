// Copyright 2023, University of Colorado Boulder

/**
 * An Announcer for speech synthesis that can be used with an UtteranceQueue. This announcer is specifically used for
 * the preferences in Number Suite sims, not general Number Suite sim usage.
 *
 * Not usable until initialized after the sim is created. See number-play-main.ts and number-compare.ts.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import SpeechSynthesisAnnouncer from '../../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';

const preferencesSpeechSynthesisAnnouncer = new SpeechSynthesisAnnouncer();

numberSuiteCommon.register( 'preferencesSpeechSynthesisAnnouncer', preferencesSpeechSynthesisAnnouncer );
export default preferencesSpeechSynthesisAnnouncer;