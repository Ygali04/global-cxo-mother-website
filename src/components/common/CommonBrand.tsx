"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image, { StaticImageData } from "next/image"

import brand_1 from "@/assets/img/brand/brand_img01.png"
import brand_2 from "@/assets/img/brand/brand_img02.png"
import brand_3 from "@/assets/img/brand/brand_img03.png"
import brand_4 from "@/assets/img/brand/brand_img04.png"
import brand_5 from "@/assets/img/brand/brand_img05.png"
import brand_6 from "@/assets/img/brand/brand_img06.png"

const brand_data: StaticImageData[] = [brand_1, brand_2, brand_3, brand_4, brand_5, brand_6, brand_3];

const setting = {
   slidesPerView: 5,
   spaceBetween: 24,
   loop: true,
   breakpoints: {
      '1500': {
         slidesPerView: 6,
      },
      '1200': {
         slidesPerView: 5,
      },
      '992': {
         slidesPerView: 4,
      },
      '768': {
         slidesPerView: 3,
      },
      '576': {
         slidesPerView: 3,
      },
      '0': {
         slidesPerView: 2,
      },
   },
};

const CommonBrand = () => {
   return (
      <Swiper {...setting} modules={[Autoplay]} className="swiper-container brand-active fix">
         {brand_data.map((img, i) => (
            <SwiperSlide key={i} className="swiper-slide">
               <div className="brand-item">
                  <Image src={img} alt="img" />
               </div>
            </SwiperSlide>
         ))}
      </Swiper>
   )
}

export default CommonBrand
