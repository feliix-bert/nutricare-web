import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAvailableDoctors } from "@/features/medic/services/doctor.service";
import { childrenService } from "@/features/children/services/children.service";
import { CHILDREN_QUERY_KEY, childQueryKey } from "@/features/children/hooks/useChildren";

// ─── Fetch available doctors ──────────────────────────────────────────────────

export const useAvailableDoctors = () =>
  useQuery({
    queryKey: ["doctors", "available"],
    queryFn: fetchAvailableDoctors,
    staleTime: 10 * 60 * 1000, // 10 min — doctors list doesn't change often
  });

// ─── Update child's assigned doctor ──────────────────────────────────────────

export const useUpdateChildMedic = (childId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicId: string | null) =>
      childrenService.updateChildMedic(childId, medicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: childQueryKey(childId) });
    },
  });
};
