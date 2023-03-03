// Copyright 2023, University of Colorado Boulder

/**
 * A subclass of UtteranceQueue that is used for voicing specific to Number Suite sims. This is needed because
 * Number Sims don't have the Voicing feature, but they still need to use speech synthesis.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import UtteranceQueue from '../../../../utterance-queue/js/UtteranceQueue.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';

export default abstract class NumberSuiteCommonUtteranceQueue extends UtteranceQueue {

  // Data that can be spoken to the user. The data comes from the screen that is currently being interacted with.
  private speechDataProperty: TReadOnlyProperty<string | null> | null;

  // Whether this class has been initialized.
  private initialized: boolean;

  // The SpeechSynthesisAnnouncer used for this UtteranceQueue.
  public readonly numberSuiteCommonAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer;

  // See doc in NumberSuiteCommonPreferences.
  private readonly readAloudProperty: TReadOnlyProperty<boolean>;

  // The Utterance that this UtteranceQueue uses for speaking.
  private readonly speechUtterance: Utterance;

  protected constructor(
    numberSuiteCommonAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
    readAloudProperty: TReadOnlyProperty<boolean>
  ) {
    super( numberSuiteCommonAnnouncer );

    this.speechDataProperty = null;
    this.initialized = false;

    this.numberSuiteCommonAnnouncer = numberSuiteCommonAnnouncer;
    this.readAloudProperty = readAloudProperty;
    this.speechUtterance = new Utterance();
  }

  /**
   * Cancels any ongoing speech and speaks the value of this.speechDataProperty.
   */
  public speakSpeechData(): void {
    assert && assert( this.initialized && this.speechDataProperty, 'Cannot speak before initialization' );
    const speechData = this.speechDataProperty!.value;

    if ( speechData ) {
      this.speechUtterance.alert = speechData;

      this.cancelUtterance( this.speechUtterance );
      this.addToBack( this.speechUtterance );
    }
  }

  /**
   * Initializes this UtteranceQueue by providing speechDataProperty to use for speaking.
   */
  protected initializeNumberSuiteCommonUtteranceQueue( speechDataProperty: TReadOnlyProperty<string | null> ): void {
    assert && assert( !this.initialized, 'Tried to initialize NumberSuiteCommonUtteranceQueue more than once.' );

    this.speechDataProperty = speechDataProperty;

    // Speak the speechData if readAloud is turned on, the speechData changes, or the voice changes. Also check that
    // the announcer has a voice because even if the voiceProperty is set to null, the browser still speaks with a
    // default voice.
    Multilink.lazyMultilink(
      [ this.readAloudProperty, this.numberSuiteCommonAnnouncer.voiceProperty, this.speechDataProperty ],
      ( readAloud, voice ) => readAloud && !!voice && this.speakSpeechData()
    );

    this.initialized = true;
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonUtteranceQueue', NumberSuiteCommonUtteranceQueue );
