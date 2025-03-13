import ModelsPageSearch from "@/components/models/models-page-search";
import ModelsSubscription from "@/components/sub_components/models_subscription";
import { AllModelsProps, AuthUserProps } from "@/types/user";
import getSideModels from "@/utils/data/get-sidemodels";
import getUserData from "@/utils/data/user-data";
import { LucideArrowUp, LucideSearch } from "lucide-react";

const ModelsPage = async () => {
    return (
        <>
            <div className="block p-4 md:p-8" >
                <div className="flex items-center mb-7  lg:hidden">
                    <span className="font-bold text-xl flex-shrink-0">Models/Creators</span>
                </div>
                <ModelsPageSearch />
            </div>
        </>
    );
}

export default ModelsPage;