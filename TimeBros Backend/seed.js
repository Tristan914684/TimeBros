const { Pool } = require("pg");
const fetch = require("node-fetch");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "User_details",
  password: "Timebros",
  port: 5432,
});

const ACAD_YEAR = "2024-2025";
const SEMESTER = 1;

async function seed() {
  console.log("Fetching full module list from NUSMods...");

  // Step 1 — get all module codes
  const listRes = await fetch(`https://api.nusmods.com/v2/${ACAD_YEAR}/moduleList.json`);
  const moduleList = await listRes.json();
  console.log(`Found ${moduleList.length} modules. Starting import...`);

  // Step 2 — loop through each and fetch full details
  for (const mod of moduleList) {
    try {
      const res = await fetch(`https://api.nusmods.com/v2/${ACAD_YEAR}/modules/${mod.moduleCode}.json`);
      if (!res.ok) continue;

      const data = await res.json();

      // Insert module
      await pool.query(
        `INSERT INTO modules (code, title, description, credits)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO NOTHING`,
        [data.moduleCode, data.title, data.description, parseInt(data.moduleCredit)]
      );

      // Find semester data
      const semData = data.semesterData?.find(s => s.semester === SEMESTER);
      if (!semData) continue;

      // Insert lesson slots
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

  console.log("Done!");
  await pool.end();
}

seed();