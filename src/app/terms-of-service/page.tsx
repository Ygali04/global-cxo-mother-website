import TermsOfService from "@/components/pages/terms-of-service"
import Wrapper from "@/layouts/Wrapper"

export const metadata = {
  title: "Terms of Service | Global CXO Circle",
  description: "Read Global CXO Circle's Terms of Service to understand the rules governing your use of our website and services."
}

const TermsOfServicePage = () => {
  return (
    <Wrapper>
      <TermsOfService />
    </Wrapper>
  )
}

export default TermsOfServicePage
