import { fetchUser, loginCustomer, loginDeliveryPartner, refreshToken } from "../controllers/auth/auth.js"
import { updateUser } from "../controllers/tracking/user.js"
import { verifyToken } from "../middleware/auth.js"


export const authRoutes = async (fastify, options) => {
    //below 3 are public routed
    fastify.post('/customer/login', loginCustomer)
    fastify.post('/delivery/login', loginDeliveryPartner)
    fastify.post('/refresh-token/login', refreshToken)
    //below is protected route and preHandler is middleware provided by fastify
    fastify.get('/user', { preHandler: [verifyToken] }, fetchUser)
    fastify.patch("/user", { preHandler: [verifyToken] }, updateUser)
}