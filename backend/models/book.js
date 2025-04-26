class Book {
  constructor(id, title, author, year, category, subcategory, available, code) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.year = year;
    this.category = category;
    this.subcategory = subcategory;
    this.available = available;
    this.code = code;
  }
}

module.exports = Book;