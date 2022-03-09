/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import * as React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Res from '@res';
import Strings from '@i18n';
import { MusicBar } from '@tuya/tuya-panel-lamp-sdk';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import DpCodes from '@config/dpCodes';
import color from 'color';
import _ from 'lodash';
import BrightRectSlider from '@components/BrightRectSlider';
import Icons from '@res/iconfont';
import LampApi from '@tuya/tuya-panel-api/lib/lamp/general';
import { actions } from '@models';
import { RgbMusicColor, RgbMusicValue } from '@types';

interface MusicProps {
  dispatch: any;
  power: boolean;
  workMode: string;
  theme?: any;
  rgbMusicValue: RgbMusicValue;
  localMusicList: RgbMusicValue[];
}

interface MusicState {
  animLocalMusicCard: Animated.Value[];
  activeLocalMusicIndex: number;
  musicBarColor: string[];
  musicIndex: number;
}

const { convertX: cx } = Utils.RatioUtils;
const { powerCode, workModeCode, rgbMusicCode } = DpCodes;
const { withTheme } = Utils.ThemeUtils;
const { color: Color } = Utils.ColorUtils;

class Music extends React.Component<MusicProps, MusicState> {
  constructor(props: MusicProps) {
    super(props);
    const { rgbMusicValue, localMusicList } = props;
    const { power, id } = rgbMusicValue;
    let activeLocalMusicIndex = -1;
    if (power) {
      activeLocalMusicIndex = id;
    }
    console.log('localMusicList', localMusicList);
    this.state = {
      animLocalMusicCard: localMusicList.map(() => new Animated.Value(0)),
      activeLocalMusicIndex,
      musicBarColor: ['rgb(255,0,0)', 'rgb(255,255,0)'],
      musicIndex: 2,
    };
  }

  componentDidMount() {
    const { localMusicList, power, workMode } = this.props;
    const { activeLocalMusicIndex, animLocalMusicCard } = this.state;
    if (activeLocalMusicIndex > -1 && power) {
      const newData = _.cloneDeep(localMusicList[activeLocalMusicIndex]);
      Animated.timing(animLocalMusicCard[activeLocalMusicIndex], {
        toValue: 1,
        duration: 300,
      }).start();
      const { colors } = newData;
      newData.power = true;
      const colorA = Color.hsv2RgbString(colors[1].hue, colors[1].saturation, 100, 1);
      const colorB = Color.hsv2RgbString(colors[2].hue, colors[2].saturation, 100, 1);
      this.setState({
        musicBarColor: [colorA, colorB],
      });
      this.startLocalMusic(colors);
    }
    if (workMode !== WORK_MODE.MUSIC) {
      this.stopLocalMusic();
      const { animLocalMusicCard } = this.state;
      this.setState({ activeLocalMusicIndex: -1 });
      animLocalMusicCard.forEach((animItem: any) => {
        Animated.timing(animItem, {
          toValue: 0,
          duration: 300,
        }).start();
      });
    }
  }

  componentWillReceiveProps(nextProps: MusicProps) {
    if (this.props.rgbMusicValue !== nextProps.rgbMusicValue) {
      this.showCardAnim(nextProps);
      this.prevIndex = nextProps.rgbMusicValue.id;
    }
    if (this.props.power !== nextProps.power && !!nextProps.power) {
      // 关灯状态下切换其他本地音乐，因下发开关dp再发本地音乐dp，需做判断处理
      // 交给上一个if处理
      if (nextProps.rgbMusicValue.id === this.prevIndex) {
        this.showCardAnim(nextProps);
      }
    }
    if (
      (this.props.power !== nextProps.power && !nextProps.power) ||
      nextProps.workMode !== WORK_MODE.MUSIC
    ) {
      this.stopLocalMusic();
      const { animLocalMusicCard } = this.state;
      this.setState({ activeLocalMusicIndex: -1 });
      animLocalMusicCard.forEach((animItem: any) => {
        Animated.timing(animItem, {
          toValue: 0,
          duration: 300,
        }).start();
      });
    }
  }

