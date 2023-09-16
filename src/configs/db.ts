import { getDatabaseUri } from "./general";
import { Client } from "pg";

const db: Client = new Client({
  connectionString: getDatabaseUri(),
});

db.connect();

export default db;