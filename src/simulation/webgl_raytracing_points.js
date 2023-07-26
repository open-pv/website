import { addToArray } from "./utils";
import { retrieveRandomSunDirections } from "./pv_simulation";
import { Vector3 } from "three";

function max_subdim(array, index) {
  var max = -1000000;
  for (var ar of array) {
    max = Math.max(ar[index], max);
  }
  return max;
}

function min_subdim(array, index) {
  var min = 1000000;
  for (var ar of array) {
    min = Math.min(ar[index], min);
  }
  return min;
}

export function rayTracingPointsWebGL(
  pointsArray,
  trianglesArray,
  normals,
  laserPoints,
  laserPointsRadius,
  laserPointsMinDistance,
  num_dates,
  loc
) {
  const N_TRIANGLES = trianglesArray.length / 9;
  const width = pointsArray.length / 3; // Change this to the number of horizontal points in the grid
  const N_POINTS = width;
  const canvas = document.getElementById("canvas");

  //canvas.width = width;
  //canvas.height = height;

  const gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("Your browser does not support WebGL2");
  }

  // Vertex shader code
  const vertexShaderSource = `#version 300 es
	#define INFINITY         1000000.0
	precision highp float;
    precision mediump sampler3D;

    uniform vec3 u_sun_direction;
  	uniform int textureWidth;
    uniform int textureHeight;
    uniform int textureDepth;
    uniform float u_POINT_RADIUS;
    uniform float u_MIN_DISTANCE;
    uniform int MAX_STEPS;
    uniform vec3 gridCellSizes;
    uniform vec3 origin_offset;
    uniform sampler3D u_grid;
    uniform float scaleDown;
    uniform int pointcloudShading;

    uniform sampler2D u_triangles;
	uniform int textureWidthTris;

	in vec3 a_position;
	in vec3 a_normal;

	out vec4 outColor;

	vec3 cross1(vec3 a, vec3 b) {
		vec3 c = vec3(0, 0, 0);
		c.x = a[1] * b[2] - a[2] * b[1];
		c.y = a[2] * b[0] - a[0] * b[2];
		c.z = a[0] * b[1] - a[1] * b[0];
		return c;
	}
    
    bool intersectRaySphere(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
        vec3 oc = sphereCenter - rayOrigin;
        float b = dot(oc, rayDir);
        float c = dot(oc, oc) - b*b;
        return ((b > 0.)&&(c < sphereRadius * sphereRadius));
    }

    float TriangleIntersect( vec3 v0, vec3 v1, vec3 v2, vec3 rayOrigin, vec3 rayDirection, int isDoubleSided )
	{
		vec3 edge1 = v1 - v0;
		vec3 edge2 = v2 - v0;

		vec3 pvec = cross(rayDirection, edge2);

		float epsilon = 0.000001; // Add epsilon to avoid division by zero
		float det = dot(edge1, pvec);
		if (abs(det) < epsilon) // Check if det is too close to zero
			return INFINITY;

		float inv_det = 1.0 / det;
		if ( isDoubleSided == 0 && det < 0.0 ) 
			return INFINITY;
		
		vec3 tvec = rayOrigin - v0;
		float u = dot(tvec, pvec) * inv_det;
		vec3 qvec = cross(tvec, edge1);
		float v = dot(rayDirection, qvec) * inv_det;
		float t = dot(edge2, qvec) * inv_det;
		float x = dot(pvec,pvec);
		return (u < 0.0 || u > 1.0 || v < 0.0 || u + v > 1.0 || t <= 0.0) ? INFINITY : t;

	}


	float Calculate_Shading_at_Point_Triangles(vec3 vertex_position, vec3 sun_direction) {
		float d;
		float t = INFINITY;
		float shadow_value = 0.;
		for (int i = 0; i < ${N_TRIANGLES}; i++) {
			int index = i * 3;
			int x = index % textureWidthTris;
			int y = index / textureWidthTris;
			vec3 v0 = texelFetch(u_triangles, ivec2(x, y), 0).rgb;

			index = i * 3 + 1;
			x = index % textureWidthTris;
			y = index / textureWidthTris;
			vec3 v1 = texelFetch(u_triangles, ivec2(x, y), 0).rgb;

			index = i * 3 + 2;
			x = index % textureWidthTris;
			y = index / textureWidthTris;
			vec3 v2 = texelFetch(u_triangles, ivec2(x, y), 0).rgb;
			d = TriangleIntersect(v0, v1, v2, vertex_position, sun_direction, 1);
			if (d < t && abs(d)>0.0001) {
				shadow_value += 1.;

		}
		}
		return shadow_value;
	}

	float Calculate_Shading_at_Point(vec3 vertex_position, vec3 sun_direction) {
        vec3 ray = normalize(sun_direction);
        vec3 step = sign(ray);
        vec3 tMax = (step * (gridCellSizes - mod(vertex_position - origin_offset, gridCellSizes)) + gridCellSizes) / ray;
        vec3 tDelta = step * gridCellSizes / ray;
        float shadow_value = 0.;
        ivec3 gridPos = ivec3((vertex_position - origin_offset) / gridCellSizes);
        // if ((vertex_position.x < 10.) && (vertex_position.x > -10.) && (vertex_position.y < 10.) && (vertex_position.y > -10.)){
        //     return true;
        // }
        // if (gridPos.x == 0){
        //     return true;
        // }
        for (int i = 0; i < MAX_STEPS; i++) {
            for (int j = 0; j < textureDepth; j++) {
                vec4 point = texelFetch(u_grid, ivec3(gridPos.x, gridPos.y, j), 0);
                vec3 pointPos = point.rgb * scaleDown + origin_offset;

                if (dot(pointPos - vertex_position, pointPos - vertex_position) <= u_MIN_DISTANCE * u_MIN_DISTANCE ){
                    continue;
                }

                if (pointPos.z > -10.){
                    if (intersectRaySphere(vertex_position, ray, pointPos, u_POINT_RADIUS)) {
                        shadow_value += 1.0;
                    }
                }
                else{
                  break;
                }
            }
            int axis = (tMax.x < tMax.y) ? 0 : 1;
            tMax[axis] += tDelta[axis];
            gridPos[axis] += int(step[axis]);
            if ((textureWidth <= gridPos.x) || (textureHeight <= gridPos.y) || (gridPos.x < 0) || (gridPos.y < 0)){
                break;
            }
        }
        return shadow_value;
    }

	void main() {
		float shadow_value = Calculate_Shading_at_Point_Triangles(a_position.xyz, u_sun_direction);
    if (pointcloudShading > 0){
      shadow_value += Calculate_Shading_at_Point(a_position.xyz, u_sun_direction);
    }
		float intensity = dot(a_normal.xyz, u_sun_direction)*((shadow_value > 1.)?0.:(1.-shadow_value));
    intensity = (intensity < 0.)?0.:intensity;
    outColor = vec4(intensity, intensity, intensity, intensity); // Not shadowed
	}`;

  // Fragment shader code
  const fragmentShaderSource = `#version 300 es
	precision highp float;
	void main() {
	}
	`;

  let max3DTextureSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);
  console.log("Max 3D texture size: ", max3DTextureSize);

  const numLaserPoints = laserPoints != null ? laserPoints.length : 1;
  var textureWidth = 1;
  var textureDepth = 1;
  var textureHeight = 1;
  let texturePointsGrid = new Float32Array(1);
  var scaleDown = 1;
  var laserPointAreaBounds = [];
  var laserPointZBound = [];
  var laserPointAreaWidth = 0;
  var laserPointAreaHeight = 0;
  var gridCellSize = 0;

  if (laserPoints != null) {
    laserPointAreaBounds = [
      min_subdim(laserPoints, 0),
      min_subdim(laserPoints, 1),
      max_subdim(laserPoints, 0),
      max_subdim(laserPoints, 1),
    ];
    laserPointZBound = [min_subdim(laserPoints, 2), max_subdim(laserPoints, 2)];

    console.log(laserPointAreaBounds);
    laserPointAreaWidth = laserPointAreaBounds[2] - laserPointAreaBounds[0];
    laserPointAreaHeight = laserPointAreaBounds[3] - laserPointAreaBounds[1];
    gridCellSize = Math.sqrt(
      (10 * laserPointAreaHeight * laserPointAreaWidth) / numLaserPoints
    );

    console.log("GRID CELL SIZE:", gridCellSize);
    textureWidth = Math.ceil(laserPointAreaWidth / gridCellSize);
    textureHeight = Math.ceil(laserPointAreaHeight / gridCellSize);

    let nPointsGrid = new Int32Array(textureWidth * textureHeight);
    for (let i = 0; i < laserPoints.length; i++) {
      let point = laserPoints[i];
      let x = Math.floor((point[0] - laserPointAreaBounds[0]) / gridCellSize);
      let y = Math.floor((point[1] - laserPointAreaBounds[1]) / gridCellSize);
      let index = (y * textureWidth + x) * 4;
      nPointsGrid[index] += 1;
    }
    const maxNPoints = Math.max(...nPointsGrid);
    console.log(`Maximal depth of texture: ${maxNPoints}`);
    textureDepth = maxNPoints;

    texturePointsGrid = new Float32Array(
      textureWidth * textureHeight * maxNPoints * 4
    );
    for (var i = 0; i < texturePointsGrid.length; i++) {
      texturePointsGrid[i] = -100.0;
    }

    scaleDown =
      1.2 *
      Math.max(
        laserPointZBound[1] - laserPointZBound[0],
        laserPointAreaHeight,
        laserPointAreaWidth
      );

    for (var i = 0; i < laserPoints.length; i++) {
      let point = laserPoints[i];
      let x = Math.floor((point[0] - laserPointAreaBounds[0]) / gridCellSize);
      let y = Math.floor((point[1] - laserPointAreaBounds[1]) / gridCellSize);
      for (var j = 0; j < textureDepth; j++) {
        let index =
          (y * textureWidth + x + j * textureHeight * textureWidth) * 4;
        if (texturePointsGrid[index + 2] < 0) {
          texturePointsGrid[index + 0] =
            (point[0] - laserPointAreaBounds[0]) / scaleDown;
          texturePointsGrid[index + 1] =
            (point[1] - laserPointAreaBounds[1]) / scaleDown;
          texturePointsGrid[index + 2] = (point[2] - 0) / scaleDown;
          texturePointsGrid[index + 3] = 1;
          break;
        }
      }
    }
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = createProgram(gl, vertexShader, fragmentShader, ["outColor"]);
  if (program === "abortSimulation") {
    return null;
  }

  const colorBuffer = makeBuffer(gl, N_POINTS * 16);
  const tf = makeTransformFeedback(gl, colorBuffer);
  // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  // gl.pixelStorei(gl.PACK_ALIGNMENT, 1);

  var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  var textureWidthTris = Math.min(
    3 * N_TRIANGLES,
    Math.floor(maxTextureSize / 9) * 9
  );
  var textureHeightTris = Math.ceil((3 * N_TRIANGLES) / textureWidthTris);

  gl.useProgram(program);

  var alignedTrianglesArray;
  if (textureHeightTris == 1) {
    alignedTrianglesArray = trianglesArray;
  } else {
    alignedTrianglesArray = new Float32Array(
      textureWidthTris * textureHeightTris * 3
    );

    for (var i = 0; i < N_TRIANGLES; i++) {
      var x = (3 * i) % textureWidthTris;
      var y = Math.floor((3 * i) / textureWidthTris);
      var index = y * textureWidthTris + x;
      for (var j = 0; j < 3; j++) {
        alignedTrianglesArray[index + j] = trianglesArray[3 * i + j];
      }
    }
  }

  var texture;
  if (laserPoints != null) {
    // Create a new texture
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture);
    // Upload the buffer to the GPU and configure the 3D texture
    gl.texImage3D(
      gl.TEXTURE_3D, // target
      0, // level
      gl.RGBA32F, // internalFormat
      textureWidth, // width
      textureHeight, // height
      textureDepth, // depth
      0, // border
      gl.RGBA, // format
      gl.FLOAT, // type
      texturePointsGrid // pixel data
    );

    // Set up texture parameters for the 3D texture
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  }

  let textureTri = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textureTri);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB32F,
    textureWidth,
    textureHeight,
    0,
    gl.RGB,
    gl.FLOAT,
    alignedTrianglesArray
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  var u_trianglesLocation = gl.getUniformLocation(program, "u_triangles");
  gl.uniform1i(u_trianglesLocation, 1);

  var u_pointcloudShading = gl.getUniformLocation(program, "pointcloudShading");
  gl.uniform1i(u_pointcloudShading, laserPoints != null ? 1 : 0);
  if (laserPoints != null) {
    var u_textureWidth = gl.getUniformLocation(program, "textureWidth");
    gl.uniform1i(u_textureWidth, textureWidth);
    var u_textureHeight = gl.getUniformLocation(program, "textureHeight");
    gl.uniform1i(u_textureHeight, textureHeight);
    var u_textureDepth = gl.getUniformLocation(program, "textureDepth");
    gl.uniform1i(u_textureDepth, textureDepth);
    var u_POINT_RADIUS = gl.getUniformLocation(program, "u_POINT_RADIUS");
    gl.uniform1f(u_POINT_RADIUS, laserPointsRadius);
    var u_MIN_DISTANCE = gl.getUniformLocation(program, "u_MIN_DISTANCE");
    gl.uniform1f(u_MIN_DISTANCE, laserPointsMinDistance);
    var u_scaleDown = gl.getUniformLocation(program, "scaleDown");
    gl.uniform1f(u_scaleDown, scaleDown);
    var u_MAX_STEPS = gl.getUniformLocation(program, "MAX_STEPS");
    gl.uniform1i(u_MAX_STEPS, 10000);
    var u_gridCellSizes = gl.getUniformLocation(program, "gridCellSizes");
    gl.uniform3f(u_gridCellSizes, gridCellSize, gridCellSize, 10);

    var u_originOffset = gl.getUniformLocation(program, "origin_offset");
    gl.uniform3f(
      u_originOffset,
      laserPointAreaBounds[0],
      laserPointAreaBounds[1],
      0
    );

    var u_gridLocation = gl.getUniformLocation(program, "u_grid");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture);
    gl.uniform1i(u_gridLocation, 0);
  }

  var u_textureWidthTris = gl.getUniformLocation(program, "textureWidthTris");
  gl.uniform1i(u_textureWidthTris, textureWidthTris);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = makeBufferAndSetAttribute(
    gl,
    pointsArray,
    positionAttributeLocation
  );
  const normalBuffer = makeBufferAndSetAttribute(
    gl,
    normals,
    normalAttributeLocation
  );

  var colorCodedArray = null;
  var isShadowedArray = null;
  for (var i = 0; i < num_dates; i++) {
    let sunDirectionUniformLocation = gl.getUniformLocation(
      program,
      "u_sun_direction"
    );

    let sunDirection = retrieveRandomSunDirections(1, loc.lat, loc.lon);
    // let sunDirection = new Vector3(0.65, -0.65, 0.1);
    gl.uniform3fv(sunDirectionUniformLocation, sunDirection);

    drawArraysWithTransformFeedback(gl, tf, gl.POINTS, N_POINTS);

    if (isShadowedArray == null) {
      colorCodedArray = getResults(gl, colorBuffer, "shading", N_POINTS);
      isShadowedArray = colorCodedArray.filter(
        (_, index) => (index + 1) % 4 === 0
      );
    } else {
      colorCodedArray = getResults(gl, colorBuffer, "shading", N_POINTS);
      addToArray(
        isShadowedArray,
        colorCodedArray.filter((_, index) => (index + 1) % 4 === 0)
      );
    }
  }
  return isShadowedArray;
}

