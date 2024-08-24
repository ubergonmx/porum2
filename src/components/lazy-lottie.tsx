"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@mantine/core";
import React, { CSSProperties, Suspense, useRef } from "react";
import { LottieRefCurrentProps } from "lottie-react";

const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.default),
  {
    ssr: false,
  },
);

interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  fallback?: React.ReactNode;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  loop = false,
  autoplay = false,
  style = { width: "100%", height: "100%" },
  fallback = <Skeleton height={style.height} width={style.width} />,
}) => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const handleMouseEnter = () => {
    lottieRef.current?.setSpeed(2);
    lottieRef.current?.goToAndPlay(0, true);
    lottieRef.current?.play();
  };

  return (
    <Suspense fallback={fallback}>
      <div onMouseEnter={handleMouseEnter} style={style}>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={loop}
          autoplay={autoplay}
          style={{ width: "100%", height: "100%" }}
          onComplete={() => console.log("COMPLETE")}
        />
      </div>
    </Suspense>
  );
};

export default LottiePlayer;
