import { 
  useRef, 
  useEffect
} from "react";


import { extend, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";


import particlesVertexShader from "./shader/particles/geometry.vert";
import particlesFragmentShader from "./shader/particles/geometry.frag";

const ParticlesMaterial = shaderMaterial(
  {
    texturePosition: { value: null },
    textureVelocity: { value: null },
    cameraConstant: { value: null},
    density: { value: 0 }
  },
  particlesVertexShader.shader,
  particlesFragmentShader.shader
)
  
extend({ParticlesMaterial})

function getCameraConstant(camera) {
  // const deg2rad = degrees => degrees * (Math.PI / 180);
  return window.innerHeight / ( Math.tan( Math.PI / 180 * 0.5 * camera.fov ) / camera.zoom );
}

/**
 *  [in] uv - Float32Array
 *  [in] position - Float32Array 
 *  [in] density - number
 *  [in] particlesRender - attributes of rendered texture
 *
 */
const ParticlesGeometry = (props) => {
  const particlesRef = useRef();
  const materialsRef = useRef();
  
  useEffect(() => {
    particlesRef.current.updateMatrix();
    console.log("ParticlesGeometry: init is finished");
  },[])

  const webGLState = useThree();

  useEffect(() => {
    if(props.particlesRender !== undefined) {
      materialsRef.current.texturePosition = props.particlesRender.texturePosition
      materialsRef.current.textureVelocity = props.particlesRender.textureVelocity
      materialsRef.current.cameraConstant = getCameraConstant(webGLState.camera)
      materialsRef.current.density = props.density
    }
  }, [props.particlesRender, props.density, webGLState]);

  return (
    <points ref={particlesRef} matrixAutoUpdate={false}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={["attributes", 'position']} 
          count={props.positions.length / 3} 
          array={props.positions} 
          itemSize={3} 
        />
        <bufferAttribute
          attachObject={["attributes", 'uv']} 
          count={props.UVs.length / 2} 
          array={props.UVs} 
          itemSize={2} 
        />
      </bufferGeometry>
      <particlesMaterial ref={materialsRef} attach="material" drawBuffers={true}
      />
    </points>
  );
}

export default ParticlesGeometry;