import dotenv from "dotenv"
dotenv.config({
    Path: "./env"
})
import fastify from "fastify";
import { connectDb } from "./src/config/connect.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { admin } from "./src/config/setup.js";

const start = async () => {
    await connectDb(process.env.MONGO_URL)
    const app = fastify();
    const PORT = process.env.PORT || 3000;


    await buildAdminRouter(app);

    app.listen({ port: PORT, host: "0.0.0.0" },
        (err, addr) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`Blinkit Start on http://localhost:${PORT}${admin.options.rootPath}`)
            }
        })
}
start();