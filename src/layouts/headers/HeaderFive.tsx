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
      <header className="transparent-header">
         <div id="header-fixed-height" style={{ display: "none" }}></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-seven ${sticky ? "sticky-menu" : ""} ${sticky ? "" : "aurora-nav"}`}>
            <div className="container custom-container">
               <div
                  className="tgmenu__wrap"
               >
                  <nav className="tgmenu__nav">
                     <div className="logo">
                        <Link href="/">
                           <span className="brand-mark-wrap">
                              <div className="logo-icon">
                                 <img
                                    src="/cxo-circle-logo.png"
                                    alt="Logo"
                                 />
                              </div>
                              <div className="logo-text-wrap">
                                 <span className="logo-text" style={{ color: '#0B1A4A' }}>Global CXO Circle</span>
                                 <span className="logo-tagline">Leadership Ecosystem</span>
                              </div>
                           </span>
                        </Link>
                     </div>
                     <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                        <NavMenu />
                     </div>
                     <div className="tgmenu__action tgmenu__action-seven">
                        <ul className="list-wrap">
                           <li className="header-btn">
                              <button type="button" className="tg-btn tg-btn-seven" style={{ border: "none" }}>Sign in</button>
                           </li>
                        </ul>
                     </div>
                     <div onClick={() => setSidebar(true)} style={{ cursor: "pointer" }} className="mobile-nav-toggler"><i className="tg-flaticon-menu"></i></div>
                  </nav>
               </div>
            </div>
         </div>
         <MobileSidebar sidebar={sidebar} setSidebar={setSidebar} />

         <style jsx>{`
            .brand-mark-wrap {
               display: flex;
               align-items: center;
               gap: 12px;
               text-decoration: none;
               white-space: nowrap;
               flex-shrink: 0;
            }

            .logo-icon img {
               height: clamp(30px, 3.5vw, 40px) !important;
               width: auto !important;
               transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
               filter: drop-shadow(0 4px 8px rgba(0, 71, 255, 0.1));
            }

            .brand-mark-wrap:hover .logo-icon img {
               transform: scale(1.1) rotate(-5deg);
            }

            .logo-text-wrap {
               display: flex;
               flex-direction: column;
               justify-content: center;
               line-height: 1;
            }

            .logo-text {
               font-family: 'Plus Jakarta Sans', var(--tg-heading-font-family), sans-serif;
               font-size: clamp(14px, 1.4vw, 20px);
               font-weight: 700;
               letter-spacing: -0.03em;
               text-transform: uppercase;
               display: inline-block;
               position: relative;
               line-height: 1.2;
               color: #0B1A4A !important; /* Base color */
            }

            @supports (background-clip: text) or (-webkit-background-clip: text) {
               .logo-text {
                  background-image: linear-gradient(135deg, #0B1A4A 0%, #0A3CC2 100%);
                  -webkit-background-clip: text;
                  background-clip: text;
                  color: transparent !important;
                  -webkit-text-fill-color: transparent !important;
               }
            }

            .logo-tagline {
               font-size: clamp(8px, 0.7vw, 10px);
               font-weight: 600;
               letter-spacing: 0.15em;
               text-transform: uppercase;
               color: #64748b;
               margin-top: 2px;
            }

            .tgmenu__nav {
               display: flex;
               align-items: center;
               justify-content: space-between;
               width: 100%;
               gap: clamp(10px, 1vw, 22px);
            }

            .tgmenu__navbar-wrap {
               flex: 1 1 auto;
               min-width: 0;
               display: flex;
               justify-content: flex-end;
            }

            .tgmenu__navbar-wrap :global(.navigation) {
               display: flex;
               align-items: center;
               justify-content: center;
               flex-wrap: nowrap;
               width: 100%;
               margin: 0 !important;
               padding: 0;
               gap: clamp(4px, 0.5vw, 12px);
            }

            .tgmenu__navbar-wrap :global(.navigation > li) {
               flex: 0 0 auto;
            }

            .tgmenu__navbar-wrap :global(.navigation > li > a) {
               padding: clamp(16px, 1.8vw, 22px) clamp(6px, 0.7vw, 12px) !important;
               font-size: clamp(11px, 0.82vw, 13px) !important;
            }

             .logo {
                padding: 12px 0;
             }

             :global(.transparent-header) {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                z-index: 1000;
             }

             :global(#sticky-header) {
                background: transparent !important;
                z-index: 1000;
                padding: 0 !important;
                transition: background 0.3s ease, box-shadow 0.3s ease;
             }

            :global(#sticky-header .container.custom-container),
            :global(#sticky-header .tgmenu__wrap),
            :global(#sticky-header .tgmenu__nav) {
               background: transparent !important;
            }

            :global(#sticky-header .tgmenu__wrap) {
               border-bottom: 1px solid transparent;
               box-shadow: none;
               backdrop-filter: none;
            }

            :global(#sticky-header.sticky-menu) {
               background: #ffffff !important;
               backdrop-filter: blur(10px);
               border-bottom: 1px solid rgba(11, 26, 74, 0.08);
               box-shadow: 0 8px 24px rgba(11, 26, 74, 0.06);
               z-index: 1000;
               top: 0 !important;
               margin-top: 0 !important;
               padding: 0 !important;
               animation: none !important;
            }

            :global(#sticky-header.sticky-menu .container.custom-container),
            :global(#sticky-header.sticky-menu .tgmenu__wrap),
            :global(#sticky-header.sticky-menu .tgmenu__nav) {
               background: transparent !important;
               backdrop-filter: none !important;
            }

            :global(#sticky-header .tgmenu__nav) {
               padding: 10px 0 !important;
            }

            @media (max-width: 1400px) {
               .tgmenu__nav {
                  gap: 15px;
               }
               .logo-text {
                  font-size: clamp(15px, 1.2vw, 19px);
               }
               .logo-icon img {
                  height: clamp(36px, 3.4vw, 48px) !important;
               }
               .logo-tagline {
                  display: none;
               }
               .tgmenu__navbar-wrap :global(.navigation > li > a) {
                  padding-left: 8px !important;
                  padding-right: 8px !important;
                  font-size: 12px !important;
               }
                .tgmenu__action-seven :global(.tg-btn) {
                   padding: 8px 12px !important;
                   font-size: 11px !important;
                }
            }

            @media (max-width: 1200px) {
               .tgmenu__nav {
                  gap: 10px;
               }
               .tgmenu__navbar-wrap :global(.navigation > li > a) {
                  padding-left: 8px !important;
                  padding-right: 8px !important;
                  font-size: 12px !important;
               }
            }

            /* Prevent menu from wrapping to next line */
            @media (min-width: 992px) {
               .tgmenu__nav {
                  flex-wrap: nowrap !important;
               }
               .tgmenu__navbar-wrap {
                  min-width: 0;
               }
            }

            @media (max-width: 991px) {
                .tg-header__area-seven {
                   padding: 12px 0 !important;
                }
               .logo-text {
                  font-size: 19px;
                  /* Ensure solid color on mobile if gradient fails */
                  color: #0B1A4A !important;
                  -webkit-text-fill-color: initial;
               }
               @supports (background-clip: text) or (-webkit-background-clip: text) {
                  .logo-text {
                     -webkit-text-fill-color: transparent !important;
                  }
               }
               .brand-mark-wrap {
                  gap: 10px;
               }
            }

            @media (max-width: 480px) {
                .tg-header__area-seven {
                   padding: 10px 0 !important;
                }
               .logo-text {
                  font-size: 16px;
               }
               .brand-mark-wrap {
                  gap: 8px;
               }
               .logo-icon img {
                  height: 36px !important;
               }
            }
         `}</style>

      </header>
   )
}

export default HeaderFive
