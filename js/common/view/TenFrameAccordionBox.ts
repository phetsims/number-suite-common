// Copyright 2019-2022, University of Colorado Boulder

/**
 * Class for the 'Ten Frame' accordion box, which is the panel in the upper right corner of the sim that displays a
 * dot-grid representation of the current number.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberPlayStrings from '../../numberPlayStrings.js';
import numberPlay from '../../numberPlay.js';
import NumberPlayConstants from '../NumberPlayConstants.js';
import TenFrameNode from './TenFrameNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import NumberPlayAccordionBox, { NumberPlayAccordionBoxOptions } from './NumberPlayAccordionBox.js';
import optionize from '../../../../phet-core/js/optionize.js';

// types
type TenFrameAccordionBoxSelfOptions = {
  tenFrameOffsetX: number;
};
export type TenFrameAccordionBoxOptions = TenFrameAccordionBoxSelfOptions & NumberPlayAccordionBoxOptions;

class TenFrameAccordionBox extends NumberPlayAccordionBox {

  constructor( currentNumberProperty: NumberProperty, height: number, options: TenFrameAccordionBoxOptions ) {

    super( NumberPlayConstants.UPPER_OUTER_ACCORDION_BOX_WIDTH, height,
      optionize<TenFrameAccordionBoxOptions, TenFrameAccordionBoxSelfOptions, NumberPlayAccordionBoxOptions>()( {
        titleString: numberPlayStrings.tenFrame,
        titleMaxWidth: NumberPlayConstants.UPPER_OUTER_AB_TITLE_MAX_WIDTH
      }, options ) );

    // create, scale, and add the TenFrameNode
    const tenFrameNode = new TenFrameNode( currentNumberProperty );
    tenFrameNode.scale( height / tenFrameNode.height / 2 );
    tenFrameNode.centerX = this.contentBounds.centerX + options.tenFrameOffsetX;
    tenFrameNode.centerY = this.contentBounds.centerY;
    this.contentNode.addChild( tenFrameNode );
  }
}

numberPlay.register( 'TenFrameAccordionBox', TenFrameAccordionBox );
export default TenFrameAccordionBox;