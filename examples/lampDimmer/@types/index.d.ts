declare module 'react-native-svg';
declare module 'tuya-panel-kit' {
  export interface TimerPickerProps {}
  export class TimerPicker extends React.Component<TimerPickerProps> {}
  export const defaultTheme: any;
  export interface PopupProps {
    wrapperStyle?: any;
    title?: string;
    titleTextStyle?: any;
    titleWrapperStyle?: any;
    switchValue?: boolean;
    onSwitchValueChange?: (v: boolean) => void;
    footer?: React.ElementType<any>;
    footerType?: 'both' | 'singleConfirm' | 'singleCancel';
    footerWrapperStyle?: any;
    cancelText?: string;

    cancelTextStyle?: any;

    confirmText?: string;

    confirmTextStyle?: any;

    onCancel?: () => void;

    onConfirm?: (e: any) => void;
  }
  interface ToastProps extends PopupProps {
    message?: string;
    enableClose?: boolean;
  }
  interface CountdownProps extends PopupProps {
    max: number;
    hourText: string;
    minuteText: string;
    value: number;
    onConfirm?: (e: { hour: number; minute: number; value: number }) => void;
    enableClose?: boolean;
  }
  export class Popup extends React.Component<PopupProps> {
    static toast: (option: ToastProps) => void;
    static countdown: (option: CountdownProps) => void;
    static close: (option?: PopupProps) => void;
  }
  export interface ModalProps {
    onlyLastModalVisible?: boolean;
    visible?: boolean;
    animationType?: 'fade' | 'none';
    alignContainer?: 'top' | 'center' | 'bottom';
    mask?: boolean;
    maskStyle?: any;
    onShow?: () => void;
    onHide?: () => void;
    onMaskPress?: () => void;

    // 高阶
    titleTextStyle?: any;
    titleWrapperStyle?: any;
    title?: string;
    cancelText?: string;
    confirmText?: string;
    cancelTextStyle?: any;
    confirmTextStyle?: any;
    footerWrapperStyle?: any;
    footer?: React.ElementType<any>;
    onCancel?: () => void;
    onConfirm?: () => void;
  }
  export class Modal extends React.Component<ModalProps> {}
  export interface Stops {
    [percent: string]: string;
  }
  export interface LinearGradientProps {
    style?: any;
    x1?: number | string;
    x2?: number | string;
    y1?: number | string;
    y2?: number | string;
    stops: Stops;
  }

  export class LinearGradient extends React.Component<LinearGradientProps> {}
  export interface DialogProps {
    title?: string;
    subTitle?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: (v: any) => void;
    onCancel?: (v: any) => void;
  }
  export interface PromptProps extends DialogProps {
    value?: string;
    showHelp?: boolean;
    onChangeText?: (v: any) => any;
    onHelpPress?: () => void;
    inputWrapperStyle?: any;
    inputStyle?: any;
  }
  export class Dialog extends React.Component<DialogProps> {
    static alert: (option: DialogProps) => void;
    static confirm: (option: DialogProps) => void;
    static close: () => void;
    static prompt: (option: PromptProps) => void;
  }
  export interface PickerProps {}
  class PickerItem extends React.Component<any> {}
  export class Picker extends React.Component<PickerProps> {
    static Item: PickerItem;
  }

