import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthUserProps } from '@/types/user';
import { getToken } from '@/utils/cookie.get';
import useDebounce from './debounce'; // Adjust the import path as necessary
const useCheckUsername = (user: AuthUserProps, usernameCheck: string) => {
    const [canSave, setCanSave] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const debouncedUsernameCheck = useDebounce(usernameCheck, 300); // Adjust the debounce delay as needed
    const RunCheckUsername = useCallback(() => {
        // if (!debouncedUsernameCheck) return;
        const source = axios.CancelToken.source();
        const setUpUsernameCheck = async () => {
            try {
                setCanSave(true);
                setMessage("");
                const token = getToken();
                const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/settings/check-username?username=${debouncedUsernameCheck}`;
                if (user.username === debouncedUsernameCheck) {
                    setCanSave(true);
                    return;
                }
                const response = await axios.post(api, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    cancelToken: source.token
                });
                if (response.data.status) {
                    setError(false);
                    setCanSave(true);
                } else {
                    setMessage("Username already exists");
                    setError(true);
                    setCanSave(false);
                }
            } catch (error: any) {
                setError(true);
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    console.error(error);
                }
            }
        };
        setUpUsernameCheck();
        // Cleanup function to cancel the request if the component unmounts
        return () => {
            source.cancel("Operation canceled by the user.");
        };
    }, [user, debouncedUsernameCheck]);
    useEffect(() => RunCheckUsername(), [RunCheckUsername])
    return { canSave, message, error };
};
export default useCheckUsername;
