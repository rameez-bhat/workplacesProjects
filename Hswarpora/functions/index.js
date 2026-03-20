const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
admin.initializeApp();

exports.createUser = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {UserEmail, password, UserName}= req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email: UserEmail, password, displayName: UserName});
      res.status(201).send({"status": "success", "data": userRecord});
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        try {
          // Fetch the existing user's details using the email
          const existingUser = await admin.auth().getUserByEmail(UserEmail);
          res.status(400).send({"status": "error",
            "data": error.message, "user": existingUser});
        } catch (fetchError) {
          // Handle error if there is an issue fetching the existing user
          res.status(400).send({"status": "error",
            "data": fetchError.message});
        }
      }
      res.status(400).send({"status": "error", "data": error.message});
    }
  });
});
