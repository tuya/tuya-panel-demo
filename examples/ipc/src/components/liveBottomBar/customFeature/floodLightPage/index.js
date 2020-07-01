/* eslint-disable no-lonely-if */
/* eslint-disable react/require-default-props */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import WhiteLight from './whiteLight';
import ColorLight from './colorLight';
import LightControl from './lightControl';
import DialogTitle from '../../../publicComponents/customDialog/dialogTitle';
import Config from '../../../../config';
import Strings from '../../../../i18n';

const { cx } = Config;

class FloodLight extends React.Component {
  static propTypes = {
    light_color_control: PropTypes.string,
    floodlight_mode: PropTypes.string,
    schema: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      showColorPage: true,
      currentTitle: Strings.getLang('ipc_light_white_title'),
    };
  }
  componentDidMount() {
    this.lightTypeControl(this.props);
    this.changeTitle();
  }
  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    const { floodlight_mode, light_color_control } = nextProps;
    if (
      !_.isEqual(oldProps.floodlight_mode, floodlight_mode) ||
      !_.isEqual(oldProps.light_color_control, light_color_control)
    ) {
      this.lightTypeControl(nextProps);
      this.changeTitle();
    }
  }
  changeTitle = () => {
    const { schema, floodlight_mode } = this.props;
    let title = '';
    if ('floodlight_mode' in schema) {
      // 如果灯光模式存在，根据当前模式展现;
      const lightMode = floodlight_mode;
      title =
        lightMode === '0'
          ? Strings.getLang('ipc_light_white_title')
          : Strings.getLang('ipc_light_color_title');
    } else {
      // 如果灯光模式不存在，根据light_color当前模式展现;
      if ('light_color_control' in schema) {
        title = Strings.getLang('ipc_light_color_title');
      } else {
        title = Strings.getLang('ipc_light_white_title');
      }
    }
    this.setState({
      currentTitle: title,
    });
  };
  lightTypeControl = props => {
    const { floodlight_mode, light_color_control } = props;
    let showColorPage = false;
    if (floodlight_mode === undefined && light_color_control !== undefined) {
      showColorPage = true;
    } else if (floodlight_mode === '1') {
      showColorPage = true;
    } else {
      showColorPage = false;
    }
    this.setState({
      showColorPage,
    });
  };

  render() {
    const { showColorPage, currentTitle } = this.state;
    return (
      <View style={styles.floodLightPage}>
        <DialogTitle title={currentTitle} />
        <View style={styles.floodLightContainer}>
          {showColorPage ? <ColorLight /> : <WhiteLight />}
          <LightControl />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  floodLightPage: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  floodLightContainer: {
    paddingHorizontal: cx(20),
    paddingTop: Math.ceil(cx(20)),
    paddingBottom: 0,
  },
});
const mapStateToProps = state => {
  const { dpState, devInfo } = state;
  const { light_color_control, floodlight_mode } = dpState;
  const { schema } = devInfo;
  return {
    light_color_control,
    floodlight_mode,
    schema,
  };
};

export default connect(mapStateToProps, null)(FloodLight);
