/* eslint-disable @typescript-eslint/no-empty-function */
import _ from 'lodash';
import color from 'color';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Utils, IconFont, Popup, TYSdk, TYText } from 'tuya-panel-kit';
import { lampPutDpData, saveStaticScene, saveDynamicScene, saveCustomScene } from '@api';
import { ReduxState } from '@models';
import SceneColourSelector from './scene-colour-selector';
import SceneSpeedSelector from './scene-speed-selector';
import Strings from '../../i18n';
import { ColorParser, calcPercent, calcPosition, randomHsb } from '../../utils';
import DpCodes from '../../config/dpCodes';
import {
  defaultBrightScenes,
  defaultWhiteScenes,
  defaultColourScenes,
  defaultDynamicScenes,
} from '../../config/scenes';
import icons from '../../res/iconfont';
import SupportUtils from '../../utils/support';
import Res from '../../res';

const { convertX: cx, convertY: cy, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { controlCode: controlDataCode, sceneCode: sceneValueCode, workModeCode } = DpCodes;
const { isSupportColour, isSupportWhite, isSupportBright, isSupportTemp } = SupportUtils;
const TYNative = TYSdk.native;

interface CustomSceneProps {
  id: string | number | any;
  title: string;
  isEdit: boolean;
  sceneValue: string;
  sceneDatas: SceneData[];
  theme: any;
}
interface CustomSceneState {
  isBuiltIn: boolean;
  pic?: any;
  name: string;
  sceneNo: number;
  flashMode: number;
  flashSpeed: number;
  // 默认给一个颜色
  colours: SceneColor[];
}

class CustomScene extends Component<CustomSceneProps, CustomSceneState> {
  constructor(props: CustomSceneProps) {
    super(props);
    const {
      theme: {
        global: { fontColor, themeColor },
      },
    } = props;
    const allSceneNo = [0, 1, 2, 3, 4, 5, 6, 7];
    const curSceneNo = props.sceneDatas.map((d: SceneData) => +d.value.slice(0, 2));
    const sceneNo = _.difference(allSceneNo, curSceneNo)[0];
    // 默认给一个白光
    let kelvin = isSupportTemp() ? 9000 : 0;
    const whiteBrightness = 100;
    let whiteRgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
    if (!isSupportTemp()) {
      kelvin = 0;
      whiteRgb = Utils.ColorUtils.color.kelvin2rgb(2500);
    }
    const [whiteHue, whiteSaturation] = Utils.ColorUtils.color.rgb2hsb(...whiteRgb);
    const defaultState: CustomSceneState = {
      isBuiltIn: false,
      pic: Res.dp_scene_data_0,
      name: '',
      sceneNo,
      flashMode: 0,
      flashSpeed: 40,
      // 默认给一个颜色
      colours: [
        {
          isColour: isSupportColour(),
          hsb: randomHsb(),
          whiteHsb: [whiteHue, whiteSaturation, whiteBrightness],
          kelvin,
          whiteBrightness,
        },
      ],
    };
    if (!props.isEdit) {
      this.state = defaultState;
    } else {
      this.state = this.mapSceneDataToState(
        { sceneValue: props.sceneValue, sceneDatas: props.sceneDatas },
        defaultState
      );
    }
    this._theme = {
      FONT_COLOR: fontColor,
      THEME_COLOR: themeColor,
      BORDER_COLOR: color(fontColor).alpha(0.3).rgbString(),
      ICON_BG_COLOR: color(themeColor).alpha(0.1).rgbString(),
    };
  }

  _theme: {
    FONT_COLOR: string;
    THEME_COLOR: string;
    BORDER_COLOR: string;
    ICON_BG_COLOR: string;
  };

  _coloursRef: SceneColourSelector;

  // todo return type
  mapSceneDataToState(
    {
      sceneValue,
      sceneDatas,
    }: {
      sceneValue: string;
      sceneDatas: SceneData[];
    },
    defaultState?: CustomSceneState
  ): CustomSceneState {
    // sigmesh下切换场景值，数据只有场景号
    let newSceneValue = sceneValue;
    if (sceneValue.length <= 2) {
      const editScene = sceneDatas.find(({ value }) => +value.slice(0, 2) === +sceneValue);
      if (!editScene) return defaultState!;
      newSceneValue = editScene.value;
    }
    const decodedSceneData = ColorParser.decodeSceneData(newSceneValue);
    // 变换方式和变换速度暂时统一
    const sceneNo = _.get(decodedSceneData, 'sceneNum');
    const scenes = _.get(decodedSceneData, 'scenes') || [];
    const flashMode = _.get(decodedSceneData, 'scenes[0].m');
    const flashSpeed = _.get(decodedSceneData, 'scenes[0].f');
    const sceneData = sceneDatas.find(d => +d.value.slice(0, 2) === +sceneNo);
    const picNum = parseInt(`${sceneNo}`, 16) % 8;
    const pic = Res[`dp_scene_data_${picNum}`];
    const name = _.get(sceneData, 'name') || '';
    const colours = scenes.map(({ h, s, v, k, b }) => {
      const isColour = !k && !b;
      // 在彩光时，色温取100%，确保切换到白光色温为100%
      let kelvin = isColour ? 9000 : calcPosition(2500, 9000, k / 1000);
      let whiteRgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
      if (!isSupportTemp()) {
        kelvin = 0;
        whiteRgb = Utils.ColorUtils.color.kelvin2rgb(2500);
      }
      const [whiteHue, whiteSaturation] = Utils.ColorUtils.color.rgb2hsb(...whiteRgb);
      return {
        isColour,
        hsb: isColour ? [h, s / 10, v / 10 || 1] : randomHsb(), // 亮度最小值需要为1(在保存时如果不为彩光会被置为0)
        whiteHsb: [whiteHue, whiteSaturation, b / 10],
        kelvin,
        // 在彩光时，亮度取100%，确保切换到白光亮度为100%
        whiteBrightness: !isColour ? b / 10 : 100, // 亮度最小值需要为1(在保存时如果不为白光会被置为0)
      };
    });
    return {
      isBuiltIn: isSupportColour() || sceneNo <= 3,
      pic,
      name,
      sceneNo,
      flashMode,
      flashSpeed,
      colours,
    };
  }

  _handleEditSceneName = () => {
    TYNative.showEditDialog(
      Strings.getLang('edit'),
      this.state.name,
      (value: string) => {
        const finalName = Array.from(value).slice(0, 10).join('');
        if (finalName) {
          if (value.trim().length > 10) {
            TYNative.simpleTipDialog(Strings.getLang('maxSceneNameTip'), () => {});
          }
          this.setState({ name: finalName });
          return;
        }
        TYNative.simpleTipDialog(Strings.getLang('inputNotEmpty'), () => {});
      },
      () => {}
    );
  };

  _handleColorChange = _.throttle((colours: SceneColor[], curColour: SceneColor) => {
    if (controlDataCode && curColour && curColour.hsb) {
      const { isColour, hsb, whiteBrightness, kelvin } = curColour;
      const h = isColour ? hsb[0] : 0;
      const s = isColour ? hsb[1] * 10 : 0;
      const v = isColour ? hsb[2] * 10 : 0;
      const b = isColour ? 0 : whiteBrightness * 10;
      let k = Math.round(calcPercent(2500, 9000, kelvin) * 1000);
      if (isColour) k = 0;
      else if (!isSupportTemp()) k = 1000;
      const encodeControlColor = ColorParser.encodeControlData(1, h, s, v, b, k);
      lampPutDpData({ [controlDataCode]: encodeControlColor });
    }
    this.setState({ colours });
  }, 150);

  _handleShowFlashMode = () => {
    const data = [0, 1, 2].map((key: number) => ({
      key,
      value: key,
      title: Strings.getDpLang(sceneValueCode, `flashMode_${key}`),
    }));
    Popup.list({
      title: Strings.getDpLang(sceneValueCode, 'flashMode'),
      value: this.state.flashMode,
      dataSource: data,
      footerType: 'singleCancel',
      cancelText: Strings.getLang('cancel'),
      onSelect: (v: number) => {
        Popup.close();
        this._handleFlashModeChange(v);
      },
    });
  };

  _handleFlashModeChange = (v: number) => {
    const mode = +v;
    // 非静态模式下，至少二个颜色
    const { colours } = this.state;
    if (mode !== 0 && colours!.length < 2) {
      const kelvin = isSupportTemp() ? 9000 : 2500;
      const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
      const whiteHsb = Utils.ColorUtils.color.rgb2hsb(...rgb);
      colours!.push({
        isColour: isSupportColour(),
        hsb: randomHsb(),
        whiteHsb,
        kelvin,
        whiteBrightness: 100,
      });
    }
    this.setState({ flashMode: mode, colours });
  };

  _handleFlashSpeedChange = (value: number) => {
    this.setState({ flashSpeed: Math.round(value) });
  };

  _handleResetScene = async () => {
    const { sceneDatas } = this.props;
    const { sceneNo } = this.state;
    let defaultSceneData: SceneData;
    const isStatic = sceneNo <= 3;
    // todo
    if (isSupportColour()) {
      if (!isStatic) {
        defaultSceneData = defaultDynamicScenes[sceneNo - 4];
      } else if (isSupportBright() && isSupportTemp()) {
        defaultSceneData = defaultWhiteScenes[sceneNo]; // 五路
      } else if (isSupportBright()) {
        defaultSceneData = defaultBrightScenes[sceneNo]; // 四路
      } else {
        defaultSceneData = defaultColourScenes[sceneNo]; // 三路
      }
    } else if (isSupportWhite() && isSupportTemp() && isStatic) {
      defaultSceneData = defaultWhiteScenes[sceneNo]; // 二路
    } else if (isSupportWhite() && isSupportBright() && isStatic) {
      defaultSceneData = defaultBrightScenes[sceneNo]; // 一路
    } else {
      return;
    }
    const defaultSceneValue = defaultSceneData.value;
    const newSceneDatas = [...sceneDatas];
    newSceneDatas.splice(this.state.sceneNo, 1, defaultSceneData);
    this.setState(
      this.mapSceneDataToState({
        sceneValue: defaultSceneValue,
        sceneDatas: newSceneDatas,
      })
    );
    this._coloursRef && this._coloursRef.setState && this._coloursRef.setState({ activeIdx: -1 });
    lampPutDpData({
      [workModeCode]: 'scene',
      [sceneValueCode]: defaultSceneValue,
    });
    // 只有静态和动态场景可重置
    if (isStatic) {
      saveStaticScene(newSceneDatas.slice(0, 4));
    } else {
      saveDynamicScene(newSceneDatas.slice(4));
    }
  };

  _handleDeleteScene = () => {
    const { sceneDatas } = this.props;
    const newSceneDatas = [...sceneDatas];
    _.remove(newSceneDatas, d => +d.value.slice(0, 2) === +this.state.sceneNo);
    // 删除场景后默认下发第一个场景
    lampPutDpData({
      [workModeCode]: 'scene',
      [sceneValueCode]: sceneDatas[0].value,
    });
    // 只有自定义场景可删除
    saveCustomScene(newSceneDatas.slice(4));
    TYSdk.Navigator.pop();
  };

  _handleSubmit = async () => {
    if (!this.state.name || this.state.colours.length === 0) {
      // 判空
      return TYNative.simpleTipDialog(
        Strings.getLang(!this.state.name ? 'nameNotEmpty' : 'coloursNotEmpty'),
        () => {}
      );
    }
    if (typeof this._handleColorChange.cancel === 'function') {
      this._handleColorChange.cancel();
    }
    const { isEdit, sceneDatas } = this.props;
    const sceneData = this.state.colours.map(
      ({ isColour, hsb, kelvin, whiteBrightness }: SceneColor) => {
        const [h, s, v] = hsb;
        let k = Math.round(calcPercent(2500, 9000, kelvin) * 1000);
        if (isColour) k = 0;
        else if (!isSupportTemp()) k = 1000;
        return {
          h: isColour ? h : 0,
          s: isColour ? s * 10 : 0,
          v: isColour ? v * 10 : 0,
          b: isColour ? 0 : whiteBrightness * 10,
          k,
          m: this.state.flashMode,
          f: this.state.flashSpeed,
          t: this.state.flashSpeed,
        };
      }
    );
    // 静态模式下只取一种颜色
    const value = ColorParser.encodeSceneData(
      this.state.flashMode === 0 ? [sceneData[0]] : sceneData,
      this.state.sceneNo
    );
    lampPutDpData({ [workModeCode]: 'scene', [sceneValueCode]: value });
    const newSceneDatas: SceneData[] = [...sceneDatas];
    if (isEdit) {
      const isStatic = this.state.sceneNo <= 3;
      // 也要把数组中的对象浅拷贝一份，否则修改会影响到initState
      const newSceneData = { ...newSceneDatas[this.state.sceneNo] };
      const sceneNo = _.findIndex(newSceneDatas, d => +d.value.slice(0, 2) === +this.state.sceneNo);
      newSceneData.name = this.state.name;
      newSceneData.value = value;
      newSceneDatas[sceneNo] = newSceneData;
      if (isStatic) {
        saveStaticScene(newSceneDatas.slice(0, 4));
      } else if (isSupportColour()) {
        saveDynamicScene(newSceneDatas.slice(4));
      } else {
        saveCustomScene(newSceneDatas.slice(4));
      }
    } else {
      newSceneDatas.push({ name: this.state.name, value });
      saveCustomScene(newSceneDatas.slice(4));
    }
    TYSdk.Navigator.pop();
  };

  _renderListSection({
    key,
    title,
    value,
    onPress,
  }: {
    key: string;
    title: string;
    value: string;
    onPress: (params?: any) => void;
  }) {
    const { FONT_COLOR, BORDER_COLOR } = this._theme;
    const dimmedColor = color(FONT_COLOR).alpha(0.5).rgbString();
    return (
      <View style={[styles.section, styles.section__listItem]}>
        <TouchableOpacity
          accessibilityLabel={`CustomScene_${key}`}
          style={styles.row}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <TYText style={[styles.text, { color: FONT_COLOR }]}>{title}</TYText>
          <View style={styles.row__right}>
            <TYText style={[styles.text, { color: dimmedColor, marginRight: cx(9) }]}>
              {value}
            </TYText>
            <Image source={Res.arrow} />
          </View>
        </TouchableOpacity>
        <View style={[styles.border__bottom, { backgroundColor: BORDER_COLOR }]} />
      </View>
    );
  }

  render() {
    const { isEdit } = this.props;
    const { flashSpeed, flashMode, pic, isBuiltIn, colours } = this.state;
    const { FONT_COLOR, THEME_COLOR, ICON_BG_COLOR } = this._theme;
    const isStatic = flashMode === 0;
    return (
      <View style={styles.container}>
        <ScrollView
          accessibilityLabel="CustomScene_ScrollView"
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollView]}
        >
          {/* 场景图片 */}
          <Image style={styles.section__pic} source={pic} resizeMode="contain" />
          {/* 重置 */}
          {isBuiltIn && (
            <TouchableOpacity
              accessibilityLabel="CustomScene_Reset"
              activeOpacity={0.8}
              style={[styles.section__reset, { backgroundColor: ICON_BG_COLOR }]}
              onPress={this._handleResetScene}
            >
              <IconFont d={icons.reset} size={cx(14)} fill={FONT_COLOR} stroke={FONT_COLOR} />
              <TYText style={[styles.text, { fontSize: 12, color: FONT_COLOR, marginLeft: cx(7) }]}>
                {Strings.getLang('reset')}
              </TYText>
            </TouchableOpacity>
          )}
          {/* 场景名称 */}
          {this._renderListSection({
            key: 'EditName',
            title: Strings.getLang('sceneName'),
            value: this.state.name,
            onPress: this._handleEditSceneName,
          })}
          {/* 场景颜色 */}
          <SceneColourSelector
            theme={{ fontColor: FONT_COLOR, themeColor: THEME_COLOR }}
            ref={(ref: SceneColourSelector) => {
              this._coloursRef = ref;
            }}
            isCold={false} // 是暖光还是冷光
            isSupportColor={isSupportColour()}
            isSupportWhite={isSupportWhite()}
            isSupportWhiteTemp={isSupportTemp()}
            isSupportWhiteBright={isSupportBright()}
            isBuiltIn={isBuiltIn}
            colours={colours}
            onlyOne={isStatic}
            onChange={this._handleColorChange}
          />
          {/* 场景颜色变换方式 */}
          {this._renderListSection({
            key: 'EditFlashMode',
            title: Strings.getDpLang(sceneValueCode, 'flashMode'),
            value: Strings.getDpLang(sceneValueCode, `flashMode_${this.state.flashMode}`),
            onPress: this._handleShowFlashMode,
          })}
          {/* 场景颜色变换速度 */}
          <SceneSpeedSelector
            disabled={isStatic}
            isStatic={isStatic}
            value={flashSpeed}
            onSlidingComplete={this._handleFlashSpeedChange}
          />
          {/* 删除 */}
          {isEdit && !isBuiltIn && (
            <TouchableOpacity
              accessibilityLabel="CustomScene_Delete"
              activeOpacity={0.8}
              style={[styles.section, styles.section__delete]}
              onPress={this._handleDeleteScene}
            >
              <TYText style={[styles.text, { color: '#ff0000', fontSize: cx(12) }]}>
                {Strings.getLang('deleteScene')}
              </TYText>
            </TouchableOpacity>
          )}
        </ScrollView>
        {/* 提交 */}
        <TouchableOpacity
          accessibilityLabel="CustomScene_Submit"
          activeOpacity={0.8}
          style={[styles.section, styles.section__submit]}
          onPress={this._handleSubmit}
        >
          <TYText style={[styles.text, { color: THEME_COLOR, fontSize: cx(18) }]}>
            {Strings.getLang('submit')}
          </TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollView: {
    alignSelf: 'stretch',
  },
  section: {
    marginTop: 24,
    backgroundColor: 'transparent',
  },
  section__pic: {
    width: cx(100),
    height: cx(100),
    borderRadius: cx(50),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  section__reset: {
    position: 'absolute',
    top: 24,
    right: cx(16),
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: cx(10),
    borderRadius: 15,
  },
  section__listItem: {
    alignSelf: 'stretch',
    height: cy(50),
    marginHorizontal: cx(16),
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row__right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: cx(14),
  },
  border__bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  section__delete: {
    width: cx(375),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: cx(12),
  },
  section__submit: {
    marginTop: 10,
    height: isIphoneX ? 78 : 58,
    paddingBottom: isIphoneX ? 20 : 0,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});

export default connect(({ dpState, cloudState }: ReduxState) => ({
  sceneValue: dpState[sceneValueCode],
  sceneDatas: cloudState.sceneDatas || [],
}))(withTheme(CustomScene));
