'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, Registration } from '../../lib/api';
import { Trophy, ArrowLeft, Calendar, Users, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const MyRegistrationsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      setLoadingRegistrations(true);
      const response = await apiClient.getUserRegistrations();
      if (response.data) {
        setRegistrations(response.data.registrations);
      } else {
        setError(response.error || 'Failed to fetch registrations');
      }
    } catch (error) {
      setError('Failed to fetch registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = (regDeadline: string) => {
    return new Date(regDeadline) > new Date();
  };

  const getRegistrationStatus = (competition: any) => {
    if (!isRegistrationOpen(competition.regDeadline)) {
      return {
        status: 'closed',
        text: 'Registration Closed',
        color: 'bg-red-500/20 text-red-300'
      };
    }
    return {
      status: 'open',
      text: 'Registration Open',
      color: 'bg-green-500/20 text-green-300'
    };
  };

  if (loading || loadingRegistrations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading registrations...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-2 text-white">
                <Trophy className="w-8 h-8" />
                <span className="text-2xl font-bold">mini-compete</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            My Registrations
          </h1>
          <p className="text-white/80 text-lg">
            Track your competition registrations and status
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Registrations */}
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No registrations yet</h3>
            <p className="text-white/80 mb-6">
              You haven't registered for any competitions yet. Start exploring!
            </p>
            <Link
              href="/competitions"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Competitions
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => {
              const competition = registration.competition;
              if (!competition) return null;
              
              const status = getRegistrationStatus(competition);
              
              return (
                <div
                  key={registration.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white line-clamp-2">
                      {competition.title}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </div>
                  </div>

                  <p className="text-white/80 text-sm mb-4 line-clamp-3">
                    {competition.description}
                  </p>

                

                  {/* Competition Details */}
                  <div className="space-y-2 mb-4">
                   
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Registration closes: {formatDate(competition.regDeadline)}</span>
                    </div>
                    {competition.startDate && (
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Starts: {formatDate(competition.startDate)}</span>
                      </div>
                    )}
                    <div className="text-white/60 text-sm">
                      Registered: {formatDate(registration.createdAt || registration.createdAt)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/competitions/${competition.id}`}
                    className="w-full py-3 px-4 rounded-lg font-medium text-center transition bg-white text-indigo-600 hover:bg-gray-100 flex items-center justify-center gap-2"
                  >
                    View Competition
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchRegistrations}
            disabled={loadingRegistrations}
            className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-60"
          >
            {loadingRegistrations ? 'Refreshing...' : 'Refresh Registrations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyRegistrationsPage;
