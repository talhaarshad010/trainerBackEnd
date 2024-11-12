const mongoose = require("mongoose");

main().then(() => {
  console.log("Connected to database");
});
main().catch((error) => {
  console.log("Not Connected to database ", error);
});

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}
