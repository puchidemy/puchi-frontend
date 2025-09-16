export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  // Thêm các trường khác của user nếu cần
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  // Thêm các trường profile khác
}
