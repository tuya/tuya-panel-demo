/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable import/extensions */
import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/no-unresolved
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ColorPropType, StatusBar, View } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';

const TYNative = TYSdk.native;

const ExConnectTopbar = (componentName = 'headerView') => WrappedComponent => {
  const handleActions = {
    back: () => {
      const { Navigator } = TYSdk;
      if (Navigator && Navigator.getCurrentRoutes().length > 1) {
        Navigator.pop();
      } else {
        TYNative.back();
      }
    },
    more: () => {
      TYNative.showDeviceMenu();
    },
  };
  const topbarContainer = [
    {
      name: 'pen',
      onPress: handleActions.more,
    },
  ];
  const defaultPropsKeys = ['title', 'onBack', 'actions'];

  return class MixedComponent extends PureComponent {
    static displayName = `${componentName}_${WrappedComponent.displayName}`;

    static propTypes = {
      title: PropTypes.string,
      onBack: PropTypes.func,
      color: ColorPropType,
      actions: PropTypes.array,
      barStyle: PropTypes.oneOf(['default', 'light-content', 'dark-content']),
    };

    static defaultProps = {
      title: '',
      onBack: null,
      color: '#000',
      actions: null,
      barStyle: 'default',
    };

    constructor(props) {
      super(props);

      this._buildConfig();
    }

    _buildConfig = () => {
      const { title, onBack, color, actions } = this.props;
      this.__component = connect(({ devInfo }) => ({
        title: title || devInfo.name,
        color: color || '#000',
        onBack: onBack || handleActions.back,
        actions: actions || topbarContainer,
      }))(WrappedComponent);
    };

    render() {
      const { barStyle } = this.props;
      const mergeProps = _.pickBy(this.props, (__, key) => !defaultPropsKeys.includes(key));
      const TopBar = this.__component;
      return (
        <View>
          <StatusBar barStyle={barStyle || 'default'} />
          <TopBar {...mergeProps} />
        </View>
      );
    }
  };
};

const Instance = new ExConnectTopbar();
export default Instance;
