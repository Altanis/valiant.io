const { Router } = require('express');
const { Users } = require('./db/Models');

const AccountRouter = Router();

AccountRouter.route('/register')
    .post(async (request, response) => {
        const users = await Users.find();

        const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
        if (users.filter(user => user.ip === ip).length > 0) return response.status(400).json({ status: 'ERROR', data: { message: 'You already have an account registered with this IP.' } });
        
        const id = require('crypto').randomUUID();

        const user = new Users({
            id,
            ip,
        });

        user.save()
            .then(() => response.json({ status: 'SUCCESS', data: { id, ip } }))
            .catch(er => response.status(500).json({ status: 'ERROR', data: { message: 'There was an internal error when registering you.', dev_error: er, } }));
    });