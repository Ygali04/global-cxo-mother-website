import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { WishlistProduct } from "@/redux/features/wishlistSlice";

const UseWishlistInfo = () => {
   const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
   const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);

   useEffect(() => {
      setWishlistItems(wishlist);
   }, [wishlist]);

   return {
      wishlistItems,
   };
}

export default UseWishlistInfo;