'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient, Competition, Registration } from '../../../lib/api';
import { Trophy, Calendar, Users, Tag, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const CompetitionDetailPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const competitionId = parseInt(params.id as string);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loadingCompetition, setLoadingCompetition] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'not-registered' | 'registered' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && competitionId) {
      fetchCompetition();
      checkRegistrationStatus();
    }
  }, [user, competitionId]);

  const fetchCompetition = async () => {
    try {
      setLoadingCompetition(true);
      const response = await apiClient.getCompetition(competitionId);
      if (response.data) {
        setCompetition(response.data);
      } else {
        setError(response.error || 'Failed to fetch competition');
      }
    } catch (error) {
      setError('Failed to fetch competition');
    } finally {
      setLoadingCompetition(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (user?.role !== 'PARTICIPANT') {
      setRegistrationStatus('not-registered');
      return;
    }

    try {
      const response = await apiClient.getUserRegistrations();
      if (response.data) {
        const isRegistered = response.data.some(
          (reg: Registration) => reg.competitionId === competitionId
        );
        setRegistrationStatus(isRegistered ? 'registered' : 'not-registered');
      }
    } catch (error) {
      setRegistrationStatus('not-registered');
    }
  };

  const handleRegister = async () => {
    if (!competition || user?.role !== 'PARTICIPANT') return;

    try {
      setIsRegistering(true);
      setError(null);

      // Generate idempotency key
      const idempotencyKey = `${user.id}-${competitionId}-${Date.now()}`;

      const response = await apiClient.registerForCompetition(competitionId, idempotencyKey);
      
      if (response.data) {
        setRegistrationStatus('registered');
        // Show success message or redirect
        alert('Successfully registered for the competition!');
      } else {
        setError(response.error || 'Failed to register for competition');
      }
    } catch (error) {
      setError('Failed to register for competition');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = (regDeadline: string) => {
    return new Date(regDeadline) > new Date();
  };

  const getRegistrationProgress = () => {
    if (!competition) return 0;
    const registered = competition._count?.registrations || 0;
    return (registered / competition.capacity) * 100;
  };

  if (loading || loadingCompetition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading competition...</div>
      </div>
    );
  }

  if (!user || !competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">
          {error || 'Competition not found'}
        </div>
      </div>
    );
  }

  const canRegister = user.role === 'PARTICIPANT' && 
                     isRegistrationOpen(competition.regDeadline) && 
                     registrationStatus === 'not-registered' &&
                     (competition._count?.registrations || 0) < competition.capacity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/competitions"
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Competitions
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {competition.title}
              </h1>
              {competition.organizer && (
                <p className="text-white/80">
                  Organized by <span className="font-medium">{competition.organizer.name}</span>
                </p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isRegistrationOpen(competition.regDeadline)
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {isRegistrationOpen(competition.regDeadline) ? 'Registration Open' : 'Registration Closed'}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
            <p className="text-white/80 leading-relaxed">
              {competition.description}
            </p>
          </div>

          {/* Tags */}
          {competition.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {competition.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Competition Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-5 h-5 text-blue-300" />
                <div>
                  <p className="font-medium">Registration Deadline</p>
                  <p className="text-white/80 text-sm">
                    {formatDate(competition.regDeadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white">
                <Users className="w-5 h-5 text-green-300" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-white/80 text-sm">
                    {competition._count?.registrations || 0} / {competition.capacity} participants
                  </p>
                </div>
              </div>

              {competition.startDate && (
                <div className="flex items-center gap-3 text-white">
                  <Clock className="w-5 h-5 text-purple-300" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-white/80 text-sm">
                      {formatDate(competition.startDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Progress */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">Registration Progress</h3>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getRegistrationProgress()}%` }}
                />
              </div>
              <p className="text-white/80 text-sm">
                {Math.round(getRegistrationProgress())}% filled
              </p>
            </div>
          </div>

          {/* Registration Status */}
          {user.role === 'PARTICIPANT' && (
            <div className="mb-8">
              {registrationStatus === 'registered' ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                  <div>
                    <p className="font-medium text-green-300">You're registered!</p>
                    <p className="text-green-200/80 text-sm">
                      You'll receive a confirmation email shortly.
                    </p>
                  </div>
                </div>
              ) : registrationStatus === 'not-registered' ? (
                <div className="flex items-center gap-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <XCircle className="w-6 h-6 text-blue-300" />
                  <div>
                    <p className="font-medium text-blue-300">Not registered</p>
                    <p className="text-blue-200/80 text-sm">
                      Join this competition to participate.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-300" />
                  <p className="text-yellow-300">Checking registration status...</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {user.role === 'PARTICIPANT' && canRegister && (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="flex-1 bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRegistering ? 'Registering...' : 'Register for Competition'}
              </button>
            )}

            {user.role === 'ORGANIZER' && competition.organizerId === user.id && (
              <Link
                href={`/competitions/${competition.id}/manage`}
                className="flex-1 bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
              >
                Manage Competition
              </Link>
            )}

            <Link
              href="/competitions"
              className="px-6 py-3 text-white border border-white/20 rounded-lg hover:bg-white/10 transition"
            >
              Back to Competitions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetailPage;
