import { addToArray } from "./utils";
import { retrieveRandomSunDirections } from "./pv_simulation";

export function rayTracingWebGL(
  pointsArray,
  trianglesArray,
  normals,
  num_dates,
  loc
) {
  const N_TRIANGLES = trianglesArray.length / 9;

  const width = pointsArray.length / 3; // Change this to the number of horizontal points in the grid
  const height = 1; // Change this to the number of vertical points in the grid
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


	uniform sampler2D u_triangles;
	uniform vec3 u_sun_direction;
  	uniform int textureWidth;

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


	bool Calculate_Shading_at_Point(vec3 vertex_position, vec3 sun_direction) {
		float d;
		float t = INFINITY;
		bool is_shadowed = false;
		for (int i = 0; i < ${N_TRIANGLES}; i++) {
			int index = i * 3;
			int x = index % textureWidth;
			int y = index / textureWidth;
			vec3 v0 = texelFetch(u_triangles, ivec2(x, y), 0).rgb;

			index = i * 3 + 1;
			x = index % textureWidth;
			y = index / textureWidth;
			vec3 v1 = texelFetch(u_triangles, ivec2(x, y), 0).rgb;

			index = i * 3 + 2;
			x = index % textureWidth;
			y = index / textureWidth;
			vec3 v2 = texelFetch(u_triangles, ivec2(x, y), 0).rgb;
			d = TriangleIntersect(v0, v1, v2, vertex_position, sun_direction, 1);
			if (d < t && abs(d)>0.0001) {
				return true;

		}
		}
		return is_shadowed;
	}

	void main() {
		if (Calculate_Shading_at_Point(a_position.xyz, u_sun_direction)) {
					outColor = vec4(0, 0, 0, 0); // Shadowed
				} else {
					float intensity = abs(dot(a_normal.xyz, u_sun_direction));
					outColor = vec4(intensity, intensity, intensity, intensity); // Not shadowed
				}

	}`;

  // Fragment shader code
  const fragmentShaderSource = `#version 300 es
	precision highp float;
	void main() {
	}
	`;

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

  var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  console.log("Max Texture Size", maxTextureSize);
  var textureWidth = Math.min(3 * N_TRIANGLES, maxTextureSize);
  var textureHeight = Math.ceil((3 * N_TRIANGLES) / textureWidth);

  const colorBuffer = makeBuffer(gl, N_POINTS * 16);
  const tf = makeTransformFeedback(gl, colorBuffer);

  gl.useProgram(program);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB32F,
    textureWidth,
    textureHeight,
    0,
    gl.RGB,
    gl.FLOAT,
    trianglesArray
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);

  var u_trianglesLocation = gl.getUniformLocation(program, "u_triangles");
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(u_trianglesLocation, 0);

  var u_textureWidth = gl.getUniformLocation(program, "textureWidth");
  gl.uniform1i(u_textureWidth, textureWidth);

  //   const vao = gl.createVertexArray();
  //   gl.bindVertexArray(vao);

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

  let colorCodedArray;
  let isShadowedArray;
  for (var i = 0; i < num_dates; i++) {
    let sunDirectionUniformLocation = gl.getUniformLocation(
      program,
      "u_sun_direction"
    );
    let sunDirection = retrieveRandomSunDirections(1, loc.lat, loc.lon);
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
