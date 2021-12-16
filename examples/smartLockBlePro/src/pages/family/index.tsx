import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TopBar, TYSdk, TYText } from 'tuya-panel-kit';
import { useNav } from '@hooks';
import Strings from '@i18n';

interface RouteParams {
  title?: string;
}

const FamilyPage = () => {
  const { navigationPop, route } = useNav();

  const { title = '' } = route.params as RouteParams;
  const goBack = () => {
    navigationPop();
  };

  const goToUserAdd = () => {
    const { homeId } = TYSdk.devInfo;
    const url = `tuyaSmart://tysh_family_add_member_rn?homeId=${homeId}`;
    TYSdk.mobile.jumpTo(url);
  };

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        background="#fff"
        title={title || Strings.getLang('family_title')}
        color="black"
        actions={[
          {
            name: 'plus',
            color: 'black',
            size: 20,
            onPress: () => goToUserAdd(),
          },
        ]}
        onBack={() => goBack()}
      />
      <View style={styles.wrap}>
        <TYText>我是成员管理页</TYText>
      </View>
    </View>
  );
};
export default FamilyPage;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
