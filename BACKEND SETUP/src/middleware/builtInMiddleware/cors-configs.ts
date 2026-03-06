import cors from "cors";

 const corsConfig = cors({
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400, // Cache preflight results for 24 hours  (example: browser send a put request perflight , server will indicate positive then actual put call where made,so maxAge will cache this preflight value and no need to send every time a preflight. Thank you.)
});

export default corsConfig;