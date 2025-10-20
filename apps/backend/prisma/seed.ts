import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in correct order to avoid FK constraints)
  await prisma.mailBox.deleteMany();
  await prisma.failedJob.deleteMany();
  await prisma.idempotencyRecord.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create 2 Organizers
  const organizers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        role: Role.ORGANIZER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: hashedPassword,
        role: Role.ORGANIZER,
      },
    }),
  ]);

  console.log('✅ Created 2 organizers');

  // Create 5 Participants
  const participants = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Eve Martinez',
        email: 'eve@example.com',
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Frank Wilson',
        email: 'frank@example.com',
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Grace Lee',
        email: 'grace@example.com',
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    }),
  ]);

  console.log('✅ Created 5 participants');

  // Helper function to create dates
  const daysFromNow = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // Create 5 Competitions
  const competitions = await Promise.all([
    prisma.competition.create({
      data: {
        title: 'Annual Coding Challenge 2025',
        description: 'Test your algorithmic skills in this year\'s most challenging coding competition. Solve complex problems and compete for amazing prizes!',
        tags: ['programming', 'algorithms', 'competitive'],
        capacity: 100,
        regDeadline: daysFromNow(7),
        startDate: daysFromNow(14),
        organizerId: organizers[0].id,
      },
    }),
    prisma.competition.create({
      data: {
        title: 'Startup Pitch Competition',
        description: 'Present your innovative startup idea to top investors. Get funding and mentorship opportunities.',
        tags: ['business', 'startup', 'pitching'],
        capacity: 30,
        regDeadline: daysFromNow(5),
        startDate: daysFromNow(10),
        organizerId: organizers[0].id,
      },
    }),
    prisma.competition.create({
      data: {
        title: 'AI & Machine Learning Hackathon',
        description: 'Build AI-powered solutions in 48 hours. Collaborate with fellow data scientists and ML engineers.',
        tags: ['ai', 'machine-learning', 'hackathon'],
        capacity: 50,
        regDeadline: daysFromNow(14),
        startDate: daysFromNow(21),
        organizerId: organizers[1].id,
      },
    }),
    prisma.competition.create({
      data: {
        title: 'Design Sprint Challenge',
        description: 'Showcase your UI/UX design skills. Create beautiful and functional designs within tight deadlines.',
        tags: ['design', 'ui-ux', 'creative'],
        capacity: 40,
        regDeadline: daysFromNow(3),
        startDate: daysFromNow(8),
        organizerId: organizers[1].id,
      },
    }),
    prisma.competition.create({
      data: {
        title: 'Data Science Case Competition',
        description: 'Analyze real-world datasets and present actionable insights. Perfect for aspiring data analysts.',
        tags: ['data-science', 'analytics', 'statistics'],
        capacity: 60,
        regDeadline: daysFromNow(10),
        startDate: daysFromNow(20),
        organizerId: organizers[0].id,
      },
    }),
  ]);

  console.log('✅ Created 5 competitions');

  // Create some sample registrations
  const registrations = await Promise.all([
    // Charlie registers for Coding Challenge
    prisma.registration.create({
      data: {
        userId: participants[0].id,
        competitionId: competitions[0].id,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        idempotencyKey: 'seed-idem-key-1',
      },
    }),
    // Diana registers for Startup Pitch
    prisma.registration.create({
      data: {
        userId: participants[1].id,
        competitionId: competitions[1].id,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        idempotencyKey: 'seed-idem-key-2',
      },
    }),
    // Eve registers for AI Hackathon
    prisma.registration.create({
      data: {
        userId: participants[2].id,
        competitionId: competitions[2].id,
        status: 'PENDING',
        idempotencyKey: 'seed-idem-key-3',
      },
    }),
    // Frank registers for Design Sprint
    prisma.registration.create({
      data: {
        userId: participants[3].id,
        competitionId: competitions[3].id,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        idempotencyKey: 'seed-idem-key-4',
      },
    }),
    // Grace registers for Data Science
    prisma.registration.create({
      data: {
        userId: participants[4].id,
        competitionId: competitions[4].id,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        idempotencyKey: 'seed-idem-key-5',
      },
    }),
    // Charlie also registers for AI Hackathon
    prisma.registration.create({
      data: {
        userId: participants[0].id,
        competitionId: competitions[2].id,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        idempotencyKey: 'seed-idem-key-6',
      },
    }),
  ]);

  console.log('✅ Created 6 sample registrations');

  // Create sample mailbox entries for confirmed registrations
  await Promise.all([
    prisma.mailBox.create({
      data: {
        userId: participants[0].id,
        to: participants[0].email,
        subject: 'Registration Confirmed - Annual Coding Challenge 2025',
        body: `Dear ${participants[0].name},\n\nYour registration for "Annual Coding Challenge 2025" has been confirmed!\n\nWe look forward to seeing you at the competition.\n\nBest regards,\nMini Compete Team`,
        mailType: 'confirmation',
        registrationId: registrations[0].id,
      },
    }),
    prisma.mailBox.create({
      data: {
        userId: participants[1].id,
        to: participants[1].email,
        subject: 'Registration Confirmed - Startup Pitch Competition',
        body: `Dear ${participants[1].name},\n\nYour registration for "Startup Pitch Competition" has been confirmed!\n\nWe look forward to seeing you at the competition.\n\nBest regards,\nMini Compete Team`,
        mailType: 'confirmation',
        registrationId: registrations[1].id,
      },
    }),
    prisma.mailBox.create({
      data: {
        userId: participants[3].id,
        to: participants[3].email,
        subject: 'Registration Confirmed - Design Sprint Challenge',
        body: `Dear ${participants[3].name},\n\nYour registration for "Design Sprint Challenge" has been confirmed!\n\nWe look forward to seeing you at the competition.\n\nBest regards,\nMini Compete Team`,
        mailType: 'confirmation',
        registrationId: registrations[3].id,
      },
    }),
  ]);

  console.log('✅ Created sample mailbox entries');

  // Create a sample failed job entry for demonstration
  await prisma.failedJob.create({
    data: {
      jobName: 'registration:confirmation',
      payload: {
        registrationId: registrations[2].id,
        userId: participants[2].id,
        competitionId: competitions[2].id,
      },
      error: 'SMTP connection timeout - simulated failure',
      attempts: 3,
      failedAt: new Date(),
      lastAttempt: new Date(),
    },
  });

  console.log('✅ Created sample failed job entry');

  // Print summary
  console.log('\n📊 Seed Summary:');
  console.log('================');
  console.log(`✓ Organizers: ${organizers.length}`);
  console.log(`✓ Participants: ${participants.length}`);
  console.log(`✓ Competitions: ${competitions.length}`);
  console.log(`✓ Registrations: ${registrations.length}`);
  console.log('\n🔐 Login Credentials (all users):');
  console.log('Password: password123');
  console.log('\n📧 Organizer Emails:');
  organizers.forEach(org => console.log(`  - ${org.email}`));
  console.log('\n📧 Participant Emails:');
  participants.forEach(part => console.log(`  - ${part.email}`));
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });