import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Utils, Button, IconFont, TYSdk, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';

import Config from '../../../config';
import { updateDp } from '../../../redux/actions/common';
import { updateStateOnly } from '../../../redux/actions/cloud';
import { WORKMODE } from '../../../utils/constant';
import { debounce } from '../../../utils';
import AnimateView from './Animate';
import iconfont from '../../../res/iconfont';

const TYNative = TYSdk.native;
const {
  ThemeUtils: { withTheme },
} = Utils;
const { isIphoneX, convertX: cx, convertY: cy } = Utils.RatioUtils;
const panelHeight = cy(260);
let isLoaded = -1;

class Scenes extends React.Component {
  static propTypes = {
    power: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isEditSceneColor: PropTypes.bool.isRequired,
    isEditScene: PropTypes.bool.isRequired,
    scenes: PropTypes.array.isRequired,
    workMode: PropTypes.string.isRequired,
    currentSceneValue: PropTypes.string.isRequired,
    updateDp: PropTypes.func.isRequired,
    updateEditStatus: PropTypes.func.isRequired,
    theme: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    const { currentSceneValue } = this.props;
    this.selectSceneId = currentSceneValue ? +currentSceneValue.slice(0, 2) : 0;
    TYNative.hideLoading();
  }

  componentWillReceiveProps(nextProps) {
    const { currentSceneValue, isEditMode } = nextProps;
    this.selectSceneId = +currentSceneValue.slice(0, 2);

    // 加载场景提示
    if (isEditMode) {
      if (nextProps.scenes && nextProps.scenes.length) {
        if (isLoaded === 0) {
          TYNative.hideLoading();
          isLoaded = 1;
        }
      } else if (isLoaded === -1) {
        TYNative.showLoading();
        isLoaded = 0;
      }
    }
  }

  handlePress = debounce(({ sceneId, value }) => {
    this.selectSceneId = +sceneId;
    const {
      dpCodes: { workMode: workModeCode, sceneData: sceneDataCode },
    } = Config;
    const data = {
      [workModeCode]: WORKMODE.SCENE,
      [sceneDataCode]: Config.capabilityFun.isSignMesh ? value.slice(0, 2) : value,
    };
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateDp(data);
  });

  handleEditSlider = () => {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateEditStatus({
      selectSceneId: this.selectSceneId,
      isEditScene: true,
      isEditSceneColor: false,
    });
  };

  handleEditColor = () => {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateEditStatus({
      selectSceneId: this.selectSceneId,
      isEditScene: false,
      isEditSceneColor: true,
    });
  };

  handleBack = () => {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateEditStatus({
      isEditScene: false,
      isEditMode: false,
      isEditSceneColor: false,
    });
  };

  renderItem = ({ value, name, sceneId, pic }) => {
    const { theme } = this.props;
    const actived = this.selectSceneId === +sceneId;
    return (
      <TouchableOpacity
        key={sceneId}
        style={styles.item}
        onPress={() => this.handlePress({ sceneId, value })}
        accessibilityLabel="Light_Mode_SelectList"
      >
        <Image
          source={pic}
          style={[styles.itemImg, { borderColor: actived ? theme.activeFontColor : 'transparent' }]}
        />
        <TYText numberOfLines={1} style={[styles.itemText, { color: theme.fontColor }]}>
          {name}
        </TYText>
      </TouchableOpacity>
    );
  };

  render() {
    const {
      scenes,
      power,
      theme,
      isEditMode,
      workMode,
      isEditScene,
      isEditSceneColor,
    } = this.props;
    const isShow =
      power && isEditMode && workMode === WORKMODE.SCENE && !isEditScene && !isEditSceneColor;
    return (
      <AnimateView
        style={styles.container}
        hideValue={panelHeight}
        value={isShow ? 0 : panelHeight}
      >
        {this.selectSceneId > 3 && (
          <View style={styles.toolbar}>
            <Button
              iconPath={iconfont.slider}
              style={{ marginRight: cx(16) }}
              size={cx(26)}
              iconSize={cx(24)}
              iconColor={theme.fontColor}
              onPress={this.handleEditSlider}
              accessibilityLabel="Light_Edit_Light"
            />
            <Button
              iconPath={iconfont.colorSelect}
              style={{ marginRight: cx(24) }}
              size={cx(26)}
              iconSize={cx(24)}
              iconColor={theme.fontColor}
              onPress={this.handleEditColor}
              accessibilityLabel="Light_Edit_Color"
            />
          </View>
        )}
        <View style={[styles.scenes, { backgroundColor: theme.sceneBgColor }]}>
          {scenes.map(this.renderItem)}
        </View>
        <View style={styles.backBtn}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={this.handleBack}
            accessibilityLabel="Light_Edit_Return"
          >
            <IconFont
              useART={true}
              d={iconfont.arrowDown}
              size={cx(40)}
              color={theme.iconBackColor}
            />
          </TouchableOpacity>
        </View>
      </AnimateView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    paddingBottom: isIphoneX ? 20 : 0,
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginBottom: cy(12),
  },
  scenes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    width: cx(70),
    marginVertical: cy(8),
    marginHorizontal: cx(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImg: {
    borderWidth: cx(2),
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
    borderColor: 'transparent',
  },
  itemText: {
    backgroundColor: 'transparent',
    fontSize: cx(12),
    lineHeight: cx(24),
  },
  backBtn: {
    height: cy(50),
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(
  ({ dpState, cloudState }) => {
    const {
      dpCodes: { power: powerCode, workMode: workModeCode, sceneData: sceneDataCode },
    } = Config;
    return {
      power: dpState[powerCode],
      isEditMode: cloudState.isEditMode,
      isEditSceneColor: cloudState.isEditSceneColor,
      isEditScene: cloudState.isEditScene,
      workMode: dpState[workModeCode],
      scenes: cloudState.scenes,
      currentSceneValue: dpState[sceneDataCode],
    };
  },
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateEditStatus: updateStateOnly(dispatch),
  })
)(withTheme(Scenes));
