import { Hono } from 'hono'
const userRoutes = new Hono()

userRoutes.get('/')
userRoutes.post('/')


export default userRoutes