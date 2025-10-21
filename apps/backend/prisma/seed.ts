import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.failedJob.deleteMany();
  await prisma.idempotencyKey.deleteMany();
  await prisma.mailBox.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.user.deleteMany();

  // Create password hash
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create 2 organizers
  const organizer1 = await prisma.user.create({
    data: {
      name: 'Alice Organizer',
      email: 'alice@example.com',
      password: hashedPassword,
      role: 'ORGANIZER',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Bob Organizer',
      email: 'bob@example.com',
      password: hashedPassword,
      role: 'ORGANIZER',
    },
  });

  console.log('Created organizers:', { organizer1: organizer1.id, organizer2: organizer2.id });

  // Create 5 participants
  const participants : any[] = [];
  for (let i = 1; i <= 5; i++) {
    const participant = await prisma.user.create({
      data: {
        name: `Participant ${i}`,
        email: `participant${i}@example.com`,
        password: hashedPassword,
        role: 'PARTICIPANT',
      },
    });
    participants.push(participant);
  }

  console.log('Created 5 participants');

  // Create 5 competitions
  const now = new Date();
  const competitions : any[] = [];

  const competition1 = await prisma.competition.create({
    data: {
      title: 'Annual Coding Challenge 2025',
      description: 'Test your coding skills in this annual competition',
      tags: ['coding', 'algorithms', 'competitive'],
      capacity: 50,
      regDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      organizerId: organizer1.id,
    },
  });
  competitions.push(competition1);

  const competition2 = await prisma.competition.create({
    data: {
      title: 'Hackathon Spring 2025',
      description: 'Build innovative solutions in 48 hours',
      tags: ['hackathon', 'innovation', 'teamwork'],
      capacity: 100,
      regDeadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      organizerId: organizer1.id,
    },
  });
  competitions.push(competition2);

  const competition3 = await prisma.competition.create({
    data: {
      title: 'Data Science Competition',
      description: 'Analyze real-world datasets and build predictive models',
      tags: ['data-science', 'machine-learning', 'analytics'],
      capacity: 30,
      regDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      organizerId: organizer2.id,
    },
  });
  competitions.push(competition3);

  const competition4 = await prisma.competition.create({
    data: {
      title: 'Web Development Sprint',
      description: 'Create amazing web applications with modern frameworks',
      tags: ['web-dev', 'frontend', 'backend'],
      capacity: 75,
      regDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      startDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      organizerId: organizer2.id,
    },
  });
  competitions.push(competition4);

  const competition5 = await prisma.competition.create({
    data: {
      title: 'Mobile App Challenge',
      description: 'Design and develop innovative mobile applications',
      tags: ['mobile', 'ios', 'android'],
      capacity: 40,
      regDeadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      organizerId: organizer1.id,
    },
  });
  competitions.push(competition5);

  console.log('Created 5 competitions');

  // Register some participants to competitions
  await prisma.registration.create({
    data: {
      userId: participants[0].id,
      competitionId: competition1.id,
    },
  });

  await prisma.registration.create({
    data: {
      userId: participants[0].id,
      competitionId: competition2.id,
    },
  });

  await prisma.registration.create({
    data: {
      userId: participants[1].id,
      competitionId: competition1.id,
    },
  });

  await prisma.registration.create({
    data: {
      userId: participants[2].id,
      competitionId: competition3.id,
    },
  });

  await prisma.registration.create({
    data: {
      userId: participants[3].id,
      competitionId: competition4.id,
    },
  });

  console.log('Created sample registrations');

  console.log('Seed completed successfully!');
  console.log('\n--- Login Credentials ---');
  console.log('Organizers:');
  console.log('  Email: alice@example.com | Password: password123');
  console.log('  Email: bob@example.com | Password: password123');
  console.log('\nParticipants:');
  for (let i = 1; i <= 5; i++) {
    console.log(`  Email: participant${i}@example.com | Password: password123`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });