import { Router } from 'express';
import { signInController, signUpController, getMeController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);
router.get("/me", authMiddleware, getMeController);

export { router as AuthRouter };