const { Router } = require('express');
const { Users, Ratelimits } = require('../db/Models');

const AccountRouter = Router();

AccountRouter.route('/register')
    .post(async (request, response) => {
        const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
        let ratelimit = await Ratelimits.findOne({ ip });
        if ((Date.now() - ratelimit?.registration) < 5000) return response.status(429).json({ status: 'ERROR', data: { message: 'You are being ratelimited.' } });
        // 5 seconds per request from IP.

        const id = require('crypto').randomUUID();

        const user = new Users({ id, ip });
        if (!ratelimit) {
            ratelimit = new Ratelimits({ ip, registration: Date.now(), }); 
        } else ratelimit.registration = Date.now();

        user.save()
            .then(async () => {
                ratelimit.save().then(() => response.json({ status: 'SUCCESS', data: { id, ip } })).catch(() => response.json({ status: 'SUCCESS', data: { id, ip } }));
            })
            .catch(er => response.status(500).json({ status: 'ERROR', data: { message: 'There was an internal error when registering you.', dev_error: er, } }));
    });

module.exports = AccountRouter;