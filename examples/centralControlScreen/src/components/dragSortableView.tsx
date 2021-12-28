import React, { FC, useEffect, useRef, useState, useMemo } from 'react';
import _ from 'lodash';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  PanResponderInstance,
  PanResponderGestureState,
} from 'react-native';
import { IDragSortDataSource } from '@interface';

const { width } = Dimensions.get('window');

const defaultZIndex = 8;
const touchZIndex = 99;

interface IDragSortableViewProps {
  childrenHeight: number;
  childrenWidth: number;
  renderItem: (item: IDragSortDataSource, index: number) => React.ReactElement;
  dataSource: IDragSortDataSource[];
  parentWidth?: number;
  marginChildrenTop?: number;
  marginChildrenBottom?: number;
  marginChildrenLeft?: number;
  marginChildrenRight?: number;
  sortable?: boolean;
  delayLongPress?: number;
  scaleStatus?: 'scale' | 'scaleX' | 'scaleY';
  fixedItems?: any[];
  isDragFreely?: boolean;
  maxScale?: number;
  minOpacity?: number;
  scaleDuration?: number;
  slideDuration?: number;
  onDragging?: (gestureState: PanResponderGestureState, left: number, top: number) => void;
  onClickItem?: (data: IDragSortDataSource[], item: IDragSortDataSource, index: number) => void;
  onDragStart?: (touchIndex: number) => void;
  onDragEnd?: (currentIndex: number, moveToIndex: number) => void;
  onDataChange?: (data: IDragSortDataSource[]) => void;
  keyExtractor?: (item: IDragSortDataSource, index: number) => React.Key;
}

interface IDataSourceItem {
  data: IDragSortDataSource;
  originIndex: number;
  originLeft: number;
  originTop: number;
  position: Animated.ValueXY;
  scaleValue: Animated.Value;
}

interface ITouchCurItem {
  ref: any;
  index: number;
  originLeft: number;
  originTop: number;
  moveToIndex: number;
}

