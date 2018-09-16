const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const MongoClient = require('mongodb').MongoClient;

let db;

app.get('/', (req, res) => res.send('Hello World!'))

// This function gets an Array of non-lexical words from mongodb and returns
async function getNonLexicalWords() {
  let dbCall = await db.db('nonlex').collection('inventory').find({}, { projection: { _id: 0, item:1}});
  let list = await new Promise((resolve, reject) => {
    dbCall.toArray(function(err, result) {
      if(err) reject(err);
      resolve(result);
    })
  })
  let nonLexicalList = []
  for (let i in list){
     nonLexicalList.push(list[i].item)
  }
    return nonLexicalList;
  //  db.close();
  return nonLexicalList };

// computing the overall lexical density as well as the
function computeLD(bodyText, nonLexicalWords) {
  let sentenceLDs = [];
  let overallLexicalWords = 0;
  let overallNonLexicalWords = 0;

  for (let sentence of bodyText.split('.')) {
    let sentenceLexicalWords = 0;
    let sentenceNonLexicalWords = 0;
    for (let word of sentence.split(' ').filter(x => x)) {
      if (nonLexicalWords.includes(word)) {
        overallNonLexicalWords++;
        sentenceNonLexicalWords++;
      } else {
        overallLexicalWords++;
        sentenceLexicalWords++;
      }
    }
    if (sentenceLexicalWords >0 || sentenceNonLexicalWords > 0) {
      sentenceLDs.push((sentenceLexicalWords / (sentenceNonLexicalWords + sentenceLexicalWords)).toFixed(2))
    }
  }

  return {
    'overall_ld': (overallLexicalWords / (overallNonLexicalWords + overallLexicalWords)).toFixed(2),
    'sentence_ld': sentenceLDs,
  };
}

// We always want to use the text body type
app.use(bodyParser.text({type: () => true}));

app.post('/complexity', async (req, res) => {
  if (req.body.split(" ").filter(x => x).length > 100) { throw new Error("Over the Word Limit") }
  if (req.body.length > 1000) {throw new Error("Over the character Limit")}
  let nlw = await getNonLexicalWords();
  let overallLD = computeLD(req.body, nlw);
  let response ={
    data: {
      'overall_ld': overallLD['overall_ld']
    }
  };
  if (req.query.mode === 'verbose') {
    response.data['sentence_ld'] = overallLD['sentence_ld'];
  }
  res.send(JSON.stringify(response, null, 2));
})

async function start(port) {
  db = await new Promise((resolve, reject) => {
    MongoClient.connect('mongodb://localhost:27017/nonlex', function (err, client) {
      if (err) {
        return reject(err);
      }
      return resolve(client);
    });
  });
  app.listen(port, () => console.log('listening on ' + port))
}

//if (!module.parent) {
start(process.env.PORT || 3000).catch(console.error);
//}

module.exports = {
  computeLD,
  app,
  getNonLexicalWords,
};
