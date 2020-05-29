import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MagicFlatList } from 'react-native-magic-list';
import { Dimensions, StyleSheet, View, ColorPropType } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Tab from './tab';

const { width } = Dimensions.get('window');
const { convertX: cx } = Utils.RatioUtils;

class TabBar extends Component {
  static propTypes = {
    selected: PropTypes.number,
    tabs: PropTypes.any,
    underLineColor: ColorPropType,
    style: PropTypes.any,
    onTabClick: PropTypes.func,
  };

  static defaultProps = {
    selected: 0,
    tabs: [],
    underLineColor: '#F85A00',
    style: null,
    onTabClick: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected,
    };
  }

  onPressItem = id => {
    if (id === this.state.selected) return;
    this.setState({ selected: id });
    this.props.onTabClick && this.props.onTabClick(id);
  };

  _renderItem = data => {
    const { item, index } = data;
    const { underLineColor } = this.props;
    return (
      <Tab
        data={item}
        id={index}
        isFirst={index === 0}
        onPressItem={id => this.onPressItem(id)}
        selected={this.state.selected}
        underLineColor={underLineColor}
      />
    );
  };

  render() {
    const { tabs, style } = this.props;

    return (
      <View style={[styles.container, style]}>
        <MagicFlatList
          data={tabs}
          extraData={[this.state, this.props]}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(__, index) => `${index}tab`}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={this._renderItem}
          delay={150}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: cx(41),
  },

  contentContainerStyle: {
    height: cx(41),
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: width,
    backgroundColor: '#fff',
    paddingHorizontal: cx(24),
  },
});
export default TabBar;
