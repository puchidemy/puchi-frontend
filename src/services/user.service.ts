import { UserProfile } from "@/types/user";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Service class để quản lý API calls
class UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUserProfile(getAuthHeaders: () => Promise<HeadersInit>): Promise<UserProfile> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: "GET",
        headers,
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

  async updateUserProfile(
    profileData: Partial<UserProfile>,
    getAuthHeaders: () => Promise<HeadersInit>
  ): Promise<UserProfile> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: "PUT",
        headers,
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

  async deleteUserAccount(getAuthHeaders: () => Promise<HeadersInit>): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: "DELETE",
        headers,
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

// Export instance
const userService = new UserService(API_BASE_URL);

// Export functions for backward compatibility
export const getUserProfile = (getAuthHeaders: () => Promise<HeadersInit>) =>
  userService.getUserProfile(getAuthHeaders);

export const updateUserProfile = (
  profileData: Partial<UserProfile>,
  getAuthHeaders: () => Promise<HeadersInit>
) => userService.updateUserProfile(profileData, getAuthHeaders);

export const deleteUserAccount = (getAuthHeaders: () => Promise<HeadersInit>) =>
  userService.deleteUserAccount(getAuthHeaders);

export default userService;
