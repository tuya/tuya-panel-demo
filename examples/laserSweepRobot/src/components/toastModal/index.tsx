import React from 'react';
import { Modal } from 'tuya-panel-kit';

import _debounce from 'lodash/debounce';
import SimpleToastView from './simpleToast';

export default {
  info: (content: string) => {
    const toastProps = {
      show: true,
      onHide: Modal.close,
      showPosition: 'bottom',
      text: content,
    };
    const modalProps = {
      alignContainer: 'center',
      mask: false,
    };
    Modal.render(<SimpleToastView {...toastProps} />, modalProps);
  },
  debounceInfo: _debounce((content: string) => {
    const toastProps = {
      show: true,
      onHide: Modal.close,
      showPosition: 'bottom',
      text: content,
    };
    const modalProps = {
      alignContainer: 'center',
      mask: false,
    };
    Modal.render(<SimpleToastView {...toastProps} />, modalProps);
  }, 200),
};
