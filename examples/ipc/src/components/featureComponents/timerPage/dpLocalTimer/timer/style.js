/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
const __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) {
      for (const k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    }
    result.default = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const react_native_1 = require('react-native');
const native_1 = __importStar(require('styled-components/native'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const theme_get_1 = require('../../theme/theme-get');
const DEFAULT_EMPTY_ICON = require('../res/emptyTimer.png');

const { get } = tuya_panel_kit_1.Utils.CoreUtils;
const { isIphoneX, convertX: cx, convertY: cy } = tuya_panel_kit_1.Utils.RatioUtils;
exports.Row = native_1.default.View`
  flex-direction: row;
  align-items: ${props => props.alignItems || 'center'};
  justify-content: ${props => props.justifyContent || 'center'};
`;
exports.Center = native_1.default.View`
  align-items: center;
  justify-content: center;
`;
exports.StyledContainer = native_1.default.View`
  flex: 1;
  background-color: ${theme_get_1.timer.boardBg};
`;
exports.StyledTitle = native_1.default(tuya_panel_kit_1.TYText)`
  background-color: transparent;
  font-size: ${props => props.size || `${cx(18)}`}px;
  color: ${theme_get_1.timer.fontColor};
`;
exports.StyledSubTitle = native_1.default(tuya_panel_kit_1.TYText)`
  font-size: ${props => props.size || `${cx(12)}`}px;
  color: ${theme_get_1.timer.subFontColor};
`;
exports.StyledListWrapper = native_1.default.View`
  flex: 1;
  justify-content: center;
  opacity: ${props => (props.isDisabled ? 0.5 : 1)};
`;
const tintColorStyle = native_1.css`
  tint-color: ${theme_get_1.timer.subFontColor};
`;
exports.StyledImage = native_1.default.Image.attrs({
  source: props => get(props, 'theme.timer.emptyIcon', DEFAULT_EMPTY_ICON),
})`
  ${props => props.tintEmptyImage && tintColorStyle};
`;
exports.StyledButton = native_1
  .default(react_native_1.TouchableOpacity)
  .attrs({ activeOpacity: 0.6 })`
  width: ${props => (props.isEmpty ? cx(124) : cx(351))}px;
  height: ${props => (props.isEmpty ? 36 : 48)}px;
  margin-top: ${props => (props.isEmpty ? 24 : 0)}px;
  margin-bottom: ${isIphoneX ? 42 : cy(12)}px;
  flex-direction: row;
  align-self: center;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  border-width: ${react_native_1.StyleSheet.hairlineWidth};
  background-color: ${theme_get_1.timer.btnBg};
  border-color: ${theme_get_1.timer.btnBorder};
`;
exports.StyledButtonText = native_1.default(tuya_panel_kit_1.TYText).attrs({ numberOfLines: 1 })`
  font-size: ${props => (props.isEmpty ? cx(14) : cx(16))}px;
  color: ${theme_get_1.timer.btnFontColor};
`;
exports.StyledCell = native_1.default.View`
  padding: ${cx(10)}px ${cx(16)}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: ${cx(48)}px;
  background-color: ${theme_get_1.timer.cellBg};
`;
exports.StyledDivider = native_1.default(tuya_panel_kit_1.Divider)`
  background-color: ${theme_get_1.timer.cellLine};
  margin-left: ${cx(16)}px;
`;
