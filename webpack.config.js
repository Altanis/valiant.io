const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        client: path.join(__dirname, "views", "client", "Client.ts")
    },
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist")
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader"
        }]
    }
}