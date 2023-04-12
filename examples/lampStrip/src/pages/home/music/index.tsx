/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';
import MyTabBar from '@components/MyTabBar';
import * as MusicManager from '@utils/music';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import AppMusic from './app';
import LocalMusic from './local';

interface MusicProps {
  power: boolean;
  theme?: any;
  localMusicValue: LocalMusicValue;
}

interface MusicState {
  musicMode: MusicModeType;
}
type MusicModeType = 'local' | 'app';
const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { powerCode, micMusicCode } = DpCodes;

const defaultProps = {
  theme: {},
};
class Music extends React.Component<MusicProps, MusicState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  constructor(props: MusicProps) {
    super(props);
    this.state = {
      musicMode: SupportUtils.isSupportDp(micMusicCode) ? 'local' : 'app',
    };
  }

  componentWillReceiveProps(nextProps: MusicProps) {
    const { localMusicValue } = this.props;
    if (localMusicValue !== nextProps.localMusicValue && !!nextProps.localMusicValue.power) {
      MusicManager.close();
      this.setState({ musicMode: 'local' });
    }
  }

  getTabs = () => {
    const tabs: MusicModeType[] = [];
    if (SupportUtils.isSupportDp(micMusicCode)) {
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

  render() {
    const { musicMode } = this.state;
    const {
      theme: { isDarkTheme, themeColor, boxBgColor },
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
          {tabs.length > 1 && (
            // @ts-ignore
            <MyTabBar
              type="radio"
              tabs={tabs.map(key => ({
                key,
                title: Strings.getLang(`music_mode_${key}`),
                style: styles.tabItemStyle,
                textStyle: [styles.tabText, !isDarkTheme && { color: '#000' }],
                activeTextStyle: [styles.tabActiveText, !isDarkTheme && { color: themeColor }],
              }))}
              activeRadius={cx(10)}
              activeKey={musicMode}
              style={[styles.tabBar, { backgroundColor: boxBgColor }]}
              activeColor={isDarkTheme ? 'rgba(255,255,255,0.1)' : '#E9F1FD'}
              gutter={cx(6)}
              onChange={this.handleChangeMusicMode}
            />
          )}
          {musicMode === 'app' && SupportUtils.isSupportMusic() && <AppMusic />}
          {musicMode === 'local' && SupportUtils.isSupportDp(micMusicCode) && <LocalMusic />}
        </ScrollView>
      </View>
    );
  }
}

export default connect(({ dpState }: any) => ({
  power: dpState[powerCode],
  localMusicValue: dpState[micMusicCode],
}))(withTheme(Music));
const styles = StyleSheet.create({
  musicTip: {
    fontSize: cx(12),
    opacity: 0.6,
    marginTop: cx(4),
    marginBottom: cx(20),
  },

  tabBar: {
    width: '100%',
    height: cx(48),
    borderRadius: cx(12),
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
    paddingHorizontal: cx(16),
    alignItems: 'center',
    paddingBottom: isIphoneX ? cx(105) : cx(75),
  },
});
