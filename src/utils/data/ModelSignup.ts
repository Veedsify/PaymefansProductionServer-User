import axios, { AxiosResponse } from "axios";
import { getToken } from "../Cookie";

// Define proper interfaces for our data
interface ModelSignUpProps {
    firstname?: string;
    lastname?: string;
    dob?: string;
    country?: string;
    available?: string;
    audience?: string;
}

interface PaymentValidationResponse {
    error?: boolean;
    message?: string;
    status: boolean;
    errorTitle?: string;
}

/**
 * Handles model signup process
 * @param data The model signup data
 * @returns The API response
 */
const ModelSignup = async (data: ModelSignUpProps): Promise<AxiosResponse> => {
    const token = getToken();

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/models/signup`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Model signup failed:", error);
        throw error;
    }
};

/**
 * Validates a model payment and completes signup if successful
 * @param status Payment status
 * @param reference Payment reference 
 * @param modelData Model data for signup
 * @returns Validation response data
 */
export const ValidateModelPayment = async (
    status: string,
    reference: string,
    modelData: ModelSignUpProps
): Promise<PaymentValidationResponse> => {
    const token = getToken();

    try {
        // Validate the payment
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/models/validate-model-payment`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                    reference, // Added reference parameter that was unused before
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Payment validation failed with status: ${response.status}`);
        }

        const data: PaymentValidationResponse = await response.json();

        if (data.error) {
            throw new Error(data.message || "Payment validation error");
        }

        if (!data.status) {
            throw new Error("Payment not successful");
        }

        // If payment is successful, proceed with model signup
        const signupResponse = await ModelSignup(modelData);

        if (!signupResponse || signupResponse.status !== 200) {
            throw new Error("Model signup failed after successful payment");
        }

        return data;
    } catch (error: any) {
        return {
            error: true,
            status: false,
            message: error.message || "An error occurred during payment validation",
            errorTitle: "Payment validation error",
        }
    }
};
