// Copyright 2019-2023, University of Colorado Boulder

/**
 * Class for the 'Total' accordion box, which is the panel in the top center of the sim that displays a numerical
 * representation of the current number.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { HBox, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import ArrowButton, { ArrowButtonOptions } from '../../../../sun/js/buttons/ArrowButton.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import Range from '../../../../dot/js/Range.js';
import NumberSuiteCommonAccordionBox, { NumberSuiteCommonAccordionBoxOptions } from './NumberSuiteCommonAccordionBox.js';
import optionize from '../../../../phet-core/js/optionize.js';
import CountingPlayArea from '../model/CountingPlayArea.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';

// types
type SelfOptions = {
  arrowButtonOptions: ArrowButtonOptions;
  arrowButtonSpacing: number;
} & PickRequired<TextOptions, 'font'>;
export type TotalAccordionBoxOptions =
  SelfOptions
  & StrictOmit<NumberSuiteCommonAccordionBoxOptions, 'titleStringProperty'>;

class TotalAccordionBox extends NumberSuiteCommonAccordionBox {

  public constructor( playArea: CountingPlayArea, height: number, providedOptions: TotalAccordionBoxOptions ) {

    const options = optionize<TotalAccordionBoxOptions, SelfOptions, NumberSuiteCommonAccordionBoxOptions>()( {
      titleStringProperty: NumberSuiteCommonStrings.totalStringProperty,
      titleTextOptions: {
        maxWidth: 142
      }
    }, providedOptions );

    super( NumberSuiteCommonConstants.TOTAL_ACCORDION_BOX_WIDTH, new Property<number>( height ), options );

    // create the NumberDisplay, which is a numerical representation of the current number. always format for numbers
    // up to twenty so the display looks consistent across screens.
    const numberDisplay = new NumberDisplay( playArea.sumProperty, new Range( 0, NumberSuiteCommonConstants.TWENTY ), {
      decimalPlaces: 0,
      align: 'right',
      noValueAlign: 'left',
      textOptions: {
        font: options.font
      },
      backgroundFill: null,
      backgroundStroke: null
    } );

    // create the arrow buttons, which add or remove counting Objects
    const upArrowButton = new ArrowButton( 'up', () => {
      // console.log( 'about to add 1 with up arrow in in total accordion box' );
      playArea.createCountingObjectFromBucket( {
        shouldAnimate: true,
        value: 1
      } );
    }, options.arrowButtonOptions );
    const downArrowButton = new ArrowButton( 'down', () => {
      // console.log( 'about to remove 1 with up arrow in in total accordion box' );
      playArea.returnCountingObjectToBucket();
    }, options.arrowButtonOptions );
    const arrowButtons = new VBox( {
      children: [ upArrowButton, downArrowButton ],
      spacing: options.arrowButtonSpacing
    } );

    // disable the arrow buttons when the currentNumberProperty value is at its min or max range
    const currentNumberPropertyObserver = ( currentNumber: number ) => {
      assert && assert( playArea.sumProperty.range, 'Range is required for sumProperty in play areas' );
      upArrowButton.enabled = currentNumber !== playArea.sumProperty.range.max;
      downArrowButton.enabled = currentNumber !== playArea.sumProperty.range.min;
    };
    playArea.sumProperty.link( currentNumberPropertyObserver );

    // arrange and add the number display and arrow buttons
    const numberControl = new HBox( { children: [ numberDisplay, arrowButtons ] } );
    numberControl.center = this.contentBoundsProperty.value.center;
    this.contentNode.addChild( numberControl );
  }
}

numberSuiteCommon.register( 'TotalAccordionBox', TotalAccordionBox );
export default TotalAccordionBox;