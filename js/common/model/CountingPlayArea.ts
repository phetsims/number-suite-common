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
import GroupAndLinkType from './GroupAndLinkType.js';
import TProperty from '../../../../axon/js/TProperty.js';

type SelfOptions = {
  tenFrames?: null | ObservableArray<TenFrame>;
};
export type CountingPlayAreaOptions = SelfOptions;

type createCountingObjectFromCreatorNodeOptions = {
  shouldAnimate?: boolean;
  value?: number;
  remainder?: boolean;
};
export type CountingObjectSerialization = {
  position: Vector2;
  numberValue: number;
  zIndex: number;
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
        this.createCountingObjectFromCreatorNode( {
          shouldAnimate: objectShouldAnimate,
          value: divisor
        } );
      } );

      if ( remainderCardValue ) {
        this.createCountingObjectFromCreatorNode( {
          shouldAnimate: objectShouldAnimate,
          value: remainderCardValue,
          remainder: true
        } );
      }
    }
    else {
      _.times( currentNumber, () => {
        this.createCountingObjectFromCreatorNode( {
          shouldAnimate: objectShouldAnimate
        } );
      } );
    }

    this.calculateTotal();
  }

  /**
   * Creates a countingObject and animates it to a random open place in the play area.
   */
  public createCountingObjectFromCreatorNode( providedOptions?: createCountingObjectFromCreatorNodeOptions ): void {
    assert && assert( this.initialized, 'createCountingObjectFromCreatorNode called before initialization' );

    const options = optionize<createCountingObjectFromCreatorNodeOptions>()( {
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
   * Finds the best matching countingObject or countingObjects and animates them back to the creatorNode.
   */
  public returnCountingObjectToCreatorNode( valueToReturn: number = NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE ): void {
    assert && assert( this.getCountingObjectsIncludedInSum().length > 0, 'countingObjects should exist in play area' );
    assert && assert( this.initialized, 'returnCountingObjectToCreatorNode called before initialization' );

    // Sort by not in a ten frame, then by proximity to the creatorNode.
    const sortedCountingObjects = _.sortBy( this.getCountingObjectsIncludedInSum(), [
      countingObject => {
        return this.countingObjectContainedByTenFrame( countingObject ) ? 1 : 0;
      },
      countingObject => {
        return countingObject.positionProperty.value.distance( this.getCountingObjectOrigin() );
      }
    ] );

    /**
     * Recursively search for the best countingObjects to return to the creatorNode for the given value. The criteria
     * for the best matches is described below in the parts of this function.
     */
    const recursivelyFindBestMatches = ( value: number, sortedCountingObjects: CountingObject[] ): CountingObject[] => {

      let bestMatches: CountingObject[] = [];

      // Our base case is value === 0, when value is greater than zero, there is still work to be done.
      if ( value > 0 ) {

        // First, see if there are any countingObjects with the same value. If so, we are done.
        for ( let i = 0; i < sortedCountingObjects.length; i++ ) {
          const countingObject = sortedCountingObjects[ i ];

          // We want to grab the first countingObject that matches to also get the closest.
          if ( countingObject.numberValueProperty.value === value && bestMatches.length === 0 ) {
            bestMatches = [ countingObject ];
          }
        }

        // If there are none of the same value, find the largest countingObject.
        const largestCountingObject = _.maxBy( sortedCountingObjects, x => x.numberValueProperty.value )!;

        // If the value we're looking for is larger than the largest countingObject, then we're going to need to send
        // more than one countingObject back to the creatorNode. So include the largest, and then start the search over
        // for the next best match.
        if ( value > largestCountingObject.numberValueProperty.value ) {
          const nextValueToReturn = value - largestCountingObject.numberValueProperty.value;
          assert && assert( nextValueToReturn >= 0, 'The next value to return cannot be less than zero. nextValueToReturn = ' + nextValueToReturn );

          // Before starting the search again for the next countingObject, remove the one we know we want, so it's not
          // a part of the next search.
          _.remove( sortedCountingObjects, largestCountingObject );

          bestMatches = [ largestCountingObject, ...recursivelyFindBestMatches( nextValueToReturn, sortedCountingObjects ) ];
        }

          // If the value we're looking for is smaller than the largestCountingObject, create a new countingObject by
        // breaking off the value we need from the largest one.
        else if ( value < largestCountingObject.numberValueProperty.value ) {
          bestMatches = [ this.splitCountingObject( largestCountingObject, value ) ];
        }
      }

      return bestMatches;
    };

    const countingObjectsToReturn = recursivelyFindBestMatches( valueToReturn, sortedCountingObjects );

    // Send all of our matches back to the creator node.
    countingObjectsToReturn.forEach( countingObjectToReturn => {
      if ( this.countingObjectContainedByTenFrame( countingObjectToReturn ) ) {
        const tenFrame = this.getContainingTenFrame( countingObjectToReturn );
        tenFrame.removeCountingObject();
      }
      else {
        this.sendCountingObjectToCreatorNode( countingObjectToReturn );
      }
    } );
  }

  /**
   * Animates the given countingObject back to its creator node.
   */
  public sendCountingObjectToCreatorNode( countingObject: CountingObject ): void {
    assert && assert( this.countingObjects.lengthProperty.value > 0, 'countingObjects should exist in play area' );
    assert && assert( this.initialized, 'returnCountingObjectToCreatorNode called before initialization' );
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

  /**
   * Returns all countingObjects not included in the sum of this playArea.
   */
  public getCountingObjectsIncludedInSum(): CountingObject[] {
    return [ ...this.countingObjects ].filter( countingObject => countingObject.includeInSumProperty.value );
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
                                               objectsLinkedEmitter: TEmitter<[ boolean ]>, objectsLinkedToOnes: boolean,
                                               groupAndLinkType: GroupAndLinkType ): void {

    const objectsToOrganize = this.getCountingObjectsIncludedInSum();
    let numberOfObjectsToOrganize = objectsToOrganize.length;
    const numberOfAnimationsFinishedProperty = new NumberProperty( 0 );

    // TODO: we can factor out the whole block into its own function (including the iteration of inputs https://github.com/phetsims/number-suite-common/issues/12
    // If linking, then we NEVER need to combine, but we may want to break apart so that half of a group can animate
    // to one spot and the other half another. Don't use breakApartObjects because that is
    // overkill and bad UX (imagine both models have a group of 4, don't split that up to animate in one model). Then
    // animate to the right spots.
    if ( objectsLinkedToOnes ) {

      const inputSortedByValue: CountingObjectSerialization[] = _.sortBy( countingObjectSerializations,
        countingObjectSerialization => countingObjectSerialization.numberValue ).reverse();
      const animate = objectsLinkedToOnes; // Only animate if we are linking to the ones play area

      const countingObjectsSortedByValue = this.getCountingObjectsByValue();
      const handledCountingObjects: CountingObject[] = [];

      // Iterate through each input and try to mutate the current countingObjects list to support that target
      for ( let i = 0; i < inputSortedByValue.length; i++ ) {
        numberOfObjectsToOrganize = this.updateObjectsForSerialization( inputSortedByValue[ i ], numberOfObjectsToOrganize, countingObjectsSortedByValue,
          handledCountingObjects, numberOfAnimationsFinishedProperty, animate );
      }

      numberOfAnimationsFinishedProperty.link( function numberOfAnimationsFinishedListener( numberOfAnimationsFinished: number ) {
        if ( numberOfAnimationsFinished === numberOfObjectsToOrganize ) {
          objectsLinkedEmitter.emit( objectsLinkedToOnes );
          numberOfAnimationsFinishedProperty.unlink( numberOfAnimationsFinishedListener );
        }
      } );
    }
    else {
      // If not linking, it is without animation. This part is really simple. Just clear out all the counting objects in
      // the objectsPlayArea, and add new ones that match the serialization from the onesPlayArea (position and numberValue
      // matching).

      objectsToOrganize.forEach( countingObject => this.removeCountingObject( countingObject ) );

      _.sortBy( countingObjectSerializations, 'zIndex' ).forEach( serialization => {
        const newCountingObject = new CountingObject( serialization.numberValue, serialization.position, {
          groupingEnabledProperty: this.groupingEnabledProperty
        } );
        this.addCountingObject( newCountingObject );
      } );

      // If the groupAndLinkType was set to ungrouped, break apart the counting objects. This is needed to avoid an order
      // dependency problem when switching to an ungrouped state where the existing countingObjects are broken apart before
      // we clear them out and re-add them above.
      groupAndLinkType === GroupAndLinkType.UNGROUPED && this.breakApartCountingObjects( true );
      objectsLinkedEmitter.emit( objectsLinkedToOnes );
    }
  }

  /**
   * Will update the total number of counting objects that are desired. Can only increase, as objects are split apart.
   */
  private updateObjectsForSerialization( targetCountingObjects: CountingObjectSerialization,
                                         totalNumberOfCountingObjects: number,
                                         countingObjectsSortedByValue: CountingObject[],
                                         handledCountingObjects: CountingObject[],
                                         numberOfAnimationsFinishedProperty: Property<number>,
                                         animate: boolean ): number {

    const desiredValue = targetCountingObjects.numberValue;
    let currentNumberValueCount = 0;
    let targetHandled = false;

    for ( let j = 0; j < countingObjectsSortedByValue.length; j++ ) {
      const countingObject = countingObjectsSortedByValue[ j ];

      // If there is a match with the same value and position, then we don't need to call sendTo because this
      // countingObject is already in the correct spot.
      if ( countingObject.numberValueProperty.value === desiredValue &&
           countingObject.positionProperty.value.equals( targetCountingObjects.position ) ) {
        handledCountingObjects.push( countingObjectsSortedByValue.shift()! );
        currentNumberValueCount += countingObject.numberValueProperty.value;
        numberOfAnimationsFinishedProperty.value += 1;
        targetHandled = true;
      }
    }

    while ( !targetHandled && countingObjectsSortedByValue.length ) {

      const currentCountingObject = countingObjectsSortedByValue[ 0 ];
      assert && assert( this.countingObjects.includes( currentCountingObject ),
        'old, removed countingObject still at play here' );
      assert && assert( !handledCountingObjects.includes( currentCountingObject ),
        'currentCountingObject is already animating' );

      const nextNeededValue = desiredValue - currentNumberValueCount;

      if ( currentCountingObject.numberValueProperty.value <= nextNeededValue ) {
        this.sendCountingObjectTo( currentCountingObject, targetCountingObjects.position, numberOfAnimationsFinishedProperty, animate );
        handledCountingObjects.push( countingObjectsSortedByValue.shift()! );
        currentNumberValueCount += currentCountingObject.numberValueProperty.value;

        // We are done when we've reached the desired value.
        targetHandled = currentNumberValueCount === desiredValue;
      }
      else if ( currentCountingObject.numberValueProperty.value > nextNeededValue ) {

        // split off the value we need to be used in the next iteration
        this.splitCountingObject( currentCountingObject, nextNeededValue );

        // recompute after splitting
        const allCountingObjectsSortedByValue = this.getCountingObjectsByValue();

        totalNumberOfCountingObjects = allCountingObjectsSortedByValue.length;

        countingObjectsSortedByValue.length = 0;
        countingObjectsSortedByValue.push( ...allCountingObjectsSortedByValue.filter(
          countingObject => !handledCountingObjects.includes( countingObject ) ) );
      }
    }

    return totalNumberOfCountingObjects;
  }

  /**
   * Only meant to be used for "mass exodus" where we want to keep track of when all are finished animated to destination
   */
  private sendCountingObjectTo( countingObject: CountingObject,
                                position: Vector2,
                                numberOfAnimationsFinishedProperty: TProperty<number>,
                                animate: boolean ): void {

    countingObject.setDestination( position, animate, {
      targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE,
      useStandardAnimationSpeed: false
    } );
    countingObject.endAnimationEmitter.addListener( function toRemove() {
      numberOfAnimationsFinishedProperty.value += 1;
      countingObject.endAnimationEmitter.removeListener( toRemove );
    } );
  }

  /**
   * Returns a list with the largest value counting objects first (only included in sum).
   */
  private getCountingObjectsByValue(): CountingObject[] {
    return _.sortBy( this.getCountingObjectsIncludedInSum(), countingObject => countingObject.numberValueProperty.value ).reverse();
  }

  /**
   * Splits the provided countingObject into two countingObjects. This is a function for the model to use for automated
   * actions, and does not relate to the USER splitting a countingObject when grabbing the handle of countingObject.
   */
  private splitCountingObject( countingObject: CountingObject, valueToSplit: number ): CountingObject {
    assert && assert( countingObject.includeInSumProperty.value,
      'attempted to split countingObject that has already been removed from the total' );
    const startingCount = _.sum( this.getCountingObjectsIncludedInSum().map( x => x.numberValueProperty.value ) );

    const totalValue = countingObject.numberValueProperty.value;
    assert && assert( valueToSplit < totalValue,
      `desired split value (${valueToSplit}) is the same or greater than the countingObject to split's value (${totalValue})` );

    const newCountingObject = new CountingObject( valueToSplit, countingObject.positionProperty.value, {
      groupingEnabledProperty: this.groupingEnabledProperty
    } );
    this.addCountingObject( newCountingObject );

    countingObject.changeNumber( totalValue - valueToSplit );

    const endingCount = _.sum( this.getCountingObjectsIncludedInSum().map( x => x.numberValueProperty.value ) );
    assert && assert( startingCount === endingCount, 'total doesn\'t match after splitting counting object' );

    return newCountingObject;
  }

  /**
   * Breaks apart all counting objects into counting objects with a value of 1. By default, it creates all new counting
   * objects in the position of the original counting object. If stack=true, it arranges them according to the
   * background shape of the original counting object. Any newly created countingObjects are added in front of the
   * existing countingObjects (z-index).
   */
  public breakApartCountingObjects( stack = false ): void {

    //TODO https://github.com/phetsims/number-suite-common/issues/29 cleanup and doc

    const objectsToBreakDown = this.getCountingObjectsIncludedInSum();
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

    assert && assert( startingCount === newCount,
      'The value of all counting objects does not match their original value after breaking them apart' );
  }
}

numberSuiteCommon.register( 'CountingPlayArea', CountingPlayArea );
export default CountingPlayArea;
