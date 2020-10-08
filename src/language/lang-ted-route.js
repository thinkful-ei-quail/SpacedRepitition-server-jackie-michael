'use strict';

const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();

const languageRouter = express.Router();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      );

      if (!language)
        return res.status(404).json({
          error: 'You don\'t have any languages',
        });

      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );

      await LanguageService.createLinkedList(
        words
      );

      res.json({
        language: req.language,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const head = await LanguageService.getHead(
        req.app.get('db'),
        req.language.id
      );
      
      const word = await LanguageService.getWord(
        req.app.get('db'),
        head
      );
      
      res.json({
        nextWord: word.original,
        totalScore: req.language.total_score,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count,
      });
      req.word = word;
      next();
    } catch (error) {
      next(error);
    }
    
  });

languageRouter
  .route('/guess')
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    try {
      const { guess } = req.body;
      const { id: lang_id, head } = req.language;
      let result, memVal;

      if (!guess) {
        return res.status(400).json({
          error: `Missing 'guess' in request body`
        })
      }
      //get db values for the current word
      const currentWord = await LanguageService.getWord(
        req.app.get('db'),
        head,
        );
      //compare guess to translation
      if (guess === currentWord.translation) {
        //set result to true, increment total score, call correct answer, store new memVal
        result = true;
        await LanguageService.incrementTotal(
          req.app.get('db'),
          lang_id
        );
        memVal = await LanguageService.correctAnswer(
          req.app.get('db'),
          currentWord);
      } else {
        //set result to false, call incorrect answer, set memVal to 1
        result = false;
        await LanguageService.incorrectAnswer(
          req.app.get('db'),
          currentWord.id);
        memVal = 1;
      }
      //update head in database
      await LanguageService.updateHead(
        req.app.get('db'),
        lang_id,
        currentWord.next
      );
      //get updated total score
      const score = await LanguageService.getTotalScore(
        req.app.get('db'),
        lang_id
      );
      //get db values for next word
      const nextWord = await LanguageService.getWord(
        req.app.get('db'),
        currentWord.next
      );
      //update linked list
      await LanguageService.updateLinkedList(
        currentWord,
        memVal
      )
      //update database
      await LanguageService.updateDB(
        req.app.get('db')
      )    
      
      res.json({
          nextWord: nextWord.original,
          totalScore: score,
          wordCorrectCount: nextWord.correct_count,
          wordIncorrectCount: nextWord.incorrect_count,
          answer: currentWord.translation,
          isCorrect: result,
      });

      next();
    } catch (error) {
      next(error);
    }
  });

module.exports = languageRouter;