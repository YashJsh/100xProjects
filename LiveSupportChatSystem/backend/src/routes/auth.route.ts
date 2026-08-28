import {Router} from 'express';
import { signInController, signUpController } from '../controllers/auth.controller';

const router: Router = Router()

router.post("/signup", signUpController)
router.post("/signin", signInController)

export {router as AuthRouter}