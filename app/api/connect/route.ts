import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const secretKey = process.env.SECRET_KEY || ""; // La clé de cryptage doit être définie dans .env.local

const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    Buffer.alloc(16, 0)
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { host, user, password } = req.body;
    const encryptedPassword = encrypt(password);

    const connectionInfo = { host, user, password: encryptedPassword };
    localStorage.setItem("dbConnection", JSON.stringify(connectionInfo));

    res.status(200).json({ message: "Connection information saved" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};
