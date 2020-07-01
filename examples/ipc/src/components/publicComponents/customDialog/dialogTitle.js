import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';
import Strings from '../../../i18n';

const { cx } = Config;

class DialogTitle extends React.Component {
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
    height: cx(45),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 5,
    backgroundColor: '#fdfdfd',
    borderTopRightRadius: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
  },
  title: {
    color: '#494947',
    fontSize: cx(14),
  },
});

export default DialogTitle;
