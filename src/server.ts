import app from "./app";
import { PORT } from "./configs/general";

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
