'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { Trophy, ArrowLeft, Plus, X, Calendar, Users, Tag } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createCompetitionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  regDeadline: z.string().min(1, 'Registration deadline is required'),
  startDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CreateCompetitionFormValues = z.infer<typeof createCompetitionSchema>;

const CreateCompetitionPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateCompetitionFormValues>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: {
      title: '',
      description: '',
      capacity: 1,
      regDeadline: '',
      startDate: '',
      tags: []
    }
  });

  const watchedTags = watch('tags') || [];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'ORGANIZER') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      const newTags = [...watchedTags, tagInput.trim()];
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: CreateCompetitionFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Convert capacity to number
      const formData = {
        ...data,
        capacity: Number(data.capacity),
        regDeadline: new Date(data.regDeadline).toISOString(),
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      };

      const response = await apiClient.createCompetition(formData);
      
      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/competitions/${response.data.id}`);
        }, 2000);
      } else {
        setError(response.error || 'Failed to create competition');
      }
    } catch (error) {
      setError('Failed to create competition');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ORGANIZER') {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Competition Created!</h2>
          <p className="text-white/80">Redirecting to your competition...</p>
        </div>
      </div>
    );
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
            Create New Competition
          </h1>
          <p className="text-white/80 text-lg">
            Launch a new competition and start accepting registrations
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Competition Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${
                  errors.title ? 'border-red-400' : 'border-white/20'
                } rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
                placeholder="Enter competition title"
              />
              {errors.title && (
                <p className="text-red-200 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${
                  errors.description ? 'border-red-400' : 'border-white/20'
                } rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition resize-none`}
                placeholder="Describe your competition, rules, prizes, etc."
              />
              {errors.description && (
                <p className="text-red-200 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Capacity and Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('capacity', { valueAsNumber: true })}
                  className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${
                    errors.capacity ? 'border-red-400' : 'border-white/20'
                  } rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
                  placeholder="Maximum participants"
                />
                {errors.capacity && (
                  <p className="text-red-200 text-sm mt-1">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  {...register('regDeadline')}
                  className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${
                    errors.regDeadline ? 'border-red-400' : 'border-white/20'
                  } rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
                />
                {errors.regDeadline && (
                  <p className="text-red-200 text-sm mt-1">{errors.regDeadline.message}</p>
                )}
              </div>
            </div>

            {/* Start Date (Optional) */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                {...register('startDate')}
                className="w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 bg-white/10 placeholder-white/60 text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Display Tags */}
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-white transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Competition...' : 'Create Competition'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 text-white border border-white/20 rounded-lg hover:bg-white/10 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompetitionPage;
