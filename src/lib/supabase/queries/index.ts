export * from './base';
export * from './clients';
export * from './projects';
export * from './invoices';
export * from './user-profiles';

import { clientQueries } from './clients';
import { projectQueries } from './projects';
import { invoiceQueries } from './invoices';
import { userProfileQueries } from './user-profiles';

export const queries = {
  clients: clientQueries,
  projects: projectQueries,
  invoices: invoiceQueries,
  userProfiles: userProfileQueries,
};
