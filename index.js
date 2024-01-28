require('dotenv').config();
const { sign } = require('jsonwebtoken');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Client = mongoose.model('Client', {
    id: Number,
    name: String,
    document: String
});

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const { document } = event;
    const finalDocument = document || "12345678909";

    try {
        const client = await Client.findOne({ document: finalDocument }, 'id name');

        if (client) {
            const token = sign({
                username: client.name,
                id: client.id
            }, process.env.JWT_SECRET, {
                expiresIn: '24h',
                audience: 'fiap-auth',
                subject: client.id.toString()
            });

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
