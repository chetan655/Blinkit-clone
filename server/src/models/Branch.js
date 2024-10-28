import mongoose, { mongo } from "mongoose";
import { DeliveryPartner } from "./User.js";

//Base User Schema

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    address: {
        type: String
    },
    DeliveryPartners: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
        }
    ]
})

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;