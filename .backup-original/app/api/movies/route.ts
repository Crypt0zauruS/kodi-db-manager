import { NextResponse } from "next/server";
import db from "../../config/database";
import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    console.log("Attempting to fetch movies...");
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM movie");
    console.log("Fetched movies:", rows);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { message: "Error fetching movies", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, year } = body;
    console.log("Adding movie:", title, year);
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO movie (title, year) VALUES (?, ?)",
      [title, year]
    );
    console.log("Movie added:", result.insertId);
    return NextResponse.json(
      { message: "Movie added", id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding movie:", error);
    return NextResponse.json(
      { message: "Error adding movie", error: error.message },
      { status: 500 }
    );
  }
}
