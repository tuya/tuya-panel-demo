import Home from '../pages/homePage';
import Volume from '../pages/volumePage';
import Settings from '../pages/settingsPage';
import RoomEdit from '../pages/roomEditPage';
import CustomEdit from '../pages/customEditPage';
import DustCollection from '../pages/dustCollectionPage';
import DeviceInfo from '../pages/deviceInfoPage';
import Consumables from '../pages/consumablesPage';
import MapManage from '../pages/mapManagePage';
import MapHistory from '../pages/mapHistoryPage';
import EditMap from '../pages/editMapPage';

import { MultiFaultDetail, HistoryList } from '../components';

const router = [
  {
    name: 'main',
    component: Home,
  },
  {
    name: 'records',
    component: HistoryList.LeiDong,
  },
  {
    name: 'volume',
    component: Volume,
  },
  {
    name: 'settings',
    component: Settings,
  },
  {
    name: 'roomEdit',
    component: RoomEdit,
  },
  {
    name: 'FaultDetail',
    component: MultiFaultDetail,
  },
  // 定制房间信息页面
  {
    name: 'customEdit',
    component: CustomEdit,
  },
  // 设备信息页面
  {
    name: 'dustCollectionSwitch',
    component: DustCollection,
  },
  // 设备信息页面
  {
    name: 'deviceInfo',
    component: DeviceInfo,
  },
  // 耗材管理页面
  {
    name: 'consumablesManagement',
    component: Consumables,
  },
  // 多地图管理功能
  {
    name: 'mapManage',
    component: MapManage,
  },
  {
    name: 'mapHistory',
    component: MapHistory,
  },
  {
    name: 'EditMapTimerCustomTimer',
    component: EditMap,
  },
];

export default router;
