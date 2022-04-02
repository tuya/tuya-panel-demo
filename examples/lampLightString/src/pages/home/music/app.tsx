/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import * as React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { TYText, Utils, Dialog } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Res from '@res';
import Strings from '@i18n';
import * as MusicManager from '@utils/music';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { ColorUtils, SupportUtils, WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import DpCodes from '@config/dpCodes';
import AppMusicDatas from '@config/default/appMusic';
import color from 'color';
import { MusicBar } from '@tuya/tuya-panel-lamp-sdk';
import { IControlData } from '@types';

interface MusicProps {
  dispatch: any;
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
const { powerCode, workModeCode } = DpCodes;
const { withTheme } = Utils.ThemeUtils;

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
    if (this.props.power !== nextProps.power && !nextProps.power) {
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
      const { power, workMode } = this.props;
      const cmd: any = {
        [workModeCode]: WORK_MODE.MUSIC,
      };
      if (!power) {
        cmd[powerCode] = true;
      }
      if (Object.keys(cmd).length) {
        dragon.putDpData(cmd);
      }
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

  // app音乐模式
  renderAppMusic = () => {
    const { activeAppMusicIndex } = this.state;
    return AppMusicDatas.map((item: any, idx: number) => {
      const { id } = item;
      const isActive = activeAppMusicIndex === idx;
      return this.renderMusicRowItem(id, idx, isActive);
    });
  };

  renderMusicRowItem = (id: number, index: number, isActive: boolean) => {
    const { musicBarColor, animAppMusicCard, musicIndex } = this.state;
    const {
      theme: {
        global: { themeColor, isDefaultTheme },
      },
    } = this.props;
    const bgColor = isDefaultTheme ? 'rgb(38,44,58)' : '#fff';
    const musicContentBg = isDefaultTheme ? '#313744' : '#fff';

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
            <Image style={styles.musicImg} source={Res[`app_music_${id}`]} resizeMode="contain" />
            <TYText>{Strings.getLang(`app_music_${id}` as any)}</TYText>
          </View>
          <TouchableOpacity
            style={[
              styles.musicBtn,
              !isDefaultTheme && {
                // @ts-ignore
                backgroundColor: color(themeColor).alpha(0.1).rgbaString(),
              },
            ]}
            onPress={() => {
              this.handleAppToggleMusic(index);
            }}
          >
            <Image
              style={[styles.musicControlBtn, !isDefaultTheme && { tintColor: themeColor }]}
              source={isActive ? Res.stopIcon : Res.startIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        {isActive && (
          <View style={{ position: 'absolute', bottom: 0 }} pointerEvents="none">
            {isActive && <MusicBar size={50} colors={musicBarColor} musicIndex={musicIndex} />}
            {isActive && (
              <Image
                source={Res.musicMask}
                style={[
                  styles.musicBarMask,
                  {
                    height: cx(94),
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
    return <View style={{ flex: 1 }}>{this.renderAppMusic()}</View>;
  }
}
export default connect(({ dpState }: any) => ({
  power: dpState[powerCode],
  workMode: dpState[workModeCode],
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
