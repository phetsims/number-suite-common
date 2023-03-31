// Copyright 2022-2023, University of Colorado Boulder

/**
 * A node that looks like a CardNode that creates a CardNode when pressed.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node, PressListenerEvent } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import SymbolCardNode, { SymbolType } from './SymbolCardNode.js';
import LabScreenView from './LabScreenView.js';
import Easing from '../../../../twixt/js/Easing.js';
import Animation from '../../../../twixt/js/Animation.js';
import CardNode from './CardNode.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NumberCardNode from './NumberCardNode.js';
import NumberSuiteCommonPreferences from '../../common/model/NumberSuiteCommonPreferences.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';

type SelfOptions = {
  symbolType?: SymbolType | null;
  number?: number | null;
};
export type CardNodeOptions = SelfOptions;

//TODO https://github.com/phetsims/number-suite-common/issues/29 add comments
class CardCreatorNode extends Node {

  public constructor( screenView: LabScreenView<NumberSuiteCommonPreferences>,
                      contentToCountPropertyMap: Map<SymbolType | number, TProperty<number>>,
                      options: CardNodeOptions ) {
    super();

    let iconNode: Node;
    if ( options.symbolType ) {
      assert && assert( !options.number, 'symbolType and number cannot both be provided' );

      iconNode = new SymbolCardNode( {
        symbolType: options.symbolType,
        includeDragListener: false,
        dragBoundsProperty: screenView.symbolCardBoundsProperty,
        homePosition: Vector2.ZERO
      } );
    }
    else {
      assert && assert( options.number, 'symbolType or number must be provided' );

      iconNode = new NumberCardNode( {
        number: options.number!,
        includeDragListener: false,
        dragBoundsProperty: screenView.objectCountingAreaBoundsProperty,
        homePosition: Vector2.ZERO
      } );
    }

    iconNode.addInputListener( DragListener.createForwardingListener( ( event: PressListenerEvent ) => {

      // Calculate the icon's origin.
      const trail = screenView.getUniqueLeafTrailTo( iconNode ).slice( 1 );
      const globalOrigin = trail.localToGlobalPoint( iconNode.localBounds.center );

      let cardNode: CardNode;
      let countProperty: TProperty<number>;

      const dropListener = () => {
        const homeNodeBounds = options.symbolType ? screenView.symbolCardCreatorPanel.bounds : screenView.numberCardCreatorCarousel.bounds;

        if ( cardNode.bounds.intersectsBounds( homeNodeBounds ) ) {
          cardNode.inputEnabled = false;

          const distance = cardNode.positionProperty.value.distance( cardNode.homePosition );
          const duration =
            CountingCommonConstants.ANIMATION_TIME_RANGE.constrainValue( distance / CountingCommonConstants.ANIMATION_SPEED );

          cardNode.animation = new Animation( {
            duration: duration,
            targets: [ {
              property: cardNode.positionProperty,
              easing: Easing.CUBIC_IN_OUT,
              to: cardNode.homePosition
            } ]
          } );

          cardNode.animation.finishEmitter.addListener( () => {
            screenView.pieceLayer.removeChild( cardNode );
            cardNode.dispose();
            countProperty!.value--;
          } );
          cardNode.animation.start();
        }
      };

      if ( options.symbolType ) {
        assert && assert( !options.number, 'symbolType and number cannot both be provided' );

        countProperty = contentToCountPropertyMap.get( options.symbolType )!;
        assert && assert( countProperty, 'countProperty for inequality symbol not found: ' + options.symbolType );

        cardNode = new SymbolCardNode( {
          symbolType: options.symbolType,
          dragBoundsProperty: screenView.symbolCardBoundsProperty,
          dropListener: dropListener,
          homePosition: globalOrigin
        } );
      }
      else {
        assert && assert( options.number, 'symbolType or number must be provided' );

        countProperty = contentToCountPropertyMap.get( options.number! )!;

        cardNode = new NumberCardNode( {
          number: options.number!,
          dragBoundsProperty: screenView.numberCardBoundsProperty,
          dropListener: dropListener,
          homePosition: globalOrigin
        } );
      }

      countProperty.value++;

      screenView.pieceLayer.addChild( cardNode );
      cardNode.positionProperty.value = screenView.globalToLocalPoint( event.pointer.point ).minus( cardNode.localBounds.centerBottom.minusXY( 0, 15 ) );
      cardNode.dragListener!.press( event, cardNode );
    } ) );

    this.addChild( iconNode );
  }
}

numberSuiteCommon.register( 'CardCreatorNode', CardCreatorNode );
export default CardCreatorNode;