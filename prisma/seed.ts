import { PrismaClient, Role, Condition, BorrowStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding LabFlow database with Computer & Network Lab Inventory with full images...");

  await prisma.activityLog.deleteMany();
  await prisma.borrowing.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash("admin123", 12);
  const studentPass = await bcrypt.hash("siswa123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Pak Budi (Laboran TKJ)",
      email: "admin@labflow.sch.id",
      nisnNip: "198501012010011001",
      password: adminPass,
      role: Role.admin,
      phoneNumber: "081234567890",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Naufal Aziz Nabigh Siagian",
      email: "naufal@student.labflow.sch.id",
      nisnNip: "0073456789",
      password: studentPass,
      role: Role.siswa,
      phoneNumber: "082345678901",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Rina Kartika",
      email: "rina@student.labflow.sch.id",
      nisnNip: "0073456790",
      password: studentPass,
      role: Role.siswa,
      phoneNumber: "083456789012",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Dian Pratama",
      email: "dian@student.labflow.sch.id",
      nisnNip: "0073456791",
      password: studentPass,
      role: Role.siswa,
      phoneNumber: "084567890123",
    },
  });

  console.log("✅ Users seeded");

  // ── Categories ────────────────────────────────────────────────────────────
  const catJaringan = await prisma.category.create({
    data: {
      name: "Perangkat Jaringan",
      slug: "perangkat-jaringan",
      description: "Routerboard MikroTik, Access Point, Switch, dan perangkat keras jaringan lab",
    },
  });

  const catKabel = await prisma.category.create({
    data: {
      name: "Kabel LAN & Konektor",
      slug: "kabel-lan",
      description: "Roll kabel UTP Cat5e/Cat6, patch cord rakitan, konektor RJ45, dan barrel",
    },
  });

  const catTools = await prisma.category.create({
    data: {
      name: "Alat-alat Jaringan",
      slug: "alat-jaringan",
      description: "Crimping tool, LAN tester digital, punch down tool, dan wire stripper",
    },
  });

  const catIoT = await prisma.category.create({
    data: {
      name: "Alat IoT & Mikrokontroler",
      slug: "alat-iot",
      description: "Modul ESP32, Arduino Uno, Raspberry Pi, sensor kit IoT, dan breadboard",
    },
  });

  const catJanitor = await prisma.category.create({
    data: {
      name: "Alat Janitor & Kebersihan",
      slug: "alat-janitor",
      description: "Electric air blower PC, vacuum cleaner mini, contact cleaner, dan pel pembersih lab",
    },
  });

  console.log("✅ Categories seeded");

  // ── Items with Full High-Quality Images ────────────────────────────────────
  const items = await Promise.all([
    // Kategori 1: Perangkat Jaringan (MikroTik, Switch, AP)
    prisma.item.create({
      data: {
        categoryId: catJaringan.id,
        itemCode: "NET-001",
        name: "MikroTik RouterBOARD RB750Gr3 (hEX)",
        totalStock: 15,
        availableStock: 12,
        condition: Condition.baik,
        location: "Rak Server A1 - Lab Jaringan",
        imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJaringan.id,
        itemCode: "NET-002",
        name: "MikroTik RouterBOARD RB941-2nD (hAP Lite)",
        totalStock: 20,
        availableStock: 16,
        condition: Condition.baik,
        location: "Rak Server A2 - Lab Jaringan",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJaringan.id,
        itemCode: "NET-003",
        name: "MikroTik Cloud Router Switch CRS326-24G-2S+",
        totalStock: 4,
        availableStock: 3,
        condition: Condition.baik,
        location: "Rackmount 19 Inch - Lab Server",
        imageUrl: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJaringan.id,
        itemCode: "NET-004",
        name: "Access Point TP-Link Omada EAP225 Dual-Band",
        totalStock: 8,
        availableStock: 8,
        condition: Condition.baik,
        location: "Lemari Jaringan B1",
        imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=80",
      },
    }),

    // Kategori 2: Kabel LAN & Konektor
    prisma.item.create({
      data: {
        categoryId: catKabel.id,
        itemCode: "CAB-001",
        name: "Kabel LAN UTP Cat6 Belden Original (Roll 305m)",
        totalStock: 6,
        availableStock: 4,
        condition: Condition.baik,
        location: "Gudang Lab - Rak Roll Kabel",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catKabel.id,
        itemCode: "CAB-002",
        name: "Patch Cord LAN Cat6 UTP 1.5 Meter",
        totalStock: 50,
        availableStock: 42,
        condition: Condition.baik,
        location: "Box Kontainer B2 - Meja Rakit",
        imageUrl: "https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catKabel.id,
        itemCode: "CAB-003",
        name: "Patch Cord LAN Cat5e UTP 3 Meter",
        totalStock: 35,
        availableStock: 28,
        condition: Condition.baik,
        location: "Box Kontainer B2 - Meja Rakit",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catKabel.id,
        itemCode: "CAB-004",
        name: "Konektor RJ-45 Cat6 Modular Plug (Box isi 50 pcs)",
        totalStock: 15,
        availableStock: 11,
        condition: Condition.baik,
        location: "Laci C1 - Komponen RJ45",
        imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80",
      },
    }),

    // Kategori 3: Alat-alat Jaringan & Tools
    prisma.item.create({
      data: {
        categoryId: catTools.id,
        itemCode: "TOL-001",
        name: "Crimping Tool RJ-45 & RJ-11 Heavy Duty (Pro'sKit)",
        totalStock: 25,
        availableStock: 19,
        condition: Condition.baik,
        location: "Lemari Toolset - Rak 1",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catTools.id,
        itemCode: "TOL-002",
        name: "Digital Network LAN Cable Tester RJ-45 / RJ-11",
        totalStock: 15,
        availableStock: 12,
        condition: Condition.baik,
        location: "Lemari Toolset - Rak 2",
        imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catTools.id,
        itemCode: "TOL-003",
        name: "Punch Down Impact Tool Krone Type",
        totalStock: 10,
        availableStock: 8,
        condition: Condition.baik,
        location: "Lemari Toolset - Rak 2",
        imageUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catTools.id,
        itemCode: "TOL-004",
        name: "Wire Stripper & Rotary Cable Cutter",
        totalStock: 18,
        availableStock: 15,
        condition: Condition.rusak_ringan,
        location: "Laci Perkakas Jaringan",
        imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=80",
      },
    }),

    // Kategori 4: Alat IoT & Mikrokontroler
    prisma.item.create({
      data: {
        categoryId: catIoT.id,
        itemCode: "IOT-001",
        name: "Modul ESP32 NodeMCU 38-Pin Wi-Fi + Bluetooth",
        totalStock: 30,
        availableStock: 22,
        condition: Condition.baik,
        location: "Laci IoT Rak D1 - Lab Embedded",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catIoT.id,
        itemCode: "IOT-002",
        name: "Arduino Uno R3 DIP ATmega328P + Kabel USB",
        totalStock: 25,
        availableStock: 18,
        condition: Condition.baik,
        location: "Laci IoT Rak D1 - Lab Embedded",
        imageUrl: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catIoT.id,
        itemCode: "IOT-003",
        name: "Raspberry Pi 4 Model B (4GB RAM Quad-Core)",
        totalStock: 8,
        availableStock: 6,
        condition: Condition.baik,
        location: "Brankas Elektronik D2 - Lab IoT",
        imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catIoT.id,
        itemCode: "IOT-004",
        name: "Sensor Kit 37-in-1 IoT (DHT11, PIR, Ultrasonic, Relay)",
        totalStock: 12,
        availableStock: 9,
        condition: Condition.baik,
        location: "Organizer Box D3 - Sensor Lab",
        imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catIoT.id,
        itemCode: "IOT-005",
        name: "Breadboard 830 Titik MB-102 Transparan",
        totalStock: 30,
        availableStock: 25,
        condition: Condition.baik,
        location: "Laci Prototyping D4",
        imageUrl: "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?w=500&auto=format&fit=crop&q=80",
      },
    }),

    // Kategori 5: Alat Janitor & Kebersihan Lab
    prisma.item.create({
      data: {
        categoryId: catJanitor.id,
        itemCode: "JAN-001",
        name: "Electric Air Blower Pembersih PC & Server (600W)",
        totalStock: 4,
        availableStock: 3,
        condition: Condition.baik,
        location: "Lemari Janitor Lab 01",
        imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJanitor.id,
        itemCode: "JAN-002",
        name: "Mini Vacuum Cleaner Portable Keyboard & Komponen",
        totalStock: 6,
        availableStock: 5,
        condition: Condition.baik,
        location: "Lemari Janitor Lab 01",
        imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJanitor.id,
        itemCode: "JAN-003",
        name: "Electronic Contact Cleaner Spray 400ml",
        totalStock: 10,
        availableStock: 7,
        condition: Condition.baik,
        location: "Lemari Kimia Janitor Lab",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJanitor.id,
        itemCode: "JAN-004",
        name: "Kain Lap Microfiber Anti-Statis (Pack isi 5 Pcs)",
        totalStock: 20,
        availableStock: 16,
        condition: Condition.baik,
        location: "Laci Perlengkapan Janitor",
        imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=80",
      },
    }),
    prisma.item.create({
      data: {
        categoryId: catJanitor.id,
        itemCode: "JAN-005",
        name: "Set Pel Lantai Microfiber & Ember Peras Dual-Drive",
        totalStock: 3,
        availableStock: 2,
        condition: Condition.baik,
        location: "Sudut Service & Janitor Lab",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80",
      },
    }),
  ]);

  console.log("✅ Items seeded with images");

  // ── Borrowings ────────────────────────────────────────────────────────────
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);
  const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const oneWeekAgo = new Date(now); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const pastDue = new Date(now); pastDue.setDate(pastDue.getDate() - 3);

  await prisma.borrowing.createMany({
    data: [
      {
        transactionCode: "TRX-20261101-0001",
        userId: student1.id,
        itemId: items[0].id, // MikroTik RB750Gr3
        quantity: 2,
        borrowDate: yesterday,
        returnExpectedDate: nextWeek,
        status: BorrowStatus.borrowed,
        adminId: admin.id,
        notes: "Praktikum Routing Statis & Firewall Filter kelas XI TKJ",
        adminNotes: "Disetujui dan diserahkan bersama adaptor daya",
      },
      {
        transactionCode: "TRX-20261102-0002",
        userId: student2.id,
        itemId: items[8].id, // Crimping Tool
        quantity: 3,
        borrowDate: now,
        returnExpectedDate: nextWeek,
        status: BorrowStatus.pending,
        notes: "Tugas perakitan kabel UTP Straight & Cross kelompok 2",
      },
      {
        transactionCode: "TRX-20261103-0003",
        userId: student3.id,
        itemId: items[12].id, // Modul ESP32
        quantity: 2,
        borrowDate: now,
        returnExpectedDate: nextWeek,
        status: BorrowStatus.pending,
        notes: "Proyek IoT Smart Green House monitoring suhu DHT11",
      },
      {
        transactionCode: "TRX-20261025-0004",
        userId: student1.id,
        itemId: items[17].id, // Electric Air Blower
        quantity: 1,
        borrowDate: twoWeeksAgo,
        returnExpectedDate: oneWeekAgo,
        returnActualDate: oneWeekAgo,
        status: BorrowStatus.returned,
        adminId: admin.id,
        notes: "Pembersihan debu casing CPU client Lab Komputer 3",
        adminNotes: "Dikembalikan dalam kondisi bersih dan kabel rapi",
      },
      {
        transactionCode: "TRX-20261105-0005",
        userId: student2.id,
        itemId: items[9].id, // Digital Cable Tester
        quantity: 1,
        borrowDate: twoWeeksAgo,
        returnExpectedDate: pastDue,
        status: BorrowStatus.overdue,
        adminId: admin.id,
        notes: "Pengujian instalasi titik kabel LAN ruang guru",
      },
    ],
  });

  console.log("✅ Borrowings seeded");

  // ── Activity Logs ─────────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: "USER_LOGIN", context: JSON.stringify({ role: "admin" }), ipAddress: "127.0.0.1" },
      { userId: student1.id, action: "BORROW_REQUEST_CREATED", context: JSON.stringify({ transactionCode: "TRX-20261101-0001", itemName: "MikroTik RouterBOARD RB750Gr3 (hEX)" }), ipAddress: "192.168.1.10" },
      { userId: admin.id, action: "BORROW_APPROVED", context: JSON.stringify({ transactionCode: "TRX-20261101-0001" }), ipAddress: "127.0.0.1" },
      { userId: admin.id, action: "ITEM_CREATED", context: JSON.stringify({ itemCode: "IOT-001", itemName: "Modul ESP32 NodeMCU 38-Pin Wi-Fi + Bluetooth" }), ipAddress: "127.0.0.1" },
      { userId: student2.id, action: "BORROW_REQUEST_CREATED", context: JSON.stringify({ transactionCode: "TRX-20261102-0002", itemName: "Crimping Tool RJ-45 & RJ-11 Heavy Duty" }), ipAddress: "192.168.1.11" },
    ],
  });

  console.log("✅ Activity logs seeded");
  console.log("\n🎉 LabFlow database seeded successfully!");
  console.log("👤 Admin:   admin@labflow.sch.id  / admin123");
  console.log("👤 Student: naufal@student.labflow.sch.id / siswa123");
  console.log("👤 Student: rina@student.labflow.sch.id / siswa123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
