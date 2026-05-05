"use client"
import Image from "next/image"
import HeaderFourTop from "./header-top/HeaderFourTop"
import NavMenu from "./menu/NavMenu"
import Link from "next/link"
import OffCanvas from "./menu/OffCanvas"
import MobileSidebar from "./menu/MobileSidebar"
import UseSticky from "@/hooks/UseSticky"
import { useState } from "react"

import logo from "@/assets/img/logo/w_logo.svg"
import logo2 from "@/assets/img/logo/logo.svg"

const HeaderFour = () => {

   const { sticky } = UseSticky();
   const [sidebar, setSidebar] = useState<boolean>(false);
   const [offCanvas, setOffCanvas] = useState<boolean>(false);

   return (
      <header className="transparent-header">
         <HeaderFourTop />
         <div id="header-fixed-height"></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-five ${sticky ? "sticky-menu" : ""}`}>
            <div className="container custom-container">
               <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                     <div className="logo">
                        <Link href="/"><Image src={logo} alt="Logo" /></Link>
                     </div>
                     <div className="logo d-none">
                        <Link href="/"><Image src={logo2} alt="Logo" /></Link>
                     </div>
                     <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                        <NavMenu />
                     </div>
                     <div className="tgmenu__action tgmenu__action-five">
                        <ul className="list-wrap">
                           <li className="header-contact">
                              <Link href="tel:+919845845616" className="header-contact-info"><i className="flaticon-telephone"></i>+91 98458 45616</Link>
                           </li>
                           <li className="offCanvas-menu">
                              <a onClick={() => setOffCanvas(true)} style={{ cursor: "pointer" }} className="menu-tigger">
                                 <span></span>
                                 <span></span>
                                 <span></span>
                              </a>
                           </li>
                        </ul>
                     </div>
                     <div onClick={() => setSidebar(true)} style={{ cursor: "pointer" }} className="mobile-nav-toggler"><i className="tg-flaticon-menu"></i></div>
                  </nav>
               </div>
            </div>
         </div>
         <OffCanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
         <MobileSidebar sidebar={sidebar} setSidebar={setSidebar} />
      </header>
   )
}

export default HeaderFour
