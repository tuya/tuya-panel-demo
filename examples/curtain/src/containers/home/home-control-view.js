import color from 'color';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Button from '../../components/Button';
import TYNative from '../../api';
import Res from '../../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const color2Opacity = (c, alpha) => color(c).alpha(alpha).rgbString();
class HomeControlView extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    control: PropTypes.string,
    schema: PropTypes.any,
    dpCodes: PropTypes.any,
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    control: 'stop',
    schema: {},
    dpCodes: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      controlState: false,
    };

    this._timer = null;
  }

  componentWillReceiveProps(nextProps) {
    const { control } = this.props;
    if (control !== nextProps.control && control) {
      clearTimeout(this._timer);
      this.setState({ controlState: true });
      this._timer = setTimeout(() => {
        this.setState({ controlState: false });
      }, 500);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  get dpCodes() {
    const { dpCodes } = this.props;
    const { control: controlCode, workState: workCode } = dpCodes;
    return {
      controlCode,
      workCode,
    };
  }

  getData = () => {
    if (!this.dpCodes.controlCode) return [];
    const { schema } = this.props;
    const controlSchema = schema[this.dpCodes.controlCode];
    const { range } = controlSchema;
    const defaultBtn = {
      iconColor: '#6F797F',
      backgroundColor: color2Opacity('#6F797F', 0.06),
      onBackgroundColor: color2Opacity('#6F797F', 0.2),
    };

    const lightBtn = {
      iconColor: '#659CB8',
      backgroundColor: color2Opacity('#659CB8', 0.06),
      onBackgroundColor: color2Opacity('#6F797F', 0.2),
    };

    return range.slice(0, 3).map(data => ({
      key: data,
      icon: Res[data],
      onPress: () => this._onButtonPress(this.dpCodes.controlCode, data),
      ...(data === 'stop' ? lightBtn : defaultBtn),
    }));
  };

  _onButtonPress = (dpCode, dpData) => {
    TYNative.putDeviceData({
      [dpCode]: dpData,
    });
  };

  _onWorkStatusPress = (dpCode, dpData) => {
    TYNative.putDeviceData({
      [dpCode]: dpData,
      [this.dpCodes.workCode]: dpData === 'open' ? 'opening' : 'closing',
    });
  };

  _renderItem = ({ item, index }) => {
    const { backgroundColor, onBackgroundColor, key, ...itemProps } = item;
    const data = this.getData();
    const dataLength = data.length;
    const { controlState } = this.state;
    const { control } = this.props;

    return (
      <Button
        key={key}
        {...itemProps}
        style={styles.btn}
        size={cx(24)}
        useLocalState={true}
        touchedBackground={onBackgroundColor}
        iconStyle={[
          styles.icon,
          item.key === 'stop' && styles.iconLarge,
          index === 0 && {
            alignSelf: 'flex-start',
          },
          index === dataLength - 1 && {
            alignSelf: 'flex-end',
          },
          {
            backgroundColor: key === control && controlState ? onBackgroundColor : backgroundColor,
          },
        ]}
      />
    );
  };

  render() {
    const { control } = this.props;
    const data = this.getData().filter(({ key }) => !!key);

    const ControlView = (
      <View style={[styles.container]}>
        <FlatList
          contentContainerStyle={styles.gridLayout}
          scrollEnabled={false}
          numColumns={data.length}
          data={data}
          extraData={control}
          renderItem={this._renderItem}
          keyExtractor={({ key }) => key}
        />
      </View>
    );

    return this.dpCodes.controlCode ? ControlView : <View />;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: cy(20),
    width: cx(250),
    height: cx(68),
  },

  gridLayout: {
    width: cx(250),
    height: cx(68),
    justifyContent: 'space-between',
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(48),
    height: cx(48),
    borderRadius: cx(24),
  },

  iconLarge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(68),
    height: cx(68),
    borderRadius: cx(34),
  },
});

export default connect(({ dpState, dpCodes, devInfo }) => ({
  control: dpState[dpCodes.control],
  dpCodes,
  schema: devInfo.schema,
}))(HomeControlView);
