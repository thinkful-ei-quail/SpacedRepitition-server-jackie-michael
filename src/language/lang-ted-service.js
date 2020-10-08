'use strict';
const LinkedList = require('../LinkedList');
const sll = new LinkedList();

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id });
  },

  getWord(db, id) {
    return db
      .from('word')
      .first(
        'id',
        'original',
        'correct_count',
        'incorrect_count',
        'translation',
        'memory_value',
        'next',
        'language_id',
      )
      .where({ id });
  },

  updateHead(db, language_id, head) {
    return db
      .from('language')
      .where('id', language_id)
      .update({ head });
  },

  getHead(db, language_id) {
    return db
      .from('language')
      .first('head')
      .where('id', language_id)
      .then(res => res.head);
  },

  async correctAnswer(db, word) {
    let { memory_value: memVal, id, correct_count: count} = word;
    
    memVal = memVal * 2;
    count++;

    await db
      .from('word')
      .where({ id })
      .update({
        'memory_value': memVal,
        'correct_count': count,
      });
    
    return memVal;
  },

  incrementTotal(db, language_id) {
    return db
      .from('language')
      .where('id', language_id)
      .increment('total_score', 1);
  },

  async incorrectAnswer(db, id) {
    await db
      .from('word')
      .where({ id })
      .increment('incorrect_count', 1);
      
    await db
      .from('word')
      .where({ id })
      .update('memory_value', 1);

    return;
  },

  getTotalScore(db, language_id) {
    return db
      .from('language')
      .first(
        'total_score',
      )
      .where('id', language_id)
      .then(res => res.total_score);
  },

  createLinkedList(words) {
    sll.head = null;

    for (let i = 0; i < words.length; i++) {
      sll.insertLast({
        original: words[i].original,
        id: words[i].id,
      });
    }

    sll.display();
  },

  updateLinkedList(word, memVal) {
    const insertWord = {
      original: word.original,
      id: word.id
    };

    sll.remove(insertWord);

    if (memVal >= sll.size()) {
      sll.insertLast(insertWord);
    } else {
      sll.insertAt(
        insertWord, 
        memVal
      );
    }
    
    return;
  },

  updateNext(db, original, next) {
    return db
      .from('word')
      .where({ original })
      .update({ next });
  },

  async updateDB(db) {
    let currentNode = sll.head;

    while (currentNode !== null) {
      let word = currentNode.value.original;
      let next = currentNode.next ? currentNode.next.value.id : null;

      await this.updateNext(db, word, next);

      currentNode = currentNode.next;
    }
  }
};

module.exports = LanguageService;
