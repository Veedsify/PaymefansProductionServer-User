interface LinkDialogProps {
  showLinkDialog: boolean;
  tempLinkUrl: string;
  setTempLinkUrl: (url: string) => void;
  onCreateLink: () => void;
  onClose: () => void;
}

export const LinkDialog = ({
  showLinkDialog,
  tempLinkUrl,
  setTempLinkUrl,
  onCreateLink,
  onClose,
}: LinkDialogProps) => {
  if (!showLinkDialog) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[90] top-1/12">
      <div className="w-full max-w-sm p-8 mx-4 border shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl border-white/20">
        <h3 className="mb-6 text-xl font-bold text-gray-800">Add Link</h3>
        <input
          type="url"
          placeholder="Enter URL (e.g., https://example.com)"
          value={tempLinkUrl}
          onChange={(e) => setTempLinkUrl(e.target.value)}
          className="w-full p-4 mb-6 text-gray-800 border-2 border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <div className="flex gap-3">
          <button
            onClick={onCreateLink}
            disabled={!tempLinkUrl}
            className="flex-1 py-3 font-medium text-white shadow-lg bg-blue-500 disabled:bg-gray-300 rounded-xl hover:bg-blue-600 transition-all duration-200 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
          >
            Add Link
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 font-medium text-white shadow-lg bg-gray-400 rounded-xl hover:bg-gray-500 transition-all duration-200 transform hover:scale-105"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
