import fs from "fs"
import { parsePdf } from 'afpp';
import { sgpaCalc } from "./SGPAcalc.js";

export async function parsePDFtoJSON(filePath) {
  const buffer = fs.readFileSync(filePath);

  const data = await parsePdf(buffer, {}, (content) => content);

  // Get text content
  const text = data[0]
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
  const tokens = marksText.trim().split(/\s+/);

  const result = {};
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // Normal subject pattern: subject → code → mid → end → grade
    if (/^[A-Z0-9\-]{5,}$/.test(token)) {
      const courseCode = token;
      const mid = tokens[i + 1];
      const end = tokens[i + 2];
      const grade = tokens[i + 3];

      const isFullPattern =
        /^\d+$/.test(mid) &&
        /^\d+$/.test(end) &&
        /^[A-F][+]*$/.test(grade);

      const isShortPattern =
        /^\d+$/.test(mid) &&
        /^[A-F][+]*$/.test(end); // here, `end` is grade, and `mid` is only mark

      if (isFullPattern || isShortPattern) {
        let j = i - 1;
        const subjectWords = [];

        while (
          j >= 0 &&
          !/^\d+$/.test(tokens[j]) &&
          !/^[A-Z0-9\-]{5,}$/.test(tokens[j]) &&
          !/^[A-F][+]*$/.test(tokens[j])
        ) {
          subjectWords.unshift(tokens[j]);
          j--;
        }

        const subjectName = subjectWords.join(" ").trim();
        const finalGrade = isFullPattern ? grade : end;

        result[subjectName] = finalGrade;

        i += isFullPattern ? 4 : 3;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }


  // console.log("✅ Extracted Grades:\n", JSON.stringify(result, null, 2));
  
  const finalsg = sgpaCalc(result);
  return finalsg;


}


