import FollowersDisplay from "@/features/user/comps/FollowersDisplay";
import UserFollowComp from "@/features/user/comps/UserFollowComp";

function page() {
    return (
        <div className="p-2 md:p-4 md:pt-6">
            <FollowersDisplay />
        </div>
    );
}

export default page;