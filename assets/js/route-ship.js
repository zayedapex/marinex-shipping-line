import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const svg = document.querySelector('.route-scroll > svg');
const layer = document.querySelector('.route-ship-layer');
const route = svg?.querySelector('.route-line');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (svg && layer && route) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  layer.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const tilt = THREE.MathUtils.degToRad(22);
  const verticalScale = 1 / Math.cos(tilt);
  const center = new THREE.Vector3(450, 280 * verticalScale, 0);
  const camera = new THREE.OrthographicCamera(-450, 450, 280, -280, 0.1, 2400);
  camera.position.set(center.x, center.y - Math.sin(tilt) * 1500, Math.cos(tilt) * 1500);
  camera.lookAt(center);

  scene.add(new THREE.HemisphereLight(0xe7f3ff, 0x182b3d, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffe4b6, 3.2);
  keyLight.position.set(-260, 420, 620);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x72b9e8, 1.5);
  rimLight.position.set(360, -180, 280);
  scene.add(rimLight);

  const ship = new THREE.Group();
  ship.scale.set(1.15, 1.15, 1);
  scene.add(ship);

  const hullShape = new THREE.Shape();
  hullShape.moveTo(-7.1, -17.5);
  hullShape.lineTo(7.1, -17.5);
  hullShape.lineTo(7.1, 10.5);
  hullShape.quadraticCurveTo(6.8, 13.2, 5.1, 15.2);
  hullShape.lineTo(0, 21);
  hullShape.lineTo(-5.1, 15.2);
  hullShape.quadraticCurveTo(-6.8, 13.2, -7.1, 10.5);
  hullShape.closePath();

  const hull = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hullShape, {
      depth: 2.4,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.55,
      bevelThickness: 0.65,
      steps: 1
    }),
    [
      new THREE.MeshStandardMaterial({ color: 0x102b40, metalness: 0.48, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ color: 0x28536c, metalness: 0.35, roughness: 0.36 })
    ]
  );
  hull.position.z = 0.2;
  ship.add(hull);

  const deck = new THREE.Mesh(
    new THREE.ShapeGeometry(hullShape),
    new THREE.MeshStandardMaterial({ color: 0x183a53, metalness: 0.24, roughness: 0.54 })
  );
  deck.position.z = 2.62;
  ship.add(deck);

  const containerMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xc64f2b, metalness: 0.16, roughness: 0.58 }),
    new THREE.MeshStandardMaterial({ color: 0xd6a53b, metalness: 0.2, roughness: 0.52 }),
    new THREE.MeshStandardMaterial({ color: 0x28749a, metalness: 0.24, roughness: 0.48 }),
    new THREE.MeshStandardMaterial({ color: 0xb9c5c8, metalness: 0.28, roughness: 0.42 })
  ];
  const containerGeometry = new THREE.BoxGeometry(5.7, 7.3, 3.2);
  const ribMaterial = new THREE.MeshStandardMaterial({ color: 0x0b2638, metalness: 0.22, roughness: 0.56 });

  [-9.2, -0.2, 8.8].forEach((y, row) => {
    [-3, 3].forEach((x, column) => {
      const box = new THREE.Mesh(containerGeometry, containerMaterials[(row * 2 + column) % containerMaterials.length]);
      box.position.set(x, y, 4.25);
      ship.add(box);

      for (let rib = -2; rib <= 2; rib++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.8, 0.12), ribMaterial);
        line.position.set(x + rib * 0.95, y, 5.91);
        ship.add(line);
      }
    });
  });

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 7.6, 5.4),
    new THREE.MeshStandardMaterial({ color: 0xd9ded8, metalness: 0.2, roughness: 0.4 })
  );
  bridge.position.set(0, -13.2, 4.8);
  ship.add(bridge);

  const bridgeGlass = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 1.1, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x163c53, metalness: 0.58, roughness: 0.22 })
  );
  bridgeGlass.position.set(0, -9.25, 6.0);
  ship.add(bridgeGlass);

  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.45, 2.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xd6541f, metalness: 0.18, roughness: 0.42 })
  );
  funnel.position.set(0, -15.1, 8.6);
  ship.add(funnel);

  const wake = new THREE.Group();
  ship.add(wake);
  const wakeMaterial = new THREE.MeshBasicMaterial({ color: 0xd9f2ff, transparent: true, opacity: 0.38 });
  [-1, 1].forEach((side) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 6.2, -16, 0.7),
      new THREE.Vector3(side * 8.4, -31, 0.35),
      new THREE.Vector3(side * 15.5, -47, 0.08)
    );
    wake.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.38, 6, false), wakeMaterial));
  });

  const routeLength = route.getTotalLength();
  const travelSeconds = reduceMotion ? 15 : 12;
  const portPauseSeconds = 1.5;
  const cycleSeconds = travelSeconds * 2 + portPauseSeconds * 2;
  const routePoint = new DOMPoint();
  let frame = 0;
  const startTime = performance.now() - portPauseSeconds * 1000;

  function resize() {
    const width = layer.clientWidth;
    const height = layer.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
  }

  function updateShip(elapsed) {
    const cycleTime = (elapsed / 1000) % cycleSeconds;
    let progress;
    if (cycleTime < portPauseSeconds) {
      progress = 0;
    } else if (cycleTime < portPauseSeconds + travelSeconds) {
      progress = (cycleTime - portPauseSeconds) / travelSeconds;
    } else if (cycleTime < portPauseSeconds * 2 + travelSeconds) {
      progress = 1;
    } else {
      progress = 1 - (cycleTime - portPauseSeconds * 2 - travelSeconds) / travelSeconds;
    }

    const distance = progress * routeLength;
    const point = route.getPointAtLength(distance, routePoint);
    const before = route.getPointAtLength(Math.max(0, distance - 1));
    const after = route.getPointAtLength(Math.min(routeLength, distance + 1));
    const returning = cycleTime >= portPauseSeconds * 2 + travelSeconds;
    const direction = returning ? -1 : 1;
    const dx = (after.x - before.x) * direction;
    const dy = (before.y - after.y) * verticalScale * direction;

    ship.position.set(point.x, (560 - point.y) * verticalScale, 0);
    ship.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    ship.position.z = 0.9 + (reduceMotion ? 0 : Math.sin(elapsed / 830) * 0.24);
    wakeMaterial.opacity = reduceMotion ? 0.34 : 0.29 + (Math.sin(elapsed / 640) + 1) * 0.08;
  }

  function animate(now) {
    frame = 0;
    if (document.hidden) return;
    updateShip(now - startTime);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (!document.hidden && !frame) frame = requestAnimationFrame(animate);
  }

  new ResizeObserver(resize).observe(layer);
  const routeScroll = layer.parentElement;
  if (routeScroll.clientWidth < layer.clientWidth) {
    routeScroll.scrollLeft = layer.clientWidth * (584.9 / 900) - routeScroll.clientWidth / 2;
  }
  document.addEventListener('visibilitychange', start);
  resize();
  start();
}