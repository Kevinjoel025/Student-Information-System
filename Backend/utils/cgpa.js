/**
 * Credit-weighted CGPA from marks (0–100) and course credits.
 * Grade points: M≥90→10, 80–89→9, 70–79→8, 60–69→7, 50–59→6, 40–49→5, M<40→0
 */

function marksToGradePoint(marks) {
  const m = Number(marks);
  if (Number.isNaN(m)) return 0;
  if (m >= 90) return 10;
  if (m >= 80) return 9;
  if (m >= 70) return 8;
  if (m >= 60) return 7;
  if (m >= 50) return 6;
  if (m >= 40) return 5;
  return 0;
}

function creditPoints(credits, gradePoint) {
  const c = Number(credits) || 0;
  const gp = Number(gradePoint) || 0;
  return Number((c * gp).toFixed(2));
}

/**
 * @param {Array<{ marks: number, course?: { credits?: number } }>} rows
 * @returns {{ tcp: number, tc: number, cgpa: number | null }}
 */
function computeCgpaSummary(rows) {
  let tcp = 0;
  let tc = 0;
  for (const row of rows) {
    const credits = row.course?.credits ?? 0;
    const gp = marksToGradePoint(row.marks);
    tcp += credits * gp;
    tc += credits;
  }
  if (tc <= 0) return { tcp: 0, tc: 0, cgpa: null };
  const cgpa = Math.round((tcp / tc) * 100) / 100;
  return {
    tcp: Math.round(tcp * 100) / 100,
    tc,
    cgpa,
  };
}

/** Letter grade from absolute marks (display). */
function marksToLetterGrade(marks) {
  const m = Number(marks);
  if (Number.isNaN(m)) return '—';
  if (m >= 90) return 'O';
  if (m >= 80) return 'A+';
  if (m >= 70) return 'A';
  if (m >= 60) return 'B+';
  if (m >= 50) return 'B';
  if (m >= 45) return 'C';
  if (m >= 40) return 'P';
  return 'F';
}

/** Overall grade from CGPA on 10-point scale. */
function cgpaToOverallGrade(cgpa) {
  if (cgpa == null || Number.isNaN(Number(cgpa))) return '—';
  const g = Number(cgpa);
  if (g >= 9.0) return 'O';
  if (g >= 8.0) return 'A+';
  if (g >= 7.0) return 'A';
  if (g >= 6.0) return 'B+';
  if (g >= 5.0) return 'B';
  if (g >= 4.0) return 'C';
  return 'RA';
}

function enrichMarkRow(doc) {
  const credits = doc.course?.credits ?? 0;
  const gradePoint = marksToGradePoint(doc.marks);
  const cp = creditPoints(credits, gradePoint);
  const letterGrade = marksToLetterGrade(doc.marks);
  return {
    ...doc,
    gradePoint,
    creditPoints: cp,
    letterGrade,
  };
}

module.exports = {
  marksToGradePoint,
  creditPoints,
  computeCgpaSummary,
  enrichMarkRow,
  marksToLetterGrade,
  cgpaToOverallGrade,
};
