import React, { useState, useRef, useEffect } from "react";

const DraggableCircle = () => {
  const [isDragging, setDragging] = useState(false);
  const circleRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  window.directionAngle = angle;
  // Calculate the center of the circle once the component has mounted
  useEffect(() => {
    if (circleRef.current) {
      const rect = circleRef.current.getBoundingClientRect();
      setCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  const handleMouseDown = (event) => {
    setDragging(true);
    const rect = event.target.parentNode.getBoundingClientRect();
    setCenter({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - center.x;
    const deltaY = event.clientY - center.y;

    const angle = Math.atan2(deltaY, deltaX);
    // console.log(event.target.parentNode);
    // console.log(
    //   `Mouse position: (${center.x}, ${center.y}, ${deltaY}, ${deltaX}), ${angle}`
    // );
    setAngle(((angle * 180) / Math.PI + 90) % 360);
    window.directionAngle = angle;
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const calculateCenter = () => {
    if (circleRef.current) {
      const rect = circleRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // console.log(`Center position: (${centerX}, ${centerY})`);
    }
  };

  useEffect(() => {
    calculateCenter();

    // Listen for resize events
    window.addEventListener("resize", calculateCenter);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("resize", calculateCenter);
  }, []);

  return (
    <div>
      <div>Schrittrichtung:</div>
      <svg
        width="400"
        height="400"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <g onMouseDown={handleMouseDown}>
          <circle
            cx="100"
            cy="85"
            r="80"
            fill="#E4E4E4"
            stroke="black"
            strokeWidth="2"
          />
          <line
            x1="100"
            y1="10"
            x2="100"
            y2="5"
            stroke="black"
            strokeWidth="2"
          />
          <line
            x1="100"
            y1="155"
            x2="100"
            y2="165"
            stroke="black"
            strokeWidth="2"
          />
          <line
            x1="20"
            y1="85"
            x2="30"
            y2="85"
            stroke="black"
            strokeWidth="2"
          />
          <line
            x1="170"
            y1="85"
            x2="180"
            y2="85"
            stroke="black"
            strokeWidth="2"
          />
          *{" "}
          <polygon
            points="100,30 110,50 105,50 105,140, 95,140 95,50 90,50"
            fill="#AA0000"
            stroke="black"
            strokeWidth="2"
            transform={`rotate(${angle} 100 85)`}
          />
          {/* <polygon
          points="100,20 92,85 108,85"
          fill="#CC0000"
          stroke="black"
          strokeWidth="2"
          transform={`rotate(${angle} 100 85)`}
        />

        {/* <line x1="100" y1="85" x2="100" y2="20" stroke="red" strokeWidth="2" /> */}
          {/* <polygon
          points="100,150 92,85 108,85"
          fill="#BBBBBB"
          stroke="black"
          strokeWidth="2"
          transform={`rotate(${angle} 100 85)`}
        />
         */}
          <text x="95" y="25" fontSize="15">
            N
          </text>
        </g>
      </svg>
    </div>
  );

  //   return (
  //     <svg
  //       width="400"
  //       height="400"
  //       onMouseMove={handleMouseMove}
  //       onMouseUp={handleMouseUp}
  //     >
  //       <circle
  //         cx="50"
  //         cy="50"
  //         r="45"
  //         fill="none"
  //         stroke="black"
  //         strokeWidth="2"
  //         onMouseDown={handleMouseDown}
  //       />
  //       <line
  //         x1="50"
  //         y1="50"
  //         x2="50"
  //         y2="10"
  //         stroke="red"
  //         strokeWidth="2"
  //         transform={`rotate(${angle} 50 50)`}
  //       />
  //       <text x="45" y="55" fontSize="10" transform={`rotate(${angle})`}>
  //         N
  //       </text>
  //     </svg>
  //   );
};

export default DraggableCircle;
