import { connect } from '@tidbcloud/serverless';

const FALLBACK_DB_URL = 'mysql://2xep5bQAAdyKm3h.root:q8srV12X7EeO8Wfc@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test';

export function getDb(url?: string) {
  const dbUrl = url || FALLBACK_DB_URL;
  return connect({ url: dbUrl });
}
