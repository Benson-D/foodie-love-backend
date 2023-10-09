export type UserDocument = {
  username: string;
  googleId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  isAdmin: boolean;
};

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}
