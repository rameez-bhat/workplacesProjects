const functions = require("firebase-functions");
const { google } = require("googleapis");
const admin = require("firebase-admin");
const keys = require("./ceoaccountsblaServiceAccount.json");
const cors = require("cors")({ origin: true });
admin.initializeApp();
// Setup Google Sheets API auth
const auth = new google.auth.GoogleAuth({ credentials: keys, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });


const sheets = google.sheets({ version: "v4", auth });
exports.updateGoogleSheet = functions.https.onRequest((req, res) => {
  // Use cors to handle CORS
  cors(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    const { spreadsheetId, range, values, valueInputOption } = req.body;
    try {
      const request = {
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: valueInputOption,
        resource: {
          values: values,
        },
      };
      const response = await sheets.spreadsheets.values.update(request);

      res.status(200).send({ status: "success", message: response });
    } catch (error) {
      console.error("Error updating Google Sheet:", error);
      res.status(500).send({ status: "error", message: error });
    }
  });
});
exports.updateGoogleSheetInBatchs = functions.https.onRequest((req, res) => {
  // Use cors to handle CORS
  cors(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    const { spreadsheetId, updates } = req.body;
    try {
      if (!spreadsheetId || !Array.isArray(updates)) {
        return res.status(400).
            send({ status: "error", message: "Invalid input" });
      }
      const request = {
        spreadsheetId: spreadsheetId,
        resource: {
          valueInputOption: "USER_ENTERED",
          data: updates,
        },
      };
      const response = await sheets.spreadsheets.values.batchUpdate(request);

      res.status(200).send({ status: "success", message: response });
    } catch (error) {
      console.error("Error updating Google Sheet:", error);
      res.status(500).send({ status: "error", message: error });
    }
  });
});
exports.updatePassword = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { StudentEmail, password, userid } = req.body;
    let returnresponse = {};
    try {
      admin
          .auth()
          .updateUser(userid, { password: password })
          .then((userRecord) => {
            console.log("Successfully updated password:", userRecord.uid);
            returnresponse["userid"] = "Successfully updated password:" + userRecord.uid;
          })
          .catch((error) => {
            console.error("Error updating user password:", error);
            returnresponse = error;
          });
      res.status(201).send({ status: "success", data: returnresponse });
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        try {
          // Fetch the existing user's details using the email
          const existingUser = await admin.auth().getUserByEmail(StudentEmail);
          res.status(400).send({ status: "error", data: error.message, user: existingUser });
        } catch (fetchError) {
          // Handle error if there is an issue fetching the existing user
          res.status(400).send({ status: "error", data: fetchError.message });
        }
      }
      res.status(400).send({ status: "error", data: error.message });
    }
  });
});
exports.createUser = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { StudentEmail, password, StudentName }= req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email: StudentEmail, password, displayName: StudentName });
      res.status(201).send({ status: "success", data: userRecord });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        try {
          // Fetch the existing user's details using the email
          const existingUser = await admin.auth().getUserByEmail(StudentEmail);
          res.status(400).send({ status: "error", data: error.message, user: existingUser });
        } catch (fetchError) {
          // Handle error if there is an issue fetching the existing user
          res.status(400).send({ status: "error", data: fetchError.message });
        }
      }
      res.status(400).send({ status: "error", data: error.message });
    }
  });
});
