import React from 'react'
import { Zap, Trophy, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link'

const page = () => {

    

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Trophy className="w-8 h-8" />
              <span className="text-2xl font-bold">mini-compete</span>
            </div>
            <div className="flex gap-3">
              <Link
                href={"/login"}
                className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition"
              >
                Login
              </Link>
              <Link
              href={"/signup"}
                
                className="px-5 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-4xl text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm">Fast. Simple. Competitive.</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Compete, Win,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Celebrate
              </span>
            </h1>
            
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join mini challenges, compete with friends, and climb the leaderboards. 
              Your next victory starts here.
            </p>
            
            <Link
             href={"/signup"} 
              className="group inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-20">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Trophy className="w-10 h-10 mb-3 mx-auto text-yellow-300" />
                <h3 className="font-semibold text-lg mb-2">Quick Challenges</h3>
                <p className="text-white/80 text-sm">Launch and join competitions in seconds</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Users className="w-10 h-10 mb-3 mx-auto text-green-300" />
                <h3 className="font-semibold text-lg mb-2">Social Competition</h3>
                <p className="text-white/80 text-sm">Compete with friends and community</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Zap className="w-10 h-10 mb-3 mx-auto text-blue-300" />
                <h3 className="font-semibold text-lg mb-2">Real-time Updates</h3>
                <p className="text-white/80 text-sm">Track your progress as it happens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default page