import { getToken } from "../Cookie";

interface PayForPostProps {
    price: number;
    postId: number;
}

const payForPost = async ({
    price,
    postId,
}: PayForPostProps) => {

    try {
        const token = getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                price,
                postId,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to process payment");
        }

        const data = await response.json();
        return data

    } catch (error: any) {
        console.error("Error during payment processing:", error);
        return {
            error: true,
            message: error.message || "An error occurred while processing the payment",
        };
    }


}

export default payForPost;
