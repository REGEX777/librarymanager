import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true,
      },
      ipAddress: {
        type: String,
        required: true,
      },
      deviceInfo: {
        type: String,
        required: true,
      },
      key: String,
      loggedInAt: {
        type: Date,
        default: Date.now,
      }
})


const Session = mongoose.model('Session', sessionSchema);
export default Session;