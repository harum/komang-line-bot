const answers = require('./answers');

const contains = (message, keys) => {
  return keys
    .map(key => key.toLowerCase())
    .reduce((result, current) => {
      return result || message.indexOf(current) >= 0
    }, false)
}

module.exports.replay = message => {
  lowerMessage = message.toLowerCase();
  if (!lowerMessage.match(/^mang/)) {
    return null;
  }

  let replayTexts = [];
  if (contains(message, ['apa', 'apakah', 'akankah', 'bisakah'])) {
    replayTexts = answers.question.what;
  } else if (contains(message, ['kapan', 'kapankah'])) {
    replayTexts = answers.question.when;
  } else {
    replayTexts = answers.other;
  }
  return replayTexts[Math.floor(Math.random() * replayTexts.length)];
}
