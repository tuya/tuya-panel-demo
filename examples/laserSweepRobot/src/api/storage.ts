import RNFetchBlob from 'rn-fetch-blob';
import { protocolUtil} from '@protocol';

const { logger } = protocolUtil;

export const translateFileName = (path: string) =>
  path.replace(/\//g, '-').replace('bin', 'json').slice(1);

export const saveJsonFile = async (jsonData: any, filename: string) => {
  try {
    const { dirs } = RNFetchBlob.fs;
    const path = `${dirs.CacheDir}/${filename}`;
    const jsonString = JSON.stringify(jsonData);
    await RNFetchBlob.fs.writeFile(path, jsonString, 'utf8');
    logger.info('【Storage】saveJsonFile success:', filename, path);
  } catch (error) {
    logger.info('【Storage】saveJsonFile error', error);
  }
};

export const readJsonFile = async (filename: string) => {
  try {
    const { dirs } = RNFetchBlob.fs;
    const path = `${dirs.CacheDir}/${filename}`;
    const data = await RNFetchBlob.fs.readFile(path, 'utf8');
    logger.info('【Storage】readJsonFile success', path);
    return data;
  } catch (error) {
    return null;
  }
};
