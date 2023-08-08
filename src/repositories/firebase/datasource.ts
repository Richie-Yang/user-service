import * as admin from 'firebase-admin';
import { firestore, auth as firebaseAuth } from 'firebase-admin';
import { CONFIG } from '../../config';
import { NodeEnv } from '../../variables';

const serviceAccountFilePath = '../../../richie-demo-service-account.json';
let _DB: firestore.Firestore | undefined;
let _Auth: firebaseAuth.Auth | undefined;

export { init, datasource, auth };

function init() {
  try {
    const appInitSetup =
      CONFIG.NODE_ENV === NodeEnv.LOCAL
        ? {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            credential: admin.credential.cert(require(serviceAccountFilePath)),
          }
        : {};
    const client = admin.initializeApp(appInitSetup);
    _DB = client.firestore();
    _DB.settings({ ignoreUndefinedProperties: true });
    _Auth = client.auth();
    console.log(`initial firebase connection success...`);
  } catch (e) {
    console.error(`initial firebase error...`, e);
    process.exit(0);
  }
}

function datasource() {
  if (!_DB) process.exit(0);
  return _DB;
}

function auth() {
  if (!_Auth) process.exit(0);
  return _Auth;
}
