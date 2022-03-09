/* eslint-disable import/no-unresolved */
/* eslint-disable indent */
import * as React from 'react';
import { Utils, TopBar, TYSdk } from 'tuya-panel-kit';
import Strings from '@i18n';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

export interface AppProps {
  title: string;
  hasBackIcon?: boolean;
  backText?: string;
  backTextColor?: string;
  onBack?: (args?: any) => void;
  hasSaveIcon?: boolean;
  onSave?: (args?: any) => void;
  theme?: any;
}

// eslint-disable-next-line react/prefer-stateless-function
class CustomTopBar extends React.Component<AppProps, any> {
  render() {
    const { title, hasBackIcon, backText, backTextColor, onBack, onSave, hasSaveIcon, theme } =
      this.props;
    const {
      global: { fontColor, themeColor },
    } = theme;
    const leftActions: any = [
      {
        source: backText,
        color: backTextColor || fontColor,
        onPress: onBack,
      },
    ];
    if (hasBackIcon) {
      leftActions.unshift({
        name: 'backIos',
        size: cx(16),
        color: backTextColor || fontColor,
        onPress: onBack,
      });
    }
    return (
      <TopBar
        title={title}
        position="center"
        background="transparent"
        leftActions={leftActions}
        actions={
          hasSaveIcon
            ? [
                {
                  name: 'pen',
                  color: fontColor,
                  onPress: () => {
                    TYSdk.native.showDeviceMenu();
                  },
                },
              ]
            : onSave
            ? [
                {
                  source: Strings.getLang('save'),
                  color: themeColor,
                  onPress: onSave,
                },
              ]
            : []
        }
      />
    );
  }
}

export default withTheme(CustomTopBar);
