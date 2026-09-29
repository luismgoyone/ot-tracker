import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { CreateOtRecordPayload, MyOtSummary, OtRecord, OtRecordFilters, OtStatus, Paginated } from '../types';

export const otRecordKeys = {
  all: ['ot-records'] as const,
  list: (filters: OtRecordFilters) => ['ot-records', 'list', filters] as const,
  mine: (page: number, limit: number) => ['ot-records', 'mine', { page, limit }] as const,
  mySummary: ['ot-records', 'my-summary'] as const,
};

/** Records visible to a supervisor (their department) or admin (everyone). */
export function useOtRecords(filters: OtRecordFilters) {
  return useQuery({
    queryKey: otRecordKeys.list(filters),
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''));
      return (await apiClient.get<Paginated<OtRecord>>('/ot-records', { params })).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMyOtRecords(page: number, limit: number) {
  return useQuery({
    queryKey: otRecordKeys.mine(page, limit),
    queryFn: async () =>
      (await apiClient.get<Paginated<OtRecord>>('/ot-records/my-records', { params: { page, limit } })).data,
    placeholderData: keepPreviousData,
  });
}

export function useMyOtSummary() {
  return useQuery({
    queryKey: otRecordKeys.mySummary,
    queryFn: async () => (await apiClient.get<MyOtSummary>('/ot-records/my-summary')).data,
  });
}

/** Invalidates every OT and analytics query so lists, totals and charts all refresh. */
function useInvalidateOt() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: otRecordKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    ]);
}

export function useCreateOtRecord() {
  const invalidate = useInvalidateOt();
  return useMutation({
    mutationFn: async (payload: CreateOtRecordPayload) =>
      (await apiClient.post<OtRecord>('/ot-records', payload)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateOtStatus() {
  const invalidate = useInvalidateOt();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OtStatus.APPROVED | OtStatus.REJECTED }) =>
      (await apiClient.patch<OtRecord>(`/ot-records/${id}/status`, { status })).data,
    onSettled: invalidate,
  });
}

export function useDeleteOtRecord() {
  const invalidate = useInvalidateOt();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/ot-records/${id}`);
    },
    onSuccess: invalidate,
  });
}
