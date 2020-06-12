/* eslint-disable react/require-default-props */
import React from 'react';
import { Platform, Image, ViewPropTypes, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { TopBar } from 'tuya-panel-kit';
import Res from '../../res';
import Config from '../../config';

const { cx, cy, winWidth } = Config;

const backIcon = Platform.OS === 'ios' ? 'backIos' : 'backAndroid';

class TopHeader extends React.Component {
  static propTypes = {
    background: PropTypes.string,
    leftBackColor: PropTypes.string,
    contentTitleStyle: ViewPropTypes.style,
    contentTitle: PropTypes.string,
    leftPress: PropTypes.func,
    hasRight: PropTypes.bool,
    rightPress: PropTypes.func,
  };

  static defaultProps = {
    background: '#ffffff',
    leftBackColor: '#000',
    contentTitleStyle: null,
    hasRight: true,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      background,
      leftBackColor,
      contentTitleStyle,
      contentTitle,
      leftPress,
      hasRight,
      rightPress,
    } = this.props;
    return (
      <View style={styles.headerPage}>
        <TopBar.Container background={background} style={{ width: winWidth }}>
          <TopBar.Action
            name={backIcon}
            onPress={leftPress}
            color={leftBackColor}
            accessibilityLabel="tuya_ipc_dev_back"
          />
          {/* width给了个固定的，在横屏和竖屏切换时，中间标题不偏移 */}
          <TopBar.Content
            style={{ width: winWidth - 150 }}
            title={contentTitle}
            titleStyle={[styles.cotentText, contentTitleStyle]}
          />
          {hasRight && (
            // eslint-disable-next-line react/no-children-prop
            <TopBar.Action
              // eslint-disable-next-line react/no-children-prop
              name="pen"
              // children={<Image source={Res.deviceEdit} accessibilityLabel="tuya_ipc_dev_edit" />}
              onPress={rightPress}
            />
          )}
        </TopBar.Container>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  headerPage: {},
  cotentText: {
    fontWeight: '600',
    color: '#000',
  },
});

export default TopHeader;
