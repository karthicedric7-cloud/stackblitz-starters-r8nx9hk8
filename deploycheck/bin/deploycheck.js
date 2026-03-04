#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

if (command === 'validate') {
  require('../src/validate.js');
} else {
  console.log('\ndeploycheck - Backend Reliability Infrastructure\n');
  console.log('Usage:');
  console.log(
    '  deploycheck validate    Check your environment against the manifest\n'
  );
}
