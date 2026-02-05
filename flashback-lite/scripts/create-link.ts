import { PrismaClient, Prisma } from "@prisma/client";
import generateId from "../src/lib/id";
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const target_name = process.argv[2];

  if (!target_name) {
    console.error("❌ Lütfen bir isim girin: npx tsx scripts/create-link.ts \"İsim\"");
    process.exit(1);
  }

  const minLen = parseInt(process.env.NANOID_MIN_LENGTH || "", 10) || 6;
  const tryLens = [minLen, 7, 8];
  let createdId: string | null = null;

  for (const len of tryLens) {
    const candidate = generateId(len);
    try {
      await prisma.feedback.create({ data: { id: candidate, target_name } });
      createdId = candidate;
      break;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // collision, try next length
        continue;
      }
      console.error(error);
      process.exit(1);
    }
  }

  if (!createdId) {
    console.error("Kısa ID oluşturulamadı; lütfen tekrar deneyin");
    process.exit(1);
  }

  const baseUrlRaw = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const baseUrl = baseUrlRaw.replace(/\/$/, "");

  console.log("\n✅ Yeni feedback linki oluşturuldu!\n");
  console.log(`   Hedef: ${target_name}`);
  console.log(`   ID: ${createdId}`);
  console.log(`\n🔗 URL: ${baseUrl}/anket/${createdId}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
