import { Canvas } from "react-three-fiber";
import { camera, scene, controls, renderer } from "../../simulation/stlviewer";
import { useState } from "react";

export default function ThreeViewer() {
  const [offsetPosition, setOffsetPosition] = useState([0, 0]); // initial camera position

  const movePosition = (x, y) => {
    var offset = [0, 0];
    console.log("MapBaseChanged: ", window.mapLocationBaseChanged);
    console.log("MapChanged: ", window.mapLocationChanged);
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
      console.log(direction, step, offset);
      console.log(newPos);
      console.log("Old location: ", newloc.lon, newloc.lat);
      newloc.lon +=
        (step.x * 360) / 40000000 / Math.cos((newloc.lat / 180) * Math.PI);
      newloc.lat += (step.y * 360) / 40000000;
      console.log("Update location: ", loc, newloc);
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

      console.log("PostMove Camera Position", camera.position);
      console.log("Camera Rot", camera.rotation);

      var animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    }
  };

  return (
    <div className="viewer-container" style={{ position: "relative" }}>
      <Canvas className="three-viewer" flat linear></Canvas>
      <canvas id="canvas" width={0} height={0}></canvas>
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
    </div>
  );
}
