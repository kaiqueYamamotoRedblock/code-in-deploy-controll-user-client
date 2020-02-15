// Server
const express = require("express");
const path = require("path");

// DB
const sqlite3 = require("sqlite3").verbose();
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

const sql_create = `CREATE TABLE IF NOT EXISTS Books (
  Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  Comments TEXT
);`;

// Clients
const db_name_client = path.join(__dirname, "data", "clients.db");
const db_client = new sqlite3.Database(db_name_client, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'client.db'");
});

const sql_createClient = `CREATE TABLE IF NOT EXISTS Clients (
  Client_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  FirtName VARCHAR(100) NOT NULL,
  ServiceName VARCHAR(100) NOT NULL,
  PriceService DECIMAL(16,2) DEFAULT '0.00' NOT NULL
);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Books' table");

  // Database seeding
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
  (1, 'Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
  (2, 'Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
  (3, 'L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne');`;

  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 books");
  });
});

// Clients Create Table
db.run(sql_createClient, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Clients' table");

  // Database seeding
  const sql_insert = `INSERT INTO Clients (Client_ID, FirtName, ServiceName, PriceService) VALUES
  (1, 'Mrs. Bridge', 'Dev Web', 150.00),
  (2, 'Mr. Bridge', 'Dev Web', 2800.00),
  (3, 'libertine', 'MK Digital', 785.00);`;

  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 Clients");
  });
});

// Basic Server
const app = express();

// Settings EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/data", (req, res) => {
  const test = {
    title: "Test",
    items: ["one", "two", "three"]
  };
  res.render("data", { model: test });
});

app.get("/books", (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("books", { model: rows });
  });
});

app.get("/clients", (req, res) => {
  const sql = "SELECT * FROM Clients ORDER BY FirtName";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("clients", { model: rows });
  });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("edit", { model: row });
  });
});

app.get("/clients/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Clients WHERE Client_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.log(err.message);
    } else {
      res.render("editClient", { model: row });
    }
  });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Author, req.body.Comments, id];
  const sql =
    "UPDATE Books SET Title = ?, Author = ?, Comments = ? WHERE (Book_ID = ?)";
  db.run(sql, book, err => {
    // if (err) ...
    res.redirect("/books");
  });
});

app.post("/clients/edit/:id", (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Author, req.body.Comments, id];
  const sql =
    "UPDATE Clients SET FirtName = ?, ServiceName = ?, PriceService = ? WHERE (Client_ID = ?)";
  db.run(sql, book, err => {
    if (err) {
      return console.log(err.message);
    } else {
      res.redirect("/clients");
    }
  });
});

// GET /create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});
app.get("/clients/create", (req, res) => {
  res.redirect("createCliente", { model: {} });
});

app.get("/create", (req, res) => {
  const book = {
    Author: "Victor Hugo"
  };
  res.render("create", { model: book });
});
app.get("/clients/create", (req, res) => {
  const cliente = {
    FirtName: "Kaique Yamamoto "
  };
  res.render("createClient", {model: cliente})
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Books (Title, Author, Comments) VALUES (?, ?, ?)";
  const book = [req.body.Title, req.body.Author, req.body.Comments];
  db.run(sql, book, err => {
    // if (err) ...
    res.redirect("/books");
  });
});
app.post("/clients/create", (req, res) => {
  const sql = "INSERT INTO Clients (FirtName, ServiceName, PriceService) VALUES (?, ?, ?)";
  const book = [req.body.Title, req.body.Author, req.body.Comments];
  db.run(sql, book, err => {
    if (err) {
      return console.log(err.message)
    } else {
      res.redirect("/clients")
    }
  });
})

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("delete", { model: row });
  });
});
app.get("/clients/delete/:id", (req, res) => {

  const id = req.params.id
  const sql = "SELECT * FROM Clients WHERE Client_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.log(err.message)
    } else {
      res.render("deleteCliente", {model: row})
    }
  })

})

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Books WHERE Book_ID = ?";
  db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/books");
  });
});
app.post("/clients/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Clients WHERE Client_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.log(err.message)
    } else {
      res.redirect("/clients")
    }
  })
})

// Port Server
app.listen(3000, () => {
  console.log("Basic Server UP");
});
