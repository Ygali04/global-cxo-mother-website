import FooterIcon from "@/components/common/FooterIcon"
import Link from "next/link"
import Image from "next/image"

import logo from "@/assets/img/logo/logo.svg"

const FooterTwo = () => {
   return (
      <footer className="footer__area-three fix">
         <div className="container">
            <div className="footer__top-two footer__top-three">
               <div className="row">
                  <div className="col-xl-3 col-lg-4 col-md-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title">About Company</h4>
                        <div className="footer__content-two">
                           <p>Felis consquat magnis fames sagittis ultrices plasodales porttitor quisque ultrice tempor turpis.</p>
                           <div className="footer__social footer__social-three">
                              <span className="title">Follow us On:</span>
                              <ul className="list-wrap">
                                 <FooterIcon />
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title">Information</h4>
                        <ul className="footer__widget-link list-wrap">
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
                  <div className="col-xl-4 col-lg-4 col-md-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title">Contact</h4>
                        <div className="footer__contact-two">
                           <p>Sydney Harbour Bridge Circular City of Sydney,Australia.</p>
                           <ul className="list-wrap">
                              <li><i className="flaticon-envelope"></i><Link href="mailto:explore@100exnextgen.com">explore@100exnextgen.com</Link></li>
                              <li><i className="flaticon-telephone"></i><Link href="tel:0123456789">+123 888 9999</Link></li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="footer__bottom-three">
               <div className="row align-items-center">
                  <div className="col-md-6">
                     <div className="footer__bottom-logo">
                        <Link href="/"><Image src={logo} alt="logo" /></Link>
                     </div>
                  </div>
                  <div className="col-md-6">
                     <div className="copyright__content-three">
                        <p>Copyright © 100exNextGen | All Right Reserved</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </footer>
   )
}

export default FooterTwo
