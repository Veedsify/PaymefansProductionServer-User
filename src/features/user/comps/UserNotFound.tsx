import Image from "next/image";

const UserNotFound = ({ userid }: { userid: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <Image
        src="/site/404user.svg"
        alt="404"
        width={300}
        height={300}
        className="block mb-5 h-auto w-[300px]"
      />
      <h1 className="mb-5 text-3xl font-bold dark:text-white">
        Sorry This Page Doesn&apos;t Exist
      </h1>
      <p className="dark:text-white">Page was not found</p>
    </div>
  );
};

export default UserNotFound;
