function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * B.Tech–style mark distribution (theory vs lab/workshop).
 * @param {{ courseCode?: string, courseTitle?: string }} course
 */
function generateBTechMark(course) {
  const code = course.courseCode || '';
  const title = (course.courseTitle || '').toLowerCase();
  const isLab =
    code.charAt(4) === '2' ||
    title.includes('laboratory') ||
    title.includes('workshop') ||
    title.includes('drawing');

  const rand = Math.random();
  if (isLab) {
    if (rand < 0.03) return randomInt(38, 49);
    if (rand < 0.12) return randomInt(50, 64);
    if (rand < 0.55) return randomInt(65, 79);
    if (rand < 0.88) return randomInt(80, 89);
    return randomInt(90, 98);
  }
  if (rand < 0.06) return randomInt(32, 49);
  if (rand < 0.28) return randomInt(50, 69);
  if (rand < 0.68) return randomInt(70, 84);
  if (rand < 0.92) return randomInt(85, 92);
  return randomInt(93, 99);
}

module.exports = { generateBTechMark, randomInt };