  export interface ButtonProps {
    icon?: string;
    disabled?: boolean;
    disabledOpacity?: number;
    iconPath?: string;
    text?: string;
    textStyle?: any;
    style?: any;
    size?: number;
    iconSize?: number;
    iconColor?: string;
    image?: any;
    imageStyle?: any;
    wrapperStyle?: any;
    textDirection?: 'right' | 'left' | 'top' | 'bottom';
    onPress?: () => void;
    onLongPress?: () => void;
  }
  export class Button extends React.Component<ButtonProps> {}
  export interface SliderProps {
    accessibilityLabel?: string;
    disabled?: boolean;
    style?: any;
    minimumValue?: number;
    maximumValue?: number;
    stepValue?: number;
    value?: number;
    onlyMaximumTrack?: boolean;
    maximumTrackTintColor?: string;
    minimumTrackTintColor?: string;
    trackStyle?: any;
    thumbStyle?: any;
    canTouchTrack?: boolean;
    thumbTintColor?: string;
    thumbTouchSize?: { width: number; height: number };
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    onValueChange?: (value: number) => void;
    renderMaximumTrack?: () => React.ReactNode;
    renderMinimumTrack?: () => React.ReactNode;
    renderThumb?: () => React.ReactNode;
  }
  export class Slider extends React.Component<SliderProps> {}
  export interface TopBarProps {
    style?: any;
    title?: React.ReactNode;
    titleStyle?: any;
    color?: string;
    actions?: any;
    onBack?: () => void;
  }
  export class TopBar extends React.Component<TopBarProps> {}
  export interface IconFontProps {
    size?: number;
    color?: string;
    d?: string;
    name?: string;
    style?: any;
  }
  export class IconFont extends React.Component<IconFontProps> {}
  export interface TYTextProps {
    style?: any;
    numberOfLines?: number;
  }
  export class TYText extends React.Component<TYTextProps> {}
  export interface UtilsInterface {
    RatioUtils: {
      isIphoneX: boolean;
      width: number;
      height: number;
      isIos: boolean;
      statusBarHeight: number;
      convert(d: any): number;
      convertX(d: any): number;
      convertY(d: any): number;
    };
    ColorUtils: {
      color: {
        hex2RgbString(hex: string, alpha?: number): string;
        hsb2hex(h: number, s: number, v: number): string;
        kelvin2rgb(kelvin: number): number[];
        rgb2hsv(...args: number[]): number[];
        temp2rgb(kelvin: number): string;
        brightKelvin2rgb(
          bright: number,
          kelvin?: number,
          option?: { temperatureMin?: number; temperatureMax?: number }
        ): string;
        rgb2hsb(...rgb: number[]): number[];
        bright2Opacity(bright: number, option: { min: number; max: number }): number;
        hsv2rgba(h: number, s: number, v: number): string;
        brightKelvin2rgba(bright: number, kelvin: number): string;
      };
    };
    ThemeUtils: {
      ThemeConsumer: any;
      withTheme<P extends { theme?: T }, T>(
        component: React.ComponentType<P>
      ): React.ComponentType<P>;
      deepMerge: (source: any, other: any) => any;
      getTheme: (props: any, key: string, defalutValue: any) => any;
      ThemeProvider: React.ElementType;
    };
    JsonUtils: {
      parseJSON(value: string): object;
    };
    TimeUtils: {
      parseTimer: Function;
      stringToSecond: Function;
    };
  }
  export class I18N {
    constructor(data: any);
    getLang(code: string): string;
    getDpLang(code: string, value?: any): string;
    formatValue(code: string, ...args: any[]): string;
  }
  export let Utils: UtilsInterface;
  export let Theme: any;
  export let TYFlatList: any;
  export const TYSdk: {
    apiRequest(option: { a: string; postData: any; v?: string }): Promise<any>;
    device: {
      putDpData(cmd: any): any;
      getDpIdByCode(code: string): number;
      getDpCodeById(id: number): string;
      setDeviceInfo(info: any): void;
      getDeviceInfo(): Promise<any>;
      __unInitializeDps: any;
      formatDps(data: any): any;
    };
    event: {
      on: (type: string, cb: Function) => void;
      off: (type: string, cb: Function) => void;
      emit(event: string, data: any): void;
      remove(event: string, callback: (d: any) => any): void;
    };
    native: {
      back: Function;
      showLoading: Function;
      getDevProperty: Function;
      setDevProperty: Function;
    };
    mobile: {
      back: Function;
      showLoading: Function;
      hideLoading: Function;
      simpleTipDialog: Function;
    };
  };
  export let NavigatorLayout: any;
  // export let I18N: I18NBase;
}

declare interface DpCodes {
  powerCode: string; // 开关
  brightCode: string; // 白光亮度
  minBrightCode?: string; //
  maxBrightCode?: string; //
  ledTypeCode: string; //
  countdownCode: string; //
}
