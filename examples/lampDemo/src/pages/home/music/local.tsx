import * as React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { TYText, Utils, IconFont } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Res from '@res/index';
import Strings from '@i18n';
import MusicBar from '@components/MusicBar';
import dragon from '@tuya-rn/tuya-native-dragon';
import { WORKMODE, formatPercent } from '@tuya-rn/tuya-native-lamp-elements/lib/utils';
import DpCodes from '@config/dpCodes';
import color from 'color';
import _ from 'lodash';
import { BrightRectSlider } from '@tuya-rn/tuya-native-lamp-elements';
import Icons from '@res/icons';
import LampApi from '@tuya-rn/tuya-native-lamp-elements/lib/api';
import { CommonActions } from '@actions';

const { updateLocalMusic, updateCloudStates } = CommonActions;

interface MusicProps {
  dispatch: any;
  power: boolean;
  workMode: string;
  theme?: any;

  localMusicValue: LocalMusicValue;
  localMusicList: LocalMusicValue[];
}

interface MusicState {
  animLocalMusicCard: Animated.Value[];
  activeLocalMusicIndex: number;
  musicBarColor: string[];
  musicIndex: number;
  sensitivity: number;
}

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { color: Color } = Utils.ColorUtils;
const { powerCode, workModeCode, micMusicCode } = DpCodes;

class Music extends React.Component<MusicProps, MusicState> {
  constructor(props: MusicProps) {
    super(props);
    const { localMusicValue, localMusicList } = props;
    const { power, id, sensitivity } = localMusicValue;
    let activeLocalMusicIndex = -1;
    if (power) {
      activeLocalMusicIndex = id;
    }

    this.state = {
      animLocalMusicCard: localMusicList?.map(() => new Animated.Value(0)),
      activeLocalMusicIndex,
      musicBarColor: ['rgb(255,0,0)', 'rgb(255,255,0)'],
      musicIndex: 2,
      sensitivity,
    };
  }

  componentDidMount() {
    const { localMusicList, power, workMode } = this.props;
    const { activeLocalMusicIndex, animLocalMusicCard } = this.state;
    if (activeLocalMusicIndex > -1 && power && workMode === WORKMODE.MUSIC) {
      if (!localMusicList[activeLocalMusicIndex]) return;
      const newData = _.cloneDeep(localMusicList[activeLocalMusicIndex]);
      animLocalMusicCard[activeLocalMusicIndex] &&
        Animated.timing(animLocalMusicCard[activeLocalMusicIndex], {
          toValue: 1,
          duration: 300,
        }).start();
      const { colors } = newData;
      newData.power = true;
      const colorA = Color.hsv2RgbString(colors[0].hue, colors[0].saturation, 100, 1);
      const colorB = colors[1]
        ? Color.hsv2RgbString(colors[1].hue, colors[1].saturation, 100, 1)
        : colorA;
      this.setState({
        musicBarColor: [colorA, colorB],
      });
      // this.startLocalMusic(colors);
    }
  }

