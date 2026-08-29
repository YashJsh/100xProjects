import { prisma } from "../src/utils/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "System Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Supervisors
  const supervisor1 = await prisma.user.create({
    data: {
      email: "supervisor@example.com",
      name: "Marcus Vance",
      password: hashedPassword,
      role: "SUPERVISOR",
    },
  });

  const supervisor2 = await prisma.user.create({
    data: {
      email: "rachel@example.com",
      name: "Rachel Green",
      password: hashedPassword,
      role: "SUPERVISOR",
    },
  });

  // 3. Agents
  const agent1 = await prisma.user.create({
    data: {
      email: "agent@example.com",
      name: "Sarah Miller",
      password: hashedPassword,
      role: "AGENT",
      supervisorID: supervisor1.id,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: "david@example.com",
      name: "David Smith",
      password: hashedPassword,
      role: "AGENT",
      supervisorID: supervisor1.id,
    },
  });

  const agent3 = await prisma.user.create({
    data: {
      email: "james@example.com",
      name: "James Wilson",
      password: hashedPassword,
      role: "AGENT",
      supervisorID: supervisor2.id,
    },
  });

  const unassignedAgent = await prisma.user.create({
    data: {
      email: "elena@example.com",
      name: "Elena Rostova",
      password: hashedPassword,
      role: "AGENT",
      supervisorID: null,
    },
  });

  // 4. Candidates
  const candidate1 = await prisma.user.create({
    data: {
      email: "candidate@example.com",
      name: "Alex Candidate",
      password: hashedPassword,
      role: "CANDIDATE",
    },
  });

  const candidate2 = await prisma.user.create({
    data: {
      email: "emma@example.com",
      name: "Emma Watson",
      password: hashedPassword,
      role: "CANDIDATE",
    },
  });

  // 5. Conversations
  const conv1 = await prisma.conversation.create({
    data: {
      candidateID: candidate1.id,
      agentID: agent1.id,
      status: "IN_PROGRESS",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationID: conv1.id,
        senderID: candidate1.id,
        role: "CANDIDATE",
        content: "Hello! I am having an issue submitting my coding solution on Step 2.",
      },
      {
        conversationID: conv1.id,
        senderID: agent1.id,
        role: "AGENT",
        content: "Hi Alex! I've joined your conversation. Checking the logs now.",
      },
    ],
  });

  const conv2 = await prisma.conversation.create({
    data: {
      candidateID: candidate2.id,
      agentID: null,
      status: "OPEN",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Demo Credentials:");
  console.log("👑 ADMIN:      admin@example.com / password123");
  console.log("👔 SUPERVISOR: supervisor@example.com / password123");
  console.log("🎧 AGENT:      agent@example.com / password123");
  console.log("👤 CANDIDATE:  candidate@example.com / password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
