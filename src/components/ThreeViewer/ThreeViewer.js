import { Canvas } from "react-three-fiber";
import { camera, scene, controls, renderer } from "../../simulation/stlviewer";
import { useState } from "react";
import { setLocation } from "../../simulation/download";
import * as THREE from "three";

export default function ThreeViewer() {
  const [offsetPosition, setOffsetPosition] = useState([0, 0]); // initial camera position
  const [loading, setLoading] = useState(false);

  const addLocationCylinder = (newPos) => {
    const cylinderHeight = 100;
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, cylinderHeight, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(newPos[0], newPos[1], cylinderHeight / 2);
    cylinder.rotation.set(Math.PI / 2, 0, 0);
    scene.add(cylinder);

    // setTimeout(() => {
    //   scene.remove(cylinder);
    //   cylinder.geometry.dispose();
    //   cylinder.material.dispose();
    //   renderer.render(scene, camera);
    // }, 2000);

    // Create a function to gradually reduce the opacity
    function fade() {
      if (cylinder.scale.y > 0.1) {
        // Reduce the scale by a small amount
        cylinder.scale.y *= 0.95;
        cylinder.position.z = (cylinder.scale.y * cylinderHeight) / 2;
        // Increase the color brightness by a small amount
        material.color.lerp(new THREE.Color(0xbbbbbb), 0.04); // Bright green

        // renderer.render(scene, camera);
        // Call this function again after a small delay
        setTimeout(fade, 20);
      } else {
        // Once the opacity reaches 0, remove the cylinder from the scene
        scene.remove(cylinder);

        // Dispose of the geometry and the material
        cylinder.geometry.dispose();
        cylinder.material.dispose();
      }
    }

    // Start the fading process
    fade();
  };

  const movePosition = (x, y) => {
    var offset = [0, 0];
    // console.log("MapBaseChanged: ", window.mapLocationBaseChanged);
    // console.log("MapChanged: ", window.mapLocationChanged);
    if (window.mapLocationBaseChanged) {
      setOffsetPosition(0, 0);
      offset = [-offsetPosition[0], -offsetPosition[1]];
      window.mapLocationBaseChanged = false;
    } else {
      offset = [0, 0];
    }

    if (window.mapLocation != null) {
      const distanceStep = window.distanceStep;

      const direction = Math.atan2(camera.rotation.y, camera.rotation.x);
      const step = {
        x:
          x * distanceStep * Math.cos(direction) -
          y * distanceStep * Math.sin(direction),
        y:
          y * distanceStep * Math.cos(direction) +
          x * distanceStep * Math.sin(direction),
      };
      const newPos = [
        offsetPosition[0] + step.x + offset[0],
        offsetPosition[1] + step.y + offset[1],
      ];
      window.offsetPos = newPos;
      setOffsetPosition([newPos[0], newPos[1]]);
      const loc = { lon: window.mapLocation.lon, lat: window.mapLocation.lat };
      var newloc = { lon: parseFloat(loc.lon), lat: parseFloat(loc.lat) };
      // console.log(direction, step, offset);
      // console.log(newPos);
      // console.log("Old location: ", newloc.lon, newloc.lat);
      newloc.lon +=
        (step.x * 360) / 40000000 / Math.cos((newloc.lat / 180) * Math.PI);
      newloc.lat += (step.y * 360) / 40000000;
      // console.log("Update location: ", loc, newloc);
      newloc = { lat: newloc.lat.toString(), lon: newloc.lon.toString() };
      window.mapLocation = newloc;
      window.mapLocationChanged = true;

      camera.position.set(
        camera.position.x + step.x,
        camera.position.y + step.y,
        camera.position.z
      );
      camera.lookAt(newPos[0], newPos[1], 0);
      controls.target.set(newPos[0], newPos[1], 0);

      // console.log("PostMove Camera Position", camera.position);
      // console.log("Camera Rot", camera.rotation);

      var animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      addLocationCylinder(newPos);
    }
  };

  const resimulate = () => {
    setLoading(!loading);
    if (
      window.numRadiusSimulationChanged ||
      window.numSimulationsChanged ||
      window.mapLocationChanged
    ) {
      window.setShowViridisLegend(false);
      window.setShowThreeViewer(true);
      setLocation(
        "",
        false,
        window.numRadiusSimulationChanged || window.numSimulationsChanged,
        window.mapLocation
      );
      window.numRadiusSimulationChanged = false;
      window.numSimulationsChanged = false;
      window.mapLocationChanged = false;
    }
  };

  return (
    <div className="viewer-container" style={{ position: "relative" }}>
      <Canvas className="three-viewer" flat linear></Canvas>
      <canvas id="canvas" width={0} height={0}></canvas>
      {window.showViridisLegend && <>
        <button
          className="arrowButton"
          onClick={() => movePosition(0, 1)}
          style={{ right: "1em", bottom: "2em" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        <button
          className="arrowButton"
          onClick={() => movePosition(0, -1)}
          style={{ right: "1em", bottom: "0em" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{ transform: "rotate(180deg)" }}
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        <button
          className="arrowButton"
          onClick={resimulate}
          style={{ right: "1em", bottom: "1em" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 50 50"
          >
            <polyline
              points="10,25 20,35 40,15"
              stroke="#000000"
              strokeWidth="0.5em"
              fill="none"
            />
          </svg>
        </button>
        <button
          className="arrowButton"
          onClick={() => movePosition(-1, 0)}
          style={{ right: "2em", bottom: "1em" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{ transform: "rotate(270deg)" }}
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        <button
          className="arrowButton"
          onClick={() => movePosition(1, 0)}
          style={{ right: "0em", bottom: "1em" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{ transform: "rotate(90deg)" }}
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </>
      }
    </div>
  );
}
