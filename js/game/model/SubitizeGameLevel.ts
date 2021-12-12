// Copyright 2021, University of Colorado Boulder

/**
 * SubitizeGameLevel is the class for a 'Subitize' game level model.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import numberPlay from '../../numberPlay.js';
import NumberPlayGameLevel from './NumberPlayGameLevel.js';
import Subitizer from './Subitizer.js';
import numberPlayStrings from '../../numberPlayStrings.js';

// constants
const LEVEL_INPUT_RANGE = 5;

class SubitizeGameLevel extends NumberPlayGameLevel {

  public readonly subitizer: Subitizer;

  constructor( levelNumber: number ) {
    super( levelNumber, numberPlayStrings.subitize, LEVEL_INPUT_RANGE );

    this.subitizer = new Subitizer(
      this.challengeNumberProperty,
      this.isChallengeSolvedProperty,
      this.numberOfAnswerButtonPressesProperty,
      levelNumber === 1
    );
  }

  /**
   * Sets up a new challenge for this level.
   */
  public newChallenge(): void {
    super.newChallenge();
    this.subitizer.newChallenge();
  }

  public reset(): void {
    super.reset();
    this.subitizer.reset();
  }

  public step( dt: number ): void {
    this.subitizer.step( dt );
  }
}

numberPlay.register( 'SubitizeGameLevel', SubitizeGameLevel );
export default SubitizeGameLevel;