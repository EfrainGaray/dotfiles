import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: "free",
      price: 0,
      requestsPerMonth: 500,
      maxScrapers: 3,
      maxConcurrent: 1,
      features: {
        modes: ["HTTP", "HEADLESS"],
        scheduling: false,
        webhooks: false,
        proxyPools: false,
        prioritySupport: false,
      },
    },
    {
      name: "pro",
      price: 4900,
      requestsPerMonth: 10000,
      maxScrapers: 25,
      maxConcurrent: 5,
      features: {
        modes: ["HTTP", "HEADLESS", "STEALTH", "HUMAN", "AUTO"],
        scheduling: true,
        webhooks: true,
        proxyPools: true,
        prioritySupport: false,
      },
    },
    {
      name: "enterprise",
      price: 19900,
      requestsPerMonth: 100000,
      maxScrapers: -1, // unlimited
      maxConcurrent: 20,
      features: {
        modes: ["HTTP", "HEADLESS", "STEALTH", "HUMAN", "AUTO"],
        scheduling: true,
        webhooks: true,
        proxyPools: true,
        prioritySupport: true,
        customIntegrations: true,
        sla: "99.9%",
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log(`Seeded ${plans.length} plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
