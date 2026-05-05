import HeaderFive from "@/layouts/headers/HeaderFive";
import InsightsArea from "./InsightsArea";
import FooterThree from "@/layouts/footers/FooterThree";

const Insights = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <InsightsArea />
         </main>
         <FooterThree />
      </>
   )
}

export default Insights;
