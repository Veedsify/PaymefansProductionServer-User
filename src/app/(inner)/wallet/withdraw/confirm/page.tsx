"use client";
const WithdrawConfirmPage = () => {
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Confirm Withdrawal
      </h2>
      <p className="mb-6 text-center text-gray-700">
        Your withdrawal request is pending confirmation. Please review the
        details below before proceeding.
      </p>
      {/* Example details, replace with real data */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Amount:</span>
          <span>$100.00</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">To Account:</span>
          <span>****1234</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Fee:</span>
          <span>$2.00</span>
        </div>
      </div>
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
      >
        Confirm Withdrawal
      </button>
      <button
        className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
      >
        Cancel
      </button>
    </div>
  </div>;
};

export default WithdrawConfirmPage;
