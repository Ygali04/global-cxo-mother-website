"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CartSummary {
   quantity: number;
   total: number;
}

const UseCartInfo = () => {
   const [summary, setSummary] = useState<CartSummary>({ quantity: 0, total: 0 });
   const cartItems = useSelector((state: RootState) => state.cart.cart);

   useEffect(() => {
      const cartTotal = cartItems.reduce(
         (acc, item) => {
            acc.quantity += item.quantity;
            acc.total += item.price * item.quantity;
            return acc;
         },
         { quantity: 0, total: 0 }
      );
      setSummary(cartTotal);
   }, [cartItems]);

   return summary;
};

export default UseCartInfo;
