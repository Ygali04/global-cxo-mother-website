import Header from "@/layouts/headers/Header"
import Banner from "./Banner"
import About from "./About"
import Service from "./Service"
import UpcomingEvent from "./UpcomingEvent"
import Team from "./Team"
import FAQ from "./FAQ"
import Footer from "@/layouts/footers/Footer"

const HomePage = () => {
   return (
      <>
         <Header />
         <main className="main-area fix">
            <Banner />
            <About />
            <Service />
            <UpcomingEvent />
            <Team />
            <FAQ />
         </main>
         <Footer />
      </>
   )
}

export default HomePage
