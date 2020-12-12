import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { CircleView, DpSchema } from 'tuya-panel-kit';
import Strings from '@i18n';

interface Props {
  dpSchema: DpSchema;
}

const DpInfoView: React.FC<Props> = props => {
  const { id, name, type, mode, code } = props.dpSchema;

  const getModeLang = (d: string) => {
    return Strings.getLang(`dp_mode_${d}`);
  };

  const getTypeLang = (d: string) => {
    return Strings.getLang(`dp_type_${d}`);
  };

  const getNameLang = (c: string, defaultValue: string) => {
    const strKey = `dp_${c}`.toLowerCase();
    return Strings.getLang(strKey) ? Strings.getLang(strKey) : defaultValue;
  };

  return (
    <View style={styles.container}>
      <View style={styles.subject}>
        <CircleView style={styles.dpIdBg} radius={10}>
          <Text style={styles.dpId}>{id}</Text>
        </CircleView>
        <Text style={styles.dpName}>{getNameLang(code, name)}</Text>
      </View>

      <Text style={styles.subSubject}>
        {getTypeLang(type)} | {getModeLang(mode)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },

  subject: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subSubject: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 10,
    color: '#9B9B9B',
    marginTop: 5,
  },

  dpIdBg: {
    backgroundColor: '#FF5800',
    borderColor: '#FF5800',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dpId: {
    fontSize: 9,
    color: 'white',
  },

  dpName: {
    fontSize: 18,
    color: '#303030',
    marginLeft: 5,
  },
});

export default DpInfoView;
