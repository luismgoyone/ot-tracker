import { create } from 'zustand';
import { OtRecord, CreateOtRecordDto, OtStatus, PaginationMeta } from '../types';
import { apiClient } from '../utils/apiClient';

interface OtState {
  otRecords: OtRecord[];
  otRecordsMeta: PaginationMeta;
  myOtRecords: OtRecord[];
  myOtRecordsMeta: PaginationMeta;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOtRecords: (page?: number, limit?: number, status?: OtStatus) => Promise<void>;
  fetchMyOtRecords: (page?: number, limit?: number) => Promise<void>;
  createOtRecord: (data: CreateOtRecordDto) => Promise<void>;
  updateOtStatus: (id: number, status: OtStatus) => Promise<void>;
  deleteOtRecord: (id: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export const useOtStore = create<OtState>((set) => ({
  otRecords: [],
  otRecordsMeta: defaultMeta,
  myOtRecords: [],
  myOtRecordsMeta: defaultMeta,
  isLoading: false,
  error: null,

  fetchOtRecords: async (page = 1, limit = 10, status?: OtStatus) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, string | number> = { page, limit };
      if (status) params.status = status;
      const response = await apiClient.get('/ot-records', { params });
      set({ otRecords: response.data.data, otRecordsMeta: response.data.meta, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch OT records',
        isLoading: false,
      });
    }
  },

  fetchMyOtRecords: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/ot-records/my-records', { params: { page, limit } });
      set({ myOtRecords: response.data.data, myOtRecordsMeta: response.data.meta, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch my OT records',
        isLoading: false,
      });
    }
  },

  createOtRecord: async (data: CreateOtRecordDto) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/ot-records', data);
      // Refetch page 1 to reflect the new record
      const response = await apiClient.get('/ot-records/my-records', { params: { page: 1, limit: 10 } });
      set({ myOtRecords: response.data.data, myOtRecordsMeta: response.data.meta, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create OT record',
        isLoading: false,
      });
      throw error;
    }
  },

  updateOtStatus: async (id: number, status: OtStatus) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/ot-records/${id}/status`, { status });
      const updatedRecord = response.data;
      set((state) => ({
        otRecords: state.otRecords.map((record) =>
          record.id === id ? updatedRecord : record
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update OT status',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteOtRecord: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/ot-records/${id}`);
      set((state) => ({
        myOtRecords: state.myOtRecords.filter((record) => record.id !== id),
        otRecords: state.otRecords.filter((record) => record.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete OT record',
        isLoading: false,
      });
      throw error;
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
