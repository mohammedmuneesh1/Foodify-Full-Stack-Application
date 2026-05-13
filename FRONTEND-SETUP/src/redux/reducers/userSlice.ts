import { createSlice, type PayloadAction } from "@reduxjs/toolkit";




interface initialStateInterface{
    value:number,
    userData:null | {
            fullName?: string,
          email?: string,
          mobile?: string,
          role?: string,
    },
    city:null | string,
    loading:boolean;
    userCoordinates:null | {lat:number,lng:number};
}


const initialState:initialStateInterface = {
    value:0,
    userData:null,
    city: localStorage.getItem("city") || null,
    userCoordinates:null,
    loading:true,
}

const userSlice = createSlice({
    name:"user",
    initialState:initialState,
    reducers:{
        setuserData:(state,action:PayloadAction<object>)=>{
            state.userData = action.payload
        },
        setCity:(state,action:PayloadAction<string>)=>{
            state.city = action.payload
        },
        setLoading:(state,action:PayloadAction<boolean>)=>{
            state.loading = action.payload
        },
      logout: (state) => {
      state.userData = null
      state.city = null
       },
       setUserLocationCoordinates:(state,action)=>{
         state.userCoordinates = action.payload
       },

    }

})



export const {setuserData,setCity,logout,setLoading,setUserLocationCoordinates} = userSlice.actions
export default userSlice.reducer;



// setCity: (state, action) => {
//   state.city = action.payload
//   localStorage.setItem("city", action.payload) // ❌ bad idea
// }

// Why it’s bad:

// breaks predictability
// harder to test
// violates Redux design
// future bugs will feel “random”



// 2. Save to localStorage outside reducer
// Option A: In component (simple)
// dispatch(setCity(city))
// localStorage.setItem("city", city)


// Option B: Middleware (proper scalable way)
// const cityMiddleware = store => next => action => {
//   if (action.type === "user/setCity") {
//     localStorage.setItem("city", action.payload)
//   }
//   return next(action)
// }