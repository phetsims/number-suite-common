// Copyright 2019-2023, University of Colorado Boulder

/**
 * Model class for the 'Lab' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import TModel from '../../../../joist/js/TModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CountingPlayArea from '../../common/model/CountingPlayArea.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TenFrame from './TenFrame.js';
import NumberSuiteCommonConstants from '../../common/NumberSuiteCommonConstants.js';

// constants
const HIGHEST_COUNT = 20;

class LabModel implements TModel {
  public readonly tenFrames: ObservableArray<TenFrame>;

  // Whether the tenFrame icon is pickable by a user or not.
  public readonly tenFrameIconPickableProperty: Property<boolean>;
  public readonly onesPlayArea: CountingPlayArea;
  public readonly dogPlayArea: CountingPlayArea;
  public readonly applePlayArea: CountingPlayArea;
  public readonly butterflyPlayArea: CountingPlayArea;
  public readonly ballPlayArea: CountingPlayArea;
  public readonly selectedTenFrameProperty: TProperty<TenFrame | null>;

  public constructor( tandem: Tandem ) {

    this.tenFrames = createObservableArray();
    this.tenFrameIconPickableProperty = new BooleanProperty( this.tenFrames.length < NumberSuiteCommonConstants.MAX_AMOUNT_OF_TEN_FRAMES );
    this.selectedTenFrameProperty = new Property<TenFrame | null>( null );

    // create five different kinds of play areas
    this.dogPlayArea = new CountingPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'dogPlayArea', {
        tenFrames: this.tenFrames
      } );
    this.applePlayArea = new CountingPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'applePlayArea', {
        tenFrames: this.tenFrames
      } );
    this.butterflyPlayArea = new CountingPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'butterflyPlayArea', {
        tenFrames: this.tenFrames
      } );
    this.ballPlayArea = new CountingPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ),
      'ballPlayArea', {
        tenFrames: this.tenFrames
      } );
    this.onesPlayArea = new CountingPlayArea(
      HIGHEST_COUNT,
      new BooleanProperty( true ),
      'onesPlayArea', {
        tenFrames: this.tenFrames
      } );

    this.tenFrames.lengthProperty.link( length => {

      // Limit the amount of tenFrames a user can add to the screen
      this.tenFrameIconPickableProperty.value = length < NumberSuiteCommonConstants.MAX_AMOUNT_OF_TEN_FRAMES;
    } );

    this.tenFrames.addItemRemovedListener( tenFrame => {
      tenFrame.dispose();
    } );
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
    this.dogPlayArea.reset();
    this.applePlayArea.reset();
    this.butterflyPlayArea.reset();
    this.ballPlayArea.reset();
    this.onesPlayArea.reset();
    this.tenFrames.clear();
    this.tenFrameIconPickableProperty.reset();
  }
}

numberSuiteCommon.register( 'LabModel', LabModel );
export default LabModel;