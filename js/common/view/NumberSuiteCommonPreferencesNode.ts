// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferencesNode is the user interface for sim-specific preferences for all Number suite sims,
 * accessed via the Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { HBox, Node, RichText, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import SecondLocaleSelectorCarousel from './SecondLocaleSelectorCarousel.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';

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
      ySpacing: CONTROL_DESCRIPTION_SPACING,
      controlNode: showSecondLocaleToggleSwitch
    } );

    // TODO: factor out this string if we like this, https://github.com/phetsims/number-suite-common/issues/26
    const loadAllHtmlText = new RichText(
      'To display a second language, run the <a href="{{url}}">“all” version</a> of Number Play.', {
        font: new PhetFont( 12 ),
        links: { url: 'https://phet.colorado.edu/sims/html/number-play/latest/number-play_all.html' },
        visible: false
      } );
    this.showSecondLocaleControl = new VBox( {
      children: [ showSecondLocaleControl, loadAllHtmlText ],
      spacing: CONTROL_DESCRIPTION_SPACING,
      align: 'left'
    } );

    // disable the second locale toggle and show the all_html link if there's only one locale available
    if ( !NumberSuiteCommonPreferences.SECOND_LOCALE_SELECTION_AVAILABLE ) {
      showSecondLocaleControl.enabled = false;
      loadAllHtmlText.visible = true;
    }

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
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferencesNode', NumberSuiteCommonPreferencesNode );