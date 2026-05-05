import Image, { StaticImageData } from "next/image"
import Link from "next/link"
import FooterIcon from "@/components/common/FooterIcon"

import logo from "@/assets/img/logo/w_logo.svg"
import insta_img1 from "@/assets/img/images/footer_insta01.jpg"
import insta_img2 from "@/assets/img/images/footer_insta02.jpg"
import insta_img3 from "@/assets/img/images/footer_insta03.jpg"
import insta_img4 from "@/assets/img/images/footer_insta04.jpg"
import insta_img5 from "@/assets/img/images/footer_insta05.jpg"
import insta_img6 from "@/assets/img/images/footer_insta06.jpg"
import shape_1 from "@/assets/img/images/h2_footer_shape01.svg"
import shape_2 from "@/assets/img/images/h2_footer_shape02.svg"
import shape_3 from "@/assets/img/images/h2_footer_shape03.svg"

const insta_data: StaticImageData[] = [insta_img1, insta_img2, insta_img3, insta_img4, insta_img5, insta_img6]

interface StyleType {
   style?: boolean;
}

const FooterOne = ({ style }: StyleType) => {
   return (
      <footer className={`footer__area-two ${style ? "footer__area-five" : ""} fix`}>
         <div className="container">
            <div className="footer__top-two">
               <div className="row">
                  <div className="col-xl-3 col-lg-4 col-md-6">
                     <div className="footer__widget">
                        <div className="footer__logo-two">
                           <Link href="/"><Image src={logo} alt="logo" /></Link>
                        </div>
                        <div className="footer__contact">
                           <ul className="list-wrap">
                              <li><i className="flaticon-placeholder"></i>Sydney Harbour Circular City of Sydney,Australia.</li>
                              <li><i className="flaticon-telephone"></i><Link href="tel:0123456789">+123 888 9999</Link></li>
                              <li><i className="flaticon-envelope"></i><Link href="mailto:explore@100exnextgen.com">explore@100exnextgen.com</Link></li>
                           </ul>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title footer__widget-title-two">About Company</h4>
                        <ul className="footer__widget-link footer__widget-link-two list-wrap">
                           <li><Link href="/about">About Us</Link></li>
                           <li><Link href="/about">Sustainability</Link></li>
                           <li><Link href="/about">Leadership</Link></li>
                           <li><Link href="/about">Team News & Media</Link></li>
                           <li><Link href="/about">Careers</Link></li>
                        </ul>
                     </div>
                  </div>
                  <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title footer__widget-title-two">Quick links</h4>
                        <ul className="footer__widget-link footer__widget-link-two list-wrap">
                           <li><Link href="/about">How it&apos;s Work</Link></li>
                           <li><Link href="/#contact">Partners</Link></li>
                           <li><Link href="/#contact">Testimonials</Link></li>
                           <li><Link href="/project">Case Studiesa</Link></li>
                           <li><Link href="/#contact">Pricing</Link></li>
                        </ul>
                     </div>
                  </div>
                  <div className="col-xl-4 col-lg-4 col-md-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title footer__widget-title-two">Instagram Photos</h4>
                        <div className="footer__instagram">
                           <ul className="list-wrap">
                              {insta_data.map((img, i) => (
                                 <li key={i}>
                                    <Link href="https://www.instagram.com/" target="_blank"><Image src={img} alt="img" /></Link>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="footer__bottom-two">
               <div className="row align-items-center">
                  <div className="col-md-6">
                     <div className="copyright__content-two">
                        <p>Copyright © 100exNextGen | All Right Reserved</p>
                     </div>
                  </div>
                  <div className="col-md-6">
                     <div className="footer__social footer__social-two">
                        <ul className="list-wrap">
                           <FooterIcon />
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="footer__shape-wrap-two">
            <Image src={shape_1} alt="shape" />
            <Image src={shape_2} alt="shape" />
            <Image src={shape_3} alt="shape" />
         </div>
      </footer>
   )
}

export default FooterOne
