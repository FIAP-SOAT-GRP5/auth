const pool = require('./database');
const { createToken } = require('./jwtOperations');

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const { document } = event;
    const finalDocument = document || "12345678909";
    const sql = 'SELECT * FROM client WHERE document = ?';

    try {
        const results = await new Promise((resolve, reject) => {
            pool.query(sql, [finalDocument], (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });

        if (results && results.length > 0) {
            const user = results[0];
            const token = createToken(user.name, user.id);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            };
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: "User not found" })
            };
        }

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