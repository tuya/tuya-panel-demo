import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FeedOperate from './feedOperate';
import FeedControl from './feedControl';
import Config from '../../../config';

const { cx } = Config;

class Feed extends React.Component {
  static propTypes = {
    panelItemActiveColor: PropTypes.string.isRequired,
    tabContentHeight: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      marginTopValue: 0,
      scrollHeight: 0,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  changeMargin = value => {
    this.setState({
      marginTopValue: value.value,
    });
  };
  _onLayout = e => {
    const { height } = e.nativeEvent.layout;
    this.setState({
      scrollHeight: height,
    });
  };

  render() {
    const { panelItemActiveColor, tabContentHeight } = this.props;
    const { marginTopValue, scrollHeight } = this.state;
    const scrollEnabled = tabContentHeight < scrollHeight;
    return (
      <ScrollView
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={[
          scrollEnabled ? styles.feedScrollFeaturePage : styles.feedFeatureNormalPage,
        ]}
      >
        <View
          onLayout={e => this._onLayout(e)}
          style={{ marginTop: scrollEnabled ? 0 : marginTopValue }}
        >
          <FeedOperate panelItemActiveColor={panelItemActiveColor} />
          <FeedControl changeMargin={this.changeMargin} />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  feedScrollFeaturePage: {
    paddingHorizontal: cx(12),
    paddingVertical: cx(15),
  },
  feedFeatureNormalPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cx(12),
  },
});

const mapStateToProps = state => {
  const { panelItemActiveColor } = state.ipcCommonState;
  return {
    panelItemActiveColor,
  };
};

export default connect(mapStateToProps, null)(Feed);