function getResults(gl, buffer, label, N_POINTS) {
  let results = new Float32Array(N_POINTS * 4);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.getBufferSubData(
    gl.ARRAY_BUFFER,
    0, // byte offset into GPU buffer,
    results
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null); // productBuffer was still bound to ARRAY_BUFFER so unbind it
  return results;
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(
  gl,
  vertexShader,
  fragmentShader,
  variables_of_interest
) {
  const program = gl.createProgram();

  if (vertexShader === undefined || fragmentShader === undefined) {
    window.setShowTooManyUniformsError(true);
    return "abortSimulation";
  } else {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.transformFeedbackVaryings(
      program,
      variables_of_interest,
      gl.SEPARATE_ATTRIBS
    );
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
}

function makeBuffer(gl, sizeOrData) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, gl.DYNAMIC_DRAW);
  return buf;
}

function makeTransformFeedback(gl, buffer) {
  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
  return tf;
}

function makeBufferAndSetAttribute(gl, data, loc) {
  const buf = makeBuffer(gl, data);
  // setup our attributes to tell WebGL how to pull
  // the data from the buffer above to the attribute
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(
    loc,
    3, // size (num components)
    gl.FLOAT, // type of data in buffer
    false, // normalize
    0, // stride (0 = auto)
    0 // offset
  );
}

function drawArraysWithTransformFeedback(gl, tf, primitiveType, count) {
  // turn of using the fragment shader
  gl.enable(gl.RASTERIZER_DISCARD);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(primitiveType, 0, count);
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  // unbind the buffer from the TRANFORM_FEEDBACK_BUFFER
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

  // turn on using fragment shaders again
  gl.disable(gl.RASTERIZER_DISCARD);
}
