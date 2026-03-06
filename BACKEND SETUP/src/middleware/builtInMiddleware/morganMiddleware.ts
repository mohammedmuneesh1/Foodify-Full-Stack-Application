import morgan from "morgan";
import logger from "../../libs/winstonLogger";

// Override the stream method by telling
// Morgan to use our custom logger instead of console.log.
const stream = {
  // Use the http severity
  write: (message: string) => logger.http(message),
};

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told the logger that it should print
// only warning and error messages in production.
const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ":method :url :status :res[content-length] - :response-time ms",
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip },
);
// skip Function: Determines whether logging should be skipped.
// true: Skip logging (no log entry is created).
// false: Do not skip logging (log entry is created).

// . stream should be an object with a write method that Morgan will use to write log messages.
//  It's not about assigning Morgan's value to stream.
export default morganMiddleware;


// morgan(function(tokens, req, res) {
//   return [
//     tokens.method(req, res),
//     tokens.url(req, res),
//     tokens.status(req, res),
//     tokens.res(req, res, 'content-length'), '-',
//     tokens['response-time'](req, res), 'ms'
//   ].join(' ');
// });