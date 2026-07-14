import Image from "next/image";

const LoadingCustom = () => {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
      <Image
        alt="Panda run"
        src="/gif/panda-run.gif"
        width={240}
        height={240}
        unoptimized
      />
    </div>
  );
};

export default LoadingCustom;
