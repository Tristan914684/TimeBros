const { Pool } = require("pg");
const fetch = require("node-fetch");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ACAD_YEAR = "2024-2025";
const SEMESTER = 1;

async function seed() {
  // Create tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modules (
      code VARCHAR(20) PRIMARY KEY,
      title TEXT,
      description TEXT,
      credits INTEGER
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      module_code VARCHAR(20) REFERENCES modules(code),
      class_no VARCHAR(20),
      lesson_type VARCHAR(50),
      day VARCHAR(20),
      start_time VARCHAR(10),
      end_time VARCHAR(10),
      venue VARCHAR(100)
    );
  `);

  console.log("Fetching full module list from NUSMods...");

  const listRes = await fetch(`https://api.nusmods.com/v2/${ACAD_YEAR}/moduleList.json`);
  const moduleList = await listRes.json();
  console.log(`Found ${moduleList.length} modules. Starting import...`);

  for (const mod of moduleList) {
    try {
      const res = await fetch(`https://api.nusmods.com/v2/${ACAD_YEAR}/modules/${mod.moduleCode}.json`);
      if (!res.ok) continue;

      const data = await res.json();

      await pool.query(
        `INSERT INTO modules (code, title, description, credits)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO NOTHING`,
        [data.moduleCode, data.title, data.description, parseInt(data.moduleCredit)]
      );

      const semData = data.semesterData?.find(s => s.semester === SEMESTER);
      if (!semData) continue;

      for (const lesson of semData.timetable) {
        await pool.query(
          `INSERT INTO lessons (module_code, class_no, lesson_type, day, start_time, end_time, venue)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [data.moduleCode, lesson.classNo, lesson.lessonType, lesson.day,
           lesson.startTime, lesson.endTime, lesson.venue]
        );
      }

      console.log(`✓ ${data.moduleCode} — ${data.title}`);

    } catch (err) {
      console.error(`✗ ${mod.moduleCode}:`, err.message);
    }
  }

  console.log("Done");
  await pool.end();
}

seed();