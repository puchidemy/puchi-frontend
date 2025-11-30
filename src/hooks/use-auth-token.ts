import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export const useAuthToken = () => {
  const { getToken } = useAuth();

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    try {
      const token = await getToken();
      return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      return {
        "Content-Type": "application/json",
      };
    }
  }, [getToken]);

  return { getAuthHeaders };
}; 