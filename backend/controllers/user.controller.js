import prisma from "../db/connectToDB.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    console.log(req.user.id);
    const loggedInUserId = req.user.id;
    const filteredUsers = await prisma.user.findMany({
      where: {
        NOT: {
          id: loggedInUserId,
        },
      },
      select: {
        id: true,
        fullName: true,
        userName: true,
        profilePic: true,
      },
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
