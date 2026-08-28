import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(authMiddleware);

// GET /admin/analytics
router.get("/analytics", async (req, res)=>{
    try{
        
    }catch(error){
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

export { router as AdminRouter };
