// Copyright 2021, University of Colorado Boulder

import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import numberPlay from '../../numberPlay.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';

// constants
const WIDTH = 425; // empirically determined, in screen coordinates
const HEIGHT = 275; // empirically determined, in screen coordinates
const CORNER_RADIUS = 10; // empirically determined, in screen coordinates

/**
 * SubitizerNode displays the subitized objects in the view.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
class SubitizerNode extends Node {

  /**
   * @param subitizerModel {SubitizerModel}
   */
  constructor( subitizerModel ) {
    super();

    // create and add a backgroundNode
    const backgroundNode = new Rectangle( 0, 0, WIDTH, HEIGHT, CORNER_RADIUS, CORNER_RADIUS, {
      fill: 'white'
    } );
    backgroundNode.center = Vector2.ZERO;
    this.addChild( backgroundNode );

    // for scaling the objects
    const scaleMVT = ModelViewTransform2.createOffsetScaleMapping( Vector2.ZERO, 90 );

    // create and add the drawingNode, which is where the objects are added to and it rotates if rotationProperty is set
    const drawingNode = new Node( {
      visibleProperty: subitizerModel.visibleProperty
    } );
    this.addChild( drawingNode );

    // update the view shape when the model coordinates change
    subitizerModel.coordinatesProperty.link( coordinates => {
      drawingNode.setRotation( 0 );
      drawingNode.removeAllChildren();

      // create and add each object to the drawingNode
      coordinates.forEach( coordinate => {
        const object = new Circle( 20, { fill: Color.BLACK } ); // TODO: use more than one object
        object.centerX = scaleMVT.modelToViewX( coordinate.x );
        object.centerY = scaleMVT.modelToViewY( coordinate.y );
        drawingNode.addChild( object );
      } );

      // rotate the drawingNode randomly if a rotationProperty value exists
      if ( subitizerModel.rotationProperty.value && dotRandom.nextBoolean() ) {
        drawingNode.setRotation( subitizerModel.rotationProperty.value );
      }

    } );
  }
}

numberPlay.register( 'SubitizerNode', SubitizerNode );
export default SubitizerNode;