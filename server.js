import app from "./app.js";

const PORT= process.env.PORT || 3001;

const initServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server running at port : ${PORT}`);
  });
};

initServer();
// process.on("unhandledRejection", (error, promise) => {
//   console.log(`Logged Error: ${error}`);
//   server.close(() => process.exit(1));
// });