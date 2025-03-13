import StoryComponent from "@/components/story/story-component";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Story",
    description: "Add to your story",
}

const StoryPage = () => {
    return (
        <div className="relative p-2 md:p-5">
            <h1 className="md:text-lg max-w-[550px] mx-auto font-semibold mb-3 dark:text-white">
                Add to your story
            </h1>
            <p className="mb-10 max-w-[550px] mx-auto dark:text-white">
                stories stay live for 24 hours
            </p>
            <StoryComponent />
        </div>
    );
}

export default StoryPage;