

import express, { Express, NextFunction, Request, Response } from "express";
import http from "http";
import https from "https";
import fs from "fs";
import rateLimiter from "./middleware/builtInMiddleware/express-rate-limit";
import corsConfig from "./middleware/builtInMiddleware/cors-configs";
import hpp from "hpp";
import helmetConfig from "./middleware/builtInMiddleware/helmet-configs";
import sanitize from 'express-mongo-sanitize';
import ResponseHandler from "./utils/Response-Error-Handler/responseHandler";
import ErrorHandler from "./utils/Response-Error-Handler/errorHandler";
import mongoose from "mongoose";
import logger from "./libs/winstonLogger";
// import { router as AuthRoute } from "../src/app/authentication/route";
import { router as AuthRoute } from "./app/authentication/route";
import { router as CustomerRoute } from "./app/customer/customer.routes";
import { router as DeliveryPartnerRoutes } from "./app/delivery-partner/deliveryPartner.routes";
import {router as HotelOwners} from "./app/hotel-owner/hotelOwner.routes";
import { router as CommonRoutes } from "./app/common/common.route";
import connectDBFn from "./configs/dbConnectFn";
import morganMiddleware from "./middleware/builtInMiddleware/morganMiddleware";

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure middleware (in correct order)
app.set('trust proxy', 1);                  // Trust proxy (should stay first)
app.use(corsConfig);                        // 1) Set CORS headers early
app.use(morganMiddleware);                  // 2) Log requests (before body parsing)
app.use(express.json({ limit: "30mb" }));   // 3) Parse JSON bodies
app.use(hpp());                             // 4) Sanitize query strings
app.use(rateLimiter);                       // 5) Prevent abuse via rate limiting
app.use(helmetConfig);                      // 6) Secure headers
app.use(sanitize());                        // 7) Sanitize MongoDB operators
// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/customers', CustomerRoute);
app.use('/api/deliverypartners', DeliveryPartnerRoutes);
app.use('/api/hotelowners', HotelOwners);
app.use('/api/common',CommonRoutes);


export interface AuthUserInterface{
  uId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?:AuthUserInterface; 
       // or better: user?: JwtPayload | YourUserType
    }
  }
}




//---------------------------------- WORKING + ERROR + ROUTE NOT FOUND + GLOBAL ERROR HANDLER  START ----------------------------------
app.get("/working", async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "API is working" });
});

// Example route to test global error handling
app.get("/error", (req: Request, res: Response) => {
  logger.error(`/error route triggered`);
  throw new Error("Test error");
});

// 404 Not Found Handler (must come after all routes)
app.use((req: Request, res: Response) => {
  logger.error(`Route not Found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Global Error: ${err instanceof Error ? err.message : err}`);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    response: err.message || "Internal Server Error",
  });
});

//---------------------------------- WORKING + ERROR + ROUTE NOT FOUND + GLOBAL ERROR HANDLER  END ----------------------------------


//------------------------------------------- SETTING UP THE SERVER START   -------------------------------------------
//
//
//
// Create appropriate server based on environment


let server;


//DONT DELETE COMMENTED DUE TO LACK OF SSL KEY AND CERTIFICATE
// if (NODE_ENV === 'production' && process.env.SSL_KEY && process.env.SSL_CERT) {
//   // Production: Use HTTPS
//   const privateKey = fs.readFileSync(process.env.SSL_KEY, 'utf8');
//   const certificate = fs.readFileSync(process.env.SSL_CERT, 'utf8');
//   const credentials = { key: privateKey, cert: certificate };
//   server = https.createServer(credentials, app);
//   logger.info('Created HTTPS server for production');
// } else {
//   // Development: Use HTTP
//   server = http.createServer(app);
//   logger.info('Created HTTP server for development');
// }

  server = http.createServer(app);
  logger.info('Created HTTP server for development');


// Graceful shutdown handler
const gracefulShutdown = () => {
  //DETAILED NOTE ON THE DOCUMENATION 
  logger.info('Received shutdown signal, closing connections...');
  
  server.close(() => {  //server .close stop accepting new request but generally current going on gracefull closing following 
    logger.info('HTTP server closed');
    mongoose.connection.close(false);  // Close MongoDB connection without a callback  Close without forcefully shutting down
    // Exit after MongoDB connection is closed
    logger.info('MongoDB connection closed');
    process.exit(0);  // Exit gracefully
  });

  // Force close if graceful shutdown fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);  // Exit if shutdown fails to complete in time
  }, 10000);  // Timeout after 10 seconds
};
// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Start server after database connection
const startServer = async () => {
  try {
    await connectDBFn(); // Connect to DB first
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error(`Server failed to start: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

startServer();

//------------------------------------------- SETTING UP THE SERVER END   -------------------------------------------