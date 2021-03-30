/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';
import _ from 'lodash';
import {
  View,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  NativeSyntheticEvent,
  NativeScrollEvent,
  PanResponderInstance,
} from 'react-native';
import Item from './item';

interface ShufflingListProps {
  data: [{ [key: string]: string }];
  themeColor?: string;
  contentWidth: number;
  marginRight: number;
  itemWidth: number;
  numberOfLines?: number;
  itemStyle?: { [key: string]: number | string };
  onIndexChange: any;
  isDefaultTheme: boolean;
}

interface ShufflingListState {
  selectIndex: number;
  canTouch: boolean;
  canSet: boolean;
  move: boolean;
}
export default class ShufflingList extends Component<ShufflingListProps, ShufflingListState> {
  constructor(props: ShufflingListProps) {
    super(props);
    this.state = {
      selectIndex: 0,
      canTouch: true,
      canSet: true,
      move: false,
    };
    this.beforeX = 0;
    this.after = 0;
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: (e, gestureState) => this._handleResponderGrant(e, gestureState),
      onPanResponderRelease: (e, gestureState) => this._handleResponderRelease(e, gestureState),
    });
  }

  componentDidMount() {
    const { selectIndex } = this.state;
    setTimeout(() => {
      this._scrollToItem(selectIndex);
    }, 200);
  }

  _panResponder: PanResponderInstance;

  beforeX: number;

  after: number;

  refs: any;

  _handleResponderGrant = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { moveX } = gestureState;
    this.beforeX = moveX;
  };

  _handleResponderRelease = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { moveX } = gestureState;
    const { canTouch } = this.state;
    if (!canTouch) return;
    this.after = moveX;
    this._startScroll();
  };

  _startScroll = () => {
    const { selectIndex } = this.state;
    const { data } = this.props;
    const num = data.length;
    if (this.after - this.beforeX > 0) {
      if (selectIndex === 0) return;
      this.setState(
        {
          selectIndex: selectIndex - 1,
        },
        () => this._scrollToItem(selectIndex - 1)
      );
    } else if (this.beforeX - this.after > 0) {
      if (selectIndex === num - 1) return;
      this.setState(
        {
          selectIndex: selectIndex + 1,
        },
        () => this._scrollToItem(selectIndex + 1)
      );
    }
  };

  _scrollToItem = (i: number) => {
    const { data, itemWidth, onIndexChange } = this.props;
    if (data.length < 2) return;
    _.delay(
      () =>
        this.refs &&
        this.refs.scrollTo({
          animated: true,
          x: i === 0 ? 0 : itemWidth * i,
          y: 0,
        }),
      1
    );
    onIndexChange(i);
  };

  _renderRow = (item: { [key: string]: string }, index: number) => {
    const {
      themeColor,
      isDefaultTheme,
      itemWidth,
      marginRight,
      itemStyle,
      numberOfLines,
    } = this.props;
    const { selectIndex } = this.state;
    return (
      <Item
        key={item.key}
        idx={index}
        item={item}
        selectIndex={selectIndex}
        themeColor={themeColor}
        isDefaultTheme={isDefaultTheme}
        switchChange={(i: number) => {
          this.setState({ selectIndex: i });
          this._scrollToItem(i);
        }}
        marginRight={marginRight}
        itemWidth={itemWidth}
        itemStyles={itemStyle}
        numberOfLines={numberOfLines}
      />
    );
  };

  _onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { canSet, move } = this.state;
    const { data, itemWidth } = this.props;
    const offsetX = e.nativeEvent.contentOffset.x; // 滑动距离
    if (offsetX <= itemWidth / 2) {
      move &&
        this.setState({ selectIndex: 0 }, () => {
          this._scrollToItem(0);
        });
    } else {
      const idx = Math.ceil((offsetX - itemWidth / 2) / itemWidth);
      const index = idx >= data.length - 1 ? data.length - 1 : idx;
      move &&
        this.setState({ selectIndex: index }, () => {
          this._scrollToItem(index);
        });
    }
    this.setState({ move: false, canSet: !canSet });
  };

  renderList = () => {
    const { data, itemWidth } = this.props;
    return (
      <ScrollView
        ref={(ref: any) => {
          this.refs = ref;
        }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingRight: itemWidth * 2 + itemWidth / 2,
        }}
        {...this._panResponder.panHandlers}
        snapToAlignment="center"
        snapToInterval={itemWidth}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          this.setState({ move: true });
        }}
        onMomentumScrollEnd={this._onMomentumScrollEnd}
      >
        {data.map((item: { [key: string]: string }, idx: number) => this._renderRow(item, idx))}
      </ScrollView>
    );
  };

  render() {
    const { contentWidth } = this.props;
    return <View style={{ width: contentWidth }}>{this.renderList()}</View>;
  }
}
