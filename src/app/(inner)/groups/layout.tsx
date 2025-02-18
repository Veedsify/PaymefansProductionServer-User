import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Groups",
    description: "Meet and Join Group Within Your Area"
}
const GroupsLayout = ({children}: { children: React.ReactNode }) => {
    return <>{children}</>
}

export default GroupsLayout