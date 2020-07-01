import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { ThemeProvider } from 'styled-components/native';
import { Utils } from 'tuya-panel-kit';
import baseTheme from './base';

const { deepMerge } = Utils.ThemeUtils;

export default class Theme extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  };

  render() {
    const theme = deepMerge(baseTheme, this.props.theme);
    return <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>;
  }
}
