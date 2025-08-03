import Image from "next/image";

const CoinProcessing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <Image
        src="/site/loading.svg"
        alt="404"
        width={300}
        height={300}
        className="block mb-5 h-auto w-[300px]"
      />
      <h1 className="mb-5 text-3xl font-bold">Processing...</h1>
    </div>
  );
};

export default CoinProcessing;
