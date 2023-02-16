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

  private speechDataProperty: TReadOnlyProperty<string | null> | null;
  private numberSuiteCommonAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer;
  private readonly speechUtterance: Utterance;
  private readonly readAloudProperty: TReadOnlyProperty<boolean>;
  private initialized: boolean;

  protected constructor( numberSuiteCommonAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
               readAloudProperty: TReadOnlyProperty<boolean>
  ) {
    super( numberSuiteCommonAnnouncer );

    this.speechDataProperty = null;
    this.numberSuiteCommonAnnouncer = numberSuiteCommonAnnouncer;
    this.readAloudProperty = readAloudProperty;
    this.speechUtterance = new Utterance();
    this.initialized = false;
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
   * Initialized this UtteranceQueue by providing speechDataProperty to use for speaking.
   */
  protected initializeNumberSuiteCommonUtteranceQueue( speechDataProperty: TReadOnlyProperty<string | null> ): void {
    assert && assert( !this.initialized, 'Tried to initialize NumberSuiteCommonUtteranceQueue more than once.' );

    this.speechDataProperty = speechDataProperty;

    // speak the speech data if the voice or speech data changes and readAloud is turned on
    Multilink.lazyMultilink( [ this.speechDataProperty, this.numberSuiteCommonAnnouncer.voiceProperty ], () => {
      this.readAloudProperty.value && this.speakSpeechData();
    } );

    this.initialized = true;
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonUtteranceQueue', NumberSuiteCommonUtteranceQueue );
