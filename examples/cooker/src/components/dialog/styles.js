import { Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

export const DIALOG_WIDTH = cx(270);

export const HEADER_HEIGHT = cx(48);

export const FOOTER_HEIGHT = cx(48);

export default {
  container: {
    alignSelf: 'center',
    width: DIALOG_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
  },

  content: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 16,
    color: '#000',
  },

  subTitle: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
  },
};
