"use client";
import { useState, useEffect, Key } from "react";
import axios from "axios";
import { Modal, Button, Carousel, Spinner, Form } from "react-bootstrap";

const MoviesList = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hide, setHide] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true); // Début du chargement
      const response = await axios.get("/api/movies");
      setMovies(response.data);
      setIsLoading(false); // Fin du chargement
    };
    fetchMovies();
  }, []);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const handleCloseMovieModal = () => {
    setShowMovieModal(false);
    setSelectedMovie(null);
  };

  const handleImageClick = (images: any[], index: number) => {
    setCarouselImages(images);
    setCarouselIndex(index);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setCarouselImages([]);
    setCarouselIndex(0);
  };

  const handleSelect = (selectedIndex: number) => {
    setCarouselIndex(selectedIndex);
  };

  const extractImages = (movie: any) => {
    if (!movie?.c08) return [];

    return (
      movie.c08
        .match(
          /<thumb aspect="(poster|fanart)" preview="([^"]+)">([^<]+)<\/thumb>/g
        )
        ?.map((thumb: string) => {
          const [, aspect, preview, url] = thumb.match(
            /<thumb aspect="(poster|fanart)" preview="([^"]+)">([^<]+)<\/thumb>/
          )!;
          return { aspect, preview, url };
        })
        .filter((img: any) => img.url) || []
    ); // Filtrer les images nulles
  };

  const extractFanart = (movie: any) => {
    if (!movie?.c20) return [];

    return (
      movie.c20
        .match(/<thumb preview="([^"]+)">([^<]+)<\/thumb>/g)
        ?.map((thumb: string) => {
          const [, preview, url] = thumb.match(
            /<thumb preview="([^"]+)">([^<]+)<\/thumb>/
          )!;
          return { preview, url };
        })
        .filter((img: any) => img.url) || []
    ); // Filtrer les images nulles et gérer le cas où match retourne null
  };

  const filteredMovies = movies.filter((movie) =>
    movie.c00.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Movies List</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <ul>
          {filteredMovies
            .sort((a, b) => (a.c00 > b.c00 ? 1 : a.c00 < b.c00 ? -1 : 0))
            .map((movie) => (
              <li key={movie.idMovie} onClick={() => handleMovieClick(movie)}>
                {movie.c00} ({movie.premiered.split("-")[0]})
              </li>
            ))}
        </ul>
      )}

      {selectedMovie && (
        <>
          <Modal
            show={showMovieModal}
            onHide={handleCloseMovieModal}
            centered
            className="movie-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>{selectedMovie.c00}</Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={{
                backgroundImage: `url(${extractFanart(selectedMovie)[0]?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "white",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                {selectedMovie.c16 && (
                  <p>
                    <strong>Titre Original :</strong> {selectedMovie.c16}
                  </p>
                )}
                {selectedMovie.c15 && (
                  <p>
                    <strong>Réalisateur :</strong> {selectedMovie.c15}
                  </p>
                )}
                {selectedMovie.c14 && (
                  <p>
                    <strong>Genres :</strong> {selectedMovie.c14}
                  </p>
                )}
                {selectedMovie.premiered && (
                  <p>
                    <strong>Date de Sortie :</strong> {selectedMovie.premiered}
                  </p>
                )}
                {selectedMovie.c18 && (
                  <p>
                    <strong>Studio de Production :</strong> {selectedMovie.c18}
                  </p>
                )}
                {selectedMovie.c01 && (
                  <p>
                    <strong>Résumé :</strong> {selectedMovie.c01}
                  </p>
                )}
                {selectedMovie.c12 && (
                  <p>
                    <strong>Classification :</strong> {selectedMovie.c12}
                  </p>
                )}
                {selectedMovie.c21 && (
                  <p>
                    <strong>Pays :</strong> {selectedMovie.c21}
                  </p>
                )}
                <hr />
                <div className="image-gallery d-flex flex-wrap justify-content-center">
                  {selectedMovie.c19 && (
                    <iframe
                      width="560"
                      height="315"
                      src={selectedMovie.c19.replace(
                        "plugin://plugin.video.youtube/?action=play_video&videoid=",
                        "https://www.youtube.com/embed/"
                      )}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                  <div>
                    {extractImages(selectedMovie)
                      .slice(0, 3)
                      .map(
                        (
                          img: { preview: string | undefined; aspect: any },
                          index: Key | null | undefined
                        ) => (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              margin: "40px",
                            }}
                          >
                            <img
                              key={index}
                              src={img.preview}
                              alt={`${img.aspect} image`}
                              className="img-fluid m-2"
                              onClick={() =>
                                handleImageClick(
                                  extractImages(selectedMovie),
                                  Number(index)
                                )
                              }
                              style={{
                                maxWidth: "120px",
                                maxHeight: "180px",
                              }}
                            />
                          </div>
                        )
                      )}
                    {extractImages(selectedMovie).length > 3 && (
                      <div
                        className="more-images-indicator"
                        onClick={() =>
                          handleImageClick(extractImages(selectedMovie), 3)
                        }
                        style={{
                          cursor: "pointer",
                          left: "50%",
                          transform: "translateX(50%)",
                        }}
                      >
                        +{extractImages(selectedMovie).length - 3} more
                      </div>
                    )}
                    {extractFanart(selectedMovie).length > 0 && (
                      <Button
                        variant="link"
                        className="sci-fi-link"
                        onClick={() =>
                          handleImageClick(extractFanart(selectedMovie), 0)
                        }
                        style={{ marginLeft: "40px" }}
                      >
                        Voir les Fanarts
                      </Button>
                    )}
                  </div>
                </div>

                <hr />
                {selectedMovie.c22 && (
                  <p>
                    <strong
                      onClick={() => setHide(!hide)}
                      style={{ cursor: "pointer" }}
                    >
                      Chemin local :
                    </strong>{" "}
                    {hide ? "******************" : selectedMovie.c22}
                  </p>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseMovieModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showImageModal}
            onHide={handleCloseImageModal}
            centered
            className="image-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Galerie d'Images</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Carousel activeIndex={carouselIndex} onSelect={handleSelect}>
                {carouselImages.map((img, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={img.url}
                      alt={`${img.aspect} image`}
                      style={{ maxHeight: "90vh", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseImageModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default MoviesList;
