/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Strings from '../../i18n';
import Res from '../../res';

const { convertX: cx } = Utils.RatioUtils;
// const Res: any = {
//   icon: require('../../res/icon.png'),
//   box: require('../../res/box.png'),
//   setting: require('../../res/setting.png'),
//   history: require('../../res/history.png'),
// };

interface MainProps {
  dpData: any;
  dispatch: any;
  navigator: any;
}

export default class Home extends Component<MainProps> {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    dpData: PropTypes.object.isRequired,
    logs: PropTypes.array.isRequired,
  };

  toRoute = (id: string) => {
    this.props.navigator.push({
      id,
      title: Strings.getLang(id),
    });
  };

  renderCenter() {
    return (
      <View style={styles.top}>
        <ImageBackground source={Res.box} style={styles.bg}>
          <Image source={Res.icon} style={styles.sensor} />
        </ImageBackground>
      </View>
    );
  }

  renderBottom() {
    const data = ['history', 'setting'];
    return (
      <View style={styles.bottom}>
        {data.map(item => (
          <TouchableOpacity key={item} style={styles.item} onPress={() => this.toRoute(item)}>
            <Image source={Res[item]} style={styles.icon} />
            <TYText style={styles.text}>{Strings.getLang(item)}</TYText>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  renderStatus() {
    const {
      dpData: { schema, state },
    } = this.props;
    const dpFirst: any[] = Object.values(schema).filter((d: any) => parseInt(d.id, 10) === 1);
    if (dpFirst.length === 0) return <View />;
    const desc =
      dpFirst[0].type === 'value'
        ? state[dpFirst[0].code]
        : Strings.getDpLang(dpFirst[0].code, state[dpFirst[0].code]);
    return (
      <View style={styles.status}>
        <TYText style={styles.title}>
          {Strings.getDpLang(dpFirst[0].code)} {desc}
        </TYText>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderStatus()}
        {this.renderCenter()}
        {this.renderBottom()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bg: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(300),
    height: cx(300),
  },
  sensor: {
    width: cx(160),
    height: cx(160),
  },
  bottom: {
    paddingBottom: cx(10),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: cx(48),
    height: cx(48),
  },
  text: {
    fontSize: 10,
    color: '#FFF',
    opacity: 0.8,
    lineHeight: cx(24),
    textAlign: 'center',
  },
  status: {
    position: 'absolute',
    top: cx(20),
    paddingHorizontal: cx(20),
    paddingVertical: cx(10),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: cx(20),
  },
  title: {
    fontSize: 14,
    color: '#FFF',
  },
});
