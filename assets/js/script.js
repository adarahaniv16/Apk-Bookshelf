const bookshelf = [];
const RENDER_EVENT = "render-bookshelf";
const SAVED_EVENT = "saved-bookshelf";
const STORAGE_KEY = "Bookshelf_Apps";




//fungsi untuk menambahkan nilai bookshelf
function addBookshelf() {
    const textTitle = document.getElementById("inputBookTitle").value;
    const textAuthor = document.getElementById("inputBookAuthor").value;
    const numberYear = document.getElementById("inputBookYear").value;
    const generatedID = generateId();
    const isCompleted = document.getElementById("inputBookIsComplete").checked;
    const bookshelfObject = generatebookshelfObject(generatedID, textTitle, textAuthor, numberYear, isCompleted);
    bookshelf.push(bookshelfObject);
    alert("Buku berhasil ditambahkan ke daftar");
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


//fungsi untuk untuk menghasilkan identitas unik pada setiap item bookshelf
function generateId() {
    return +new Date();
}

// fungsi untuk membuat sebuah object di JavaScript dari data yang sudah disediakan dari inputan
function generatebookshelfObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

//fungsi untuk membuat bookshelf
function makeBookshelf(bookshelfObject) {
    const textTitle = document.createElement("h3");
    textTitle.innerText = bookshelfObject.title;
    const textAuthor = document.createElement("p");
    textAuthor.innerText = "Penulis : " + bookshelfObject.author;
    const textYear = document.createElement("p");
    textYear.innerText = "Tahun Terbit : " + bookshelfObject.year;
    const bookItem = document.createElement("article");
    bookItem.classList.add("book_item")
    bookItem.append(textTitle, textAuthor, textYear);
    bookItem.setAttribute("id", 'bookshelf-${bookshelfObject.id}');

    if (bookshelfObject.isCompleted) {
        const undoButton = document.createElement("button");
        undoButton.classList.add("green");
        undoButton.innerText = "Belum selesai dibaca";
        undoButton.addEventListener("click", function () {
            undoTaskFromCompleted(bookshelfObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.innerText = "Hapus Buku";
        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(bookshelfObject.id);
        });

        const action = document.createElement("div");
        action.classList.add("action");
        action.append(undoButton, trashButton);
        bookItem.append(action);
    } else {

        const checkButton = document.createElement("button");
        checkButton.classList.add("green");
        checkButton.innerText = "Sudah selesai dibaca";
        checkButton.addEventListener("click", function () {
            addTaskToCompleted(bookshelfObject.id);
        });
        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.innerText = "Hapus Buku"
        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(bookshelfObject.id);
        });
        const action = document.createElement("div");
        action.classList.add("action");
        action.append(checkButton, trashButton);
        bookItem.append(action);
    }

    return bookItem;
}

//fungsi untuk menambahkan buku sudah selesai dibaca
function addTaskToCompleted(bookId) {
    const bookshelfTarget = findBook(bookId);
    if (bookshelfTarget == null) return;
    bookshelfTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    alert("Apakah yakin anda sudah selesai membaca buku ini?");
    saveData();

}


//fungsi menghapus buku dari daftar sudah selesai dibaca
function removeTaskFromCompleted(bookId) {
    const bookshelfTarget = findBookIndex(bookId);
    if (bookshelfTarget === -1) return;
    bookshelf.splice(bookshelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(bookId) {
    const bookshelfTarget = findBook(bookId);
    if (bookshelfTarget == null) return;
    bookshelfTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (bookshelfItem of bookshelf) {
        if (bookshelfItem.id === bookId) {
            return bookshelfItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (index in bookshelf) {
        if (bookshelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

document.addEventListener(SAVED_EVENT, () => {
    console.log("Data berhasil di simpan.");
    
});

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");
    const checkButton = document.getElementById("inputBookIsComplete");
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBookshelf();
    });

    checkButton.addEventListener("change", function (event) {
        event.preventDefault();
        if (event.target.checked) {
            document.querySelector("#bookSubmit > span").textContent = "Selesai dibaca";
        } else {
            document.querySelector("#bookSubmit > span").textContent = "Belum selesai dibaca";
        }
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById("incompleteBookshelfList");
    uncompletedBookList.innerHTML = "";
    const completedBookList = document.getElementById("completeBookshelfList");
    completedBookList.innerHTML = "";
    for (bookshelfItem of bookshelf) {
        const bookshelfElement = makeBookshelf(bookshelfItem);
        if (bookshelfItem.isCompleted == false) {
            uncompletedBookList.append(bookshelfElement);
        } else {
            completedBookList.append(bookshelfElement);
        }
    }
});


//fungsi untuk mengecek apakah browser mendukung local storage
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false
    }
    return true;
}

//fungsi untuk menyimpan data pada storage
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

//fungsi untuk load data dari storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (book of data) {
            bookshelf.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}


// //fitur pencarian
function search() {
    const searchButton = document.getElementById('searchSubmit');
    searchButton.addEventListener('click', function (e) {
        const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();
        const title = document.querySelectorAll('#searchResult').toLowerCase();
        for (bookshelfItem of title) {
            const title = bookshelfItem.childNodes[0].innerText;

            if (title.includes(searchBookTitle)) {
                bookshelfItem.style.display = 'block';
            } else {
                bookshelfItem.style.display = 'hidden';
            }
        }
    });
}

