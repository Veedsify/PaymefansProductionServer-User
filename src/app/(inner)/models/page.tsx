import ModelsPageSearch from "@/features/models/comps/ModelsPageSearch";

const ModelsPage = async () => {
  return (
    <>
      <div className="block p-4 md:p-8">
        <div className="flex items-center mb-7  lg:hidden">
          <span className="flex-shrink-0 text-xl font-bold">
            Models/Creators
          </span>
        </div>
        <ModelsPageSearch />
      </div>
    </>
  );
};

export default ModelsPage;
