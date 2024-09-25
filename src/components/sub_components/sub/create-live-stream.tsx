"use client"
import { useLivestreamStore } from "@/contexts/livestream-context";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { socket2 } from "./socket";

const CreateLiveStream = () => {
     const [title, setTitle] = useState('');
     const { setIsLive, setStreamData } = useLivestreamStore()
     const router = useRouter();

     useEffect(() => {

          socket2.on('test-back', (data) => {
               console.log(data);
          });
          socket2.emit('test', { room: 'live' });
     }, []);

     const handleCreateLiveStream = async (e: FormEvent) => {
          e.preventDefault();
          if (!title) return;
          try {
               const token = getToken();
               const res = await axiosInstance.post('/live/live-stream/create', { title }, {
                    headers: {
                         'Content-Type': 'application/json',
                         "Authorization": `Bearer ${token}`
                    }
               });
               // console.log(res.data);
               if (res.data.status === 'success' && res.data.data) {
                    setStreamData({
                         title: title,
                         userId: res.data.data.user_stream_id,
                         callId: res.data.data.callId,
                         streamId: res.data.data.stream_id,
                         token: res.data.data.stream_token,
                         name: res.data.data.name
                    })
                    setIsLive(false);
                    toast.success('Live session created successfully');
                    window.location.href = (`/stream/${res.data.data.stream_id}`);
               } else {
                    swal({
                         title: "Failed to create live stream",
                         icon: "error",
                         text: res.data.message
                    })
               }

          } catch (error) {
               toast.error('Failed to create live stream');
               console.log(error);
          }
     }

     return (
          <form action="/live/stream/1" onSubmit={handleCreateLiveStream}>
               <input type="text"
                    onChange={(e) => setTitle(e.target.value)}
                    className="block px-3 py-3 mb-4 text-sm bg-gray-300 outline-none bg-opacity-20 rounded-xl w-[320px] md:w-[450px]" placeholder="Title for your live session..." />
               <input type="submit" value="GO LIVE" className="block p-2 mx-auto text-sm font-bold text-black bg-white rounded-lg cursor-pointer w-52 mb-5" />
          </form>
     );
}

export default CreateLiveStream;