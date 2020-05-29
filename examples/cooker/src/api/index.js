import { TYSdk, Utils } from 'tuya-panel-kit';
import Config from '../config';
import Strings from '../i18n';

const apiUrl = {
  langList: 'tuya.ia.content.lang.onlinelist',
  langQuery: 'tuya.ia.content.lang.query',
  langDetail: 'tuya.ia.content.lang.detail',
  publicList: 'tuya.ia.content.public.online.list',
  collectList: 'tuya.industry.cookbook.starlist',
  categoryList: 'tuya.industry.cookbook.category.search', // 查询分类
};

// 获取公版菜谱列表
TYSdk.getPublicRecipeList = (productId, categoryName, pageSize) => {
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
        console.log('obj', obj);
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

// 收藏菜谱列表
TYSdk.getCollects = productId => {
  const { language } = Strings;
  const lang = language === 'zh' ? 'zh-CN' : language;
  if (__DEV__) {
    console.log('req:', {
      a: apiUrl.collectList,
      postData: {
        pid: productId,
        lang,
      },
      v: '1.0',
    });
  }
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest({
      a: apiUrl.collectList,
      postData: {
        pid: productId,
        lang,
      },
      v: '1.0',
    })
      .then(d => {
        const obj = Utils.JsonUtils.parseJSON(d);
        resolve(obj);
      })
      .catch(e => {
        console.log('error', e);
        reject(e);
      });
  });
};

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
    TYSdk.apiRequest({
      a: apiUrl.categoryList,
      postData: {
        pid: Config.devInfo.productId,
        uid: '',
        lang,
      },
      v: '1.0',
    })
      .then(d => {
        const obj = Utils.JsonUtils.parseJSON(d);
        resolve(obj);
      })
      .catch(e => {
        console.log('error', e);
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

export default TYSdk;
