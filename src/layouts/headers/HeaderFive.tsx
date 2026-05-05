"use client"

import NavMenu from "./menu/NavMenu"
import Link from "next/link"
import MobileSidebar from "./menu/MobileSidebar"
import UseSticky from "@/hooks/UseSticky"
import { useState } from "react"

const HeaderFive = () => {

   const { sticky } = UseSticky();
   const [sidebar, setSidebar] = useState<boolean>(false);

   const handleContactScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
         e.preventDefault();
         document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
         window.history.pushState(null, '', '/#contact');
      }
   };

   return (
      <header>
         <div id="header-fixed-height" style={{ display: "none" }}></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-seven ${sticky ? "sticky-menu" : ""}`}>
            <div className="container custom-container">
               <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                     <div className="tgmenu__nav-left">
                        <div className="logo">
                           <Link href="/">
                              <img
                                 src="/cxo-circle-logo.png"
                                 alt="Global CXO Circle"
                                 style={{ height: "60px", width: "auto", maxHeight: "none" }}
                              />
                           </Link>
                        </div>
                     </div>
                     <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                        <NavMenu />
                     </div>
                     <div className="tgmenu__action tgmenu__action-seven">
                        <ul className="list-wrap">
                           <li className="header-btn">
                              <Link href="/apply" className="tg-btn tg-btn-seven" style={{ background: "linear-gradient(90deg, #0A3CC2 0%, #B300B9 100%)", color: "#fff", border: "none" }}>Apply for Membership</Link>
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

export default HeaderFive