  componentWillReceiveProps(nextProps: MusicProps) {
    const { localMusicValue, power, workMode } = this.props;
    if (
      localMusicValue !== nextProps.localMusicValue ||
      (power !== nextProps.power && nextProps.power) ||
      (nextProps.workMode === WORKMODE.MUSIC && workMode !== nextProps.workMode)
    ) {
      this.showCardAnim(nextProps);
    }
    if ((power !== nextProps.power && !nextProps.power) || nextProps.workMode !== WORKMODE.MUSIC) {
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
    if (localMusicValue?.sensitivity !== nextProps.localMusicValue.sensitivity) {
      this.setState({ sensitivity: nextProps.localMusicValue.sensitivity });
    }
  }

  componentWillUnmount() {
    this.stopLocalMusic();
  }

  private localMusicColorInterval: any = null;

  private prevIndex = -1;

  private sensitivityTextRefArr: any[] = [];

  showCardAnim = (props: MusicProps) => {
    const { localMusicList, localMusicValue, workMode } = props;
    const { power, id } = localMusicValue;
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
    if (activeLocalMusicIndex > -1 && workMode === WORKMODE.MUSIC) {
      if (!localMusicList[activeLocalMusicIndex]) return;
      const newData = _.cloneDeep(localMusicList[activeLocalMusicIndex]);
      animLocalMusicCard[activeLocalMusicIndex] &&
        Animated.timing(animLocalMusicCard[activeLocalMusicIndex], {
          toValue: 1,
          duration: 300,
        }).start();
      const { colors } = newData;
      newData.power = true;
      const colorA = Color.hsv2RgbString(colors[0].hue, colors[0].saturation, 100, 1);
      const colorB = colors[1]
        ? Color.hsv2RgbString(colors[1].hue, colors[1].saturation, 100, 1)
        : colorA;
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

  startLocalMusic = (colors: LocalMusicColor[]) => {
    this.stopLocalMusic();
    const rgbStringsArr = colors.map((item: LocalMusicColor) => {
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
    // this.prevIndex = index;
  };

  handleSensitivityChange = (id: number) => (value: number) => {
    // if (!!this.sensitivityTextRefArr[id] && !!this.sensitivityTextRefArr[id].setText) {
    //   this.sensitivityTextRefArr[id].setText(
    //     `${formatPercent(value, {
    //       min: 0,
    //       max: 100,
    //       minPercent: 0,
    //     })}%`
    //   );
    // }
    this.setState({ sensitivity: value });
  };

  handleSensitivityCompelete = (value: number) => {
    const { localMusicValue } = this.props;
    const newData = _.cloneDeep(localMusicValue);
    newData.sensitivity = value;
    this.updateCloudRgbMusicData(newData);
    this.putRgbMusicData(newData, true);
  };

  updateCloudRgbMusicData = (value: LocalMusicValue) => {
    const { dispatch } = this.props;
    const newData: LocalMusicValue = { ...value, power: false };
    dispatch(updateLocalMusic(newData));
    dispatch(updateCloudStates(`local_music_${value.id}`, newData));
  };

  putRgbMusicData = (value: LocalMusicValue, isSyncs?: boolean) => {
    const cmd: any = { [micMusicCode]: value };
    const options: any = {
      checkCurrent: false,
    };
    if (isSyncs) {
      options.updateValidTime = 'syncs';
    }
    dragon.putDpData(cmd, options);
    const { workMode } = this.props;
    if (workMode !== WORKMODE.MUSIC) {
      dragon.putDpData(
        {
          [workModeCode]: WORKMODE.MUSIC,
        },
        {
          updateValidTime: options.updateValidTime || 'reply',
        }
      );
    }
    if (value.power) {
      dragon.putDpData({ [powerCode]: true });
    }
  };

  // 本地音乐模式
  renderLocalMusic = () => {
    const { localMusicValue, localMusicList, power, workMode } = this.props;
    return localMusicList?.map((item: any, idx: number) => {
      const { id } = item;
      const isActive =
        id === localMusicValue.id &&
        !!localMusicValue.power &&
        power &&
        workMode === WORKMODE.MUSIC;
      return this.renderMusicRowItem(id, idx, isActive);
    });
  };

  renderMusicRowItem = (id: number, index: number, isActive: boolean) => {
    const { musicBarColor, animLocalMusicCard, musicIndex, sensitivity } = this.state;
    const {
      theme: { type: themeType, themeColor, isDarkTheme, boxBgColor },
      localMusicValue,
    } = this.props;
    const animCard = animLocalMusicCard;

    if (!animCard[index]) {
      return <View />;
    }
    const cardHeight = animCard[index].interpolate({
      inputRange: [0, 1],
      outputRange: [cx(102), cx(229)],
    });

    const commonSliderProps = {
      percentStyle: { display: 'none' },
      iconColor: 'transparent',
      outPercentColor: 'transparent',
      style: styles.sliderStyle,
      trackColor: isDarkTheme ? '#1B1A1A' : '#F3F7FF',
      tintColor: isDarkTheme ? '#fff' : themeColor,
      thumbStyle: styles.sliderThumbStyle,
      showAnimation: false,
      renderThumb: () => (
        <View
          style={[
            styles.sliderThumb,
            !isDarkTheme && {
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
            backgroundColor: boxBgColor,
          },
        ]}
      >
        <View
          style={[
            styles.musicContent,
            { backgroundColor: boxBgColor, position: 'absolute', top: 0, zIndex: 1 },
          ]}
        >
          <View style={styles.musicInfo}>
            <Image
              style={styles.musicImg}
              source={Res[`local_music_${id}_${themeType}`]}
              resizeMode="stretch"
            />
            <TYText style={{ fontSize: cx(16) }}>{Strings.getLang(`local_music_${id}`)}</TYText>
          </View>
          <TouchableOpacity
            style={styles.musicBtnBox}
            onPress={() => this.handleLocalToggleMusic(index)}
          >
            <View
              style={[
                styles.musicBtn,
                !isDarkTheme && {
                  backgroundColor: color(themeColor).alpha(0.1).rgbaString(),
                },
              ]}
            >
              <Image
                style={[styles.musicControlBtn, !isDarkTheme && { tintColor: themeColor }]}
                source={
                  isActive
                    ? isDarkTheme
                      ? Res.stopIcon
                      : Res.stopIconLight
                    : isDarkTheme
                      ? Res.startIcon
                      : Res.startIconLight
                }
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
        {/* 灵敏度调节 */}
        <View style={styles.sensitivityHeader}>
          <TYText style={{ fontSize: cx(12) }}>
            {Strings.getLang('local_music_sensitivity_label')}
          </TYText>
          <TYText
            style={{ fontSize: cx(12) }}
            ref={(ref: TYText) => {
              this.sensitivityTextRefArr[id] = ref;
            }}
          >
            {`${formatPercent(sensitivity, {
              min: 0,
              max: 100,
              minPercent: 0,
            })}%`}
          </TYText>
        </View>
        {isActive && (
          <BrightRectSlider
            {...commonSliderProps}
            value={sensitivity}
            clickEnabled={true}
            min={0}
            max={100}
            step={1}
            showMin={0}
            onChange={this.handleSensitivityChange(id)}
            onRelease={this.handleSensitivityCompelete}
            onPress={this.handleSensitivityCompelete}
          />
        )}
        {isActive && (
          <View
            style={{ position: 'absolute', bottom: 0, overflow: 'hidden' }}
            pointerEvents="none"
          >
            {isActive && <MusicBar size={25} color={musicBarColor} musicIndex={musicIndex} />}
            {isActive && (
              <Image
                source={Res.musicMask}
                style={[
                  styles.musicBarMask,
                  {
                    height: cx(50),
                    tintColor: boxBgColor,
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
  localMusicValue: dpState[micMusicCode],
  localMusicList: cloudState.localMusicList || [],
}))(withTheme(Music));

const styles = StyleSheet.create({
  musicBox: {
    width: cx(343),
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
    // paddingRight: cx(24),
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
    marginRight: cx(8),
  },

  musicBtnBox: {
    width: cx(86),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: cx(8),
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

  sensitivityHeader: {
    width: cx(279),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: cx(112),
  },

  musicControlBtn: {
    width: cx(38),
    height: cx(38),
  },

  musicBarMask: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
