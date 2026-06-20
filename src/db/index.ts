import { connect } from '@tidbcloud/serverless';

export function getDb(url: string) {
  return connect({ url });
}
