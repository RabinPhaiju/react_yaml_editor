const planets = ["Sun","Moon","Jupiter", "Mercury", "Mars", "Venus", "Saturn", "Rahu",'Ketu'];

const monthPattern = '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const getTimeLineRegex1 = new RegExp(`\\b\\d{1,2} ${monthPattern} \\d{4} \\b(to|and)\\b \\d{1,2} ${monthPattern} \\d{4}\\b`, 'g');
const getTimeLineRegex2 = new RegExp(`\\b${monthPattern} \\d{1,2},? \\d{4},? \\b(to|and)\\b ${monthPattern} \\d{1,2},? \\d{4}\\b`, 'g');

const certainMonths = /\b(one|two|three|four|five|six|seven|eight|nine) months?\b/gi;

function createPlanetsRegex() {
    const planetPattern = planets.map(planet => planet).join('|');
    const separatorPattern = `(?:,\\s*|\\s+and\\s+|\\s+)+`;
    const optionalThePattern = `(?:the\\s+)?`;
    // const regexPattern = `\\b(${planetPattern})${separatorPattern}(${planetPattern})?${separatorPattern}(${planetPattern})\\b`;
    const regexPattern = `\\b${optionalThePattern}(${planetPattern})${separatorPattern}${optionalThePattern}(${planetPattern})?${separatorPattern}${optionalThePattern}(${planetPattern})\\b`;
    return new RegExp(regexPattern, 'g');
  }

  export {planets,createPlanetsRegex,getTimeLineRegex1,getTimeLineRegex2,certainMonths}