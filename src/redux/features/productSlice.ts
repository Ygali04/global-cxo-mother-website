import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import products from '@/data/ShopData';

export interface Product {
   id: number;
   thumb: string;
   title: string;
   price: number;
   rating: number;
   category: string;
   color: string;
   quantity: number;
   old_price?: number;
   total_rating: string;
   offer?: string;
   latest?: string;
}

interface ProductState {
   products: Product[];
   product: Product | null;
}

const initialState: ProductState = {
   products: products as unknown as Product[],
   product: null,
};

export const productSlice = createSlice({
   name: 'products',
   initialState,
   reducers: {
      single_product: (state, action: PayloadAction<number>) => {
         state.product = state.products.find((p) => p.id === action.payload) || null;
      },
   },
});

export const { single_product } = productSlice.actions;

// Selectors
export const selectProducts = (state: { products: ProductState }) => state?.products?.products;
export const selectProduct = (state: { products: ProductState }) => state?.products?.product;

export default productSlice.reducer;