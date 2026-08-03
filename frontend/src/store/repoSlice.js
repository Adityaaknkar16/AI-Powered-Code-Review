import { createSlice } from '@reduxjs/toolkit';

const repoSlice = createSlice({
  name: 'repos',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchReposStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReposSuccess(state, action) {
      state.loading = false;
      state.list = action.payload;
    },
    fetchReposFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateRepoSettingsSuccess(state, action) {
      const index = state.list.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    }
  }
});

export const { fetchReposStart, fetchReposSuccess, fetchReposFailure, updateRepoSettingsSuccess } = repoSlice.actions;
export default repoSlice.reducer;
