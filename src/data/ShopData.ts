import { StaticImageData } from "next/image";

import shop_thumb1 from "@/assets/img/shop/shop_img01.png"
import shop_thumb2 from "@/assets/img/shop/shop_img02.png"
import shop_thumb3 from "@/assets/img/shop/shop_img03.png"
import shop_thumb4 from "@/assets/img/shop/shop_img04.png"
import shop_thumb5 from "@/assets/img/shop/shop_img05.png"
import shop_thumb6 from "@/assets/img/shop/shop_img06.png"
import shop_thumb7 from "@/assets/img/shop/shop_img07.png"
import shop_thumb8 from "@/assets/img/shop/shop_img08.png"
import shop_thumb9 from "@/assets/img/shop/shop_img09.png"

interface ProductData {
   id: number;
   thumb: StaticImageData;
   title: string;
   category: string;
   color: string;
   price: number;
   old_price?: number;
   rating: number;
   total_rating: string;
   offer?: string;
   latest?: string;
}

const shop_data: ProductData[] = [
   {
      id: 1,
      thumb: shop_thumb1,
      title: "Brand New Women Red Label ARDEEN Ladies Bag",
      category: "Women",
      color: "Gray",
      old_price: 140,
      price: 90,
      rating: 5,
      total_rating: "09",
      offer: "-10%",
   },
   {
      id: 2,
      thumb: shop_thumb2,
      title: "100% Casual Full Sleeve Black Shirt For Man",
      category: "kid’s",
      color: "Orange",
      old_price: 25,
      price: 20,
      rating: 5,
      total_rating: "08",
      offer: "-10%",
   },
   {
      id: 3,
      thumb: shop_thumb3,
      title: "The Most Hyparei Break Kit for SUV Models",
      category: "electronics",
      color: "Pink",
      old_price: 140,
      price: 110,
      rating: 4,
      total_rating: "03",
      latest: "New",
   },
   {
      id: 4,
      thumb: shop_thumb4,
      title: "Women's Raya Mid Stiletto Sandals",
      category: "Furniture",
      color: "Green",
      price: 70,
      rating: 5,
      total_rating: "07",
   },
   {
      id: 5,
      thumb: shop_thumb5,
      title: "The Most Hyparei Break Kit for SUV Models",
      category: "Smart Watch",
      color: "Blue",
      price: 450,
      rating: 4,
      total_rating: "05",
      latest: "New",
   },
   {
      id: 6,
      thumb: shop_thumb6,
      title: "Samsung Smart Washing Machine 880 Litter",
      category: "Laptop",
      color: "Yellow",
      price: 600,
      rating: 2,
      total_rating: "09",
   },
   {
      id: 7,
      thumb: shop_thumb7,
      title: "The Most Hyparei Break Kit for SUV Models",
      category: "Women",
      color: "",
      old_price: 150,
      price: 130,
      rating: 3,
      total_rating: "10",
      latest: "New",
   },
   {
      id: 8,
      thumb: shop_thumb8,
      title: "Travel Bag Pack For Huge Changes",
      category: "kid’s",
      color: "",
      old_price: 30,
      price: 10,
      rating: 5,
      total_rating: "06",
      offer: "-10%",
   },
   {
      id: 9,
      thumb: shop_thumb9,
      title: "Most Comfortable Running Shoes for Men",
      category: "electronics",
      color: "",
      old_price: 80,
      price: 45,
      rating: 4,
      total_rating: "08",
      offer: "-10%",
   },
   {
      id: 10,
      thumb: shop_thumb7,
      title: "The Most Hyparei Break Kit for SUV Models",
      category: "Women",
      color: "",
      old_price: 150,
      price: 130,
      rating: 3,
      total_rating: "10",
      latest: "New",
   },
   {
      id: 11,
      thumb: shop_thumb8,
      title: "Travel Bag Pack For Huge Changes",
      category: "kid’s",
      color: "",
      old_price: 30,
      price: 10,
      rating: 5,
      total_rating: "06",
      offer: "-10%",
   },
   {
      id: 12,
      thumb: shop_thumb9,
      title: "Most Comfortable Running Shoes for Men",
      category: "electronics",
      color: "",
      old_price: 80,
      price: 45,
      rating: 4,
      total_rating: "08",
      offer: "-10%",
   },
];

export default shop_data;