// Copyright 2022-2025, University of Colorado Boulder

/**
 * Panel for creating symbol cards.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import NumberSuiteCommonPreferences from '../../common/model/NumberSuiteCommonPreferences.js';
import NumberSuiteCommonPanel from '../../common/view/NumberSuiteCommonPanel.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import LabModel from '../model/LabModel.js';
import CardCreatorNode from './CardCreatorNode.js';
import LabScreenView from './LabScreenView.js';
import SymbolCardNode from './SymbolCardNode.js';
import SymbolType from './SymbolType.js';

// constants
const MAX_SYMBOL_PIECE_COUNT = 10;
const SPACING = 10;

class SymbolCardCreatorPanel extends NumberSuiteCommonPanel {

  private readonly symbolTypeToCountPropertyMap: Map<SymbolType, Property<number>>;

  // removes and disposes all types of symbol nodes
  private readonly clearSymbolNodes: () => void;
  private readonly screenView: LabScreenView<NumberSuiteCommonPreferences>;

  public constructor( model: LabModel, screenView: LabScreenView<NumberSuiteCommonPreferences>, symbolTypes: SymbolType[] ) {

    const cardsHeight = ( SymbolCardNode.WIDTH + SPACING ) * symbolTypes.length;
    const yMargin = symbolTypes.length > 3 ? SPACING * 2 : SPACING;
    const creatorNodeBackground = new Rectangle( 0, 0, SymbolCardNode.WIDTH, cardsHeight + yMargin );

    const symbolTypeToCountPropertyMap = new Map<SymbolType, Property<number>>();
    const symbolTypeToCreatorNodeMap = new Map<SymbolType, Node>();

    symbolTypes.forEach( symbolType => {

      // Property to count the number of each type of symbol node
      const countProperty = new NumberProperty( 0 );
      symbolTypeToCountPropertyMap.set( symbolType, countProperty );

      // make a creator node for the SymbolNode type
      const creatorNode = new CardCreatorNode( screenView, symbolTypeToCountPropertyMap, {
        symbolType: symbolType
      } );
      symbolTypeToCreatorNodeMap.set( symbolType, creatorNode );
    } );

    const iconNodes = new VBox( {
      children: [ ...Array.from( symbolTypeToCreatorNodeMap.values() ) ],
      spacing: SPACING,
      resize: false // don't shift contents when one of the creator nodes is hidden
    } );

    iconNodes.center = creatorNodeBackground.center;
    creatorNodeBackground.addChild( iconNodes );

    super( creatorNodeBackground, {
      xMargin: 10
    } );

    this.screenView = screenView;
    this.symbolTypeToCountPropertyMap = symbolTypeToCountPropertyMap;

    // make a creator node invisible if the max number for its type has been created
    symbolTypeToCountPropertyMap.forEach( ( countProperty, symbolType ) => {
      assert && assert( symbolTypeToCreatorNodeMap.has( symbolType ), `Node not found for symbolType: ${symbolType}` );
      countProperty.link( count => {
        symbolTypeToCreatorNodeMap.get( symbolType )!.visible = count < MAX_SYMBOL_PIECE_COUNT;
      } );
    } );

    this.clearSymbolNodes = () => {
      const allSymbolNodes = this.getAllSymbolNodes();
      allSymbolNodes.forEach( symbolNode => {
        screenView.pieceLayer.removeChild( symbolNode );
        symbolNode.dispose();
      } );
    };
  }

  /**
   * Clears all cards and resets their counts.
   */
  public reset(): void {
    this.clearSymbolNodes();
    this.symbolTypeToCountPropertyMap.forEach( countProperty => {
      countProperty.reset();
    } );
  }

  /**
   * Returns all existing cards in the countingArea.
   */
  public getAllSymbolNodes(): SymbolCardNode[] {
    const allSymbolNodes = _.filter( this.screenView.pieceLayer.children,
      child => child instanceof SymbolCardNode );
    return allSymbolNodes;
  }
}

numberSuiteCommon.register( 'SymbolCardCreatorPanel', SymbolCardCreatorPanel );
export default SymbolCardCreatorPanel;