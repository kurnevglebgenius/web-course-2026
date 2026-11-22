const search = document.querySelector('#search');
const list = document.querySelector('#posts');
const statusText = document.querySelector('#status');
const more = document.querySelector('#more');

const pageSize = 10;
const totalPosts = 100;
const posts = [];
let query = '';
let searchTimer;
let loading = false;
let failed = false;

function render() {
  const visible = posts.filter((post) => post.title.toLowerCase().includes(query));
  list.replaceChildren();

  visible.forEach((post) => {
    const card = document.createElement('article');
    const title = document.createElement('h2');
    const body = document.createElement('p');
    const author = document.createElement('small');
    title.textContent = post.title;
    body.textContent = post.body;
    author.textContent = 'Автор: ' + post.userId;
    card.append(title, body, author);
    list.append(card);
  });
}

async function loadPosts() {
  if (loading || more.hidden) return;
  loading = true;
  failed = false;
  more.disabled = true;
  more.textContent = 'Загрузить ещё';
  statusText.textContent = 'Загрузка…';

  try {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/posts?_start=' + posts.length + '&_limit=' + pageSize
    );
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const batch = await response.json();
    posts.push(...batch);
    render();

    more.hidden = batch.length < pageSize || posts.length >= totalPosts;
    statusText.textContent = more.hidden ? 'Больше постов нет' : '';
  } catch {
    failed = true;
    statusText.textContent = 'Не удалось загрузить посты. Проверьте интернет и повторите.';
    more.textContent = 'Повторить';
  } finally {
    loading = false;
    more.disabled = false;
  }
}

search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    query = search.value.trim().toLowerCase();
    render();
  }, 300);
});

window.addEventListener('scroll', () => {
  if (!failed && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 200) {
    loadPosts();
  }
});

more.addEventListener('click', loadPosts);
loadPosts();
