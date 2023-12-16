import mongoose from "mongoose";

async function connectToDatabase(uri) {

   mongoose
     .connect(uri)
     .then(() => {
       console.log("Connected to MongoDB");
     })
     .catch((error) => {
       console.error("Error connecting to MongoDB:", error);
     });
    
}

export default connectToDatabase;