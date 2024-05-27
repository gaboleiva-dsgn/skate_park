const pkg = require('pg');
const { Pool } = pkg;

const config = {
    user: "gaboleiva",
    host: "localhost",
    database: "skatepark",
    password: "plokiju",
    port: 5432,
    allowExitOnIdle: true
};

const pool = new Pool(config);

module.exports = pool;