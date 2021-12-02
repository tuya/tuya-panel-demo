import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import Strings from '@i18n';
import { Button } from '.';

const { convertX: cx } = Utils.RatioUtils;

interface IProps {
  id: string;
  title: string;
  onPress: ({ id, language }) => void;
  status: number;
  imgUrl?: string;
  schedule?: number;
}

interface IState {
  loading: boolean;
}

/**
 * 根据激光协议，用数字表示当前语音包使用状态
 */
const voiceStatusEnum = {
  fail: 0,
  downloading: 1,
  success: 2,
  enUse: 3,
  use: -1,
};

export default class VoiceRow extends Component<IProps, IState> {
  timer: number;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps: IProps) {
    const { status } = this.props;
    if (status !== nextProps.status) {
      this.setState({
        loading: false,
      });
    }
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  startLoading = () => {
    this.setState({
      loading: true,
    });
    this.timer = setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 20000);
  };

  handlePress = () => {
    const { onPress, id, title } = this.props;
    onPress && onPress({ id, language: title });
    this.startLoading();
  };

  render() {
    const { title, status, imgUrl, schedule } = this.props;

    const { loading } = this.state;
    let text = '';
    let disable = false;

    switch (status) {
      case voiceStatusEnum.fail:
        text = Strings.getLang('downloadFailed');
        disable = false;
        break;
      case voiceStatusEnum.downloading:
        text = Strings.getLang('downloading');
        disable = true;
        break;
      case voiceStatusEnum.success:
        text = Strings.getLang('downloadSuccess');
        disable = true;
        break;
      case voiceStatusEnum.enUse:
        text = Strings.getLang('enUse');
        disable = true;
        break;
      case voiceStatusEnum.use:
        text = Strings.getLang('use');
        disable = false;
        break;
      default:
        text = Strings.getLang('use');
        disable = false;
    }
    if (loading) {
      text = Strings.getLang('downloading');
    }
    return (
      <View style={styles.inner}>
        <View style={styles.titleCon}>
          {imgUrl ? <Image style={styles.img} source={{ uri: imgUrl }} /> : null}
          <TYText style={styles.title}>{Strings.getLang(title)}</TYText>
        </View>
        <View style={styles.right}>
          {status === 3 ? (
            <TYText style={styles.useText}>{text}</TYText>
          ) : (
            <Button
              isView={disable}
              key={imgUrl}
              style={styles.btn}
              text={text}
              textStyle={styles.btnText}
              onPress={this.handlePress}
              loading={loading}
              loadingColor="rgb(52, 218,205)"
              textDirection="left"
              schedule={status === 1 ? schedule : 0}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: cx(16),
    paddingVertical: cx(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DBDBDB',
    backgroundColor: '#fff',
  },
  titleCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: cx(30),
  },
  img: {
    width: cx(24),
    height: cx(24),
  },
  title: {
    fontSize: cx(16),
    marginHorizontal: cx(16),
  },
  useText: {
    fontSize: cx(15),
    color: 'rgb(133, 133,133)',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: cx(80),
    height: cx(30),
    borderRadius: cx(15),
    paddingHorizontal: cx(6),
    borderWidth: cx(1),
    borderColor: 'rgb(52, 218,205)',
  },
  btnText: {
    fontSize: cx(15),
    color: 'rgb(52, 218,205)',
  },
});
