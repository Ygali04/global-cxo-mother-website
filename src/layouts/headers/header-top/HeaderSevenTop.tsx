import Icon from "@/components/common/Icon"
import Link from "next/link"

const HeaderSevenTop = () => {
   return (
      <div className="tg-header__top">
         <div className="container custom-container-five">
            <div className="row align-items-center">
               <div className="col-lg-7">
                  <div className="tg-header__top-info">
                     <ul className="list-wrap">
                        <li><i className="flaticon-placeholder"></i>256 Avenue, Mark Street, NewYork City</li>
                        <li><i className="flaticon-envelope"></i><Link href="mailto:ram@100exnextgen.com">ram@100exnextgen.com</Link></li>
                     </ul>
                  </div>
               </div>
               <div className="col-lg-5">
                  <div className="tg-header__top-right">
                     <ul className="list-wrap">
                        <li><i className="flaticon-telephone"></i><Link href="tel:+919845845616">+91 98458 45616</Link></li>
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

export default HeaderSevenTop
