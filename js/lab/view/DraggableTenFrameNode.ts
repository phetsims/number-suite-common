// Copyright 2019-2023, University of Colorado Boulder

/**
 * A ten frame node that can be dragged around and hold play objects.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import TProperty from '../../../../axon/js/TProperty.js';
import TReadOnlyProperty, { PropertyLinkListener } from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import CountingObjectNode from '../../../../counting-common/js/common/view/CountingObjectNode.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import { DragListener, Node, PressListenerEvent, TInputListener } from '../../../../scenery/js/imports.js';
import TenFrameNode from '../../common/view/TenFrameNode.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TenFrame from '../model/TenFrame.js';

const RETURN_BUTTON_MARGIN = 5;

type SelfOptions = {
  dropListener: ( tenFrameNode: DraggableTenFrameNode ) => void;
  removeCountingObjectListener: ( countingObject: CountingObject ) => void;
  getCountingObjectNode: ( countingObject: CountingObject ) => CountingObjectNode;
};
type DraggableTenFrameNodeOptions = SelfOptions;

class DraggableTenFrameNode extends Node {
  public readonly tenFrame: TenFrame;
  public readonly dragListener: DragListener;
  private readonly positionPropertyLink: PropertyLinkListener<Vector2>;
  private readonly scalePropertyLink: PropertyLinkListener<number>;

  public constructor( tenFrame: TenFrame, selectedTenFrameProperty: TProperty<TenFrame | null>,
                      dragBoundsProperty: TReadOnlyProperty<Bounds2>, options: DraggableTenFrameNodeOptions ) {
    super();

    this.tenFrame = tenFrame;

    const tenFrameNode = TenFrameNode.getTenFramePath( {
      sideLength: TenFrame.SQUARE_SIDE_LENGTH
    } );
    this.addChild( tenFrameNode );

    const returnButton = new ReturnButton( () => {
      tenFrame.removeCountingObject();
    }, {
      visible: false,
      listenerOptions: {

        // necessary to allow input to this button via touch because the dragListener takes input priority on this
        // node, see https://github.com/phetsims/number-suite-common/issues/16
        attach: false
      }
    } );
    returnButton.touchArea = returnButton.localBounds.dilated( RETURN_BUTTON_MARGIN );
    returnButton.x = tenFrameNode.left - returnButton.width - 5;
    this.addChild( returnButton );

    this.dragListener = new DragListener( {
      start: () => {
        selectedTenFrameProperty.value = tenFrame;
        this.moveToFront();
        tenFrame.countingObjects.forEach( countingObject => {
          const countingObjectNode = options.getCountingObjectNode( countingObject );
          countingObjectNode.moveToFront();
        } );
      },
      drag: ( event: PressListenerEvent, listener: DragListener ) => {
        tenFrame.setConstrainedDestination( dragBoundsProperty.value, listener.parentPoint );
        tenFrame.countingObjects.forEach( countingObject => {
          countingObject.setDestination( tenFrame.getCountingObjectSpot( countingObject ), false );
        } );
      },
      end: () => {
        options.dropListener( this );
      }
    } );
    this.addInputListener( this.dragListener );

    this.cursor = 'pointer';

    this.positionPropertyLink = position => { this.translation = position; };
    tenFrame.positionProperty.link( this.positionPropertyLink );

    this.scalePropertyLink = scale => {this.setScaleMagnitude( scale ); };
    tenFrame.scaleProperty.link( this.scalePropertyLink );

    tenFrame.countingObjects.addItemAddedListener( countingObject => {
      const countingObjectNode = options.getCountingObjectNode( countingObject );

      // make the countingObjectNode pickable:false instead of inputEnabled:false because we still want to be able to
      // drag this tenFrameNode that the countingObjectNode is on top of
      countingObjectNode.pickable = false;

      // animate the countingObject to the next available space in the tenFrame
      countingObject.setDestination( tenFrame.getCountingObjectSpot( countingObject ), true );

      // make the tenFrame selected so the user knows they can remove the newly added countingObject
      selectedTenFrameProperty.value = tenFrame;
    } );

    tenFrame.countingObjects.addItemRemovedListener( countingObject => {
      options.removeCountingObjectListener( countingObject );
    } );

    // show the returnButton if this is the selected tenFrame and if there's at least one countingObject contained
    // in the tenFrame
    Multilink.lazyMultilink( [ selectedTenFrameProperty, tenFrame.countingObjects.lengthProperty ],
      ( selectedTenFrame, numberOfCountingObjects ) => {
        returnButton.visible = selectedTenFrame === tenFrame && numberOfCountingObjects > 0;
      } );
  }

  public override dispose(): void {
    this.removeInputListener( this.dragListener );
    this.tenFrame.positionProperty.unlink( this.positionPropertyLink );
    this.tenFrame.scaleProperty.unlink( this.scalePropertyLink );
    this.tenFrame.dispose();
    super.dispose();
  }
}

numberSuiteCommon.register( 'DraggableTenFrameNode', DraggableTenFrameNode );
export default DraggableTenFrameNode;