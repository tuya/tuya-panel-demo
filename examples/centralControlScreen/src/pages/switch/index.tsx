import React, { FC } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Utils, TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import Res from '@res';
import { isValidSwitchDp } from '@utils';
import { GridLayout, SwitchItem } from '@components';
import { useSelector, actions } from '@models';

const { convertX: cx } = Utils.RatioUtils;

const Switch: FC = () => {
  const { switchList, dpState } = useSelector(state => state);
  const rowNum = Math.ceil(switchList.length / 3);
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={Res.switchBg} style={styles.image}>
        {/* {switchList.map(({ code, name }) => (
          <SwitchItem key={code} code={code} name={name} value={dpState[code] as boolean} />
        ))} */}
        <GridLayout data={switchList} rowNum={rowNum}>
          {({ code, name }) => (
            <SwitchItem key={code} code={code} name={name} value={dpState[code] as boolean} />
          )}
        </GridLayout>
      </ImageBackground>
    </View>
  );
};
const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});
export default Switch;
