import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJsMongoose from "@adminjs/mongoose"
import * as Models from "../models/index.js"
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark } from "@adminjs/themes"

AdminJS.registerAdapter(AdminJsMongoose)

export const admin = new AdminJS({
    resources: [
        {
            resource: Models.Customer,
            options: {
                listProperties: ["phone", "role", "isActivated"],
                filterProperties: ["phone", "role"]
            }
        },
        {
            resource: Models.DeliveryPartner,
            options: {
                listProperties: ["email", "role", "isActivated"],
                filterProperties: ["email", "role"]
            }
        },
        {
            resource: Models.Admin,
            options: {
                listProperties: ["email", "role", "isActivated"],
                filterProperties: ["email", "role"]
            }
        },
        {
            resource: Models.Branch,
        },
        {
            resource: Models.Product
        },
        {
            resource: Models.Category
        }
    ],

    branding: {
        companyName: "Blinkit",
        withMadeWithLove: false,
    },
    defaultTheme: dark.id,
    availableThemes: [dark],
    rootPath: "/admin"
})

export const buildAdminRouter = async (app) => {
    await AdminJSFastify.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: "adminjs"
        },
        app,
        {
            store: sessionStore,
            saveUninitialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            }
        }
    )
}