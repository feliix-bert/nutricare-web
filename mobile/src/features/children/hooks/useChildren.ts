import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { childrenService } from '@/features/children/services/children.service';
import type { ChildRequest, ChildUpdateRequest } from '@/features/children/types/child.types';

export const CHILDREN_QUERY_KEY = ['children'] as const;
export const childQueryKey = (id: string) => ['children', id] as const;

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const useChildrenList = (page = 0, size = 10) =>
  useQuery({
    queryKey: [...CHILDREN_QUERY_KEY, { page, size }],
    queryFn: () => childrenService.getChildren(page, size),
  });

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export const useChild = (childId: string) =>
  useQuery({
    queryKey: childQueryKey(childId),
    queryFn: () => childrenService.getChild(childId),
    enabled: !!childId,
  });

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const useCreateChild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChildRequest) => childrenService.createChild(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
    },
  });
};

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const useUpdateChild = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChildUpdateRequest) =>
      childrenService.updateChild(childId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: childQueryKey(childId) });
    },
  });
};
