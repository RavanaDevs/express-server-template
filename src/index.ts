import { app } from './app'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { Server } from 'http'

const PORT = process.env.PORT || 3000

const prisma = new PrismaClient()

// Track active connections for graceful shutdown
const connections = new Set<any>()

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

// Docker-compatible graceful shutdown handler
async function gracefulShutdown(server: Server, signal: string) {
  console.log(`\n🔄 ${signal} signal received. Starting graceful shutdown...`)

  let shutdownTimer: NodeJS.Timeout | null = null
  const SHUTDOWN_TIMEOUT = 30000 // 30 seconds for Docker compatibility

  try {
    // Set a timeout for force shutdown (important for Docker)
    shutdownTimer = setTimeout(() => {
      console.log('⚠️  Shutdown timeout reached. Force closing...')
      process.exit(1)
    }, SHUTDOWN_TIMEOUT)

    // Step 1: Stop accepting new connections
    console.log('📡 Stopping HTTP server from accepting new connections...')
    server.close(async (err) => {
      if (err) {
        console.error('❌ Error closing HTTP server:', err)
        process.exit(1)
      }
      console.log('✅ HTTP server stopped accepting new connections')
    })

    // Step 2: Close existing connections gracefully
    console.log('🔌 Closing existing connections...')
    for (const connection of connections) {
      connection.destroy()
    }
    connections.clear()

    // Step 3: Close database connections
    console.log('🗄️  Closing database connections...')
    await prisma.$disconnect()
    console.log('✅ Database connections closed')

    // Step 4: Cleanup complete
    if (shutdownTimer) {
      clearTimeout(shutdownTimer)
    }

    console.log('🎉 Graceful shutdown completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
    if (shutdownTimer) {
      clearTimeout(shutdownTimer)
    }
    process.exit(1)
  }
}

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📝 Process ID: ${process.pid}`)
  console.log(`🐳 Ready for Docker signals (SIGTERM, SIGINT)`)
})

// Track connections for graceful shutdown
server.on('connection', (connection) => {
  connections.add(connection)
  connection.on('close', () => {
    connections.delete(connection)
  })
})

// Handle Docker SIGTERM (most common in containers)
process.on('SIGTERM', () => {
  gracefulShutdown(server, 'SIGTERM')
})

// Handle SIGINT (Ctrl+C in development)
process.on('SIGINT', () => {
  gracefulShutdown(server, 'SIGINT')
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  gracefulShutdown(server, 'UNCAUGHT_EXCEPTION')
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown(server, 'UNHANDLED_REJECTION')
})

// Note: SIGKILL cannot be caught or handled - it immediately terminates the process
// This is why graceful shutdown should respond to SIGTERM quickly
