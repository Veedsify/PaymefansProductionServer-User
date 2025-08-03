import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';

type PinMode = "verify" | "create";

interface VerifyWithdrawalPinProps {
    mode: PinMode;
    onClose: () => void;
    onVerify?: (pin: string) => void;
    onCreate?: (pin: string) => void;
    onForgotPin?: () => void;
    // Optionally: custom labels etc
}

const VerifyWithdrawalPin: React.FC<VerifyWithdrawalPinProps> = ({
    mode,
    onClose,
    onVerify,
    onCreate,
    onForgotPin
}) => {
    // Pin inputs
    const [pin, setPin] = useState<string[]>(["", "", "", ""]);
    // New pin (for confirmation step)
    const [newPin, setNewPin] = useState<string[]>(["", "", "", ""]);
    const [step, setStep] = useState<"create" | "confirm">("create");
    const [error, setError] = useState<string>("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Utility: Current working pin
    const isCreating = mode === "create";
    const currPin = isCreating && step === "create" ? newPin : pin;

    const setCurrPin = (val: string[]) => {
        if (isCreating && step === "create") setNewPin(val);
        else setPin(val);
    };

    // Clear current PIN inputs
    const clearCurrentPin = () => {
        setCurrPin(["", "", "", ""]);
        setError("");
        setTimeout(() => inputRefs.current[0]?.focus(), 10);
    };

    // Go back to create step (only for confirm step)
    const goBackToCreate = () => {
        setPin(["", "", "", ""]);
        setStep("create");
        setError("");
        setTimeout(() => inputRefs.current[0]?.focus(), 10);
    };

    // Handle input change
    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const updated = [...currPin];
        updated[index] = value;
        setCurrPin(updated);

        // Auto jump
        if (value !== "" && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Backspace jump
    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && currPin[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // When confirming for setting up
    const handleNextCreate = () => {
        const firstPin = newPin.join("");
        if (!/^\d{4}$/.test(firstPin)) {
            setError("Please enter all 4 digits");
            return;
        }
        setPin(["", "", "", ""]);
        setStep("confirm");
        setError("");
        setTimeout(() => inputRefs.current[0]?.focus(), 10);
    };

    // Confirm PIN creation
    const handleConfirmCreate = () => {
        const confirmedPin = pin.join("");
        if (!/^\d{4}$/.test(confirmedPin)) {
            setError("Please enter all 4 digits");
            return;
        }
        if (newPin.join("") !== confirmedPin) {
            setError("PINs do not match");
            return;
        }
        setError("");
        onCreate?.(confirmedPin);
    };

    // Verify PIN usage
    const handleVerify = () => {
        const fullPin = pin.join("");
        if (fullPin.length !== 4) {
            setError("Please enter all 4 digits");
            return;
        }
        setError("");
        onVerify?.(fullPin);
    };

    // Modal labels
    const isConfirmStep = isCreating && step === "confirm";

    const titles = {
        verify: "Enter Withdrawal PIN",
        create: isConfirmStep ? "Confirm your PIN" : "Set Up Withdrawal PIN",
    };
    const subtitles = {
        verify: "Please enter your 4-digit PIN to proceed.",
        create: isConfirmStep
            ? "Re-enter your PIN to confirm."
            : "Create a secure 4-digit withdrawal PIN.",
    };
    const buttonLabels = {
        verify: "Confirm",
        create: isConfirmStep ? "Confirm PIN" : "Next",
    };

    // Button handler
    const handleAction = () => {
        if (mode === "verify") handleVerify();
        else if (step === "create") handleNextCreate();
        else if (step === "confirm") handleConfirmCreate();
    };

    // Reset modal state on close
    const closeModal = () => {
        setPin(["", "", "", ""]);
        setNewPin(["", "", "", ""]);
        setStep("create");
        setError("");
        onClose();
    };

    // Check if current pin has any values
    const hasCurrentPinValues = currPin.some(digit => digit !== "");

    return (
        <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center"
            onClick={closeModal}
        >
            <motion.div
                className="relative flex items-center justify-center w-full bg-white h-dvh lg:h-auto lg:max-w-md lg:rounded-2xl"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <span className='absolute cursor-pointer top-4 right-4'>
                    <X className=" text-primary-dark-pink"
                        onClick={closeModal}
                    />
                </span>
                <div className="w-full max-w-xs p-6 py-10">
                    <h3 className="mb-4 text-xl font-semibold text-center text-primary-900">
                        {mode === "verify" ? titles.verify : titles.create}
                    </h3>
                    <p className="mb-6 text-center text-gray-500">{mode === "verify" ? subtitles.verify : subtitles.create}</p>

                    <div className="mb-6">
                        <div className="flex justify-center mb-3 gap-2">
                            {[0, 1, 2, 3].map((i) => (
                                <input
                                    key={i}
                                    ref={(el: any) => inputRefs.current[i] = el}
                                    type="password"
                                    maxLength={1}
                                    value={currPin[i]}
                                    onChange={e => handlePinChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-12 text-2xl font-bold text-center border-2 rounded-lg outline-none border-primary-300 focus:border-primary-dark-pink focus:ring-1 focus:ring-primary-dark-pink"
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                            ))}
                        </div>

                        {/* Clear PIN button - only show if there are values */}
                        {hasCurrentPinValues && (
                            <div className="flex justify-center mb-2">
                                <button
                                    type="button"
                                    onClick={clearCurrentPin}
                                    className="flex items-center text-sm font-medium text-gray-500 gap-1 hover:text-primary-dark-pink transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    Clear PIN
                                </button>
                            </div>
                        )}

                        {/* Back button for confirm step */}
                        {isConfirmStep && (
                            <div className="flex justify-center mb-2">
                                <button
                                    type="button"
                                    onClick={goBackToCreate}
                                    className="text-sm font-medium text-gray-500 hover:text-primary-dark-pink transition-colors"
                                >
                                    ← Back to create PIN
                                </button>
                            </div>
                        )}

                        <p className="h-5 mt-2 text-sm text-center text-red-500">{error}</p>
                    </div>

                    <button
                        className="w-full py-3 mb-2 font-bold text-white rounded-lg bg-primary-dark-pink hover:bg-primary-text-dark-pink transition"
                        type="button"
                        onClick={handleAction}
                    >
                        {mode === "verify"
                            ? buttonLabels.verify
                            : buttonLabels.create}
                    </button>

                    {/* Only show forgot pin on verify mode */}
                    {mode === "verify" && (
                        <button
                            className="w-full py-2 font-medium text-primary-dark-pink"
                            type="button"
                            onClick={() => onForgotPin?.()}
                        >
                            Forgot PIN?
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyWithdrawalPin;