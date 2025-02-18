"use client"

import { ChangeEvent, useState } from "react";

const WithDrawInput = () => {
    const [value, setValue] = useState('');

    // Format the input value with commas
    const formatNumber = (num: string) => {
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Handle input change
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Remove any non-digit characters
        let inputValue = e.target.value.replace(/\D/g, '');
        setValue(formatNumber(inputValue));
    };

    function removeStringsAndFee(value: string) {
        let num = value.replace(/\D/g, '');
        return (parseInt(num) * 0.20).toLocaleString();
    }

    function balanceToSettle(value: string) {
        let num = value.replace(/\D/g, '');
        return ((parseInt(num) * 0.80)).toLocaleString();
    }

    return (
        <div>
            <div className="flex gap-2 items-start mb-3">
                <div className="text-4xl">
                    ₦
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        pattern="[0-9]*"
                        placeholder="0" className="w-full text-6xl md:text-9xl p-0 font-bold border-none outline-none" />
                </div>
            </div>
            {value && (
                <div className="mb-6">
                    <div className="flex justify-between border-b py-4 mb-3">
                        <p className="text-xl font-semibold">
                            Amount requested
                        </p>
                        <p className="text-xl font-medium">
                            ₦ {value}
                        </p>
                    </div>
                    <div className="flex justify-between py-2">
                        <p className="text-xl">
                            Platfrom Fee
                        </p>
                        <p className="text-xl font-medium">
                            ₦ {removeStringsAndFee(value)}
                        </p>
                    </div>
                    <div className="flex justify-between py-2">
                        <p className="text-xl">
                            Amount to withdraw
                        </p>
                        <p className="text-xl font-medium">
                            ₦ {balanceToSettle(value)}
                        </p>
                    </div>
                </div>
            )}

            {value && (
                <div className="mt-5">
                    <button className="bg-black font-bold uppercase text-white w-full py-4 rounded-md">
                        Withdraw
                    </button>
                </div>
            )}
        </div>
    );
}

export default WithDrawInput;