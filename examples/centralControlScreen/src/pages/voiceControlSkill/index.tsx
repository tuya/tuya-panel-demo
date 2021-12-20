import React, { FC, useCallback } from 'react';
import { View, StyleSheet, Image, ScrollView, ImageBackground } from 'react-native';
import { Utils, TYText, Divider, TopBar, TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { theme } from '@config';
import { back } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

const list = [
  {
    title: Strings.getLang('homeControl'),
    icon: Res.home,
    data: [
      Strings.getLang('homeVoice1'),
      Strings.getLang('homeVoice2'),
      Strings.getLang('homeVoice3'),
    ],
  },
  {
    title: Strings.getLang('weather'),
    icon: Res.wea,
    data: [
      Strings.getLang('weaVoice1'),
      Strings.getLang('weaVoice2'),
      Strings.getLang('weaVoice3'),
    ],
  },
];

const VoiceControlSkill: FC = () => {
  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('voiceMain')}
        onBack={back}
        background="transparent"
        color="#FFF"
      />
    );
  };

  const renderContent = () => {
    return (
      <View style={styles.main}>
        <Image source={Res.voice} style={styles.topIcon} />
        <ScrollView showsVerticalScrollIndicator={false}>{renderVoiceSkillList()}</ScrollView>
      </View>
    );
  };

  const renderVoiceSkillList = () => {
    return (
      <View>
        {list.map(item => (
          <View style={styles.item} key={item.title}>
            <View style={[styles.header, styles.row]}>
              <Image source={item.icon} style={styles.icon} />
              <TYText text={item.title} style={styles.text} />
            </View>
            <Divider color="rgba(0,0,0,0.1)" />
            <View style={styles.content}>
              {item.data.map(d => (
                <View style={styles.card} key={d}>
                  <TYText text={d} style={styles.name} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ImageBackground source={Res.voiceBg} style={styles.container}>
      {renderTopBar()}
      {renderContent()}
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  main: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: cx(22),
    paddingHorizontal: cx(19),
  },
  topIcon: {
    width: cx(260),
    height: cx(160),
    marginBottom: cx(8),
  },
  item: {
    width: cx(337),
    marginTop: cx(10),
    paddingHorizontal: cx(16),
    borderRadius: cx(12),
    backgroundColor: '#FFF',
  },
  header: {
    paddingVertical: cx(13),
  },
  content: {
    paddingHorizontal: cx(14),
    paddingVertical: cx(16),
  },
  icon: {
    width: cx(20),
    height: cx(20),
    marginRight: cx(12),
  },
  text: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 15,
    color: '#FFF',
  },
  card: {
    alignSelf: 'flex-start',
    marginBottom: cx(10),
    paddingHorizontal: cx(16),
    paddingVertical: cx(8),
    borderTopLeftRadius: cx(20),
    borderTopRightRadius: cx(20),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: cx(20),
    backgroundColor: theme.themeColor,
  },
});
export default VoiceControlSkill;
