// Grupo 777
// Juan David Ramirez
// Miguelangel Mosquera
// Diego Rodriguez
// Gustavo Rivera

let cubes = []; // Array para almacenar las posiciones y rotaciones de los cubos
let img; // Variable para almacenar la textura de la imagen
let near = 1; // Valor cercano por defecto
let far = 40; // Valor lejano por defecto
let customShader;

// Vertex Shader (GLSL)
let vertShader = `

attribute vec4 aPosition;    // Usamos aPosition (p5.js usa aPosition por defecto)
attribute vec2 aTexCoord;    // Usamos aTexCoord (p5.js usa aTexCoord por defecto)

uniform mat4 uModelViewMatrix;  // Matriz del modelo vista (p5.js usa este nombre)
uniform mat4 uProjectionMatrix; // Matriz de proyección (p5.js usa este nombre)

varying vec2 vTexCoord;
varying float vFogDepth; // La distancia para el cálculo de la niebla

void main() {
  // Aplicamos la transformación por las matrices de vista y proyección
  gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;

  // Pasamos las coordenadas de textura
  vTexCoord = aTexCoord;

  // Calculamos la distancia del vértice a la cámara (longitud de la posición)
  vFogDepth = length((uModelViewMatrix * aPosition).xyz);
}
`;

// Fragment Shader (GLSL)
let fragShader = `
precision mediump float;

varying float vFogDepth;   // La distancia calculada en el vertex shader

varying vec2 vTexCoord;
uniform sampler2D uTexture;

uniform vec4 uFogColor;     // Color de la niebla
uniform float uFogNear;     // Distancia cercana de la niebla
uniform float uFogFar;      // Distancia lejana de la niebla

void main() {
  // por ahora dejemos un color fijo antes de cargar la textura
  vec4 colorBase = texture2D(uTexture,vTexCoord);
  //vec4 colorBase = vec4(1.0, 0.0, 0.0, 1.0);

  float fogAmount = smoothstep(uFogNear, uFogFar, vFogDepth);

  // Establecemos el color final con el alpha para el efecto de transparencia
  gl_FragColor = mix(colorBase, uFogColor, fogAmount);
}
`;

function preload() {
  // Cargar la textura
  img = loadImage('https://webglfundamentals.org/webgl/resources/f-texture.png');
}

function setup() {
  createCanvas(800, 600, WEBGL);
  noStroke();

  // Crear y aplicar el shader
  customShader = createShader(vertShader, fragShader);

  // Inicializar las posiciones de los cubos
  for (let i = 0; i < 40; i++) {
    cubes.push({
      x: -2 + i * 1.1,
      y: 0,
      z: -i * 1.4,
      rotationX: i * 0.1,
      rotationY: i * 0.1
    });
  }

  // Controladores para actualizar near y far
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
  background(204, 230, 255); // Color de fondo para la niebla (azul claro)
  shader(customShader);
  customShader.setUniform('uFogColor', [204/255, 230/255, 255/255, 1.0]);  // Azul claro para la niebla
  customShader.setUniform('uFogNear', near);
  customShader.setUniform('uFogFar', far);

  // Establecer la perspectiva
  let fov = PI / 3; // Ángulo de visión de 60 grados
  let aspect = width / height;
  perspective(fov, aspect, 1, 50);

  // Establecer la cámara
  camera(0, 0, 2, 0, 0, 0, 0, 1, 0);

  // Rotación de los modelos
  let modelXRotation = frameCount * -0.004;
  let modelYRotation = frameCount * -0.007;

  // Dibujar cada cubo con las transformaciones y el efecto de niebla
  for (let i = 0; i < cubes.length; i++) {
    push();

    // Calcular la posición y rotación de cada cubo
    let cube = cubes[i];
    translate(cube.x, cube.y, cube.z);
    rotateX(modelXRotation + cube.rotationX);
    rotateY(modelYRotation + cube.rotationY);
    customShader.setUniform('uTexture', img);
    
    // Dibujar el cubo
    box(1);
    pop();
  }
}