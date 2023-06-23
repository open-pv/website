import { Canvas } from "react-three-fiber";



export default function ThreeViewer () {
    return (
    <>
      <Canvas 
        className="three-viewer" 
        flat 
        linear>
      </Canvas>
      <canvas id="canvas" width={0} height={0}></canvas>
    </>
  );
}