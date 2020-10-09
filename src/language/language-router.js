const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const bodyParser = express.json();
const languageRouter = express.Router()
const LinkedList = require('../LinkedList/LinkedList')
languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )
      if (!language)
        return res.status(404).json({
          error: 'You don\'t have any languages',
        })
      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })
languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })
languageRouter
  .get('/head', async (req, res, next) => {
    try {
    const [headWord] = await LanguageService.getNextWord(
      req.app.get('db'),
      req.language.head,
      )
      res.json({
        nextWord: headWord.original,
        totalScore: req.language.total_score,
        wordCorrectCount: headWord.correct_count,
        wordIncorrectCount: headWord.incorrect_count
      })
      next()
    } catch (error) {
      next(error)
    }
  })
languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {
    if(!Object.keys(req.body).includes('guess')){
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }
    let db = req.app.get('db');
    try {
      const wordList = new LinkedList();
      let [headNode] = await LanguageService.getNextWord(db, req.language.head);
      wordList.insertFirst(headNode);
      while (headNode.next !== null) {
        const [nextNode] = await LanguageService.getNextWord(db, headNode.next);
        wordList.insertLast(nextNode);
        headNode = nextNode;
      }
      //check user answer
      let isCorrect = false;
      //check for correct answer 
      if (req.body.guess.toLowerCase() == wordList.head.value.translation.toLowerCase()) {
        isCorrect = true;
        ++wordList.head.value.correct_count;
        wordList.head.value.memory_value *= 2;
        ++req.language.total_score;
      } else {
      //check for incorrect answer
        ++wordList.head.value.incorrect_count;
        wordList.head.value.memory_value = 1;
      }
      //change head of list
      //TODO change insert
      let previousHead = wordList.head;
      wordList.remove(wordList.head.value);
      wordList.insertLast(previousHead.value, previousHead.value.memory_value);
      let tempNode = wordList.head;
      let langHead = tempNode.value.id;
      while (tempNode !== null) {
        await LanguageService.updateWords(
          db,
          tempNode.value,
          tempNode.next !== null ? tempNode.next.value : null
        );
        tempNode = tempNode.next;
      }
      await LanguageService.updateHead(
        db,
        req.language.id,
        req.language.user_id,
        langHead
      );
      await LanguageService.updateTotalScore(
        db,
        req.language.id,
        req.language.user_id,
        req.language.total_score
      );
      //set response
      const responseForUser = {
        nextWord: wordList.head.value.original,
        wordCorrectCount: wordList.head.value.correct_count,
        wordIncorrectCount: wordList.head.value.incorrect_count,
        totalScore: req.language.total_score,
        answer: previousHead.value.translation,
        isCorrect: isCorrect
      };
      return res.status(200).json(responseForUser)
    } catch (error) {
      next(error);
    }
  })
module.exports = languageRouter