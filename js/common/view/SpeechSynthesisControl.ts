// Copyright 2023, University of Colorado Boulder

/**
 * SpeechSynthesisControl is the control for speech synthesis. It consists of 2 buttons. The top button trigger
 * reading of a number. The bottom button is made visible when the locale does not support reading, and pressing
 * it opens a dialog that explains the problem.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { NodeTranslationOptions, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import SpeechSynthesisButton, { SpeechSynthesisButtonOptions } from './SpeechSynthesisButton.js';
import MissingVoiceWarningButton from './MissingVoiceWarningButton.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import UtteranceQueue from '../../../../utterance-queue/js/UtteranceQueue.js';
import optionize from '../../../../phet-core/js/optionize.js';

type SelfOptions = {

  // options propagated to (and required by) SpeechSynthesisButton
  speechSynthesisButtonOptions: SpeechSynthesisButtonOptions;
};

type SpeechSynthesisControlOptions = SelfOptions & NodeTranslationOptions;

export default class SpeechSynthesisControl extends VBox {

  public constructor( isPrimaryLocaleProperty: TReadOnlyProperty<boolean>,
                      preferences: NumberSuiteCommonPreferences,
                      speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
                      numberPlayUtteranceQueue: UtteranceQueue,
                      providedOptions: SpeechSynthesisControlOptions ) {

    const options = optionize<SpeechSynthesisControlOptions, SelfOptions, VBoxOptions>()( {

      // VBoxOptions
      align: 'center',
      spacing: 12
    }, providedOptions );

    const speechSynthesisButton = new SpeechSynthesisButton( isPrimaryLocaleProperty, preferences,
      speechSynthesisAnnouncer, numberPlayUtteranceQueue, options.speechSynthesisButtonOptions );

    const missingVoiceWarningButton = new MissingVoiceWarningButton(
      isPrimaryLocaleProperty,
      speechSynthesisAnnouncer.primaryLocaleVoiceEnabledProperty,
      speechSynthesisAnnouncer.secondaryLocaleVoiceEnabledProperty
    );

    options.children = [ speechSynthesisButton, missingVoiceWarningButton ];

    super( options );
  }
}

numberSuiteCommon.register( 'SpeechSynthesisControl', SpeechSynthesisControl );