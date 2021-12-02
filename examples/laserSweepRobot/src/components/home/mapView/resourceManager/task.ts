/* eslint-disable no-restricted-syntax */
import { ITaskOpts, IEvent, IAutoTask, IStore, IElementConfigs } from './interface';
import Store from './store';
import Elements from './elements';

/**
 * 自动任务处理
 *
 * @export
 * @class Task
 */
export default class Task {
  // 存储卸载任务的方法
  uninstallTaskList: (() => void)[] = [];

  /**
   * 启动任务
   *
   * @param {Store} localStore
   * @memberof Task
   */
  runAutoTask(localStore: Store, autoTaskConfig: IAutoTask, element: Elements, event: IEvent) {
    const taskNameList = Object.keys(autoTaskConfig);
    for (const name of taskNameList) {
      const { source, action } = autoTaskConfig[name];
      const next = (nextValue: any) => {
        const nextState = action(localStore.getStore(), nextValue, element.getElementConfigs());
        if (nextState.then) {
          // 处理promise
          nextState.then((state: IStore) => {
            localStore.update(state, event);
          });
          return;
        }

        localStore.update(nextState, event);
      };
      this.uninstallTaskList.push(source(localStore.getStore(), next, element.getElementConfigs()));
    }
  }

  /**
   * 任务卸载
   *
   * @memberof Task
   */
  uninstallTask() {
    if (this.uninstallTaskList && this.uninstallTaskList.length) {
      this.uninstallTaskList.forEach(uninstallTaskFn => {
        uninstallTaskFn && uninstallTaskFn();
      });
    }
  }
}
