import HeaderFive from "@/layouts/headers/HeaderFive"
import TermsOfServiceArea from "./TermsOfServiceArea"
import FooterThree from "@/layouts/footers/FooterThree"

const TermsOfService = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <TermsOfServiceArea />
         </main>
         <FooterThree />
      </>
   )
}

export default TermsOfService
