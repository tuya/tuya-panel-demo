import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Utils, useTheme } from 'tuya-panel-kit';
import PageBackground from '@components/PageBackground';
import MyTopBar from '@components/MyTopBar';
import Strings from '@i18n';
import CountdownSet from './Set';
import CountdownInfo from './Info';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;

interface CountdownParams {
  contentType: 0 | 1;
}

const Countdown: React.FC = () => {
  const navigation = useNavigation();
  const { subPageBgColor }: any = useTheme();

  const routeParams = (useRoute().params as CountdownParams) || {};

  const [contentType, setContentType] = useState(+!!routeParams.contentType);

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: subPageBgColor }]}>
      <PageBackground />
      <MyTopBar
        titleStyle={styles.title}
        title={Strings.getLang('title_countdown')}
        leftActions={[{ source: Strings.getLang('title_cancel'), onPress: handleClose }]}
      />
      {contentType === 1 ? (
        <CountdownInfo style={styles.content} setContentType={setContentType} />
      ) : (
        <CountdownSet style={styles.content} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: isIphoneX ? cx(33) : cx(13),
  },
  title: {
    fontWeight: 'bold',
    fontSize: cx(17),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: cx(30),
  },
});

export default Countdown;
