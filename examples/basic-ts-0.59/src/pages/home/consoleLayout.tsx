import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, TYSdk, Utils } from 'tuya-panel-kit';
import { useSelector, actions } from '@models';

const { width } = Utils.RatioUtils;

interface Props {
  style?: StyleProp<ViewStyle>;
}

interface Log {
  isSend?: boolean;
  strCodes?: string;
  strIds?: string;
  time?: string;
}

const ConsoleLayout: React.FC<Props> = props => {
  const { style } = props;
  const dispatch = useDispatch();
  const [code, setCode] = React.useState(false);
  const logs = useSelector(state => state.logs);

  const navToSetting = () => {
    TYSdk.Navigator.push({ id: 'setting' });
  };
  const doClear = () => {
    dispatch(actions.common.clearConsole());
  };

  const renderRow = (v: Log, k: number) => {
    const strFlag = v.isSend ? '\t<发送>\t' : '\t<接收>\t';
    const color = v.isSend ? '#F5A623' : '#5FB336';
    const content = code ? v.strCodes : v.strIds;
    return (
      <Text key={k} style={[styles.item, { color }]}>
        {v.time}
        {strFlag}
        {content}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView style={[styles.list]}>{logs.map((v, k) => renderRow(v, k))}</ScrollView>
      <View style={styles.bottom}>
        <Button style={styles.clear} onPress={navToSetting}>
          <Text style={styles.clearText}>Setting</Text>
        </Button>
        <Button
          style={[styles.format, code ? { backgroundColor: '#F5A623' } : null]}
          onPress={() => setCode(!code)}
        >
          <Text style={styles.clearText}>CODE</Text>
        </Button>
        <Button style={styles.clear} onPress={doClear}>
          <Text style={styles.clearText}>CLEAR</Text>
        </Button>
      </View>
    </View>
  );
};

ConsoleLayout.defaultProps = {
  style: null,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#303A4B',
  },

  bottom: {
    width,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },

  clear: {
    borderWidth: 1,
    borderColor: '#303A4B',
    borderRadius: 3,
    width: 64,
    height: 32,
    padding: 5,
    marginRight: 10,
  },

  format: {
    borderWidth: 1,
    borderColor: '#303A4B',
    borderRadius: 3,
    width: 64,
    height: 32,
    padding: 5,
    marginRight: 10,
  },

  clearText: {
    backgroundColor: 'transparent',
    fontSize: 12,
    color: '#303A4B',
  },

  list: {
    flex: 1,
    overflow: 'hidden',
    marginVertical: 1,
  },

  item: {
    fontSize: 10,
    marginHorizontal: 2,
    marginTop: 5,
  },
});

export default ConsoleLayout;
