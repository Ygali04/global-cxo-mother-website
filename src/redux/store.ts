import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./features/productSlice";
import cartSlice from "./features/cartSlice";
import wishlistSlice from "./features/wishlistSlice";

const store = configureStore({
   reducer: {
      products: productSlice,
      cart: cartSlice,
      wishlist: wishlistSlice,
   },
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: {
            ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            ignoredPaths: ["cart.items", "wishlist.items"],
         },
      }),
   devTools: typeof window !== "undefined",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
