import { PrismaClient } from "@prisma/client";
import fs from "fs";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Load JSON files from src/data
  const usersData = JSON.parse(fs.readFileSync("src/data/users.json", "utf8"));
  const hostsData = JSON.parse(fs.readFileSync("src/data/hosts.json", "utf8"));
  const propertiesData = JSON.parse(fs.readFileSync("src/data/properties.json", "utf8"));
  const bookingsData = JSON.parse(fs.readFileSync("src/data/bookings.json", "utf8"));
  const reviewsData = JSON.parse(fs.readFileSync("src/data/reviews.json", "utf8"));
  const amenitiesData = JSON.parse(fs.readFileSync("src/data/amenities.json", "utf8"));

  console.log("Seeding users...");
  for (const user of usersData.users) {
    // Hash passwords before storing
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({ data: { ...user, password: hashedPassword } });
  }

  console.log("Seeding hosts...");
  for (const host of hostsData.hosts) {
    const hashedPassword = await bcrypt.hash(host.password, 10);
    await prisma.host.create({ data: { ...host, password: hashedPassword } });
  }

  console.log("Seeding properties...");
  for (const property of propertiesData.properties) {
    await prisma.property.create({ data: property });
  }

  console.log("Seeding bookings...");
  for (const booking of bookingsData.bookings) {
    await prisma.booking.create({ data: booking });
  }

  console.log("Seeding reviews...");
  for (const review of reviewsData.reviews) {
    await prisma.review.create({ data: review });
  }

  console.log("Seeding amenities...");
  for (const amenity of amenitiesData.amenities) {
    await prisma.amenity.create({ data: amenity });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
