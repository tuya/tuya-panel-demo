/* eslint-disable react/require-default-props */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Zoom from './zoom';
import PtzZoom from './ptzZoom';
import { getPanelOpacity } from '../../../utils/panelStatus';

class PtzModules extends React.Component {
  static propTypes = {
    ptz_control: PropTypes.string,
    zoom_control: PropTypes.string,
    isAndriodFullScreenNavMode: PropTypes.bool.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillReceiveProps(nextProps) {
    getPanelOpacity();
  }
  render() {
    const {
      ptz_control,
      zoom_control,
      isAndriodFullScreenNavMode,
      panelItemActiveColor,
    } = this.props;
    return (
      <View style={[styles.ptzModulesPage, { opacity: getPanelOpacity() ? 1 : 0.3 }]}>
        {!ptz_control && zoom_control ? (
          <Zoom panelItemActiveColor={panelItemActiveColor} />
        ) : (
          <PtzZoom
            zoom={zoom_control}
            isAndriodFullScreenNavMode={isAndriodFullScreenNavMode}
            panelItemActiveColor={panelItemActiveColor}
          />
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  ptzModulesPage: {
    flex: 1,
  },
});

const mapStateToProps = state => {
  const { ptz_control, zoom_control } = state.dpState;
  const { showVideoLoad, isAndriodFullScreenNavMode, panelItemActiveColor } = state.ipcCommonState;
  return {
    ptz_control,
    zoom_control,
    showVideoLoad,
    isAndriodFullScreenNavMode,
    panelItemActiveColor,
  };
};
export default connect(mapStateToProps, null)(PtzModules);
