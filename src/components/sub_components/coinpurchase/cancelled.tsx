import Image from "next/image";
import Link from "next/link";

const CoinUsedUp = () => {
  return (
    <div className="flex items-center justify-center flex-col min-h-dvh">
      <Image
        src="/site/cancelled.svg"
        alt="404"
        width={300}
        height={300}
        className="block mb-5 h-auto w-[300px]"
      />
      <h1 className="text-2xl text-center font-bold mb-5">
        Points Has Been <br /> Added To Your Balance
      </h1>
      <div className="py-5">
        <Link
          href="/wallet"
          className=" block px-5 py-3 rounded-md bg-primary-dark-pink text-white font-medium"
        >
          Go to wallet
        </Link>
      </div>
    </div>
  );
};

export default CoinUsedUp;
