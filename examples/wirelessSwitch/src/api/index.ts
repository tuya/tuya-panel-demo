import { TYSdk } from 'tuya-panel-kit';

export const getOssUrl = () => {
  return TYSdk.apiRequest<string>('tuya.m.app.panel.url.get', {});
};

const errStyle = 'background: red; color: #fff;';

const api = function (a: string, postData: any, v = '1.0') {
  return new Promise((resolve, reject) => {
    TYSdk.native.apiRNRequest(
      {
        a,
        postData,
        v,
      },
      (d: any) => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        resolve(data);
      },
      (err: any) => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        reject(err);
      }
    );
  });
};

// 设备列表
export const getDeviceList = () => {
  const { homeId } = TYSdk.devInfo;
  return api(
    'tuya.m.linkage.dev.list',
    {
      gid: homeId,
      sourceType: 'wirelessSwitch',
    },
    '3.0'
  );
};

// 查询一键执行场景列表
export const getSceneList = () => {
  return api('tuya.m.linkage.rule.brief.query', { devId: TYSdk.devInfo.devId });
};

// 查询已绑定的列表
export const getBindRuleList = () => {
  const { devId } = TYSdk.devInfo;
  return api('tuya.m.linkage.associative.entity.id.category.query', {
    bizDomain: 'wirelessSwitchBindScene',
    sourceEntityId: devId,
    entityType: 2,
  });
};

// 绑定
export const bindRule = ({
  associativeEntityId,
  ruleId,
  entitySubIds,
  expr,
}: {
  associativeEntityId: string;
  ruleId: string;
  entitySubIds: string;
  expr: string[][];
}) => {
  const { devId } = TYSdk.devInfo;
  return api('tuya.m.linkage.associative.entity.bind', {
    relationExpr: {
      sourceEntityId: devId,
      associativeEntityId, // 联DP点和DP点值的组合，（dp1#dpValue）
      associativeEntityValue: ruleId, // 关联的场景ID
      triggerRuleVO: {
        conditions: [
          {
            entityId: devId, // 无线开关设备ID
            entityType: 1,
            condType: 1,
            entitySubIds, // 关联DP点
            expr, // [ [ "$dp关联DP点", "==", "单击" ]]
          },
        ],
        actions: [
          {
            entityId: ruleId, // 关联的场景ID
            actionStrategy: 'repeat',
            actionExecutor: 'ruleTrigger',
          },
        ],
      },
      bizDomain: 'wirelessSwitchBindScene',
      uniqueType: 3,
    },
  });
};

// 解绑
export const removeRule = (ruleId: string, associativeEntityId: string) => {
  const { devId } = TYSdk.devInfo;
  return api('tuya.m.linkage.associative.entity.remove', {
    bizDomain: 'wirelessSwitchBindScene',
    sourceEntityId: devId,
    associativeEntityId,
    associativeEntityValue: ruleId,
  });
};

// 触发
export const triggerRule = (ruleId: string) => {
  return api('tuya.m.linkage.rule.trigger', {
    ruleId,
  });
};

// 启用
export const enableRule = (ruleId: string) => {
  return api('tuya.m.linkage.rule.enable', {
    ruleId,
  });
};

// 停用
export const disableRule = (ruleId: string) => {
  return api('tuya.m.linkage.rule.disable', {
    ruleId,
  });
};
