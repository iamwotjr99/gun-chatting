const Gun = require('gun');
const express = require('express');

const PORT = 8000;
const app = express();

app.use(Gun.serve);

const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})

Gun({web: server});