const DragSortableView: FC<IDragSortableViewProps> = props => {
  const {
    childrenHeight,
    childrenWidth,
    renderItem,
    dataSource: propDataSource,
    parentWidth = width,
    marginChildrenTop = 0,
    marginChildrenBottom = 0,
    marginChildrenLeft = 0,
    marginChildrenRight = 0,
    sortable = true,
    onClickItem,
    onDragStart,
    onDragEnd,
    onDataChange,
    keyExtractor,
    delayLongPress = 0,
    onDragging,
    scaleStatus = 'scale',
    fixedItems = [],
    isDragFreely = false,
    maxScale = 1.1,
    minOpacity = 0.8,
    scaleDuration = 100,
    slideDuration = 300,
  } = props;
  let isScaleRecovery;

  const itemWidth = useMemo(
    () => childrenWidth + marginChildrenLeft + marginChildrenRight,
    [childrenWidth, marginChildrenLeft, marginChildrenRight]
  );

  const itemHeight = useMemo(
    () => childrenHeight + marginChildrenTop + marginChildrenBottom,
    [childrenHeight, marginChildrenTop, marginChildrenBottom]
  );

  const [dataSource, setDataSource] = useState<IDataSourceItem[]>([]);
  const [height, setHeight] = useState(0);
  const isMovePanResponder = useRef(false);
  const isHasMove = useRef(false);
  const touchCurItem = useRef({} as ITouchCurItem);
  const sortRefs = useRef(new Map());

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => {
          isMovePanResponder.current = false;
          return false;
        },
        onMoveShouldSetPanResponder: () => isMovePanResponder.current,
        onMoveShouldSetPanResponderCapture: () => isMovePanResponder.current,

        onPanResponderGrant: () => ({}),
        onPanResponderMove: (evt, gestureState) => moveTouch(evt, gestureState),
        onPanResponderRelease: (_evt, _gestureState) => endTouch(),

        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => false,
      }),
    [dataSource]
  );

  useEffect(() => {
    reComplexDataSource(true);
    return () => {
      if (isScaleRecovery) clearTimeout(isScaleRecovery);
    };
  }, []);

  useEffect(() => {
    reComplexDataSource(false);
  }, [propDataSource]);

  const startTouch = (touchIndex: number) => {
    // 防止拖动
    if (fixedItems.length > 0 && fixedItems.includes(touchIndex)) {
      return;
    }

    isHasMove.current = false;

    if (!sortable) return;

    if (sortRefs.current.has(touchIndex)) {
      if (onDragStart) {
        onDragStart(touchIndex);
      }

      Animated.timing(dataSource[touchIndex].scaleValue, {
        toValue: maxScale,
        duration: scaleDuration,
      }).start(() => {
        touchCurItem.current = {
          ref: sortRefs.current.get(touchIndex),
          index: touchIndex,
          originLeft: dataSource[touchIndex].originLeft,
          originTop: dataSource[touchIndex].originTop,
          moveToIndex: touchIndex,
        };
        isMovePanResponder.current = true;
      });
    }
  };

  const moveTouch = (nativeEvent, gestureState: PanResponderGestureState) => {
    isHasMove.current = true;

    if (touchCurItem.current) {
      let { dx, dy } = gestureState;

      const rowNum = _.parseInt((parentWidth / itemWidth).toString());
      const maxWidth = parentWidth - itemWidth;
      const maxHeight = itemHeight * Math.ceil(dataSource.length / rowNum) - itemHeight;

      // Is it free to drag
      if (!isDragFreely) {
        // Maximum or minimum after out of bounds
        if (touchCurItem.current.originLeft + dx < 0) {
          dx = -touchCurItem.current.originLeft;
        } else if (touchCurItem.current.originLeft + dx > maxWidth) {
          dx = maxWidth - touchCurItem.current.originLeft;
        }
        if (touchCurItem.current.originTop + dy < 0) {
          dy = -touchCurItem.current.originTop;
        } else if (touchCurItem.current.originTop + dy > maxHeight) {
          dy = maxHeight - touchCurItem.current.originTop;
        }
      }

      const left = touchCurItem.current.originLeft + dx;
      const top = touchCurItem.current.originTop + dy;

      touchCurItem.current.ref.setNativeProps({
        style: {
          zIndex: touchZIndex,
        },
      });

      dataSource[touchCurItem.current.index].position.setValue({
        x: left,
        y: top,
      });

      if (onDragging) {
        onDragging(gestureState, left, top);
      }

      let moveToIndex = 0;
      let moveXNum = dx / itemWidth;
      let moveYNum = dy / itemHeight;
      if (moveXNum > 0) {
        moveXNum = _.parseInt((moveXNum + 0.5).toString());
      } else if (moveXNum < 0) {
        moveXNum = _.parseInt((moveXNum - 0.5).toString());
      }
      if (moveYNum > 0) {
        moveYNum = _.parseInt((moveYNum + 0.5).toString());
      } else if (moveYNum < 0) {
        moveYNum = _.parseInt((moveYNum - 0.5).toString());
      }

      moveToIndex = touchCurItem.current.index + moveXNum + moveYNum * rowNum;

      if (moveToIndex > dataSource.length - 1) {
        moveToIndex = dataSource.length - 1;
      } else if (moveToIndex < 0) {
        moveToIndex = 0;
      }

      if (touchCurItem.current.moveToIndex !== moveToIndex) {
        if (fixedItems.length > 0 && fixedItems.includes(moveToIndex)) return;
        touchCurItem.current.moveToIndex = moveToIndex;
        dataSource.forEach((item: any, index) => {
          let nextItem: IDataSourceItem | null = null;
          if (index > touchCurItem.current.index && index <= moveToIndex) {
            nextItem = dataSource[index - 1];
          } else if (index >= moveToIndex && index < touchCurItem.current.index) {
            nextItem = dataSource[index + 1];
          } else if (
            index !== touchCurItem.current.index &&
            (item.position.x._value !== item.originLeft ||
              item.position.y._value !== item.originTop)
          ) {
            nextItem = dataSource[index];
          } else if (
            (touchCurItem.current.index - moveToIndex > 0 && moveToIndex === index + 1) ||
            (touchCurItem.current.index - moveToIndex < 0 && moveToIndex === index - 1)
          ) {
            nextItem = dataSource[index];
          }

          if (nextItem != null) {
            Animated.timing(item.position, {
              toValue: {
                x: _.parseInt((nextItem.originLeft + 0.5).toString()),
                y: _.parseInt((nextItem.originTop + 0.5).toString()),
              },
              duration: slideDuration,
              easing: Easing.out(Easing.quad),
            }).start();
          }
        });
      }
    }
  };

  const endTouch = () => {
    // clear
    if (touchCurItem.current) {
      if (onDragEnd) {
        onDragEnd(touchCurItem.current.index, touchCurItem.current.moveToIndex);
      }
      Animated.timing(dataSource[touchCurItem.current.index].scaleValue, {
        toValue: 1,
        duration: scaleDuration,
      }).start();

      touchCurItem.current.ref.setNativeProps({
        style: {
          zIndex: defaultZIndex,
        },
      });
      changePosition(touchCurItem.current.index, touchCurItem.current.moveToIndex);
      // touchCurItem.current = null;
    }
  };

  const onPressOut = () => {
    isScaleRecovery = setTimeout(() => {
      if (isMovePanResponder.current && !isHasMove.current) {
        endTouch();
      }
    }, 220);
  };

  const changePosition = (startIndex, endIndex) => {
    let _startIndex = startIndex;
    let _endIndex = endIndex;
    if (_startIndex === _endIndex) {
      const curItem = dataSource[startIndex];
      dataSource[startIndex].position.setValue({
        x: _.parseInt((curItem.originLeft + 0.5).toString()),
        y: _.parseInt((curItem.originTop + 0.5).toString()),
      });
      return;
    }

    let isCommon = true;
    if (_startIndex > _endIndex) {
      isCommon = false;
      const tempIndex = startIndex;
      _startIndex = endIndex;
      _endIndex = tempIndex;
    }

    const newDataSource = [...dataSource].map((item, index) => {
      let _item = item;
      let newIndex: number | null = null;
      if (isCommon) {
        if (_endIndex > index && index >= _startIndex) {
          newIndex = index + 1;
        } else if (_endIndex === index) {
          newIndex = _startIndex;
        }
      } else if (_endIndex >= index && index > _startIndex) {
        newIndex = index - 1;
      } else if (_startIndex === index) {
        newIndex = _endIndex;
      }

      if (newIndex != null) {
        const newItem = { ...dataSource[newIndex] };
        newItem.originLeft = _item.originLeft;
        newItem.originTop = _item.originTop;
        newItem.position = new Animated.ValueXY({
          x: _.parseInt((_item.originLeft + 0.5).toString()),
          y: _.parseInt((_item.originTop + 0.5).toString()),
        });
        _item = newItem;
      }

      return _item;
    });

    if (onDataChange) {
      onDataChange(getOriginalData());
    }
    Promise.resolve()
      .then(() => {
        setDataSource(newDataSource);
      })
      .then(() => {
        // Prevent RN from drawing the beginning and end
        const startItem = dataSource[_startIndex];
        dataSource[_startIndex].position.setValue({
          x: _.parseInt((startItem.originLeft + 0.5).toString()),
          y: _.parseInt((startItem.originTop + 0.5).toString()),
        });
        const endItem = dataSource[_endIndex];
        dataSource[_endIndex].position.setValue({
          x: _.parseInt((endItem.originLeft + 0.5).toString()),
          y: _.parseInt((endItem.originTop + 0.5).toString()),
        });
      });
  };

  const reComplexDataSource = isInit => {
    const rowNum = _.parseInt((parentWidth / itemWidth).toString());
    const newDataSource = propDataSource.map((item, index) => {
      const newData: IDataSourceItem = {} as IDataSourceItem;
      const left = (index % rowNum) * itemWidth;
      const top = _.parseInt((index / rowNum).toString()) * itemHeight;

      newData.data = item;
      newData.originIndex = index;
      newData.originLeft = left;
      newData.originTop = top;
      newData.position = new Animated.ValueXY({
        x: _.parseInt((left + 0.5).toString()),
        y: _.parseInt((top + 0.5).toString()),
      });
      newData.scaleValue = new Animated.Value(1);
      return newData;
    });
    if (isInit) {
      // console.log(isInit);
    } else {
      setDataSource(newDataSource);
      setHeight(Math.ceil(newDataSource.length / rowNum) * itemHeight);
    }
  };

  const getOriginalData = () => {
    return dataSource.map((item, index) => item.data);
  };
  const _renderItemView = () =>
    dataSource.map((item, index) => {
      const transformObj = {};
      transformObj[scaleStatus] = item.scaleValue;
      const key = keyExtractor ? keyExtractor(item.data, index) : item.originIndex;

      return (
        <Animated.View
          key={key}
          ref={ref => sortRefs.current.set(index, ref)}
          {...panResponder.panHandlers}
          style={[
            styles.item,
            {
              marginTop: marginChildrenTop,
              marginBottom: marginChildrenBottom,
              marginLeft: marginChildrenLeft,
              marginRight: marginChildrenRight,
              left: item.position.x,
              top: item.position.y,
              opacity: item.scaleValue.interpolate({
                inputRange: [1, maxScale],
                outputRange: [1, minOpacity],
              }),
              transform: [transformObj],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            delayLongPress={delayLongPress || 1000}
            onPressOut={() => onPressOut()}
            onLongPress={() => startTouch(index)}
            onPress={() => {
              if (onClickItem) {
                onClickItem(getOriginalData(), item.data, index);
              }
            }}
          >
            {renderItem(item.data, index)}
          </TouchableOpacity>
        </Animated.View>
      );
    });

  return (
    <View
      style={[
        styles.container,
        {
          width: parentWidth,
          height,
        },
      ]}
    >
      {_renderItemView()}
    </View>
  );
};

DragSortableView.defaultProps = {
  marginChildrenTop: 0,
  marginChildrenBottom: 0,
  marginChildrenLeft: 0,
  marginChildrenRight: 0,
  parentWidth: width,
  sortable: true,
  scaleStatus: 'scale',
  fixedItems: [],
  isDragFreely: false,
  maxScale: 1.1,
  minOpacity: 0.8,
  scaleDuration: 100,
  slideDuration: 300,
  delayLongPress: 0,
  onClickItem: () => ({}),
  onDragStart: () => ({}),
  onDragEnd: () => ({}),
  onDataChange: () => ({}),
  keyExtractor: (item, index) => index,
  onDragging: () => ({}),
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  item: {
    position: 'absolute',
    zIndex: defaultZIndex,
  },
});

export default DragSortableView;
