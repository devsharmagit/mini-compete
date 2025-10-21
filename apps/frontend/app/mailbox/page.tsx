'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, MailBox } from '../../lib/api';
import { Trophy, ArrowLeft, Mail, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const MailboxPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MailBox[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await apiClient.getMailbox();
      if (response.data && response.data.emails) {
        setMessages(response.data.emails);
      } else {
        setError(response.error || 'Failed to fetch messages');
      }
    } catch (error) {
      setError('Failed to fetch messages');
    } finally {
      setLoadingMessages(false);
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

  const getMessageIcon = (subject: string) => {
    if (subject.toLowerCase().includes('confirmation')) {
      return <CheckCircle className="w-5 h-5 text-green-300" />;
    } else if (subject.toLowerCase().includes('reminder')) {
      return <Clock className="w-5 h-5 text-yellow-300" />;
    }
    return <Mail className="w-5 h-5 text-blue-300" />;
  };

  if (loading || loadingMessages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading messages...</div>
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mailbox
          </h1>
          <p className="text-white/80 text-lg">
            Your notifications and confirmations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-white/80">
              You'll receive notifications here when you register for competitions or when competitions you're interested in have updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.subject)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {message.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(message.sentAt)}</span>
                      </div>
                    </div>
                    
                    <div className="text-white/80 text-sm mb-3">
                      <span className="font-medium">To:</span> {message.to}
                    </div>
                    
                    <div className="text-white/90 leading-relaxed">
                      {message.body.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchMessages}
            disabled={loadingMessages}
            className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-60"
          >
            {loadingMessages ? 'Refreshing...' : 'Refresh Messages'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MailboxPage;
