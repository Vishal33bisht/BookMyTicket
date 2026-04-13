//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);
import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "12345",
  database: "BookMyTicket",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = new express();
app.use(cors());

app.use(express.json());
app.post('/register',async(req,res)=>{
   try{
     const {name,email,password}=req.body;
     if(!email || !password){
        return res.send({error:"email and password required"});
     }
     const existingUser=await pool.query(
          "SELECT * FROM users WHERE email =$1",
          [email]
     );
     if(existingUser.rowCount>0){
          return res.send({error: "User already existed"});
     }
     const hashedPassword=await bcrypt.hash(password,10);

     await pool.query(
      "INSERT  INTO users (name,email,password) VALUES ($1,$2,$3)",
      [name,email,hashedPassword]
     );
     res.send({message: "User regsitered succesfully"});
   }catch(err){
      console.log(err);
      res.status(500).send("Server error");
   }
});
app.post('/login',async(req,res)=>{
    try{
      const {email,password}=req.body;
      const result=await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
      if(result.rowCount===0){
        return res.send({error:"USer not found"});
      }
      const user=result.rows[0];
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
          return res.send({error:"Invalid password"});
      }
      const token=jwt.sign(
          {userId:user.id,email:user.email},JWT_SECRET,{expiresIn:"1h"}
      );
      res.send({
        message:"login suceessful",
        token:token,
      });
    }catch(err){
      console.log(err);
      res.status(500).send("server error");
    }
});
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.send({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next(); 
  } catch (err) {
    return res.send({ error: "Invalid or expired token" });
  }
}
app.get("/test", authMiddleware, (req, res) => {
  res.send(req.user);
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); 
  res.send(result.rows);
});

app.put("/:id/:name",authMiddleware, async (req, res) => {
  let conn;
  try {
    const id = req.params.id;
    const userId=req.user.userId;
    const conn = await pool.connect(); 
    await conn.query("BEGIN");
    await conn.query("BEGIN");

    const userResult=await conn.query(
      "SELECT name FROM users WHERE id=$1",
       [userId]
    );
    const name=userResult.rows[0].name;
    const result=await conn.query(
      "SELECT * FROM seats WHERE id=$1 AND isbooked=0 FOR UPDATE",
      [id]
    );
    if(result.rowCount===0){
      await conn.query("ROLLBACK");
      return res.status(400).send({error:"seat booked"});
    }
    const alreadyBooked = await conn.query(
  "SELECT * FROM bookings WHERE user_id = $1 AND seat_id = $2",
  [userId, id]
);
if (alreadyBooked.rowCount > 0) {
  await conn.query("ROLLBACK");
  return res.send({ error: "You already booked this seat" });
}
    await conn.query(
      "UPDATE seats SET isbooked=1,name=$2 WHERE id=$1",
      [id,name]
    );
    await conn.query(
  "INSERT INTO bookings (user_id, seat_id) VALUES ($1, $2)",
  [userId, id]
);
  await conn.query("COMMIT");
  res.send({message:"Seat booked"});
  }catch(err){
    console.log(err);
    if(conn) await conn.query("ROLLBACK");
    res .status(500).send("SERVER ERROR");
  }finally{
    if(conn) conn.release();
  }
});

app.listen(port, () => console.log("Server starting on port: " + port));
