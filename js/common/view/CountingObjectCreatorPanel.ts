// Copyright 2021-2023, University of Colorado Boulder

/**
 * Panel that contains a stack of  paper ones or objects, which can be clicked or dragged to create draggable
 * paper ones or objects. It also contains spinner buttons that can send a paper one or object out of the panel, or
 * request them to be brought back into the panel.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingCreatorNode from '../../../../counting-common/js/common/view/CountingCreatorNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { HBox, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import ArrowButton, { ArrowButtonOptions } from '../../../../sun/js/buttons/ArrowButton.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import CountingPlayArea from '../model/CountingPlayArea.js';
import CountingPlayAreaNode from './CountingPlayAreaNode.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import NumberSuiteCommonPanel, { NumberSuiteCommonPanelOptions } from './NumberSuiteCommonPanel.js';

type SelfOptions = {
  arrowButtonsVisible?: boolean;
};

export type CountingObjectCreatorPanelOptions = SelfOptions & NumberSuiteCommonPanelOptions;

class CountingObjectCreatorPanel extends NumberSuiteCommonPanel {
  public countingCreatorNode: CountingCreatorNode;

  public constructor( playArea: CountingPlayArea, countingPlayAreaNode: CountingPlayAreaNode,
                      providedOptions?: CountingObjectCreatorPanelOptions ) {

    const options = optionize<CountingObjectCreatorPanelOptions, SelfOptions, NumberSuiteCommonPanelOptions>()( {
      arrowButtonsVisible: true
    }, providedOptions );

    // create the arrow buttons, which change the value of currentNumberProperty by -1 or +1
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14,
      visible: options.arrowButtonsVisible
    };
    const upArrowButton = new ArrowButton( 'up', () => {
      // console.log( `about to add 1 with up arrow in in ${playArea.name}` );
      playArea.createCountingObjectFromBucket( {
        shouldAnimate: true,
        value: 1
      } );
    }, optionize<ArrowButtonOptions, EmptySelfOptions>()( { touchAreaYShift: -3 }, arrowButtonOptions ) );
    const downArrowButton = new ArrowButton( 'down', () => {
      // console.log( `about to remove 1 with up arrow in in ${playArea.name}` );
      playArea.returnCountingObjectToBucket();
    }, optionize<ArrowButtonOptions, EmptySelfOptions>()( { touchAreaYShift: 3 }, arrowButtonOptions ) );
    const arrowButtons = new VBox( {
      children: [ upArrowButton, downArrowButton ],
      spacing: 7
    } );

    const creatorNodeBackground = new Rectangle( 0, 0,
      CountingCommonConstants.PLAY_OBJECT_SIZE.width * NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE + 8,
      CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.height * NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE + 5
    );

    const countingCreatorNode = new CountingCreatorNode( 0, countingPlayAreaNode, playArea.sumProperty,
      playArea.resetEmitter, countingPlayAreaNode.addAndDragNumber.bind( countingPlayAreaNode ), {
      updateCurrentNumber: true,
      countingObjectTypeProperty: countingPlayAreaNode.countingObjectTypeProperty,
      groupingEnabledProperty: countingPlayAreaNode.playArea.groupingEnabledProperty,
      backTargetOffset: new Vector2( -5, -5 ),
      ungroupedTargetScale: NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE,
      groupedTargetScale: NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE,
      touchAreaXDilation: 6.5,
      touchAreaYDilation: 5,
      touchAreaXShift: 3
    } );
    creatorNodeBackground.addChild( countingCreatorNode );

    countingPlayAreaNode.playArea.groupingEnabledProperty.link( groupingEnabled => {
      countingCreatorNode.center = creatorNodeBackground.selfBounds.center;
    } );

    const hBox = new HBox( {
      children: [ arrowButtons, creatorNodeBackground ],
      spacing: 11,
      align: 'center'
    } );

    super( hBox, options );

    this.countingCreatorNode = countingCreatorNode;

    // disable the arrow buttons when the currentNumberProperty value is at its min or max range
    const currentNumberPropertyObserver = ( currentNumber: number ) => {
      upArrowButton.enabled = currentNumber !== playArea.sumProperty.range.max;
      downArrowButton.enabled = currentNumber !== playArea.sumProperty.range.min;
    };
    playArea.sumProperty.link( currentNumberPropertyObserver );
  }
}

numberSuiteCommon.register( 'CountingObjectCreatorPanel', CountingObjectCreatorPanel );
export default CountingObjectCreatorPanel;
