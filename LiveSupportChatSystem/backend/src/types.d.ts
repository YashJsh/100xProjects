import { AuthPayload } from "./types/auth.types"

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}
