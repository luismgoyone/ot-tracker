import { create } from 'zustand';
import { OtRecord, CreateOtRecordDto, OtStatus } from '../types';
import { apiClient } from '../utils/apiClient';

interface OtState {
  otRecords: OtRecord[];
  myOtRecords: OtRecord[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOtRecords: () => Promise<void>;
  fetchMyOtRecords: () => Promise<void>;
  createOtRecord: (data: CreateOtRecordDto) => Promise<void>;
  updateOtStatus: (id: number, status: OtStatus) => Promise<void>;
  deleteOtRecord: (id: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOtStore = create<OtState>((set) => ({
  otRecords: [],
  myOtRecords: [],
  isLoading: false,
  error: null,

  fetchOtRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/ot-records');
      set({ otRecords: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch OT records',
        isLoading: false 
      });
    }
  },

  fetchMyOtRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/ot-records/my-records');
      set({ myOtRecords: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch my OT records',
        isLoading: false 
      });
    }
  },

  createOtRecord: async (data: CreateOtRecordDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/ot-records', data);
      const newRecord = response.data;
      
      set((state) => ({
        myOtRecords: [newRecord, ...state.myOtRecords],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create OT record',
        isLoading: false 
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
        isLoading: false 
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
        isLoading: false 
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
