const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
   movieId: dbObject.movie_id,
   movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
    leadActor: dbObject.lead_actor
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie ORDER BY movie_id;`;
  const movieArray = await database.all(getMovieQuery);
  response.send(
    movieArray.map((eachMovie) =>{
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
     movie
    WHERE 
     movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {

  const { directorId, movieName,leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name,lead_actor )
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  const movie = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName,leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE
   movie
  SET
   director_id = '${directorId}',
    movie_name= ${movieName},
    lead_actor = '${leadActor}'
  WHERE
   movie_id = ${movieId};`;

  await database.run(updatePlayerQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const {movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
   movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMovieQuery = `
    SELECT
      *
    FROM
      director ORDER BY director_id;`;
  const movieArray = await database.all(getMovieQuery);
  response.send(
   movieArray.map((eachMovie) =>{
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
    director
    WHERE 
    director_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});
module.exports = app;
