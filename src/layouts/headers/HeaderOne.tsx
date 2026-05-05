"use client"
import Image from "next/image"
import Link from "next/link"
import UseSticky from "@/hooks/UseSticky"
import { useState } from "react"
import NavMenu from "./menu/NavMenu"
import MobileSidebar from "./menu/MobileSidebar"

import logo from "@/assets/img/logo/logo.svg"

const HeaderOne = () => {

   const { sticky } = UseSticky();
   const [sidebar, setSidebar] = useState<boolean>(false);

   return (
      <header className="transparent-header">
         <div id="header-fixed-height"></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-two ${sticky ? "sticky-menu" : ""}`}>
            <div className="container">
               <div className="row">
                  <div className="col-12">
                     <div className="tgmenu__wrap">
                        <nav className="tgmenu__nav">
                           <div className="logo">
                              <Link href="/"><Image src={logo} alt="Logo" /></Link>
                           </div>
                           <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                              <NavMenu />
                           </div>
                           <div className="tgmenu__action tgmenu__action-two">
                              <ul className="list-wrap">
                                 <li className="header-btn header-btn-two">
                                    <Link href="/#contact" className="tg-btn">Apply Now</Link>
                                 </li>
                              </ul>
                           </div>
                           <div onClick={() => setSidebar(true)} style={{ cursor: "pointer" }} className="mobile-nav-toggler"><i className="tg-flaticon-menu"></i></div>
                        </nav>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <MobileSidebar sidebar={sidebar} setSidebar={setSidebar} />
      </header>
   )
}

export default HeaderOne
