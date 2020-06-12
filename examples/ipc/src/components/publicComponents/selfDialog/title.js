import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';
import Strings from '../../../i18n';

const { cx } = Config;

class Title extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };
  static defaultProps = {
    title: Strings.getLang('dialogTitle'),
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { title } = this.props;
    return (
      <View style={styles.dialogTitlePage}>
        <TYText numberOfLines={1} style={styles.title}>
          {title}
        </TYText>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  dialogTitlePage: {
    height: cx(50),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    color: '#000000',
    fontSize: cx(16),
    fontWeight: '600',
  },
});

export default Title;
