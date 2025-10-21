'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Users, Calendar, Mail, Plus, LogOut, User } from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isOrganizer = user.role === 'ORGANIZER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Trophy className="w-8 h-8" />
              <span className="text-2xl font-bold">mini-compete</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                <span className="text-sm">{user.name}</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-white/80 text-lg">
            {isOrganizer 
              ? 'Manage your competitions and track registrations'
              : 'Discover and join exciting competitions'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-blue-300" />
              <h3 className="font-semibold">Active Competitions</h3>
            </div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-white/80">Available to join</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-green-300" />
              <h3 className="font-semibold">My Registrations</h3>
            </div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-white/80">Competitions joined</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-yellow-300" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-white/80">Unread messages</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* View Competitions */}
          <Link
            href="/competitions"
            className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <h3 className="font-semibold text-lg">Browse Competitions</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Discover and join exciting competitions
            </p>
            <div className="text-sm text-white/60 group-hover:text-white transition">
              View all competitions →
            </div>
          </Link>

          {/* My Registrations */}
          <Link
            href="/my-registrations"
            className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-green-300" />
              <h3 className="font-semibold text-lg">My Registrations</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              View your competition registrations
            </p>
            <div className="text-sm text-white/60 group-hover:text-white transition">
              View registrations →
            </div>
          </Link>

          {/* Mailbox */}
          <Link
            href="/mailbox"
            className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-6 h-6 text-blue-300" />
              <h3 className="font-semibold text-lg">Mailbox</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              View notifications and confirmations
            </p>
            <div className="text-sm text-white/60 group-hover:text-white transition">
              Check messages →
            </div>
          </Link>

          {/* Organizer-specific actions */}
          {isOrganizer && (
            <>
              <Link
                href="/create-competition"
                className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition border border-white/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Plus className="w-6 h-6 text-purple-300" />
                  <h3 className="font-semibold text-lg">Create Competition</h3>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Launch a new competition
                </p>
                <div className="text-sm text-white/60 group-hover:text-white transition">
                  Create now →
                </div>
              </Link>

              <Link
                href="/my-competitions"
                className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition border border-white/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-orange-300" />
                  <h3 className="font-semibold text-lg">My Competitions</h3>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Manage your competitions
                </p>
                <div className="text-sm text-white/60 group-hover:text-white transition">
                  Manage →
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;