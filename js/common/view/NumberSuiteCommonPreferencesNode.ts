// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferencesNode is the user interface for sim-specific preferences for all Number suite sims,
 * accessed via the Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { allowLinksProperty, HBox, Node, RichText, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import SecondLocaleSelectorCarousel from './SecondLocaleSelectorCarousel.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import LabScreen from '../../lab/LabScreen.js';
import Screen from '../../../../joist/js/Screen.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { availableRuntimeLocales } from '../../../../joist/js/i18n/localeProperty.js';

// constants
const FONT_SIZE = 16;
const CONTROL_TEXT_OPTIONS = {
  fontSize: FONT_SIZE
};
const CONTROL_TEXT_BOLD_OPTIONS = {
  fontSize: FONT_SIZE,
  fontWeight: 'bold'
};
const CONTROL_DESCRIPTION_SPACING = 5;
const V_BOX_SPACING = 15;
const V_BOX_OPTIONS: VBoxOptions = {
  align: 'left',
  spacing: V_BOX_SPACING
};
const ALL_URL = 'https://phet.colorado.edu/sims/html/number-play/latest/number-play_all.html';

// Number of locales that are available in the runtime.
const NUMBER_OF_LOCALES = availableRuntimeLocales.length;

export default abstract class NumberSuiteCommonPreferencesNode<T extends NumberSuiteCommonPreferences> extends HBox {

  public static readonly FONT_SIZE = FONT_SIZE;
  public static readonly CONTROL_TEXT_OPTIONS = CONTROL_TEXT_OPTIONS;
  public static readonly CONTROL_TEXT_BOLD_OPTIONS = CONTROL_TEXT_BOLD_OPTIONS;
  public static readonly CONTROL_DESCRIPTION_SPACING = CONTROL_DESCRIPTION_SPACING;
  public static readonly V_BOX_SPACING = V_BOX_SPACING;
  public static readonly V_BOX_OPTIONS = V_BOX_OPTIONS;
  protected readonly showSecondLocaleControl: Node;
  protected readonly showLabOnesControl: Node;

  protected constructor( preferences: T, additionalControls: Node[] ) {

    super( {
      spacing: 40,
      align: 'top'
    } );

    const showSecondLocaleToggleSwitch = new ToggleSwitch( preferences.showSecondLocaleProperty, false, true,
      PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    const showSecondLocaleControl = new PreferencesControl( {
      labelNode: new Text( NumberSuiteCommonStrings.secondLanguageStringProperty, CONTROL_TEXT_BOLD_OPTIONS ),
      descriptionNode: new Text( NumberSuiteCommonStrings.secondLanguageDescriptionStringProperty, CONTROL_TEXT_OPTIONS ),
      enabled: ( NUMBER_OF_LOCALES > 1 ), // disabled if we do not have multiple locales available
      ySpacing: CONTROL_DESCRIPTION_SPACING,
      controlNode: showSecondLocaleToggleSwitch
    } );

    const toDisplayASecondLanguageText = new RichText( NumberSuiteCommonStrings.toDisplayASecondLanguageDescriptionStringProperty, {
      font: new PhetFont( 12 )
    } );

    // If links are not allowed, show the URL as plain text.
    const urlStringProperty = new DerivedProperty( [ allowLinksProperty ],
      allowLinks => allowLinks ? `<a href="{{url}}">${ALL_URL}</a>` : ALL_URL
    );
    const urlText = new RichText( urlStringProperty, {
      links: { url: ALL_URL },
      font: new PhetFont( 12 )
    } );

    // Additional description that is visible when the Second Language control is disabled.
    const additionalDescription = new VBox( {
      visible: !showSecondLocaleControl.enabled,
      children: [ toDisplayASecondLanguageText, urlText ],
      spacing: CONTROL_DESCRIPTION_SPACING,
      align: 'left'
    } );

    this.showSecondLocaleControl = new VBox( {
      children: [ showSecondLocaleControl, additionalDescription ],
      spacing: CONTROL_DESCRIPTION_SPACING,
      align: 'left'
    } );

    const secondLocaleSelectorNode = new SecondLocaleSelectorCarousel( preferences );

    const leftControls = new VBox( {
      children: [ this.showSecondLocaleControl, secondLocaleSelectorNode ],
      excludeInvisibleChildrenFromBounds: false,
      align: 'center',
      spacing: V_BOX_SPACING
    } );

    const showLabOnesToggleSwitch = new ToggleSwitch( preferences.showLabOnesProperty, false, true,
      PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    this.showLabOnesControl = new PreferencesControl( {
      labelNode: new Text( NumberSuiteCommonStrings.showOnesStringProperty, CONTROL_TEXT_BOLD_OPTIONS ),
      descriptionNode: new Text( NumberSuiteCommonStrings.showOnesDescriptionStringProperty, CONTROL_TEXT_OPTIONS ),
      ySpacing: CONTROL_DESCRIPTION_SPACING,
      controlNode: showLabOnesToggleSwitch
    } );

    const rightControls = new VBox( combineOptions<VBoxOptions>( {
      children: [ ...additionalControls, this.showLabOnesControl ]
    }, V_BOX_OPTIONS ) );

    this.children = [ leftControls, rightControls ];

    // disable showLabOnesControl if there is no LabScreen
    this.showLabOnesControl.enabled = NumberSuiteCommonPreferencesNode.hasScreenType( LabScreen );
  }

  /**
   * Determines whether the sim is running with a screen of the specified type.
   */
  protected static hasScreenType( constructor: new ( ...args: IntentionalAny[] ) => Screen ): boolean {
    return ( _.find( phet.joist.sim.screens, screen => screen instanceof constructor ) !== undefined );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferencesNode', NumberSuiteCommonPreferencesNode );