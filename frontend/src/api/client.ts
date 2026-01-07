import { Api } from "./Api";

// Create a configured API client instance
// Note: baseUrl is empty because the generated API paths already include '/api'
export const apiClient = new Api({
  baseUrl: "",
  baseApiParams: {
    credentials: "include", // Important for cookie-based auth
  },
});
