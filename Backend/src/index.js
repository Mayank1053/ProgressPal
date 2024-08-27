import connectDB from "./DB/dbConnect.js";
import app from "./app.js";

connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT || 3000}`);
  });
}).catch((err) => {
  console.log("MONGO db connection failed !!! ", err);
});