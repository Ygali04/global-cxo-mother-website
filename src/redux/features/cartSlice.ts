import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { setLocalStorage, getLocalStorage } from "@/utils/localstorage";

export interface CartProduct {
   id: number;
   thumb: string;
   title: string;
   price: number;
   quantity: number;
}

interface CartState {
   cart: CartProduct[];
   orderQuantity: number;
}

const initialState: CartState = {
   cart: [], // SSR safe
   orderQuantity: 1,
};

const cartSlice = createSlice({
   name: "cart",
   initialState,
   reducers: {
      hydrateCart: (state) => {
         // client-side only
         if (typeof window !== "undefined") {
            state.cart = getLocalStorage<CartProduct>("cart") || [];
         }
      },
      addToCart: (state, { payload }: PayloadAction<CartProduct>) => {
         const index = state.cart.findIndex(item => item.id === payload.id);
         if (index >= 0) {
            state.cart[index].quantity += 1;
            toast.info(`${payload.title} quantity increased`);
         } else {
            state.cart.push({ ...payload, quantity: 1 });
            toast.success(`${payload.title} added to cart`);
         }
         setLocalStorage("cart", state.cart);
      },
      decrease_quantity: (state, { payload }: PayloadAction<CartProduct>) => {
         const index = state.cart.findIndex(item => item.id === payload.id);
         if (index >= 0 && state.cart[index].quantity > 1) {
            state.cart[index].quantity -= 1;
            toast.info(`${payload.title} quantity decreased`);
         }
         setLocalStorage("cart", state.cart);
      },
      remove_cart_product: (state, { payload }: PayloadAction<CartProduct>) => {
         state.cart = state.cart.filter(item => item.id !== payload.id);
         toast.error(`${payload.title} removed from cart`);
         setLocalStorage("cart", state.cart);
      },
      clear_cart: (state) => {
         state.cart = [];
         setLocalStorage("cart", []);
      },
   },
});

export const { addToCart, decrease_quantity, remove_cart_product, clear_cart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
