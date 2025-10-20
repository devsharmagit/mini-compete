
"use client"
import { Eye, EyeOff, Trophy } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeToTerms: z.boolean().refine((val) => val === true, { message: 'You must agree to the terms' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  });

  const onSubmit = (data: SignupFormValues) => {
    console.log('Signup submitted:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <nav className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Trophy className="w-8 h-8" />
            <span className="text-2xl font-bold">mini-compete</span>
          </div>
          <div className="flex gap-3">
            <Link
              href={"/"}
              className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition"
            >
              Home
            </Link>
            <Link
              href={"/login"}
              className="px-5 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-white mb-2">
              <Trophy className="w-8 h-8" />
              <span className="text-2xl font-semibold">mini-compete</span>
            </div>
            <p className="text-white/80">Create your account</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-white">
            <h2 className="text-2xl font-semibold mb-6">Create Account</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${errors.name ? 'border-red-400' : 'border-white/20'} rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-red-200 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${errors.email ? 'border-red-400' : 'border-white/20'} rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-200 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${errors.password ? 'border-red-400' : 'border-white/20'} rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-red-200 text-sm mt-1">{errors.password.message}</p>
                ) : (
                  <p className="text-white/80 text-xs mt-1">At least 8 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${errors.confirmPassword ? 'border-red-400' : 'border-white/20'} rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-200 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className="mt-1 rounded border-white/30 bg-white/10 text-white"
                  />
                  <span className="text-sm text-white/80">
                    I agree to the <button type="button" className="underline">Terms of Service</button> and <button type="button" className="underline">Privacy Policy</button>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-200 text-sm mt-1">{errors.agreeToTerms.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/80">
              Already have an account? <Link href="/login" className="underline hover:text-white">Login</Link>
            </div>
            <div className='text-center mt-4'>
              <Link href='/' className="w-full text-white/80 hover:text-white text-sm">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;