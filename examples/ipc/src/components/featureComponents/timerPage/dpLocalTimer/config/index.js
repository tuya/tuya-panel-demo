/* eslint-disable camelcase */
const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const react_native_1 = require('react-native');
const buildStyleInterpolator_1 = __importDefault(
  require('react-native/Libraries/Utilities/buildStyleInterpolator')
);

const SCREEN_HEIGHT = react_native_1.Dimensions.get('window').height;
const PIXEL_RATIO = react_native_1.PixelRatio.get();
const FromTheFront = {
  opacity: {
    value: 1.0,
    type: 'constant',
  },
  transformTranslate: {
    from: { x: 0, y: SCREEN_HEIGHT, z: 0 },
    to: { x: 0, y: 0, z: 0 },
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PIXEL_RATIO,
  },
  translateY: {
    from: SCREEN_HEIGHT,
    to: 0,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PIXEL_RATIO,
  },
  scaleX: {
    value: 1,
    type: 'constant',
  },
  scaleY: {
    value: 1,
    type: 'constant',
  },
};
const ToTheBack = {
  // Rotate *requires* you to break out each individual component of
  // rotation (x, y, z, w)
  transformTranslate: {
    from: { x: 0, y: 0, z: 0 },
    to: { x: 0, y: 0, z: 0 },
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PIXEL_RATIO,
  },
  transformScale: {
    from: { x: 1, y: 1, z: 1 },
    to: { x: 1, y: 1, z: 1 },
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
  },
  opacity: {
    from: 1,
    to: 1,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: false,
    round: 100,
  },
  scaleX: {
    from: 1,
    to: 0.95,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
  },
  scaleY: {
    from: 1,
    to: 0.95,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
  },
};
exports.FloatFromBottom = {
  // No gestures.
  gestures: null,
  springFriction: 26,
  springTension: 200,
  defaultTransitionVelocity: 1.5,
  animationInterpolators: {
    into: buildStyleInterpolator_1.default(FromTheFront),
    out: buildStyleInterpolator_1.default(ToTheBack),
  },
};
