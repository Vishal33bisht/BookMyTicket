import pool from "../config/db.js";

export const bookSeat = async (req, res) => {
  let conn;

  try {
    const seatId = req.params.id;
    const userId = req.user.userId;

    conn = await pool.connect();
    await conn.query("BEGIN");

    const userResult = await conn.query(
      "SELECT name FROM users WHERE id=$1",
      [userId]
    );

    const name = userResult.rows[0].name;

    // Lock seat
    const seatResult = await conn.query(
      "SELECT * FROM seats WHERE id=$1 AND isbooked=0 FOR UPDATE",
      [seatId]
    );

    if (seatResult.rowCount === 0) {
      await conn.query("ROLLBACK");
      return res.status(400).json({ error: "Seat already booked" });
    }

    // Duplicate check
    const alreadyBooked = await conn.query(
      "SELECT * FROM bookings WHERE user_id=$1 AND seat_id=$2",
      [userId, seatId]
    );

    if (alreadyBooked.rowCount > 0) {
      await conn.query("ROLLBACK");
      return res.status(400).json({ error: "Already booked" });
    }

    // Update seat
    await conn.query(
      "UPDATE seats SET isbooked=1, name=$2 WHERE id=$1",
      [seatId, name]
    );

    // Insert booking
    await conn.query(
      "INSERT INTO bookings (user_id, seat_id) VALUES ($1,$2)",
      [userId, seatId]
    );

    await conn.query("COMMIT");

    res.json({ message: "Seat booked successfully" });
  } catch (err) {
    if (conn) await conn.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};