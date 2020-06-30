import { TYSdk } from "tuya-panel-kit";

const TYDevice = TYSdk.device;

const sucStyle = "background: green; color: #fff;";
const errStyle = "background: red; color: #fff;";

const api = (a: string, postData: any, v = "1.0") => {
  return TYSdk.apiRequest({
    a,
    postData,
    v
  })
    .then((d: any) => {
      const data = typeof d === "string" ? JSON.parse(d) : d;
      console.log(`API Success: %c${a}%o`, sucStyle, data);
      return data;
    })
    .catch((err: any) => {
      const e = typeof err === "string" ? JSON.parse(err) : err;
      console.log(
        `API Failed: %c${a}%o`,
        errStyle,
        e.message || e.errorMsg || e,
        postData
      );
      return err;
    });
};

/**
 * 查询dp点日志 默认取最新数据=
 * @param dpCode dpCode
 * @param offset 偏移量，即 页码 * 页面大小 默认为0
 * @param limit 页面大小 默认为1
 */
TYSdk.getLogs = (devId: string, dpCode: any, offset: number, limit: number) => {
  const dpIds = dpCode.map((d: string) => TYDevice.getDpIdByCode(d));
  return api(
    "m.smart.operate.log",
    {
      devId,
      dpIds: dpIds.join(","),
      offset,
      limit
    },
    "2.0"
  );
};

TYSdk.getDevAlarmList = (devId: string) => {
  return api("tuya.m.linkage.rule.product.query", {
    devId
  });
};

TYSdk.setAlarmSwitch = (devId: string, ruleIds: any, disabled: boolean) => {
  return api("tuya.m.linkage.dev.warn.set", {
    devId,
    ruleIds,
    disabled
  });
};
export default TYSdk;
