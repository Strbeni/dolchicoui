import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  phoneNumber?: string;
  avatar?: string;
  fullName?: string;
  country?: string;
  state?: string;
  zip?: string;
  // Add other user properties as needed
}

// Define the user state interface
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunk for fetching user data
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://valyris-i.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/user/get-user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If token is invalid, clear it
        if (response.status === 401 || response.status === 403) {
          console.log('Invalid token detected, clearing authentication data');
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch user`);
      }

      const responseData = await response.json();
      // Extract user data from the response
      const userData = responseData.user || responseData;
      
      // Validate that we have essential user data
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received from server');
      }
      
      // Store the updated user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
      
      return userData;
    } catch (error) {
      console.error('fetchUser error:', error);
      
      // Clear authentication data on any error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

// Async thunk for updating user data
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const responseData = await response.json();
      // Extract user data from the response structure
      const updatedUser = responseData.user || responseData;
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set user from localStorage or other sources
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;

      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
        sessionStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    // Action to clear user data (logout)
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;

      // Clear from localStorage as well
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    },
    // Action to clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user cases
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setUser, clearUser, clearError } = userSlice.actions;

// Export selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

// Export reducer
export default userSlice.reducer;
