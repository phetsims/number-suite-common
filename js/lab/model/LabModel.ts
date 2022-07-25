// Copyright 2019-2022, University of Colorado Boulder

/**
 * Model class for the 'Lab' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import NumberPiece from '../../../../fractions-common/js/building/model/NumberPiece.js';
import NumberStack from '../../../../fractions-common/js/building/model/NumberStack.js';
import FractionsCommonConstants from '../../../../fractions-common/js/common/FractionsCommonConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import OnesPlayArea from '../../common/model/OnesPlayArea.js';
import numberPlay from '../../numberPlay.js';
import TenFrame from './TenFrame.js';

// constants
const NUMBER_PIECE_RETURN_THRESHOLD = 92;
const HIGHEST_COUNT = 20;
const NUMBER_OF_PLAY_AREAS = 5;

class LabModel {
  public readonly numberStacks: NumberStack[];

  // number pieces in the play area
  public readonly numberPieces: ObservableArray<NumberPiece>;
  public readonly tenFrames: ObservableArray<TenFrame>;
  public readonly paperNumberPlayArea: OnesPlayArea;
  public readonly dogPlayArea: OnesPlayArea;
  public readonly applePlayArea: OnesPlayArea;
  public readonly butterflyPlayArea: OnesPlayArea;
  public readonly ballPlayArea: OnesPlayArea;
  private readonly numberProperties: NumberProperty[];

  public constructor( tandem: Tandem ) {

    this.numberStacks = [];
    this.numberPieces = createObservableArray();
    this.tenFrames = createObservableArray();

    // Number stacks
    _.range( 1, 21 ).forEach( number => {
      const stack = new NumberStack( number, 2, false );
      stack.numberPieces.push( new NumberPiece( number ) );
      stack.numberPieces.push( new NumberPiece( number ) );
      this.numberStacks.push( stack );
    } );

    // TODO: Create play areas with loop instead and do the same in ScreenView
    this.numberProperties = [];
    _.times( NUMBER_OF_PLAY_AREAS, () => {
      this.numberProperties.push( new NumberProperty( 0, { range: new Range( 0, HIGHEST_COUNT ) } ) );
    } );

    // create five different kinds of play areas
    this.paperNumberPlayArea = new OnesPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( true ),
      'paperNumberPlayArea', {
        tenFrames: this.tenFrames
      } );
    this.dogPlayArea = new OnesPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'dogPlayArea', {
        tenFrames: this.tenFrames
      } );
    this.applePlayArea = new OnesPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'applePlayArea', {
        tenFrames: this.tenFrames
      } );
    this.butterflyPlayArea = new OnesPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'butterflyPlayArea', {
        tenFrames: this.tenFrames
      } );
    this.ballPlayArea = new OnesPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'ballPlayArea', {
        tenFrames: this.tenFrames
      } );
  }

  /**
   * Called when the user drags a number piece from a stack.
   */
  public dragNumberPieceFromStack( numberPiece: NumberPiece ): void {
    this.numberPieces.push( numberPiece );
  }

  /**
   * Returns a corresponding NumberStack that should be used as the "home" of a given NumberPiece (if it's returned from
   * the play area with an animation, etc.)
   */
  public findMatchingNumberStack( numberPiece: NumberPiece ): NumberStack | null {
    return _.find( this.numberStacks, stack => stack.number === numberPiece.number ) || null;
  }

  /**
   * Animates a piece back to its "home" stack.
   */
  public returnNumberPiece( numberPiece: NumberPiece ): void {
    const numberStack = this.findMatchingNumberStack( numberPiece );
    if ( numberStack ) {
      const offset = NumberStack.getOffset( numberStack.numberPieces.length );
      numberPiece.animator.animateTo( {
        position: numberStack.positionProperty.value.plus( offset.timesScalar( FractionsCommonConstants.NUMBER_BUILD_SCALE ) ),
        scale: 1,
        animationInvalidationProperty: numberStack.positionProperty,
        endAnimationCallback: () => {
          this.numberPieces.remove( numberPiece );
          if ( numberStack.isMutable ) {
            numberStack.numberPieces.push( numberPiece );
          }
        }
      } );
    }
  }

  /**
   * Called when a NumberPiece is dropped by the user.
   *
   * @param numberPiece
   * @param threshold - How much distance to allow between the piece and a container/group for it to be
   *                             dropped inside.
   */
  public numberPieceDropped( numberPiece: NumberPiece, threshold: number ): void {
    const numberPiecePosition = numberPiece.positionProperty.value;
    const sortedNumberStacks = _.sortBy( this.numberStacks, numberStack => {
      return numberStack.positionProperty.value.distance( numberPiecePosition );
    } );
    const closestNumberStack = sortedNumberStacks.shift();

    if ( closestNumberStack &&
         numberPiecePosition.distance( closestNumberStack.positionProperty.value ) < NUMBER_PIECE_RETURN_THRESHOLD ) {
      this.returnNumberPiece( numberPiece );
    }
  }

  /**
   * Called when the user drags a ten frame from a stack.
   */
  public dragTenFrameFromIcon( tenFrame: TenFrame ): void {
    this.tenFrames.push( tenFrame );
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    this.paperNumberPlayArea.reset();
    this.dogPlayArea.reset();
    this.applePlayArea.reset();
    this.butterflyPlayArea.reset();
    this.ballPlayArea.reset();
    this.numberPieces.clear();
    this.tenFrames.clear();
    this.numberProperties.forEach( numberProperty => numberProperty.reset() );
  }

  /**
   * Steps the model.
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {
    this.numberPieces.forEach( numberPiece => numberPiece.step( dt ) );
  }
}

numberPlay.register( 'LabModel', LabModel );
export default LabModel;