import { createLogger, format, transports, addColors, config } from "winston";
import { TransformableInfo } from "logform";
import Transport from "winston-transport"; // Import Transport from winston-transport

// Define log levels with a TypeScript interface
interface CustomLevels extends config.AbstractConfigSetLevels {
  http: 3;
}

// Function to determine level based on environment
const level = (): string => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

// Define colors for levels
const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Add colors to Winston
addColors(colors);

// Define log format with types for timestamp and format string
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  format.colorize({ all: true }),
  format.printf(
    (info: TransformableInfo) =>
      `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports with types for options

const logTransports: Transport[] = [
  new transports.Console(), // Logs to console

  //   Uncomment to enable file transports:
  //   new transports.File({ filename: 'logs/error.log', level: 'error' }),
  //   new transports.File({ filename: 'logs/all.log' }),
];

// Create logger instance with type annotations
const logger = createLogger({
  level: level(),
  levels: config.npm.levels as CustomLevels, // Use default levels or cast to CustomLevels if needed
  format: logFormat,
  transports: logTransports,
});

export default logger;









//notes

//  1) DETAILED NOTES FOR LEVEL() START ------------------------------------------------------------------------------------

// This is because Winston logging levels follow a hierarchical priority system. Here's how it works:
// The default NPM logging levels in Winston have this priority order (from highest to lowest):
// Copyerror: 0
// warn: 1
// info: 2
// http: 3
// verbose: 4
// debug: 5
// silly: 6
// When you set a logging level, Winston will only show logs of that level AND higher priority (lower numbers). So:


// {
//     error: 0,    // Highest priority
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6     // Lowest priority
//   }


// In development mode ("debug"):

// typescriptCopy// These ALL show up because debug (5) includes everything above it
// logger.error("Database crashed");  // priority 0 - shows
// logger.warn("Memory high");        // priority 1 - shows
// logger.info("DB connected");       // priority 2 - shows
// logger.http("GET /api/users");     // priority 3 - shows
// logger.debug("Processing data");   // priority 5 - shows

// In production mode ("warn"):

// typescriptCopy// Only priority 1 (warn) and higher (error) show up
// logger.error("Database crashed");  // priority 0 - shows ✅
// logger.warn("Memory high");        // priority 1 - shows ✅
// logger.info("DB connected");       // priority 2 - hidden ❌
// logger.http("GET /api/users");     // priority 3 - hidden ❌
// logger.debug("Processing data");   // priority 5 - hidden ❌
// You can test this easily:
// typescriptCopy// Try in development (NODE_ENV=development)
// logger.info("Testing");  // Shows up ✅

// // Try in production (NODE_ENV=production)
// logger.info("Testing");  // Doesn't show up ❌

//  1) DETAILED NOTES FOR LEVEL() END ------------------------------------------------------------------------------------


//========================================================= 2) DETAILED NOTES FOR logFormat START ================================================================================================
// const logFormat = format.combine(
//     format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
//     format.colorize({ all: true }),
//     format.printf(
//       (info: TransformableInfo) =>
//         `${info.timestamp} ${info.level}: ${info.message}`,
//     ),
//   );


// This creates the log message format:
// format.combine(): Combines multiple formatters
// format.timestamp(): Adds timestamp to logs with specified format
// format.colorize(): Applies the defined colors
// format.printf(): Creates custom log message format

// Shows timestamp, log level, and message
// Example output: "2024-02-24 14:30:45:123 INFO: Server started"






// ============================================================ 2) DETAILED NOTES FOR logFormat END ==================================================================================================


// ============================================================ 3)  CREATE TRANSPORT START ==================================================================================================

// const logger = createLogger({
//     level: level(),
//     levels: config.npm.levels as CustomLevels,
//     format: logFormat,
//     transports: logTransports,
//   });


// Dynamic log level based on environment
// NPM-style log levels cast to CustomLevels
// Configured format from above
// Defined transports (where logs go)


// ============================================================ 3)  CREATE TRANSPORT END ==================================================================================================
{/** */}
{/** */}
{/** */}
{/** */}
{/** */}
{/** */}
{/** */}
// ============================================================ 4)  TYPE PROPERTY START ==================================================================================================


// interface CustomLevels extends config.AbstractConfigSetLevels {
//     http: 3;
//   }
//   This interface:
//   Extends Winston's default levels (AbstractConfigSetLevels)
//   Just ensures that the 'http' level exists with priority 3
//   Doesn't override or remove other levels


// The interface is just for TypeScript type safety to ensure:
// The 'http' level exists
// It has the correct priority (3)
// TypeScript won't complain when you use logger.http()
// If you wanted to actually limit the levels, you would need to define a custom levels object:



// ============================================================ 4)  TYPE PROPERTY END ==================================================================================================




// Feature	                                      console.log	              logger (Winston)
// Log levels (info, warn, error, debug, etc.) 	    ❌ No	                        ✅ Yes
// Timestamped logs	                                ❌ No                        	✅ Yes
// Colored output by log level	                    ❌ No                         	✅ Yes
// Logs to files (e.g., error.log, combined.log)	  ❌ No	                        ✅ Yes
// Custom log formats	                              ❌ No                        	✅ Yes
// Control what level gets logged in different environments	❌ No	                ✅ Yes
// Easily extendable to log to DBs, external services	❌ No	                      ✅ Yes




  // level: level(),
  // levels: config.npm.levels as CustomLevels, 


  // level()

// This function returns the minimum log level Winston should process.
// If you're in development, it logs everything from debug and higher.
// If in production, it logs only info, warn, and error (ignores debug).



//Levels()
// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// }
// Lower numbers = higher priority.
//So error (0) is highest priority. debug (5) is lower.

// The numeric level in levels

// The minimum level from level()

// It only logs messages that are equal to or more important than the minimum level.

