const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

// GET request: Fetch all todos with optional filtering
app.get("/todos/", async (req, res) => {
  const { status = "", priority = "", search_q = "" } = req.query;

  let allList = `
    SELECT * FROM todo
    WHERE (status LIKE '%${status}%') 
    AND (priority LIKE '%${priority}%')
    AND (todo LIKE '%${search_q}%');`;

  const finalList = await db.all(allList);
  res.send(finalList);
});

// GET request: Fetch todo by ID
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const selectTodo = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbTodo = await db.get(selectTodo);
  res.send(dbTodo);
});

// POST request: Add a new todo
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const createTodo = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(createTodo);
  res.send("Todo Successfully Added");
});

// PUT request: Update an existing todo
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { todo, priority, status } = req.body;

  let updateTodo = "";
  if (status !== undefined) {
    updateTodo = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
    await db.run(updateTodo);
    res.send("Status Updated");
  } else if (priority !== undefined) {
    updateTodo = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
    await db.run(updateTodo);
    res.send("Priority Updated");
  } else if (todo !== undefined) {
    updateTodo = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    await db.run(updateTodo);
    res.send("Todo Updated");
  }
});

// DELETE request: Delete a todo by ID
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  res.send("Todo Deleted");
});

module.exports = app;
