
import Router from "koa-router";
import loginController from '../controllers/login'
const router = new Router()

router.get("/login", loginController.loginAction);

export default router;