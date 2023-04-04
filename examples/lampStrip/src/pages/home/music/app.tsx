/* eslint-disable indent */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { TYText, Utils, Dialog } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Res from '@res/index';
import Strings from '@i18n';
import MusicBar from '@components/MusicBar';
import * as MusicManager from '@utils/music';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { ColorUtils, SupportUtils, WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import DpCodes from '@config/dpCodes';
import { IControlData } from '@types';
import AppMusicDatas from '@config/default/appMusic';
import color from 'color';

interface MusicProps {
  power: boolean;
  workMode: string;
  theme?: any;
}

interface MusicState {
  animAppMusicCard: Animated.Value[];
  activeAppMusicIndex: number;
  musicBarColor: string[];

  musicIndex: number;
}

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { powerCode, workModeCode } = DpCodes;

class Music extends React.Component<MusicProps, MusicState> {
  constructor(props: MusicProps) {
    super(props);
    this.state = {
      animAppMusicCard: AppMusicDatas.map(() => new Animated.Value(0)),
      activeAppMusicIndex: -1,
      musicBarColor: ['rgb(255,0,0)', 'rgb(255,255,0)'],

      musicIndex: 2,
    };
  }

  componentWillReceiveProps(nextProps: MusicProps) {
    const { power } = this.props;
    if ((power !== nextProps.power && !nextProps.power) || nextProps.workMode !== WORK_MODE.MUSIC) {
      const { animAppMusicCard } = this.state;
      MusicManager.close();
      animAppMusicCard.forEach((animItem: any) => {
        Animated.timing(animItem, {
          toValue: 0,
          duration: 300,
        }).start();
      });
      this.setState({ activeAppMusicIndex: -1 });
    }
  }

  componentWillUnmount() {
    MusicManager.close();
  }

  handleAppToggleMusic = async (index: number) => {
    const { activeAppMusicIndex, animAppMusicCard } = this.state;
    const newIndex = activeAppMusicIndex === index ? -1 : index;
    await MusicManager.close();
    animAppMusicCard.forEach((animItem: any) => {
      Animated.timing(animItem, {
        toValue: 0,
        duration: 300,
      }).start();
    });
    if (newIndex !== -1) {
      Animated.timing(animAppMusicCard[index], {
        toValue: 1,
        duration: 300,
      }).start();
      const musicOption = AppMusicDatas[index];
      await this.handlePlay(musicOption);
    } else {
      animAppMusicCard.forEach((animItem: any) => {
        Animated.timing(animItem, {
          toValue: 0,
          duration: 300,
        }).start();
      });
    }
    this.setState({ activeAppMusicIndex: newIndex });
  };

  handlePlay = async (musicOption: any) => {
    try {
      const { power } = this.props;
      let colorStr = 'rgb(255,255,0)';
      await MusicManager.open(musicOption, (musicData: IControlData, index: number) => {
        const { hue, saturation, value, brightness, temperature } = musicData;
        if (SupportUtils.isSupportColour()) {
          colorStr = ColorUtils.hsv2rgba(hue!, saturation, 1000);
        } else {
          colorStr = ColorUtils.brightKelvin2rgb(1000, temperature);
        }
        const { musicBarColor } = this.state;
        const [color1, color2] = musicBarColor;
        const newColorArr = [color2, colorStr];

        this.setState({ musicBarColor: newColorArr, musicIndex: index });
      });
      dragon.putDpData(
        {
          [workModeCode]: WORK_MODE.MUSIC,
        },
        { checkCurrent: false, useThrottle: false, clearThrottle: true }
      );
      if (!power) {
        dragon.putDpData({
          [powerCode]: true,
        });
      }
    } catch (err) {
      Dialog.alert({
        title: Strings.getLang('open_mike_failure'),
        subTitle: Strings.getLang('open_mike_error'),
        confirmText: Strings.getLang('confirm'),
        onConfirm: () => {
          Dialog.close();
          // updateUi({ voiceStatus: VoiceStatus.NONE });
        },
      });
    }
  };

  // app music mode
  renderAppMusic = () => {
    const { workMode } = this.props;
    const { activeAppMusicIndex } = this.state;
    return AppMusicDatas.map((item: any, idx: number) => {
      const { id } = item;
      const isActive = activeAppMusicIndex === idx && workMode === WORK_MODE.MUSIC;
      return this.renderMusicRowItem(id, idx, isActive);
    });
  };

  renderMusicRowItem = (id: number, index: number, isActive: boolean) => {
    const { musicBarColor, animAppMusicCard, musicIndex } = this.state;
    const {
      theme: { type: themeType, themeColor, isDarkTheme, boxBgColor },
    } = this.props;

    const animCard = animAppMusicCard;

    if (!animCard[index]) {
      return <View />;
    }
    const cardHeight = animCard[index].interpolate({
      inputRange: [0, 1],
      outputRange: [cx(102), cx(208)],
    });

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
              source={Res[`app_music_${id}_${themeType}`]}
              resizeMode="contain"
            />
            <TYText style={{ fontSize: cx(16) }}>{Strings.getLang(`app_music_${id}`)}</TYText>
          </View>
          <TouchableOpacity
            style={styles.musicBtnBox}
            onPress={() => {
              this.handleAppToggleMusic(index);
            }}
          >
            <View
              style={[
                styles.musicBtn,
                !isDarkTheme && {
                  // @ts-ignore
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
        {isActive && (
          <View
            style={{
              position: 'absolute',
              bottom: -cx(7),
              overflow: 'hidden',
            }}
            pointerEvents="none"
          >
            {isActive && <MusicBar size={50} color={musicBarColor} musicIndex={musicIndex} />}
            {isActive && (
              <Image
                source={Res.musicMask}
                style={[
                  styles.musicBarMask,
                  {
                    height: cx(94),
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
    return <View style={{ flex: 1 }}>{this.renderAppMusic()}</View>;
  }
}

export default connect(({ dpState }: any) => ({
  power: dpState[powerCode],
  workMode: dpState[workModeCode],
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
    marginRight: cx(12),
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
