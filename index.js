require('dotenv').config();
const { sign } = require('jsonwebtoken');
const dynamoose = require('dynamoose');

const ClientSchema = new dynamoose.Schema({
    _id: {
        type: String,
        hashKey: true,
        default: uuidv4()
    },
    email: {
        type: String
    },
    document: {
        type: String
    },
    name: {
        type: String
    }
}, {
    timestamps: true
});

const CreatedClientSchema = dynamoose.model('Client', ClientSchema);

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const { document } = event;
    const finalDocument = document || "12345678909";

    try {
        const client = await CreatedClientSchema.scan('document').eq(`${finalDocument}`).exec().then((clients) => {
            if (clients.length > 0) {
                return clients[0];
            }
            return null;
        });

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
