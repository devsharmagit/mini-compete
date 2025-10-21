'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, Competition } from '../../lib/api';
import { Trophy, ArrowLeft, Calendar, Users, Tag, Plus, ExternalLink, Edit } from 'lucide-react';
import Link from 'next/link';

const MyCompetitionsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'ORGANIZER') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'ORGANIZER') {
      fetchMyCompetitions();
    }
  }, [user]);

  const fetchMyCompetitions = async () => {
    try {
      setLoadingCompetitions(true);
      const response = await apiClient.getCompetitions();
      if (response.data) {
        // Filter competitions created by the current user
        const myCompetitions = response.data.competitions.filter(
          comp => comp.organizerId === user?.id
        );
        setCompetitions(myCompetitions);
      } else {
        setError(response.error || 'Failed to fetch competitions');
      }
    } catch (error) {
      setError('Failed to fetch competitions');
    } finally {
      setLoadingCompetitions(false);
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

  if (loading || loadingCompetitions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading your competitions...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ORGANIZER') {
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
            <Link
              href="/create-competition"
              className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Plus className="w-4 h-4" />
              Create Competition
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            My Competitions
          </h1>
          <p className="text-white/80 text-lg">
            Manage your competitions and track registrations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Competitions */}
        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No competitions yet</h3>
            <p className="text-white/80 mb-6">
              Create your first competition to start accepting registrations.
            </p>
            <Link
              href="/create-competition"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Plus className="w-4 h-4" />
              Create Your First Competition
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white line-clamp-2">
                    {competition.title}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isRegistrationOpen(competition.regDeadline)
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {isRegistrationOpen(competition.regDeadline) ? 'Open' : 'Closed'}
                  </div>
                </div>

                <p className="text-white/80 text-sm mb-4 line-clamp-3">
                  {competition.description}
                </p>

                {/* Tags */}
                {competition.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {competition.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Competition Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Users className="w-4 h-4" />
                    <span>
                      {competition._count?.registrations || 0} / {competition.capacity} participants
                    </span>
                  </div>
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
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/competitions/${competition.id}`}
                    className="flex-1 py-2 px-3 rounded-lg font-medium text-center transition bg-white text-indigo-600 hover:bg-gray-100 flex items-center justify-center gap-1 text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </Link>
                  <Link
                    href={`/competitions/${competition.id}/manage`}
                    className="flex-1 py-2 px-3 rounded-lg font-medium text-center transition bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit className="w-3 h-3" />
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchMyCompetitions}
            disabled={loadingCompetitions}
            className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-60"
          >
            {loadingCompetitions ? 'Refreshing...' : 'Refresh Competitions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCompetitionsPage;
