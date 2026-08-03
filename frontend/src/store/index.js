import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import repoReducer from './repoSlice';
import reviewReducer from './reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repos: repoReducer,
    reviews: reviewReducer,
  },
});
