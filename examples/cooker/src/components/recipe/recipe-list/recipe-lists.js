import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Dimensions, Text, SectionList, View, Platform } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import Cell from './recipe-list-cell';
import { listConfig } from './config';

const { RatioUtils } = Utils;
const { convertX: cx, convertY: cy } = RatioUtils;
const { width } = Dimensions.get('window');
const { header, cell } = listConfig;
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
      sections: [],
    };
    this._section = null;
    this.contentMeasure = {};
    this.measureVal = [];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loading !== nextProps.loading) {
      this.setState({
        _refreshing: nextProps.loading,
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    const updaterFromProps =
      // eslint-disable-next-line max-len
      this.props.select !== nextProps.select || this.props.isManual !== nextProps.isManual;
    const dataSourceUpdater = !_.isEqual(this.state.sections, nextProps.sections);
    return updaterFromProps || dataSourceUpdater;
  }

  onRefreshClose = () => {
    this.setState({ _refreshing: false });
  };

  _getLastIndexByScrollEvent = e => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const measureVal = this._getMeasureVal();
    const offsetStack = measureVal.map((d, i) => {
      const preStack = measureVal.filter((m, index) => index <= i);
      return _.sum(preStack);
    });
    const curSelectIndex = _.findIndex(offsetStack, o => offsetY <= o);
    return curSelectIndex === -1 ? offsetStack.length - 1 : curSelectIndex;
  };

  _getMeasureVal = () => {
    const { sections } = this.props;
    const measureVal = sections.map(
      ({ data }) => header.height + header.marginTop + data.length * cell.height
    );
    return measureVal;
  };

  _onItemSelect = index => {
    this._section &&
      this._section.scrollToLocation({
        animated: true,
        itemIndex: 0,
        sectionIndex: index,
        viewOffset: header.height + header.marginTop,
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
    Platform === 'ios' && this._onScrollEvent(e);
  };

  _onScrollBeginDrag = () => {
    const { handleDrag } = this.props;
    handleDrag && handleDrag();
  };

  _onMomentumScrollEnd = e => {
    this._onScrollEvent(e);
  };

  _onScrollEndDrag = this._onScrollEvent;

  _onScrollEvent = e => {
    const { handleCurIndex, isManual } = this.props;
    const curSelectIndex = this._getLastIndexByScrollEvent(e);
    handleCurIndex && !isManual && handleCurIndex(curSelectIndex, false);
  };

  _renderSectionHeader = ({ section: { title } }) => {
    const { select, sections } = this.props;
    const index = _.findIndex(sections, ({ title: tt }) => tt === title);
    return (
      <View style={{ width }}>
        <Text style={[styles.titleTextStyle, select === index && { color: '#FA9601' }]}>
          {title}
        </Text>
      </View>
    );
  };

  _renderItem = ({ item, index }) => (
    <Cell
      data={item}
      index={index}
      imageStyle={styles.cellImgStyle}
      cellStyle={styles.cellStyle}
      navigator={this.props.navigator}
    />
  );

  render() {
    const { ...sectionProps } = this.props;
    const { _refreshing } = this.state;
    return (
      <SectionList
        // eslint-disable-next-line no-return-assign
        ref={ref => (this._section = ref)}
        style={styles.container}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        keyExtractor={(__, index) => `cell_${index}`}
        initialNumToRender={3}
        sections={this.props.sections}
        onScrollToIndexFailed={() => {}}
        stickySectionHeadersEnabled={false}
        refreshing={_refreshing}
        decelerationRate="fast"
        extraData={this.state}
        onScroll={this._onScroll}
        onMomentumScrollEnd={this._onMomentumScrollEnd}
        onScrollBeginDrag={this._onScrollBeginDrag}
        onScrollEndDrag={this._onScrollEndDrag}
        onRefresh={this._onRefresh}
        scrollEventThrottle={50}
        snapToAlignment="start"
        {...sectionProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    backgroundColor: '#fff',
  },

  titleTextStyle: {
    marginTop: cx(18),
    fontSize: cx(17),
    color: '#9b9b9b',
    backgroundColor: 'transparent',
  },

  contentContainerStyle: {
    marginLeft: cx(24),
  },

  cellImgStyle: {
    width: width - cx(48),
  },

  cellStyle: {
    width: width - cx(48),
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: cx(12),
    marginBottom: cy(8),
  },
});
