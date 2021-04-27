import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useRef, useEffect } from 'react';
import Ship from './models/Ship';
import { atom, RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import {
  TextureLoader,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  FontLoader,
} from 'three';
import Roboto from './highway_font.json';

function Stars() {
  const stars = useRef();
  const geometry = new BufferGeometry();
  const vertices = [];

  const sprite = new TextureLoader().load('/star.png');

  for (let i = 0; i < 100000; i++) {
    const x = 2000 * Math.random() - 1000;
    const y = 2000 * Math.random() - 1000;
    const z = 20000 * Math.random() - 1000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

  const material = new PointsMaterial({
    size: 5,
    sizeAttenuation: true,
    map: sprite,
    alphaTest: 0.5,
    transparent: true,
  });

  useFrame(() => {
    if (stars.current.position.z < -18000) {
      stars.current.position.z = 0;
    } else {
      stars.current.position.z -= 5;
    }
  });

  return (
    <mesh ref={stars}>
      <points size={35} geometry={geometry} material={material} />
    </mesh>
  );
}

export const shipPositionState = atom({
  key: 'shipPosition',
  default: { position: {}, rotation: {} },
});

export const showStartState = atom({
  key: 'showStart',
  default: true,
});

function Target() {
  const rearTarget = useRef();
  const frontTarget = useRef();

  const loader = new TextureLoader();
  // A png with transparency to use as the target sprite.
  const texture = loader.load('/target.png');

  // Update the position of the reticle based on the ships current position.
  useFrame(({ mouse }) => {
    rearTarget.current.position.y = -mouse.y * 10;
    rearTarget.current.position.x = -mouse.x * 30;

    frontTarget.current.position.y = -mouse.y * 20;
    frontTarget.current.position.x = -mouse.x * 60;
  });
  // Sprite material has a prop called map to set the texture on.
  return (
    <group>
      <sprite position={[0, 0, 8]} ref={rearTarget}>
        <spriteMaterial attach="material" map={texture} />
      </sprite>
      <sprite position={[0, 0, 16]} ref={frontTarget}>
        <spriteMaterial attach="material" map={texture} />
      </sprite>
    </group>
  );
}

function ShipRig() {
  const [shipPosition, setShipPosition] = useRecoilState(shipPositionState);

  const ship = useRef();

  useFrame(({ mouse }) => {
    setShipPosition({
      position: { x: mouse.x * 6, y: mouse.y * 2 },
      rotation: { z: -mouse.x * 0.5, x: -mouse.x * 0.5, y: mouse.y * 0.2 },
    });
  });

  useFrame(() => {
    ship.current.rotation.z = shipPosition.rotation.z;
    ship.current.rotation.y = shipPosition.rotation.x;
    ship.current.rotation.x = shipPosition.rotation.y;
    ship.current.position.y = shipPosition.position.y;
    ship.current.position.x = shipPosition.position.x;
  });

  return (
    <>
      <Ship ref={ship} position={[0, 0, -15]} scale={[0.5, 0.5, 0.5]} />
    </>
  );
}

// Game settings.
const LASER_RANGE = 100;
const LASER_Z_VELOCITY = 1;
const ENEMY_SPEED = 0.1;
const GROUND_HEIGHT = -80;

const START_TARGET = {
  position: [3.8, -11.7, 84],
  size: [6, 2, 4],
};

const RESTART_TARGET = {
  position: [-12, 4, 70],
  size: [10, 2, 4],
};

export const laserPositionState = atom({
  key: 'laserPositions', // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
});

function LaserController() {
  const shipPosition = useRecoilValue(shipPositionState);
  const [lasers, setLasers] = useRecoilState(laserPositionState);
  const onClickDocument = (e) => {
    setLasers([
      ...lasers,
      {
        id: Math.random(), // This needs to be unique.. Random isn't perfect but it works. Could use a uuid here.
        x: 0,
        y: 0,
        z: 0,
        velocity: [shipPosition.rotation.x * 6, shipPosition.rotation.y * -5],
      },
    ]);
  };
  useEffect(() => {
    // @ts-ignore
    document.addEventListener('click', onClickDocument, false);
    // @ts-ignore
    return () => document.removeEventListener('click', onClickDocument);
  });
  return null;
}

function StartButton() {
  const showStart = useRecoilValue(showStartState);

  if (!showStart) {
    return null;
  }

  const font = new FontLoader().parse(Roboto);

  // configure font geometry
  const textOptions = {
    font,
    size: 1,
    height: 1,
  };

  return (
    <group>
      <mesh position={START_TARGET.position}>
        <boxBufferGeometry attach="geometry" args={START_TARGET.size} />
        <meshStandardMaterial
          attach="material"
          emissive="#000000"
          color="#b80715"
        />
      </mesh>
      <mesh position={[6, -12, 79]} scale={[-1, 1, 1]}>
        <textGeometry attach="geometry" args={['START', textOptions]} />
        <meshStandardMaterial
          attach="material"
          emissive="#ffffff"
          color="#000"
        />
      </mesh>
    </group>
  );
}

function RestartButton() {
  const showStart = useRecoilValue(showStartState);

  if (showStart) {
    return null;
  }

  const font = new FontLoader().parse(Roboto);

  // configure font geometry
  const textOptions = {
    font,
    size: 1,
    height: 1,
  };

  return (
    <group>
      <mesh position={RESTART_TARGET.position}>
        <boxBufferGeometry attach="geometry" args={RESTART_TARGET.size} />
        <meshStandardMaterial
          attach="material"
          emissive="#000000"
          color="#044b22"
        />
      </mesh>
      <mesh position={[-6.7, 4.5, 40]} scale={[-1, 1, 1]}>
        <textGeometry attach="geometry" args={['RESTART', textOptions]} />
        <meshStandardMaterial
          attach="material"
          emissive="#ffffff"
          color="#000"
        />
      </mesh>
    </group>
  );
}

// Draws all of the lasers existing in state.
function Lasers() {
  const lasers = useRecoilValue(laserPositionState);
  return (
    <group>
      {lasers.map((laser) => (
        <mesh position={[laser.x, laser.y, laser.z]} key={`${laser.id}`}>
          <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
          <meshStandardMaterial attach="material" emissive="red" color="#000" />
        </mesh>
      ))}
    </group>
  );
}

function inBetween(val, high, low) {
  return val <= high && val >= low;
}

function makeHitTest(target) {
  return function (laser) {
    return ['x', 'y', 'z'].reduce((acc, val, i) => {
      let isBetween = false;
      if (val === 'z') {
        isBetween = inBetween(
          laser[val],
          target.position[i],
          target.position[i] - target.size[i],
        );
      } else {
        isBetween = inBetween(
          laser[val],
          target.position[i] + target.size[i] + 1,
          target.position[i] - 1,
        );
      }

      return acc && isBetween;
    }, true);
  };
}

function GameTimer() {
  const [showStart, setShowStart] = useRecoilState(showStartState);
  const [lasers, setLaserPositions] = useRecoilState(laserPositionState);

  useFrame(({ mouse }) => {
    const hitTestStart = makeHitTest(START_TARGET);

    const hitStart = !!lasers.filter(
      () => lasers.filter((laser) => hitTestStart(laser)).length > 0,
    ).length;

    const hitTestRestart = makeHitTest(RESTART_TARGET);

    const hitRestart = !!lasers.filter(
      () => lasers.filter((laser) => hitTestRestart(laser)).length > 0,
    ).length;

    if (hitStart && showStart) {
      setShowStart(false);
    } else if (hitRestart && !showStart) {
      setShowStart(true);
    }

    // Move the Lasers and remove lasers at end of range or that have hit the ground.
    setLaserPositions(
      lasers
        .map((laser) => ({
          id: laser.id,
          x: laser.x + laser.velocity[0],
          y: laser.y + laser.velocity[1],
          z: laser.z + LASER_Z_VELOCITY,
          velocity: laser.velocity,
        }))
        .filter((laser) => laser.z > -LASER_RANGE && laser.y > GROUND_HEIGHT),
    );
  });
  return null;
}

function App() {
  return (
    <>
      <Canvas
        style={{ background: '#000' }}
        camera={{ position: [0, 10, -50], fov: 20 }}
      >
        <RecoilRoot>
          <ambientLight intensity={1} />
          <Stars />
          <Suspense fallback={null}>
            <ShipRig />
          </Suspense>

          <Target />
          <Lasers />
          <LaserController />
          <GameTimer />
          <StartButton />
          <RestartButton />
        </RecoilRoot>
      </Canvas>
      <div style={{ color: '#fff', position: 'absolute', top: 16, left: 16 }}>
        <div>Click to shoot</div>
        <a href="https://github.com/syousif94/game-ui-assignment">
          Source Code
        </a>
      </div>
    </>
  );
}

export default App;
