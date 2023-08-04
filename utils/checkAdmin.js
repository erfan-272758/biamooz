const reset = require('./reset');

async function checkAdmin() {
  if (process.env.RESET_APP !== 'true') return;
  reset();
}

checkAdmin();
