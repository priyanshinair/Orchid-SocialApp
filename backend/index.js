import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/Auth.js'
import { register } from './controllers/Auth.js'
import userRoutes from './routes/Users.js'
import postRoutes from './routes/Posts.js'
import {createPost} from './controllers/Posts.js'
import { verifyToken } from './middleware/Auth.js'
import User from './models/User.js'
import Post from './models/Post.js'
import {users, posts} from './data/index.js'

//configurations

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)
dotenv.config()
const app = express()

app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))   //Cross-Origin Resource Policy (CORP) is an additional security measure to prevent the loading of resources from unauthorized origins, thereby mitigating certain types of cross-site attacks.
app.use(bodyParser.json({ limit: "30mb", extended: true }))             //The limit option is set to "30mb", which means that the JSON body parser will only accept JSON payloads up to 30 megabytes in size.
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))       //middleware to parse incoming URL-encoded data from the request body.
app.use(cors())                                                         //CORS is a mechanism that allows servers to specify who can access their resources
app.use("/assets", express.static(path.join(_dirname, 'public/assets')))

//file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage })


//routes with files
app.post("/auth/register", upload.single("picture"), register)
app.post("/posts", verifyToken, upload.single("picture"), createPost)

//routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postRoutes);

//setting up mongosse
const PORT = process.env.PORT || 6001
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`))

    //add data one time
    //User.insertMany(users)
    //Post.insertMany(posts)
}).catch((error) => console.log(`${error} did not connect`))