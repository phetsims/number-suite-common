// Copyright 2023-2024, University of Colorado Boulder

/**
 * SpeechSynthesisControl is the control for speech synthesis. It groups SpeechSynthesisButton and
 * NoVoiceWarningButton, which should always appear together.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { NodeTranslationOptions, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NoVoiceWarningButton from './NoVoiceWarningButton.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';
import SpeechSynthesisButton, { SpeechSynthesisButtonOptions } from './SpeechSynthesisButton.js';

type SelfOptions = {

  // options propagated to (and required by) SpeechSynthesisButton
  speechSynthesisButtonOptions?: SpeechSynthesisButtonOptions;
};

type SpeechSynthesisControlOptions = SelfOptions & NodeTranslationOptions;

export default class SpeechSynthesisControl extends VBox {

  public constructor( speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
                      utteranceQueue: NumberSuiteCommonUtteranceQueue,
                      providedOptions: SpeechSynthesisControlOptions ) {

    const options = optionize<SpeechSynthesisControlOptions, SelfOptions, VBoxOptions>()( {
      speechSynthesisButtonOptions: {},

      // VBoxOptions
      align: 'center',
      spacing: 12
    }, providedOptions );

    const speechSynthesisButton = new SpeechSynthesisButton(
      speechSynthesisAnnouncer,
      utteranceQueue,
      options.speechSynthesisButtonOptions
    );

    const noVoiceWarningButton = new NoVoiceWarningButton( speechSynthesisAnnouncer.hasVoiceProperty );

    options.children = [ speechSynthesisButton, noVoiceWarningButton ];

    super( options );
  }
}

numberSuiteCommon.register( 'SpeechSynthesisControl', SpeechSynthesisControl );