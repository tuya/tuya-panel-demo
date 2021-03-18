interface SceneData {
  name: string;
  value: string;
}

interface SceneColor {
  isColour: boolean;
  hsb: number[];
  whiteHsb: number[];
  kelvin: number;
  whiteBrightness: number;
}

interface DpValueType {
  [key: string]: number | string | boolean | undefined;
}
