'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, Competition } from '../../lib/api';
import { Trophy, Calendar, Users, Tag, ArrowLeft, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const CompetitionsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCompetitions();
    }
  }, [user]);

  const fetchCompetitions = async () => {
    try {
      setLoadingCompetitions(true);
      const response = await apiClient.getCompetitions();
      if (response.data) {
        setCompetitions(response.data.data);
        // Extract unique tags
        const tags = new Set<string>();
        response.data.data.forEach(comp => {
          comp.tags.forEach(tag => tags.add(tag));
        });
        setAvailableTags(Array.from(tags));
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
    } finally {
      setLoadingCompetitions(false);
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || comp.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

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
        <div className="text-white text-xl">Loading competitions...</div>
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
            All Competitions
          </h1>
          <p className="text-white/80 text-lg">
            Discover and join exciting competitions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-white/60" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none"
              >
                <option value="">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag} className="bg-gray-800">
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        {filteredCompetitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No competitions found</h3>
            <p className="text-white/80">
              {searchTerm || selectedTag 
                ? 'Try adjusting your search or filter criteria'
                : 'No competitions are available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => (
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
                  {competition.organizer && (
                    <div className="text-white/60 text-sm">
                      by {competition.organizer.name}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Link
                  href={`/competitions/${competition.id}`}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-center transition ${
                    isRegistrationOpen(competition.regDeadline)
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'bg-white/20 text-white/60 cursor-not-allowed'
                  }`}
                >
                  {isRegistrationOpen(competition.regDeadline) ? 'View Details' : 'Registration Closed'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsPage;
