
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';

function BookGeometry({ position, color, rotation }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = rotation[1] + Math.sin(t / 2) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={position}>
      <mesh ref={meshRef} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.2, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
}

import ErrorBoundary from '../ErrorBoundary';

export default function Hero3D() {
  return (
    <div className="absolute right-0 top-0 w-96 h-96 pointer-events-none opacity-60">
      <ErrorBoundary>
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }} gl={{ powerPreference: "high-performance", antialias: false }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
          <pointLight position={[10, -10, 10]} intensity={0.5} color="#8B5CF6" />
          <PresentationControls global config={{ mass: 2, tension: 500 }} snap={{ mass: 4, tension: 1500 }}>
            <BookGeometry position={[-1, 0.5, 0]} color="#3B82F6" rotation={[0, 0.5, 0]} />
            <BookGeometry position={[0.5, -0.5, -1]} color="#8B5CF6" rotation={[0.2, -0.3, 0.1]} />
            <BookGeometry position={[1.5, 1, -2]} color="#22D3EE" rotation={[-0.1, 0.2, -0.2]} />
          </PresentationControls>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
