import axios from "axios";

export const getHelpCategories = async  () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/help-categories`);
    return response.data;
}