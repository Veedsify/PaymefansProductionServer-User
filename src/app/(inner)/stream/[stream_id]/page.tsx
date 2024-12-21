"use client"
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import StreamDeck from '@/components/route_component/stream-deck';
import {streamDataProps} from '@/types/components';
import {useParams, useRouter} from 'next/navigation';
import {getToken} from '@/utils/cookie.get';

const Stream = () => {
    const params = useParams();
    const stream_id = params.stream_id;
    const router = useRouter();
    const [streamData, setStreamData] = useState<streamDataProps | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (stream_id) {
            const token = getToken();
            const fetchStreamData = async () => {
                try {
                    const response = await axios({
                        method: 'GET',
                        url: `${process.env.NEXT_PUBLIC_EXPRESS_URL}/live/host/${stream_id}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        setStreamData(response.data.data);
                    } else {
                        console.log('Error Happened', response.status);
                        router.push('/');
                    }
                } catch (error) {
                    console.log('Error Happened', error);
                    router.push('/');
                } finally {
                    setLoading(false);
                }
            };

            fetchStreamData();
        }
    }, [stream_id, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl">Loading...</p>
            </div>
        );
    }

    return (
        <>
            {streamData ? (
                <StreamDeck streamData={streamData}/>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-2xl">No stream data available.</p>
                </div>
            )}
        </>
    );
};

export default Stream;
