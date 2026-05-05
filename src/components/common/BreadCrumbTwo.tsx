import Link from "next/link"

const BreadCrumbTwo = () => {
   return (
      <section className="breadcrumb__area-two">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-8">
                  <div className="breadcrumb__content breadcrumb__content-two">
                     <h2 className="title">Join Our Team of Innovators <br /> and Problem Solvers</h2>
                     <nav className="breadcrumb">
                        <span property="itemListElement">
                           <Link href="/">Home</Link>
                        </span>
                        <span className="breadcrumb-separator"><i className="fas fa-angle-right"></i></span>
                        <span property="itemListElement">Career</span>
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default BreadCrumbTwo
