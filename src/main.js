import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector(".form");
const gallery = document.querySelector(".gallery");
const container = document.querySelector(".container");
const searchInput = document.querySelector("input");
const loadBtn = document.querySelector('.btn-load');

let page = 1;
let per_page = 40;
let query = "";
let totalHits;

const showLoader = () => {
  const loader = document.createElement('span');
  loader.classList.add('loader');
  container.append(loader);
};

const hideLoader = () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.remove();
  }
};

const showButton = () => {
  loadBtn.style.display = 'block';
};

const hideButton = () => {
  loadBtn.style.display = 'none';
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  page = 1;
  showLoader();
  gallery.innerHTML = "";
  query = searchInput.value.trim();
  if (query === '') {
    hideButton();
    iziToast.error({
      message: 'Please enter a search term.',
      position: 'center',
      transitionIn: "fadeInLeft",
    });
    hideLoader();
    return;
  }

  try {
    const photos = await searchImages(query, page);
    renderImages(photos);
    form.reset();
    hideLoader();
    showButton();

    if (photos.hits.length < per_page) {
      hideButton();
    }
    if (photos.hits.length === 0) {
      hideButton();
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'center',
        transitionIn: "fadeInLeft",
      });
    }
  } catch (error) {
    handleError(error);
  }
});

loadBtn.addEventListener("click", async () => {
  showLoader();
  try {
    page += 1;
    const photos = await searchImages(query, page);
    renderImages(photos);
    hideLoader();

    const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (gallery.children.length >= totalHits || photos.hits.length < per_page) {
      iziToast.warning({
        message: 'We are sorry, but you have reached the end of search results.',
        position: 'bottomCenter',
        transitionIn: "fadeInDown",
      });
      hideButton();
    }
  } catch (error) {
    handleError(error);
  }
});

async function searchImages(query, page) {
  try {
    const apiKey = 'your_api_key_here';
    const response = await axios.get(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`);
    totalHits = response.data.totalHits;
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch images');
  }
}

const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  fadeSpeed: 150,
  captionSelector: "img",
  captionDelay: 250,
});

function renderImages(data) {
  const markup = data.hits.map(data => {
    return `
      <li class="gallery-item">
        <a href="${data.largeImageURL}">
          <img class="gallery-image" src="${data.webformatURL}" alt="${data.tags}">
        </a>
        <p><b>Likes: </b>${data.likes}</p>
        <p><b>Views: </b>${data.views}</p>
        <p><b>Comments: </b>${data.comments}</p>
        <p><b>Downloads: </b>${data.downloads}</p>
      </li>`;
  }).join('');

  gallery.insertAdjacentHTML("beforeend", markup);
  lightbox.refresh();
}

function handleError(error) {
  iziToast.error({
    title: 'Error',
    message: error.message,
  });
}