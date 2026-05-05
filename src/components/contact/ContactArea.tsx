import Link from "next/link"
import ContactForm from "@/components/common/ContactForm"

const ContactArea = () => {
   return (
      <section className="contact__area">
         <div className="container">
            <div className="row">
               <div className="col-lg-6">
                  <div className="contact__info-wrap">
                     <div className="contact__info-item">
                        <h4 className="title">NewYork City</h4>
                        <p>14 West Arnold St. New York, NY 10002</p>
                        <ul className="list-wrap">
                           <li>
                              <Link href="tel:0123456789">(+1) 123-456-3389</Link>
                           </li>
                           <li>
                              <Link href="mailto:explore@100exnextgen.com">explore@100exnextgen.com</Link>
                           </li>
                        </ul>
                        <div className="shape">
                           <svg xmlns="http://www.w3.org/2000/svg" width="174" height="210" viewBox="0 0 174 210" fill="none">
                              <path d="M168.636 86.8182C168.636 150.455 86.8182 205 86.8182 205C86.8182 205 5 150.455 5 86.8182C5 65.1187 13.6201 44.3079 28.964 28.964C44.3079 13.6201 65.1187 5 86.8182 5C108.518 5 129.328 13.6201 144.672 28.964C160.016 44.3079 168.636 65.1187 168.636 86.8182Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M86.8182 114.091C101.88 114.091 114.091 101.88 114.091 86.8182C114.091 71.7559 101.88 59.5455 86.8182 59.5455C71.7559 59.5455 59.5455 71.7559 59.5455 86.8182C59.5455 101.88 71.7559 114.091 86.8182 114.091Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        </div>
                     </div>
                     <div className="contact__info-item">
                        <h4 className="title">France</h4>
                        <p>6580 Allison Turnpike, AL 32808-4509</p>
                        <ul className="list-wrap">
                           <li>
                              <Link href="tel:0123456789">(+1) 123-456-3389</Link>
                           </li>
                           <li>
                              <Link href="mailto:explore@100exnextgen.com">explore@100exnextgen.com</Link>
                           </li>
                        </ul>
                        <div className="shape">
                           <svg xmlns="http://www.w3.org/2000/svg" width="174" height="210" viewBox="0 0 174 210" fill="none">
                              <path d="M168.636 86.8182C168.636 150.455 86.8182 205 86.8182 205C86.8182 205 5 150.455 5 86.8182C5 65.1187 13.6201 44.3079 28.964 28.964C44.3079 13.6201 65.1187 5 86.8182 5C108.518 5 129.328 13.6201 144.672 28.964C160.016 44.3079 168.636 65.1187 168.636 86.8182Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M86.8182 114.091C101.88 114.091 114.091 101.88 114.091 86.8182C114.091 71.7559 101.88 59.5455 86.8182 59.5455C71.7559 59.5455 59.5455 71.7559 59.5455 86.8182C59.5455 101.88 71.7559 114.091 86.8182 114.091Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        </div>
                     </div>
                     <div className="contact__info-item">
                        <h4 className="title">Italy City</h4>
                        <p>14 West Arnold St. New York, NY 10002</p>
                        <ul className="list-wrap">
                           <li>
                              <Link href="tel:0123456789">(+1) 123-456-3389</Link>
                           </li>
                           <li>
                              <Link href="mailto:explore@100exnextgen.com">explore@100exnextgen.com</Link>
                           </li>
                        </ul>
                        <div className="shape">
                           <svg xmlns="http://www.w3.org/2000/svg" width="174" height="210" viewBox="0 0 174 210" fill="none">
                              <path d="M168.636 86.8182C168.636 150.455 86.8182 205 86.8182 205C86.8182 205 5 150.455 5 86.8182C5 65.1187 13.6201 44.3079 28.964 28.964C44.3079 13.6201 65.1187 5 86.8182 5C108.518 5 129.328 13.6201 144.672 28.964C160.016 44.3079 168.636 65.1187 168.636 86.8182Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M86.8182 114.091C101.88 114.091 114.091 101.88 114.091 86.8182C114.091 71.7559 101.88 59.5455 86.8182 59.5455C71.7559 59.5455 59.5455 71.7559 59.5455 86.8182C59.5455 101.88 71.7559 114.091 86.8182 114.091Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="contact__form-wrap">
                     <h2 className="title">Leave Us A Message</h2>
                     <ContactForm />
                     <p className="ajax-response mb-0"></p>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default ContactArea
