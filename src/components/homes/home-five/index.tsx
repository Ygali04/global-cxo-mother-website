import HeaderFive from "@/layouts/headers/HeaderFive"
import Banner from "./Banner"
import WorkArea from "./WorkArea"
import About from "./About"
import ChooseArea from "./ChooseArea"
import Service from "./Service"
import Estimate from "./Estimate"
import Team from "./Team"
import Blog from "./Blog"
import Brand from "./Brand"
import Cta from "./Cta"
import FooterThree from "@/layouts/footers/FooterThree"

const HomeFive = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <Banner />
            <WorkArea />
            <About />
            <ChooseArea />
            <Service />
            <Estimate />
            <Team />
            <Blog />
            <Brand />
            <Cta />
         </main>
         <FooterThree />
      </>
   )
}

export default HomeFive
