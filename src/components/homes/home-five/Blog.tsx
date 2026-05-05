"use client"
import React from "react"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const events_data = [
    { id: 1, title: "CXO Leadership Summits", desc: "High-impact convening across CXO functions.", icon: "flaticon-target" },
    { id: 2, title: "Private Roundtables", desc: "Intimate, structured executive dialogue.", icon: "flaticon-partner" },
    { id: 3, title: "Executive Dinners", desc: "Relationship-first, curated small-group settings.", icon: "flaticon-diamond" },
    { id: 4, title: "Advisory Sessions", desc: "One-on-one and panel-based advisory formats.", icon: "flaticon-idea" },
    { id: 5, title: "Deal-Focused Interactions", desc: "Structured environments built for business outcomes.", icon: "flaticon-handshake" },
];

const Blog = () => {
   return (
      <section id="events" className="section-py-130" style={{ backgroundColor: "#fff" }}>
         <div className="container">
            <AnimateOnScroll>
               <div className="row justify-content-center text-center mb-60">
                  <div className="col-lg-8">
                     <span style={{ background: "linear-gradient(90deg, #0A3CC2, #B300B9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "13px", marginBottom: "12px", display: "inline-block" }}>Events & Programs</span>
                     <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "16px" }}>Not Events. Curated Environments.</h2>
                     <p style={{ fontSize: "17px", color: "var(--tg-body-color)" }}>Not events. Curated environments for meaningful outcomes.</p>
                  </div>
               </div>
            </AnimateOnScroll>
            
            <div className="row justify-content-center gutter-y-30">
               {events_data.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className="col-lg-4 col-md-6">
                     <AnimateOnScroll delay={idx * 0.1}>
                        <div className="event-card" style={{
                           background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid var(--tg-border-1)",
                           transition: "all 0.35s ease", height: "100%", display: "flex", flexDirection: "column",
                        }}>
                           <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #0A3CC2, #B300B9)", color: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "20px", transition: "transform 0.3s ease", boxShadow: "0 4px 16px rgba(123, 31, 255, 0.2)" }} className="event-icon">
                              <i className={item.icon}></i>
                           </div>
                           <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "12px" }}>{item.title}</h3>
                           <p style={{ fontSize: "14px", color: "var(--tg-body-color)", marginBottom: "24px", flex: 1 }}>{item.desc}</p>
                           <div style={{ display: "inline-block", background: "linear-gradient(90deg, rgba(10,60,194,0.08), rgba(179,0,185,0.08))", color: "var(--tg-theme-primary)", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, alignSelf: "flex-start" }}>
                              By Invitation
                           </div>
                        </div>
                     </AnimateOnScroll>
                  </div>
               ))}
            </div>

            <div className="row justify-content-center gutter-y-30 mt-4">
               {events_data.slice(3, 5).map((item, idx) => (
                  <div key={item.id} className="col-lg-4 col-md-6">
                     <AnimateOnScroll delay={(idx + 3) * 0.1}>
                        <div className="event-card" style={{
                           background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid var(--tg-border-1)",
                           transition: "all 0.35s ease", height: "100%", display: "flex", flexDirection: "column",
                        }}>
                           <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #0A3CC2, #B300B9)", color: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "20px", transition: "transform 0.3s ease", boxShadow: "0 4px 16px rgba(123, 31, 255, 0.2)" }} className="event-icon">
                              <i className={item.icon}></i>
                           </div>
                           <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "12px" }}>{item.title}</h3>
                           <p style={{ fontSize: "14px", color: "var(--tg-body-color)", marginBottom: "24px", flex: 1 }}>{item.desc}</p>
                           <div style={{ display: "inline-block", background: "linear-gradient(90deg, rgba(10,60,194,0.08), rgba(179,0,185,0.08))", color: "var(--tg-theme-primary)", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, alignSelf: "flex-start" }}>
                              By Invitation
                           </div>
                        </div>
                     </AnimateOnScroll>
                  </div>
               ))}
            </div>
            
            <style jsx>{`
               .event-card:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 12px 40px rgba(11,26,74,0.12);
                  border-color: var(--tg-theme-primary) !important;
               }
               .event-card:hover .event-icon {
                  transform: scale(1.08);
               }
            `}</style>
         </div>
      </section>
   )
}

export default Blog
