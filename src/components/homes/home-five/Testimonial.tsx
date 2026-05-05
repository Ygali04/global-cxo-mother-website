"use client"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'

const testimonials = [
   {
      quote: "I never thought org design and business strategy in a structured approach can impact the business big time. Engagement with 100exNextGen did lot of good things to my company. EON's scaling journey for 5x is made possible by 100exNextGen.",
      name: "Johnson Lewis",
      role: "Founder & CEO, EON Elevators Private Limited"
   },
   {
      quote: "We have had a rewarding partnership with 100exNextGen in setting up a foundational framework for scaling up. 10exNextGen is our go to team to conduct periodic survey and get various dimensions of insight that has helped strengthened our customer's business practices.",
      name: "Sridhar Rajagopal",
      role: "Chairman, ReDefine Group of Companies"
   },
   {
      quote: "\"Extreme clarity in our approach towards achieving org-wide targets\" - is made possible by 100exNextGen. The problem solving and growth hacking aspects they bring to the table is commendable. Their implementation approach is well complemented with unrelenting support from experienced professionals.",
      name: "Kumar Ramalingam",
      role: "Founder & CEO, Telaverge Communications"
   },
   {
      quote: "My company transitioned from long monthly business reviews to sharp 60-min OKR led reviews with 100exNextGen. Their expert guidance on OKR strategy to execution has helped us streamline our company operating system.",
      name: "Balamurugan",
      role: "Founder, MeruWell Private Limited"
   },
];

const Testimonial = () => {
   return (
      <section className="section-py-130" style={{ backgroundColor: "#FFFFFF" }}>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-8 col-lg-9">
                  <div className="text-center" style={{ marginBottom: "50px" }}>
                     <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "13px", marginBottom: "12px", display: "inline-block" }}>Testimonials</span>
                     <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.5px" }}>What Our Partners Say</h2>
                  </div>
               </div>
            </div>
            <div className="row justify-content-center">
               <div className="col-xl-12">
                  <div style={{ position: "relative", padding: "0 20px" }}>
                     <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        navigation={{ nextEl: ".testi-next", prevEl: ".testi-prev" }}
                        loop={true}
                        breakpoints={{
                           768: { slidesPerView: 2 },
                           1200: { slidesPerView: 2 }
                        }}
                     >
                        {testimonials.map((item, i) => (
                           <SwiperSlide key={i} style={{ height: "auto" }}>
                              <div style={{
                                 background: "#F9F9F9", padding: "40px", borderRadius: "16px", border: "1px solid #f0f0f0",
                                 height: "100%", display: "flex", flexDirection: "column", transition: "all 0.3s ease",
                                 position: "relative"
                              }}>
                                 <div style={{ fontSize: "60px", color: "rgba(0,0,0,0.05)", position: "absolute", top: "20px", right: "30px", lineHeight: 1, fontFamily: "serif" }}>❞</div>

                                 <div style={{ flex: 1, marginBottom: "30px" }}>
                                    {/* Quote styling */}
                                    <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#444", fontWeight: 400 }}>
                                       {item.quote.startsWith('"') ? item.quote : `"${item.quote}"`}
                                    </p>
                                 </div>

                                 <div style={{ display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "20px" }}>
                                    <div style={{ width: "50px", height: "50px", background: "var(--tg-color-gradient)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                                       {item.name.charAt(0)}
                                    </div>
                                    <div>
                                       <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "4px" }}>{item.name}</h4>
                                       <span style={{ fontSize: "13px", color: "#666", lineHeight: 1.4, display: "block" }}>{item.role}</span>
                                    </div>
                                 </div>
                              </div>
                           </SwiperSlide>
                        ))}
                     </Swiper>
                     <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "40px" }}>
                        <button className="testi-prev" style={{
                           width: "48px", height: "48px", borderRadius: "50%", border: "1px solid #eee", background: "#fff",
                           cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease",
                           boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                        }}>
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button className="testi-next" style={{
                           width: "48px", height: "48px", borderRadius: "50%", background: "var(--tg-color-gradient)", border: "none",
                           cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease",
                           boxShadow: "0 4px 12px rgba(10,60,194,0.3)"
                        }}>
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Testimonial
