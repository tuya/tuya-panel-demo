import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import { Utils, TYText } from 'tuya-panel-kit';
import { DPCodes } from '../config';
import MapView from '../components/home/mapView';

const { convertY: cy } = Utils.RatioUtils;

@inject(
  ({
    dpState,
    panelConfig: { store: panelConfig = {} },
    theme: { getData: theme = { fontColor: '#fff', iconColor: '#fff' } },
  }) => {
    const { data } = dpState;
    return {
      robotStatus: data[DPCodes.robotStatus],
      panelConfig,
      fontColor: theme.fontColor,
      iconColor: theme.iconColor,
    };
  }
)
@observer
export default class MapHistory extends Component<any, any> {
  mapRef: MapView | null;

  appMapId: any;

  constructor(props: any) {
    super(props);
    this.state = {
      mapLoadEnd: false,
    };
  }

  onMapLoadEnd = (success: boolean) => {
    this.setState({ mapLoadEnd: success });
  }

  getTopData = () => {
    const {
      cleanArea,
      cleanTime,
      cleanTimeTitle,
      cleanTimeUnit,
      cleanAreaTitle,
      cleanAreaUnit,
    } = this.props;
    return [
      {
        title: cleanArea,
        unit: cleanAreaUnit,
        subtitle: cleanAreaTitle,
      },
      {
        title: cleanTime,
        unit: cleanTimeUnit,
        subtitle: cleanTimeTitle,
      },
    ];
  };

  renderTopItem = (d: { title: string; unit: string; subtitle: string }, k: number) => {
    const { fontColor } = this.props;
    return (
      <View key={k} style={styles.topItem}>
        <View style={styles.itemTitle}>
          <TYText style={[styles.title, { color: fontColor }]}>{d.title}</TYText>
          <TYText style={[styles.unit, { color: fontColor }]}>{d.unit}</TYText>
        </View>
        <TYText style={[styles.subtitle, { color: fontColor }]}>{d.subtitle}</TYText>
      </View>
    );
  };

  render() {
    const { panelConfig, history, bucket, fontColor, iconColor } = this.props;
    const { mapLoadEnd } = this.state;
    return (
      <View style={styles.container}>
        <MapView
          mapDisplayMode="history"
          history={{ ...history, bucket }}
          config={panelConfig}
          fontColor={fontColor}
          iconColor={iconColor}
          onMapLoadEnd={this.onMapLoadEnd}
          mapLoadEnd={mapLoadEnd}
          pathVisible={true}
        />
        <View style={styles.topContainer}>
          {this.getTopData().map((d, k) => {
            return this.renderTopItem(d, k);
          })}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topContainer: {
    height: cy(120),
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  topItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemTitle: {
    flexDirection: 'row',
  },

  title: {
    fontSize: cy(46),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  unit: {
    fontSize: cy(10),
    marginTop: cy(9),
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: cy(12),
    marginTop: cy(-6),
    color: '#FFFFFF',
  },
});
