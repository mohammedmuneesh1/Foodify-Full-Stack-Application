import * as crypto from 'crypto';

export const hashTokenFn = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  };






  
//   const blacklistToken = async (token: string) => {
//     const hashedToken = hashToken(token);  // Assuming you have the hash function
  
//     // Mark the token as blacklisted in the login history
//     await LoginHistory.updateOne(
//       { hashedToken },
//       { $set: { isBlacklisted: true } }
//     );
//   };


// You should verify the JWT token before checking if it's blacklisted.

// ✅ Reason: Verifying First is Safer and More Efficient


// 1. Security:
// You don’t want to run a DB query for an invalid or tampered token.

// Verification ensures the token:

// Was signed with your server's secret.

// Has not expired.

// Is structurally valid.


// import jwt from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';
// import LoginHistory from '../models/LoginHistory'; // adjust path

// interface AuthRequest extends Request {
//   user?: { userId: string; role: string };
// }

// export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   try {
//     // 1. Verify JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       userId: string;
//       role: string;
//     };

//     // 2. Hash the token
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // // 3. Check if blacklisted
    // const isBlacklisted = await LoginHistory.findOne({ hashedToken, isBlacklisted: true });
    // if (isBlacklisted) {
    //   return res.status(403).json({ message: 'Token is blacklisted' });
    // }

//     // 4. Attach user and continue
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// };



// 2. Performance:
// Verifying JWT is fast (in-memory).

// Hitting your database (LoginHistory.findOne) is relatively slow.

// So verifying first avoids unnecessary DB queries for fake or expired tokens.+++







//REDIS

// 1. Use In-Memory Store (e.g., Redis) for Blacklisted Tokens
// Instead of checking MongoDB every time, use a fast in-memory cache like Redis.


// How It Works:
// When a user logs out:

// Hash the token.

// Store the hash in Redis with an expiry matching the token’s expiration.

// During auth middleware:

// After verifying the token, check Redis (fast key lookup) for the hashed token.



//IMPLEMENTATION 
// // On logout
// await redis.setex(`bl:${hashedToken}`, tokenExpiryInSeconds, '1');

// // On middleware
// const isBlacklisted = await redis.get(`bl:${hashedToken}`);
// if (isBlacklisted) {
//   return res.status(403).json({ message: 'Token is blacklisted' });
// }



// 2. Hybrid: Use Redis First, Fallback to MongoDB (Optional)
// If Redis fails (network, crash), you can fallback to MongoDB as a secondary check.



// ✅ Step-by-Step Hybrid Setup
// 1. Store blacklist in both Redis and MongoDB
// When blacklisting a token (e.g., on logout):

// ts
// Copy
// Edit
// const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
// const expiresIn = jwt.decode(token)?.exp; // in seconds

// // Store in Redis with expiry
// await redis.setex(`bl:${hashedToken}`, expiresIn - Math.floor(Date.now() / 1000), '1');

// // Optional: store in MongoDB as well
// await LoginHistory.findOneAndUpdate(
//   { hashedToken },
//   { isBlacklisted: true },
//   { upsert: true }
// );



// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { Request, Response, NextFunction } from 'express';
// import redis from '../utils/redisClient'; // assume configured redis client
// import LoginHistory from '../models/LoginHistory';

// interface AuthRequest extends Request {
//   user?: { userId: string; role: string };
// }

// export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//   try {
//     // 1. Check Redis
//     const redisKey = `bl:${hashedToken}`;
//     const isRedisBlacklisted = await redis.get(redisKey);

//     if (isRedisBlacklisted) {
//       return res.status(403).json({ message: 'Token is blacklisted (Redis)' });
//     }
//   } catch (redisErr) {
//     console.error('Redis error:', redisErr); // fallback to MongoDB
//   }

//   try {
//     // 2. Verify JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       userId: string;
//       role: string;
//     };

//     // 3. Check MongoDB only if Redis failed or key was missing
//     const isMongoBlacklisted = await LoginHistory.findOne({
//       hashedToken,
//       isBlacklisted: true,
//     });

//     if (isMongoBlacklisted) {
//       return res.status(403).json({ message: 'Token is blacklisted (MongoDB)' });
//     }

//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// };



// 🧠 Notes:
// Redis is checked first because it’s much faster.

// If Redis is unavailable or doesn’t return a result, fallback ensures blacklist integrity.

// You can optionally skip MongoDB if Redis is reliable and persistent enough for your needs.

// his is the correct and optimal order in your hybrid blacklist strategy.

// ✅ Here's why this order is good:
// Check Redis first (before verifying the token):

// It's fast and lightweight.

// If the token is blacklisted, you can immediately reject the request without wasting time verifying.

// This saves resources — especially if the token is known to be invalidated.

// Verify the token only if Redis doesn't block it:

// JWT verification is CPU-bound (signature decoding), so it's better to avoid it when possible (i.e., already blacklisted).

// After verifying, you can trust the payload and use it to check MongoDB as a fallback.

// Fallback to MongoDB:

// If Redis fails (network issue, key expired, or Redis down), MongoDB still ensures blacklist validity.

