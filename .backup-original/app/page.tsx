import MoviesList from "./components/MoviesList";
// import AddMovie from "./components/AddMovie";

const Home = () => {
  return (
    <main className="main">
      <header className="header">
        <h1 className="title">Kodi DataBase Manager</h1>
      </header>
      <MoviesList />
    </main>
  );
};

export default Home;
