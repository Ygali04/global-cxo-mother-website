import Link from "next/link"

import bg_img from "@/assets/img/bg/breadcrumb__bg.jpg"

interface DataType {
   sub_title: string;
   title: string;
}

const BreadCrumb = ({ sub_title, title }: DataType) => {
   return (
      <section className="breadcrumb__area">
         <div className="breadcrumb__bg" style={{ backgroundImage: `url(${bg_img.src})` }}></div>
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="breadcrumb__content">
                     <h2 className="title">{title}</h2>
                     <nav className="breadcrumb">
                        <span property="itemListElement">
                           <Link href="/">Home</Link>
                        </span>
                        <span className="breadcrumb-separator"><i className="fas fa-angle-right"></i></span>
                        <span property="itemListElement">{sub_title}</span>
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default BreadCrumb
