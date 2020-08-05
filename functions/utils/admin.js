const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('../key/key.json');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.REACT_APP_BASEURL
});

const db = admin.firestore();

module.exports = { admin, db };
