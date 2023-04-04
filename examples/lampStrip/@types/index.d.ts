declare module 'react-native-json-tree';
declare module 'react-native-svg';

declare interface ColourData {
  hue: number;
  saturation: number;
  value: number;
}

declare interface WhiteData {
  brightness?: number;
  temperature?: number;
}

declare interface CommonColorData {
  isColor?: boolean;
  hue?: number;
  saturation?: number;
  value?: number;
  brightness?: number;
  temperature?: number;
}

interface MicMusicData {
  v: number;
  power: boolean;
  id: number;
  isLight: number;
  mode: number;
  speed: number;
  sensitivity: number;
  a: number;
  b: number;
  c: number;
  brightness: number;
  colors: Unit[];
}

interface Unit {
  hue: number;
  saturation: number;
}

declare interface LocalMusicColor {
  hue: number;
  saturation: number;
}
declare interface LocalMusicValue {
  version: number;
  power: boolean;
  mode: number;
  speed: number;
  id: number;
  serialNumber: number;
  sensitivity: number;
  colors: LocalMusicColor[];
}
