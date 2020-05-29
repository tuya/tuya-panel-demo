import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Utils as outerUtils } from 'tuya-panel-kit';

const { RatioUtils } = outerUtils;
const { convertX } = RatioUtils;

class Tab extends React.Component {
  static propTypes = {
    onPressItem: PropTypes.func,
    id: PropTypes.number,
    data: PropTypes.string,
    selected: PropTypes.number,
    isFirst: PropTypes.bool,
  };
  static defaultProps = {
    id: 0,
    data: '',
    selected: 0,
    isFirst: false,
    onPressItem: () => {},
  };
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { id, data, selected, onPressItem, isFirst } = this.props;

    return (
      <View>
        <TouchableWithoutFeedback onPress={() => onPressItem(id)}>
          <View style={[styles.tab, { marginLeft: isFirst ? 0 : convertX(32) }]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.tabText, selected === id && styles.activeText]}
            >
              {data}
            </Text>
            {selected === id && <View style={styles.underLine} />}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    height: convertX(41),
    minWidth: convertX(36),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: convertX(15),
    color: '#9B9B9B',
  },

  activeText: {
    color: '#4A4A4A',
  },

  underLine: {
    position: 'absolute',
    bottom: 0,
    height: convertX(2),
    alignSelf: 'center',
    width: '80%',
    backgroundColor: '#FFA933',
  },
});
export default Tab;
