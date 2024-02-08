import cron from "node-cron";
import axios from "axios";

/**
 * Avoid sleep mode through render free tier
 */
async function deactivateSleepMode() {
  try {
    const response = await axios.get("https://foodieloveapi.onrender.com/");

    console.log(response.data, "Site is live!");
  } catch (err) {
    console.error("Sleep mode is in process or failed call");
  }
}

cron.schedule("*/10 * * * *", deactivateSleepMode);
