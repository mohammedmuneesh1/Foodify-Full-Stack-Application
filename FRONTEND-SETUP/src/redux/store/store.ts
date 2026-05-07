import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../reducers/counterSlice'
import userReducer from '../reducers/userSlice'
import shopReducer from '../reducers/shopSlice'
export const store = configureStore({
  reducer: {
    // add reducers here
      counter: counterReducer,
      shop:shopReducer,
      user:userReducer,
  },
})

// types (important for TS)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch



//⚠️⚠️ THE MODEL IT LOOKS LIKE 

// state = {
//   counter: {...},
//   user: {
//     value: 0,
//     userData: null
//   }
// }