import HeaderFive from "@/layouts/headers/HeaderFive"
import Banner from "./Banner"
// import WorkArea from "./WorkArea"
import About from "./About"
// import ChooseArea from "./ChooseArea"
import Service from "./Service"
import UpcomingEvent from "./UpcomingEvent"
// import Estimate from "./Estimate"
import Team from "./Team"
// import Blog from "./Blog"
// import Brand from "./Brand"
import FAQ from "./FAQ"
import FooterThree from "@/layouts/footers/FooterThree"

const HomeFive = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <Banner />
            {/* <WorkArea /> */}
            <About />
            {/* <ChooseArea /> */}
            <Service />
            <UpcomingEvent />
            {/* <Estimate /> */}
            <Team />
            {/* <Blog /> */}
            {/* <Brand /> */}
            <FAQ />
         </main>
         <FooterThree />
      </>
   )
}

export default HomeFive
