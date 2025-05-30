import Image from "next/image";

const CoinProcessing = () => {
  return (
    <div className="flex items-center justify-center flex-col min-h-dvh">
      <Image
        src="/site/loading.svg"
        alt="404"
        width={300}
        height={300}
        className="block mb-5 h-auto w-[300px]"
      />
      <h1 className="text-3xl font-bold mb-5">Processing...</h1>
    </div>
  );
};

export default CoinProcessing;
