require('dotenv').config();
const config = require('./src/config/index');
console.log("GOLEM_MODE:", config.GOLEM_MODE);
console.log("MODE_DIR:", config.MODE_DIR);
console.log("MEMORY_BASE_DIR:", config.MEMORY_BASE_DIR);
