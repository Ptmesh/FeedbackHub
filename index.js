import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;
const saltRounds = 11;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "feedbackhub",
  password: "******",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Get Methods
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logIn", (req, res) => {
  res.render("login.ejs");
});

app.get("/reviews", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM whatsay;");
    const feed = result.rows;
    res.render("reviews.ejs", {
      review: feed,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/feedback", (req, res) => {
  res.render("feedback.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

// Post Methods

app.post("/register", async (req, res) => {
  const name = req.body.username;
  const email = req.body.email;
  const pass = req.body.password;

  try {
    const checkResults = await db.query(
      "SELECT * FROM users where email = $1",
      [email]
    );

    if (checkResults.rows.length > 0) {
      res.send("Email Already Exists, Try Logging In!!");
    } else {
      // Hashing
      bcrypt.hash(pass, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          const results = await db.query(
            "INSERT INTO users (username , email , password) VALUES ($1 , $2 , $3)",
            [name, email, hash]
          );
          res.render("home.ejs");
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedpassword = user.password;

      // Unhashing
      bcrypt.compare(password, storedpassword, async (err, result) => {
        if (err) {
          console.log(err);
        } else {
          if (result) {
            res.render("home.ejs");
          } else {
            res.send("Incorrect Password!");
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/feedback", async (req, res) => {
  const name = req.body.username;
  const review = req.body.review;
  try {
    const result = await db.query(
      "INSERT INTO whatsay (username , feedback) VALUES ($1 ,$2)",
      [name, review]
    );
    res.render("home.ejs");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
