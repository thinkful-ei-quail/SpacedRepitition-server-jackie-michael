const LinkedList = require("../LinkedList/LinkedList");

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  getNextWord(db, id) {
    return db
      .from("word")
      .select(
        "id",
        "next",
        "original",
        "translation",
        "correct_count",
        "incorrect_count"
      )
      .where({ id })
      .first();
  },
  wordList(db, language, words) {
    let wordList = new LinkedList();
    wordList.id = language.id;
    wordList.name = language.name;
    wordList.total_score = language.total_score;
    let word = words.find((w) => w.id === language.head);
    wordList.insertFirst({
      id: word.id,
      original: word.original,
      translation: word.translation,
      memory_value: word.memory_value,
      correct_count: word.correct_count,
      incorrect_count: word.incorrect_count,
    });
    while (word.next) {
      word = words.find((w) => w.id === word.next);
      wordList.insertLast({
        id: word.id,
        original: word.original,
        translation: word.translation,
        memory_value: word.memory_value,
        correct_count: word.correct_count,
        incorrect_count: word.incorrect_count,
      });
    }
    return wordList;
  },
  // saveWord(db, wordList) {
  //   return db.transaction(trx => {
  //     let node = wordList.head
  //     let promises = []
  //     while(node !== null) {
  //       db('word')
  //       .transacting(trx)
  //       .where('id', node.value.id)
  //       .update({
  //         memory_value: node.value.memory_value,
  //         correct_count: node.value.correct_count,
  //         incorrect_count: node.value.incorrect_count,
  //         next: node.next ? node.next.value.id : null,
  //       })
  //       node = node.next
  //     }
  //       console.log(promises)
  //       db('language')
  //         .transacting(trx)
  //         .where('id', wordList.id)
  //         .update({
  //           total_score: wordList.total_score,
  //           head: wordList.head.value.id,
  //         })
  //     })
  // }
  async saveWord(db, wordList) {
    let trx = await db.transaction();
    try {
      while (node !== null) {
        await db("word")
          .transacting(trx)
          .where("id", node.value.id)
          .update({
            memory_value: node.value.memory_value,
            correct_count: node.value.correct_count,
            incorrect_count: node.value.incorrect_count,
            next: node.next ? node.next.value.id : null,
          });
        node = node.next;
      }
      await db("language").transacting(trx).where("id", wordList.id).update({
        total_score: wordList.total_score,
        head: wordList.head.value.id,
      });
      trx.commit();
    } catch (e) {
      trx.rollback();
    }
  },
};

module.exports = LanguageService;
