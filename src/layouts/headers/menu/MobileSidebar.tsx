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
                     <img src="/cxo-circle-logo.png" alt="Global CXO Circle" style={{ height: "48px", width: "auto" }} />
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
      </div>
   )
}

export default MobileSidebar