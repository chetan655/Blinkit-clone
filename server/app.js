import dotenv from "dotenv"
dotenv.config({
    Path: "./env"
})
import fastify from "fastify";
import { connectDb } from "./src/config/connect.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { admin } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const start = async () => {
    await connectDb(process.env.MONGO_URL)


    const app = fastify();

    app.register(fastifySocketIO, {
        cors: {
            origin: "*"
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ["websocket"]
    })


    const PORT = process.env.PORT || 3000;

    //routes
    await registerRoutes(app)



    await buildAdminRouter(app);

    app.listen({ port: PORT, host: "0.0.0.0" },
        (err, addr) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`Blinkit Start on http://localhost:${PORT}${admin.options.rootPath}`)
            }
        })

    app.ready().then(() => {
        app.io.on("connection", (socket) => {
            console.log("a user connected")

            socket.on("joinRoom", (orderId) => {
                socket.join(orderId);
                console.log(`user joined room ${orderId}`)
            })

            socket.on("disconnect", () => {
                console.log("user disconnected")
            })
        })
    })
}
start();