import HeaderFive from "@/layouts/headers/HeaderFive"
import PrivacyPolicyArea from "./PrivacyPolicyArea"
import FooterThree from "@/layouts/footers/FooterThree"

const PrivacyPolicy = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <PrivacyPolicyArea />
         </main>
         <FooterThree />
      </>
   )
}

export default PrivacyPolicy
