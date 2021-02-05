import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import _ from 'lodash';

import Config from '../../../config';
import { updateDp } from '../../../redux/actions/common';
import { updateStateOnly, updateCloud } from '../../../redux/actions/cloud';
import Color from '../../../utils/color';
import { WORKMODE } from '../../../utils/constant';
import { debounce } from '../../../utils';
import Strings from '../../../i18n';
import LampInstance from '../../../utils/LampInstance';
import AnimateView from './Animate';
import resource from '../../../res';

const { isIphoneX, convertX: cx, convertY: cy } = Utils.RatioUtils;
const panelHeight = cy(200);

const {
  ThemeUtils: { withTheme },
} = Utils;

class SceneColors extends React.Component {
  static propTypes = {
    power: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isEditSceneColor: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    scenes: PropTypes.array.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    selectSceneId: PropTypes.number.isRequired,
    workMode: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    currentSceneValue: PropTypes.string.isRequired,
    updateDp: PropTypes.func.isRequired,
    updateEditStatus: PropTypes.func.isRequired,
    updateCloud: PropTypes.func.isRequired,
    theme: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { ...this.initData(this.props), selectIndex: 0 };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.initData(nextProps));
    if (nextProps.isEditSceneColor && this.props.isEditSceneColor !== nextProps.isEditSceneColor) {
      this.setState({ selectIndex: 0 });
      this.props.updateEditStatus({
        selectSceneColorIndex: 0,
      });
    }
  }

  getColor([h, s, v, b, k], bright) {
    if (b || k) {
      return Color.brightKelvin2rgba(bright || b, k);
    }
    return Color.hsv2rgba(h, s, bright || v);
  }
  
  initData(props) {
    const { selectSceneId, scenes } = props;
    const exist = scenes.find(item => item.sceneId === selectSceneId);
    if (exist) {
      const { value } = exist;
      const [id, speed, mode, ...hsvbks] = Color.decodeSceneValue(value);
      let bright = 0;
      let saturation = 0;

      hsvbks.forEach(([h, s, v, b, k]) => {
        if (b || k) {
          bright += b;
          saturation += k;
        } else {
          bright += v;
          saturation += s;
        }
      });

      // 为了与v1版本一致，如果是第5个场景，则只显示一个颜色，并根据用户选择了颜色处理成亮暗两种颜色
      const isFifth = +id === 4;
      return {
        id,
        speed,
        mode,
        hsvbks: isFifth ? [hsvbks[0]] : hsvbks,
        addEnabled: !isFifth,
        bright: Math.floor(bright / hsvbks.length),
        saturation: Math.floor(saturation / hsvbks.length),
      };
    }
    return {
      id: 0,
      speed: 0,
      mode: 0,
      hsvbks: [],
      bright: 10,
      saturation: 0,
      addEnabled: true,
    };
  }

  handlePress = debounce((hsv, index) => {
    const color = this.getColor(hsv, 1000);
    const [, , v, b, k] = hsv;
    LampInstance.changeColor(color, b || k ? b : v);
    this.setState({
      selectIndex: index,
    });
    this.props.updateEditStatus({
      selectSceneColorIndex: index,
    });
  });

  handleAdd = debounce(index => {
    const { hsvbks, bright, saturation, id, speed, mode } = this.state;
    const hue = _.random(360);
    // 只支持加入彩光
    hsvbks[index] = [hue, saturation, bright, 0, 0];

    this.setState({
      selectIndex: index,
      hsvbks: [...hsvbks],
    });
    this.props.updateEditStatus({
      selectSceneColorIndex: index,
    });
    const color = this.getColor(hsvbks[index], 1000);
    LampInstance.changeColor(color, bright);

    const value = Color.encodeSceneValue([id, speed, mode, ...hsvbks]);
    this.props.updateDp({
      [Config.dpCodes.sceneData]: value,
    });
    this.props.updateCloud(`scene_${id}`, { sceneId: id, value });
  });

  handleRemove = debounce(() => {
    const { hsvbks, selectIndex, id, speed, mode } = this.state;
    // 只支持加入彩光
    hsvbks.splice(selectIndex, 1);

    this.setState({
      selectIndex: 0,
      hsvbks: [...hsvbks],
    });
    this.props.updateEditStatus({
      selectSceneColorIndex: 0,
    });
    const color = this.getColor(hsvbks[0], 1000);
    LampInstance.changeColor(color, hsvbks[0][2]);

    const value = Color.encodeSceneValue([id, speed, mode, ...hsvbks]);
    this.props.updateDp({
      [Config.dpCodes.sceneData]: value,
    });
    this.props.updateCloud(`scene_${id}`, { sceneId: id, value });
  });

  handleBack = () => {
    this.props.updateEditStatus({
      isEditSceneColor: false,
    });
  };

  renderItem = (hsv, index) => {
    const { theme } = this.props;
    const { selectIndex } = this.state;
    const actived = selectIndex === index;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.item,
          { backgroundColor: this.getColor(hsv) },
          actived && { borderColor: theme.activeFontColor },
        ]}
        onPress={() => this.handlePress(hsv, index)}
        accessibilityLabel="Light_Edit_Color"
      />
    );
  };

  renderMore() {
    const { hsvbks, addEnabled } = this.state;
    if (!addEnabled) {
      return null;
    }
    const moreItems = [];
    for (let i = 0, len = 6 - hsvbks.length; i < len; i++) {
      moreItems.push(0);
    }
    return moreItems.map((v, index) => {
      if (index === 0) {
        return (
          <TouchableOpacity
            key={index} // eslint-disable-line react/no-array-index-key
            style={[styles.item, { borderWidth: 0 }]}
            onPress={() => this.handleAdd(index + hsvbks.length)}
            accessibilityLabel="Light_Edit_Add"
          >
            <Image source={resource.add} style={styles.itemImg} />
          </TouchableOpacity>
        );
      }

      return (
        <Image
          key={index} // eslint-disable-line react/no-array-index-key
          style={[styles.item, { borderWidth: 0 }]}
          source={resource.placeholder}
        />
      );
    });
  }

  renderRemove() {
    const { hsvbks } = this.state;
    if (hsvbks.length <= 2) {
      return null;
    }
    return (
      <TouchableOpacity
        style={[styles.removeBtn]}
        onPress={this.handleRemove}
        accessibilityLabel="Light_Edit_Delete"
      >
        <Image source={resource.removeBtn} />
      </TouchableOpacity>
    );
  }

  render() {
    const { power, isEditMode, workMode, isEditSceneColor, theme } = this.props;
    const { hsvbks } = this.state;
    const isShow = power && isEditMode && workMode === WORKMODE.SCENE && isEditSceneColor;
    return (
      <AnimateView
        style={styles.container}
        hideValue={panelHeight}
        value={isShow ? 0 : panelHeight}
      >
        <View style={[styles.colors, { backgroundColor: theme.sceneBgColor }]}>
          {hsvbks.map(this.renderItem)}
          {this.renderMore()}
          {this.renderRemove()}
        </View>
        <View style={styles.backBtn}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={this.handleBack}
            accessibilityLabel="Light_Edit_Return"
          >
            <TYText style={[styles.backBtnText, { color: theme.activeFontColor }]}>
              {Strings.getLang('back')}
            </TYText>
          </TouchableOpacity>
        </View>
      </AnimateView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    paddingBottom: isIphoneX ? 20 : 0,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: cx(40),
    height: cx(160),
  },
  item: {
    width: cx(40),
    height: cx(40),
    marginVertical: cx(12),
    marginHorizontal: cx(24),
    borderWidth: cx(2),
    borderRadius: cx(20),
    borderColor: 'transparent',
  },
  itemImg: { width: cx(40), height: cx(40) },
  backBtn: {
    height: cy(50),
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: cx(14),
  },
  removeBtn: {
    width: cx(28),
    height: cx(28),
    position: 'absolute',
    right: cx(16),
    bottom: cy(16),
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
      workMode: dpState[workModeCode],
      scenes: cloudState.scenes,
      currentSceneValue: dpState[sceneDataCode],
      selectSceneId: cloudState.selectSceneId,
    };
  },
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateEditStatus: updateStateOnly(dispatch),
    updateCloud: updateCloud(dispatch),
  })
)(withTheme(SceneColors));
