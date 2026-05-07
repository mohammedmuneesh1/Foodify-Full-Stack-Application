import { createSlice, type PayloadAction } from '@reduxjs/toolkit'


interface ShopDataObject{

    shops : Array<object> | [],
    pagination: {
         page: number,
         limit:number,
        total:number,
        pages: number
    };
  };

interface ShopStateInterface {
  shopData:null | ShopDataObject,
  shopItems: Array<object> | [];
  shopLoading:boolean;

}

const initialState: ShopStateInterface = {
  shopData: null,  
  shopItems: [],
  shopLoading:true,
}

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setShopData: (state, action: PayloadAction<ShopDataObject | null>) => {
      state.shopData = action.payload
    },
    setShopLoading:(state,action:PayloadAction<boolean>)=>{
        state.shopLoading = action.payload
    },
  },
})

export const {setShopData,setShopLoading } = shopSlice.actions
export default shopSlice.reducer;


