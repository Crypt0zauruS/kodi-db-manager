const crypto = require("crypto");

const generateKey = () => {
  // Génère une clé aléatoire de 32 octets (256 bits)
  const key = crypto.randomBytes(32);
  console.log("Generated Key:", key.toString("hex")); // Affiche la clé en format hexadécimal pour un stockage facile
};

generateKey();
