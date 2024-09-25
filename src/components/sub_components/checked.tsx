"use client"
import { useEffect, useState } from "react";

const Toggle = ({ state, set }: { state?: boolean, set?: (value: boolean) => void }) => {
    const [isChecked, setIsChecked] = useState<boolean>(state || false);
    const [newId, setNewId] = useState(0);
    useEffect(() => {
        setIsChecked(state || false);
    }, [state]);

    useEffect(() => { setNewId(Math.floor(Math.random() * 100000)); }, []);

    const toggleSwitch = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        if (set) set(newValue);
    };

    return (
        <div>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={toggleSwitch}
                id={newId.toString()}
                className="hidden"
            />
            <label
                htmlFor={newId.toString()}
                className="flex items-center cursor-pointer duration-300"
            >
                <div className="relative">
                    <div className={`w-12 h-7 flex items-center outline outline-[1px] outline-gray-200 rounded-full shadow-inner dark:outline-slate-800 ${isChecked
                        ? "bg-primary-dark-pink"
                        : ""
                        } transition-transform duration-300`}>

                        <div
                            className={`w-[18px] h-[18px] bg-gray-200 ml-1 rounded-full insect-y-0 left-0 ${isChecked
                                ? "transform translate-x-full"
                                : ""
                                } transition-transform duration-300`}
                        ></div>
                    </div>
                </div>
            </label>
        </div>
    );
}

export default Toggle;
