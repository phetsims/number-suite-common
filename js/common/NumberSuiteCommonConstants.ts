// Copyright 2019-2023, University of Colorado Boulder

/**
 * Constants used commonly for Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import LinkableProperty from '../../../axon/js/LinkableProperty.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';
import { SecondLocaleStrings } from './model/NumberSuiteCommonPreferences.js';

// Maps a number to the key used to look up the translated word that corresponds to the number.
const NUMBER_TO_STRING_KEY_SECONDARY: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty'
} as Record<number, string>;


const NUMBER_TO_STRING_KEY_PRIMARY: Record<number, LinkableProperty<string>> = {
  0: NumberSuiteCommonStrings.zeroStringProperty,
  1: NumberSuiteCommonStrings.oneStringProperty,
  2: NumberSuiteCommonStrings.twoStringProperty,
  3: NumberSuiteCommonStrings.threeStringProperty,
  4: NumberSuiteCommonStrings.fourStringProperty,
  5: NumberSuiteCommonStrings.fiveStringProperty,
  6: NumberSuiteCommonStrings.sixStringProperty,
  7: NumberSuiteCommonStrings.sevenStringProperty,
  8: NumberSuiteCommonStrings.eightStringProperty,
  9: NumberSuiteCommonStrings.nineStringProperty,
  10: NumberSuiteCommonStrings.tenStringProperty,
  11: NumberSuiteCommonStrings.elevenStringProperty,
  12: NumberSuiteCommonStrings.twelveStringProperty,
  13: NumberSuiteCommonStrings.thirteenStringProperty,
  14: NumberSuiteCommonStrings.fourteenStringProperty,
  15: NumberSuiteCommonStrings.fifteenStringProperty,
  16: NumberSuiteCommonStrings.sixteenStringProperty,
  17: NumberSuiteCommonStrings.seventeenStringProperty,
  18: NumberSuiteCommonStrings.eighteenStringProperty,
  19: NumberSuiteCommonStrings.nineteenStringProperty,
  20: NumberSuiteCommonStrings.twentyStringProperty
};

// RequireJS namespace, used for looking up translated strings
const NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE = 'NUMBER_SUITE_COMMON';

const NumberSuiteCommonConstants = {

  TEN: 10, // used for organizing things into group of ten
  TWENTY: 20, // used for formatting a number display

  PAPER_NUMBER_INITIAL_VALUE: 1, // the initial value of every created countingObject

  // accordion box sizing

  TOTAL_ACCORDION_BOX_WIDTH: 199,           // width of the 'Total' accordion box

  // sizing for the 'lower' accordion boxes, which include the 'Ones' and 'Objects' accordion boxes
  LOWER_ACCORDION_BOX_TITLE_MAX_WIDTH: 332, // max width of the title of all lower accordion boxes
  TALL_LOWER_ACCORDION_BOX_HEIGHT: 468,     // height of the 'lower' accordion boxes on the 'Twenty' and 'Compare' screens

  // layout
  SCREEN_VIEW_PADDING_X: 15,                // minimum x-distance any node is positioned from the edges of the sim
  SCREEN_VIEW_PADDING_Y: 15,                // minimum y-distance any node is positioned from the edges of the sim
  ACCORDION_BOX_MARGIN_X: 72,               // distance between the sides of the sim and all adjacent accordion boxes

  // options for all AccordionBox instances
  ACCORDION_BOX_TITLE_FONT: new PhetFont( 16 ),

  /**
   * Maps an integer to the translated word for that integer.
   */
  numberToWord: ( numberPlaySecondaryStrings: SecondLocaleStrings, number: number, isPrimaryLocale: boolean ): string => {
    const string = isPrimaryLocale ?
                   NUMBER_TO_STRING_KEY_PRIMARY[ number ].value :
                   numberPlaySecondaryStrings[ `${NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE}/${NUMBER_TO_STRING_KEY_SECONDARY[ number ]}` ];
    assert && assert( string, `no stringKey found for number=${number}` );

    return string;
  },

  UNGROUPED_STORED_COUNTING_OBJECT_SCALE: 0.9,
  GROUPED_STORED_COUNTING_OBJECT_SCALE: 0.7,
  COUNTING_OBJECT_SCALE: 1,

  // Preferences dialog controls
  PREFERENCES_FONT_SIZE: 16,
  PREFERENCES_VBOX_SPACING: 15,
  PREFERENCES_DESCRIPTION_Y_SPACING: 5
};

numberSuiteCommon.register( 'NumberSuiteCommonConstants', NumberSuiteCommonConstants );
export default NumberSuiteCommonConstants;