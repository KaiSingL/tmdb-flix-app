import {
	displayBackgroundImage,
	hideSpinner,
	highlightActiveLink,
	initSwiper,
	showSpinner,
} from './ui.js';

import { env } from './env.js';

export const global = {
	currentPage: window.location.pathname,
	search: {
		term: '',
		type: '',
		currentPage: 1,
		totalPages: 1,
		total_results: 0,
	},
	API_KEY: env.API_KEY,
	API_URL: env.API_URL,
};

function init() {
	switch (global.currentPage) {
		case '/':
			window.location.pathname = '/index.html';
			break;
		case '/index.html':
			displayPopularMovies();
			displaySlider();
			break;
		case '/shows.html':
			displayPopularShows();
			break;
		case '/movie-details.html':
			displayMovieDetails();
			break;
		case '/show-details.html':
			displayShowDetails();
			break;
		case '/search.html':
			search();
			break;
	}
	highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);

// fetch data from TMDB API
async function fetchAPIData(endpoint) {
	const API_KEY = global.API_KEY;
	const API_URL = global.API_URL;

	showSpinner();

	const res = await fetch(
		`${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
	);
	const data = await res.json();

	hideSpinner();

	return data;
}

// make request to search
async function searchAPIData() {
	const API_KEY = global.API_KEY;
	const API_URL = global.API_URL;
	showSpinner();

	const res = await fetch(
		`${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.currentPage}`
	);
	const data = await res.json();
	hideSpinner();
	return data;
}

async function displayPopularMovies() {
	const { results } = await fetchAPIData('movie/popular');
	const gridMovies = document.querySelector('#popular-movies');
	results.forEach((movie) => {
		const div = document.createElement('div');
		div.classList.add('card');
		div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
      ${
				movie.poster_path
					? `<img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          class="card-img-top"
          alt="${movie.title}"
          />`
					: `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="Movie Title"
          />`
			}      
      </a>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <p class="card-text">
          <small class="text-muted">Release Date: ${movie.release_date}</small>
        </p>
      </div>
  `;
		gridMovies.appendChild(div);
	});
}

async function displayPopularShows() {
	const { results } = await fetchAPIData('tv/popular');
	const gridShows = document.querySelector('#popular-shows');
	results.forEach((show) => {
		const div = document.createElement('div');
		div.classList.add('card');
		div.innerHTML = `
      <a href="show-details.html?id=${show.id}">
      ${
				show.poster_path
					? `<img
          src="https://image.tmdb.org/t/p/w500${show.poster_path}"
          class="card-img-top"
          alt="${show.name}"
          />`
					: `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="Show Title"
          />`
			}      
      </a>
      <div class="card-body">
        <h5 class="card-title">${show.name}</h5>
        <p class="card-text">
          <small class="text-muted">Air Date: ${show.first_air_date}</small>
        </p>
      </div>
  `;
		gridShows.appendChild(div);
	});
}

async function displayMovieDetails() {
	const movieId = window.location.search.split('=')[1];
	const movie = await fetchAPIData(`movie/${movieId}`);
	console.log(movie);
	const movieDetails = document.querySelector('#movie-details');
	displayBackgroundImage('movie', movie.backdrop_path);

	const div = document.createElement('div');
	const genreList = movie.genres
		.map((genre) => {
			return `<li>${genre.name}</li>
  `;
		})
		.join('');
	const companyList = movie.production_companies
		.map((company) => company.name)
		.join(', ');
	div.innerHTML = `
    <div class="details-top">
      <div>
      ${
				movie.poster_path
					? `<img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          class="card-img-top"
          alt="${movie.title}"
          />`
					: `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="Movie Title"
          />`
			}      
      </div>
      <div>
        <h2>${movie.title.toUpperCase()}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${movie.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${movie.release_date}</p>
        <p>
          ${movie.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${genreList}
        </ul>
        <a
          href="${movie.homepage}"
          target="_blank"
          class="btn"
          >Visit Movie Homepage</a
        >
      </div>
    </div>
    <div class="details-bottom">
      <h2>Movie Info</h2>
      <ul>
        <li><span class="text-secondary">Budget:</span> $${movie.budget.toLocaleString(
					'en-US'
				)}</li>
        <li><span class="text-secondary">Revenue:</span> $${movie.revenue.toLocaleString(
					'en-US'
				)}</li>
        <li><span class="text-secondary">Runtime:</span> ${
					movie.runtime
				} minutes</li>
        <li><span class="text-secondary">Status:</span> ${movie.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">${companyList}</div>
    </div>`;
	movieDetails.appendChild(div);
}