  componentWillUnmount() {
    this.stopLocalMusic();
  }

  private localMusicColorInterval: any = null;

  private prevIndex = -1;

  // @ts-ignore
  sensitivityRef: TYText = null;

  showCardAnim = (props: MusicProps) => {
    const { localMusicList, rgbMusicValue } = props;
    const { power, id } = rgbMusicValue;
    const { animLocalMusicCard } = this.state;
    let activeLocalMusicIndex = -1;
    if (power) {
      activeLocalMusicIndex = id;
    }
    this.setState({ activeLocalMusicIndex });
    animLocalMusicCard.forEach((animItem: any) => {
      Animated.timing(animItem, {
        toValue: 0,
        duration: 300,
      }).start();
    });
    if (activeLocalMusicIndex > -1) {
      const newData: any = _.cloneDeep(localMusicList[activeLocalMusicIndex]);
      Animated.timing(animLocalMusicCard[activeLocalMusicIndex], {
        toValue: 1,
        duration: 300,
      }).start();
      const { colors } = newData;
      newData.power = true;
      const colorA = Color.hsv2RgbString(colors[1].hue, colors[1].saturation, 100, 1);
      const colorB = Color.hsv2RgbString(colors[2].hue, colors[2].saturation, 100, 1);
      this.setState({
        musicBarColor: [colorA, colorB],
      });
      this.startLocalMusic(colors);
    } else {
      animLocalMusicCard.forEach((animItem: any) => {
        Animated.timing(animItem, {
          toValue: 0,
          duration: 300,
        }).start();
      });
      this.stopLocalMusic();
    }
  };

  startLocalMusic = (colors: RgbMusicColor[]) => {
    this.stopLocalMusic();
    const rgbStringsArr = colors.map((item: RgbMusicColor) => {
      const { hue, saturation } = item;
      return Color.hsv2RgbString(hue, saturation, 100, 1);
    });
    let mark = 0;
    this.localMusicColorInterval = setInterval(() => {
      const { length } = rgbStringsArr;
      if (mark >= length) mark = 0;
      let nextMark = mark + 1;
      if (nextMark >= length) nextMark = 0;
      this.setState({
        musicBarColor: [rgbStringsArr[mark], rgbStringsArr[nextMark]],
      });
      mark++;
    }, 1000);
  };

  stopLocalMusic = () => {
    if (this.localMusicColorInterval) {
      clearInterval(this.localMusicColorInterval);
    }
  };

  handleLocalToggleMusic = async (index: number) => {
    const { localMusicList } = this.props;
    const { activeLocalMusicIndex } = this.state;
    const newIndex = activeLocalMusicIndex === index ? -1 : index;
    const newData = _.cloneDeep(localMusicList[index]);
    newData.power = newIndex !== -1;
    this.putRgbMusicData(newData);
    this.setState({ activeLocalMusicIndex: newIndex });
    this.prevIndex = index;
  };

  handleSensitivityCompelete = (value: number) => {
    const { rgbMusicValue } = this.props;
    const newData = _.cloneDeep(rgbMusicValue);
    newData.sensitivity = value;
    this.updateCloudRgbMusicData(newData);
    this.putRgbMusicData(newData);
  };

  handleChangeDirection = (value: number) => {
    const { rgbMusicValue } = this.props;
    const newData = _.cloneDeep(rgbMusicValue);
    newData.settingB = value;
    this.updateCloudRgbMusicData(newData);
    this.putRgbMusicData(newData);
  };

  updateCloudRgbMusicData = (value: RgbMusicValue) => {
    const { dispatch, localMusicList } = this.props;
    const { id } = value;
    const currData = _.find(localMusicList, { id });
    const newData = { ...currData, ...value, power: false };
    dispatch(actions.common.updateLocalMusic(newData));
    LampApi.saveCloudConfig!(`local_music_${value.id}`, newData);
  };

