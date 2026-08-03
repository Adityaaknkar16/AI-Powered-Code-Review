import { createSlice } from '@reduxjs/toolkit';

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    history: [],
    currentReview: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchReviewsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsSuccess(state, action) {
      state.loading = false;
      state.history = action.payload;
    },
    fetchReviewsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchReviewDetailSuccess(state, action) {
      state.currentReview = action.payload;
    },
    fetchStatsSuccess(state, action) {
      state.stats = action.payload;
    }
  }
});

export const {
  fetchReviewsStart,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  fetchReviewDetailSuccess,
  fetchStatsSuccess,
} = reviewSlice.actions;
export default reviewSlice.reducer;
