/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable lines-between-class-members */
import React from 'react';
import RadioButton from './radio-button/group';

const WrapperComponent = WrappedComponent => {
  return class extends WrappedComponent {
    radioOnChange = value => {
      const tab = this.props.tabs[value];
      const key = typeof tab.key === 'undefined' ? `tab_${value}` : tab.key;
      this.props.onChange && this.props.onChange(key);
    };
    render() {
      if (this.props.type === 'radio') {
        const { activeKey, defaultActiveKey, onChange, ...otherProps } = this.props;
        const radioProps = {};
        if (typeof activeKey !== 'undefined') {
          // @ts-ignore
          radioProps.activeIndex = this.activeIndex;
        }
        if (typeof defaultActiveKey !== 'undefined') {
          // @ts-ignore
          radioProps.defaultActiveIndex = this.activeIndex;
        }
        return <RadioButton {...radioProps} {...otherProps} onChange={this.radioOnChange} />;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default WrapperComponent;
