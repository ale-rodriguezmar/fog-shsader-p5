let cubes = []; // Array to hold the positions and rotations of the cubes
let img; // Variable to hold the texture image
let near = 1; // Default near value
let far = 40; // Default far value

// Vertex Shader as a string
let vertShader = `
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_worldView;
uniform mat4 u_projection;

varying vec2 v_texcoord;
varying float v_fogDepth;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_projection * u_worldView * a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;

  // Pass just the negated z position relative to the camera.
  // the camera is looking in the -z direction so normally stuff
  // in front of the camera has a negative Z position
  // but by negating he we get a positive depth.
  v_fogDepth = -(u_worldView * a_position).z;
}
`;

let fragShader = `
  // Fragment Shader
  precision mediump float;

  varying float vDistance; // Distance passed from the vertex shader

  uniform float near;  // Near value
  uniform float far;   // Far value

  void main() {
    vec3 fogColor = vec3(0.8, 0.9, 1.0); // Light blue fog color

    // Calculate fog factor based on the distance to the camera and the near/far values
    float fogFactor = (vDistance - near) / (far - near);

    // Limit the fog factor between 0 and 1
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    // Object color (white in this case)
    vec3 objectColor = vec3(1.0); 

    // Mix the fog color with the object's color based on the fog factor
    vec3 finalColor = mix(fogColor, objectColor, fogFactor);

    // Apply the fog effect smoothly
    float alpha = 1.0 - fogFactor; // The object fades as the fog factor increases

    gl_FragColor = vec4(finalColor, alpha); // Set the final color with alpha for transparency
  }
`;
function preload() {
  // Load the texture image
  img = loadImage('https://webglfundamentals.org/webgl/resources/f-texture.png');
}

function setup() {
  createCanvas(800, 600, WEBGL); // Create a canvas with WebGL context
  
  // Load and apply the shaders
  let customShader = createShader(vertShader, fragShader);
  shader(customShader);  // Apply the shaders to the canvas
  
  // Initialize cubes with random positions
  for (let i = 0; i < 40; i++) {
    cubes.push({
      x: -2 + i * 1.1,
      y: 0,
      z: -i * 1.4,
      rotationX: i * 0.1,
      rotationY: i * 0.1
    });
  }

  // Add event listeners for the sliders to update the near and far values
  document.getElementById("near").addEventListener("input", function() {
    near = parseFloat(this.value);
    document.getElementById("nearValue").innerText = near;
  });
  document.getElementById("far").addEventListener("input", function() {
    far = parseFloat(this.value);
    document.getElementById("farValue").innerText = far;
  });
}

function draw() {
  background(204, 230, 255); // Fog color (light blue)

  // Set perspective
  let fov = PI / 3; // 60 degrees field of view
  let aspect = width / height;
  perspective(fov, aspect, near, far);

  // Set the camera
  camera(0, 0, 2, 0, 0, 0, 0, 1, 0);

  // Rotate the model
  let modelXRotation = frameCount * -0.004;
  let modelYRotation = frameCount * -0.007;

  // Apply the texture
  texture(img);

  // Draw each cube with transformations and fog effect
  for (let i = 0; i < cubes.length; i++) {
    push();

    // Calculate world position and rotation for each cube
    let cube = cubes[i];
    translate(cube.x, cube.y, cube.z);
    rotateX(modelXRotation + cube.rotationX);
    rotateY(modelYRotation + cube.rotationY);

    // Draw the cube
    box(1);

    pop();
  }
}
