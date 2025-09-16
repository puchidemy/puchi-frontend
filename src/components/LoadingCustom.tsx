import Image from "next/image";

const LoadingCustom = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <Image
        alt="Panda run"
        src="/gif/panda-run.gif"
        width={240}
        height={240}
      />
    </div>
  );
};

export default LoadingCustom;
