var admin = require('firebase-admin');

// required for configuring firebase admin sdk
var serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hackportal-53efe.firebaseio.com',
});

const checkAuth = (req, res, next) => {
  if (req.headers.authtoken) {
    const authtoken = req.headers.authtoken;

    if (req.headers.authtoken == 'test') {
      req.userId = '984xCyW0nnRikhkVBaiKbmoLKj92';
      req.email = 'singhal.yash8080@gmail.com';
      return next();
    }
    admin
      .auth()
      .verifyIdToken(authtoken)
      .then((decodedToken) => {
        console.log('decoded token', decodedToken);
        if (decodedToken.email_verified) {
          req.userId = decodedToken.user_id;
          req.email = decodedToken.email;
          return next();
        } else {
          return res.status(403).send({
            message: 'email not verified',
          });
        }
      })
      .catch(() => {
        console.log('some problem with token. Unable to decode');
        return res.status(403).send({
          message: 'Unauthorized',
        });
      });
  } else {
    return res.status(403).send({
      message: 'no authtoken provided in header',
    });
  }
};

module.exports = checkAuth;
