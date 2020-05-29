/* eslint-disable max-len */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { MagicFlatList } from 'react-native-magic-list';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

class List extends Component {
  static propTypes = {
    datas: PropTypes.array,
    selected: PropTypes.number,
  };

  static defaultProps = {
    datas: [],
    selected: 0,
  };

  constructor(props) {
    super(props);

    this._first = null;
    this.timer = null;
  }

  onPressItem = id => {
    this.props.onTabClick && this.props.onTabClick(id);
  };

  setNativeProps = (...props) => {
    this._list && this._list.setNativeProps(...props);
  };

  _pressThrottle = _.throttle(this.onPressItem, 16);

  _onResponderHandleEvent = (e, handEvent) => {
    const { datas, selected, onResponseMove } = this.props;
    if (handEvent === 'move') {
      onResponseMove && onResponseMove();
    }
    const handleEvent = _.head(_.get(e, 'nativeEvent.touches'));
    const { pageY } = handleEvent;
    if (this._first) {
      let height = 0;
      let _pageY = 0;
      // View -> ref -> measurex
      this._first.measure((...args) => {
        // agrs -> (x, y, width, height, pageX, pageY)
        // eslint-disable-next-line prefer-destructuring
        height = args[3];
        _pageY = _.last(args);
        if (!_pageY || pageY < _pageY) return;
        let index = Math.floor((pageY - _pageY) / height);
        index = Math.min.apply(null, [index, datas.length - 1]);
        selected !== index && this._pressThrottle(index);
      });
    }
  };

  _renderItem = data => {
    const { item, index } = data;
    const { selected } = this.props;
    // eslint-disable-next-line no-return-assign
    const extraOption = index === 0 ? { ref: ref => (this._first = ref) } : {};
    return (
      <TouchableWithoutFeedback onPress={() => this.onPressItem(index)}>
        <View {...extraOption} style={styles.item}>
          <Text style={[styles.text, selected === index && { color: '#FA9601' }]}>{item}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    const { datas, selected, onResponseRelease } = this.props;
    const shouldResponse = () => true;
    return (
      // eslint-disable-next-line no-return-assign
      <View ref={ref => (this._list = ref)} style={styles.container}>
        <View style={{ height: datas.length * cy(16) }}>
          <MagicFlatList
            data={datas}
            delay={80}
            animateType="zoomIn"
            scrollEnabled={false}
            contentContainerStyle={styles.contentContainerStyle}
            getItemLayout={(__, index) => ({ index, length: cx(16), offset: cx(16) * index })}
            extraData={selected}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(__, index) => `list${index}`}
            renderItem={this._renderItem}
            onResponderMove={e => this._onResponderHandleEvent(e, 'move')}
            onStartShouldSetResponder={shouldResponse}
            onResponderGrant={this._onResponderHandleEvent}
            onMoveShouldSetResponder={shouldResponse}
            onResponderRelease={() => {
              clearTimeout(this.timer);
              this.timer = setTimeout(() => {
                onResponseRelease && onResponseRelease();
              }, 100);
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: cx(24),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    right: 0,
  },

  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  text: {
    fontSize: cx(14),
    color: '#111',
  },

  item: {
    width: cx(24),
    height: cy(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default List;
