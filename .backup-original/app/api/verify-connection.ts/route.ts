import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";
import crypto from "crypto";

const secretKey = process.env.SECRET_KEY!;

const decrypt = (encryptedText: string) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    secretKey,
    Buffer.alloc(16, 0)
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { host, user, password: encryptedPassword } = req.body;
    const password = decrypt(encryptedPassword);

    try {
      const connection = await mysql.createConnection({ host, user, password });
      await connection.end();
      res.status(200).json({ message: "Connection successful" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Connection failed", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};
