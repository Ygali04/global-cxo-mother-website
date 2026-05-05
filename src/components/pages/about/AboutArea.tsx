"use client"
import Arrow from "@/components/common/Arrow"
import Image from "next/image"
import Link from "next/link"
import { useParallax } from "@/hooks/useParallax"

import about_img1 from "@/assets/img/images/about_img01.jpg"
import about_img2 from "@/assets/img/images/about_img02.jpg"
import grap from "@/assets/img/images/profit_grap.svg"
import shape_1 from "@/assets/img/images/about_shape01.svg"
import shape_2 from "@/assets/img/images/about_shape02.svg"
import author from "@/assets/img/images/author01.png"
import author_sign from "@/assets/img/images/author_sign.png"

const AboutArea = () => {

   const parallaxRef = useParallax<HTMLImageElement>({ speed: 0.05, direction: "x" });

   return (
      <section className="about__area section-py-130">
         <div className="container">
            <div className="row align-items-center justify-content-center">
               <div className="col-lg-6 col-md-9">
                  <div className="about__img-wrap">
                     <div className="about__images">
                        <Image src={about_img1} alt="img" />
                        <Image src={about_img2} alt="img" />
                     </div>
                     <div className="experience__wrap" data-aos="fade-left" data-aos-delay="200">
                        <h2 className="count">25+</h2>
                        <span>Of Experience <br /> in This Field</span>
                     </div>
                     <div ref={parallaxRef} className="profit__wrap" >
                        <div className="thumb">
                           <Image src={grap} alt="img" />
                        </div>
                        <div className="content">
                           <h5 className="title">98% Profit</h5>
                           <span>Earning This Year</span>
                        </div>
                     </div>
                     <div className="shape">
                        <Image src={shape_1} alt="shape" data-aos="fade-up-right" data-aos-delay="600" />
                        <Image src={shape_2} alt="shape" className="alltuchtopdown" />
                     </div>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="about__content">
                     <div className="section__title mb-15">
                        <span className="sub-title">Behind Our History</span>
                        <h2 className="title">A Leading Consulting Company Serving Since <span>1970 With Global Expertise</span> And Strategies.</h2>
                     </div>
                     <p>Transform your business with our transformative consulting solutions. We go beyond short-term fixes to deliver sustainable growth strategies that future-proof your enterprise.</p>
                     <div className="about__inner-wrap">
                        <div className="about__list-box">
                           <div className="about__list-box-item">
                              <div className="icon">
                                 <i className="flaticon-growth"></i>
                              </div>
                              <div className="content">
                                 <h4 className="title">Investment <br /> Planning</h4>
                              </div>
                           </div>
                           <div className="about__list-box-item">
                              <div className="icon">
                                 <i className="flaticon-pie-chart-1"></i>
                              </div>
                              <div className="content">
                                 <h4 className="title">Business <br /> Statistics Rate</h4>
                              </div>
                           </div>
                        </div>
                        <div className="about__inner-content">
                           <p>Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes.</p>
                           <ul className="list-wrap about__list-item">
                              <li>
                                 <div className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                       <path d="M11.5252 3.5L5.30301 9.72222L2.47473 6.89394" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                 </div>
                                 Business Competitive Analysis
                              </li>
                              <li>
                                 <div className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                       <path d="M11.5252 3.5L5.30301 9.72222L2.47473 6.89394" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                 </div>
                                 Fast Growing Sells
                              </li>
                              <li>
                                 <div className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                       <path d="M11.5252 3.5L5.30301 9.72222L2.47473 6.89394" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                 </div>
                                 Financing Project Investment
                              </li>
                           </ul>
                        </div>
                     </div>
                     <div className="about__content-bottom">
                        <div className="author__wrap">
                           <div className="thumb">
                              <Image src={author} alt="img" />
                           </div>
                           <div className="content">
                              <Image src={author_sign} alt="img" />
                              <h6 className="title">Martinaze <span>, CEO</span></h6>
                           </div>
                        </div>
                        <Link href="/about" className="tg-btn">Explore Our Company <Arrow /></Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default AboutArea
