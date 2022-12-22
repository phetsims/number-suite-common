// Copyright 2019-2022, University of Colorado Boulder

/**
 * Constants defined for this simulation.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';
import { AccordionBoxOptions } from '../../../sun/js/AccordionBox.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

// strings
const zeroString = NumberSuiteCommonStrings.zero;
const oneString = NumberSuiteCommonStrings.one;
const twoString = NumberSuiteCommonStrings.two;
const threeString = NumberSuiteCommonStrings.three;
const fourString = NumberSuiteCommonStrings.four;
const fiveString = NumberSuiteCommonStrings.five;
const sixString = NumberSuiteCommonStrings.six;
const sevenString = NumberSuiteCommonStrings.seven;
const eightString = NumberSuiteCommonStrings.eight;
const nineString = NumberSuiteCommonStrings.nine;
const tenString = NumberSuiteCommonStrings.ten;
const elevenString = NumberSuiteCommonStrings.eleven;
const twelveString = NumberSuiteCommonStrings.twelve;
const thirteenString = NumberSuiteCommonStrings.thirteen;
const fourteenString = NumberSuiteCommonStrings.fourteen;
const fifteenString = NumberSuiteCommonStrings.fifteen;
const sixteenString = NumberSuiteCommonStrings.sixteen;
const seventeenString = NumberSuiteCommonStrings.seventeen;
const eighteenString = NumberSuiteCommonStrings.eighteen;
const nineteenString = NumberSuiteCommonStrings.nineteen;
const twentyString = NumberSuiteCommonStrings.twenty;

// types
type NumberToString = Record<number, string>;

const ACCORDION_BOX_OPTIONS: AccordionBoxOptions = {
  resize: true,
  titleAlignX: 'left',
  titleXSpacing: 8,
  showTitleWhenExpanded: false,
  cornerRadius: 6,
  titleYMargin: 10,
  buttonXMargin: 10,
  buttonYMargin: 10,
  contentXMargin: 10,
  contentYMargin: 0,
  contentXSpacing: 0,
  contentAlign: 'left',
  expandCollapseButtonOptions: {
    sideLength: 20
  }
};
const NUMBER_PLAY_STRING_KEY_PREFIX = 'NUMBER_PLAY/';

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

const NumberSuiteCommonConstants = {

  // the two defining numbers of this sim
  TEN: 10,
  TWENTY: 20,

  PAPER_NUMBER_INITIAL_VALUE: 1, // the initial value of every created countingObject

  // accordion box sizing for the 'Ten', 'Twenty', and 'Compare' screens

  // sizing for the 'upper' accordion boxes, which include the 'Number', 'Total', and 'Ten Frame' accordion boxes
  TOTAL_ACCORDION_BOX_WIDTH: 199,           // width of the 'Total' accordion box on all three screens
  UPPER_OUTER_ACCORDION_BOX_WIDTH: 308,     // width of the accordion boxes in the upper left and upper right of the
                                            // 'Ten' and 'Twenty' screens
  UPPER_OUTER_AB_TITLE_MAX_WIDTH: 254,      // max width of the title of the upper outer accordion boxes
  TEN_UPPER_ACCORDION_BOX_HEIGHT: 145,      // height of the upper accordion boxes on the 'Ten' screen
  TWENTY_UPPER_ACCORDION_BOX_HEIGHT: 98,    // height of the upper accordion boxes on the 'Twenty' screen

  // sizing for the 'lower' accordion boxes, which include the 'Ones' and 'Objects' accordion boxes
  LOWER_ACCORDION_BOX_TITLE_MAX_WIDTH: 332, // max width of the title of all lower accordion boxes
  LOWER_ACCORDION_BOX_CONTENT_WIDTH: 422,   // width of the 'lower' accordion box content on all screens
  TEN_LOWER_ACCORDION_BOX_HEIGHT: 420,      // height of the 'lower' accordion boxes on the 'Ten' screen
  TWENTY_LOWER_ACCORDION_BOX_HEIGHT: 468,   // height of the 'lower' accordion boxes on the 'Twenty' screen

  // layout
  SCREEN_VIEW_PADDING_X: 15,                // minimum x-distance any node is positioned from the edges of the sim
  SCREEN_VIEW_PADDING_Y: 15,                // minimum y-distance any node is positioned from the edges of the sim
  ACCORDION_BOX_MARGIN_X: 72,               // distance between the sides of the sim and all adjacent accordion boxes

  // options for all AccordionBox instances
  ACCORDION_BOX_OPTIONS: ACCORDION_BOX_OPTIONS,
  ACCORDION_BOX_TITLE_FONT: new PhetFont( 16 ),

  NUMBER_TO_STRING: {
    0: zeroString,
    1: oneString,
    2: twoString,
    3: threeString,
    4: fourString,
    5: fiveString,
    6: sixString,
    7: sevenString,
    8: eightString,
    9: nineString,
    10: tenString,
    11: elevenString,
    12: twelveString,
    13: thirteenString,
    14: fourteenString,
    15: fifteenString,
    16: sixteenString,
    17: seventeenString,
    18: eighteenString,
    19: nineteenString,
    20: twentyString
  } as NumberToString,

  // map number values to their corresponding string
  // TODO: type string map
  numberToString: ( numberPlaySecondaryStrings: IntentionalAny, number: number, isPrimaryLocale: boolean, prefix = NUMBER_PLAY_STRING_KEY_PREFIX ): string => {
    const stringKey = NUMBER_TO_STRING_VALUE[ number ];

    // @ts-expect-error
    return isPrimaryLocale ? NumberSuiteCommonStrings[ stringKey ] :
           numberPlaySecondaryStrings[ `${prefix}${stringKey}` ];
  },
  NUMBER_PLAY_STRING_KEY_PREFIX: NUMBER_PLAY_STRING_KEY_PREFIX,

  UNGROUPED_STORED_COUNTING_OBJECT_SCALE: 0.9,
  GROUPED_STORED_COUNTING_OBJECT_SCALE: 0.7,
  COUNTING_OBJECT_SCALE: 1,

  // game screen

  NUMBER_OF_LEVELS: 4,

  // subitizer game
  SHAPE_DELAY_TIME: 0.5, // amount of time to delay before showing the shape
  SHAPE_VISIBLE_TIME: 0.5, // amount of time the shape is shown, in seconds
  SHAPE_VISIBLE_TIME_INCREASE_AMOUNT: 0.1, // amount the shape visible time is increased by, in seconds
  MIN_SHAPE_VISIBLE_TIME: 0.1,
  MAX_SHAPE_VISIBLE_TIME: 2, // max amount of time the shape can be visible, in seconds
  NUMBER_OF_SUBITIZER_GUESSES_AT_NORMAL_TIME: 2, // number of guesses before increasing the shape visible time

  // amount to increase all the buttons by in the game screen (except the reveal button), in screen coordinates
  TOUCH_AREA_DILATION: 9
};

numberSuiteCommon.register( 'NumberSuiteCommonConstants', NumberSuiteCommonConstants );
export default NumberSuiteCommonConstants;