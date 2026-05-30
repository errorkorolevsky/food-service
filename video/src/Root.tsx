import React from "react";
import { Composition, AbsoluteFill, Audio, staticFile, interpolate } from "remotion";
import { Timeline } from "./scenes";
import { FPS, TOTAL_FRAMES } from "./config/theme";
import { Format } from "./components";

const Movie: React.FC<{ format: Format }> = ({ format }) => {
  return (
    <AbsoluteFill>
      <Timeline format={format} />
      <Audio
        src={staticFile("audio/ambient.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, TOTAL_FRAMES - 50, TOTAL_FRAMES],
            [0, 0.32, 0.32, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Presentation16x9"
        component={Movie}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ format: "16x9" as Format }}
      />
      <Composition
        id="Presentation9x16"
        component={Movie}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ format: "9x16" as Format }}
      />
    </>
  );
};
