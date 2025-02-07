// Copyright 2023-2024, University of Colorado Boulder

/**
 * SpeechSynthesisControl is the control for speech synthesis. It groups SpeechSynthesisButton and
 * NoVoiceWarningButton, which should always appear together.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import VBox, { VBoxOptions } from '../../../../scenery/js/layout/nodes/VBox.js';
import { NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NoVoiceWarningButton, { NoVoiceWarningButtonOptions } from './NoVoiceWarningButton.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';
import SpeechSynthesisButton, { SpeechSynthesisButtonOptions } from './SpeechSynthesisButton.js';

type SelfOptions = {

  // options propagated to (and required by) SpeechSynthesisButton
  speechSynthesisButtonOptions?: SpeechSynthesisButtonOptions;

  // options propagated to (and required by) NoVoiceWarningButton
  noVoiceWarningButtonOptions?: NoVoiceWarningButtonOptions;
};

type SpeechSynthesisControlOptions = SelfOptions & NodeTranslationOptions & PickOptional<NodeOptions, 'tandem'>;

export default class SpeechSynthesisControl extends VBox {

  public constructor( speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
                      utteranceQueue: NumberSuiteCommonUtteranceQueue,
                      providedOptions: SpeechSynthesisControlOptions ) {

    const options = optionize<SpeechSynthesisControlOptions, SelfOptions, VBoxOptions>()( {
      speechSynthesisButtonOptions: {
        tandem: providedOptions.tandem?.createTandem( 'speechSynthesisButton' )
      },
      noVoiceWarningButtonOptions: {
        tandem: providedOptions.tandem?.createTandem( 'noVoiceWarningButton' )
      },

      // VBoxOptions
      align: 'center',
      spacing: 12
    }, providedOptions );

    const speechSynthesisButton = new SpeechSynthesisButton(
      speechSynthesisAnnouncer,
      utteranceQueue,
      options.speechSynthesisButtonOptions
    );

    const noVoiceWarningButton = new NoVoiceWarningButton(
      speechSynthesisAnnouncer.hasVoiceProperty,
      options.noVoiceWarningButtonOptions
    );

    options.children = [ speechSynthesisButton, noVoiceWarningButton ];

    super( options );
  }
}

numberSuiteCommon.register( 'SpeechSynthesisControl', SpeechSynthesisControl );