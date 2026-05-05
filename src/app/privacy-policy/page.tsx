import PrivacyPolicy from "@/components/pages/privacy-policy"
import Wrapper from "@/layouts/Wrapper"

export const metadata = {
  title: "Privacy Policy | Global CXO Circle",
  description: "Read Global CXO Circle's Privacy Policy to understand how we collect, use, and protect your personal information."
}

const PrivacyPolicyPage = () => {
  return (
    <Wrapper>
      <PrivacyPolicy />
    </Wrapper>
  )
}

export default PrivacyPolicyPage
