"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const Page404 = () => {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown === 0) {
      window.history.back();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="container">
      <Image
        src="/images/page/page-404.png"
        alt="404 Not Found"
        width={448}
        height={224}
        className="image"
      />
      <h1>404 - Page Not Found</h1>
      <p>Oops! This page does not exist.</p>
      <div className="countdown">
        Returning in <strong>{countdown}</strong> seconds...
      </div>
      <button className="button" onClick={() => window.history.back()}>
        Go Back Now
      </button>
    </div>
  );
};

export default Page404;
