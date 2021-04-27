## Game UI Assignment

## [DEMO](https://game-ui-assignment.netlify.app)

### How it works:

There's an empty array of laser cubes that are 1m^3.

When the user clicks, a new cube with a position at the center of the screen is added to the array.

60 times a second, the game checks the following:

1. The game iterates over the laser cube array and adjusts the x, y, z coordinates of the cubes in meters according to a constant velocity number.

2. It checks whether the laser's position is close to the volume of the targets. It's kind of buggy because I'm lazy.

3. It checks the mouse x,y position to rotate the ship and translate the targets.

4. It moves the stars towards the user until it resets near the end.

The ship is a standard .obj exported to .gltf in Blender, scaled down to about 12m in width.

The stars are a particle mesh which just is a rectangular box filled with random x,y,z positions that are mapped to white dots in this case. It's 2km x 2km x 20km.

```js
function Game() {
  return (
    <Canvas
      style={{ background: '#000' }}
      camera={{ position: [0, 10, -50], fov: 20 }}
    >
      <RecoilRoot>
        <ambientLight intensity={1} /> // sets the default brightness
        <Stars /> // particle mesh moving towards the user
        <Suspense fallback={null}>
          <ShipRig /> // ship model being loaded over the network without
          blocking the rest of the page
        </Suspense>
        <Target /> // two instances of a target image being translated across the
        page
        <Lasers /> // array of cube meshes
        <LaserController /> // listens for clicks to spawn new lasers
        <GameTimer /> // updates the laser positions and checks for collisions
        <StartButton /> // block mesh in space
        <RestartButton />
      </RecoilRoot>
    </Canvas>
  );
}
```
