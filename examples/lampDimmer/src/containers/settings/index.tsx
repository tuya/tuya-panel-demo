import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { TYFlatList, Utils } from 'tuya-panel-kit';
import Strings from '../../i18n';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProps {
  dimmers: any[];
  navigator: any;
  theme: any;
}

class Settings extends React.Component<IProps> {
  getData() {
    const { dimmers, theme } = this.props;
    const { fontColor, boxBgColor } = theme.standard;
    return dimmers.map(({ controllType, name }) => ({
      key: controllType,
      styles: {
        container: [styles.listItem, { backgroundColor: boxBgColor }],
        title: [styles.title, { color: fontColor }],
      },
      title: name,
      subTitle: '',
      arrow: true,
      arrowColor: fontColor,
      Icon: null,
      onPress: this.handleSetting(controllType),
    }));
  }
  handleSetting = (controllType: number) => () => {
    this.props.navigator.push({ id: 'setting', controllType });
  };
  render() {
    return (
      <View style={styles.container}>
        <TYFlatList
          style={{ alignSelf: 'stretch' }}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: 16, backgroundColor: 'transparent' },
          ]}
          separatorStyle={{ backgroundColor: 'transparent' }}
          data={this.getData()}
        />
      </View>
    );
  }
}

export default connect(({ cloudState, devInfo }: any) => {
  const dimmers = [];
  const supportMax = devInfo.supportMax;
  for (let i = 1; i <= supportMax; i++) {
    dimmers.push({
      controllType: i,
      name: cloudState[`dimmerName${i}`] || Strings.formatValue('dimmer_name', i),
    });
  }
  return {
    supportMax,
    dimmers,
  };
})(withTheme(Settings));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: cx(16),
  },
  listItem: {
    paddingHorizontal: cx(16),
    paddingVertical: cx(22),
    marginBottom: cx(16),
    borderRadius: cx(12),
    borderWidth: 0,
    borderTopColor: 'transparent',
  },
  title: {
    fontSize: 17,
  },
});
