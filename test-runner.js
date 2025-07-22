#!/usr/bin/env node

/**
 * Test runner script for development
 * Usage: node test-runner.js [options]
 */

const { spawn } = require('child_process')
const path = require('path')

const args = process.argv.slice(2)
const isWindows = process.platform === 'win32'

// Available test commands
const commands = {
  all: ['pnpm', 'test'],
  watch: ['pnpm', 'test:watch'],
  coverage: ['pnpm', 'test:coverage'],
  controllers: ['pnpm', 'test', 'tests/controllers'],
  routes: ['pnpm', 'test', 'tests/routes'],
  middlewares: ['pnpm', 'test', 'tests/middlewares'],
  integration: ['pnpm', 'test', 'tests/integration'],
  unit: [
    'pnpm',
    'test',
    'tests/controllers',
    'tests/middlewares',
    'tests/routes',
  ],
}

function runCommand(command) {
  const [cmd, ...cmdArgs] = command
  const child = spawn(cmd, cmdArgs, {
    stdio: 'inherit',
    shell: isWindows,
    cwd: process.cwd(),
  })

  child.on('error', (error) => {
    console.error(`Error running command: ${error.message}`)
    process.exit(1)
  })

  child.on('close', (code) => {
    process.exit(code)
  })
}

function showHelp() {
  console.log(`
Test Runner for Express Server Template

Usage: node test-runner.js [command]

Available commands:
  all         - Run all tests (default)
  watch       - Run tests in watch mode
  coverage    - Run tests with coverage report
  controllers - Run only controller tests
  routes      - Run only route tests
  middlewares - Run only middleware tests
  integration - Run only integration tests
  unit        - Run all unit tests (controllers, middlewares, routes)
  help        - Show this help message

Examples:
  node test-runner.js
  node test-runner.js watch
  node test-runner.js coverage
  node test-runner.js controllers
`)
}

// Parse command line arguments
const command = args[0] || 'all'

if (command === 'help' || command === '-h' || command === '--help') {
  showHelp()
  process.exit(0)
}

if (!commands[command]) {
  console.error(`Unknown command: ${command}`)
  showHelp()
  process.exit(1)
}

console.log(`Running: ${command} tests...`)
runCommand(commands[command])
