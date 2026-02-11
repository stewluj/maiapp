import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/messages - get user's conversations
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { id: user.id } },
    },
    include: {
      listing: { select: { id: true, title: true, price: true, type: true } },
      participants: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

// POST /api/messages - start a conversation or send a message
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { listingId, receiverId, content, conversationId } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  // If conversationId is provided, send message in existing conversation
  if (conversationId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      include: { participants: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const otherParticipant = conversation.participants.find((p) => p.id !== user.id);
    if (!otherParticipant) {
      return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId: otherParticipant.id,
        conversationId,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message });
  }

  // Start a new conversation
  if (!listingId || !receiverId) {
    return NextResponse.json({ error: "listingId and receiverId are required for new conversations" }, { status: 400 });
  }

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      listingId,
      AND: [
        { participants: { some: { id: user.id } } },
        { participants: { some: { id: receiverId } } },
      ],
    },
  });

  if (existingConversation) {
    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId,
        conversationId: existingConversation.id,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: existingConversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message, conversationId: existingConversation.id });
  }

  // Create new conversation with first message
  const conversation = await prisma.conversation.create({
    data: {
      listingId,
      participants: { connect: [{ id: user.id }, { id: receiverId }] },
      messages: {
        create: {
          content,
          senderId: user.id,
          receiverId,
        },
      },
    },
    include: {
      messages: { include: { sender: { select: { id: true, name: true } } } },
      listing: { select: { id: true, title: true, price: true } },
      participants: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ conversation });
}
