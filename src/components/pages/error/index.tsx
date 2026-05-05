import HeaderFive from "@/layouts/headers/HeaderFive"
import ErrorArea from "./ErrorArea"
import FooterThree from "@/layouts/footers/FooterThree"

const NotFound = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <ErrorArea />
         </main>
         <FooterThree />
      </>
   )
}

export default NotFound
