import React from "react";
import { Composition, AbsoluteFill, Audio, staticFile, interpolate } from "remotion";
import { Timeline } from "./scenes";
import { TimelineV2 } from "./scenes/v2";
import { FPS, TOTAL_FRAMES, TOTAL_FRAMES_V2 } from "./config/theme";
import { Format } from "./components";

const AmbientAudio: React.FC<{ total: number }> = ({ total }) => (
  <Audio
    src={staticFile("audio/ambient.wav")}
    volume={(f) =>
      interpolate(f, [0, 30, total - 50, total], [0, 0.32, 0.32, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    }
  />
);

const Movie: React.FC<{ format: Format }> = ({ format }) => (
  <AbsoluteFill>
    <Timeline format={format} />
    <AmbientAudio total={TOTAL_FRAMES} />
  </AbsoluteFill>
);

const MovieV2: React.FC<{ format: Format }> = ({ format }) => (
  <AbsoluteFill>
    <TimelineV2 format={format} />
    <AmbientAudio total={TOTAL_FRAMES_V2} />
  </AbsoluteFill>
);

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
      <Composition
        id="Presentation16x9V2"
        component={MovieV2}
        durationInFrames={TOTAL_FRAMES_V2}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ format: "16x9" as Format }}
      />
      <Composition
        id="Presentation9x16V2"
        component={MovieV2}
        durationInFrames={TOTAL_FRAMES_V2}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ format: "9x16" as Format }}
      />
    </>
  );
};
