const Client = require('pg').Pool

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "your_password",
    database: "your_database"
})

client.query(`Select * from merchants`, (err, res)=>{
    if(!err){
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end;
})

module.exports = client