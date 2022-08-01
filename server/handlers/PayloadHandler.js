module.exports = (player, message) => {
    try {
        message = message.toString();
        message = JSON.parse(string);

        if (!Object.hasOwn(message, 'header')) return player.close(1001);
        switch (message.header) {
            case 'INIT': {
                const { build } = message;
                if (CURRENT_BUILD !== build) {
                    player.send({ header: 'INVALID_BUILD', build: CURRENT_BUILD });
                    return player.close(1002);
                }

                player.send({ header: 'ACCEPT' });
                break;
            }
            case 'PING': {
                player.pinged = true;
                break;
            }
        }
    } catch (error) {
        player.close(1001);
    }
}