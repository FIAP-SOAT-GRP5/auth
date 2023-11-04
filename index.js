require('dotenv').config();
const { sign } = require('jsonwebtoken');

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.RDS_HOSTNAME,
        port: process.env.RDS_PORT,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        database: process.env.RDS_DATABASE
    }
});

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const { document } = event;
    const finalDocument = document || "12345678909";
    try {
        const client = await knex.select("id", "name").from('client').where('document', finalDocument).first();
        if (client) {
            const token = sign({
                username: client.name,
                id: client.id
            }, process.env.JWT_SECRET, {
                expiresIn: '24h',
                audience: 'fiap-auth',
                subject: client.id.toString()
            })
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            };
        }
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: "User not found" })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: err.message })
        };
    }
};