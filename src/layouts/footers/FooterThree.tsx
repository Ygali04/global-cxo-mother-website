"use client"
import Link from "next/link"

const FooterThree = () => {
   const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
      // Check if it's an anchor hash and we are on the homepage
      if (link.startsWith('/#') && typeof window !== 'undefined' && window.location.pathname === '/') {
         const targetId = link.substring(2);
         if (targetId) {
            e.preventDefault();
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', link);
         }
      }
   };

   return (
      <footer style={{
         backgroundColor: "#0B1A4A",
         paddingTop: "80px",
         color: "#fff",
      }}>
         <div className="container">
            <div className="row gutter-y-40" style={{ paddingBottom: "60px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
               <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
                  <Link href="/" style={{ display: "inline-block", marginBottom: "16px" }}>
                     <img src="/cxo-circle-white.png" alt="Global CXO Circle" style={{ height: "72px", width: "auto" }} />
                  </Link>
                  <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "320px" }}>
                     The premier ecosystem for executive alignment and enterprise outcomes.
                  </p>
               </div>
               
               <div className="col-lg-2 col-md-3 col-6">
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>Platform</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                     {[{ label: "How it Works", href: "/#how-it-works" }, { label: "The Framework", href: "/#cxo-concept" }, { label: "Circles", href: "/#circles" }].map((item, i) => (
                        <li key={i}><Link href={item.href} onClick={(e) => handleScroll(e, item.href)} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.3s" }} className="footer-link">{item.label}</Link></li>
                     ))}
                  </ul>
               </div>
               
               <div className="col-lg-2 col-md-3 col-6">
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>Ecosystem</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                     {[{ label: "Events", href: "/#events" }, { label: "Partners", href: "/#partners" }, { label: "Membership", href: "/#membership" }].map((item, i) => (
                        <li key={i}><Link href={item.href} onClick={(e) => handleScroll(e, item.href)} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.3s" }} className="footer-link">{item.label}</Link></li>
                     ))}
                  </ul>
               </div>



               <div className="col-lg-2 col-md-6 col-6">
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>Legal</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                     <li><Link href="/privacy-policy" style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }} className="footer-link">Privacy Policy</Link></li>
                     <li><Link href="/terms-of-service" style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }} className="footer-link">Terms of Service</Link></li>
                  </ul>
               </div>
            </div>

            <div style={{ padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
               <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>© {new Date().getFullYear()} Global CXO Circle. All rights reserved.</p>
               <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                   San Francisco, CA
               </div>
            </div>
         </div>
         <style jsx>{`
            .footer-link:hover {
               color: var(--tg-theme-primary) !important;
            }
         `}</style>
      </footer>
   )
}

export default FooterThree
