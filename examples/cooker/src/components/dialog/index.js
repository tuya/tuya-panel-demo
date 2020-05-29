import React from 'react';
import { Modal } from 'tuya-panel-kit';
import Alert from './alert';
import Confirm from './confirm';
import Prompt from './prompt';
import Checkbox from './checkbox';
import Custom from './custom';

const commonProps = {
  onCancel: Modal.close,
  onConfirm: Modal.close,
};

const commonModalProps = {
  alignContainer: 'center',
  onMaskPress: () => {},
};

const Dialog = {
  alert: (props, modalOpts) => {
    const alertProps = { ...commonProps, ...props };
    const modalProps = { ...commonModalProps, ...modalOpts };
    Modal.render(<Alert {...alertProps} />, modalProps);
  },

  confirm: (props, modalOpts) => {
    const confirmProps = { ...commonProps, ...props };
    const modalProps = { ...commonModalProps, ...modalOpts };
    Modal.render(<Confirm {...confirmProps} />, modalProps);
  },

  prompt: (props, modalOpts) => {
    const promptProps = { ...commonProps, ...props };
    const modalProps = { ...commonModalProps, ...modalOpts };
    Modal.render(<Prompt {...promptProps} />, modalProps);
  },

  checkbox: (props, modalOpts) => {
    const checkboxProps = { ...commonProps, ...props };
    const modalProps = { ...commonModalProps, ...modalOpts };
    Modal.render(<Checkbox {...checkboxProps} />, modalProps);
  },

  custom: (props, modalOpts) => {
    const customProps = { ...commonProps, ...props };
    const modalProps = { ...commonModalProps, ...modalOpts };
    Modal.render(<Custom {...customProps} />, modalProps);
  },

  close: Modal.close,
};

export default Dialog;
