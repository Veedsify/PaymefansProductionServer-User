import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthUserProps } from '@/types/user';
import { getToken } from '@/utils/cookie.get';
import useDebounce from './debounce'; // Adjust the import path as necessary

const useCheckEmail = (user: AuthUserProps, emailcheck: string) => {
    const [canSave, setCanSave] = useState(false);
    const [message, setMessage] = useState("");

    const debouncedEmailCheck = useDebounce(emailcheck, 500); // Adjust the debounce delay as needed

    useEffect(() => {
        // if (!debouncedEmailCheck) return;

        const source = axios.CancelToken.source();

        const setUpEmailCheck = async () => {
            try {
                setCanSave(true);
                setMessage("");
                const token = getToken();
                const api = `${process.env.NEXT_PUBLIC_EXPRESS_URL}/users/check-email?email=${debouncedEmailCheck}`;

                const response = await axios.post(api, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    cancelToken: source.token
                });

                if (response.data.status) {
                    if (response.data.email == user?.email) {
                        setMessage("");
                        setCanSave(true);
                    } else {
                        setMessage("Email already exists");
                        setCanSave(false);
                    }
                } else {
                    setCanSave(true);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    console.error(error);
                }
            }
        };

        setUpEmailCheck();

        // Cleanup function to cancel the request if the component unmounts
        return () => {
            source.cancel("Operation canceled by the user.");
        };
    }, [user, debouncedEmailCheck]);

    return { canSave, message };
};

export default useCheckEmail;
