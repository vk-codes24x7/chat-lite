import prisma from "../db/connectToDB.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: senderId, // Sender is a participant
              },
            },
          },
          {
            participants: {
              some: {
                id: +receiverId, // Receiver is a participant
              },
            },
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: senderId }, // Connect the sender
              { id: +receiverId }, // Connect the receiver
            ],
          },
        },
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        message,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: +receiverId } },
        conversation: { connect: { id: conversation.id } },
      },
    });

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { messages: { connect: { id: newMessage.id } } },
    });

    await Promise.all([newMessage, updatedConversation]);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;

    const conversation = await await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: senderId, // Sender is a participant
              },
            },
          },
          {
            participants: {
              some: {
                id: +userToChatId, // Receiver is a participant
              },
            },
          },
        ],
      },
      include: {
        messages: true,
      },
    });

    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }

    const messages = conversation.messages;
    res.status(200).json({ messages });
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
