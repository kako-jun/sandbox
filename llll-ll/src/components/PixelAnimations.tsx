'use client';

import { useEffect, useState } from 'react';

export function FloatingSlime() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.sin(Date.now() * 0.001) * 10,
        y: Math.cos(Date.now() * 0.0008) * 5,
      });
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed bottom-4 right-4 text-2xl z-10 pointer-events-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      🟢
    </div>
  );
}

export function FloatingCat() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.cos(Date.now() * 0.0012) * 8,
        y: Math.sin(Date.now() * 0.001) * 6,
      });
    };

    const interval = setInterval(animate, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed bottom-4 left-4 text-2xl z-10 pointer-events-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      🐱
    </div>
  );
}

export function TetrisBlock() {
  const [blocks, setBlocks] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    const addBlock = () => {
      const newBlock = {
        id: Date.now(),
        x: Math.random() * (window.innerWidth - 20),
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      
      setBlocks(prev => [...prev, newBlock]);
    };

    const interval = setInterval(addBlock, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animate = () => {
      setBlocks(prev => 
        prev.map(block => ({
          ...block,
          y: block.y + 2,
        })).filter(block => block.y < window.innerHeight)
      );
    };

    const animationInterval = setInterval(animate, 50);
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <>
      {blocks.map(block => (
        <div
          key={block.id}
          className="fixed w-4 h-4 pixel-border pointer-events-none z-0"
          style={{
            left: block.x,
            top: block.y,
            backgroundColor: block.color,
            opacity: 0.6,
          }}
        />
      ))}
    </>
  );
}