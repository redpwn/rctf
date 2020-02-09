const app = require(__dirname + "/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
