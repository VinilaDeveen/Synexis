import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import logo from '../assets/icons/initialLoader.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // Initialize particles animation
  useEffect(() => {
    // Initialize particles
    const initParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      direction: Math.random() * 360
    }));
    setParticles(initParticles);

    const particleTimer = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + Math.cos(particle.direction * Math.PI / 180) * particle.speed) % 100,
        y: (particle.y + Math.sin(particle.direction * Math.PI / 180) * particle.speed) % 100,
        opacity: Math.max(0.1, Math.min(0.5, particle.opacity + (Math.random() - 0.5) * 0.05))
      })));
    }, 80);

    return () => {
      clearInterval(particleTimer);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
   
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt:', { email, password });
    }, 2000);
  };

  return (
    <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated particle background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-cyan-400 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              filter: 'blur(1px)',
              boxShadow: `0 0 ${particle.size * 2}px rgba(6, 182, 212, 0.3)`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Animated Logo Header with Synexis-style Gears */}
        <div className="text-center mb-8">
          <div className="mb-12 relative">
            {/* Gear Assembly from Synexis Loader */}
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
          </div>
          <div className='flex ml-[110px]'>
            <div className='mt-5 w-7 h-7'>
                <img
                  alt="Synexis Logo"
                  src={logo}
                />
            </div>
            <div><h1 className="text-3xl font-bold text-white mt-4 mb-2">YNEXIS LOGIN</h1></div>
          </div>
          <p className="text-gray-400">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 backdrop-blur-sm bg-opacity-40">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute w-13 h-11 inset-y-0 right-0 mt-1 mr-2 pr-3 flex items-center text-gray-400 bg-gray-700 hover:text-gray-300 transition-colors duration-200 hover:border-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                backgroundColor: '#3C50E0',
                ':hover': {
                  backgroundColor: '#2940d3'
                }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2940d3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3C50E0'}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
       
        @keyframes counterClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
       
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
       
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;