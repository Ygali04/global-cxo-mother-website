"use client"
import Image from "next/image"
import Link from "next/link"
import FooterIcon from "@/components/common/FooterIcon"
import InjectableSvg from "@/components/common/InjectableSvg"

import logo from "@/assets/img/logo/w_logo.svg"
import arrow from "@/assets/img/icons/right_arrow.svg"
import shape_1 from "@/assets/img/images/footer_shape01.svg"
import shape_2 from "@/assets/img/images/footer_shape02.svg"
import shape_3 from "@/assets/img/images/footer_shape03.svg"

const FooterFive = () => {
   return (
      <footer className="footer__area fix">
         <div className="footer__top">
            <div className="container">
               <div className="row">
                  <div className="col-xl-3 col-lg-4 col-md-6">
                     <div className="footer__widget">
                        <div className="footer__logo">
                           <Link href="/"><Image src={logo} alt="logo" /></Link>
                        </div>
                        <div className="footer__content">
                           <p>Felis consquat magnis fames sagittis ultrices plasodales porttitor quisque ultrice tempor turpis.</p>
                        </div>
                        <div className="footer__social">
                           <ul className="list-wrap">
                              <FooterIcon />
                           </ul>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title">About Company</h4>
                        <ul className="footer__widget-link list-wrap">
                           <li><Link href="/about">About Us</Link></li>
                           <li><Link href="/about">Sustainability</Link></li>
                           <li><Link href="/about">Leadership</Link></li>
                           <li><Link href="/about">Team News & Media</Link></li>
                           <li><Link href="/about">Careers</Link></li>
                        </ul>
                     </div>
                  </div>
                  <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title">Quick links</h4>
                        <ul className="footer__widget-link list-wrap">
                           <li><Link href="/about">How it&apos;s Work</Link></li>
                           <li><Link href="/#contact">Partners</Link></li>
                           <li><Link href="/#contact">Testimonials</Link></li>
                           <li><Link href="/project">Case Studiesa</Link></li>
                           <li><Link href="/#contact">Pricing</Link></li>
                        </ul>
                     </div>
                  </div>
                  <div className="col-xl-4 col-lg-4 col-md-8">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title">Subscribe Newsletter</h4>
                        <div className="footer__newsletter">
                           <span>*Only valuable resource no bullshit</span>
                           <form onSubmit={(e) => e.preventDefault()} className="footer__newsletter-form" >
                              <input type="text" placeholder="Enter your e-mail" />
                              <button type="submit"><InjectableSvg src={arrow.src} alt="" className="injectable" /></button>
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="footer__bottom">
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="copyright__content">
                        <p>Copyright © 100exNextGen | All Right Reserved</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="footer__shape-wrap">
            <Image src={shape_1} alt="shape" data-aos="fade-down-left" data-aos-delay="400" />
            <Image src={shape_2} alt="shape" />
            <Image src={shape_3} alt="shape" className="rotateme" />
         </div>
      </footer>
   )
}

export default FooterFive
