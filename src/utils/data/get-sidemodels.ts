import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getSideModels = async ({ limit }: { limit?: number }) => {
  const token = (await cookies()).get('token')
  if (!token?.value || token.value == "") redirect("/login");
  const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/models/all`, {
    method: "POST",
    body: JSON.stringify({
      limit,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  });
  if (res.ok) {
    const { models } = await res.json();
    return models;
  }
};

export default getSideModels;
