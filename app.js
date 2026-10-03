import express from "express"
import  config  from "./config/config.js";
import sequelize from "./connection/database.js"
import authRoutes from "./routes/authRoutes.js"
import errorMiddleWare from "./middleware/errorMiddleWare.js";
import taskRoutes from "./routes/taskRoutes.js"
import logger from "./utils/logger.js"

const app=express();

const PORT=config.port;

app.use(express.json());
app.use(errorMiddleWare);

app.use("/auth", authRoutes);

app.get('/',(req, res)=>{
    res.json({
        message:'Personal task Manager Api'
    })
})

app.use("/tasks",taskRoutes);

const startServer = async () => {
  try{
    await sequelize.authenticate();

    logger.info('Database connected successfully');

    app.listen(PORT,() => logger.info(`server running at port ${PORT}`));
        
  }catch(error){
    logger.error('Database connection failed: ',{
      error:error.message,
    });
  }
};

startServer();
