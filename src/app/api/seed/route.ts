import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.userCourse.deleteMany();
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.university.deleteMany();

    // Create universities
    const harvard = await prisma.university.create({
      data: { name: "Harvard University", emailDomain: "harvard.edu" },
    });

    const bu = await prisma.university.create({
      data: { name: "Boston University", emailDomain: "bu.edu" },
    });

    const mit = await prisma.university.create({
      data: { name: "Massachusetts Institute of Technology", emailDomain: "mit.edu" },
    });

    await prisma.university.create({
      data: { name: "Stanford University", emailDomain: "stanford.edu" },
    });

    // Create courses for Harvard
    const cs50 = await prisma.course.create({
      data: { name: "Introduction to Computer Science", courseNumber: "CS50", department: "Computer Science", universityId: harvard.id },
    });

    const econ10a = await prisma.course.create({
      data: { name: "Principles of Economics", courseNumber: "ECON10A", department: "Economics", universityId: harvard.id },
    });

    const math21a = await prisma.course.create({
      data: { name: "Multivariable Calculus", courseNumber: "MATH21A", department: "Mathematics", universityId: harvard.id },
    });

    const chem20 = await prisma.course.create({
      data: { name: "Organic Chemistry", courseNumber: "CHEM20", department: "Chemistry", universityId: harvard.id },
    });

    await prisma.course.create({
      data: { name: "Molecular Biology", courseNumber: "BIO50", department: "Biology", universityId: harvard.id },
    });

    // BU courses
    await prisma.course.createMany({
      data: [
        { name: "Data Structures", courseNumber: "CS112", department: "Computer Science", universityId: bu.id },
        { name: "Intro to Programming", courseNumber: "CS111", department: "Computer Science", universityId: bu.id },
        { name: "Calculus I", courseNumber: "MA123", department: "Mathematics", universityId: bu.id },
        { name: "General Chemistry", courseNumber: "CH101", department: "Chemistry", universityId: bu.id },
        { name: "Macroeconomics", courseNumber: "EC102", department: "Economics", universityId: bu.id },
      ],
    });

    // MIT courses
    await prisma.course.createMany({
      data: [
        { name: "Introduction to Algorithms", courseNumber: "6.006", department: "EECS", universityId: mit.id },
        { name: "Linear Algebra", courseNumber: "18.06", department: "Mathematics", universityId: mit.id },
        { name: "Physics I", courseNumber: "8.01", department: "Physics", universityId: mit.id },
        { name: "Differential Equations", courseNumber: "18.03", department: "Mathematics", universityId: mit.id },
      ],
    });

    const passwordHash = await hashPassword("password123");

    const demoUser = await prisma.user.create({
      data: { email: "demo@harvard.edu", name: "Demo Student", passwordHash, emailVerified: true, universityId: harvard.id },
    });

    await prisma.userCourse.createMany({
      data: [
        { userId: demoUser.id, courseId: cs50.id, status: "TAKING" },
        { userId: demoUser.id, courseId: econ10a.id, status: "TAKING" },
        { userId: demoUser.id, courseId: math21a.id, status: "TOOK" },
      ],
    });

    const otherUser = await prisma.user.create({
      data: { email: "seller@harvard.edu", name: "Jane Seller", passwordHash, emailVerified: true, universityId: harvard.id },
    });

    await prisma.userCourse.createMany({
      data: [
        { userId: otherUser.id, courseId: cs50.id, status: "TOOK" },
        { userId: otherUser.id, courseId: chem20.id, status: "TAKING" },
      ],
    });

    await prisma.listing.createMany({
      data: [
        { title: "CS50 Textbook - Introduction to Algorithms (CLRS)", description: "Used for one semester, great condition. Some highlighting but no torn pages.", price: 45.0, category: "TEXTBOOK", type: "SELLING", condition: "Good", courseId: cs50.id, sellerId: otherUser.id },
        { title: "TI-84 Plus CE Calculator", description: "Works perfectly, comes with charging cable. Used for MATH21A.", price: 60.0, category: "CALCULATOR", type: "SELLING", condition: "Like New", courseId: math21a.id, sellerId: otherUser.id },
        { title: "Looking for ECON10A lecture notes", description: "Missed a few weeks of class. Looking for complete lecture notes from this semester.", price: 15.0, category: "NOTES", type: "LOOKING_FOR", courseId: econ10a.id, sellerId: demoUser.id },
        { title: "Organic Chemistry Lab Kit", description: "Complete lab kit required for CHEM20. All pieces included and unused.", price: 85.0, category: "LAB_EQUIPMENT", type: "SELLING", condition: "New", courseId: chem20.id, sellerId: otherUser.id },
        { title: "CS50 Study Guide - Final Exam", description: "Comprehensive study guide covering all topics. Got an A using this!", price: 10.0, category: "STUDY_GUIDE", type: "SELLING", courseId: cs50.id, sellerId: otherUser.id },
      ],
    });

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
