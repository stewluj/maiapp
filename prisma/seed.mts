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

// Import course data
const { universities } = require(path.join(__dirname, "courses.js"));

// Fallback inline data in case the import fails
const fallbackUniversities = [
  { name: "Harvard University", emailDomain: "harvard.edu" },
  { name: "Boston University", emailDomain: "bu.edu" },
  { name: "Massachusetts Institute of Technology", emailDomain: "mit.edu" },
  { name: "Stanford University", emailDomain: "stanford.edu" },
];

async function main() {
  let uniData: any[];
  try {
    uniData = universities;
    if (!uniData || !Array.isArray(uniData)) throw new Error("bad import");
  } catch {
    // If the TS import doesn't work at seed time, use inline data
    uniData = fallbackUniversities.map(u => ({ ...u, courses: [] }));
  }

  // Create all universities and their courses
  const universityMap: Record<string, string> = {}; // emailDomain -> id
  const courseMap: Record<string, string> = {}; // "domain:courseNumber" -> id

  for (const uni of uniData) {
    const created = await prisma.university.create({
      data: { name: uni.name, emailDomain: uni.emailDomain },
    });
    universityMap[uni.emailDomain] = created.id;

    if (uni.courses && uni.courses.length > 0) {
      // Batch create courses for this university
      const courseData = uni.courses.map((c: any) => ({
        name: c.name,
        courseNumber: c.courseNumber,
        department: c.department || null,
        universityId: created.id,
      }));

      await prisma.course.createMany({ data: courseData, skipDuplicates: true });

      // Fetch back to get IDs
      const courses = await prisma.course.findMany({
        where: { universityId: created.id },
      });
      for (const c of courses) {
        courseMap[`${uni.emailDomain}:${c.courseNumber}`] = c.id;
      }
    }
  }

  const harvardId = universityMap["harvard.edu"];
  const cs50Id = courseMap["harvard.edu:CS50"];
  const econ10aId = courseMap["harvard.edu:ECON10A"];
  const math21aId = courseMap["harvard.edu:MATH21A"];
  const chem20Id = courseMap["harvard.edu:CHEM20"];

  const passwordHash = await bcrypt.hash("password123", 12);

  const demoUser = await prisma.user.create({
    data: { email: "demo@harvard.edu", name: "Demo Student", passwordHash, emailVerified: true, universityId: harvardId },
  });

  if (cs50Id && econ10aId && math21aId) {
    await prisma.userCourse.createMany({
      data: [
        { userId: demoUser.id, courseId: cs50Id, status: "TAKING" },
        { userId: demoUser.id, courseId: econ10aId, status: "TAKING" },
        { userId: demoUser.id, courseId: math21aId, status: "TOOK" },
      ],
    });
  }

  const otherUser = await prisma.user.create({
    data: { email: "seller@harvard.edu", name: "Jane Seller", passwordHash, emailVerified: true, universityId: harvardId },
  });

  if (cs50Id && chem20Id) {
    await prisma.userCourse.createMany({
      data: [
        { userId: otherUser.id, courseId: cs50Id, status: "TOOK" },
        { userId: otherUser.id, courseId: chem20Id, status: "TAKING" },
      ],
    });
  }

  const listings = [];
  if (cs50Id) {
    listings.push(
      { title: "CS50 Textbook - Introduction to Algorithms (CLRS)", description: "Used for one semester, great condition.", price: 45.0, category: "TEXTBOOK", type: "SELLING", condition: "Good", courseId: cs50Id, sellerId: otherUser.id },
      { title: "CS50 Study Guide - Final Exam", description: "Comprehensive study guide covering all topics.", price: 10.0, category: "STUDY_GUIDE", type: "SELLING", courseId: cs50Id, sellerId: otherUser.id },
    );
  }
  if (math21aId) {
    listings.push(
      { title: "TI-84 Plus CE Calculator", description: "Works perfectly, comes with charging cable.", price: 60.0, category: "CALCULATOR", type: "SELLING", condition: "Like New", courseId: math21aId, sellerId: otherUser.id },
    );
  }
  if (econ10aId) {
    listings.push(
      { title: "Looking for ECON10A lecture notes", description: "Missed a few weeks of class.", price: 15.0, category: "NOTES", type: "LOOKING_FOR", courseId: econ10aId, sellerId: demoUser.id },
    );
  }
  if (chem20Id) {
    listings.push(
      { title: "Organic Chemistry Lab Kit", description: "Complete lab kit required for CHEM20.", price: 85.0, category: "LAB_EQUIPMENT", type: "SELLING", condition: "New", courseId: chem20Id, sellerId: otherUser.id },
    );
  }

  // General marketplace listings
  listings.push(
    { title: "2 Concert Tickets - Weekend Show", description: "Can't make it anymore, selling at face value.", price: 75.0, category: "TICKETS", type: "SELLING", condition: "New", sellerId: otherUser.id, universityId: harvardId },
    { title: "IKEA Desk - Great for Dorms", description: "Moving out, need to sell. Barely used.", price: 40.0, category: "FURNITURE", type: "SELLING", condition: "Like New", sellerId: demoUser.id, universityId: harvardId },
    { title: "MacBook Air Charger", description: "Genuine Apple charger, works great.", price: 25.0, category: "ELECTRONICS", type: "SELLING", condition: "Good", sellerId: otherUser.id, universityId: harvardId },
  );

  if (listings.length > 0) {
    await prisma.listing.createMany({ data: listings });
  }

  const totalCourses = Object.keys(courseMap).length;
  const totalUnis = Object.keys(universityMap).length;
  console.log(`Seed complete! ${totalUnis} universities, ${totalCourses} courses, ${listings.length} listings.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
