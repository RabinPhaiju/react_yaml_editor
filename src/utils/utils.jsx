const planets = ["Sun","Moon","Jupiter", "Mercury", "Mars", "Venus", "Saturn", "Rahu",'Ketu'];

const getTimeLineRegex = /\b\d{1,2} \b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?) \b\d{4} \b(to|and)\b \b\d{1,2} \b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?) \b\d{4}\b/g;

const certainMonths = /\b(one|two|three|four|five|six|seven|eight|nine) months?\b/g;

function createPlanetsRegex(planets) {
    const planetPattern = planets.map(planet => planet).join('|');
    const separatorPattern = `(?:,\\s*|\\s+and\\s+|\\s+)+`;
    const regexPattern = `\\b(${planetPattern})${separatorPattern}(${planetPattern})?${separatorPattern}(${planetPattern})\\b`;
    return new RegExp(regexPattern, 'g');
  }

  export {planets,createPlanetsRegex,getTimeLineRegex,certainMonths}