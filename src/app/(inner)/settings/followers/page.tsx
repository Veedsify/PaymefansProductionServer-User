import FollowersDisplay from "@/components/route_component/followers-display";
import UserFollowComp from "@/components/sub_components/userfollowcomp";

function page() {
    return (
        <div className="p-2 md:p-4 md:pt-6">
            <FollowersDisplay />
        </div>
    );
}

export default page;