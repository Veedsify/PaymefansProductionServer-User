const LoadingPost = () => {
    return (
        <>
            <div className="p-6 px-4">
                <div className="flex gap-3 items-center mb-6">
                    <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-2 w-24 bg-gray-300 animate-pulse"></div>
                </div>
                <div className="h-2 w-full bg-gray-300 animate-pulse mb-4"></div>
                <div className="h-2 w-full bg-gray-300 animate-pulse mb-4"></div>
                <div className="h-2 w-3/5 bg-gray-300 animate-pulse mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-square w-full bg-gray-300 animate-pulse mb-4 rounded-lg"></div>
                    <div className="aspect-square w-full bg-gray-300 animate-pulse mb-4 rounded-lg"></div>
                    <div className="aspect-square w-full bg-gray-300 animate-pulse mb-4 rounded-lg"></div>
                </div>
            </div>
        </>
    );
}

export default LoadingPost;