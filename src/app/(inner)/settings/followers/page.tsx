import FollowersDisplay from "@/components/route_component/FollowersDisplay";
import UserFollowComp from "@/components/sub_components/UserFollowComp";

function page() {
    return (
        <div className="p-2 md:p-4 md:pt-6">
            <FollowersDisplay />
        </div>
    );
}

export default page;