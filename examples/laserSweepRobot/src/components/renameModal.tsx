/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { StyleSheet, View, TextInput, ScrollView } from 'react-native';
import { Utils, Modal, Button, TYText, TYSdk } from 'tuya-panel-kit';
import Strings from '@i18n';

const { convertX: cx, convertY: cy, width, height } = Utils.RatioUtils;

interface IProps {
  onConfirm: (tag: string) => void;
  onCancle: () => void;
  tags: Array<string>;
  visible: boolean;
}

interface IState {
  tag: string;
  visible: boolean;
}

export default class Rename extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      tag: '',
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps: IProps) {
    this.setState({
      visible: nextProps.visible,
    });
  }

  onConfirm = () => {
    const { tag } = this.state;
    const { onConfirm } = this.props;
    if (!tag.replace(/\s+/g, '')) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('room_rename_illegal'), () => { });
      return;
    }
    onConfirm && onConfirm(tag);
    this.setState({ visible: false });
  };

  onCancle = () => {
    const { onCancle } = this.props;
    onCancle && onCancle();
    this.setState({ visible: false });
  };

  render() {
    const { tags } = this.props;
    const { tag, visible } = this.state;
    return (
      <Modal visible={visible} onMaskPress={this.onCancle} maskStyle={styles.root}>
        <View style={styles.root}>
          <View style={styles.container}>
            <View style={{ flex: 1 }}>
              <TYText text={Strings.getLang('roomNameTitle')} style={styles.title} />
              <ScrollView contentContainerStyle={styles.tagContain}>
                {tags.map(value => {
                  const text = Strings.getLang(`roomTag_${value}`);
                  const active = text === tag;
                  return (
                    <Button
                      key={value}
                      text={text}
                      style={[styles.tag, active && styles.activeTag]}
                      textStyle={active ? styles.activeTagText : null}
                      onPress={() => this.setState({ tag: text })}
                    />
                  );
                })}
              </ScrollView>
              <TextInput
                style={styles.input}
                onChangeText={text => this.setState({ tag: text })}
                value={tag}
                maxLength={15}
                placeholder={Strings.getLang('input_tag')}
                placeholderTextColor="#D5D5D5"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.bottom}>
              <Button
                wrapperStyle={{ flex: 1 }}
                style={styles.btnCancel}
                text={Strings.getLang('cancel')}
                textStyle={[styles.text, { color: 'rgba(0,0,0,0.3)' }]}
                onPress={this.onCancle}
              />
              <Button
                wrapperStyle={{ flex: 1 }}
                style={styles.btnConfirm}
                text={Strings.getLang('confirm')}
                textStyle={[styles.text, { color: '#fff' }]}
                onPress={this.onConfirm}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    width,
    height,
    alignItems: 'center',
    // justifyContent: 'center'
  },

  container: {
    height: cy(300),
    width: width - cy(30),
    borderRadius: cx(16),
    marginTop: cy(100),
    backgroundColor: '#fff',
  },

  bottom: {
    flexDirection: 'row',
  },

  text: {
    fontSize: cx(14),
  },
  btnConfirm: {
    width: cx(126),
    paddingVertical: cx(10),
    borderRadius: cx(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: cy(6),
    backgroundColor: '#717BFF',
  },

  btnCancel: {
    width: cx(126),
    paddingVertical: cx(10),
    borderRadius: cx(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: cy(6),
    marginLeft: cx(10),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },

  input: {
    height: cy(32),
    borderRadius: cx(4),
    marginVertical: cy(16),
    marginHorizontal: cx(16),
    paddingHorizontal: cx(16),
    paddingVertical: 0,
    backgroundColor: '#f3f3f3',
  },

  tag: {
    height: cy(28),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: cx(16),
    paddingVertical: cx(5),
    marginVertical: cx(5),
    marginBottom: cy(5),
    borderRadius: cx(4),
    textAlign: 'center',
    marginRight: cx(16),
  },
  activeTag: {
    borderColor: '#717BFF',
  },
  activeTagText: {
    color: '#717BFF',
  },
  tagContain: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    paddingHorizontal: cx(16),
  },

  title: {
    fontSize: cx(18),
    color: '#717BFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: cy(15),
  },
});
