import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PointTitlePage from './pointTitle';
import PointList from './pointList';

class CollectPoint extends React.Component {
  static propTypes = {
    showVideoLoad: PropTypes.bool.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { showVideoLoad, panelItemActiveColor } = this.props;
    return (
      <View style={[styles.collectPointPage, { opacity: !showVideoLoad ? 1 : 0.2 }]}>
        <PointTitlePage />
        <View style={styles.pointBox}>
          <PointList panelItemActiveColor={panelItemActiveColor} />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  collectPointPage: {
    flex: 1,
  },
  pointBox: {
    paddingTop: 10,
    marginHorizontal: 10,
    flex: 1,
  },
});

const mapStateToProps = state => {
  const { showVideoLoad, panelItemActiveColor } = state.ipcCommonState;
  return {
    showVideoLoad,
    panelItemActiveColor,
  };
};
export default connect(mapStateToProps, null)(CollectPoint);
