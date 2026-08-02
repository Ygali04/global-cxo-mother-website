import Header from "@/layouts/headers/Header"
import ErrorArea from "./ErrorArea"
import Footer from "@/layouts/footers/Footer"

const NotFound = () => {
   return (
      <>
         <Header />
         <main className="main-area fix">
            <ErrorArea />
         </main>
         <Footer />
      </>
   )
}

export default NotFound
