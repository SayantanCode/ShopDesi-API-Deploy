import mongoose from "mongoose";
import config from ".";
const connectDb = async () => {
  try {
    console.log(config.dbHost);
    const URI = `mongodb+srv://${config.dbUser}:${config.dbPass}@${config.dbHost}/${config.dbName}`;
    await mongoose.connect(URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log(`MongoDb connection Error: ${error}`);
  }
};

export default connectDb;
