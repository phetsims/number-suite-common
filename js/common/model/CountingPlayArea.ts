// Copyright 2019-2023, University of Colorado Boulder

/**
 * Model for the Explore screen in Make a Ten. Includes the total, cues, and adding in initial numbers. This file was
 * copied in part from make-a-ten/explore/model/MakeATenExploreModel.js
 * then modified by @chrisklus to be used in number-play.
 *
 * @author Sharfudeen Ashraf
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import CountingCommonModel from '../../../../counting-common/js/common/model/CountingCommonModel.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import TenFrame from '../../lab/model/TenFrame.js';
import Property from '../../../../axon/js/Property.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

type SelfOptions = {
  tenFrames?: null | ObservableArray<TenFrame>;
};
export type CountingPlayAreaOptions = SelfOptions;

type CreateCountingObjectFromBucketOptions = {
  shouldAnimate?: boolean;
  value?: number;
  remainder?: boolean;
};
type CountingObjectSerialization = {
  position: Vector2;
  numberValue: number;
};

// constants
const GROUP_DIVISORS = [ 2, 5, 10 ]; // specified by designer

// the minimum distance that a playObject added to the play area via animation can be to another playObject in the
// play area, in screen coordinates
const MIN_DISTANCE_BETWEEN_ADDED_PLAY_OBJECTS = 60;

class CountingPlayArea extends CountingCommonModel {
  private getCountingObjectOrigin: () => Vector2;
  private playAreaBoundsProperty: TReadOnlyProperty<Bounds2>;
  private organizedObjectSpots: Vector2[];

  // true when this.getCountingObjectOrigin() and this.playAreaBoundsProperty have been set
  private initialized: boolean;
  private countingObjectCreatorNodeHeight: number;

  // contains any ten frames that are in the play area
  public readonly tenFrames: ObservableArray<TenFrame> | null;
  public readonly groupingEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor( highestCount: number, groupingEnabledProperty: TReadOnlyProperty<boolean>, name: string,
                      providedOptions?: CountingPlayAreaOptions ) {
    super( highestCount, name );

    const options = optionize<CountingPlayAreaOptions, SelfOptions>()( {
      tenFrames: null
    }, providedOptions );

    this.groupingEnabledProperty = groupingEnabledProperty;

    // set later by the view
    this.getCountingObjectOrigin = () => Vector2.ZERO;
    this.countingObjectCreatorNodeHeight = 0;
    this.playAreaBoundsProperty = new Property( new Bounds2( 0, 0, 0, 0 ) );
    this.organizedObjectSpots = [ Vector2.ZERO ];

    this.initialized = false;

    this.tenFrames = options.tenFrames;

    // when grouping is turned off, break apart any object groups
    this.groupingEnabledProperty.lazyLink( groupingEnabled => {
      !groupingEnabled && this.breakApartCountingObjects( true );
    } );

    this.countingObjects.addItemRemovedListener( countingObject => { countingObject.dispose(); } );
  }

  /**
   * Setup the origin and bounds needed from the view
   */
  public initialize( getCountingObjectOrigin: () => Vector2, countingObjectCreatorNodeHeight: number,
                     playAreaBoundsProperty: TReadOnlyProperty<Bounds2> ): void {
    assert && assert( !this.initialized, 'CountingPlayArea already initialized' );

    // use a function for getting the paper number origin because its position changes in the view
    this.getCountingObjectOrigin = getCountingObjectOrigin;
    this.countingObjectCreatorNodeHeight = countingObjectCreatorNodeHeight;
    this.playAreaBoundsProperty = playAreaBoundsProperty;
    this.initialized = true;

    this.organizedObjectSpots = this.calculateOrganizedObjectSpots();
  }

  /**
   * Create and randomly position a group of objects whose sum is the current number.
   */
  public createAllObjects( currentNumber: number, setAllObjectsAsGrouped: boolean ): void {
    this.removeAllCountingObjects();
    const objectShouldAnimate = false;

    if ( setAllObjectsAsGrouped ) {
      const divisor = dotRandom.sample( GROUP_DIVISORS );
      const numberOfCards = Math.floor( currentNumber / divisor );
      const remainderCardValue = currentNumber % divisor;

      _.times( numberOfCards, () => {
        this.createCountingObjectFromBucket( {
          shouldAnimate: objectShouldAnimate,
          value: divisor
        } );
      } );

      if ( remainderCardValue ) {
        this.createCountingObjectFromBucket( {
          shouldAnimate: objectShouldAnimate,
          value: remainderCardValue,
          remainder: true
        } );
      }
    }
    else {
      _.times( currentNumber, () => {
        this.createCountingObjectFromBucket( {
          shouldAnimate: objectShouldAnimate
        } );
      } );
    }

    this.calculateTotal();
  }

  /**
   * Creates a countingObject and animates it to a random open place in the play area.
   */
  public createCountingObjectFromBucket( providedOptions?: CreateCountingObjectFromBucketOptions ): void {
    assert && assert( this.initialized, 'createCountingObjectFromBucket called before initialization' );

    const options = optionize<CreateCountingObjectFromBucketOptions>()( {
      shouldAnimate: true,
      value: NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE,
      remainder: false
    }, providedOptions );

    let destinationPosition;
    let findCount = 0;

    const countingObject = new CountingObject( options.value, Vector2.ZERO, {
      groupingEnabledProperty: this.groupingEnabledProperty
    } );
    const origin = this.getCountingObjectOrigin().minus( countingObject.localBounds.center );
    const scale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE :
                  NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
    countingObject.setDestination( origin, false, {
      targetScale: scale
    } );

    //TODO https://github.com/phetsims/number-suite-common/issues/29 This is kind of a band-aid to keep the grouped objects' handles from sticking out of the top of the play
    // area since they are not yet included in countingObject.localBounds above without a view created
    const playAreaBoundsMinY = this.groupingEnabledProperty.value ? 30 : 0;

    // NOTE: The calculation below assumes that the countingObjectCreatorNode is positioned along the bottom of the playArea
    // bounds, see positioning in CountingPlayAreaNode
    const playAreaBounds = this.playAreaBoundsProperty.value
      .withMinY( this.playAreaBoundsProperty.value.minY + playAreaBoundsMinY )
      .withMaxY( this.playAreaBoundsProperty.value.maxY - this.countingObjectCreatorNodeHeight );
    const countingObjectOriginBounds = countingObject.getOriginBounds( playAreaBounds );

    //TODO https://github.com/phetsims/number-suite-common/issues/29 this algorithm does not take into account paper numbers that are on their way to a spot, and should
    // be rewritten to be better and accommodate that constraint
    // looks for positions that are not overlapping with other playObjects in the play area
    while ( !destinationPosition ) {
      const possibleDestinationX = dotRandom.nextDouble() * ( countingObjectOriginBounds.maxX - countingObjectOriginBounds.minX ) +
                                   countingObjectOriginBounds.minX;
      const possibleDestinationY = dotRandom.nextDouble() * ( countingObjectOriginBounds.maxY - countingObjectOriginBounds.minY ) +
                                   countingObjectOriginBounds.minY;
      const possibleDestinationPoint = new Vector2( possibleDestinationX, possibleDestinationY );
      let spotIsAvailable = true;
      const numberOfCountingObjectsInPlayArea = this.countingObjects.lengthProperty.value;

      // compare the proposed destination to the position of every playObject in the play area. use c-style loop for
      // best performance, since this loop is nested
      for ( let i = 0; i < numberOfCountingObjectsInPlayArea; i++ ) {
        if ( this.countingObjects[ i ].positionProperty.value.distance( possibleDestinationPoint )
             < MIN_DISTANCE_BETWEEN_ADDED_PLAY_OBJECTS ) {
          spotIsAvailable = false;
        }
      }

      // bail if taking a while to find a spot. 1000 empirically determined.
      if ( ++findCount > 1000 ) {
        spotIsAvailable = true;
      }
      destinationPosition = spotIsAvailable ? possibleDestinationPoint : null;
    }

    countingObject.setDestination( destinationPosition, options.shouldAnimate, {
      targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE
    } );
    this.addCountingObject( countingObject );

    this.calculateTotal();
  }

  /**
   * Finds the closest countingObject to their origin and animates it back over the bucket. If only countingObjects with
   * values greater than one exist, break them up and send their components with values of one back.
   */
  //TODO https://github.com/phetsims/number-suite-common/issues/29 Rename to something that indicates finding closest paper number to return
  public returnCountingObjectToBucket(): void {
    assert && assert( this.countingObjects.lengthProperty.value > 0, 'countingObjects should exist in play area' );
    assert && assert( this.initialized, 'returnCountingObjectToBucket called before initialization' );

    // sort by not in a ten frame, then by lowest value, then by proximity to the bucket
    const sortedCountingObjects = _.sortBy( this.getCountingObjectsIncludedInSum(), [
      countingObject => {
        return this.countingObjectContainedByTenFrame( countingObject ) ? 1 : 0;
      },
      countingObject => {
        return countingObject.numberValueProperty.value;
      },
      countingObject => {
        return countingObject.positionProperty.value.distance( this.getCountingObjectOrigin() );
      }
    ] );

    let countingObjectToReturn = sortedCountingObjects.shift();
    if ( countingObjectToReturn ) {

      // if the chosen paperNumber has a value greater than 1, break it up by creating a new paperNumber with a value of
      // 1 to return instead
      if ( countingObjectToReturn.numberValueProperty.value > NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE ) {
        const amountRemaining = countingObjectToReturn.numberValueProperty.value - NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE;
        countingObjectToReturn.changeNumber( amountRemaining );

        countingObjectToReturn = new CountingObject(
          NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE,
          countingObjectToReturn.positionProperty.value, {
            groupingEnabledProperty: this.groupingEnabledProperty
          } );
        this.addCountingObject( countingObjectToReturn );
      }

      if ( this.countingObjectContainedByTenFrame( countingObjectToReturn ) ) {
        const tenFrame = this.getContainingTenFrame( countingObjectToReturn );
        tenFrame.removeCountingObject();
      }
      else {
        this.sendCountingObjectToCreatorNode( countingObjectToReturn );
      }
    }
  }

  /**
   * Animates the given countingObject back to its creator node.
   */
  public sendCountingObjectToCreatorNode( countingObject: CountingObject ): void {
    assert && assert( this.countingObjects.lengthProperty.value > 0, 'countingObjects should exist in play area' );
    assert && assert( this.initialized, 'returnCountingObjectToBucket called before initialization' );
    assert && assert( countingObject.includeInSumProperty.value, 'countingObject already removed from sum' );

    // Remove it from counting towards the sum and send it back to its origin. countingObjects aren't removed from the
    // playArea until they get back to the bucket, but we don't want them to count towards the sum while they're on
    // their way to the bucket.
    if ( countingObject.includeInSumProperty.value ) {
      countingObject.includeInSumProperty.value = false;
      this.calculateTotal();

      const origin = this.getCountingObjectOrigin().minus( countingObject.localBounds.center );
      const scale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE :
                    NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;

      countingObject.setDestination( origin, true, {
        targetScale: scale
      } );
    }
  }

  /**
   * Returns true if the provided countingObject is contained by a tenFrame
   */
  private countingObjectContainedByTenFrame( countingObject: CountingObject ): boolean {
    if ( this.tenFrames ) {
      let foundInTenFrame = false;

      this.tenFrames.forEach( tenFrame => {
        if ( tenFrame.countingObjects.includes( countingObject ) ) {
          foundInTenFrame = true;
        }
      } );
      return foundInTenFrame;
    }
    else {
      return false;
    }
  }

  /**
   * Returns the tenFrame that the countingObject is contained by. Should only be called if the countingObject is known to be
   * contained by a tenFrame.
   */
  private getContainingTenFrame( countingObject: CountingObject ): TenFrame {
    assert && assert( this.tenFrames, 'should not be called if there are no ten frames' );

    let containingTenFrame: TenFrame;

    this.tenFrames!.forEach( tenFrame => {
      if ( tenFrame.countingObjects.includes( countingObject ) ) {
        containingTenFrame = tenFrame;
      }
    } );

    assert && assert( containingTenFrame!, 'no containing tenFrame found for countingObject' );

    return containingTenFrame!;
  }

  /**
   * Calculates the spots for organized objects
   */
  private calculateOrganizedObjectSpots(): Vector2[] {
    assert && assert( this.initialized, 'calculateOrganizedObjectSpots called before initialization' );

    const objectWidth = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.width;
    const objectHeight = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.height;
    const objectMargin = 3;

    const numberOfColumns = 5; // rows
    const numberOfRows = this.sumProperty.range.max / numberOfColumns;

    //TODO https://github.com/phetsims/number-suite-common/issues/29 figure out why math isn't working for this
    const xMargin = 88; // empirically determined to center group
    const yMargin = CountingCommonConstants.COUNTING_PLAY_AREA_MARGIN;

    const spots = [];

    for ( let i = 0; i < numberOfRows; i++ ) {
      for ( let j = 0; j < numberOfColumns; j++ ) {
        spots.push( new Vector2(
          this.playAreaBoundsProperty.value.minX + xMargin + ( ( objectWidth + objectMargin ) * j ),
          this.playAreaBoundsProperty.value.minY + yMargin + ( ( objectHeight + objectMargin ) * i )
        ) );
      }
    }
    return spots;
  }

  private getCountingObjectsIncludedInSum(): CountingObject[] {
    return [ ...this.countingObjects ].filter( countingObject => countingObject.includeInSumProperty.value );
  }

  public getSerializedCountingObjectsIncludedInSum(): CountingObjectSerialization[] {
    const countingObjectsIncludedInSum = this.getCountingObjectsIncludedInSum();

    const countingObjectPositions: CountingObjectSerialization[] = [];
    countingObjectsIncludedInSum.forEach( countingObject => {
      countingObjectPositions.push( {
        position: countingObject.positionProperty.value,
        numberValue: countingObject.numberValueProperty.value
      } );
    } );

    return countingObjectPositions;
  }

  /**
   * Organizes the countingObjects in a grid pattern.
   * // TODO: This is inherently for singles only??? https://github.com/phetsims/number-suite-common/issues/12
   */
  public organizeObjects(): void {

    assert && assert( this.organizedObjectSpots, 'this.organizedObjectSpots must exist to call this function' );

    this.breakApartCountingObjects();

    // copy the current playObjectsInPlayArea so we can mutate it
    let objectsToOrganize = this.getCountingObjectsIncludedInSum();
    const numberOfObjectsToOrganize = objectsToOrganize.length;

    for ( let i = 0; i < numberOfObjectsToOrganize; i++ ) {
      const destination = this.organizedObjectSpots[ i ];

      // sort the  playObjectToOrganize by closest to the destination
      objectsToOrganize = _.sortBy( objectsToOrganize, object => {
        return object.positionProperty.value.distance( destination );
      } );
      const objectToOrganize = objectsToOrganize.shift();

      objectToOrganize && objectToOrganize.setDestination( destination, true, {
        targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE
      } );
    }
  }

  public matchCountingObjectsToLinkedPlayArea( countingObjectSerializations: CountingObjectSerialization[],
                                               objectsLinkedEmitter: TEmitter<[ boolean ]>, objectsLinkedToOnes: boolean ): void {

    const callback = () => {

      objectsLinkedEmitter.emit( objectsLinkedToOnes );
    };
    const animate = objectsLinkedToOnes;

    // copy the current playObjectsInPlayArea so we can mutate it
    const objectsToOrganize = this.getCountingObjectsIncludedInSum();
    let numberOfObjectsToOrganize = objectsToOrganize.length;

    // TODO: better way to track these? https://github.com/phetsims/number-suite-common/issues/12
    const numberOfAnimationsFinishedProperty = new NumberProperty( 0 );


    /*
    * If not linking, it is without animation. This part is really simple. Just clear out all the counting objects in
    * the objectsPlayArea, and add new ones that match the serialization from the onesPlayArea (position and numberValue
    * matching).
     */
    if ( !objectsLinkedToOnes ) {
      objectsToOrganize.forEach( countingObject => this.removeCountingObject( countingObject ) );

      countingObjectSerializations.forEach( serialization => {
        const newCountingObject = new CountingObject( serialization.numberValue, serialization.position, {
          groupingEnabledProperty: this.groupingEnabledProperty
        } );
        this.addCountingObject( newCountingObject );
      } );
    }
    else {

      /**
       * If linking, then we NEVER need to combine, but we may want to break apart so that half of a group can animate
       * to one spot and the other half another. Don't use breakApartObjects because that is
       * overkill and bad UX (imagine both models have a group of 4, don't split that up to animate in one model). Then Animate
       * to the right spots. Never combine because we don't need to do that right now (maybe it would be easier for the
       * code though
       */

      const inputSortedByValue: CountingObjectSerialization[] = _.sortBy( countingObjectSerializations,
          countingObjectSerialization => countingObjectSerialization.numberValue ).reverse();

      const sendObjectTo = ( countingObject: CountingObject, position: Vector2 ) => {

        // TODO: do we need the copy, it used to be plusXY(0,0)? https://github.com/phetsims/number-suite-common/issues/12
        countingObject.setDestination( position.copy(), animate, {
          targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE,
          useStandardAnimationSpeed: false
        } );
        countingObject.endAnimationEmitter.addListener( () => {
          numberOfAnimationsFinishedProperty.value = numberOfAnimationsFinishedProperty.value += 1;
        } );
      };

      // TODO: sort by position after value inside for loop, based on target https://github.com/phetsims/number-suite-common/issues/12
      let countingObjectsSortedByValue: CountingObject[] = _.sortBy( this.getCountingObjectsIncludedInSum(),
        countingObject => countingObject.numberValueProperty.value ).reverse();
      const handledCountingObjects: CountingObject[] = [];

      for ( let i = 0; i < inputSortedByValue.length; i++ ) {
        console.log( 'for here' );

        const target = inputSortedByValue[ i ];
        const desiredValue = target.numberValue;

        let currentNumberValueCount = 0;

        while ( countingObjectsSortedByValue.length ) {

          console.log( 'while here' );

          const currentCountingObject = countingObjectsSortedByValue[ 0 ];
          assert && assert( this.countingObjects.includes( currentCountingObject ), 'old, removed countingObject still at play here' );
          assert && assert( !handledCountingObjects.includes( currentCountingObject ), 'already handled bro' );

          const nextNeededValue = desiredValue - currentNumberValueCount;

          if ( currentCountingObject.numberValueProperty.value <= nextNeededValue ) {
            // debugger;
            console.log( 'animating: ' + currentCountingObject.positionProperty.value );
            sendObjectTo( currentCountingObject, target.position );
            handledCountingObjects.push( countingObjectsSortedByValue.shift()! );
            currentNumberValueCount += currentCountingObject.numberValueProperty.value;
          }
          else if ( currentCountingObject.numberValueProperty.value > nextNeededValue ) {

            // TODO: recalculate numberOfObjectsToOrganize https://github.com/phetsims/number-suite-common/issues/12
            // TODO: instead of totally breaking down, only break off what you need to use https://github.com/phetsims/number-suite-common/issues/12
            this.breakApartCountingObjects( true, [ currentCountingObject ], false );
            // assert && assert( this.countingObjects[ this.countingObjects.length - 1 ].positionProperty.value.equals( currentCountingObject.positionProperty.value ), 'help me please' );

            // Recompute
            // TODO: reorder calculation https://github.com/phetsims/number-suite-common/issues/12
            countingObjectsSortedByValue = _.sortBy( this.getCountingObjectsIncludedInSum(), countingObject => countingObject.numberValueProperty.value ).reverse()
              .filter( countingObject => !handledCountingObjects.includes( countingObject ) );
            numberOfObjectsToOrganize = countingObjectsSortedByValue.length + handledCountingObjects.length;
          }

          if ( currentNumberValueCount === desiredValue ) {
            break;
          }
        }
      }
    }

    if ( animate ) {
      const numberOfAnimationsFinishedListener = ( numberOfAnimationsFinished: number ) => {
        if ( numberOfAnimationsFinished === numberOfObjectsToOrganize ) {
          callback && callback();
          numberOfAnimationsFinishedProperty.unlink( numberOfAnimationsFinishedListener );
        }
      };
      numberOfAnimationsFinishedProperty.link( numberOfAnimationsFinishedListener );
    }
    else {
      callback && callback();
    }
  }

  /**
   * Breaks apart all counting objects into counting objects with a value of 1. By default, it creates all new counting
   * objects in the position of the original counting object. If stack=true, it arranges them according to the
   * background shape of the original counting object.
   */
  public breakApartCountingObjects( stack = false, objectsToBreakDown = this.getCountingObjectsIncludedInSum(), assumeFullModel = true ): void {

    //TODO https://github.com/phetsims/number-suite-common/issues/29 cleanup and doc

    const startingCount = _.sum( objectsToBreakDown.map( x => x.numberValueProperty.value ) );

    objectsToBreakDown.forEach( countingObject => {
      if ( countingObject.numberValueProperty.value > 1 ) {
        const countingObjectPosition = countingObject.positionProperty.value;
        const countingObjectValue = countingObject.numberValueProperty.value;

        const numberOfSets = countingObjectValue < NumberSuiteCommonConstants.TEN ? 1 : 2;
        const numberOfRows = NumberSuiteCommonConstants.TEN;

        const origin = stack ? countingObjectPosition.minusXY( 0, 25 ) : countingObjectPosition;
        const offsetYSegment = stack ? CountingCommonConstants.BREAK_APART_Y_OFFSET : 0;

        let offsetY = 0;

        let reAddedCountingObjects = 0;
        const xShift = countingObjectValue >= NumberSuiteCommonConstants.TEN && stack ? -CountingCommonConstants.PLAY_OBJECT_SIZE.width : 0;

        this.removeCountingObject( countingObject );

        for ( let i = numberOfSets - 1; i >= 0; i-- ) {
          for ( let j = 0; j < numberOfRows; j++ ) {
            if ( reAddedCountingObjects < countingObjectValue ) {
              const newCountingObject = new CountingObject( 1, origin.plusXY( i * xShift, offsetY ), {
                groupingEnabledProperty: this.groupingEnabledProperty
              } );
              this.addCountingObject( newCountingObject );
              offsetY += offsetYSegment;
              reAddedCountingObjects++;
            }
          }
          offsetY = 0;
        }
      }
    } );

    // total the value of all counting objects after they have been broken up and re-created
    const newCount = _.sum( this.getCountingObjectsIncludedInSum().map( x => x.numberValueProperty.value ) );

    // Don't assert if just breaking apart a subsection of the countingObjects
    assert && assumeFullModel && assert( startingCount === newCount,
      'The value of all counting objects does not match their original value after breaking them apart' );
  }
}

numberSuiteCommon.register( 'CountingPlayArea', CountingPlayArea );
export default CountingPlayArea;
