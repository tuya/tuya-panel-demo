import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import {
  bResizeBase64Img,
  bRotateBase64Img,
  bDeleteBase64Img,
} from '../../../../../../res/base64Imgs';

const format = (store: IStore, configs: IProps) => {
  return {
    vertex: {
      vertexType: 'circle',
      vertexColor: '#FFFFFFFF',
      vertexImages: [bResizeBase64Img, bRotateBase64Img, bResizeBase64Img, bDeleteBase64Img],
      showVertexImage: true,
      // vertexExtendTimes: 3,
      radius: 6,
    },
    box: {
      bgColor: '#00000000',
      borderColor: '#FFFFFFFF',
      lineWidth: 1,
      isDash: false,
      dashSize: 2,
      gapSize: 4,
    },
    content: {
      deleteEnable: true,
    },
  };
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const d3EditWrapperParams: Interface.IElementProps = {
  format,
  validate,
};

export default d3EditWrapperParams;
