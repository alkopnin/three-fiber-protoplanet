import { 
  useRef, 
  useState,
  useEffect,
} from "react";

import {
  useThree,
  useFrame,
  extend,
} from "@react-three/fiber";

import positionFragmentShader from "./shader/particles/position.frag";
import velocityFragmentShader from "./shader/particles/velocity.frag";

import { GPUComputationRenderer } from 'three-stdlib';
extend({ GPUComputationRenderer });

function fillTextures( 
  surfaceAttrbutes,
  particlesAttributes,
  texturePosition,
  textureVelocity) {

  const posArray = texturePosition.image.data;
  const velArray = textureVelocity.image.data;

  for ( let k = 0, kl = posArray.length; k < kl; k += 4 ) {
    // Position
    let x, z, rr;

    do {
      x = ( Math.random() * 2 - 1 );
      z = ( Math.random() * 2 - 1 );
      rr = x * x + z * z;
    } while ( rr > 1 );

    rr = Math.sqrt( rr );

    const rExp = surfaceAttrbutes.radius * Math.pow( rr, particlesAttributes.velocity.exponent );

    // Velocity
    const vel = particlesAttributes.velocity.maxVel * Math.pow( rr, particlesAttributes.velocity.velExponent );

    const vx = vel * z + ( Math.random() * 2 - 1 ) * particlesAttributes.velocity.randVel;
    const vy = ( Math.random() * 2 - 1 ) * particlesAttributes.velocity.randVel * 0.05;
    const vz = - vel * x + ( Math.random() * 2 - 1 ) * particlesAttributes.velocity.randVel;

    x *= rExp;
    z *= rExp;
    const y = ( Math.random() * 2 - 1 ) * surfaceAttrbutes.height;

    const mass = Math.random() * particlesAttributes.velocity.maxMass + 1;

    // Fill in texture values
    posArray[ k + 0 ] = x;
    posArray[ k + 1 ] = y;
    posArray[ k + 2 ] = z;
    posArray[ k + 3 ] = 1;

    velArray[ k + 0 ] = vx;
    velArray[ k + 1 ] = vy;
    velArray[ k + 2 ] = vz;
    velArray[ k + 3 ] = mass;
  }

}

/**
 *  [in] canvasAttributes - {x, y}  ??? 
 *  [in] surfaceAttributes - {radius, height}
 *  [in] particlesAttributes - {density, gravity, velocity, count}
 *  [in/out] render - callback to expose rendered texture 
 *
 */
const ParticlesVelocity = (props) => {

  const gpuComputeRef = useRef();

  const [textureVelocity, setTextureVelocity] = useState();
  const [texturePosition, setTexturePosition] = useState();

  const [textureRender, setTextureRender] = useState();

  const updateTextureRender = (pTexturePosition, pTextureVelocity) => {
    setTextureRender({
      texturePosition:pTexturePosition,
      textureVelocity:pTextureVelocity,
    });
  };

  const [isComponentReady, setIsComponentReady] = useState(false);

  const surface = props.surfaceAttributes;
  const particles = props.particlesAttributes;

  particles.velocity.maxMass = particles.velocity.maxMass * 1024 / particles.count;

  useEffect(() => {
    let dtVelocity = gpuComputeRef.current.createTexture();
    let dtPosition = gpuComputeRef.current.createTexture();

    fillTextures(surface, particles, dtPosition, dtVelocity);

    let tmpTextureVelocity = gpuComputeRef.current.addVariable( "textureVelocity", velocityFragmentShader.shader, dtVelocity );
    let tmpTexturePosition = gpuComputeRef.current.addVariable( "texturePosition", positionFragmentShader.shader, dtPosition );

    gpuComputeRef.current.setVariableDependencies( tmpTextureVelocity, [ tmpTexturePosition, tmpTextureVelocity ] );
    gpuComputeRef.current.setVariableDependencies( tmpTexturePosition, [ tmpTexturePosition, tmpTextureVelocity ] );

    let velocityUniforms = tmpTextureVelocity.material.uniforms;

    velocityUniforms[ "gravityConstant" ] = { value: particles.gravity };
    velocityUniforms[ "density" ] = { value: particles.density };

    setTextureVelocity(tmpTextureVelocity);
    setTexturePosition(tmpTexturePosition);

    const error = gpuComputeRef.current.init();
    if ( error !== null ) {
      console.error( error );
    }

    setIsComponentReady(true);
    console.log("ParticlesRenderer: init is finished, particles: " + JSON.stringify(particles));
  }, [surface, particles]);

  useFrame(({ gl, scene, camera }) => {
    if(!isComponentReady) 
      return;

    gpuComputeRef.current.compute();

    updateTextureRender(
      gpuComputeRef.current.getCurrentRenderTarget( texturePosition ).texture,
      gpuComputeRef.current.getCurrentRenderTarget( textureVelocity ).texture
    );

    gl.render(scene, camera)
  });

  const webGLState = useThree();

  return (
    <>
      <gPUComputationRenderer
        ref={gpuComputeRef} 
        args={[props.canvasAttributes.x, props.canvasAttributes.y, webGLState.gl]} 
      />
      {props.render(textureRender)}
    </>
  );
}

export default ParticlesVelocity;