import React, { Component } from 'react';
/* eslint-disable */
import PropTypes from 'prop-types';
import { View, StyleSheet, Dimensions, Text, SectionList, Image } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import Strings from '../i18n';
import IngredientsItem from './ingredients-item-view';
import SuitableItem from './suitable-item-view';
import StepsItem from './steps-item-view';

const { RatioUtils } = Utils;
const { convertX: cx, convertY: cy } = RatioUtils;
const { width } = Dimensions.get('window');

export default class RecipeContentView extends Component {
  // 初始化模拟数据
  static propTypes = {
    select: PropTypes.number,
    isManual: PropTypes.bool,
    ...SectionList.propTypes,
  };

  static defaultProps = {
    select: 0,
    isManual: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      _refreshing: false,
    };
    this._section = null;
    this.contentMeasure = {};
    this.onLayoutStack = [];
  }

  onRefreshClose = () => {
    this.setState({ _refreshing: false });
  };

  _getLastIndexByScrollEvent = e => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const measureVal = Object.values(this.contentMeasure).map(item => {
      const { itemOffsetY, titleOffsetY } = item;
      return itemOffsetY + titleOffsetY;
    });
    const offsetStack = measureVal.map((__, i) => {
      const preStack = measureVal.filter((__, index) => index <= i);
      return _.sum(preStack);
    });
    const curSelectIndex = _.findIndex(offsetStack, o => offsetY <= o * 0.95);
    return curSelectIndex === -1 ? offsetStack.length - 1 : curSelectIndex;
  };

  _onItemSelect = index => {
    this._section &&
      this._section.scrollToLocation({
        animated: true,
        itemIndex: 0,
        sectionIndex: index,
        viewOffset: cx(36),
        viewPosition: 0,
      });
  };

  _onRefresh = () => {
    const { onRefresh } = this.props;
    this.setState({ _refreshing: true }, () => {
      !onRefresh && this.onRefreshClose();
      onRefresh && onRefresh();
    });
  };

  _onScroll = e => {
    const { handleCurIndex, isManual } = this.props;
    const curSelectIndex = this._getLastIndexByScrollEvent(e);
    handleCurIndex && !isManual && handleCurIndex(curSelectIndex, false);
  };

  _onScrollBeginDrag = () => {
    const { handleDrag } = this.props;
    handleDrag && handleDrag();
  };

  _handleTouchEventEnd = e => {
    const { handleCurIndex } = this.props;
    const curSelectIndex = this._getLastIndexByScrollEvent(e);
    handleCurIndex && handleCurIndex(curSelectIndex, false);
  };

  _onMomentumScrollEnd = this._handleTouchEventEnd;

  _onScrollEndDrag = this._handleTouchEventEnd;

  _onHeaderLayout = (e, title) => {
    const { sections } = this.props;
    const { nativeEvent } = e;
    const { layout } = nativeEvent;
    const { y, height } = layout;
    const index = _.findIndex(sections, ({ title: t }) => t === title);
    if (!(index in this.contentMeasure)) {
      this.contentMeasure[index] = {
        titleOffsetY: y + height,
      };
    } else {
      this.contentMeasure[index] = Object.assign({}, this.contentMeasure[index], {
        titleOffsetY: y + height,
      });
    }
  };

  _onItemLayout = (e, title) => {
    const { sections } = this.props;
    const { nativeEvent } = e;
    const { layout } = nativeEvent;
    const { y, height } = layout;
    const index = _.findIndex(sections, ({ title: t }) => t === title);
    const measured = this.onLayoutStack.includes(title);
    // 避免安卓卡顿
    if (measured) return;
    if (!(index in this.contentMeasure)) {
      this.contentMeasure[index] = {
        itemOffsetY: y + height,
      };
    } else {
      this.contentMeasure[index] = Object.assign({}, this.contentMeasure[index], {
        itemOffsetY: y + height,
      });
    }
    this.onLayoutStack.push(title);
  };

  _renderSectionHeader = ({ section: { title } }) => {
    return (
      <Text onLayout={e => this._onHeaderLayout(e, title)} style={styles.titleTextStyle}>
        {title}
      </Text>
    );
  };

  _renderItem = ({ section }) => {
    const { data, title } = section;
    const itemData = data[0];
    if (typeof itemData === 'string') {
      return (
        <Text onLayout={e => this._onItemLayout(e, title)} style={styles.detailTextStyle}>
          {`${itemData}`}
        </Text>
      );
    }
    return this._renderPublicItem(itemData, title);
  };

  _renderPublicItem = (itemData, title) => {
    let child = null;
    switch (title) {
      case Strings.getLang('ingredients'):
        child = this._renderIngredientsItem(itemData);
        break;
      case Strings.getLang('stepsDesc'):
        child = this._renderStepsItem(itemData);
        break;
      case Strings.getLang('knowledge'):
        child = this._renderKnowledgeItem(itemData);
        break;
      case Strings.getLang('xyxk'):
        child = this._renderSuitableItem(itemData);
        break;
      case Strings.getLang('twsteps'):
        child = this._renderStepsItem(itemData);
        break;
      default:
        break;
    }
    return <View onLayout={e => this._onItemLayout(e, title)}>{child}</View>;
  };

  _renderIngredientsItem = itemData => {
    const { material_image, material } = itemData;
    return (
      <View>
        <Image style={styles.materialImg} source={{ uri: material_image }} />
        <IngredientsItem data={material} />
      </View>
    );
  };

  _renderStepsItem = itemData => {
    const { step } = itemData;
    return <StepsItem data={step || itemData} />;
  };

  _renderKnowledgeItem = itemData => {
    const { image, nutrition_analysis, production_direction } = itemData;
    return (
      <View>
        <Image style={styles.materialImg} source={{ uri: image }} />
        <Text style={styles.knowText}>{nutrition_analysis}</Text>
        <Text
          style={[
            styles.knowText,
            nutrition_analysis && {
              marginTop: cy(8),
            },
          ]}
        >
          {production_direction}
        </Text>
      </View>
    );
  };

  _renderSuitableItem = itemData => {
    const { material } = itemData;
    const { image, suitable_not_with, suitable_with } = material;
    const datas = _.flattenDeep([suitable_not_with, suitable_with]);
    return (
      <View>
        <Image style={styles.materialImg} source={{ uri: image }} />
        <SuitableItem data={datas} />
      </View>
    );
  };

  _renderSectionFooter = () => {
    return <View height={cy(16)} />;
  };

  render() {
    const { sections, ...sectionProps } = this.props;
    const { _refreshing } = this.state;
    return (
      <SectionList
        ref={ref => (this._section = ref)}
        style={styles.container}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        renderSectionFooter={this._renderSectionFooter}
        keyExtractor={(item, index) => item + index}
        sections={sections}
        stickySectionHeadersEnabled={false}
        // onScroll={this._onScroll}
        refreshing={_refreshing}
        onMomentumScrollEnd={this._onMomentumScrollEnd}
        onScrollBeginDrag={this._onScrollBeginDrag}
        onScrollEndDrag={this._onScrollEndDrag}
        onRefresh={this._onRefresh}
        scrollEventThrottle={16}
        {...sectionProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: '#fff',
    // marginBottom: cy(66),
  },

  titleTextStyle: {
    marginTop: cx(18),
    fontSize: cx(17),
    color: '#4A4A4A',
    backgroundColor: 'transparent',
  },

  detailTextStyle: {
    marginTop: cx(18),
    color: '#666666',
    fontSize: 15,
    textAlign: 'left',
    position: 'relative',
    backgroundColor: 'transparent',
  },

  contentContainerStyle: {
    paddingHorizontal: cx(16),
    paddingBottom: cy(66),
  },

  materialImg: {
    height: cy(220),
    width: width - cx(32),
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  knowText: {
    fontSize: cx(15),
    color: '#666',
  },
});
