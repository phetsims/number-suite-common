// Copyright 2022-2023, University of Colorado Boulder

/**
 * Play area node for counting objects. This file was copied from counting-common/common/view/CountingCommonScreenView.js and
 * make-a-ten/explore/view/MakeATenExploreScreenView.js and then modified by @chrisklus to be used in number-play.
 *
 * @author Sharfudeen Ashraf
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import CountingObjectNode from '../../../../counting-common/js/common/view/CountingObjectNode.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node, NodeOptions, PressListenerEvent, Rectangle } from '../../../../scenery/js/imports.js';
import ClosestDragListener from '../../../../sun/js/ClosestDragListener.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import CountingPlayArea, { CountingObjectSerialization } from '../model/CountingPlayArea.js';
import CountingObjectCreatorPanel, { CountingObjectCreatorPanelOptions } from './CountingObjectCreatorPanel.js';
import { CountingObjectNodeMap } from '../../../../counting-common/js/common/view/CountingCommonScreenView.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import DraggableTenFrameNode from '../../lab/view/DraggableTenFrameNode.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Multilink from '../../../../axon/js/Multilink.js';

type SelfOptions = {
  countingObjectLayerNode?: null | Node;
  backgroundDragTargetNode?: null | Node;
  viewHasIndependentModel?: boolean; // whether this view is hooked up to its own model or a shared model
  includeCountingObjectCreatorPanel?: boolean;
  creatorPanelX?: null | number;
  returnZoneProperty?: null | TReadOnlyProperty<Bounds2>;
  countingObjectCreatorPanelOptions?: CountingObjectCreatorPanelOptions;
};
type CountingPlayAreaNodeOptions = SelfOptions;

// constants
const COUNTING_OBJECT_HANDLE_OFFSET_Y = -9.5; // empirically determined to be an appropriate length for just 10s and 1s, in screen coords

const COUNTING_OBJECT_REPEL_DISTANCE = 10; // empirically determined to look nice, in screen coords, repel this much
const COUNTING_OBJECT_REPEL_WHEN_CLOSER_THAN = 7; // If object are closer than this, than commence repel

class CountingPlayAreaNode extends Node {

  // called when a countingObject finishes animating, see onNumberAnimationFinished
  private readonly animationFinishedListener: ( countingObject: CountingObject ) => void;

  // called when a countingObjectNode finishes being dragged, see onNumberDragFinished
  private readonly dragFinishedListener: ( countingObjectNode: CountingObjectNode ) => void;

  // our model
  public readonly playArea: CountingPlayArea;

  // CountingObject.id => {CountingObjectNode} - lookup map for efficiency
  private readonly countingObjectNodeMap: CountingObjectNodeMap;

  // the bounds of the play area where countingObjects can be dragged
  public readonly playAreaBoundsProperty: TReadOnlyProperty<Bounds2>;
  public readonly countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>;

  // see options.viewHasIndependentModel for doc
  private readonly viewHasIndependentModel: boolean;

  // handle touches nearby to the countingObjects, and interpret those as the proper drag.
  private readonly closestDragListener: ClosestDragListener;

  // Node parent for all CountingObjectNode instances, created if not provided.
  private readonly countingObjectLayerNode: Node;

  public readonly countingObjectCreatorPanel: CountingObjectCreatorPanel;
  private readonly includeCountingObjectCreatorPanel: boolean;
  private readonly getCountingObjectOrigin: () => Vector2 = () => Vector2.ZERO;
  private readonly returnZoneProperty: TReadOnlyProperty<Bounds2> | null;

  public constructor( playArea: CountingPlayArea,
                      countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>,
                      playAreaBoundsProperty: TReadOnlyProperty<Bounds2>,
                      providedOptions?: CountingPlayAreaNodeOptions ) {

    const options = optionize<CountingPlayAreaNodeOptions, StrictOmit<SelfOptions, 'countingObjectCreatorPanelOptions'>, NodeOptions>()( {
      countingObjectLayerNode: null,
      backgroundDragTargetNode: null,
      viewHasIndependentModel: true,
      includeCountingObjectCreatorPanel: true,
      creatorPanelX: null,
      returnZoneProperty: null
    }, providedOptions );

    super( options );

    this.animationFinishedListener = ( countingObject: CountingObject ) => this.onNumberAnimationFinished( countingObject );
    this.dragFinishedListener = ( countingObjectNode: CountingObjectNode ) => this.onNumberDragFinished( countingObjectNode.countingObject );

    this.playArea = playArea;

    this.countingObjectNodeMap = {};

    this.playAreaBoundsProperty = playAreaBoundsProperty;
    this.countingObjectTypeProperty = countingObjectTypeProperty;

    this.viewHasIndependentModel = options.viewHasIndependentModel;

    this.closestDragListener = new ClosestDragListener( 30, 0 );
    let backgroundDragTargetNode = null;
    if ( options.backgroundDragTargetNode ) {
      backgroundDragTargetNode = options.backgroundDragTargetNode;
    }
    else {
      backgroundDragTargetNode = new Rectangle( playAreaBoundsProperty.value );
      this.addChild( backgroundDragTargetNode );
    }
    backgroundDragTargetNode.addInputListener( this.closestDragListener );

    const countingObjectAddedListener = this.onCountingObjectAdded.bind( this );
    const countingObjectRemovedListener = this.onCountingObjectRemoved.bind( this );

    // Add nodes for every already-existing countingObject
    playArea.countingObjects.forEach( countingObjectAddedListener );

    // Add and remove nodes to match the playArea
    playArea.countingObjects.addItemAddedListener( countingObjectAddedListener );
    playArea.countingObjects.addItemRemovedListener( countingObjectRemovedListener );

    // Persistent, no need to unlink
    this.playAreaBoundsProperty.lazyLink( () => {
      this.constrainAllPositions();
    } );

    // create the CountingObjectCreatorPanel
    this.countingObjectCreatorPanel = new CountingObjectCreatorPanel( playArea, this, options.countingObjectCreatorPanelOptions );
    if ( options.creatorPanelX ) {
      this.countingObjectCreatorPanel.centerX = options.creatorPanelX;
    }
    else {
      this.countingObjectCreatorPanel.left = playAreaBoundsProperty.value.minX + CountingCommonConstants.COUNTING_PLAY_AREA_MARGIN;
    }

    // set the y position of the CountingObjectCreatorPanel. NOTE: It is assumed below during initialization that the
    // CountingObjectCreatorPanel is positioned along the bottom of the playArea bounds
    const updateCountingObjectCreatorPanelPosition = () => {
      this.countingObjectCreatorPanel.bottom = playAreaBoundsProperty.value.bottom -
                                               CountingCommonConstants.COUNTING_PLAY_AREA_MARGIN;
    };
    playAreaBoundsProperty.link( updateCountingObjectCreatorPanelPosition );
    this.transformEmitter.addListener( updateCountingObjectCreatorPanelPosition );

    if ( options.includeCountingObjectCreatorPanel ) {
      this.addChild( this.countingObjectCreatorPanel );
      this.getCountingObjectOrigin = () => this.countingObjectCreatorPanel.countingCreatorNode.getOriginPosition();
    }

    // initialize the model with positioning information
    if ( this.viewHasIndependentModel ) {
      const countingObjectCreatorNodeHeight = options.includeCountingObjectCreatorPanel ? this.countingObjectCreatorPanel.height : 0;
      this.playArea.initialize( this.getCountingObjectOrigin, countingObjectCreatorNodeHeight, playAreaBoundsProperty );
    }

    if ( options.countingObjectLayerNode ) {
      this.countingObjectLayerNode = options.countingObjectLayerNode;
    }
    else {
      this.countingObjectLayerNode = new Node();

      // add the countingObjectLayerNode after the creator panel
      this.addChild( this.countingObjectLayerNode );
    }

    this.includeCountingObjectCreatorPanel = options.includeCountingObjectCreatorPanel;
    this.returnZoneProperty = options.returnZoneProperty;

    // In the view only because of countingObjectNode.updateNumber()
    Multilink.lazyMultilink( [
      this.playArea.groupingEnabledProperty,
      countingObjectTypeProperty
    ], groupingEnabled => {

      // When grouping is turned off, break apart any object groups
      !groupingEnabled && this.playArea.breakApartCountingObjects( true );

      for ( let i = 0; i < this.playArea.countingObjects.length; i++ ) {
        const countingObject = this.playArea.countingObjects[ i ];
        const countingObjectNode = this.getCountingObjectNode( countingObject );

        // Need to call this on countingObjects that are NOT included in sum.
        countingObjectNode.updateNumber();

        // Don't constrain a destination to objects not included in sum.
        if ( !countingObject.isAnimating ) {

          // In general this should be superfluous, but the "card" around a counting object type has larger bounds
          // than the object itself, so we need to handle this.
          countingObject.setConstrainedDestination( this.playAreaBoundsProperty.value, countingObject.positionProperty.value );
        }
      }
    } );
  }

  /**
   * Add a countingObject to the playArea and immediately start dragging it with the provided event.
   *
   * @param event - The Scenery event that triggered this.
   * @param countingObject - The countingObject to add and then drag
   *
   * TODO: same as CountingCommonScreenView.addAndDragCountingObject https://github.com/phetsims/number-play/issues/119
   * only difference is call to playArea.calculateTotal()
   */
  public addAndDragCountingObject( event: PressListenerEvent, countingObject: CountingObject ): void {

    // Add it and lookup the related node.
    this.playArea.addCountingObject( countingObject );
    this.playArea.calculateTotal();

    const countingObjectNode = this.getCountingObjectNode( countingObject );
    countingObjectNode.startSyntheticDrag( event );
  }

  /**
   * Creates and adds a CountingObjectNode.
   *
   * TODO: same work as CountingCommonScreenView.onCountingObjectAdded https://github.com/phetsims/number-play/issues/119
   * Add listener calls are duplicated from MakeATenExploreScreenView.onCountingObjectAdded
   */
  public onCountingObjectAdded( countingObject: CountingObject ): void {

    const countingObjectNode = new CountingObjectNode(
      countingObject,
      this.playAreaBoundsProperty,
      this.addAndDragCountingObject.bind( this ),
      this.tryToCombineCountingObjects.bind( this ), {
        countingObjectTypeProperty: this.countingObjectTypeProperty,
        baseNumberNodeOptions: {
          handleOffsetY: COUNTING_OBJECT_HANDLE_OFFSET_Y
        }
      } );

    this.countingObjectNodeMap[ countingObjectNode.countingObject.id ] = countingObjectNode;
    this.countingObjectLayerNode.addChild( countingObjectNode );
    countingObjectNode.attachListeners();

    this.closestDragListener.addDraggableItem( countingObjectNode );

    // add listeners
    countingObject.endAnimationEmitter.addListener( this.animationFinishedListener );
    countingObjectNode.endDragEmitter.addListener( this.dragFinishedListener );
  }

  /**
   * Handles removing the relevant CountingObjectNode
   * TODO: Duplicated from CountingCommonScreenView.onCountingObjectRemoved https://github.com/phetsims/number-play/issues/119
   * Listener removal duplicated from MakeATenExploreScreenView.onCountingObjectRemoved
   */
  public onCountingObjectRemoved( countingObject: CountingObject ): void {
    // TODO: same as CountingCommonScreenView.findCountingObjectNode https://github.com/phetsims/number-play/issues/119
    const countingObjectNode = this.getCountingObjectNode( countingObject );

    // Remove listeners
    countingObjectNode.endDragEmitter.removeListener( this.dragFinishedListener );
    countingObject.endAnimationEmitter.removeListener( this.animationFinishedListener );

    delete this.countingObjectNodeMap[ countingObjectNode.countingObject.id ];
    this.closestDragListener.removeDraggableItem( countingObjectNode );
    countingObjectNode.dispose();
  }

  /**
   * Given a CountingObject, get the current view (CountingObjectNode) of it.
   * TODO: Duplication, https://github.com/phetsims/number-play/issues/119
   */
  public getCountingObjectNode( countingObject: CountingObject ): CountingObjectNode {
    const result = this.countingObjectNodeMap[ countingObject.id ];
    assert && assert( result, 'Did not find matching Node' );
    return result;
  }

  /**
   * When the user drops a countingObject they were dragging, see if it can combine with any other nearby countingObjects.
   */
  public tryToCombineCountingObjects( draggedCountingObject: CountingObject ): void {
    //TODO https://github.com/phetsims/number-suite-common/issues/29 This seems like a weird sidestep to try tenframes first and maybe be moved
    if ( this.tryToAddToTenFrame( draggedCountingObject ) ) {
      return;
    }

    // TODO: duplication https://github.com/phetsims/number-play/issues/119
    const draggedNode = this.getCountingObjectNode( draggedCountingObject );

    // TODO: semi-duplication https://github.com/phetsims/number-play/issues/119
    // remove any countingObjects that aren't included in the sum - these are already on their way back to the creatorNode and
    // should not be tried to combined with. return if no countingObjects are left or if the draggedCountingObject is not
    // included in the sum
    const allCountingObjectNodes = _.filter( this.countingObjectLayerNode.children,
      child => child instanceof CountingObjectNode && child.countingObject.includeInSumProperty.value ) as CountingObjectNode[];

    if ( allCountingObjectNodes.length === 0 || !draggedCountingObject.includeInSumProperty.value ) {
      return;
    }

    // TODO: duplication https://github.com/phetsims/number-play/issues/119
    const droppedNodes = draggedNode.findAttachableNodes( allCountingObjectNodes );

    // TODO: duplication https://github.com/phetsims/number-play/issues/119
    // Check them in reverse order (the one on the top should get more priority)
    droppedNodes.reverse();

    for ( let i = 0; i < droppedNodes.length; i++ ) {
      const droppedNode = droppedNodes[ i ];
      const droppedCountingObject = droppedNode.countingObject;

      // if grouping is turned off, repel away
      if ( !this.playArea.groupingEnabledProperty.value || !droppedCountingObject.groupingEnabledProperty.value ) {
        if ( draggedCountingObject.positionProperty.value.distance( droppedCountingObject.positionProperty.value ) < COUNTING_OBJECT_REPEL_WHEN_CLOSER_THAN ) {
          this.playArea.repelAway( this.playAreaBoundsProperty.value, draggedCountingObject, droppedCountingObject, () => {
            return {
              left: -COUNTING_OBJECT_REPEL_DISTANCE,
              right: COUNTING_OBJECT_REPEL_DISTANCE
            };
          } );
        }
      }
      else {
        // TODO: duplication https://github.com/phetsims/number-play/issues/119
        // allow any two numbers to be combined
        this.playArea.collapseNumberModels( this.playAreaBoundsProperty.value, draggedCountingObject, droppedCountingObject );
        return; // No need to re-layer or try combining with others
      }
    }
  }

  /**
   * Returns if it was able to add the countingObject to the tenFrame
   */
  private tryToAddToTenFrame( droppedCountingObject: CountingObject ): boolean {
    if ( !this.playArea.tenFrames ) {
      return false;
    }

    const droppedCountingObjectNode = this.getCountingObjectNode( droppedCountingObject );
    const allDraggableTenFrameNodes = _.filter( this.countingObjectLayerNode.children,
      child => child instanceof DraggableTenFrameNode ) as DraggableTenFrameNode[];

    const droppedNodeCountingType = droppedCountingObjectNode.countingObjectTypeProperty.value;

    if ( !allDraggableTenFrameNodes.length ) {
      return false;
    }

    const tenFrameNode = this.findAttachableTenFrameNode( droppedCountingObjectNode, allDraggableTenFrameNodes );

    // If we found a tenFrame underneath this countingObject
    if ( tenFrameNode ) {

      // If this countingObject is not already in a tenFrame
      if ( !this.isCountingObjectContainedByTenFrame( droppedCountingObject ) ) {

        const tenFrame = tenFrameNode.tenFrame;

        // If the countingObject and tenFrame have the same countingObjectType
        let tenFrameSharesCountingObjectType = false;

        if ( tenFrame.countingObjects.lengthProperty.value > 0 ) {
          tenFrameSharesCountingObjectType = this.playArea.countingObjects.includes( tenFrame.countingObjects[ 0 ] );
        }

        // Paper number cannot be added to tenFrames anyways.
        const noCountingObjectsInTenFrame = !tenFrame.countingObjects.lengthProperty.value &&
                                            droppedNodeCountingType !== CountingObjectType.PAPER_NUMBER;

        if ( tenFrameSharesCountingObjectType || noCountingObjectsInTenFrame ) {
          tenFrame.tryToAddCountingObject( droppedCountingObject );
        }
        else {
          tenFrame.pushAwayCountingObject( droppedCountingObject, this.playAreaBoundsProperty.value );
        }
      }
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * Is the provided countingObject already in a tenFrame.
   */
  private isCountingObjectContainedByTenFrame( countingObject: CountingObject ): boolean {
    let isContained = false;
    this.playArea.tenFrames?.forEach( tenFrame => {
      if ( tenFrame.containsCountingObject( countingObject ) ) {
        isContained = true;
      }
    } );

    return isContained;
  }

  /**
   * Given the countingObjectNode and an array of DraggableTenFrameNodes, return the highest TenFrameNode that the
   * countingObjectNode is on top of, if any (or null if none are found). This relies on the assumption that the
   * DraggableTenFrameNodes provided are currently children of a Node layer.
   */
  private findAttachableTenFrameNode( countingObjectNode: CountingObjectNode,
                                      allDraggableTenFrameNodes: DraggableTenFrameNode[] ): DraggableTenFrameNode | null {
    const tenFrameNodeCandidates = allDraggableTenFrameNodes.slice();

    // Find all DraggableTenFrameNodes that are underneath the dropped countingObjectNode.
    const unorderedAttachableTenFrameNodes = tenFrameNodeCandidates.filter( tenFrameNode => {
      return tenFrameNode.tenFrame.isCountingObjectOnTopOf( countingObjectNode.countingObject );
    } );

    let attachableTenFrameNode = null;

    // Select the top attachable TenFrameNode, if any were attachable from above.
    if ( unorderedAttachableTenFrameNodes ) {
      attachableTenFrameNode = _.maxBy( unorderedAttachableTenFrameNodes, attachableTenFrameNode => {
        return attachableTenFrameNode.parent!.indexOfChild( attachableTenFrameNode );
      } )!;
    }

    return attachableTenFrameNode;
  }

  /**
   * Make sure all countingObjects are within the availableViewBounds
   * TODO: Duplication, https://github.com/phetsims/number-play/issues/119
   */
  private constrainAllPositions(): void {
    this.playArea.countingObjects.forEach( ( countingObject: CountingObject ) => {
      countingObject.setConstrainedDestination( this.playAreaBoundsProperty.value, countingObject.positionProperty.value );
    } );
  }

  /**
   * Whether the countingObject is predominantly over the explore panel (should be collected).
   */
  private isNumberInReturnZone( countingObject: CountingObject ): boolean {
    const parentBounds = this.getCountingObjectNode( countingObject ).bounds;

    // And the bounds of our panel
    const panelBounds = this.returnZoneProperty ? this.returnZoneProperty.value : this.countingObjectCreatorPanel.bounds;

    return panelBounds.intersectsBounds( parentBounds );
  }

  /**
   * Called when a countingObject has finished animating to its destination.
   */
  private onNumberAnimationFinished( countingObject: CountingObject ): void {

    // If it animated to the return zone, it's probably split and meant to be returned.
    if ( this.playArea.countingObjects.includes( countingObject ) && this.isNumberInReturnZone( countingObject ) ) {
      if ( countingObject.includeInSumProperty.value ) {
        this.onNumberDragFinished( countingObject );
      }
      else {
        const countingObjectValue = countingObject.numberValueProperty.value;
        this.playArea.removeCountingObject( countingObject );

        // see if the creator node should show any hidden targets since a counting object was just returned
        this.countingObjectCreatorPanel.countingCreatorNode.checkTargetVisibility( countingObjectValue );
      }
    }
    else if ( !this.viewHasIndependentModel ) {

      // if this view is running off of a shared model, then if a countingObject has already been removed from the model,
      // check if creator node should be updated
      const countingObjectValue = countingObject.numberValueProperty.value;
      this.countingObjectCreatorPanel.countingCreatorNode.checkTargetVisibility( countingObjectValue );
    }
  }

  /**
   * Called when a countingObject has finished being dragged.
   */
  private onNumberDragFinished( countingObject: CountingObject ): void {

    if ( !this.includeCountingObjectCreatorPanel ) {
      return;
    }

    // Return it to the panel if it's been dropped in the panel.
    if ( this.isNumberInReturnZone( countingObject ) ) {
      // console.log( `about to drop ${countingObject.numberValueProperty.value} in ${this.playArea.name} return zone` );
      countingObject.includeInSumProperty.value = false;
      this.playArea.calculateTotal();

      // Set its destination to the proper target (with the offset so that it will disappear once centered).
      let targetPosition = this.countingObjectCreatorPanel.countingCreatorNode.getOriginPosition();
      targetPosition = targetPosition.minus( countingObject.returnAnimationBounds.center );
      const targetScale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE :
                          NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
      countingObject.setDestination( targetPosition, true, {
        targetScale: targetScale,
        targetHandleOpacity: 0
      } );
    }
  }

  /**
   * Creates a serialization of the countingObjects in the model. This includes the position, value, and z-index of the
   * countingObjects.
   */
  public getSerializedCountingObjectsIncludedInSum(): CountingObjectSerialization[] {
    const countingObjectsIncludedInSum = this.playArea.getCountingObjectsIncludedInSum();

    const countingObjectPositions: CountingObjectSerialization[] = [];
    countingObjectsIncludedInSum.forEach( countingObject => {
      const countingObjectZIndex = this.countingObjectLayerNode.children.indexOf( this.getCountingObjectNode( countingObject ) );
      assert && assert( countingObjectZIndex >= 0,
        `countingObject's corresponding Node not in countingObjectLayerNode: ${countingObjectZIndex}` );

      countingObjectPositions.push( {
        position: countingObject.positionProperty.value,
        numberValue: countingObject.numberValueProperty.value,
        zIndex: countingObjectZIndex
      } );
    } );

    return countingObjectPositions;
  }
}

numberSuiteCommon.register( 'CountingPlayAreaNode', CountingPlayAreaNode );
export default CountingPlayAreaNode;
