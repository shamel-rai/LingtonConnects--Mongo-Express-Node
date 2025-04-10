var admin = require("firebase-admin");

var serviceAccount = require("../../ServiceAdmin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
