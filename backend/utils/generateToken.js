import jwt from "jsonwebtoken";

const generateJWTAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, // prevent XSS attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // in milliseconds
    sameSite: "strict", // prevent CSRF attacks
    secure: process.env.NODE_ENV === "production" ? true : false, // HTTPS
  });
};

export default generateJWTAndSetCookie;
