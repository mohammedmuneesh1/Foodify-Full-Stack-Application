import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
//eslint-disable-next-line
import type { CartInterface, CartItemInterface, CartPayloadInterface, UserItemInterface } from "../../types/userTypes";
import type { LocationAdressInterface } from "../../types/addressType";


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
    userAddress:null | LocationAdressInterface,
    cart:null | CartInterface;
    cartModal:null | {
        item: UserItemInterface;
        isOpen:boolean;
    //     onAddToCart:(payload: CartPayloadInterface) => Promise<{
    //          statusCode?: number;
    //          success: boolean;
    //          response:string;
    //          data?: { shopName?: string }
    //  }>;
    }
};


const initialState:initialStateInterface = {
    value:0,
    userData:null,
    city: localStorage.getItem("city") || null,
    userCoordinates:null,
    userAddress:null,
    loading:true,
    cart:null,
    cartModal:null,
    
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

       openCartModal:(state,action)=>{
        state.cartModal = action.payload
       },
       closeCartModal:(state)=>{
        state.cartModal = null
       },
       setCart:(state,action)=>{
        state.cart = action.payload
       },
       setUserAddress:(state,action)=>{
        state.userAddress = action.payload
        },
       removeFromCart:(state,action)=>{
        if(state?.cart){
            //action.payload  will be cartItemId
            state.cart = {
                ...state.cart,
                items: state.cart?.items?.filter((item:CartItemInterface)=>item._id !== action.payload),
                totalAmount:action?.payload?.totalAmount - (state.cart?.items?.find((item:CartItemInterface)=>item._id === action.payload._id)?.totalPrice ?? 0)
            }
        }
       }





    //    addToCart :(state,action)=>{
    //     // state.cart ={
    //     //     items:[...state.cart?.items ?? [],action.payload?.item],
    //     //     totalAmount:action?.payload?.totalAmount
    //     // }
    //    },
    //    removeFromCart:(state,action)=>{
    //     // state.cart={
    //     //     items:state.cart?.items?.filter((item:CartItemInterface)=>item._id !== action.payload._id),
    //     //     totalAmount:action?.payload?.totalAmount
    //     // }
    //    }
    }

})



export const {setuserData,setCity,logout,setLoading,
setUserLocationCoordinates,closeCartModal,openCartModal,
setCart,
removeFromCart,
setUserAddress
} = userSlice.actions
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