import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "./App.css";
import { Button } from "@headlessui/react";
import { TicketIcon, MapPinIcon, FilmIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface Movie {
  id: number;
  title: string;
  bannerUrl: string;
}

function App() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locations = [
    { name: "New York", opening: "Early 2026" },
    { name: "New Orleans", opening: "Early 2026" },
    { name: "Los Angeles", opening: "Early 2026" },
  ];

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchActiveMovies = async () => {
      try {
        setLoading(true);
        console.log("Fetching active movies from /api/Movie/Active");
        const response = await fetch("/api/Movie/Active", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response Status:", response.status, response.statusText);
        console.log("Response Headers:", [...response.headers.entries()]);

        if (!response.ok) {
          const text = await response.text();
          console.error("Response Content:", text.slice(0, 200));
          if (response.status === 404) {
            throw new Error(
              "API endpoint not found (404). Please check /api/Movie/Active"
            );
          }
          throw new Error(
            `Failed to fetch active movies: ${response.status} ${response.statusText}`
          );
        }

        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON Response:", text.slice(0, 200));
          throw new Error("Received non-JSON response from server");
        }

        const data: { id: number; title: string; bannerURL: string | null }[] =
          await response.json();

        console.log("Raw API Response:", data);

        const moviesWithBanner = data
          .filter((movie) => {
            const isValid = movie.bannerURL && movie.bannerURL.trim() !== "";
            console.log(
              `Movie ID: ${movie.id}, Title: ${movie.title}, BannerURL: ${movie.bannerURL}, Valid: ${isValid}`
            );
            return isValid;
          })
          .map((movie) => ({
            id: movie.id,
            title: movie.title ?? "Untitled",
            bannerUrl: movie.bannerURL!,
          }));

        console.log("Filtered Movies with bannerURL:", moviesWithBanner);
        setMovies(moviesWithBanner);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching movies"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveMovies();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Swiper
        className="w-full md:h-[600px] h-[400px]"
        spaceBetween={30}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        loop={movies.length > 1}
      >
        {loading ? (
          <SwiperSlide>
            <div className="relative h-full flex items-center justify-center bg-gray-800">
              <p className="text-xl text-indigo-300 animate-pulse">
                Loading movies...
              </p>
            </div>
          </SwiperSlide>
        ) : error ? (
          <SwiperSlide>
            <div className="relative h-full">
              <img
                className="w-full h-full object-cover brightness-75"
                alt="Error loading movies"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-300 drop-shadow-lg">
                  Unable to Load Movies
                </h2>
                <p className="text-lg md:text-xl mt-2 drop-shadow-md">
                  {error.includes("404")
                    ? "Movie data not found. Contact support."
                    : "Please try again later."}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ) : movies.length === 0 ? (
          <SwiperSlide>
            <div className="relative h-full">
              <img
                className="w-full h-full object-cover brightness-75"
                alt="No movies available"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-300 drop-shadow-lg">
                  No Movies Available
                </h2>
                <p className="text-lg md:text-xl mt-2 drop-shadow-md">
                  Check back soon for new releases!
                </p>
              </div>
            </div>
          </SwiperSlide>
        ) : (
          movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <div className="relative h-full">
                <img
                  className="w-full h-full object-cover brightness-75 cursor-pointer"
                  src={movie.bannerUrl}
                  alt={movie.title}
                  loading="lazy"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                />
                <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-300 drop-shadow-lg">
                    {movie.title}
                  </h2>
                  <p className="text-lg md:text-xl mt-2 drop-shadow-md">
                    Experience it at Lion's Den Cinemas in Early 2026
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))
        )}
        <div className="swiper-button-prev text-indigo-600" />
        <div className="swiper-button-next text-indigo-600" />
        <div className="swiper-pagination bg-indigo-600" />
      </Swiper>

      <main className="container mx-auto px-4 py-12 flex-1">
        <section className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-300 mb-4 drop-shadow-lg">
            Welcome to Lion's Den Cinemas
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-200">
            Experience movies like never before with premium reclining seats and
            Dolby Atmos Cinema Sound. Opening in New York, New Orleans, and Los
            Angeles in Early 2026.
          </p>
          <Button
            onClick={() => navigate("/movies")}
            className="mt-6 inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-600 text-white py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            Get Tickets <TicketIcon className="h-5 w-5" />
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-12">
          {locations.map((location) => (
            <div
              key={location.name}
              className="bg-gray-800 outline-3 outline-indigo-300 p-6 rounded-lg shadow-lg shadow-indigo-950/50 transition-all duration-300 hover:shadow-indigo-800/70"
            >
              <MapPinIcon className="h-8 w-8 mx-auto text-indigo-400 mb-2" />
              <h3 className="text-xl font-semibold text-indigo-200">
                Lion's Den Cinemas: {location.name}
              </h3>
              <p className="text-gray-300">Opening {location.opening}</p>
            </div>
          ))}
        </section>

        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-300 mb-6 drop-shadow-lg">
            Why Choose Lion's Den?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 outline-3 outline-indigo-300 p-6 rounded-lg shadow-lg shadow-indigo-950/50">
              <FilmIcon className="h-10 w-10 mx-auto text-indigo-400 mb-2" />
              <h3 className="font-semibold text-indigo-200">
                Premium Experience
              </h3>
              <p className="text-gray-300">
                Reclining seats & Dolby Atmos sound
              </p>
            </div>
            <div className="bg-gray-800 outline-3 outline-indigo-300 p-6 rounded-lg shadow-lg shadow-indigo-950/50">
              <TicketIcon className="h-10 w-10 mx-auto text-indigo-400 mb-2" />
              <h3 className="font-semibold text-indigo-200">
                Flexible Pricing
              </h3>
              <p className="text-gray-300">
                Location-specific rates & showtimes
              </p>
            </div>
            <div className="bg-gray-800 outline-3 outline-indigo-300 p-6 rounded-lg shadow-lg shadow-indigo-950/50">
              <MapPinIcon className="h-10 w-10 mx-auto text-indigo-400 mb-2" />
              <h3 className="font-semibold text-indigo-200">
                Unique Locations
              </h3>
              <p className="text-gray-300">Custom-designed theaters</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-indigo-950 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {currentYear} Lion's Den Cinemas. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="/terms" className="hover:text-indigo-300">
              Terms
            </a>
            <a href="/privacy" className="hover:text-indigo-300">
              Privacy
            </a>
            <a href="/contact" className="hover:text-indigo-300">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
