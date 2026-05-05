import Icon from "@/components/common/Icon"
import InjectableSvg from "@/components/common/InjectableSvg"
import Link from "next/link"

import lock from "@/assets/img/icons/lock.svg"

const HeaderFourTop = () => {
   return (
      <div className="tg-header__top">
         <div className="container custom-container">
            <div className="row align-items-center">
               <div className="col-lg-7">
                  <div className="tg-header__top-info">
                     <ul className="list-wrap">
                        <li><i className="flaticon-placeholder"></i>Bangalore, India</li>
                        <li><i className="flaticon-envelope"></i><Link href="mailto:ram@100exnextgen.com">ram@100exnextgen.com</Link></li>
                     </ul>
                  </div>
               </div>
               <div className="col-lg-5">
                  <div className="tg-header__top-right">
                     <ul className="list-wrap">
                        <li className="log-in">
                           <Link href="/#contact"><InjectableSvg src={lock.src} alt="" className="injectable" />Log in</Link>
                        </li>
                        <li>
                           <div className="tg-header__top-social">
                              <ul className="list-wrap">
                                 <Icon />
                              </ul>
                           </div>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default HeaderFourTop
