"use client";
import { useState } from "react";
import axios from "axios";

const AddMovie = () => {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = async (e :any) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/movies", { title, year });
      console.log(response.data);
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Year</label>
        <input
          type="text"
          className="form-control"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Add Movie
      </button>
    </form>
  );
};

export default AddMovie;
