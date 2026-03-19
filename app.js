var express = require("express");
var rutasRouter = require("./routes/rutas");

var app = express();
app.use(express.json());

app.use("/api/rutas", rutasRouter);

app.get("/", function(req, res) {
  res.json({ mensaje: "Moto Logbook API funcionando" });
});

app.listen(3000, function() {
  console.log("Servidor corriendo en http://localhost:3000");
});