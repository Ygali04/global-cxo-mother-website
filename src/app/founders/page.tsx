import Founders from "@/components/pages/founders";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
    title: "For Founders | Global CXO Circle",
    description: "Build with those who've been in the arena. Global CXO Circle offers hands-on partnership, a powerful network, and a framework designed to take you from breakthrough to scale.",
};

const FoundersPage = () => {
    return (
        <Wrapper>
            <Founders />
        </Wrapper>
    )
}

export default FoundersPage;
