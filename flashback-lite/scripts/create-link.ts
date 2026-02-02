import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const targetName = process.argv[2];

  if (!targetName) {
    console.error("❌ Lütfen bir isim girin: npx tsx scripts/create-link.ts \"İsim\"");
    process.exit(1);
  }

  const id = uuidv4();
  
  await prisma.feedback.create({
    data: {
      id,
      targetName,
    },
  });

  const baseUrlRaw = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const baseUrl = baseUrlRaw.replace(/\/$/, "");

  console.log("\n✅ Yeni feedback linki oluşturuldu!\n");
  console.log(`   Hedef: ${targetName}`);
  console.log(`   ID: ${id}`);
  console.log(`\n🔗 URL: ${baseUrl}/anket/${id}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
