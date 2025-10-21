# Frontend Setup Guide

This guide explains how to set up and run the Mini Compete frontend application.

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Backend API running on port 3001

## Environment Setup

1. Create a `.env.local` file in the frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

2. Install dependencies:
```bash
pnpm install
```

## Running the Application

1. Start the development server:
```bash
pnpm dev
```

2. Open your browser and navigate to `http://localhost:3000`

## Features Implemented

### Authentication
- ✅ Login page with email/password
- ✅ Signup page with role selection (Participant/Organizer)
- ✅ JWT token management
- ✅ Protected routes with authentication context

### Dashboard
- ✅ Role-based dashboard (Participant vs Organizer)
- ✅ Quick stats and navigation cards
- ✅ User profile display

### Competitions
- ✅ Browse all competitions with search and filtering
- ✅ Individual competition detail pages
- ✅ Registration functionality with idempotency
- ✅ Competition creation form for organizers
- ✅ My competitions page for organizers

### User Management
- ✅ My registrations page for participants
- ✅ Mailbox for notifications and confirmations

### UI/UX
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Form validation with Zod
- ✅ Modern gradient design

## API Integration

The frontend integrates with the backend API through:
- `lib/api.ts` - Centralized API client
- `contexts/AuthContext.tsx` - Authentication state management
- All API calls include proper error handling and loading states

## File Structure

```
app/
├── (auth)/
│   ├── login/page.tsx          # Login form
│   └── signup/page.tsx         # Signup form with role selection
├── competitions/
│   ├── page.tsx                # Browse competitions
│   └── [id]/page.tsx           # Competition details
├── create-competition/page.tsx # Create competition form
├── dashboard/page.tsx          # Main dashboard
├── mailbox/page.tsx            # User notifications
├── my-competitions/page.tsx    # Organizer's competitions
├── my-registrations/page.tsx   # User's registrations
└── page.tsx                    # Landing page

contexts/
└── AuthContext.tsx             # Authentication context

lib/
└── api.ts                      # API client utilities
```

## Key Features

1. **Role-based Access**: Different interfaces for Participants and Organizers
2. **Real-time Updates**: Automatic refresh of data
3. **Form Validation**: Client-side validation with helpful error messages
4. **Responsive Design**: Works on desktop and mobile devices
5. **Error Handling**: Graceful error handling throughout the app
6. **Loading States**: Visual feedback during API calls

## Development Notes

- Uses Next.js 15 with App Router
- Styled with Tailwind CSS
- Form handling with React Hook Form + Zod
- Icons from Lucide React
- TypeScript for type safety
