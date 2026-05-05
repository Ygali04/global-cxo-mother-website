"use client";
import { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import InjectableSvg from "@/components/common/InjectableSvg";

import quote from "@/assets/img/icons/quote.svg";
import avatar01 from "@/assets/img/images/testi_avatar01.png";
import avatar02 from "@/assets/img/images/testi_avatar02.png";
import avatar03 from "@/assets/img/images/testi_avatar03.png";
import avatar04 from "@/assets/img/images/testi_avatar04.png";
import rightArrow from "@/assets/img/icons/right_arrow.svg";

import shape_1 from "@/assets/img/images/testi_shape01.svg"
import shape_2 from "@/assets/img/images/testi_shape02.svg"
import shape_3 from "@/assets/img/images/testi_shape03.svg"
import shape_4 from "@/assets/img/images/testi_shape04.svg"
import shape_5 from "@/assets/img/images/testi_shape05.svg"
import map from "@/assets/img/images/map.svg"

interface ContentData {
   id: number;
   name: string;
   designation: string;
   desc: string;
}

const testimonialData: ContentData[] = [
   {
      id: 1,
      name: "Mr. Robey Alexa",
      designation: "CEO, TechInnovate",
      desc: "“Excellent content and a real sense of community among the participant all curated in a wonderful setting. It is clear effort goes into the organization and planning of the gatherings. ”",
   },
   {
      id: 2,
      name: "John Carter",
      designation: "Founder, Creative Minds",
      desc: "“Excellent content and a real sense of community among the participant all curated in a wonderful setting. It is clear effort goes into the organization and planning of the gatherings. ”",
   },
   {
      id: 3,
      name: "Sophia Martinez",
      designation: "Product Manager, PixelPro",
      desc: "100exNextGen transformed our trajectory completely. Their hands-on approach and deep industry network helped us turn momentum into scalable success.",
   },
   {
      id: 4,
      name: "David Johnson",
      designation: "CTO, DevSolutions",
      desc: "“Excellent content and a real sense of community among the participant all curated in a wonderful setting. It is clear effort goes into the organization and planning of the gatherings. ”",
   },
];

const avatars = [avatar01, avatar02, avatar03, avatar04];

const Testimonial = () => {

   const thumbsSwiperRef = useRef<SwiperType | null>(null);

   return (
      <section className="testimonial__area testimonial__area-six fix">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-10">
                  <div className="testimonial__wrap">
                     <Swiper
                        modules={[Navigation, Thumbs, Autoplay]}
                        loop={true}
                        autoplay={{ delay: 6000 }}
                        navigation={{
                           nextEl: ".testimonial-button-next",
                           prevEl: ".testimonial-button-prev",
                        }}
                        thumbs={{ swiper: thumbsSwiperRef.current }}
                        spaceBetween={0}
                        slidesPerView={1}
                        className="swiper-container fix testimonial-active"
                     >
                        {testimonialData.map((item) => (
                           <SwiperSlide key={item.id} className="swiper-slide">
                              <div className="testimonial__item">
                                 <div className="testimonial__icon">
                                    <InjectableSvg src={quote.src} alt="icon" className="injectable" />
                                 </div>
                                 <div className="testimonial__content">
                                    <p>{item.desc}</p>
                                    <div className="testimonial__rating">
                                       <i className="fas fa-star"></i>
                                       <i className="fas fa-star"></i>
                                       <i className="fas fa-star"></i>
                                       <i className="fas fa-star"></i>
                                       <i className="fas fa-star"></i>
                                    </div>
                                    <div className="testimonial__content-bottom">
                                       <h4 className="title">{item.name}</h4>
                                       <span>{item.designation}</span>
                                    </div>
                                 </div>
                              </div>
                           </SwiperSlide>

                        ))}
                     </Swiper>

                     <Swiper
                        modules={[Thumbs]}
                        onSwiper={(swiper) => (thumbsSwiperRef.current = swiper)}
                        spaceBetween={10}
                        slidesPerView={4}
                        watchSlidesProgress
                        className="swiper testimonial__nav">
                        {avatars.map((avatar, index) => (
                           <SwiperSlide key={index} className="swiper-slide">
                              <button>
                                 <Image src={avatar} alt={`Avatar ${index + 1}`} />
                              </button>
                           </SwiperSlide>
                        ))}
                     </Swiper>
                     <div className="testimonial__nav-two">
                        <button className="testimonial-button-prev"><InjectableSvg src={rightArrow.src} alt="Previous" className="injectable" /></button>
                        <button className="testimonial-button-next"><InjectableSvg src={rightArrow.src} alt="Previous" className="injectable" /></button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="testimonial__shape-wrap">
            <Image src={shape_1} alt="shape" />
            <Image src={shape_2} alt="shape" />
            <Image src={shape_3} alt="shape" data-aos="fade-up-right" data-aos-delay="400" />
            <Image src={shape_4} alt="shape" />
            <Image src={shape_5} alt="shape" />
            <Image src={map} alt="shape" className="big-shape" />
         </div>
      </section>
   )
}

export default Testimonial
