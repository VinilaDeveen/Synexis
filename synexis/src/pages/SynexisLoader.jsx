import React, { useState, useEffect } from 'react';
import logo from '../assets/icons/initialLoader.png';

const SynexisLoader = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [currentMessage, setCurrentMessage] = useState(0);
  const [particles, setParticles] = useState([]);

  const loadingMessages = [
    "Initializing system components...",
    "Loading user interface...",
    "Connecting to services...",
    "Preparing workspace...",
    "Almost ready..."
  ];

  useEffect(() => {
    let currentStep = 0;
    
    const runLoadingSequence = () => {
      if (currentStep < loadingMessages.length) {
        setCurrentMessage(currentStep);
        setProgress(0);
        
        // Animate progress to 100% over 2 seconds for each step
        const stepTimer = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(stepTimer);
              setTimeout(() => {
                currentStep++;
                runLoadingSequence();
              }, 500); // Brief pause before next step
              return 100;
            }
            return prev + 2; // Smooth increment to reach 100% in ~2 seconds
          });
        }, 40);
      }
    };
    
    runLoadingSequence();

    const dotsTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 600);

    // Initialize particles
    const initParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      direction: Math.random() * 360
    }));
    setParticles(initParticles);

    const particleTimer = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + Math.cos(particle.direction * Math.PI / 180) * particle.speed) % 100,
        y: (particle.y + Math.sin(particle.direction * Math.PI / 180) * particle.speed) % 100,
        opacity: particle.opacity + (Math.random() - 0.5) * 0.1
      })));
    }, 50);

    return () => {
      clearInterval(dotsTimer);
      clearInterval(particleTimer);
    };
  }, []);

  // Gear component with customizable size and direction
  const Gear = ({ size, direction = 'clockwise', speed = '3s', className = '' }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={`text-white animate-spin ${className}`}
      style={{ 
        animationDuration: speed,
        animationDirection: direction === 'counterclockwise' ? 'reverse' : 'normal'
      }}
    >
      <path 
        className="fill-none stroke-current stroke-2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeMiterlimit="10"
        d="M28.7,13.4c-0.3-1.7-1-3.2-1.9-4.6c-1.5,0.8-3,0.9-3.8,0.1c-0.8-0.8-0.7-2.2,0.1-3.8c-1.4-0.9-2.9-1.6-4.6-1.9
          C18.1,4.9,17.1,6,16,6s-2.1-1.1-2.6-2.7c-1.7,0.3-3.2,1-4.6,1.9c0.8,1.5,0.9,3,0.1,3.8S6.7,9.6,5.2,8.8c-0.9,1.4-1.6,2.9-1.9,4.6
          C4.9,13.9,6,14.9,6,16s-1.1,2.1-2.7,2.6c0.3,1.7,1,3.2,1.9,4.6c1.5-0.8,3-0.9,3.8-0.1s0.7,2.2-0.1,3.8c1.4,0.9,2.9,1.6,4.6,1.9
          c0.5-1.6,1.5-2.7,2.6-2.7s2.1,1.1,2.6,2.7c1.7-0.3,3.2-1,4.6-1.9c-0.8-1.5-0.9-3-0.1-3.8c0.8-0.8,2.2-0.7,3.8,0.1
          c0.9-1.4,1.6-2.9,1.9-4.6C27.1,18.1,26,17.1,26,16S27.1,13.9,28.7,13.4z"
      />
      <circle 
        className="fill-none stroke-current stroke-2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeMiterlimit="10"
        cx="16" 
        cy="16" 
        r="3"
      />
    </svg>
  );

  return (
    <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated particle background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-blue-400 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: Math.max(0.1, Math.min(0.6, particle.opacity)),
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        {/* Logo with Multiple Gears */}
        <div className="mb-12 relative">
          {/* Gear Assembly */}
          <div className="relative inline-block">
            {/* Main Center Gear - Largest */}
            <div className="relative z-10">
              <svg 
                width="100" 
                height="100" 
                viewBox="0 0 32 32" 
                className="text-white animate-spin"
                style={{ animationDuration: '3s' }}
              >
                <path 
                  className="fill-none stroke-current stroke-2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeMiterlimit="10"
                  d="M28.7,13.4c-0.3-1.7-1-3.2-1.9-4.6c-1.5,0.8-3,0.9-3.8,0.1c-0.8-0.8-0.7-2.2,0.1-3.8c-1.4-0.9-2.9-1.6-4.6-1.9
                    C18.1,4.9,17.1,6,16,6s-2.1-1.1-2.6-2.7c-1.7,0.3-3.2,1-4.6,1.9c0.8,1.5,0.9,3,0.1,3.8S6.7,9.6,5.2,8.8c-0.9,1.4-1.6,2.9-1.9,4.6
                    C4.9,13.9,6,14.9,6,16s-1.1,2.1-2.7,2.6c0.3,1.7,1,3.2,1.9,4.6c1.5-0.8,3-0.9,3.8-0.1s0.7,2.2-0.1,3.8c1.4,0.9,2.9,1.6,4.6,1.9
                    c0.5-1.6,1.5-2.7,2.6-2.7s2.1,1.1,2.6,2.7c1.7-0.3,3.2-1,4.6-1.9c-0.8-1.5-0.9-3-0.1-3.8c0.8-0.8,2.2-0.7,3.8,0.1
                    c0.9-1.4,1.6-2.9,1.9-4.6C27.1,18.1,26,17.1,26,16S27.1,13.9,28.7,13.4z"
                />
                <circle 
                  className="fill-none stroke-current stroke-2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeMiterlimit="10"
                  cx="16" 
                  cy="16" 
                  r="3"
                />
              </svg>
              {/* Center glow effect */}
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse" />
            </div>
            
            {/* Top Right Gear - Medium */}
            <div className="absolute -top-6 -right-8 z-5">
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 32 32" 
                className="text-blue-300 animate-spin"
                style={{ animationDuration: '2s', animationDirection: 'reverse' }}
              >
                <path 
                  className="fill-none stroke-current stroke-2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeMiterlimit="10"
                  d="M28.7,13.4c-0.3-1.7-1-3.2-1.9-4.6c-1.5,0.8-3,0.9-3.8,0.1c-0.8-0.8-0.7-2.2,0.1-3.8c-1.4-0.9-2.9-1.6-4.6-1.9
                    C18.1,4.9,17.1,6,16,6s-2.1-1.1-2.6-2.7c-1.7,0.3-3.2,1-4.6,1.9c0.8,1.5,0.9,3,0.1,3.8S6.7,9.6,5.2,8.8c-0.9,1.4-1.6,2.9-1.9,4.6
                    C4.9,13.9,6,14.9,6,16s-1.1,2.1-2.7,2.6c0.3,1.7,1,3.2,1.9,4.6c1.5-0.8,3-0.9,3.8-0.1s0.7,2.2-0.1,3.8c1.4,0.9,2.9,1.6,4.6,1.9
                    c0.5-1.6,1.5-2.7,2.6-2.7s2.1,1.1,2.6,2.7c1.7-0.3,3.2-1,4.6-1.9c-0.8-1.5-0.9-3-0.1-3.8c0.8-0.8,2.2-0.7,3.8,0.1
                    c0.9-1.4,1.6-2.9,1.9-4.6C27.1,18.1,26,17.1,26,16S27.1,13.9,28.7,13.4z"
                />
                <circle 
                  className="fill-none stroke-current stroke-2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeMiterlimit="10"
                  cx="16" 
                  cy="16" 
                  r="3"
                />
              </svg>
              <div className="absolute inset-0 bg-blue-300 rounded-full blur-lg opacity-15 animate-pulse" />
            </div>
            
            {/* Bottom Left Gear - Medium */}
            <div className="absolute -bottom-6 -left-8 z-5">
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 32 32" 
                className="text-cyan-300 animate-spin"
                style={{ animationDuration: '4s' }}
              >
                <path 
                  className="fill-none stroke-current stroke-2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeMiterlimit="10"
                  d="M28.7,13.4c-0.3-1.7-1-3.2-1.9-4.6c-1.5,0.8-3,0.9-3.8,0.1c-0.8-0.8-0.7-2.2,0.1-3.8c-1.4-0.9-2.9-1.6-4.6-1.9
                    C18.1,4.9,17.1,6,16,6s-2.1-1.1-2.6-2.7c-1.7,0.3-3.2,1-4.6,1.9c0.8,1.5,0.9,3,0.1,3.8S6.7,9.6,5.2,8.8c-0.9,1.4-1.6,2.9-1.9,4.6
                    C4.9,13.9,6,14.9,6,16s-1.1,2.1-2.7,2.6c0.3,1.7,1,3.2,1.9,4.6c1.5-0.8,3-0.9,3.8-0.1s0.7,2.2-0.1,3.8c1.4,0.9,2.9,1.6,4.6,1.9
                    c0.5-1.6,1.5-2.7,2.6-2.7s2.1,1.1,2.6,2.7c1.7-0.3,3.2-1,4.6-1.9c-0.8-1.5-0.9-3-0.1-3.8c0.8-0.8,2.2-0.7,3.8,0.1
                    c0.9-1.4,1.6-2.9,1.9-4.6C27.1,18.1,26,17.1,26,16S27.1,13.9,28.7,13.4z"
                />
                <circle 
                  className="fill-none stroke-current stroke-2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeMiterlimit="10"
                  cx="16" 
                  cy="16" 
                  r="3"
                />
              </svg>
              <div className="absolute inset-0 bg-cyan-300 rounded-full blur-lg opacity-15 animate-pulse" />
            </div>
            
            {/* Connection lines/energy flows */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Animated connection lines */}
              <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-transparent transform -translate-y-1/2 -translate-x-1/2 rotate-45 opacity-30 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent transform -translate-y-1/2 -translate-x-1/2 -rotate-45 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          
          {/* SYNEXIS Text */}
          <div className="mt-12">
            <div className="flex ml-14">
                <div className='w-12 h-12'>
                    <img
                        alt="Synexis Logo"
                        src={logo}
                    />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white tracking-wider">
                    YNEXIS
                  </h1>
                </div>
            </div>
            <div className="text-sm text-gray-400 mt-2 tracking-widest">
              INTEGRATED OPERATIONS MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="space-y-6">
          {/* Loading Text */}
          <div className="text-gray-300 text-lg">
            {loadingMessages[currentMessage]}{dots}
          </div>
          
          {/* Progress Bar */}
          <div className="w-80 mx-auto">
            <div className="bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 via-cyan-400 to-white h-2 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}% `}}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynexisLoader;