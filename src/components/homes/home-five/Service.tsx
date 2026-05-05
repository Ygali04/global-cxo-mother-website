"use client"
import Link from "next/link"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const Service = () => {
   const circles = [
      { id: 1, title: "Global CIO Circle", desc: "Chief Information Officers", icon: "flaticon-database" },
      { id: 2, title: "Global CTO Circle", desc: "Chief Technology Officers", icon: "flaticon-mobile-app" },
      { id: 3, title: "Global CISO Circle", desc: "Chief Information Security Officers", icon: "flaticon-protection" },
      { id: 4, title: "Global CFO Circle", desc: "Chief Financial Officers", icon: "flaticon-calculator" },
      { id: 5, title: "Global CRO Circle", desc: "Chief Revenue Officers", icon: "flaticon-growth" },
      { id: 6, title: "Global CEO Circle", desc: "Chief Executive Officers", icon: "flaticon-briefcase" },
      { id: 7, title: "Global Founder Circle", desc: "Founders & Entrepreneurs", icon: "flaticon-startup" },
   ];

   return (
      <section id="circles" className="section-py-130" style={{ backgroundColor: "#f7f8fc" }}>
         <div className="container">
            <AnimateOnScroll>
               <div className="row justify-content-center mb-60">
                  <div className="col-lg-7">
                     <div className="text-center">
                        <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "13px", marginBottom: "12px", display: "inline-block" }}>Our Ecosystem</span>
                        <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "16px" }}>Many Leadership Circles. One Global Ecosystem.</h2>
                     </div>
                  </div>
               </div>
            </AnimateOnScroll>
            <div className="row gutter-y-30 justify-content-center">
               {circles.map((item, idx) => (
                  <div key={item.id} className="col-xl-3 col-lg-4 col-md-6">
                     <AnimateOnScroll delay={idx * 0.08}>
                        <div className="circle-card" style={{
                           background: "#fff", padding: "32px 24px", borderRadius: "20px", border: "1px solid var(--tg-border-1)",
                           transition: "all 0.35s ease", height: "100%", position: "relative", overflow: "hidden",
                           textAlign: "center"
                        }}>
                           <div style={{
                              position: "absolute", top: 0, left: 0, right: 0,
                              height: "3px", background: "var(--tg-color-gradient)"
                           }} />

                           <div style={{ marginBottom: "20px", color: "var(--tg-theme-primary)", fontSize: "40px", transition: "transform 0.3s ease", display: "inline-block" }} className="icon-wrap">
                              <i className={item.icon}></i>
                           </div>
                           <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--tg-heading-color)", lineHeight: 1.3 }}>{item.title}</h3>
                           <p style={{ fontSize: "13px", color: "var(--tg-body-color)", marginBottom: 0 }}>{item.desc}</p>
                        </div>
                     </AnimateOnScroll>
                  </div>
               ))}
               
               {/* Featured CTA Card */}
               <div className="col-xl-3 col-lg-4 col-md-6">
                  <AnimateOnScroll delay={0.6}>
                     <div className="circle-card cta-card" style={{
                          background: "var(--tg-color-gradient)", padding: "32px 24px", borderRadius: "20px",
                          transition: "all 0.35s ease", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                          textAlign: "center"
                       }}>
                          <Link href="/circles" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                              Explore CIO Circle <span>→</span>
                          </Link>
                     </div>
                  </AnimateOnScroll>
               </div>
            </div>
            
            <AnimateOnScroll delay={0.3}>
               <div className="text-center mt-5">
                   <p style={{ fontSize: "18px", background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>One Global Ecosystem. Many Leadership Circles. Infinite Impact.</p>
               </div>
            </AnimateOnScroll>
            
            <style jsx>{`
               .circle-card:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 12px 40px rgba(11,26,74,0.12) !important;
                  border-color: var(--tg-theme-primary) !important;
               }
               .circle-card:hover .icon-wrap {
                   transform: scale(1.1);
               }
               .cta-card:hover {
                   filter: brightness(1.1);
               }
            `}</style>
         </div>
      </section>
   )
}

export default Service
