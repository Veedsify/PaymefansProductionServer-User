import ModelsPageSearch from "@/features/models/comps/ModelsPageSearch";
import ModelsSubscription from "@/features/models/comps/ModelsSubscription";
import { AllModelsProps, AuthUserProps } from "@/features/user/types/user";
import getSideModels from "@/utils/data/GetSideModels";
import getUserData from "@/utils/data/UserData";
import { LucideArrowUp, LucideSearch } from "lucide-react";

const ModelsPage = async () => {
    return (
        <>
            <div className="block p-4 md:p-8" >
                <div className="flex items-center mb-7  lg:hidden">
                    <span className="flex-shrink-0 text-xl font-bold">Models/Creators</span>
                </div>
                <ModelsPageSearch />
            </div>
        </>
    );
}

export default ModelsPage;