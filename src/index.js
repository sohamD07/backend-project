import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({path: './env'});


connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGODB connection failed !!! ", err);
    })








// import express from "express";
// const app = express();

// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error",(err)=>{
//             console.log("ERROR : ",err);
//             throw err;
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`APP is listening on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error("ERROR : ",error);
//         throw error;
//     }
// })()