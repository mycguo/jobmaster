import { prisma } from './src/lib/prisma'

async function main() {
  const docs = await prisma.vectorDocument.findMany({
    where: {
      collectionName: 'applications'
    },
    select: {
      userId: true,
      metadata: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  console.log('Total applications found:', docs.length)
  console.log('\nRecords:')
  docs.forEach((doc, idx) => {
    console.log(`\n${idx + 1}. User ID: "${doc.userId}"`)
    console.log(`   Created: ${doc.createdAt}`)
    const metadata = doc.metadata as any
    if (metadata?.data) {
      console.log(`   Company: ${metadata.data.company}`)
      console.log(`   Role: ${metadata.data.role}`)
      console.log(`   Status: ${metadata.data.status}`)
    }
  })
}

main().finally(() => prisma.$disconnect())
