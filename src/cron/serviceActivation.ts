import cron from "node-cron";
import axios from "axios";

function deactivateSleepMode() {
  try {
    const response = axios.get("https://foodieloveapi.onrender.com/");

    console.log(response, "Site is live!");
  } catch (err) {
    console.error("Sleep mode is in process or failed call");
  }
}

cron.schedule("*/10 * * * *", deactivateSleepMode);
