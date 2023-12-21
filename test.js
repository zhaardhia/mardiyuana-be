const { nanoid } = require("nanoid");

(async function () {
  try {
    console.log(nanoid(36))
    return 1;
  } catch (error) {
    console.log(error);
  }

  process.exit(0);
})();