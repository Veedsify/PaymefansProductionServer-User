import axios from "axios";
import StreamDeck from "@/components/route_component/stream-deck";
// import { streamDataProps } from "@/types/components";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Stream = async ({
  params,
}: {
  params: Promise<{ stream_id: string }>;
}) => {
  const stream_id = (await params).stream_id;
  const token = (await cookies()).get("token")?.value;

  const fetchStreamData = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_EXPRESS_URL}/live/host/${stream_id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return response.data.data;
      } else {
        console.log("Error Happened", response.status);
        redirect("/");
      }
    } catch (error) {
      console.log("Error Happened", error);
      redirect("/");
    }
  };

  const streamData = await fetchStreamData();

  return (
    <>
      {streamData ? (
        <StreamDeck streamData={streamData} />
      ) : (
        <div className="flex justify-center items-center h-screen">
          <p className="text-2xl">No stream data available.</p>
        </div>
      )}
    </>
  );
};

export default Stream;
