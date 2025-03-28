// Using ES6 import for some libraries and CommonJS require for others
import axios from "axios";
import lodash from "lodash";
import moment from "moment";
import chalk from "chalk";
const express = require("express");

console.log(chalk.green("Testing auto-install-deps"));

// Make an HTTP request using axios
axios.get("https://jsonplaceholder.typicode.com/todos/1")
  .then(response => {
    console.log("Data received at", moment().format("YYYY-MM-DD HH:mm:ss"));
    // Use lodash to pick specific properties
    console.log("Data:", lodash.pick(response.data, ["id", "title"]));
  })
  .catch(error => console.error("Error fetching data:", error));

// Create a basic Express server
const app = express();
app.get("/", (req, res) => res.send("Hello, auto-install!"));
app.listen(3000, () => console.log(chalk.blue("Server running on port 3000")));
