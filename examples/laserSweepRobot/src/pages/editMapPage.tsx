import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer, inject } from 'mobx-react';
import Map from '../components/map';

@inject((state: any) => {
  const {
    panelConfig: { store: panelConfig = {} },
    theme: { getData: theme = {} },
  } = state;
  return {
    panelConfig,
    fontColor: theme.fontColor,
    iconColor: theme.iconColor,
  };
})
@observer
export default class EditMap extends Component<any> {
  map: any;

  async componentWillUnmount() {
    const { onChange } = this.props;
    const mapInfo = (this.map && (await this.map.getValue())) || {};
    if (onChange) onChange(mapInfo);
  }

  render() {
    const { roomTagIds, disabled, mode, panelConfig, fontColor, iconColor } = this.props;
    return (
      <View style={styles.container}>
        <Map
          ref={ref => (this.map = ref)}
          selectTags={roomTagIds}
          laserMapConfig={panelConfig}
          disabled={disabled}
          mode={mode}
          fontColor={fontColor}
          iconColor={iconColor}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
