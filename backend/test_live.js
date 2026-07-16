const fetch = require('node-fetch');

async function testBackend() {
  const timetable = [{ day: "Monday", class: "Math", endTime: "14:00" }];
  const calendar = [{ date: "2026-07-20", event: "Holiday" }];
  const syllabus = [{ subject: "Math", weightage: 5 }];

  try {
    console.log("Sending POST to https://studyquest-backend-j2nh.onrender.com/api/schedule/merge/generate...");
    const res = await fetch("https://studyquest-backend-j2nh.onrender.com/api/schedule/merge/generate", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timetable, calendar, syllabus })
    });

    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);
  } catch (e) {
    console.error(e);
  }
}

testBackend();
