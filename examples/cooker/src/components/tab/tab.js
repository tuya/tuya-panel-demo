import React from 'react';
/* eslint-disable */
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, Text, StyleSheet, ColorPropType } from 'react-native';
import { Utils as outerUtils } from 'tuya-panel-kit';
const { RatioUtils } = outerUtils;
const { convert, convertX: cx } = RatioUtils;

class Tab extends React.Component {
  static PropTypes = {
    onTabClick: PropTypes.func,
    scrollValue: PropTypes.number,
    underLineColor: ColorPropType,
  };

  static defaultProps = {
    tabBarBackgroundColor: '#fff',
    page: 5,
    underLineColor: '#F85A00',
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { id, data, selected, onPressItem, isFirst, underLineColor } = this.props;

    return (
      <View>
        <TouchableWithoutFeedback onPress={() => onPressItem(id)}>
          <View style={[styles.tab, { marginLeft: isFirst ? 0 : cx(32) }]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.tabText, selected === id && styles.activeText]}
            >
              {data.title}
            </Text>
            {selected === id && (
              <View style={[styles.underLine, { backgroundColor: underLineColor }]} />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    height: cx(41),
    minWidth: cx(36),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: cx(14),
    color: '#666666',
  },

  activeText: {
    color: '#333333',
  },

  underLine: {
    position: 'absolute',
    bottom: cx(5),
    height: cx(3),
    alignSelf: 'center',
    width: '50%',
    backgroundColor: '#F85A00',
    borderRadius: cx(1.5),
  },
});
export default Tab;
