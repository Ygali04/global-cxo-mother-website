import Image from "next/image"
import Link from "next/link"
import MobileMenus from "./MobileMenu";


interface MobileSidebarProps {
   sidebar: boolean;
   setSidebar: (sidebar: boolean) => void;
}

const MobileSidebar = ({ sidebar, setSidebar }: MobileSidebarProps) => {

   return (
      <div className={`${sidebar ? "mobile-menu-visible" : ""}`}>
         <div className="tgmobile__menu">
            <nav className="tgmobile__menu-box">
               <div onClick={() => setSidebar(false)} className="close-btn"><i className="tg-flaticon-close-1"></i></div>
               <div className="nav-logo" style={{ marginBottom: "20px" }}>
                  <Link href="/">
                     <span className="brand-mark-wrap-sidebar">
                        <div className="logo-icon">
                           <img src="/cxo-circle-logo.png" alt="Global CXO Circle" />
                        </div>
                        <div className="logo-text-wrap">
                           <span className="logo-text" style={{ color: '#0B1A4A' }}>Global CXO Circle</span>
                           <span className="logo-tagline">Leadership Ecosystem</span>
                        </div>
                     </span>
                  </Link>
               </div>
               <div className="tgmobile__search">
                  <form onSubmit={(e) => e.preventDefault()}>
                     <input type="text" placeholder="Search here..." />
                     <button><i className="fas fa-search"></i></button>
                  </form>
               </div>
               <div className="tgmobile__menu-outer">
                  <MobileMenus />
               </div>
            </nav>
         </div>
         <div onClick={() => setSidebar(false)} className="tgmobile__menu-backdrop"></div>

         <style jsx>{`
            .brand-mark-wrap-sidebar {
               display: flex;
               align-items: center;
               gap: 12px;
               text-decoration: none;
               padding: 20px 25px 0;
            }

            .logo-icon img {
               height: 42px;
               width: auto;
            }

            .logo-text-wrap {
               display: flex;
               flex-direction: column;
               justify-content: center;
               line-height: 1.1;
            }

            .logo-text {
               font-family: 'Plus Jakarta Sans', sans-serif;
               font-size: 18px;
               font-weight: 700;
               letter-spacing: -0.02em;
               text-transform: uppercase;
               color: #0B1A4A !important;
               display: inline-block;
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
               font-size: 9px;
               font-weight: 600;
               letter-spacing: 0.1em;
               text-transform: uppercase;
               color: #64748b;
               margin-top: 2px;
            }
         `}</style>
      </div>
   )
}

export default MobileSidebar