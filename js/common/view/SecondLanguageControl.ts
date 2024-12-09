// Copyright 2023-2024, University of Colorado Boulder

/**
 * SecondLanguageControl is the 'Second Language' control in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Disposable from '../../../../axon/js/Disposable.js';
import localeProperty, { LocaleProperty } from '../../../../joist/js/i18n/localeProperty.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { allowLinksProperty, RichText, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import LanguageAndVoiceControl from './LanguageAndVoiceControl.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';
import Property from '../../../../axon/js/Property.js';

type SelfOptions = EmptySelfOptions;
type SecondLanguageControlOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'>;

export default class SecondLanguageControl extends VBox {

  public constructor( secondLocaleProperty: LocaleProperty,
                      secondVoiceProperty: Property<SpeechSynthesisVoice | null>,
                      showSecondLocaleProperty: Property<boolean>,
                      isPrimaryLocaleProperty: Property<boolean>,
                      allURL: string, // URL to the {REPO}_all.html file for this simulation.
                      utteranceQueue: NumberSuiteCommonUtteranceQueue,
                      providedOptions?: SecondLanguageControlOptions ) {

    const options = optionize<SecondLanguageControlOptions, SelfOptions, VBoxOptions>()( {

      // VBoxOptions
      excludeInvisibleChildrenFromBounds: false,
      align: 'left',
      spacing: NumberSuiteCommonConstants.PREFERENCES_VBOX_SPACING
    }, providedOptions );

    const labelText = new Text( NumberSuiteCommonStrings.secondLanguageStringProperty,
      PreferencesDialogConstants.CONTROL_LABEL_OPTIONS );

    const descriptionText = new Text( NumberSuiteCommonStrings.secondLanguageDescriptionStringProperty,
      PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS );

    const toggleSwitch = new ToggleSwitch( showSecondLocaleProperty, false, true,
      PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    // Control for showing or hiding the languageAndVoiceControl
    const preferencesControl = new PreferencesControl( {
      labelNode: labelText,
      descriptionNode: descriptionText,
      controlNode: toggleSwitch,
      enabled: localeProperty.supportsDynamicLocale, // disabled if we do not have multiple locales available
      ySpacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING
    } );

    // Additional description that is visible when the Second Language control is disabled.
    const additionalDescriptionNode = new AdditionalDescriptionNode( !preferencesControl.enabled, allURL );

    // Control for choosing a second language and associated voice
    const languageAndVoiceControl = new LanguageAndVoiceControl( secondLocaleProperty, secondVoiceProperty, utteranceQueue, {
      visibleProperty: showSecondLocaleProperty
    } );

    options.children = [
      new VBox( {
        children: [ preferencesControl, additionalDescriptionNode ],
        spacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING,
        align: 'left'
      } ),
      languageAndVoiceControl
    ];

    super( options );

    // If we turn off the secondLocale, switch back to the primary locale.
    showSecondLocaleProperty.lazyLink( showSecondLocale => {
      if ( !showSecondLocale ) {
        isPrimaryLocaleProperty.value = true;

        // When we turn off the second locale and switch back to the primary locale, if autoHear is on, the speechData
        // is spoken in NumberCompare because it changed from a language change. For consistency with Number Play,
        // cancel the speech instead.
        utteranceQueue.cancelSpeechDataSpeaking();
      }
    } );
  }

  public override dispose(): void {
    Disposable.assertNotDisposable();
    super.dispose();
  }
}

/**
 * Additional description that is displayed below the 'Second Language' toggle switch when we do not have
 * multiple locales. It instructs the user how to run the version of the sim that supports multiple locales.
 * If allowLinks is true, a hyperlink to the 'all' version of the sim is included.
 */
class AdditionalDescriptionNode extends VBox {

  /**
   * @param visible
   * @param allURL - URL to the {REPO}_all.html file for this simulation.
   */
  public constructor( visible: boolean, allURL: string ) {

    const toDisplayASecondLanguageText = new RichText( NumberSuiteCommonStrings.toDisplayASecondLanguageDescriptionStringProperty, {
      font: new PhetFont( 12 ),
      maxWidth: PreferencesDialog.CONTENT_MAX_WIDTH
    } );

    // If links are not allowed, show the URL as plain text.
    const urlStringProperty = new DerivedProperty( [ allowLinksProperty ],
      allowLinks => allowLinks ? `<a href="{{url}}">${allURL}</a>` : allURL
    );
    const urlText = new RichText( urlStringProperty, {
      links: { url: allURL },
      font: new PhetFont( 12 ),
      maxWidth: PreferencesDialog.CONTENT_MAX_WIDTH
    } );

    // Additional description that is visible when the Second Language control is disabled.
    super( {
      visible: visible,
      children: [ toDisplayASecondLanguageText, urlText ],
      spacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING,
      align: 'left'
    } );
  }

  public override dispose(): void {
    Disposable.assertNotDisposable();
    super.dispose();
  }
}

numberSuiteCommon.register( 'SecondLanguageControl', SecondLanguageControl );