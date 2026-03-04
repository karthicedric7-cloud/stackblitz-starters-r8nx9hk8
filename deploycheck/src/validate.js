const fs = require('fs');
const path = require('path');

function readManifest() {
  const manifestPath = path.join(process.cwd(), 'env.manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('❌ env.manifest.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function readEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  lines.forEach((line) => {
    const [key, value] = line.split('=');
    if (key && key.trim()) {
      env[key.trim()] = value ? value.trim() : '';
    }
  });
  return env;
}

function checkRuntime(manifest) {
  if (!manifest.runtime || !manifest.runtime.node) {
    return null;
  }

  const requiredVersion = manifest.runtime.node;
  const actualVersion = process.versions.node.split('.')[0];

  if (actualVersion !== requiredVersion) {
    return {
      required: requiredVersion,
      actual: actualVersion,
    };
  }

  return null;
}

function validate() {
  console.log('\nRunning deploycheck...\n');

  const manifest = readManifest();
  const env = readEnv();
  const variables = manifest.variables;

  const missing = [];
  const passing = [];
  const runtimeMismatch = checkRuntime(manifest);

  Object.keys(variables).forEach((key) => {
    if (variables[key].required && !env[key]) {
      missing.push(key);
    } else {
      passing.push(key);
    }
  });

  if (runtimeMismatch) {
    console.log('❌ RUNTIME MISMATCH\n');
    console.log(`   Node.js required: v${runtimeMismatch.required}`);
    console.log(`   Node.js found:    v${runtimeMismatch.actual}\n`);
  }

  if (missing.length > 0) {
    console.log(`❌ MISSING VARIABLES (${missing.length} found)\n`);
    missing.forEach((key) => {
      console.log(`   ${key}   required but missing from .env`);
    });
  }

  if (passing.length > 0) {
    console.log(`\n✅ PASSING (${passing.length})\n`);
    passing.forEach((key) => {
      console.log(`   ${key}   present`);
    });
  }

  if (runtimeMismatch || missing.length > 0) {
    console.log('\nYour environment is not ready for production.');
    console.log('Fix the issues above and run deploycheck again.\n');
    process.exit(1);
  } else {
    console.log('\nAll clear. Your environment is ready for production.\n');
  }
}

validate();
