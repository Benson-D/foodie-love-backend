export type UserDocument = {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  role: string;
};

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}
