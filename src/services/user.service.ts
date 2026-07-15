import { UserProfile } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  async deleteUserAccount(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user account: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  }
}

const userService = new UserService(API_BASE_URL);

export const getUserProfile = () => userService.getUserProfile();
export const updateUserProfile = (profileData: Partial<UserProfile>) =>
  userService.updateUserProfile(profileData);
export const deleteUserAccount = () => userService.deleteUserAccount();

export default userService;
