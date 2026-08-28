import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { AuthRouter } from "./routes/auth.route"
import { ConversationRouter } from "./routes/conversation.route"
import { authMiddleware } from "./middleware/auth.middleware"
import { AdminRouter } from "./routes/admin.route"

dotenv.config()
const HTTP_PORT = process.env.HTTP_PORT || 3000;

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.use("/auth", AuthRouter)
app.use("/conversations", authMiddleware, ConversationRouter)
app.use("/admin", authMiddleware, AdminRouter)

app.listen(HTTP_PORT, ()=>{
    console.log(`Server is listening on PORT : ${HTTP_PORT}`)
})