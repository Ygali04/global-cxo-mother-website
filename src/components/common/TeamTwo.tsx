import Icon from "@/components/common/Icon"
import team_data from "@/data/TeamData"
import Image from "next/image"
import Link from "next/link"

const Team = () => {
   return (
      <section className="team__area-three section-pb-130">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-6">
                  <div className="section__title mb-50 mb-md-30">
                     <span className="sub-title">Core Team</span>
                     <h2 className="title">Our expert team of Professionals here for you</h2>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="section__content mb-50">
                     <p>Transform your business with oAs a app web crawler organizations adjust to the expanding significance of internet promoting. or lipsum yond.</p>
                  </div>
               </div>
            </div>
            <div className="row gutter-y-30 justify-content-center">
               {team_data.filter((items) => items.page === "home_2").map((item) => (
                  <div key={item.id} className="col-xl-3 col-lg-4 col-sm-6">
                     <div className="team__item-three">
                        <div className="team__thumb-three">
                           <Image src={item.thumb} alt="img" />
                        </div>
                        <div className="team__content-three">
                           <h2 className="title"><Link href="/team-details">{item.name}</Link></h2>
                           <span>{item.designation}</span>
                           <div className="team__social-three">
                              <ul className="list-wrap">
                                 <Icon />
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

export default Team
