"use client"
import { Eye, EyeOff, Trophy } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormValues = z.infer<typeof loginSchema>

const Page = () => {

  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = (values: LoginFormValues) => {
    console.log('Login submitted:', values)
  }
    
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
              href={"/signup"}
              className="px-5 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-white mb-2">
              <Trophy className="w-10 h-10" />
              <span className="text-3xl font-semibold">mini-compete</span>
            </div>
            <p className="text-white/80">Welcome back</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-white">
            <h2 className="text-2xl font-semibold mb-6">Login</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    className={`w-full px-4 py-3 bg-white/10 placeholder-white/60 text-white border ${errors.password ? 'border-red-400' : 'border-white/20'} rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none transition`}
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
                {errors.password && (
                  <p className="text-red-200 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/30 bg-white/10 text-white" />
                  <span className="text-white/80">Remember me</span>
                </label>
                <button type="button" className="text-white underline font-medium hover:text-white/80">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/80">
              Don't have an account? <Link href="/signup" className="underline hover:text-white">Sign up</Link>
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
  )
}

export default Page