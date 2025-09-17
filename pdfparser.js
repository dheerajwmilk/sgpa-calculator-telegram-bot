import fs from "fs";
import { parsePdf } from "afpp";
import { sgpaCalc } from "./SGPAcalc.js";

export async function parsePDFtoJSON(filePath) {
  const buffer = fs.readFileSync(filePath);

  const data = await parsePdf(buffer, {}, (content) => content);

  const text = data[0];
  if (!text.toLowerCase().includes("rajasthan technical university")) {
    console.error("❌ Not an RTU mark sheet.");
    process.exit(1);
  }

  const match = text.match(/COURSE TITLE[\s\S]+?REMARKS\s*:/);
  if (!match) {
    console.error("❌ Could not extract course section.");
    process.exit(1);
  }

  const marksText = match[0];
  const tokens = marksText
    .trim()
    .split(/\s+/)
    .map((t) => t.trim());

  const result = {};
  let i = 0;

  const gradeRegex = /^(A\+\+|A\+|A|B\+|B|C\+|C|D\+|D|E\+|E|F)$/i;
  const courseCodeRegex = /^[A-Z0-9]{2,}-?[A-Z0-9]{2,}$/;

  const headerWords = new Set([
    "COURSE",
    "TITLE",
    "COURSE TITLE",
    "COURSE CODE",
    "MARKS1(MIDTERM)",
    "MARKS2(ENDTERM)",
    "GRADE"
  ]);

  // Skip header tokens at the start
  while (i < tokens.length && !courseCodeRegex.test(tokens[i])) {
    i++;
  }

  while (i < tokens.length) {
    const token = tokens[i];

    if (courseCodeRegex.test(token)) {
      let j = i - 1;
      const subjectWords = [];

      // Collect subject words by walking backwards until boundary
      while (
        j >= 0 &&
        !/^\d+$/.test(tokens[j]) &&
        !gradeRegex.test(tokens[j]) &&
        tokens[j] !== "*" &&
        !courseCodeRegex.test(tokens[j]) &&
        !headerWords.has(tokens[j].toUpperCase())
      ) {
        subjectWords.unshift(tokens[j]);
        j--;
      }

      const subjectName = subjectWords.join(" ").trim();

      const mid = tokens[i + 1]?.trim();
      const end = tokens[i + 2]?.trim();
      const star = tokens[i + 3]?.trim();
      const grade = tokens[i + 4]?.trim();

      let finalGrade = null;

      if (/^\d+$/.test(mid) && /^\d+$/.test(end) && gradeRegex.test(star)) {
        // mid end grade
        finalGrade = star.toUpperCase();
        i += 4;
      } else if (/^\d+$/.test(mid) && /^\d+$/.test(end) && star === "*" && gradeRegex.test(grade)) {
        // mid end * grade
        finalGrade = grade.toUpperCase();
        i += 5;
      } else if (/^\d+$/.test(mid) && gradeRegex.test(end)) {
        // mid grade
        finalGrade = end.toUpperCase();
        i += 3;
      } else if (/^\d+$/.test(mid) && gradeRegex.test(end)) {
        // mid grade again
        finalGrade = end.toUpperCase();
        i += 3;
      } else if (/^\d+$/.test(mid) && gradeRegex.test(end)) {
        // handles single marks + grade (like Sports I line)
        finalGrade = end.toUpperCase();
        i += 3;
      } else {
        i++;
        continue;
      }

      if (subjectName.length > 0 && !headerWords.has(subjectName.toUpperCase())) {
        result[subjectName] = finalGrade;
      }
    } else {
      i++;
    }
  }

  console.log("✅ Extracted Grades:\n", JSON.stringify(result, null, 2));

  const finalsg = sgpaCalc(result);
  return finalsg;
};
