
interface PayForPostProps {
    price: number;
    postId: number;
}

const payForPost = async ({
    price,
    postId,
}: PayForPostProps) => {

    return {
        error: false,
        message: "Payment successful",
    }

}

export default payForPost;