import dotenv from "dotenv";

// Load environment variables first so any imported module can read them
dotenv.config({ path: process.env.ENV_FILE || "./.env.local" });

// Then import server (server will import firebaseAdmin and other modules)
import "./server";
