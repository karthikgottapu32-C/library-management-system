import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';
import ErrorBoundary from '../ErrorBoundary';

function BookGeometry({ position, color, rotation }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
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

export default function Hero3D() {
  return (
    <div className="absolute right-0 top-0 w-80 h-48 pointer-events-none opacity-70 overflow-hidden">
      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ powerPreference: "high-performance", antialias: false }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.6} color="#3B82F6" />
          <pointLight position={[10, -10, 10]} intensity={0.6} color="#8B5CF6" />
          <PresentationControls global config={{ mass: 2, tension: 500 }} snap={{ mass: 4, tension: 1500 }}>
            <BookGeometry position={[-1, 0.2, 0]} color="#3B82F6" rotation={[0, 0.5, 0]} />
            <BookGeometry position={[0.7, -0.4, -0.5]} color="#8B5CF6" rotation={[0.2, -0.3, 0.1]} />
            <BookGeometry position={[1.6, 0.6, -1.5]} color="#22D3EE" rotation={[-0.1, 0.2, -0.2]} />
          </PresentationControls>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
