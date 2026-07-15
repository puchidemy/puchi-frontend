export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  bio?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
