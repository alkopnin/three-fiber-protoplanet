import { useState } from "react";

import ParticlesVelocity from "./particlesVelocity";
import ParticlesGeometry from "./particlesGeometry";

const WIDTH = 64;
const PARTICLES_COUNT = WIDTH * WIDTH;

const getRandomPositions = (particlesCount, radius) => {
  const positions = new Array( particlesCount * 3 );

  let p = 0;
  for ( let i = 0; i < particlesCount; i ++ ) {
    positions[ p++ ] = ( Math.random() * 2 - 1 ) * radius;
    positions[ p++ ] = 0;
    positions[ p++ ] = ( Math.random() * 2 - 1 ) * radius;
  }
  return new Float32Array(positions);
}

const getRandomUVs = (particlesCount, width) => {
  const uvs = new Array( particlesCount * 2 );
  let p = 0;
  
  for(let j = 0; j < width; j ++ ) {
    for(let i = 0; i < width; i ++ ) {
        uvs[ p++ ] = i / (width - 1 );
        uvs[ p++ ] = j / (width - 1 );
    }
  }
  return new Float32Array(uvs);
}


/**
 *    [in] surfaceRadius - the radius of the particles' layout 
 *    [in] surfaceHeight - the height of the particles' layout 
 *    [in] particlesGravity - ??
 *    [in] particlesDensity - ??
 *    [in] particlesVelocity - ??
 */
const Particles = (props) => {
  
  const [uvs] = useState(
    () => getRandomUVs(PARTICLES_COUNT, WIDTH));

  const [positions] = useState(
    () => getRandomPositions(PARTICLES_COUNT, props.surfaceRadius));

  const surfaceAttributes = {
    radius: props.surfaceRadius,
    height: props.surfaceHeight
  }

 const particlesAttributes = {
    gravity: props.particlesGravity,
    velocity: props.particlesVelocity,
    density: props.particlesDensity,
    count: PARTICLES_COUNT
  }

  const canvasAttributes = {
    x: WIDTH, 
    y: WIDTH
  }

  return (
    <ParticlesVelocity
      canvasAttributes={canvasAttributes}
      surfaceAttributes={surfaceAttributes}
      particlesAttributes={particlesAttributes}
      render={(textureRender) => 
        <ParticlesGeometry
          UVs={uvs}
          positions={positions}
          density={particlesAttributes.density}
          particlesRender={textureRender}
        />
      }
    />
  );
}

export default Particles;