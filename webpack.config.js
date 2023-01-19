require("dotenv").config();

const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        client: path.join(__dirname, "views", "client", "Index.ts")
    },
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "views")
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader"
        }]
    },
    resolve: {
        extensions: [".ts"]
    },
    optimization: {
        minimize: process.env.PROD === "true"
    }
};