import Advisors from "@/components/pages/advisors";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
    title: "For Advisors | Global CXO Circle",
    description: "Shape the future you see coming. Join Global CXO Circle's advisory board and co-create the playbook for the next generation of exponential ventures.",
};

const AdvisorsPage = () => {
    return (
        <Wrapper>
            <Advisors />
        </Wrapper>
    )
}

export default AdvisorsPage;
