import { Component } from 'react';
import { CurvData } from '../../config/interface';
interface MainProps {
  key: any;
  data: CurvData[];
  renderer: (obj: { [key: string]: any }) => void;
  height: number;
  type: string;
  placeholder: string;
  width: number;
}
export default class F2Chart extends Component<MainProps> {}
