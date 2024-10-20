"use client";

import { useEffect, useRef, useState } from "react";
import SpriteAnimation from "@/lib/components/sprite";

interface GameOverOverlayProps {
  onRestart: () => void;
}

function GameOverOverlay({ onRestart }: GameOverOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: "24px",
        zIndex: 10,
      }}
    >
      <div>
        <p>Game Over</p>
        <button
          onClick={onRestart}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWidth = 800;
  const canvasHeight = 400;
  const groundHeight = 50;

  const dino = {
    x: 50,
    y: canvasHeight - groundHeight - 130,
    width: 130,
    height: 130,
    dy: 0,
    isJumping: false,
  };

  const gravity = 1.25;
  let obstacles: Obstacle[] = [];
  const baseGameSpeed = 10;
  let currentGameSpeed = baseGameSpeed;
  const baseObstacleHeight = 50;
  let obstacleSpawnRate = 2000;
  let lastSpawn = -obstacleSpawnRate;
  const [isJumping, setIsJumping] = useState(false);
  const [dinoY, setDinoY] = useState(dino.y);
  const [enemyImage, setEnemyImage] = useState<HTMLImageElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null); // Background image state
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0); // State for the score
  const animationRef = useRef<number | null>(null);
  const updateRef = useRef<((timestamp: number) => void) | null>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameOverMusicRef = useRef<HTMLAudioElement | null>(null);
  const jumpMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/image/enemy.png";
    img.onload = () => setEnemyImage(img);

    const bgImg = new Image(); // Load the background image
    bgImg.src = "/image/alien.png"; // Update this path if needed
    bgImg.onload = () => setBackgroundImage(bgImg);
  }, []);

  useEffect(() => {
    // Initialize audio elements
    gameMusicRef.current = new Audio("/music/8-bit-arcade-mode.mp3");
    gameOverMusicRef.current = new Audio("/music/game-over.mp3");
    jumpMusicRef.current = new Audio("/music/jump.mp3");

    // Set game music to loop
    if (gameMusicRef.current) {
      gameMusicRef.current.loop = true;
      gameMusicRef.current.play();
    }

    return () => {
      // Stop all music when component unmounts
      if (gameMusicRef.current) gameMusicRef.current.pause();
      if (gameOverMusicRef.current) gameOverMusicRef.current.pause();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const update = (timestamp: number) => {
      if (isGameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the background image if it is loaded
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      }

      // Draw road
      ctx.fillStyle = "black";
      ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

      // Dino jump logic
      if (dino.isJumping) {
        dino.dy += gravity;
        dino.y += dino.dy;
        setDinoY(dino.y);

        if (dino.y >= canvasHeight - groundHeight - dino.height) {
          dino.y = canvasHeight - groundHeight - dino.height;
          dino.isJumping = false;
          setIsJumping(false);
          dino.dy = 0;
        }
      }

      // Move and draw obstacles
      obstacles.forEach((obstacle) => {
        obstacle.x -= currentGameSpeed;

        // Draw enemy image if the obstacle is of type 'enemy'
        if (obstacle.type === "enemy" && enemyImage) {
          ctx.drawImage(
            enemyImage,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
          );
        } else {
          ctx.fillStyle = "black";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(obstacles.indexOf(obstacle), 1);
        }

        // Define custom hitboxes with margins
        const dinoHitbox = {
          x: dino.x + 4,
          y: dino.y + 4,
          width: dino.width - 40,
          height: dino.height - 40,
        };

        // Check collision with obstacles using custom hitboxes
        const isColliding = obstacles.some((obstacle) => {
          const obstacleHitbox = {
            x: obstacle.x + 10,
            y: obstacle.y + 10,
            width: obstacle.width - 20,
            height: obstacle.height - 20,
          };

          return (
            dinoHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
            dinoHitbox.x + dinoHitbox.width > obstacleHitbox.x &&
            dinoHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
            dinoHitbox.y + dinoHitbox.height > obstacleHitbox.y
          );
        });

        if (isColliding) {
          setIsGameOver(true);
          cancelAnimationFrame(animationRef.current!);
          clearInterval(scoreIntervalRef.current!);
          // Stop game music and play game-over music
          if (gameMusicRef.current) gameMusicRef.current.pause();
          if (gameOverMusicRef.current) gameOverMusicRef.current.play();
        }
      });

      // Spawn new obstacles
      if (timestamp - lastSpawn > obstacleSpawnRate) {
        const obstacleHeight =
          baseObstacleHeight + Math.floor(Math.random() * 50);
        const obstacleType = Math.random() < 0.2 ? "enemy" : "regular";
        obstacles.push({
          x: canvas.width,
          y:
            canvasHeight -
            groundHeight -
            (obstacleType === "enemy" ? 70 : obstacleHeight),
          width: 80,
          height: obstacleType === "enemy" ? 70 : obstacleHeight,
          type: obstacleType,
        });

        lastSpawn = timestamp;
        obstacleSpawnRate = Math.floor(Math.random() * 1200) + 800;
      }

      animationRef.current = requestAnimationFrame(updateRef.current!);
    };

    updateRef.current = update;
    animationRef.current = requestAnimationFrame(update);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !dino.isJumping) {
        dino.isJumping = true;
        setIsJumping(true);
        dino.dy = -20;
        // Play jump sound effect
        if (jumpMusicRef.current) {
          jumpMusicRef.current.currentTime = 0;
          jumpMusicRef.current.play();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationRef.current!);
    };
  }, [dino.isJumping, enemyImage, isGameOver]);

  useEffect(() => {
    if (!isGameOver) {
      scoreIntervalRef.current = setInterval(() => {
        setScore((prevScore) => {
          const newScore = prevScore + 1;

          // Increase game speed and decrease obstacle spawn rate at score thresholds
          if (newScore % 180 === 0) {
            currentGameSpeed += 2;
            obstacleSpawnRate = Math.max(500, obstacleSpawnRate - 100);
          }

          return newScore;
        });
      }, 100);
    }

    return () => clearInterval(scoreIntervalRef.current!);
  }, [isGameOver]);

  const restartGame = () => {
    obstacles = [];
    setScore(0);
    setDinoY(dino.y);
    setIsGameOver(false);
    currentGameSpeed = baseGameSpeed;
    animationRef.current = requestAnimationFrame(updateRef.current!);

    if (gameMusicRef.current) {
      gameMusicRef.current.currentTime = 0;
      gameMusicRef.current.play();
    }

    if (gameOverMusicRef.current) {
      gameOverMusicRef.current.pause();
      gameOverMusicRef.current.currentTime = 0;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <SpriteAnimation
        isJumping={isJumping}
        dinoY={dinoY}
        canvasHeight={canvasHeight}
        groundHeight={groundHeight}
      />
      {isGameOver && <GameOverOverlay onRestart={restartGame} />}
      <div style={{ position: "absolute", top: 10, left: 10, color: "white" }}>
        Score: {score.toString().padStart(5, "0")}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="block m-auto border-2 border-solid border-[black]"
        // style={{
        //   border: "2px solid black",
        //   display: "block",
        //   margin: "auto",
        // }}
      ></canvas>
    </div>
  );
}
