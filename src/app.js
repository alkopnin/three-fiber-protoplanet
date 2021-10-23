import React from "react";

import { Canvas } from '@react-three/fiber';

import Particles from "./particles";

const cameraX = 0;
const cameraY = 120;
const cameraZ = 400;

const SURFACE_RADIUS = 300;
const SURFACE_HEIGHT = 8;

const PARTICLES_GRAVITY = 100.0;
const PARTICLES_DENSITY = 0.45;

const PARTICLES_VELOCITY = {
  exponent: 0.4,
  maxMass: 15.0,
  maxVel: 70,
  velExponent: 0.2,
  randVel: 0.001,
};

export default function App() {
  const cameraParams = {
    fov: 75, 
    near: 5, 
    far: 15000, 
    position: [cameraX, cameraY, cameraZ]
  }

  return (
    <div id="canvas-container">
      <Canvas
        camera={cameraParams}>
        <ambientLight intensity={0.1} />
        <Particles 
          surfaceRadius={SURFACE_RADIUS}
          surfaceHeight={SURFACE_HEIGHT}
          particlesGravity={PARTICLES_GRAVITY}
          particlesDensity={PARTICLES_DENSITY}
          particlesVelocity={PARTICLES_VELOCITY}
        />
      </Canvas>
    </div>
  )
}