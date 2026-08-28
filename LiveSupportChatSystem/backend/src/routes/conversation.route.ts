import { Router } from 'express';
import {
    createConversationController,
    getConversationController,
    assignConversationController,
    closeConversationController
} from '../controllers/conversation.controller';

const router: Router = Router();


// POST /conversations
router.post("/", createConversationController);

// GET /conversations/:id
router.get("/:id", getConversationController);

// POST /conversations/:id/assign
router.post("/:id/assign", assignConversationController);

// POST /conversations/:id/close
router.post("/:id/close", closeConversationController);

export { router as ConversationRouter };
