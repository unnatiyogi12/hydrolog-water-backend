import { Router } from 'express'
import * as authRController from '../controllers/auth.controller.js'

const authRouter = Router()
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', authRController.register)

authRouter.get("/get-me",authRController.getMe)

authRouter.get("/refresh-token",authRController.refreshToken)

authRouter.get("/logout",authRController.logout)

authRouter.post("/login", authRController.login)

authRouter.put("/update-profile", authRController.updateProfile);

authRouter.post("/google", authRController.googleLogin);


export default authRouter