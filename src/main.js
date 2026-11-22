import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const PER_PAGE = 15;

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.btn-load-more');

let searchQuery = '';
let page = 1;

form.addEventListener('submit', onSearchSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreClick);

async function onSearchSubmit(event) {
  event.preventDefault();

  const query = form.elements['search-text'].value.trim();

  if (!query) {
    return;
  }

  searchQuery = query;
  page = 1;

  clearGallery();
  hideLoadMoreButton();

  await fetchAndRender();
}

async function onLoadMoreClick() {
  page += 1;

  await fetchAndRender();
}

async function fetchAndRender() {
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (page > 1) {
      scrollGallery();
    }

    if (page * PER_PAGE < data.totalHits) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });

    if (page > 1) {
      page -= 1;
      showLoadMoreButton();
    }
  } finally {
    hideLoader();
  }
}

function scrollGallery() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
