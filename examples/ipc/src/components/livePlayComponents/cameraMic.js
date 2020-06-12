/* eslint-disable max-len */
// 对讲机动画效果图
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import WaterRipple from '../publicComponents/water-ripple';
import Res from '../../res';

import Config from '../../config';

const { cx, cy } = Config;

class CameraMic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View style={styles.fullMicContainer}>
        <View style={styles.micWrap}>
          <WaterRipple
            duration={2000}
            innerRadius={20}
            outerRadius={35}
            // eslint-disable-next-line react/no-children-prop
            children={<Image source={Res.publicImage.oneWayTalkIcon} style={styles.fullInter} />}
            renderRipple={props => {
              const { style } = props;
              return (
                <View
                  {...props}
                  style={[
                    style,
                    {
                      backgroundColor: 'transparent',
                      borderColor: '#fefefe',
                      borderWidth: 1,
                    },
                  ]}
                />
              );
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullMicContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  micWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(142),
    height: cx(142),
    backgroundColor: 'transparent',
  },
  fullInter: {
    width: cx(60),
    resizeMode: 'contain',
  },
});

export default CameraMic;