async function displayShowDetails() {
	const showID = window.location.search.split('=')[1];
	const show = await fetchAPIData(`tv/${showID}`);
	console.log(show);
	const showDetails = document.querySelector('#show-details');
	displayBackgroundImage('show', show.backdrop_path);

	const div = document.createElement('div');
	const genreList = show.genres
		.map((genre) => {
			return `<li>${genre.name}</li>
  `;
		})
		.join('');
	const companyList = show.production_companies
		.map((company) => company.name)
		.join(', ');
	div.innerHTML = `
    <div class="details-top">
      <div>
      ${
				show.poster_path
					? `<img
          src="https://image.tmdb.org/t/p/w500${show.poster_path}"
          class="card-img-top"
          alt="${show.title}"
          />`
					: `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="Movie Title"
          />`
			} 
      </div>
      <div>
        <h2>${show.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${show.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${show.first_air_date}</p>
        <p>
          ${show.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${genreList}
        </ul>
        <a
          href="#"
          target="_blank"
          class="btn"
          >Visit Show Homepage</a
        >
      </div>
    </div>
    <div class="details-bottom">
      <h2>Show Info</h2>
      <ul>
        <li><span class="text-secondary">Number Of Episodes:</span> ${
					show.number_of_episodes
				}</li>
        <li>
          <span class="text-secondary">Last Episode To Air:</span> ${
						show.last_episode_to_air.number_of_episode
					} - ${show.last_episode_to_air.name}
        </li>
        <li><span class="text-secondary">Status:</span> ${show.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">${companyList}</div>
    </div>`;
	showDetails.appendChild(div);
}

async function displaySlider() {
	const { results } = await fetchAPIData('movie/now_playing');
	const slides = results
		.map(
			(movie) => `<div class="swiper-slide">
  <a href="movie-details.html?id=${movie.id}">
  ${
		movie.poster_path
			? `<img
      src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
      class="card-img-top"
      alt="${movie.title}"
      />`
			: `<img
      src="images/no-image.jpg"
      class="card-img-top"
      alt="Movie Title"
      />`
	}
  </a>
  <h4 class="swiper-rating">
    <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
			1
		)} / 10
  </h4>
</div>`
		)
		.join('');
	const wrapper = document.querySelector('.swiper-wrapper');
	wrapper.innerHTML = slides;

	initSwiper();
}

function displaySearchCriteria(type, searchTerm) {
	if (type === 'movie') {
		document.querySelector('input#movie').setAttribute('checked', true);
	} else {
		document.querySelector('input#tv').setAttribute('checked', true);
	}
	document.querySelector('input#search-term').value = searchTerm;
}

async function displaySearchResult() {
	const { results, page, total_pages, total_results } = await searchAPIData();
	console.log(results);
	console.log(global);
	global.search.currentPage = page;
	global.search.totalPages = total_pages;
	global.search.total_results = total_results;
	const grid = document.querySelector('#search-results');
	const heading = document.querySelector('#search-results-heading');
	heading.innerHTML = `<h2>${results.length} of ${global.search.total_results} for ${global.search.term}</h2>`;
	grid.innerHTML = results
		.map(
			(result) => `				
    <div class="card">
      <a href="${
				global.search.type === 'movie'
					? `movie-details.html`
					: `show-details.html`
			}?id=${result.id}">
      ${
				result.poster_path
					? `<img
          src="https://image.tmdb.org/t/p/w500${result.poster_path}"
          class="card-img-top"
          alt="${result.title}"
          />`
					: `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="Movie Title"
          />`
			} 
      </a>
      <div class="card-body">
        <h5 class="card-title">${result.title}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${
						result.release_date || result.first_air_date
					}</small>
        </p>
      </div>
    </div>
`
		)
		.join('');
	displayPagination(global.search.currentPage, global.search.totalPages);
}

function displayPagination(currentPage, totalPages) {
	const btnPrev = document.querySelector('#prev');
	const btnNext = document.querySelector('#next');
	const pageCounter = document.querySelector('.page-counter');
	if (currentPage <= 1) {
		btnPrev.style.display = 'none';
	} else {
		btnPrev.href = `./search.html?type=${global.search.type}&query=${
			global.search.term
		}&page=${global.search.currentPage - 1}`;
	}
	if (currentPage >= totalPages) {
		btnNext.style.display = 'none';
	} else {
		btnNext.href = `./search.html?type=${global.search.type}&search-term=${
			global.search.term
		}&page=${global.search.currentPage + 1}`;
	}
	pageCounter.innerHTML = `Page ${currentPage} of ${totalPages}`;
}
// Search Movies/Shows
async function search() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const type = urlParams.get('type');
	const searchTerm = urlParams.get('search-term');
	global.search.type = urlParams.get('type');
	global.search.term = urlParams.get('search-term');
	global.search.currentPage = urlParams.get('page') || 1;
	if (global.search.term !== '' && global.search.term !== null) {
		displaySearchResult();
	} else {
		showAlert('Plase enter a search term');
	}
	displaySearchCriteria(type, searchTerm);
}

// show alert
function showAlert(message, className) {
	const alertEl = document.createElement('div');
	alertEl.classList.add('alert', className);
	alertEl.appendChild(document.createTextNode(message));
	document.querySelector('#alert').appendChild(alertEl);
	setTimeout(() => {
		alertEl.remove();
	}, 3000);
}
