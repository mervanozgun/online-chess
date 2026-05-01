import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Chess, PieceSymbol, Square } from 'chess.js';

interface ChessBoard3DProps {
  game: Chess;
  onMove: (from: string, to: string) => void;
  selectedSquare: string | null;
  setSelectedSquare: (sq: string | null) => void;
  playerColor: 'w' | 'b';
}

export const ChessBoard3D: React.FC<ChessBoard3DProps> = ({
  game,
  onMove,
  selectedSquare,
  setSelectedSquare,
  playerColor,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraAngle, setCameraAngle] = useState<number>(0);
  const [cameraHeight, setCameraHeight] = useState<number>(8);

  // Track the scene meshes to allow raycasting and cleanup
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const squaresRef = useRef<{ mesh: THREE.Mesh; id: string }[]>([]);

  // Update default camera orientation based on playerColor
  useEffect(() => {
    if (playerColor === 'b') {
      setCameraAngle(180);
    } else {
      setCameraAngle(0);
    }
  }, [playerColor]);

  // Handle all Three.js setup and rendering
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#111827'); // dark slate

    // 2. Camera
    const width = mountRef.current.clientWidth;
    const height = 400; // fixed height for board container
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    scene.add(camera);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8e7, 0.8);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 5. Board Grid & Pieces
    squaresRef.current = [];

    // Colors
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x4B382A, roughness: 0.6 });
    const lightWood = new THREE.MeshStandardMaterial({ color: 0xDFD2B4, roughness: 0.5 });
    const selectedMat = new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.4, emissive: 0x059669, emissiveIntensity: 0.3 });
    const validMoveMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, roughness: 0.4, emissive: 0x1D4ED8, emissiveIntensity: 0.3 });

    // White vs Black pieces material
    const whitePieceMat = new THREE.MeshStandardMaterial({
      color: 0xF5F5F7,
      roughness: 0.2,
      metalness: 0.3,
    });
    const blackPieceMat = new THREE.MeshStandardMaterial({
      color: 0x1F1F24,
      roughness: 0.2,
      metalness: 0.6,
    });

    const createPieceGeometry = (type: PieceSymbol) => {
      // Create modern stylized 3D geometries
      const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.1, 16);
      const pieceGroup = new THREE.Group();

      const baseMesh = new THREE.Mesh(baseGeo);
      baseMesh.position.y = 0.05;
      pieceGroup.add(baseMesh);

      switch (type) {
        case 'p': { // Pawn
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 12));
          shaft.position.y = 0.35;
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12));
          head.position.y = 0.65;
          pieceGroup.add(shaft, head);
          break;
        }
        case 'r': { // Rook
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.65, 16));
          shaft.position.y = 0.4;
          const crenelation = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8));
          crenelation.position.y = 0.75;
          pieceGroup.add(shaft, crenelation);
          break;
        }
        case 'n': { // Knight
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.55, 12));
          shaft.position.y = 0.35;
          const head = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 4));
          head.rotation.x = Math.PI / 4;
          head.position.set(0, 0.6, 0.1);
          pieceGroup.add(shaft, head);
          break;
        }
        case 'b': { // Bishop
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.65, 12));
          shaft.position.y = 0.4;
          const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 12));
          head.position.y = 0.8;
          pieceGroup.add(shaft, head);
          break;
        }
        case 'q': { // Queen
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.8, 16));
          shaft.position.y = 0.5;
          const crown = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.35, 16));
          crown.position.y = 0.95;
          pieceGroup.add(shaft, crown);
          break;
        }
        case 'k': { // King
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.34, 0.85, 16));
          shaft.position.y = 0.5;
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.3, 12));
          crown.position.y = 1.0;
          const topSphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8));
          topSphere.position.y = 1.2;
          pieceGroup.add(shaft, crown, topSphere);
          break;
        }
      }

      return pieceGroup;
    };

    // Construct full 8x8 Board
    const board = game.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    // Possible moves from the selected square
    const validMoves = selectedSquare
      ? game.moves({ square: selectedSquare as Square, verbose: true }).map((m) => m.to)
      : [];

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = `${files[f]}${8 - r}`;
        const isDark = (r + f) % 2 === 1;

        // Custom Highlight checks
        const isSelected = sq === selectedSquare;
        const isValidMove = validMoves.includes(sq as Square);

        let activeMat = isDark ? darkWood : lightWood;
        if (isSelected) activeMat = selectedMat;
        else if (isValidMove) activeMat = validMoveMat;

        // Create tile geometry
        const tileGeo = new THREE.BoxGeometry(1, 0.15, 1);
        const tileMesh = new THREE.Mesh(tileGeo, activeMat);

        // Position 8x8 board centered at origin (0,0)
        // Center of board coordinates goes from -3.5 to 3.5
        const xPos = f - 3.5;
        const zPos = r - 3.5;

        tileMesh.position.set(xPos, 0, zPos);
        tileMesh.receiveShadow = true;
        scene.add(tileMesh);

        // Register the square for the raycaster
        squaresRef.current.push({ mesh: tileMesh, id: sq });

        // Build piece model
        const piece = board[r][f];
        if (piece) {
          const mat = piece.color === 'w' ? whitePieceMat : blackPieceMat;
          const pieceModel = createPieceGeometry(piece.type);

          // Center children
          pieceModel.children.forEach((c: any) => {
            if (c.isMesh) {
              c.material = mat;
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });

          pieceModel.position.set(xPos, 0.08, zPos);
          if (piece.color === 'b') {
            pieceModel.rotation.y = Math.PI; // Face black pieces forward
          }
          scene.add(pieceModel);
        }
      }
    }

    // Camera dynamic controls based on Angle, Height
    const rad = (cameraAngle * Math.PI) / 180;
    const camX = Math.sin(rad) * 11;
    const camZ = Math.cos(rad) * 11;

    camera.position.set(camX, cameraHeight, camZ);
    camera.lookAt(0, 0, 0);

    // Animation / Rendering loop
    let animationFrameId: number;
    const animate = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 6. Interaction handling with raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        squaresRef.current.map((s) => s.mesh)
      );

      if (intersects.length > 0) {
        const hitSquare = squaresRef.current.find(
          (s) => s.mesh === intersects[0].object
        );
        if (hitSquare) {
          const sq = hitSquare.id;
          if (selectedSquare) {
            // Check if user tapped a valid target
            const validMoves = game
              .moves({ square: selectedSquare as Square, verbose: true })
              .map((m) => m.to);

            if (validMoves.includes(sq as Square)) {
              onMove(selectedSquare, sq);
            } else {
              // Toggle or select another piece if valid
              const p = game.get(sq as Square);
              if (p && p.color === playerColor) {
                setSelectedSquare(sq);
              } else {
                setSelectedSquare(null);
              }
            }
          } else {
            // Select piece on square
            const p = game.get(sq as Square);
            if (p && p.color === playerColor) {
              setSelectedSquare(sq);
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Cleanup when visual state updates
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [game, selectedSquare, cameraAngle, cameraHeight, playerColor]);

  // Adjust Camera options
  const rotateLeft = () => setCameraAngle((prev) => (prev + 30) % 360);
  const rotateRight = () => setCameraAngle((prev) => (prev - 30 + 360) % 360);
  const increaseHeight = () => setCameraHeight((prev) => Math.min(prev + 1, 15));
  const decreaseHeight = () => setCameraHeight((prev) => Math.max(prev - 1, 3));

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-700/50 p-3 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Dynamic 3D controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-3">
        <span className="text-sm text-slate-300 font-semibold tracking-wide">
          3D Görünüm Açı Kontrolleri:
        </span>
        <div className="flex gap-2">
          <button
            onClick={rotateLeft}
            className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
          >
            Sola Çevir
          </button>
          <button
            onClick={rotateRight}
            className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
          >
            Sağa Çevir
          </button>
          <button
            onClick={increaseHeight}
            className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
          >
            Görüşü Yükselt
          </button>
          <button
            onClick={decreaseHeight}
            className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
          >
            Görüşü Alçalt
          </button>
        </div>
      </div>

      {/* 3D Canvas mount point */}
      <div
        ref={mountRef}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl cursor-pointer overflow-hidden shadow-inner select-none"
        style={{ height: '400px' }}
      />

      {/* Instructional / Perspective message */}
      <div className="mt-2 text-center text-xs text-slate-400">
        Tahtadaki karelere tıklayarak taşları seçip hareket ettirebilirsiniz. {playerColor === 'w' ? 'Beyaz' : 'Siyah'} taşlarla oynuyorsunuz.
      </div>
    </div>
  );
};
