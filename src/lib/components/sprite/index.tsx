import Image from "next/image";
import { useEffect, useState } from "react";

// Import different sprite images
import sprite1 from "../../../../public/image/sprites/sprite1.png";
import sprite2 from "../../../../public/image/sprites/sprite2.png";
import sprite3 from "../../../../public/image/sprites/sprite3.png";
import sprite4 from "../../../../public/image/sprites/sprite4.png";

export default function SpriteAnimation({ isJumping, dinoY }) {
  const [currentSprite, setCurrentSprite] = useState(sprite2); // Start with walking animation
  const walkingSprites = [sprite2, sprite3, sprite4];
  let walkingIndex = 0;
  const walkingInterval = 100; // Milliseconds between sprite changes

  useEffect(() => {
    if (isJumping) {
      setCurrentSprite(sprite1);
      return;
    }

    const interval = setInterval(() => {
      // Cycle through walking sprites
      walkingIndex = (walkingIndex + 1) % walkingSprites.length;
      setCurrentSprite(walkingSprites[walkingIndex]);
    }, walkingInterval);

    return () => clearInterval(interval);
  }, [isJumping]);

  return (
    <Image
      src={currentSprite}
      alt="Dino sprite"
      style={{
        position: "absolute",
        left: 10, // Dino's x position
        top: dinoY, // Set the top position to dinoY
        width: 120,
        height: 140,
      }}
    />
  );
}
