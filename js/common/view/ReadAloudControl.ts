// Copyright 2022-2023, University of Colorado Boulder

/**
 * A toggle control in the Preferences Dialog that controls whether the sim automatically reads the current total out loud
 * when it changes. It also includes a warning message below the toggle control that shows if there are no available
 * voices for either of the selected locales.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import { Color, Node, Path, Text, VBox } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';

export default class ReadAloudControl<T extends NumberSuiteCommonPreferences,
  A extends NumberSuiteCommonSpeechSynthesisAnnouncer> extends Node {

  public constructor( preferences: T,
                      speechSynthesisAnnouncer: A,
                      labelStringProperty: TReadOnlyProperty<string>,
                      descriptionStringProperty: TReadOnlyProperty<string>,
                      visible: boolean ) {

    super( {
      visible: visible
    } );

    const toggleSwitch = new ToggleSwitch( preferences.readAloudProperty, false, true,
      PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    const control = new PreferencesControl( {
      labelNode: new Text( labelStringProperty, {
        fontSize: NumberSuiteCommonConstants.PREFERENCES_FONT_SIZE,
        fontWeight: 'bold'
      } ),
      descriptionNode: new Text( descriptionStringProperty, {
        fontSize: NumberSuiteCommonConstants.PREFERENCES_FONT_SIZE
      } ),
      controlNode: toggleSwitch,
      ySpacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING
    } );
    this.addChild( control );

    const missingVoiceWarningTextOptions = {
      font: new PhetFont( 14 )
    };
    const noDeviceFoundDescriptionText = new Text( NumberSuiteCommonStrings.noDeviceFoundDescriptionStringProperty,
      missingVoiceWarningTextOptions );
    const yourDeviceMaySupportDescriptionText = new Text( NumberSuiteCommonStrings.yourDeviceMaySupportDescriptionStringProperty,
      missingVoiceWarningTextOptions );

    const missingVoiceWarning = new Node();
    const missingVoiceWarningMessage = new VBox( {
      children: [ noDeviceFoundDescriptionText, yourDeviceMaySupportDescriptionText ],
      spacing: 8,
      align: 'left'
    } );
    missingVoiceWarning.addChild( missingVoiceWarningMessage );

    const warningIcon = new Path( exclamationTriangleSolidShape, {
      fill: new Color( 240, 79, 79 ),
      maxWidth: 30
    } );
    missingVoiceWarning.addChild( warningIcon );
    this.addChild( missingVoiceWarning );

    missingVoiceWarningMessage.left = control.left;
    warningIcon.centerX = missingVoiceWarningMessage.centerX;
    missingVoiceWarning.top = control.bottom + 24;
    missingVoiceWarningMessage.top = warningIcon.bottom + 14;

    Multilink.multilink( [
        preferences.readAloudProperty,
        preferences.showSecondLocaleProperty,
        speechSynthesisAnnouncer.primaryLocaleVoiceEnabledProperty,
        speechSynthesisAnnouncer.secondaryLocaleVoiceEnabledProperty
      ],
      ( readAloud, showSecondLocale, primaryLocaleVoiceEnabled, secondaryLocaleVoiceEnabled ) => {
        missingVoiceWarning.visible = showSecondLocale ?
                                      readAloud && ( !primaryLocaleVoiceEnabled || !secondaryLocaleVoiceEnabled ) :
                                      readAloud && !primaryLocaleVoiceEnabled;
      } );
  }
}

numberSuiteCommon.register( 'ReadAloudControl', ReadAloudControl );