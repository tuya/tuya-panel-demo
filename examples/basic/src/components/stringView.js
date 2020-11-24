import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Image, View, ViewPropTypes } from 'react-native';

const Strings = require('../i18n');

const Res = {
  goto: require('../res/tuya_goto_icon.png'),
};

export default class StringView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    value: PropTypes.string,
    readonly: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    style: null,
    onChange: null,
    readonly: false,
    value: '',
  };

  constructor(props) {
    super(props);
    this.onPressHandle = this._onPressHandle.bind(this);

    this.state = {
      text: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ text: nextProps.value });
  }

  _onPressHandle() {
    if (this.props.readonly) return;
    if (this.props.onChange) {
      this.props.onChange(this.state.text);
    }
  }

  render() {
    const { readonly } = this.props;
    return (
      <View style={[styles.container, readonly ? { opacity: 0.5 } : null, this.props.style]}>
        <View
          style={[
            styles.textBorder,
            readonly ? { borderRadius: 4, borderRightWidth: 1 } : { borderRightWidth: 0 },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder={readonly ? Strings.hit_empty : Strings.hit_input}
            multiline={false}
            onChangeText={text => this.setState({ text })}
            value={this.state.text}
            editable={!readonly}
            onSubmitEditing={this.onPressHandle}
          />
        </View>
        {!readonly && (
          <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={this.onPressHandle}>
            <Image source={Res.goto} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 150,
    height: 35,
  },

  textBorder: {
    flex: 1,
    borderColor: '#DDDDDD',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },

  textInput: {
    flex: 1,
    padding: 0,
    fontSize: 14,
    color: '#303030',
    paddingLeft: 4,
  },

  button: {
    backgroundColor: '#FF5800',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
