import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText, Divider } from 'tuya-panel-kit';
import { modeStateUpdate } from '../../models/modules/cloudState';

const { convertX: cx } = Utils.RatioUtils;

const DIALOG_WIDTH = cx(270);
const FOOTER_HEIGHT = cx(48);

interface ControlViewProps {
  state: string;
  cancelText: string;
  onCancel: () => void;
  modeUpdate: (value: string) => void;
}

// eslint-disable-next-line react/prefer-stateless-function
class ControlView extends Component<ControlViewProps> {
  componentWillUnmount() {
    const { modeUpdate } = this.props;
    modeUpdate('wait');
  }

  render() {
    const { onCancel, cancelText, state } = this.props;
    return (
      <View style={[styles.container, { opacity: state === 'wait' ? 0.5 : 1 }]}>
        <Divider style={styles.divider} width={DIALOG_WIDTH} height={StyleSheet.hairlineWidth} />
        {!!cancelText && (
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.8}
            onPress={onCancel}
            disabled={state === 'wait'}
          >
            <TYText style={styles.cancelText}>{cancelText}</TYText>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: FOOTER_HEIGHT,
    borderRadius: cx(14),
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  divider: {
    position: 'absolute',
    top: 0,
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 15,
    color: 'rgba(52,54,60,.6)',
  },
});

export default connect(
  ({ modes }: any) => ({
    state: modes.state,
  }),
  dispatch =>
    bindActionCreators(
      {
        modeUpdate: modeStateUpdate,
      },
      dispatch
    )
)(ControlView);
