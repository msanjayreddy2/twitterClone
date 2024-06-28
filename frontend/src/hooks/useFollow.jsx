import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
  const queryClient = useQueryClient();

  const {
    mutate: follow,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (err) {
        toast.error(err.message);
      }
    },
    onSuccess: () => {
      toast.success("Followed successfully");

      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { follow, isError, isPending, error };
};

export default useFollow;
