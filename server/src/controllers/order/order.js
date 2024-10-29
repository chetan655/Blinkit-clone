import { Customer, DeliveryPartner } from "../../models/User.js";
import { Branch } from "../../models/Branch.js";
import { Order } from "../../models/order.js";


export const createOrder = async (req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;  //we are taking this data from frontend but in real world applications we get all these informations through backend


        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch)

        if (!customerData) {
            return reply.status(404).send({ message: "customer not found" })
        }

        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || "No address available"
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || "No address available"
            }

        })


        const savedOrder = await newOrder.save();
        return reply.status(201).send(savedOrder)


    } catch (error) {
        return reply.status(500).send({ message: "failed to create order", error })
    }
}


export const confirmOrder = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliverPersonLocation } = req.body;

        const deliveryPerson = await DeliveryPartner.findById(userId)

        if (!deliveryPerson) {
            return reply.status(404).send({ message: "delivery person not found" })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return reply.status(404).send({ message: "order not found" })
        }

        if (order.status !== 'available') {
            return reply.status(400).send({ message: "order is not available" })
        }

        order.status = 'confirmed'

        order.DeliveryPartner = userId;
        order.deliverPersonLocation = {
            latitude: deliverPersonLocation?.latitude,
            longitude: deliverPersonLocation?.longitude,
            address: deliverPersonLocation.address || ""
        }


        req.server.io.to(orderId).emit("orderConfirmed", order);





        await order.save()

        return reply.send(order)


    } catch (error) {
        return reply.status(500).send({ message: "failed to confirm order", error })
    }
}


export const updateOrderStatus = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { status, deliverPersonLocation } = req.body;

        const { userId } = req.user;

        const deliveryPerson = await DeliveryPartner.findById(userId)
        if (!deliveryPerson) {
            return reply.status(404).send({ message: "delivery person not found" })
        }


        const order = await Order.findById(orderId)
        if (!order) {
            return reply.status(404).send({ message: "order not found" })
        }

        if (['cancelled', 'delivered'].includes(order.status)) {
            return reply.status(400).send({ message: "order can not be updated" })
        }

        if (order.DeliveryPartner.toString() !== userId) {
            return reply.status(403).send({ message: "unauthorized" })
        }


        order.status = status

        order.DeliveryPartner = userId;
        order.deliverPersonLocation = deliverPersonLocation

        await order.save()


        req.server.io.to(orderId).emit("liveTrackingUpdates", order);



        return reply.send(order)



    } catch (error) {
        return reply.status(500).send({ message: "failed to update order status", error })
    }
}

export const getOrders = async (req, reply) => {
    try {
        const { status, customerId, deliveryPartnerId, branchId } = req.query;

        let query = {}

        if (status) {
            query.status = status
        }
        if (customerId) {
            query.customer = customerId
        }
        if (DeliveryPartner) {
            query.deliveryPartner = deliveryPartnerId
            query.branch = branchId
        }

        const orders = await Order.find(query).populate(
            "customer branch items.item deliveryPartner"
        );

        return reply.send(orders)


    } catch (error) {
        return reply.status(500).send({ message: "failed to retrive orders", error })
    }
}


export const getOrderById = async (req, reply) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate(
            "customer branch items.item deliveryPartner"
        )

        if (!order) {
            return reply.status(404).send({ message: "order not found" })
        }

        return reply.send(order)
    } catch (error) {
        return reply.status(500).send({ message: "failed to retrive orders", error })
    }
}
