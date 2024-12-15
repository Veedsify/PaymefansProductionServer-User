import axios, {AxiosResponse} from "axios";

const FetchUserSubscriptions = async (url: string, token: string) => {
    let response: Promise<AxiosResponse<any, any>>;
    response = axios.get(url, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    return response
}

export default FetchUserSubscriptions;