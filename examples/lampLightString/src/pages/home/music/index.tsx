/* eslint-disable import/no-unresolved */
import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TYText, Utils, TabBar } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';
import * as MusicManager from '@utils/music';
import { RgbMusicValue } from '@types';
import AppMusic from './app';
import LocalMusic from './local';

interface MusicProps {
  dispatch: any;
  power: boolean;
  workMode: string;
  theme?: any;
  rgbMusicValue: RgbMusicValue;
  localMusicList: RgbMusicValue[];
}

interface MusicState {
  musicMode: 'local' | 'app';
}

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { powerCode, workModeCode, rgbMusicCode } = DpCodes;
const { withTheme } = Utils.ThemeUtils;

class Music extends React.Component<MusicProps, MusicState> {
  constructor(props: MusicProps) {
    super(props);
    this.state = {
      musicMode: SupportUtils.isSupportDp(rgbMusicCode) ? 'local' : 'app',
    };
  }

  componentWillReceiveProps(nextProps: MusicProps) {
    if (this.props.rgbMusicValue !== nextProps.rgbMusicValue && !!nextProps.rgbMusicValue.power) {
      MusicManager.close();
      this.setState({ musicMode: 'local' });
    }
  }

  getTabs = () => {
    const tabs: string[] = [];
    if (SupportUtils.isSupportDp(rgbMusicCode)) {
      tabs.push('local');
    }
    if (SupportUtils.isSupportMusic()) {
      tabs.push('app');
    }
    return tabs;
  };

  handleChangeMusicMode = () => {
    const { musicMode } = this.state;
    const nextMode = musicMode === 'local' ? 'app' : 'local';
    this.setState({ musicMode: nextMode });
  };

  renderAppMode = () => {};

  render() {
    const { musicMode } = this.state;
    const {
      theme: {
        global: { isDefaultTheme },
      },
    } = this.props;
    const tabs = this.getTabs();
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <TYText style={styles.musicTip}>
            {Strings.getLang(musicMode === 'app' ? 'tip_app_music' : 'tip_local_music')}
          </TYText>
          {tabs.length !== 1 && (
            <TabBar
              type="radio"
              tabs={tabs.map(key => ({
                key,
                title: Strings.getLang(`music_mode_${key}`),
                style: styles.tabItemStyle,
                textStyle: [styles.tabText, !isDefaultTheme && { color: '#000' }],
                activeTextStyle: [styles.tabActiveText, !isDefaultTheme && { color: '#000' }],
              }))}
              activeKey={musicMode}
              style={[
                styles.tabBar,
                { backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)' },
              ]}
              activeColor={isDefaultTheme ? 'rgba(255,255,255,0.1)' : '#fff'}
              gutter={cx(6)}
              onChange={this.handleChangeMusicMode}
            />
          )}
          {musicMode === 'app' && SupportUtils.isSupportMusic() && <AppMusic />}
          {musicMode === 'local' && SupportUtils.isSupportDp(rgbMusicCode) && <LocalMusic />}
        </ScrollView>
      </View>
    );
  }
}
export default connect(({ dpState, cloudState }: any) => ({
  power: dpState[powerCode],
  workMode: dpState[workModeCode],
  rgbMusicValue: dpState[rgbMusicCode],
  localMusicList: cloudState.localMusicList,
}))(withTheme(Music));

const styles = StyleSheet.create({
  musicTip: {
    fontSize: cx(12),
    opacity: 0.6,
    marginTop: cx(4),
    marginBottom: cx(20),
    textAlign: 'center',
  },

  tabBar: {
    width: cx(327),
    height: cx(48),
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 30,
    marginBottom: cx(20),
  },

  tabItemStyle: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: cx(12),
    color: '#fff',
  },

  tabActiveText: {
    fontSize: cx(12),
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: cx(24) + (isIphoneX ? 118 : 98),
  },
});
