/* eslint-disable */
import SimLauncher from '../../joist/js/SimLauncher.js';
const image = new Image();
const unlock = SimLauncher.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;