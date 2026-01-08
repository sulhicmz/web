import { auth } from './browser-auth';
import { serverAuth } from './server-auth';
import { sessionUtils } from './session-utils';
import { rbac } from './rbac';

export { auth };
export { serverAuth };
export { sessionUtils };
export { rbac };

export const AuthUtils = {
  auth,
  serverAuth,
  sessionUtils,
  rbac,
};
