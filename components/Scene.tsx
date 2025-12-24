
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 3500;

interface SceneProps {
  expansion: number;
}

const BaubleShader = {
  uniforms: {
    uTime: { value: 0 },
    uExpansion: { value: 0 },
  },
  vertexShader: `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vSize;

    void main() {
      vColor = color;
      vSize = size;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      // Adjust size based on distance for perspective
      gl_PointSize = size * (450.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    
    void main() {
      // Circle mask
      vec2 uv = gl_PointCoord - 0.5;
      float distSq = dot(uv, uv);
      if (distSq > 0.25) discard;

      // Calculate pseudo-normal for a sphere
      float z = sqrt(max(0.0, 0.25 - distSq));
      vec3 normal = normalize(vec3(uv, z));

      // Lighting vectors
      vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
      vec3 viewDir = vec3(0.0, 0.0, 1.0);

      // Diffuse
      float diffuse = max(dot(normal, lightDir), 0.0);
      
      // Specular (Glossy highlight)
      vec3 halfDir = normalize(lightDir + viewDir);
      float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);

      // Fresnel (Rim lighting for 3D depth)
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

      // Final Color Composition
      vec3 baseColor = vColor * (0.2 + 0.8 * diffuse);
      vec3 finalColor = baseColor + (specular * 0.5) + (fresnel * vColor * 0.4);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const Star: React.FC<{ expansion: number }> = ({ expansion }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.6;
    const innerRadius = 0.25;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const currAngle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(currAngle) * radius;
      const y = Math.sin(currAngle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
  }, []);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Star stays at peak when tree, follows center when expanded
    const targetY = THREE.MathUtils.lerp(6.4, 0, expansion);
    const targetScale = THREE.MathUtils.lerp(1.5, 0.4, expansion);
    
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    meshRef.current.scale.setScalar(targetScale * (1 + Math.sin(t * 4) * 0.05));
    meshRef.current.rotation.y += 0.02;
    // Slight rocking motion
    meshRef.current.rotation.z = Math.sin(t * 2) * 0.1;
  });

  return (
    <mesh ref={meshRef} geometry={starGeometry} position={[0, 6.4, 0]}>
      <meshStandardMaterial 
        color="#ffcc00" 
        emissive="#ffaa00" 
        emissiveIntensity={3} 
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
};

const Scene: React.FC<SceneProps> = ({ expansion }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const particles = useMemo(() => {
    const treePositions = new Float32Array(PARTICLE_COUNT * 3);
    const spherePositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const palette = [
      new THREE.Color('#ffd700'), // Vàng Gold
      new THREE.Color('#ff2200'), // Đỏ tươi
      new THREE.Color('#00ff44'), // Xanh lá Noel
      new THREE.Color('#ffffff'), // Trắng tuyết
      new THREE.Color('#00bbff'), // Xanh dương
      new THREE.Color('#ff00ff'), // Hồng tím
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;

      // 1. Dáng cây thông hình nón phân tầng (Tiered Tree)
      const h = Math.random() * 12; 
      const angle = (h * 5.5) + (Math.random() * Math.PI * 2);
      
      // Tạo hiệu ứng tán cây xòe ra ở mỗi tầng
      const tierFreq = 2.0;
      const baseRadius = (12.2 - h) * 0.38;
      const foliage = Math.pow(Math.sin(h * tierFreq), 2.0) * 0.3;
      const radius = baseRadius + foliage + (Math.random() * 0.15);
      
      treePositions[idx] = Math.cos(angle) * radius;
      treePositions[idx + 1] = h - 6; 
      treePositions[idx + 2] = Math.sin(angle) * radius;

      // 2. Hình cầu bùng nổ (Exploded Sphere)
      const r = 9 + Math.random() * 6;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();

      spherePositions[idx] = r * Math.sin(theta) * Math.cos(phi);
      spherePositions[idx + 1] = r * Math.sin(theta) * Math.sin(phi);
      spherePositions[idx + 2] = r * Math.cos(theta);

      // Chọn màu ngẫu nhiên cho quả châu
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[idx] = color.r;
      colors[idx + 1] = color.g;
      colors[idx + 2] = color.b;

      // Kích thước quả châu (Bauble size)
      sizes[i] = Math.random() * 0.7 + 0.3;
    }

    return { treePositions, spherePositions, colors, sizes };
  }, []);

  useFrame((state) => {
    const currentPositions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const { treePositions, spherePositions } = particles;
    
    // Smooth morphing animation
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      for (let j = 0; j < 3; j++) {
        const target = THREE.MathUtils.lerp(
          treePositions[idx + j], 
          spherePositions[idx + j], 
          expansion
        );
        currentPositions[idx + j] += (target - currentPositions[idx + j]) * 0.12;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0025;
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uExpansion.value = expansion;
    }
  });

  return (
    <>
      <Star expansion={expansion} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={particles.treePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_COUNT}
            array={particles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={PARTICLE_COUNT}
            array={particles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          transparent
          vertexShader={BaubleShader.vertexShader}
          fragmentShader={BaubleShader.fragmentShader}
          uniforms={BaubleShader.uniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
    </>
  );
};

export default Scene;
