import { app } from './app'
import { PrismaClient } from './generated/prisma'
import 'dotenv/config'

const PORT = process.env.PORT || 3000

const prisma = new PrismaClient()

/////// DB //////////
// async function main() {
// await prisma.user.create({
//   data: { name: "Ravana", email: "ravanadevs@gmail.com" },
// });
// await prisma.post.create({
//   data: {
//     title: "My first post",
//     content: "This is my first post",
//     author: {
//       connect: {
//         email: "ravanadevs@gmail.com",
//       },
//     },
//   },
// });
// }

// main()
//   .catch((e) => {
//     console.log(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
