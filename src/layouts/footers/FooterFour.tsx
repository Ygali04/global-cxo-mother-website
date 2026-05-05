"use client"
import Image from "next/image"
import Link from "next/link"
import InjectableSvg from "@/components/common/InjectableSvg"
import FooterIcon from "@/components/common/FooterIcon"

import arrow from "@/assets/img/icons/right_arrow.svg"
import logo from "@/assets/img/logo/w_logo.svg"
import shape_1 from "@/assets/img/images/h5_footer_shape01.svg"
import shape_2 from "@/assets/img/images/h5_footer_shape02.svg"
import shape_3 from "@/assets/img/images/h5_footer_shape03.svg"
import shape_4 from "@/assets/img/images/h5_footer_shape04.svg"

const FooterFour = () => {
  return (
    <footer className="footer__area-four fix">
      <div className="container">
        <div className="footer__inquiry">
          <div className="row align-items-center">
            <div className="col-lg-9">
              <div className="footer__inquiry-content">
                <h2 className="title">Work Inquiry? <span>Send us message</span></h2>
                <p>We are digital agency that helps businesses develop immersive and engaging user experiences</p>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="footer__inquiry-btn text-end">
                <Link href="/#contact" className="tg-btn tg-hover-btn">Let&apos;s Work Together <InjectableSvg src={arrow.src} alt="" className="injectable" /></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__top-three">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-6">
              <div className="footer__widget">
                <div className="footer__logo">
                  <Link href="/"><Image src={logo} alt="logo" /></Link>
                </div>
                <div className="footer__content footer__content-three">
                  <p>Felis consquat magnis fames sagittis ultrices plasodales porttitor quisque ultrice tempor turpis.</p>
                </div>
                <div className="footer__social footer__social-four">
                  <ul className="list-wrap">
                    <FooterIcon />
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <div className="footer__widget">
                <h4 className="footer__widget-title footer__widget-title-two">Contact</h4>
                <div className="footer__contact">
                  <ul className="list-wrap">
                    <li><i className="flaticon-placeholder"></i>Sydney Harbour Circular City of Sydney,Australia.</li>
                    <li><i className="flaticon-telephone"></i><Link href="tel:0123456789">+123 888 9999</Link></li>
                    <li><i className="flaticon-envelope"></i><Link href="mailto:explore@100exnextgen.com">explore@100exnextgen.com</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6">
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
            <div className="col-xl-4 col-lg-4 col-md-8">
              <div className="footer__widget">
                <h4 className="footer__widget-title footer__widget-title-two">Subscribe Newsletter</h4>
                <div className="footer__newsletter footer__newsletter-two">
                  <span>*Only valuable resource no bullshit</span>
                  <form onSubmit={(e) => e.preventDefault()} className="footer__newsletter-form">
                    <input type="text" placeholder="Enter your e-mail" />
                    <button type="submit"><InjectableSvg src={arrow.src} alt="" className="injectable" /></button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom-five">
        <div className="container">
          <div className="copyright__content-four">
            <p>Copyright © 100exNextGen | All Right Reserved</p>
          </div>
        </div>
      </div>
      <div className="footer__shape-wrap-four">
        <Image src={shape_1} alt="shape" data-aos="fade-right" data-aos-delay="300" />
        <Image src={shape_2} alt="shape" />
        <Image src={shape_3} alt="shape" className="rotateme" />
        <Image src={shape_4} alt="shape" className="alltuchtopdown" />
      </div>
    </footer>
  )
}

export default FooterFour
