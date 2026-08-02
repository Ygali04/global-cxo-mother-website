import Header from "@/layouts/headers/Header"
import TermsOfServiceArea from "./TermsOfServiceArea"
import Footer from "@/layouts/footers/Footer"

const TermsOfService = () => {
   return (
      <>
         <Header />
         <main className="main-area fix">
            <TermsOfServiceArea />
         </main>
         <Footer />
      </>
   )
}

export default TermsOfService
