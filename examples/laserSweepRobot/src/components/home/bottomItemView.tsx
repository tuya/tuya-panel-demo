import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { UnitText, TYText } from 'tuya-panel-kit';

interface IProps {
  title?: string;
  values?: string;
  unit?: string;
  color?: string;
  isUnitText?: boolean;
}
export default class ButtomItemView extends PureComponent<IProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    title: '',
    values: 0,
    unit: null,
    color: '#5D6681',
    isUnitText: true,
  };

  render = () => {
    const { color, unit, values, isUnitText, title } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.valueContainer}>
          {isUnitText ? (
            <UnitText valueSize={26} valueColor={color} value={values} />
          ) : (
            <TYText style={[styles.textValues, { color }]}>{values}</TYText>
          )}
          {unit !== null && <TYText style={[styles.textUnit, { color }]}>{unit}</TYText>}
        </View>
        <TYText style={[styles.textTitle, { color }]}>{title}</TYText>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  textTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255, 0.8)',
    marginTop: 6,
    backgroundColor: 'transparent',
  },

  textValues: {
    fontSize: 26,
    color: '#fff',
    backgroundColor: 'transparent',
  },

  textUnit: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
    backgroundColor: 'transparent',
    marginLeft: -3,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
