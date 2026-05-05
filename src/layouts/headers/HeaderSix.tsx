"use client"
import Image from "next/image"
import Link from "next/link"
import OffCanvas from "./menu/OffCanvas"
import Searchbar from "./menu/Searchbar"
import UseSticky from "@/hooks/UseSticky"
import { useState } from "react"
import InjectableSvg from "@/components/common/InjectableSvg"
import HeaderSixTop from "./header-top/HeaderSixTop"
import NavMenu from "./menu/NavMenu"

import logo from "@/assets/img/logo/logo.svg"
import arrow_1 from "@/assets/img/icons/right_arrow02.svg"
import icon_1 from "@/assets/img/icons/burger.svg"
import MobileSidebar from "./menu/MobileSidebar"

const HeaderSix = () => {

   const { sticky } = UseSticky();
   const [sidebar, setSidebar] = useState<boolean>(false);
   const [offCanvas, setOffCanvas] = useState<boolean>(false);
   const [isSearch, setIsSearch] = useState<boolean>(false);

   return (
      <header>
         <HeaderSixTop />
         <div id="header-fixed-height"></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-six ${sticky ? "sticky-menu" : ""}`}>
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
                           <div className="tgmenu__action tgmenu__action-six">
                              <ul className="list-wrap">
                                 <li className="header-search">
                                    <a onClick={() => setIsSearch(true)} style={{ cursor: "pointer" }} className="search-open-btn"><i className="flaticon-search"></i></a>
                                 </li>
                                 <li className="header-btn">
                                    <Link href="/#contact" className="tg-btn tg-btn-four tg-btn-five">Get a Quote <InjectableSvg src={arrow_1.src} alt="" className="injectable" /></Link>
                                 </li>
                                 <li className="offCanvas-menu">
                                    <a onClick={() => setOffCanvas(true)} style={{ cursor: "pointer" }} className="menu-tigger">
                                       <InjectableSvg src={icon_1.src} alt="" className="injectable" />
                                    </a>
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
         <OffCanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
         <MobileSidebar sidebar={sidebar} setSidebar={setSidebar} />
         <Searchbar isSearch={isSearch} setIsSearch={setIsSearch} />
      </header>
   )
}

export default HeaderSix
