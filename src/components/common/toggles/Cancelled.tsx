import Image from "next/image";
import Link from "next/link";

const CoinUsedUp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <Image
        src="/site/cancelled.svg"
        alt="404"
        width={300}
        height={300}
        className="block mb-5 h-auto w-[300px]"
      />
      <h1 className="mb-5 text-2xl font-bold text-center">
        Points Has Been <br /> Added To Your Balance
      </h1>
      <div className="py-5">
        <Link
          href="/wallet"
          className="block px-5 py-3 font-medium text-white  rounded-md bg-primary-dark-pink"
        >
          Go to wallet
        </Link>
      </div>
    </div>
  );
};

export default CoinUsedUp;