  putRgbMusicData = (value: RgbMusicValue) => {
    const { power, workMode } = this.props;
    if (!power) {
      dragon.putDpData({
        [powerCode]: true,
      });
    }
    const cmd: any = { [rgbMusicCode]: value };
    if (value.power && workMode !== WORK_MODE.MUSIC) {
      cmd[workModeCode] = WORK_MODE.MUSIC;
    }
    dragon.putDpData(cmd, { checkCurrent: false, updateValidTime: 'syncs' });
  };

  // 本地音乐模式
  renderLocalMusic = () => {
    const { rgbMusicValue, localMusicList, power, workMode } = this.props;
    return localMusicList.map((item: any, idx: number) => {
      const { id } = item;
      const isActive =
        id === rgbMusicValue.id && !!rgbMusicValue.power && power && workMode === 'music';
      return this.renderMusicRowItem(id, idx, isActive);
    });
  };

  renderMusicRowItem = (id: number, index: number, isActive: boolean) => {
    const { musicBarColor, animLocalMusicCard, musicIndex } = this.state;
    const {
      theme: {
        global: { themeColor, fontColor, isDefaultTheme },
      },
      rgbMusicValue,
    } = this.props;
    const bgColor = isDefaultTheme ? 'rgb(38,44,58)' : '#fff';
    const musicContentBg = isDefaultTheme ? '#313744' : '#fff';
    const animCard = animLocalMusicCard;

    const supportDirection = /^4$/g.test(`${index}`);

    if (!animCard[index]) {
      return <View key={index} />;
    }
    const cardHeight = animCard[index].interpolate({
      inputRange: [0, 1],
      outputRange: [cx(102), cx(supportDirection ? 283 : 229)],
    });

    let sensitivityValue = 50;
    let musicDirection = 0;
    const { sensitivity, settingB } = rgbMusicValue;
    sensitivityValue = sensitivity;
    musicDirection = settingB;

    const commonSliderProps = {
      percentStyle: { opacity: 0, width: 0 },
      percentTintStyle: { borderRadius: 12 },
      style: styles.sliderStyle,
      trackStyle: { height: cx(37), borderRadius: 12 },
      tintStyle: { height: cx(37), borderRadius: 12 },
      iconSize: cx(14),
      iconColor: isDefaultTheme ? '#333' : '#fff',
      trackColor: isDefaultTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
      tintColor: isDefaultTheme ? '#fff' : themeColor,
      thumbStyle: styles.sliderThumbStyle,
      showAnimation: false,
      renderThumb: () => (
        <View
          style={[
            styles.sliderThumb,
            !isDefaultTheme && {
              backgroundColor: '#fff',
            },
          ]}
        />
      ),
    };

    return (
      <Animated.View
        key={id}
        style={[
          styles.musicBox,
          {
            height: cardHeight,
            backgroundColor: bgColor,
          },
        ]}
      >
        <View
          style={[
            styles.musicContent,
            { backgroundColor: musicContentBg, position: 'absolute', top: 0, zIndex: 1 },
          ]}
        >
          <View style={styles.musicInfo}>
            <Image style={styles.musicImg} source={Res[`local_music_${id}`]} resizeMode="contain" />
            <TYText>{Strings.getLang(`local_music_${id}`)}</TYText>
          </View>
          <TouchableOpacity
            style={[
              styles.musicBtn,
              !isDefaultTheme && {
                backgroundColor: color(themeColor).alpha(0.1).rgbaString(),
              },
            ]}
            onPress={() => this.handleLocalToggleMusic(index)}
          >
            <Image
              style={[styles.musicControlBtn, !isDefaultTheme && { tintColor: themeColor }]}
              source={isActive ? Res.stopIcon : Res.startIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        {/* 顺时针逆时针 */}
        {isActive && supportDirection && (
          <View style={styles.musicDirectionBox}>
            {[0, 1].map((key: number) => {
              const isDirectionActive = musicDirection === key;
              const btnBg = isDefaultTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
              const activeBtnBg = isDefaultTheme ? '#fff' : themeColor;
              const textColor = isDefaultTheme ? '#fff' : '#333';
              const actveTextColor = isDefaultTheme ? '#333' : '#fff';
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.musicDirectionBtn,
                    {
                      backgroundColor: isDirectionActive ? activeBtnBg : btnBg,
                    },
                  ]}
                  onPress={() => this.handleChangeDirection(key)}
                >
                  <TYText style={{ color: isDirectionActive ? actveTextColor : textColor }}>
                    {Strings.getLang(`music_direction_${key}`)}
                  </TYText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {/* 灵敏度调节 */}
        {isActive && (
          <View
            style={{
              width: '100%',
              marginTop: cx(102),
              paddingLeft: cx(24),
              paddingRight: cx(24),
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            pointerEvents="none"
          >
            <TYText color={isDefaultTheme ? '#fff' : fontColor}>
              {`${Strings.getLang('sensitivityValue')}`}
            </TYText>
            <TYText
              ref={(ref: any) => {
                this.sensitivityRef = ref;
              }}
              color={isDefaultTheme ? '#fff' : fontColor}
            >
              {`${sensitivityValue}%`}
            </TYText>
          </View>
        )}
        {isActive && (
          <BrightRectSlider
            {...commonSliderProps}
            value={sensitivityValue}
            customIcon={Icons.sensitivity}
            clickEnabled={true}
            min={0}
            max={100}
            step={1}
            showMin={0}
            onChange={value => {
              if (this.sensitivityRef) {
                // @ts-ignore
                this.sensitivityRef?.setText(`${value}%`);
              }
            }}
            onRelease={this.handleSensitivityCompelete}
            onPress={this.handleSensitivityCompelete}
          />
        )}
        {isActive && (
          <View style={{ position: 'absolute', bottom: 0 }} pointerEvents="none">
            {isActive && <MusicBar size={25} colors={musicBarColor} musicIndex={musicIndex} />}
            {isActive && (
              <Image
                source={Res.musicMask}
                style={[
                  styles.musicBarMask,
                  {
                    height: cx(50),
                    tintColor: bgColor,
                  },
                ]}
                resizeMode="cover"
              />
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  render() {
    return <View style={{ flex: 1 }}>{this.renderLocalMusic()}</View>;
  }
}
export default connect(({ dpState, cloudState }: any) => ({
  power: dpState[powerCode],
  workMode: dpState[workModeCode],
  rgbMusicValue: dpState[rgbMusicCode],
  localMusicList: cloudState.localMusicList,
}))(withTheme(Music));

const styles = StyleSheet.create({
  musicBox: {
    width: cx(327),
    borderRadius: cx(16),
    marginBottom: cx(16),
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  musicContent: {
    width: '100%',
    height: cx(102),
    paddingLeft: cx(14),
    paddingRight: cx(24),
    borderRadius: cx(16),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  musicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  musicImg: {
    width: cx(52),
    height: cx(52),
    marginRight: cx(12),
  },

  musicBtn: {
    width: cx(38),
    height: cx(38),
    borderRadius: cx(19),
    borderWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sliderStyle: {
    width: cx(279),
    height: cx(37),
    borderRadius: 12,
    overflow: 'hidden',
    position: 'absolute',
    bottom: cx(66),
  },

  sliderThumbStyle: {
    opacity: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sliderThumb: {
    width: 2,
    height: 13,
    borderRadius: 1,
    marginRight: cx(8),
    backgroundColor: '#333',
  },

  musicControlBtn: {
    width: cx(38),
    height: cx(38),
  },

  musicDirectionBox: {
    position: 'absolute',
    bottom: cx(121),
    width: cx(279),
    height: cx(37),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  musicDirectionBtn: {
    width: cx(135),
    height: cx(36),
    borderRadius: cx(13),
    alignItems: 'center',
    justifyContent: 'center',
  },

  musicBarMask: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
