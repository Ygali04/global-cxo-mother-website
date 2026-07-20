import Wrapper from "@/layouts/Wrapper"
import OptInForm from "./OptInForm"

export const metadata = {
  title: "Receive future updates | Global CXO Circle",
  description: "Opt-in to receive future news, event details, and updates from Global CXO Circle.",
  robots: {
    index: false,
    follow: false,
  },
}

const OptInPage = () => {
  return (
    <Wrapper>
      <OptInForm />
    </Wrapper>
  )
}

export default OptInPage
