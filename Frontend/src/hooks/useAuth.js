import { useQuery } from "@tanstack/react-query";
import { getUser } from "../lib/api";

export const AUTH = "auth"; // Change queryKey to an array
const useAuth = (options = {}) => {
  const { data: user, ...rest } = useQuery({
    queryKey: [AUTH], // Change queryKey to an array
    queryFn: getUser,
    staleTime: Infinity, // Data is never stale (never refetches) and stored in query cache indefinitely
    ...options,
  });
  return { user: user?.data, ...rest };
};

export default useAuth;
