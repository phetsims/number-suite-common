// Copyright 2022, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferencesNode is the user interface for sim-specific preferences for all Number suite sims,
 * accessed via the Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { HBox, Node, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import numberPlay from '../../numberPlay.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import PreferencesToggleSwitch from '../../../../joist/js/preferences/PreferencesToggleSwitch.js';
import SecondLocaleSelectorCarousel from './SecondLocaleSelectorCarousel.js';
import NumberPlayStrings from '../../NumberPlayStrings.js';

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

  protected constructor( preferences: T, additionalControls: Node[] ) {

    super( {
      spacing: 40,
      align: 'top'
    } );

    const readAloudToggleSwitch = new PreferencesToggleSwitch( preferences.readAloudProperty, false, true, {
      labelNode: new Text( NumberPlayStrings.readAloudStringProperty, CONTROL_TEXT_BOLD_OPTIONS ),
      descriptionNode: new Text( NumberPlayStrings.readAloudDescriptionStringProperty, CONTROL_TEXT_OPTIONS ),
      descriptionSpacing: CONTROL_DESCRIPTION_SPACING
    } );
    const showSecondLocaleProperty = new PreferencesToggleSwitch( preferences.showSecondLocaleProperty, false, true, {
      labelNode: new Text( NumberPlayStrings.secondLanguageStringProperty, CONTROL_TEXT_BOLD_OPTIONS ),
      descriptionNode: new Text( NumberPlayStrings.secondLanguageDescriptionStringProperty, CONTROL_TEXT_OPTIONS ),
      descriptionSpacing: CONTROL_DESCRIPTION_SPACING
    } );
    const generalControls = new VBox( combineOptions<VBoxOptions>( {
      children: [ readAloudToggleSwitch, showSecondLocaleProperty ]
    }, V_BOX_OPTIONS ) );

    const secondLocaleSelectorNode = new SecondLocaleSelectorCarousel();
    preferences.showSecondLocaleProperty.link( showSecondLocale => {
      secondLocaleSelectorNode.visible = showSecondLocale;
    } );

    const leftControls = new VBox( {
      children: [ generalControls, secondLocaleSelectorNode ],
      excludeInvisibleChildrenFromBounds: false,
      align: 'center',
      spacing: V_BOX_SPACING
    } );

    const showLabOnesToggleSwitch = new PreferencesToggleSwitch( preferences.showLabOnesProperty, false, true, {
      labelNode: new Text( NumberPlayStrings.showOnesStringProperty, CONTROL_TEXT_BOLD_OPTIONS ),
      descriptionNode: new Text( NumberPlayStrings.showOnesDescriptionStringProperty, CONTROL_TEXT_OPTIONS ),
      descriptionSpacing: CONTROL_DESCRIPTION_SPACING
    } );
    const rightControls = new VBox( combineOptions<VBoxOptions>( {
      children: [ ...additionalControls, showLabOnesToggleSwitch ]
    }, V_BOX_OPTIONS ) );

    this.children = [ leftControls, rightControls ];
  }
}

numberPlay.register( 'NumberSuiteCommonPreferencesNode', NumberSuiteCommonPreferencesNode );