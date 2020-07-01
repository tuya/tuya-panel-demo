import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { showSelfModal as showSelfModalAction } from '../../redux/modules/ipcCommon';
import Strings from '../../i18n';
import Config from '../../config';
import { enableHd } from '../../config/click';
import CameraManager from '../../components/nativeComponents/cameraManager';

const { cx, cy } = Config;

class ClarityFullScreen extends React.Component {
  static propTypes = {
    showSelfModalAction: PropTypes.func.isRequired,
    clarityStatus: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      clarityType: [
        { typeName: Strings.getLang('resolutionHigh'), type: 'HD' },
        { typeName: Strings.getLang('resolutionStandard'), type: 'SD' },
      ],
    };
  }
  closeMask = () => {
    this.props.showSelfModalAction({ showSelfModal: false });
  };
  pressClarityBox = () => {
    return false;
  };

  replaceClarity = type => {
    const { clarityStatus } = this.props;
    if (clarityStatus === type) {
      CameraManager.showTip(Strings.getLang('hasCurrentClarity'));
      return false;
    }
    enableHd(type);
    this.props.showSelfModalAction({ showSelfModal: false });
  };

  render() {
    const { clarityType } = this.state;
    return (
      <TouchableOpacity style={styles.clarityPage} onPress={this.closeMask}>
        <TouchableOpacity
          style={styles.clarityBox}
          onPress={this.pressClarityBox}
          activeOpacity={1}
        >
          {clarityType.map(item => (
            <TouchableOpacity
              style={styles.textBox}
              activeOpacity={0.7}
              key={item.type}
              onPress={() => {
                this.replaceClarity(item.type);
              }}
            >
              <TYText numberOfLines={1} style={styles.clarityText}>
                {item.typeName}
              </TYText>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  clarityPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  clarityBox: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: cy(40),
  },
  clarityText: {
    fontSize: cx(14),
    color: '#fff',
  },
});

const mapStateToProps = state => {
  const { clarityStatus } = state.ipcCommonState;
  return {
    clarityStatus,
  };
};
const mapDispatchToProps = dispatch => {
  return bindActionCreators({ showSelfModalAction }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ClarityFullScreen);
