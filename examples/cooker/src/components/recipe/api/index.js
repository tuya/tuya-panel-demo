import { TYSdk, Utils } from 'tuya-panel-kit';
import Config from '../../../config';
import Strings from '../i18n';
// https://www.easyapi.com/api/?documentId=18405&themeId=&categoryId=34889 api文档
const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';
if (__DEV__) {
  Strings.language = 'zh';
}
const apiUrl = {
  langList: 'tuya.ia.content.lang.onlinelist',
  langQuery: 'tuya.ia.content.lang.query',
  langDetail: 'tuya.ia.content.lang.detail',
  publicList: 'tuya.ia.content.public.online.list',
  collecting: 'tuya.industry.cookbook.star',
  unCollecting: 'tuya.industry.cookbook.unStar',
  collectInfo: 'tuya.industry.cookbook.starinfo',
  categoryList: 'tuya.industry.cookbook.category.search', // 查询分类
};

const api = function(a, postData, v = '1.0') {
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest({
      a,
      postData,
      v,
    })
      .then(d => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        console.log(`API Success: %c${a}%o`, sucStyle, data);
        resolve(data);
      })
      .catch(err => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e);
        reject(err);
      });
  });
};

// 获取公版菜谱列表
TYSdk.getPublicRecipeList = (productId, __, pageSize) => {
  const contentType = 'cookbook';
  const pageNo = 1;
  const postData = {
    productId,
    contentType,
    pageNo,
    pageSize,
  };
  if (__DEV__) {
    console.log('req:', {
      a: apiUrl.publicList,
      postData,
      v: '1.0',
    });
  }
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest({
      a: apiUrl.publicList,
      postData,
      v: '1.0',
    })
      .then(d => resolve(Utils.JsonUtils.parseJSON(d)))
      .catch(reject);
  });
};

// 获取菜谱首页列表
TYSdk.getHomeRecipes = ({ attrKey = 'ishome', attrValue = 'true' }, pageSize) => {
  const p = pageSize || 2000;
  const pageNo = 1;
  const { language } = Strings;
  const lang = language === 'zh' ? 'zh-CN' : language;
  if (__DEV__) {
    console.log('req:', {
      a: apiUrl.langQuery,
      postData: {
        productId: Config.devInfo.productId,
        pageNo,
        lang,
        pageSize: p,
        attrKey,
        attrValue,
      },
      v: '1.0',
    });
  }
  return new Promise((resolve, reject) => {
    TYSdk.apiRNRequest(
      {
        a: apiUrl.langQuery,
        postData: {
          productId: Config.devInfo.productId,
          pageNo,
          lang,
          pageSize: p,
          attrKey,
          attrValue,
        },
        v: '1.0',
      },
      d => {
        let obj = d;
        if (typeof obj === 'string') {
          try {
            obj = JSON.parse(handleJson(d));
            resolve(obj);
          } catch (e) {
            console.log('e, Data is error!', e);
          }
        } else {
          resolve(obj);
        }
      },
      e => {
        console.log(e, 'home');
        reject(e);
      }
    );
  });
};

// 获取菜谱列表
TYSdk.getRecipes = (categoryName, pageSize, productId) => {
  const p = pageSize || 2000;
  const contentType = 'cookbook';
  const { language } = Strings;
  const lang = language === 'zh' ? 'zh-CN' : language;
  const pageNo = 1;
  if (__DEV__) {
    console.log('req:', {
      a: apiUrl.langList,
      postData: {
        productId,
        contentType,
        lang,
        pageNo,
        pageSize: p,
        categoryName,
      },
      v: '1.0',
    });
  }
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest({
      a: apiUrl.langList,
      postData: {
        productId,
        contentType,
        pageNo,
        lang,
        nameSearch: '',
        pageSize,
        categoryName: '',
      },
      v: '1.0',
    })
      .then(d => {
        const obj = Utils.JsonUtils.parseJSON(d);
        if (lang === 'zh-CN') {
          TYSdk.getPublicRecipeList(productId)
            .then(list => {
              if (obj.contentList && list.contentList) {
                obj.contentList = obj.contentList.concat(list.contentList);
              } else if (!obj.contentList && list.contentList) {
                obj.contentList = list.contentList;
              }
              resolve(obj);
            })
            .catch(() => resolve(obj));
        } else {
          resolve(obj);
        }
      })
      .catch(e => {
        console.log('e :', e);
        reject(e);
      });
  });
};

// 获取菜谱详情
TYSdk.getRecipe = id => {
  if (__DEV__) {
    console.log('contentIds', id);
    console.log('Config :', Config);
  }
  const { language } = Strings;
  const lang = language === 'zh' ? 'zh-CN' : language;
  const contentId = id;
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest({
      a: apiUrl.langDetail,
      postData: {
        productId: Config.devInfo.productId,
        contentId,
        lang,
      },
      v: '1.0',
    })
      .then(d => {
        const obj = Utils.JsonUtils.parseJSON(d);
        obj.data = handleJson(obj.data);
        resolve(obj);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export function handleJson(json) {
  if (json) {
    return json
      .replace(/\r\n/g, '\\r\\n')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
  }
  return json;
}

// 查询菜谱分类
TYSdk.getCategoryList = () => {
  const { language } = Strings;
  const lang = language === 'zh' ? 'zh-CN' : language;
  if (__DEV__) {
    console.log('tuya.industry.cookbook.category.search:', {
      a: apiUrl.categoryList,
      postData: {
        uid: '',
        pid: Config.devInfo.productId,
        lang,
      },
      v: '1.0',
    });
  }
  return new Promise((resolve, reject) => {
    TYSdk.apiRNRequest(
      {
        a: apiUrl.categoryList,
        postData: {
          pid: TYSdk.devInfo.productId,
          uid: '',
          lang,
        },
        v: '1.0',
      },
      d => resolve(Utils.JsonUtils.parseJSON(d)),
      e => {
        console.log('error', e);
        reject(e);
      }
    );
  });
};

// 查询是否被收藏
TYSdk.getCollectInfo = id => {
  if (__DEV__) {
    console.log('collectInfo:', {
      a: apiUrl.collectInfo,
      postData: {
        contentId: id,
        pid: Config.devInfo.productId,
      },
      v: '1.0',
    });
  }
  return api(apiUrl.collectInfo, {
    contentId: id,
    pid: Config.devInfo.productId,
  });
};

TYSdk.getCollectDetail = id => {
  if (__DEV__) {
    console.log('collecting:', {
      a: apiUrl.collecting,
      postData: {
        contentId: id,
        pid: Config.devInfo.productId,
      },
      v: '1.0',
    });
  }
  return api(apiUrl.collecting, {
    contentId: id,
    pid: Config.devInfo.productId,
  });
};

// 取消收藏
TYSdk.onCancelCollect = id => {
  if (__DEV__) {
    console.log('unCollecting:', {
      a: apiUrl.unCollecting,
      postData: {
        contentId: id,
        pid: Config.devInfo.productId,
      },
      v: '1.0',
    });
  }
  return api(apiUrl.unCollecting, {
    contentId: id,
    pid: Config.devInfo.productId,
  });
};

export default TYSdk;
