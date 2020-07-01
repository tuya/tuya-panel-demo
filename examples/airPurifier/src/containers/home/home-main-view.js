import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { RotationView, Utils } from 'tuya-panel-kit';
import FadeDot from './main-fadeDot';
import SideBar from './main-sideBar';
import CenterTip from './main-centerTip';
import dpCodes from '../../config/dpCodes';
import Res from '../../res';

const {
  // convertX: cx,
  convertY: cy,
} = Utils.RatioUtils;

const { power: powerCode } = dpCodes;

const duration = 3200;

class HomeMainView extends PureComponent {
  static propTypes = {
    power: PropTypes.bool,
  };

  static defaultProps = {
    power: false,
  };

  render() {
    const { power } = this.props;
    return (
      <View style={styles.container}>
        <SideBar />
        {power && <FadeDot active={power} duration={duration} />}
        <RotationView active={power} duration={duration}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={power ? Res.display : Res.displayOff}
          />
        </RotationView>
        <CenterTip />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: cy(14),
  },

  image: {
    width: 250,
    height: 250,
  },
});

export default connect(({ dpState }) => ({
  power: dpState[powerCode],
}))(HomeMainView);
