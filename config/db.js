import mongoose from "mongoose";
import startReservationExpiryJob from "../jobs/releaseExpiredReservation.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Backend_Ecomm"
        }).then(() => {
            console.log("DB connection successfully");
            startReservationExpiryJob()
        })
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}
export default connectDB;