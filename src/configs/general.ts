import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

const PORT = process.env?.PORT ? +process.env.PORT : 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql://localhost/foodie_love_test"
    : process.env.TEST_URL || "postgresql://localhost/foodie_love";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

const TOKEN_TIME = process.env.TOKEN_TIME as string;
const REFRESH_TIME = process.env.REFRESH_TIME;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
const AWS_BUCKET_REGION = process.env.BUCKET_REGION as string;

const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

console.log("Foodie Love Config:");
console.log("SECRET_KEY:", SECRET_KEY);
console.log("PORT:", PORT.toString());
console.log("BCRYPT_WORK_FACTOR", BCRYPT_WORK_FACTOR);
console.log("----");

export {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  TOKEN_TIME,
  REFRESH_TIME,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  AWS_SECRET_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_REGION,
  COOKIE_SECRET,
};
