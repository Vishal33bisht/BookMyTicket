CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE seats (
     id SERIAL PRIMARY KEY,     
     name VARCHAR(255),
    isbooked INT DEFAULT 0
);
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    seat_id INT REFERENCES seats(id),
    UNIQUE(user_id, seat_id)
);
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT,
  token TEXT
);
INSERT INTO seats (name) VALUES
('A1'),
('A2'),
('A3'),
('A4'),
('A5');