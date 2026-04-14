// npm install google-auth-library axios

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" // IMPORTANT for popup auth-code flow
);

export default googleClient;