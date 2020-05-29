/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, FlatList, TouchableOpacity, ColorPropType } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { ModeSettingView } from '../components/recipe';
import DisplayImage from '../components/display-image';
import Config from '../config';
import Strings from '../i18n';

const { convertX: cx, width } = Utils.RatioUtils;
export default class HomeBottomView extends Component {
  static propTypes = {
    modeSelect: PropTypes.string,
    themeColor: ColorPropType,
  };

  static defaultProps = {
    modeSelect: '',
    themeColor: '#F85A00',
  };

  constructor(props) {
    super(props);

    this.state = {
      canAutoScroll: true,
    };
    this._timer = null;
  }

  componentDidMount() {
    clearTimeout(this._timerHandle);
    this._timerHandle = setTimeout(() => {
      this.goCurrentIndex();
    }, 200);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.modeSelect !== nextProps.modeSelect && this.state.canAutoScroll) {
      this.goCurrentIndex(nextProps);
    }
  }

  componentWillMount() {
    clearTimeout(this._timerHandle);
    clearTimeout(this._timer);
  }

  get modeCode() {
    const { mode: modeCode } = Config.codes;
    return modeCode;
  }

  getModeDatas = () => {
    if (!this.modeCode) return;
    const { range } = Config.getDpSchema(this.modeCode);
    const res = range.map(d => {
      let image = Config.getUiValue(this.modeCode, d);
      if (typeof image === 'string') {
        image = { uri: image };
      }
      return {
        key: d,
        title: Strings.getDpLang(this.modeCode, d),
        image,
        mode: d,
      };
    });
    return res;
  };

  goCurrentIndex = props => {
    const { modeSelect } = props || this.props;
    const datas = this.getModeDatas() || [];
    const index = datas.findIndex(({ mode }) => mode === modeSelect);
    index !== -1 && this.scrollToIndex(index);
  };

  scrollToIndex = index => {
    this._list &&
      this._list.scrollToIndex({
        index,
        animated: true,
        viewOffset: 0,
        viewPosition: 0.5,
      });
  };

  handleModePress = (mode, index) => {
    clearTimeout(this._timer);
    this.setState({ canAutoScroll: false }, () => {
      this.scrollToIndex(index);
      setTimeout(() => {
        this.setState({ canAutoScroll: true });
      }, 200);
    });
    this.props.handleModePress && this.props.handleModePress(mode);
  };

  renderItem = ({ item, index }) => {
    const { image, title, mode } = item;
    const { modeSelect, themeColor } = this.props;
    return (
      <TouchableOpacity
        style={styles.modeTouchWrap}
        onPress={() => this.handleModePress(mode, index)}
      >
        <DisplayImage
          image={image}
          text={title}
          themeColor={themeColor}
          isSelected={modeSelect === mode}
        />
      </TouchableOpacity>
    );
  };

  render() {
    const datas = this.getModeDatas();
    const { modeSelect } = this.props;
    const { cookSettingDps } = Config.dpFun;
    return (
      <View style={styles.container}>
        {this.modeCode && (
          <View style={styles.listContainer}>
            <FlatList
              data={datas}
              style={styles.list}
              horizontal
              extraData={modeSelect}
              showsHorizontalScrollIndicator={false}
              renderItem={this.renderItem}
              getItemLayout={(__, index) => ({
                length: cx(84),
                offset: cx(84) * index + cx(16),
                index,
              })}
              contentContainerStyle={styles.contentContainerStyle}
              onScrollToIndexFailed={e => console.log(e)}
              ref={ref => (this._list = ref)}
            />
          </View>
        )}
        <ModeSettingView dpCodes={cookSettingDps} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },

  list: {
    width,
  },

  listContainer: {
    height: cx(120),
    alignItems: 'center',
    marginTop: cx(16),
  },

  contentContainerStyle: {
    marginLeft: cx(16),
    paddingRight: cx(24),
  },

  modeTouchWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
