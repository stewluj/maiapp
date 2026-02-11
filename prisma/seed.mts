import { createRequire } from "node:module";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Require the generated client directly, bypassing the @prisma/client proxy
const generatedClient = require(path.join(__dirname, "..", "node_modules", ".prisma", "client", "index.js"));
const bcrypt = require("bcryptjs");

const { PrismaClient } = generatedClient;
const prisma = new PrismaClient();

async function main() {
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

  await prisma.course.createMany({
    data: [
      { name: "Data Structures", courseNumber: "CS112", department: "Computer Science", universityId: bu.id },
      { name: "Intro to Programming", courseNumber: "CS111", department: "Computer Science", universityId: bu.id },
      { name: "Calculus I", courseNumber: "MA123", department: "Mathematics", universityId: bu.id },
      { name: "General Chemistry", courseNumber: "CH101", department: "Chemistry", universityId: bu.id },
      { name: "Macroeconomics", courseNumber: "EC102", department: "Economics", universityId: bu.id },
    ],
  });

  await prisma.course.createMany({
    data: [
      { name: "Introduction to Algorithms", courseNumber: "6.006", department: "EECS", universityId: mit.id },
      { name: "Linear Algebra", courseNumber: "18.06", department: "Mathematics", universityId: mit.id },
      { name: "Physics I", courseNumber: "8.01", department: "Physics", universityId: mit.id },
      { name: "Differential Equations", courseNumber: "18.03", department: "Mathematics", universityId: mit.id },
    ],
  });

  const passwordHash = await bcrypt.hash("password123", 12);

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
      { title: "CS50 Textbook - Introduction to Algorithms (CLRS)", description: "Used for one semester, great condition.", price: 45.0, category: "TEXTBOOK", type: "SELLING", condition: "Good", courseId: cs50.id, sellerId: otherUser.id },
      { title: "TI-84 Plus CE Calculator", description: "Works perfectly, comes with charging cable.", price: 60.0, category: "CALCULATOR", type: "SELLING", condition: "Like New", courseId: math21a.id, sellerId: otherUser.id },
      { title: "Looking for ECON10A lecture notes", description: "Missed a few weeks of class.", price: 15.0, category: "NOTES", type: "LOOKING_FOR", courseId: econ10a.id, sellerId: demoUser.id },
      { title: "Organic Chemistry Lab Kit", description: "Complete lab kit required for CHEM20.", price: 85.0, category: "LAB_EQUIPMENT", type: "SELLING", condition: "New", courseId: chem20.id, sellerId: otherUser.id },
      { title: "CS50 Study Guide - Final Exam", description: "Comprehensive study guide covering all topics.", price: 10.0, category: "STUDY_GUIDE", type: "SELLING", courseId: cs50.id, sellerId: otherUser.id },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
