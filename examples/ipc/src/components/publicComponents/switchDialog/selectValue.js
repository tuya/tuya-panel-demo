import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';
import CameraManager from '../../../components/nativeComponents/cameraManager';
import Res from '../../../res';
import Strings from '../../../i18n';

const { cx, cy } = Config;

class SelectValue extends React.Component {
  static propTypes = {
    showData: PropTypes.array.isRequired,
    onConfirm: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      selectData: props.showData,
    };
    this.checkedValue = '';
  }
  componentDidMount() {
    const { selectData } = this.state;
    const checkedIndex = _.findIndex(selectData, item => {
      return item.checked === true;
    });
    this.checkedValue = selectData[checkedIndex].value;
  }
  changeBox = value => {
    const { mode } = this.props;
    if (this.checkedValue === value && mode === 'videoResolution') {
      CameraManager.showTip(Strings.getLang('hasCurrentClarity'));
      return false;
    }
    if (this.checkedValue === value) {
      return false;
    }
    const oldArr = this.state.selectData;
    oldArr.forEach((item, index) => {
      if (item.value === value) {
        oldArr[index].checked = true;
      } else {
        oldArr[index].checked = false;
      }
    });
    this.setState({
      selectData: oldArr,
    });
    this.props.onConfirm(value);
  };

  render() {
    const { selectData } = this.state;
    return (
      <View style={styles.selectValuePage}>
        {selectData.map(item => (
          <TouchableOpacity
            onPress={() => {
              this.changeBox(item.value);
            }}
            activeOpacity={0.8}
            style={styles.checkBox}
            key={item.text}
            accessibilityLabel={item.test || ''}
          >
            <TYText numberOfLines={1} style={styles.checkTitle}>
              {item.text}
            </TYText>
            {item.checked && (
              <View style={styles.checkImgBox}>
                <Image style={styles.checkImg} source={Res.publicImage.checkCircle} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selectValuePage: {
    backgroundColor: '#fff',
  },
  checkBox: {
    height: cy(48),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkTitle: {
    color: '#333',
    fontSize: cx(16),
  },
  checkImgBox: {
    width: cx(24),
    position: 'absolute',
    right: cx(20),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkImg: {
    width: '100%',
    resizeMode: 'contain',
  },
});
export default SelectValue;
