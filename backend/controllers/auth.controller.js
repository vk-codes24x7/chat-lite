import brcrypt from "bcryptjs";
import generateJWTAndSetCookie from "../utils/generateToken.js";
import prisma from "../db/connectToDB.js";

export const signup = async (req, res) => {
  try {
    const { fullName, userName, password, confirmPassword, gender } = req.body;

    console.log(req.body);

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await prisma.user.findUnique({
      where: {
        userName,
      },
    });

    console.log(user);

    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await brcrypt.genSalt(10);
    const hashedPassword = await brcrypt.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

    const newUser = await prisma.user.create({
      data: {
        fullName,
        userName,
        password: hashedPassword,
        gender,
        profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
      },
    });

    if (newUser) {
      generateJWTAndSetCookie(newUser.id, res);
      res.status(201).json({
        id: newUser.id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        userName,
      },
    });
    const isPasswordValid = await brcrypt.compare(password, user.password);
    if (!user || !isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    generateJWTAndSetCookie(user.id, res);

    res.status(200).json({
      id: user.id,
      userName: user.userName,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
