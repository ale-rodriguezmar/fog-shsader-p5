let cubes = []; // Array para almacenar las posiciones y rotaciones de los cubos
let img; // Variable para almacenar la textura de la imagen
let near = 1; // Valor cercano por defecto
let far = 40; // Valor lejano por defecto

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

uniform vec4 uFogColor;     // Color de la niebla
uniform float uFogNear;     // Distancia cercana de la niebla
uniform float uFogFar;      // Distancia lejana de la niebla

void main() {
  // Calculamos el factor de niebla basado en la distancia
  float fogFactor = (vFogDepth - uFogNear) / (uFogFar - uFogNear);

  // Limitamos el factor de niebla entre 0.0 y 1.0
  fogFactor = clamp(fogFactor, 0.0, 1.0);

  // Color del objeto (puedes aplicar la textura aquí si lo deseas)
  vec3 objectColor = vec3(1.0);

  // Mezclamos el color del objeto con el color de la niebla según la distancia
  vec3 finalColor = mix(uFogColor.rgb, objectColor, fogFactor);

  // El alfa se ajusta según la niebla para que los objetos se desvanezcan
  float alpha = 1.0 - fogFactor;

  // Establecemos el color final con el alpha para el efecto de transparencia
  gl_FragColor = vec4(finalColor, alpha);
}
`;

function preload() {
  // Cargar la textura
  img = loadImage('https://webglfundamentals.org/webgl/resources/f-texture.png');
}

function setup() {
  createCanvas(800, 600, WEBGL);

  // Crear y aplicar el shader
  let customShader = createShader(vertShader, fragShader);
  shader(customShader);

  // Establecer valores iniciales de los uniformes
  customShader.setUniform('uFogColor', [0.5, 0.5, 0.7, 1.0]);  // Azul claro para la niebla
  customShader.setUniform('uFogNear', near);
  customShader.setUniform('uFogFar', far);

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
    customShader.setUniform('uFogNear', near); // Actualizar el valor de uFogNear
  });

  document.getElementById("far").addEventListener("input", function() {
    far = parseFloat(this.value);
    document.getElementById("farValue").innerText = far;
    customShader.setUniform('uFogFar', far); // Actualizar el valor de uFogFar
  });
}

function draw() {
  background(204, 230, 255); // Color de fondo para la niebla (azul claro)

  // Establecer la perspectiva
  let fov = PI / 3; // Ángulo de visión de 60 grados
  let aspect = width / height;
  perspective(fov, aspect, near, far);

  // Establecer la cámara
  camera(0, 0, 2, 0, 0, 0, 0, 1, 0);

  // Rotación de los modelos
  let modelXRotation = frameCount * -0.004;
  let modelYRotation = frameCount * -0.007;

  // Aplicar la textura
  texture(img);

  // Dibujar cada cubo con las transformaciones y el efecto de niebla
  for (let i = 0; i < cubes.length; i++) {
    push();

    // Calcular la posición y rotación de cada cubo
    let cube = cubes[i];
    translate(cube.x, cube.y, cube.z);
    rotateX(modelXRotation + cube.rotationX);
    rotateY(modelYRotation + cube.rotationY);

    // Dibujar el cubo
    box(1);

    pop();
  }
}
