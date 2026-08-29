import { Router } from 'express';
import {
    createConversationController,
    getConversationController,
    getAllConversationController,
    assignConversationController,
    closeConversationController
} from '../controllers/conversation.controller';

const router: Router = Router();

// POST /conversations
router.post("/", createConversationController);

// GET /conversations
router.get("/", getAllConversationController);

// GET /conversations/:id
router.get("/:id", getConversationController);

// POST /conversations/:id/assign
router.post("/:id/assign", assignConversationController);

// POST /conversations/:id/close
router.post("/:id/close", closeConversationController);

export { router as ConversationRouter };
