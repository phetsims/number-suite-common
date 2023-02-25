// Copyright 2022-2023, University of Colorado Boulder

/**
 * A button that shows NoVoiceWarningDialog when pressed.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import SceneryPhetConstants from '../../../../scenery-phet/js/SceneryPhetConstants.js';
import { Color, Path } from '../../../../scenery/js/imports.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NoVoiceWarningDialog from './NoVoiceWarningDialog.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

// constants
// TODO: Factor out with other buttons https://github.com/phetsims/number-suite-common/issues/29
const SIDE_LENGTH = SceneryPhetConstants.DEFAULT_BUTTON_RADIUS * 2; // match the size of the ResetAllButton, in screen coords

class NoVoiceWarningButton extends RectangularPushButton {

  public constructor( hasVoiceProperty: TReadOnlyProperty<boolean> ) {

    const warningDialog = new NoVoiceWarningDialog();

    super( {
      content: new Path( exclamationTriangleSolidShape, {
        fill: new Color( 240, 79, 79 )
      } ),
      size: new Dimension2( SIDE_LENGTH, SIDE_LENGTH ),
      baseColor: Color.WHITE,
      listener: () => warningDialog.show(),
      visibleProperty: new DerivedProperty( [ hasVoiceProperty ], hasVoice => !hasVoice )
    } );
  }
}

numberSuiteCommon.register( 'NoVoiceWarningButton', NoVoiceWarningButton );
export default NoVoiceWarningButton;