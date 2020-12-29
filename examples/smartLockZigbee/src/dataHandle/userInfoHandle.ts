import TYNative from '../api';

export const getUserInfo = async (action: any) => {
  try {
    const data = await TYNative.getUserInfo();
    action({
      lockUserId: data.lockUserId, // 10进制
      userType: data.userType,
      userId: data.userId,
    });
  } catch (err) {
    console.log(err);
  }
};
