// ユーザーが管理者かどうかを判断するヘルパー関数
export const isAdmin = (user) => {
  if (!user || !user.attributes) {
    return false;
  }
  
  // custom:isAdmin 属性で判断
  return user.attributes['custom:isAdmin'] === 'true';
};