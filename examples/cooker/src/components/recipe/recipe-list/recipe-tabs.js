import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { FlatList, Dimensions, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Tab from './tab';

const { width } = Dimensions.get('window');
const { convertX: cx } = Utils.RatioUtils;

export default class TabBar extends PureComponent {
  static propTypes = {
    initSelected: PropTypes.string,
    tabs: PropTypes.any.isRequired,
    onTabClick: PropTypes.func,
  };

  static defaultProps = {
    initSelected: '',
    onTabClick: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: props.initSelected ? this.getCurrentIndex() : 0,
    };

    this._list = null;
  }

  componentDidMount() {
    clearTimeout(this._timerHandle);
    this._timerHandle = setTimeout(() => {
      this.props.initSelected && this.onPressItem(this.getCurrentIndex());
    }, 200);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.initSelected !== nextProps.initSelected ||
      this.props.tabs.length !== nextProps.tabs.length
    ) {
      this.onPressItem(this.getCurrentIndex(nextProps));
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timerHandle);
  }

  onPressItem = id => {
    this.setState({ selected: id });
    // eslint-disable-next-line no-undef
    requestAnimationFrame(() => {
      this.scrollToIndex(id);
    });
    this.props.onTabClick && this.props.onTabClick(id);
  };

  getCurrentIndex = props => {
    const origin = props || this.props;
    const _idx = origin.tabs.findIndex(it => it === origin.initSelected);
    const selected = _idx !== -1 ? _idx || 0 : 0;
    return selected;
  };

  scrollToIndex = _idx =>
    this._list &&
    _idx &&
    this.props.tabs.length > 0 &&
    _idx !== -1 &&
    this._list.scrollToIndex({
      animated: true,
      index: _idx,
      viewOffset: _idx === 0 ? 0 : -cx(24),
      viewPosition: 0.5,
    });

  _renderItem = data => {
    const { item, index } = data;
    const { selected } = this.state;
    return (
      <Tab
        data={item}
        id={index}
        isFirst={index === 0}
        onPressItem={id => this.onPressItem(id)}
        selected={selected}
      />
    );
  };

  render() {
    const { tabs } = this.props;
    return (
      <FlatList
        // eslint-disable-next-line no-return-assign
        ref={ref => (this._list = ref)}
        data={tabs}
        extraData={this.state}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(__, index) => `${index}tab`}
        contentContainerStyle={styles.container}
        onScrollToIndexFailed={() => {}}
        renderItem={this._renderItem}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: cx(41),
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: width,
    backgroundColor: '#fff',
    paddingHorizontal: cx(24),
  },
});
