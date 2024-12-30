import { createSlice } from '@reduxjs/toolkit';

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    currentVideo: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.currentVideo = action.payload;
    },
    fetchError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    like: (state, action) => {
      if (!state.currentVideo.likes.includes(action.payload)) {
        state.currentVideo.likes.push(action.payload);
        // Remove from dislikes if present
        state.currentVideo.dislikes = state.currentVideo.dislikes.filter(
          (userId) => userId !== action.payload
        );
      }
    },
    dislike: (state, action) => {
      if (!state.currentVideo.dislikes.includes(action.payload)) {
        state.currentVideo.dislikes.push(action.payload);
        // Remove from likes if present
        state.currentVideo.likes = state.currentVideo.likes.filter(
          (userId) => userId !== action.payload
        );
      }
    },
    updateViews: (state) => {
      state.currentVideo.views += 1;
    },
  },
});

export const { 
  fetchStart, 
  fetchSuccess, 
  fetchError, 
  like, 
  dislike, 
  updateViews 
} = videoSlice.actions;

export default videoSlice.reducer;