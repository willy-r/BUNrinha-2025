import { Elysia } from "elysia";
import routes from "../../internal/api/routes";

const app = new Elysia();

routes(app);

app.listen(9999);
console.log("🚀 Server is running at http://localhost:9999");
