import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export default React.forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('/ship.glb');
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh
        geometry={nodes['13886_UFO_V1_l2'].geometry}
        material={materials['02___Default']}
      />
    </group>
  );
});

useGLTF.preload('/ship.glb');
