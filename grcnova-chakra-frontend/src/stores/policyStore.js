// src/stores/policyStore.js
import create from 'zustand';
import { createPolicy } from '../lib/supabase/api/policies';

const usePolicyStore = create((set) => ({
  policies: [],
  isLoading: false,
  error: null,
  
  createPolicy: async (policyData) => {
    set({ isLoading: true, error: null });
    try {
      const newPolicy = await createPolicy(policyData);
      set(state => ({
        policies: [newPolicy, ...state.policies],
        isLoading: false
      }));
      return newPolicy;
    } catch (error) {
      set({ error, isLoading: false });
      throw error;
    }
  },
  
  // Other actions...
}));

export default usePolicyStore;