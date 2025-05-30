"use client";

import axiosInstance from "@/utils/Axios";
import { useRouter } from "next/navigation";

const LogoutButton = ({
  buttonNode,
  user,
}: {
  buttonNode: React.ReactNode;
  user: any;
}) => {
  const router = useRouter();
  const LogOut = async () => {
    document.cookie = `token=; expires=${new Date()}; path=/;`;
    await axiosInstance.post("/logout", { username: user?.username });
    router.push("/login");
  };

  return <button onClick={LogOut}>{buttonNode}</button>;
};

export default LogoutButton;
