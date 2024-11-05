
import express from 'express';
const app = express();
import apiRouter from './router/api.js';
const port = process.env.PORT || 3000;
import bodyParser from "body-parser";


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

app.use('/api', apiRouter);

