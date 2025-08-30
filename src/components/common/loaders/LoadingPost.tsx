const LoadingPost = () => {
    return (
        <>
            <div className="p-6 px-4">
                <div className="flex items-center mb-6 gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-24 h-2 bg-gray-300 animate-pulse"></div>
                </div>
                <div className="w-full h-2 mb-4 bg-gray-300 animate-pulse"></div>
                <div className="w-full h-2 mb-4 bg-gray-300 animate-pulse"></div>
                <div className="w-3/5 h-2 mb-4 bg-gray-300 animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="w-full mb-4 bg-gray-300 rounded-lg aspect-square animate-pulse"></div>
                    <div className="w-full mb-4 bg-gray-300 rounded-lg aspect-square animate-pulse"></div>
                    <div className="w-full mb-4 bg-gray-300 rounded-lg aspect-square animate-pulse"></div>
                </div>
            </div>
        </>
    );
}

export default LoadingPost;