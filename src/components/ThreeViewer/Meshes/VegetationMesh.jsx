import React, { useMemo } from 'react';
import * as THREE from "three";

const vegetationColors = [
  "#27AD6B",  // Light green
  "#2DBE76", // mint
  "#33CC80", //dull green
];




const VegetationMesh = ({ geometries }) => {
  const randomColors = useMemo(() => {
    return geometries.map(() => 
      vegetationColors[Math.floor(Math.random() * vegetationColors.length)]
    );
  }, [geometries]);

  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshLambertMaterial
            vertexColors={false}
            color={randomColors[index]}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
};

export default VegetationMesh
