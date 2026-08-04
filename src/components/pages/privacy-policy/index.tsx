import Header from "@/layouts/headers/Header"
import PrivacyPolicyArea from "./PrivacyPolicyArea"
import Footer from "@/layouts/footers/Footer"

const PrivacyPolicy = () => {
   return (
      <>
         <Header />
         <main className="main-area fix">
            <PrivacyPolicyArea />
         </main>
         <Footer />
      </>
   )
}

export default PrivacyPolicy
