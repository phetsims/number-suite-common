// Copyright 2019-2023, University of Colorado Boulder

/**
 * Constants used commonly for Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

// types
type NumberToString = Record<number, string>;

// constants used for other constants
const NUMBER_TO_STRING_VALUE = {
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
} as NumberToString;

// TODO: Move strings from number-play to number-suite-common so we use NSC prefix here instead
const NUMBER_PLAY_STRING_KEY_PREFIX = 'NUMBER_PLAY/';

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
  numberToWord: ( numberPlaySecondaryStrings: IntentionalAny, number: number, isPrimaryLocale: boolean ): string => {
    const stringKey = NUMBER_TO_STRING_VALUE[ number ] as keyof typeof NumberSuiteCommonStrings;
    assert && assert( stringKey, `no stringKey found for number=${number}` );

    // TODO: This is relying on NumberSuiteCommonStrings having non-dynamic string keys at runtime. Is that okay?
    return isPrimaryLocale ? NumberSuiteCommonStrings[ stringKey ] :
           numberPlaySecondaryStrings[ `${NUMBER_PLAY_STRING_KEY_PREFIX}${stringKey}` ];
  },

  NUMBER_PLAY_STRING_KEY_PREFIX: NUMBER_PLAY_STRING_KEY_PREFIX,

  UNGROUPED_STORED_COUNTING_OBJECT_SCALE: 0.9,
  GROUPED_STORED_COUNTING_OBJECT_SCALE: 0.7,
  COUNTING_OBJECT_SCALE: 1
};

numberSuiteCommon.register( 'NumberSuiteCommonConstants', NumberSuiteCommonConstants );
export default NumberSuiteCommonConstants;