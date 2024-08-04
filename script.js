// Функция для загрузки данных пользователей
async function loadUsers() {
  const response = await fetch('https://dummyjson.com/users');
  const data = await response.json();
  var result = [];
  for (var k in data) {
    var v = data[k];
    result.push(k, v);
  }
  return result[1];
}

// Функция для фильтрации пользователей
async function filterUsers(query) {
  const url = 'https://dummyjson.com/users/filter?key=firstName&value=' + encodeURIComponent(query);
  const response = await fetch(url);
  const data = await response.json();
  var resultSort = [];
  for (var k in data) {
    var v = data[k];
    resultSort.push(k, v);
  }
  return resultSort;
}

//Сортировка

function sortBy(users, keys, sortOrders) {
  // Функция сравнения для сортировки по ключу 
  function compare(a, b) {
    let result = 0;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const order = sortOrders[i];
      if (key != 'address.city') {
        if (order === 'воз') {
          if (a[key] > b[key]) {result = 1;};
          if (a[key] < b[key]) {result = -1;};
        } else if (order === 'убыв') {
          if (a[key] < b[key]) {result = 1;};
          if (a[key] > b[key]) {result = -1;};
        }
      } else {
        a = a['address']['city'];
        b = b['address']['city'];
        if (order === 'воз') {
          if (a > b) {result = 1;};
          if (a < b) {result = -1;};
        } else if (order === 'убыв') {
          if (a < b) {result = 1;};
          if (a > b) {result = -1;};
        }
      }

    }
    return result;
  }

  // Сортируем массив пользователей
  users.sort(compare);
  return users;

}

//Отображение таблицы
function displayUsers(users) {
  const table = document.getElementById('userTable').getElementsByTagName("tbody")[0];
  // Очищаем содержимое таблицы
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }

  // Перебираем массив пользователей и добавляем строки в таблицу
  let tableBody = document.getElementById("userTable").getElementsByTagName("tbody")[0];
  for (let user of users) {
    let row = tableBody.insertRow();
    row.insertCell(0).textContent = user.maidenName + ' ' + user.firstName + ' ' + user.lastName;
    row.insertCell(1).textContent = user.age;
    row.insertCell(2).textContent = user.gender;
    row.insertCell(3).textContent = user.phone;
    row.insertCell(4).textContent = user.address.city + ', ' + user.address.address;
    row.addEventListener('click', function () {
      showModal(user);
    });
  }
}

// Функция для открытия модального окна
function showModal(user) {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
								<h3>Информация о пользователе</h3>
								<ul>
										<li>ФИО: ${user.firstName} ${user.maidenName} ${user.lastName}</li>
										<li>Возраст: ${user.age}</li>
										<li>Пол: ${user.gender}</li>
										<li>Адрес: ${user.address.city}, ${user.address.address}</li>
										<li>Рост: ${user.height}</li>
										<li>Вес: ${user.weight}</li>
										<li>Номер телефона: ${user.phone}</li>
										<li>Email-адрес: ${user.email}</li>
								</ul>
						`;
  document.getElementById('modal').style.display = 'block';
}
// Функция для закрытия модального окна
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Обработчик события изменения в поле поиска
document.getElementById('searchInput').addEventListener('input', async function (event) {
  try {
    const query = event.target.value;
    if (query.length > 0) {
      const filteredData = await filterUsers(query);
      displayUsers(filteredData[1]);
    } else {
      displayUsers(await loadUsers());
    }
  } catch (error) {
    console.error('Ошибка при изменении в поле:', error);
  }
});

// Инициализация таблицы при загрузке страницы
window.onload = async function () {
  try {
    displayUsers(await loadUsers());
  } catch (error) {
    console.error('Ошибка при инициализации таблицы:', error);
  }
  var keys = [];
  var sortOrders = [];

  //Обработчик события клика на заголовке столбца
  document.querySelectorAll('#userTable th').forEach(function (th) {
    th.addEventListener('click', async function () {
      const key = this.getAttribute('data-key');
      const sortOrder = this.getAttribute('data-sort') === 'воз' ? 'убыв' : this.getAttribute('data-sort') === 'убыв' ? 'none' : 'воз';
      const span = this.getElementsByTagName('span');
      if (key != "none") {
        span[0].innerHTML = this.getAttribute('data-sort') === 'none' ? '▲' : this.getAttribute('data-sort') === 'воз' ? '▼' : '';
      } else {
        return;
      }
      this.setAttribute('data-sort', sortOrder);
      // Проверка наличия одинаковых ключей и удаление ключа, если sortOrder равно none

      if (!keys.includes(key)) {
        keys.push(key);
        sortOrders.push(sortOrder);
      } else if (keys.includes(key) && sortOrder !== "none") {
        var index = keys.indexOf(key);
        sortOrders.splice(index, 1, sortOrder);
      }
      if (sortOrder === "none") {
        var index = keys.indexOf(key);
        sortOrders.splice(index, 1);
        keys = keys.filter(k => k !== key);

      }
      console.log(`${keys}` + ' ' + `${sortOrders}`);

      // Проверка, был ли выполнен поиск
      let searchInput = document.getElementById('searchInput');
      if (searchInput.value.length > 0) {
        // Фильтрация результатов поиска
        var filteredUsers = await filterUsers(searchInput.value);
        // Сортировка результатов поиска
        filteredUsers = sortBy(filteredUsers[1], keys, sortOrders);
        displayUsers(filteredUsers);
      } else {
        // Сортировка всех пользователей без фильтрации
        var users = sortBy(await loadUsers(), keys, sortOrders);
        displayUsers(users);
      }

    });
  });
};