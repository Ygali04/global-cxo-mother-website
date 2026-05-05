"use client"
import Image from "next/image"
import Link from "next/link"
import UseSticky from "@/hooks/UseSticky"
import { useState } from "react"
import NavMenu from "./menu/NavMenu"
import MobileSidebar from "./menu/MobileSidebar"

import logo from "@/assets/img/logo/w_logo02.svg"
import logo2 from "@/assets/img/logo/logo.svg"

const HeaderThree = () => {

   const { sticky } = UseSticky();
   const [sidebar, setSidebar] = useState<boolean>(false);

   return (
      <header className="transparent-header">
         <div id="header-fixed-height"></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-four ${sticky ? "sticky-menu" : ""}`}>
            <div className="container-fluid p-0">
               <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                     <div className="logo">
                        <Link href="/"><Image src={logo} alt="Logo" /></Link>
                     </div>
                     <div className="logo d-none">
                        <Link href="/"><Image src={logo2} alt="Logo" /></Link>
                     </div>
                     <div className="tgmenu__navbar-wrap tgmenu-three__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                        <NavMenu />
                     </div>
                     <div className="tgmenu__action tgmenu__action-four">
                        <ul className="list-wrap">
                           <li className="header-contact">
                              <Link href="tel:+919845845616" className="header-contact-info"><i className="flaticon-telephone"></i>+91 98458 45616</Link>
                           </li>
                           <li className="header-btn header-btn-three">
                              <Link href="/#contact" className="tg-btn">Let’s Make a Meting</Link>
                           </li>
                        </ul>
                     </div>
                     <div onClick={() => setSidebar(true)} style={{ cursor: "pointer" }} className="mobile-nav-toggler"><i className="tg-flaticon-menu"></i></div>
                  </nav>
               </div>
            </div>
         </div>
         <MobileSidebar sidebar={sidebar} setSidebar={setSidebar} />
      </header>
   )
}

export default HeaderThree
