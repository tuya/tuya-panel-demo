/* eslint-disable react/require-default-props */
/* eslint-disable camelcase */
/*
    此组件表示自定义功能按键的弹出dialog
*/
import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Popup } from 'tuya-panel-kit';
import { showCustomDialog } from '../../../redux/modules/ipcCommon';

class CustomDialog extends React.Component {
  static propTypes = {
    dataSource: PropTypes.object.isRequired,
    showCustomDialog: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      title: props.dataSource.title,
    };
  }
  componentDidMount() {
    this.openDialog();
  }
  openDialog = () => {
    const { dataSource } = this.props;
    const { component } = dataSource;
    const { title } = this.state;
    Popup.custom(
      {
        content: component,
        title: title !== null ? title : <View style={{ height: 0 }} />,
        footer: <View />,
      },
      {
        onMaskPress: () => {
          this.props.showCustomDialog({
            showCustomDialog: false,
          });
          Popup.close();
        },
      }
    );
  };
  render() {
    return <View />;
  }
}

const mapToDisPatch = dispatch => {
  return bindActionCreators({ showCustomDialog }, dispatch);
};
export default connect(null, mapToDisPatch)(CustomDialog);
